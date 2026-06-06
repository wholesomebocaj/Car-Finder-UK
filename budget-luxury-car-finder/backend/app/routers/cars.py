from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..scoring import score_car


router = APIRouter(prefix="/api/cars", tags=["cars"])


def serialise_scored_car(car: models.CarListing) -> dict:
    car_data = schemas.CarListingRead.model_validate(car).model_dump(mode="json")
    return {**car_data, **score_car(car)}


@router.get("", response_model=list[schemas.ScoredCarListing])
def list_cars(db: Session = Depends(get_db)):
    cars = db.query(models.CarListing).order_by(models.CarListing.created_at.desc()).all()
    return [serialise_scored_car(car) for car in cars]


@router.get("/ranked", response_model=list[schemas.ScoredCarListing])
def list_ranked_cars(db: Session = Depends(get_db)):
    cars = db.query(models.CarListing).all()
    scored = [serialise_scored_car(car) for car in cars]
    return sorted(scored, key=lambda car: car["score"], reverse=True)


@router.get("/{car_id}", response_model=schemas.ScoredCarListing)
def get_car(car_id: int, db: Session = Depends(get_db)):
    car = db.get(models.CarListing, car_id)
    if car is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Car not found")
    return serialise_scored_car(car)


@router.post("", response_model=schemas.ScoredCarListing, status_code=status.HTTP_201_CREATED)
def create_car(car_in: schemas.CarListingCreate, db: Session = Depends(get_db)):
    car = models.CarListing(**car_in.model_dump())
    db.add(car)
    db.commit()
    db.refresh(car)
    return serialise_scored_car(car)


@router.put("/{car_id}", response_model=schemas.ScoredCarListing)
def update_car(car_id: int, car_in: schemas.CarListingUpdate, db: Session = Depends(get_db)):
    car = db.get(models.CarListing, car_id)
    if car is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Car not found")

    for field, value in car_in.model_dump().items():
        setattr(car, field, value)

    db.commit()
    db.refresh(car)
    return serialise_scored_car(car)


@router.delete("/{car_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_car(car_id: int, db: Session = Depends(get_db)):
    car = db.get(models.CarListing, car_id)
    if car is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Car not found")

    db.delete(car)
    db.commit()
    return None
