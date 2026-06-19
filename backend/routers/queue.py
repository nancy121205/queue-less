from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from database import get_db
from jose import jwt
from auth import JWT_SECRET
from models import Doctor, QueueEntry, User, Appointment, Availability

router = APIRouter()

@router.get("/today")
def doctor_queue(availability_id: int, token: str=Depends(OAuth2PasswordBearer(tokenUrl="/auth/login")), db: Session=Depends(get_db)):
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
    except:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    if payload.get("role") != "doctor":
        raise HTTPException(status_code=403, detail="Only doctors can view appointments made")
    
    user_id = payload.get('id')
    doctor = db.query(Doctor).filter(Doctor.user_id == user_id).first()

    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor profile not found")
    
    availability = db.query(Availability).filter(
        Availability.id == availability_id,
        Availability.doctor_id == doctor.id
    ).first()

    if not availability:
        raise HTTPException(status_code=404, detail="Availability not found")
        
    # patient_id, patient_name, queue_position, estimated_wait, status, appointment_start_time
    queue = db.query(QueueEntry, User, Appointment).join(
        Appointment, QueueEntry.appointment_id == Appointment.id
    ).join(
        User, User.id == Appointment.patient_id
    ).filter(
        Appointment.availability_id == availability_id
    ).order_by(Appointment.start_time).all()

    return [
        {   
            "position" : queueentry.position,
            "patient_id" : user.id,
            "patient_name" : user.name,
            "estimated_wait" : queueentry.estimated_wait,
            "status" : queueentry.status,
            "appointment_start_time" : appointment.start_time            
        }
        for queueentry, user, appointment in queue
    ]
