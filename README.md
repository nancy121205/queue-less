# QueueLess 🏥

**Smart hospital queue management system** with AI-powered wait time prediction and OCR + LLM medical report summarization.

## Problem Statement

Patients at hospitals routinely wait for hours with zero visibility into their queue position or expected wait time. Doctors, meanwhile, walk into consultations blind — with no summary of a patient's prior medical reports. QueueLess addresses both sides: live queue tracking with ML-predicted wait times for patients, and OCR + LLM-summarized medical reports for doctors, so they see the key findings before the patient walks in.

---

## Features

- **Auth & Roles** - JWT-based authentication with role-based access (patient / doctor)
- **Appointment Booking** - Doctors publish availability slots; patients book with atomic transaction safety to prevent double-booking
- **Live Queue Tracking** - Real-time queue positions with automatic recalculation when patients are marked as seen
- **AI Wait Time Prediction** - XGBoost regression model predicts estimated wait time from live queue features (position, doctor's average consult time, time of day, day of week)
- **OCR + LLM Report Summarization** - Patients upload medical reports (PDF/image); PyMuPDF + Tesseract extract text, and Google Gemini generates a structured, plain-English summary (key findings, abnormal values, medications) for doctors
- **Email Notifications** - Automated queue status emails via Gmail SMTP

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, React Router, Axios |
| Backend | FastAPI (Python), SQLAlchemy, Alembic |
| Database | PostgreSQL (Supabase) |
| Auth | JWT, bcrypt, OAuth2PasswordBearer |
| ML | XGBoost, joblib |
| OCR | PyMuPDF, Tesseract |
| LLM | Google Gemini (`google-genai` SDK) |
| Notifications | Gmail SMTP |

---

## How the ML Model Works

The wait-time predictor is an XGBoost regression model trained on simulated queue data.

**Features used:** `position`, `avg_consult_mins`, `doctor_speed`, `time_of_day`, `day_of_week`

The model is loaded once at startup (`backend/ml_utils/predictor.py`) and called whenever a patient's queue position changes, using live features pulled fresh from the database.

---

## Project Structure

```
queueless/
├── frontend/          # React app
├── backend/
│   ├── routes/        # FastAPI route modules
│   ├── ml_utils/       # Model loading + prediction logic
│   ├── notifications/  # Email sending (mailer.py)
│   └── models/         # SQLAlchemy models
├── ml/                # Training scripts, notebooks, data simulation
└── README.md
```

---

## Known Gaps / Roadmap

- [ ] Finalize report ↔ appointment data model (currently reports link to patients generally; considering linking to specific appointments)
- [ ] Frontend dashboard polish, analytics charts
- [ ] Deployment (Vercel + Render)
- [ ] End-to-end + pytest test coverage

---

## License

MIT 
