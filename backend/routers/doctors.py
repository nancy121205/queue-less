from datetime import datetime
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException
from backend.auth import JWT_SECRET
from models import Doctor, User
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
def post_availability(token: str = Depends(OAuth2PasswordBearer(tokenUrl="/auth/login")), db: Session = Depends(get_db), data: AvailabilityRequest = Depends()):
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    user_id = payload.get("id")
    if payload.get("role") != "doctor":
        raise HTTPException(status_code=403, detail="Only doctors can set availability")
    doctor_id = db.query(Doctor).filter(Doctor.user_id == user_id).first().id

    new_availability = AvailabilityRequest(
        date=data.date,
        start_time=data.start_time,
        end_time=data.end_time,
        max_patients=data.max_patients
    )
