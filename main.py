from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from models.database import engine, Base
from models import car, request
from routers import cars, requests, auth
from sqlalchemy.sql import func

app = FastAPI()

Base.metadata.create_all(bind=engine)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory="static"), name="static")

app.include_router(cars.router)
app.include_router(requests.router)
app.include_router(auth.router)

@app.get("/")
async def root():
    return {"message": "Welcome to the Car Dealer API!"}

