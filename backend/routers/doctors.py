from datetime import datetime
from pydantic import BaseModel
from fastapi import APIRouter, Depends
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
