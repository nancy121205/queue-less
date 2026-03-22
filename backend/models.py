from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Float
from sqlalchemy.orm import relationship
from database import Base
import datetime

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String, nullable=False)  # "patient" or "doctor"
    phone = Column(String)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Doctor(Base):
    __tablename__ = "doctors"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    specialization = Column(String)
    avg_consult_mins = Column(Float)
    hospital_name = Column(String)

class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    doctor_id = Column(Integer, ForeignKey("doctors.id"), nullable=False)
    slot_time = Column(DateTime, nullable=False)
    status = Column(String, default="upcoming")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class QueueEntry(Base):
    __tablename__ = "queue_entries"

    id = Column(Integer, primary_key=True, index=True)
    appointment_id = Column(Integer, ForeignKey("appointments.id"), nullable=False)
    position = Column(Integer)
    estimated_wait = Column(Float)
    joined_at = Column(DateTime, default=datetime.datetime.utcnow)
    status = Column(String, default="waiting")  # waiting / called / done

class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    file_url = Column(String)
    raw_text = Column(String)
    ai_summary = Column(String)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
