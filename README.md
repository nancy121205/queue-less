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
- **Cloud File Storage** — Reports stored in Supabase Storage with signed URLs, not local disk
- **Email Notifications** — Automated queue status emails (booking confirmation, "you're next," "doctor ready") via Gmail SMTP

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, React Router, Axios, TailwindCSS |
| Backend | FastAPI (Python), SQLAlchemy, Alembic |
| Database | PostgreSQL (Supabase) |
| File Storage | Supabase Storage (private bucket, signed URLs) |
| Auth | JWT, bcrypt, OAuth2PasswordBearer |
| ML | XGBoost, joblib |
| OCR | PyMuPDF, Tesseract |
| LLM | Google Gemini (`google-genai` SDK) |
| Notifications | Gmail SMTP |
| Deployment | Vercel (frontend), Render (backend, Docker) |

---

## How the ML Model Works

The wait-time predictor is an XGBoost regression model trained on simulated queue data.

**Features used:** `position`, `avg_consult_mins`, `doctor_speed`, `time_of_day`, `day_of_week`

The model is loaded once at startup (`backend/ml_utils/predictor.py`) and called whenever a patient's queue position changes, using live features pulled fresh from the database.

---

## Project Structure

```
queueless/
├── frontend/ # React app
├── backend/
│ ├── routers/ # FastAPI route modules
│ ├── ml_utils/ # Model loading + prediction logic
│ ├── llm_utils/ # Gemini summarization logic
│ ├── notifications/ # Email sending (mailer.py)
│ ├── storage_utils/ # Supabase Storage helpers
│ └── models/ # SQLAlchemy models
├── ml/ # Training scripts, notebooks, data simulation
├── Dockerfile # Backend deploy config (installs Tesseract at OS level)
└── README.md
```

---

## Known Gaps / Roadmap

- [ ] **Location-based doctor/hospital discovery** — suggest nearby doctors or hospitals offering a needed specialization or service, based on the patient's location
- [ ] Doctor's queue position-recalculation scoped consistently per availability slot (currently scoped per-doctor in one route, per-slot in another)
- [ ] Recalculate wait-time estimates for patients shifted up in queue after a cancellation, not just after a "seen" update
- [ ] Frontend dashboard polish, analytics charts
- [ ] pytest coverage for critical endpoints (auth, booking, queue)

---

## License

MIT 
