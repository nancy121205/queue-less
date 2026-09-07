from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from PIL import Image
import pytesseract
import pymupdf
import re
import os
import io

from database import get_db     
from models import Report          
from auth import JWT_SECRET
from jose import jwt

router = APIRouter(prefix="/reports", tags=["reports"])


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
async def upload_report(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    token: str = Depends(OAuth2PasswordBearer(tokenUrl="/auth/login"))
):
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")

    patient_id = payload.get("id")
    contents = await file.read()

    if file.content_type == "application/pdf":
        extracted_text = extract_text_from_pdf(contents)
    else:
        image = Image.open(io.BytesIO(contents))
        extracted_text = pytesseract.image_to_string(image)

    cleaned = clean_text(extracted_text)

    os.makedirs("uploads", exist_ok=True)
    file_path = f"uploads/{patient_id}_{file.filename}"
    with open(file_path, "wb") as f:
        f.write(contents)

    new_report = Report(
        patient_id=patient_id,
        file_url=file_path,
        raw_text=cleaned,
    )
    db.add(new_report)
    db.commit()
    db.refresh(new_report)

    return {"report_id": new_report.id, "raw_text_preview": cleaned[:200]}