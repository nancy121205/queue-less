from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Float
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime, timezone

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String, nullable=False)  # "patient" or "doctor"
    phone = Column(String)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class Doctor(Base):
    __tablename__ = "doctors"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    specialization = Column(String)
    avg_consult_mins = Column(Float)
    hospital_name = Column(String)
    fees = Column(Integer, nullable=False, default=0)

class Availability(Base):
    __tablename__ = "availabilities"

    id = Column(Integer, primary_key=True, index=True)
    doctor_id = Column(Integer, ForeignKey("doctors.id"), nullable=False)
    date = Column(DateTime, nullable=False)
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=False)
    max_patients = Column(Integer, nullable=False)
    booked_patients = Column(Integer, default=0)
    
class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    doctor_id = Column(Integer, ForeignKey("doctors.id"), nullable=False)
    availability_id = Column(Integer, ForeignKey("availabilities.id"), nullable=False)
    status = Column(String, default="upcoming")
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class QueueEntry(Base):
    __tablename__ = "queue_entries"

    id = Column(Integer, primary_key=True, index=True)
    appointment_id = Column(Integer, ForeignKey("appointments.id"), nullable=False)
    position = Column(Integer)
    estimated_wait = Column(Float)
    joined_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    status = Column(String, default="waiting")  # waiting / called / seen

class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    appointment_id = Column(Integer, ForeignKey("appointments.id"), nullable=False)
    file_url = Column(String)
    raw_text = Column(String)
    ai_summary = Column(String)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
