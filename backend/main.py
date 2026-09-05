from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from database import engine, Base
from routers import auth, doctors, appointments, queue
import models
from contextlib import asynccontextmanager
import joblib

load_dotenv()

@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.model = joblib.load("../ml/models/wait_time_model.pkl")
    print("Model and encoder loaded successfully")
    yield

app = FastAPI(lifespan=lifespan)

Base.metadata.create_all(bind=engine)

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(doctors.router, prefix="/doctors", tags=["doctors"])
app.include_router(appointments.router, prefix="/appointments", tags=["appointments"])
app.include_router(queue.router, prefix="/queue", tags=["queue"])

# Browsers block requests between different origins (ports count as different origins) by default for security. 
# CORS middleware tells your backend "yes, requests from localhost:5173 are allowed."
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)