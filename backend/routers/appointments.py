from fastapi import APIRouter, Depends, HTTPException, Request, BackgroundTasks
from pydantic import BaseModel
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date, timedelta, datetime
from database import get_db
from jose import jwt, JWTError
from auth import JWT_SECRET
from models import Availability, Appointment, QueueEntry, Doctor, User
from ml_utils.predictor import build_features
from notifications.mailer import send_email

router = APIRouter()

class Appointment_schema(BaseModel):
    doctor_id : int
    availability_id : int

@router.post("/new")
def get_appointment(data:Appointment_schema, request : Request, background_tasks : BackgroundTasks, token: str = Depends(OAuth2PasswordBearer(tokenUrl="/auth/login")), db: Session = Depends(get_db)):
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

    doctor = db.query(Doctor).filter(Doctor.id == doctor_id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")

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

    model = request.app.state.model
    try:
        features = build_features(position, doctor.avg_consult_mins, availability.start_time)
        predicted_wait = float(model.predict(features)[0])
    except Exception:
        predicted_wait = position * float(doctor.avg_consult_mins)

    new_queue_entry.estimated_wait = round(predicted_wait, 1)

    db.commit()

    patient = db.query(User).filter(User.id == payload.get("id")).first()
    doc = db.query(User).filter(User.id == doctor.user_id).first()
    estimated_start_time = availability.start_time + timedelta(minutes=new_queue_entry.estimated_wait)

    background_tasks.add_task(
        send_email,
        to=patient.email,
        subject="Appointment Confirmed — QueueLess",
        body=f"<p>Hi {patient.name}, your appointment with Dr. {doc.name}  is booked. "
        f"You're #{position} in queue, Your appointment will start around "
        f"{estimated_start_time.strftime('%I:%M %p')} on {estimated_start_time.strftime('%B %d')}</p>"
    )
    
    return {
        "appointment_id": new_appointment.id,
        "position": position,
        "start_time": new_appointment.start_time,
        "estimated_start_time": estimated_start_time,
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

    result = []
    for doctor, queueentry, appointment, user in queue:
        estimated_start_time = None
        if queueentry.estimated_wait is not None:
            estimated_start_time = appointment.start_time + timedelta(minutes=queueentry.estimated_wait)

        result.append({
            "id": appointment.id,
            "date": appointment.start_time.date(),
            "appointment_start_time": appointment.start_time.time(),
            "estimated_start_time": estimated_start_time,
            "doctor": user.name,
            "hospital": doctor.hospital_name,
            "queue_position": queueentry.position,
            "estimated_wait": queueentry.estimated_wait,
            "status": appointment.status
        })

    return result

@router.post("/cancel")
def cancel_appointment(appointment_id: int, token: str = Depends(OAuth2PasswordBearer(tokenUrl="/auth/login")), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    if(payload.get("role")) != "patient":
        raise HTTPException(status_code=403, detail="Only patients can cancel appointment")
    
    user_id = payload.get("id")

    appointment = db.query(Appointment).filter(
        Appointment.id == appointment_id,
        Appointment.patient_id == user_id
    ).first()

    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")

    if appointment.status in ("completed", "cancelled"):
        raise HTTPException(status_code=400, detail=f"Cannot cancel an appointment that is already {appointment.status}")

    if appointment.start_time - datetime.now() < timedelta(minutes=30):
        raise HTTPException(status_code=400, detail="Appointments can only be cancelled at least 30 minutes in advance")

    queue_entry = db.query(QueueEntry).filter(QueueEntry.appointment_id == appointment.id).first()

    if queue_entry:
        cancelled_position = queue_entry.position

        db.query(QueueEntry).filter(
            QueueEntry.position > cancelled_position,
            QueueEntry.appointment_id.in_(
                db.query(Appointment.id).filter(Appointment.availability_id == appointment.availability_id)
            )
        ).update(
            {"position": QueueEntry.position - 1},
            synchronize_session=False
        )

        db.delete(queue_entry)

    appointment.status = "cancelled"

    availability = db.query(Availability).filter(Availability.id == appointment.availability_id).first()
    if availability and availability.booked_patients > 0:
        availability.booked_patients -= 1

    db.commit()

    return {"message": "Appointment cancelled successfully"}