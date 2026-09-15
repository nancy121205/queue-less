from google import genai
import os
import json

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

SYSTEM_PROMPT = """You are a medical assistant helping a doctor quickly review a patient's uploaded report before an appointment. The text you receive comes from OCR run on a scanned or photographed document, so it may contain:
- Misread characters (e.g. "1" read as "l", "0" as "O")
- Jumbled table columns, where lab values and reference ranges may appear merged or out of order
- Hospital letterhead, doctor's name/registration number, and clinic address mixed in with the actual clinical content
- Partially illegible sections, especially in handwritten prescriptions

First identify which type of document this most resembles:
- A lab/diagnostic report — a table of test names, values, units, and reference ranges
- A prescription (Rx) — medication list, often using shorthand like "1-0-1" (morning-afternoon-night), "OD" (once daily), "BD" (twice daily), "TDS" (thrice daily), "SOS" (as needed)
- A discharge summary — narrative diagnosis, treatment given, and follow-up instructions
- A radiology report (X-ray/MRI/CT) — narrative "findings" and "impression," no lab values
- Something else, or genuinely unclear

Respond with ONLY valid JSON, no markdown formatting, no code fences, no extra commentary, in this exact shape:

{
  "document_type": "lab_report" | "prescription" | "discharge_summary" | "radiology_report" | "other" | "unclear",
  "patient_name": "string or null — the PATIENT's name only, never the doctor's, clinic's, or hospital's name from a letterhead",
  "key_findings": ["for lab reports: test name, value, unit, and reference range in one line, e.g. 'Hemoglobin: 10.2 g/dL (ref 13.5–17.5)'. For other document types: the main clinical points stated"],
  "abnormal_values": [
    {
      "test": "test name, e.g. 'Hemoglobin'",
      "value": "the measured value with unit, e.g. '10.2 g/dL'",
      "reference_range": "the stated normal range, e.g. '13.5–17.5 g/dL', or null if not stated",
      "flag": "high" | "low" | "abnormal"
    }
  ],
  "diagnoses": ["only diagnoses explicitly stated in the text — never infer a diagnosis yourself from lab values"],
  "medications": ["medication name, dosage, and frequency together, e.g. 'Paracetamol 500mg — 1-0-1 for 5 days'. If frequency is legible but the drug name is not, write 'illegible medication name' rather than guessing"],
  "summary": "a 3-line plain-English summary a patient can understand, adapted to the document type — for a lab report, the overall picture; for a prescription, what to take and why; for a discharge summary, what happened and what to do next"
}

Rules:
- If a field cannot be determined, use an empty list or null — never omit the field entirely.
- If part of the text is garbled or illegible, do not guess. Omit that item, or note it as unclear.
- Never invent a diagnosis, value, or medication not explicitly present in the text.
- Do not add your own clinical interpretation beyond what is written — you are summarizing and structuring, not diagnosing.
- abnormal_values must ONLY include values explicitly flagged abnormal (marked H/L/*, or clearly outside a stated reference range). Do not guess something is abnormal without a stated range or explicit flag. If nothing is flagged, return an empty list.
"""


def _empty_summary(message: str) -> dict:
    """Shared fallback shape — keeps all failure paths matching the real response shape,
    so frontend code reading summary.document_type never hits undefined."""
    return {
        "document_type": None,
        "patient_name": None,
        "key_findings": [],
        "abnormal_values": [],
        "diagnoses": [],
        "medications": [],
        "summary": message
    }


def generate_summary(raw_text: str) -> dict:
    if not raw_text or len(raw_text.strip()) < 20:
        return _empty_summary("Not enough text extracted from this report to generate a summary.")

    try:
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=f"{SYSTEM_PROMPT}\n\nReport text:\n{raw_text}"
        )
        raw_response = response.text.strip()

        # Gemini sometimes wraps JSON in ```json fences despite instructions — strip if present
        if raw_response.startswith("```"):
            raw_response = raw_response.strip("`").replace("json", "", 1).strip()

        parsed = json.loads(raw_response)

        # Defensive fill — if Gemini omits a key despite instructions, don't let it crash the frontend on a missing field later
        for key in ["document_type", "patient_name", "key_findings", "abnormal_values", "diagnoses", "medications", "summary"]:
            if key not in parsed:
                parsed[key] = [] if key in ["key_findings", "abnormal_values", "diagnoses", "medications"] else None

        return parsed

    except json.JSONDecodeError:
        return _empty_summary("Summary generation failed — could not parse AI response.")
    except Exception as e:
        return _empty_summary(f"Summary generation failed: {str(e)}")