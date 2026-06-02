from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from database import get_db
from jose import jwt, JWTError
from auth import JWT_SECRET
from models import Availability, Appointment, QueueEntry, Doctor, User

router = APIRouter()

class Appointment_schema(BaseModel):
    doctor_id : int
    availability_id : int

@router.post("/")
def get_appointment(data:Appointment_schema, token: str = Depends(OAuth2PasswordBearer(tokenUrl="/auth/login")), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    if(payload.get("role")) != "patient":
        raise HTTPException(status_code=403, detail="Only patients can set appointment")
    
    availability_id = data.availability_id
    doctor_id = data.doctor_id

    availability = db.query(Availability).filter(Availability.id == availability_id).first()
    if not availability:
        raise HTTPException(status_code=404, detail="Slot not found")
    
    if(availability.booked_patients >= availability.max_patients):
        raise HTTPException(status_code=400, detail="Slot is full")
    
    existing = db.query(Appointment).filter(
        Appointment.patient_id == payload.get("id"),
        Appointment.availability_id == availability_id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="You already booked this slot")
    
    new_appointment = Appointment(
        patient_id= payload.get("id"), 
        doctor_id= doctor_id,
        availability_id= availability_id,
        start_time= availability.start_time,
        end_time= availability.end_time,
    )
    db.add(new_appointment)
    db.flush()

    position = db.query(Appointment).filter(
        Appointment.availability_id == data.availability_id
    ).count()

    availability.booked_patients = availability.booked_patients + 1
    db.add(availability)
    
    new_queue_entry = QueueEntry(
        appointment_id = new_appointment.id,
        position = position
    )
    db.add(new_queue_entry)
    db.commit()
    
    return {
        "appointment_id": new_appointment.id,
        "position": position,
        "start_time": new_appointment.start_time,
        "message": f"Booked successfully. You are #{position} in queue."
    }

@router.get('/my')
def my_bookings(token: str = Depends(OAuth2PasswordBearer(tokenUrl="/auth/login")), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    if(payload.get("role")) != "patient":
        raise HTTPException(status_code=403, detail="Only patients can see appointments made")
    
    user_id = payload.get("id")
    appointments = db.query(Appointment, Doctor, User).join(
        Doctor, Appointment.doctor_id == Doctor.id
    ).join(
        User, Doctor.user_id == User.id
    ).filter(
        Appointment.patient_id == user_id
    ).order_by(Appointment.created_at.desc()).all()

    return [
        {
            "appointment_id": appointment.id,
            "date": appointment.start_time.date(),
            "doctor_name": user.name,
            "specialization": doctor.specialization,
            "hospital": doctor.hospital_name,
            "start_time": appointment.start_time,
            "end_time": appointment.end_time,
            "status": appointment.status,
            "created_at": appointment.created_at
        }
        for appointment, doctor, user in appointments
    ]