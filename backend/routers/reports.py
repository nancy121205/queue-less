from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from PIL import Image
from datetime import datetime
import pytesseract
import pymupdf
import re
import os
import io

from database import get_db     
from models import Report          
from auth import JWT_SECRET
from jose import jwt
from llm_utils.summarizer import generate_summary
from storage_utils.supabase_storage import upload_report_file, get_signed_url

router = APIRouter()


def clean_text(raw: str) -> str:
    return re.sub(r'\s+', ' ', raw).strip()


def extract_text_from_pdf(contents: bytes) -> str:
    doc = pymupdf.open(stream=contents, filetype="pdf")
    extracted_text = ""
    for page in doc:
        pix = page.get_pixmap()
        img_bytes = pix.tobytes("png")
        image = Image.open(io.BytesIO(img_bytes))
        extracted_text += pytesseract.image_to_string(image)
    doc.close()
    return extracted_text


@router.post("/upload")
async def upload_report(appointment_id: int | None = None, created_at: datetime | None = None, file: UploadFile = File(...), db: Session = Depends(get_db), token: str = Depends(OAuth2PasswordBearer(tokenUrl="/auth/login"))):
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")

    patient_id = payload.get("id")
    contents = await file.read()

    if file.content_type == "application/pdf":
        extracted_text = extract_text_from_pdf(contents)
    else:
        try:
            image = Image.open(io.BytesIO(contents))
            extracted_text = pytesseract.image_to_string(image)
        except Exception:
            raise HTTPException(status_code=400, detail="Could not process the uploaded image")

    cleaned = clean_text(extracted_text)

    file_path = f"{patient_id}/{file.filename}"  # organizes files per-patient in the bucket
    upload_report_file(contents, file_path, file.content_type)

    new_report = Report(
        patient_id=patient_id,
        appointment_id=appointment_id,
        file_url=file_path,
        raw_text=cleaned,
        created_at=created_at
    )
    db.add(new_report)
    db.commit()
    db.refresh(new_report)

    return {"report_id": new_report.id, "raw_text_preview": cleaned}

@router.post("/{report_id}/summarize")
def summarize_report(report_id: int, db: Session = Depends(get_db), token: str = Depends(OAuth2PasswordBearer(tokenUrl="/auth/login"))):
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")

    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    summary = generate_summary(report.raw_text)
    report.ai_summary = summary
    db.commit()
    db.refresh(report)

    return summary

from storage_utils.supabase_storage import get_signed_url

@router.get("/{report_id}")
def get_report(report_id: int, db: Session = Depends(get_db), token: str = Depends(OAuth2PasswordBearer(tokenUrl="/auth/login"))):
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")

    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    if payload.get("role") == "patient" and report.patient_id != payload.get("id"):
        raise HTTPException(status_code=403, detail="Not authorized to view this report")

    file_url = get_signed_url(report.file_url)

    return {
        "report_id": report.id,
        "appointment_id": report.appointment_id,
        "file_url": file_url,
        "raw_text": report.raw_text,
        "ai_summary": report.ai_summary,
        "created_at": report.created_at
    }