from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from routers import auth

app = FastAPI()
app.include_router(auth.router, prefix="/auth", tags=["auth"])

# Browsers block requests between different origins (ports count as different origins) by default for security. CORS middleware tells your backend "yes, requests from localhost:5173 are allowed."
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)