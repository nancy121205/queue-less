import numpy as np
from datetime import datetime

def build_features(position: int, avg_consult_mins: float, appointment_time: datetime) -> np.ndarray:
    avg_consult_mins = float(avg_consult_mins)
    time_of_day = appointment_time.hour
    day_of_week = appointment_time.weekday()
    doctor_speed = 1.0  # default — no per-doctor speed data in production yet

    return np.array([[position, avg_consult_mins, doctor_speed, time_of_day, day_of_week]])