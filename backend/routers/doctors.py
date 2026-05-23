from datetime import datetime
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException
from auth import JWT_SECRET
from models import Doctor, User, Availability
from database import get_db
from sqlalchemy.orm import Session

router = APIRouter()

class AvailabilityRequest(BaseModel):
    date: datetime
    start_time: datetime
    end_time: datetime
    max_patients: int

@router.get("/")
def list_doctors(db: Session = Depends(get_db)):
    results = db.query(Doctor, User).join(User, Doctor.user_id == User.id).all()
    return [
        {
            "id": doctor.id,
            "name": user.name,
            "email": user.email,
            "specialization": doctor.specialization,
            "hospital_name": doctor.hospital_name,
            "avg_consult_mins": doctor.avg_consult_mins
        }
        for doctor, user in results
    ]

@router.post("/availability")
def post_availability( data: AvailabilityRequest, token: str = Depends(OAuth2PasswordBearer(tokenUrl="/auth/login")), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    user_id = payload.get("id")
    if payload.get("role") != "doctor":
        raise HTTPException(status_code=403, detail="Only doctors can set availability")
    
    doctor = db.query(Doctor).filter(Doctor.user_id == user_id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor profile not found")
    doctor_id = doctor.id

    new_availability = Availability(
        doctor_id=doctor_id,
        date=data.date,
        start_time=data.start_time,
        end_time=data.end_time,
        max_patients=data.max_patients
    )
    db.add(new_availability)
    db.commit()
    db.refresh(new_availability)
    return new_availability

@router.get("/{doctor_id}/availability")
def get_availability(doctor_id: int, db: Session = Depends(get_db)):
    doctor = db.query(Doctor).filter(Doctor.id == doctor_id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    
    slots = db.query(Availability).filter(Availability.doctor_id == doctor_id).all()

    return slots
