from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Request
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from database import get_db
from jose import jwt
from auth import JWT_SECRET
from models import Doctor, QueueEntry, User, Appointment, Availability
from typing import Literal
from ml_utils.predictor import build_features
from pydantic import BaseModel
from datetime import datetime
from notifications.mailer import send_email

router = APIRouter()

class PredictWaitRequest(BaseModel):
    doctor_id: int
    position: int
    appointment_time: datetime

@router.get("/{availability_id}")
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
    ).order_by(QueueEntry.position).all()

    return [
        {   
            "entry_id" : queueentry.id,
            "position" : queueentry.position,
            "patient_id" : user.id,
            "patient_name" : user.name,
            "estimated_wait" : queueentry.estimated_wait,
            "status" : queueentry.status,
            "appointment_start_time" : appointment.start_time            
        }
        for queueentry, user, appointment in queue
    ]

@router.patch("/{entry_id}/status")
def update_status(
    entry_id: int, 
    new_status : Literal["waiting", "called", "seen"], 
    background_tasks: BackgroundTasks,
    token: str=Depends(OAuth2PasswordBearer(tokenUrl="/auth/login")), 
    db: Session=Depends(get_db)
):
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
    except:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user_id = payload.get("id")
    doctor_id = db.query(Doctor).filter(Doctor.user_id == user_id).first().id
    
    if payload.get("role") != "doctor":
        raise HTTPException(status_code=403, detail="Only doctors can view appointments made")
    
    queue = db.query(QueueEntry).filter(QueueEntry.id == entry_id).first()

    if not queue:
        raise HTTPException(status_code=404, detail="Queue entry not found")
    
    queue.status = new_status
    
    if new_status == "seen":

        appointment = db.query(Appointment).filter(Appointment.id == queue.appointment_id).first()
        appointment.status = "completed"

        db.query(QueueEntry).filter(
            QueueEntry.position > queue.position,
            QueueEntry.appointment_id.in_(
                db.query(Appointment.id).filter(
                    Appointment.doctor_id == doctor_id
                )
            )
        ).update(
            {
                "position": QueueEntry.position - 1
            }, 
            synchronize_session=False
        )

        affected_entries = db.query(QueueEntry).filter(
            QueueEntry.position.in_([1, 2]),
            QueueEntry.appointment_id.in_(
                db.query(Appointment.id).filter(Appointment.doctor_id == doctor_id)
            )
        ).all()

        for entry in affected_entries:
            entry_appointment = db.query(Appointment).filter(Appointment.id == entry.appointment_id).first()
            patient = db.query(User).filter(User.id == entry_appointment.patient_id).first()

            if entry.position == 2 and not entry.next_email_sent:
                background_tasks.add_task(
                    send_email,
                    to=patient.email,
                    subject="You're next — QueueLess",
                    body=f"<p>Hi {patient.name}, you're next in line! Please be ready.</p>"
                )
                entry.next_email_sent = True

            if entry.position == 1 and not entry.ready_email_sent:
                background_tasks.add_task(
                    send_email,
                    to=patient.email,
                    subject="Doctor is ready for you — QueueLess",
                    body=f"<p>Hi {patient.name}, the doctor is ready to see you now.</p>"
                )
                entry.ready_email_sent = True

    db.commit()
    return {"message": f"Queue entry updated updated to {new_status}"}

@router.post("/predict-wait")
def predict_wait(data: PredictWaitRequest, request: Request, db: Session = Depends(get_db)):
    doctor = db.query(Doctor).filter(Doctor.id == data.doctor_id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")

    model = request.app.state.model
    appointment_time = data.appointment_time or datetime.now()

    try:
        features = build_features(data.position, doctor.avg_consult_mins, appointment_time)
        predicted = float(model.predict(features)[0])
        return {"estimated_wait_minutes": round(predicted, 1), "source": "model"}
    except Exception:
        fallback = round(data.position * float(doctor.avg_consult_mins), 1)
        return {"estimated_wait_minutes": fallback, "source": "fallback"}