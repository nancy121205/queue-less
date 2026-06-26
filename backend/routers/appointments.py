from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date
from database import get_db
from jose import jwt, JWTError
from auth import JWT_SECRET
from models import Availability, Appointment, QueueEntry, Doctor, User

router = APIRouter()

class Appointment_schema(BaseModel):
    doctor_id : int
    availability_id : int

@router.post("/new")
def get_appointment(data:Appointment_schema, token: str = Depends(OAuth2PasswordBearer(tokenUrl="/auth/login")), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    if(payload.get("role")) != "patient":
        raise HTTPException(status_code=403, detail="Only patients can book appointment")
    
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

@router.get("/upcoming")
def my_appointments(token: str = Depends(OAuth2PasswordBearer(tokenUrl="/auth/login")), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    if(payload.get("role")) != "doctor":
        raise HTTPException(status_code=403, detail="Only doctors can see appointments scheduled")
    
    user_id = payload.get("id")
    doctor_id = db.query(Doctor).filter(Doctor.user_id == user_id).first().id
    availabilities = db.query(Availability).filter(
        Availability.doctor_id == doctor_id,
        func.date(Availability.start_time) >= date.today()
    ).order_by(Availability.start_time).all()

    return [
        {
            "id" : availability.id,
            "date": availability.start_time.date(),
            "start_time" : availability.start_time,
            "end_time" : availability.end_time,
            "booked_patients" : availability.booked_patients,
            "max_patients" : availability.max_patients
        }
        for availability in availabilities
    ]


@router.get("/my")
def my_bookings(token: str=Depends(OAuth2PasswordBearer(tokenUrl="/auth/login")), db: Session=Depends(get_db)):
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
    except:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    if payload.get("role") != "patient":
        raise HTTPException(status_code=403, detail="Only User can view bookings made")
    
    user_id = payload.get('id')
        
    # date, appointment_start_time, doctor, hospital, queue_position, estimated_wait, status
    queue = db.query(Doctor, QueueEntry, Appointment, User).join(
        QueueEntry, QueueEntry.appointment_id == Appointment.id
    ).join(
        Doctor, Doctor.id == Appointment.doctor_id
    ).join(
        User, User.id == Doctor.user_id
    ).filter(
        Appointment.patient_id == user_id
    ).order_by(Appointment.start_time).all()

    return [
        {   
            "id" : appointment.id,
            "date" : appointment.start_time.date(),
            "appointment_start_time" : appointment.start_time.time(),
            "doctor" : user.name,
            "hospital" : doctor.hospital_name,
            "queue_position" : queueentry.position,
            "estimated_wait" : queueentry.estimated_wait,
            "status" : appointment.status
        }
        for doctor, queueentry, appointment, user in queue
    ]