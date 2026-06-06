from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import Base, SessionLocal, engine, ensure_database_schema
from .routers import cars, recommendations, vehicle_lookup
from .seed_data import seed_database


Base.metadata.create_all(bind=engine)
ensure_database_schema()

app = FastAPI(
    title="Budget Luxury Car Finder UK",
    description="Manual used-car comparison and scoring tool for budget luxury cars in the UK.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(cars.router)
app.include_router(recommendations.router)
app.include_router(vehicle_lookup.router)


@app.on_event("startup")
def startup_seed_data():
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()


@app.get("/")
def health_check():
    return {"name": "Budget Luxury Car Finder UK", "status": "ok"}
