from pathlib import Path

from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import declarative_base, sessionmaker


BASE_DIR = Path(__file__).resolve().parent.parent
DATABASE_URL = f"sqlite:///{BASE_DIR / 'budget_luxury_cars.db'}"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def ensure_database_schema():
    inspector = inspect(engine)
    if "car_listings" not in inspector.get_table_names():
        return

    columns = {column["name"] for column in inspector.get_columns("car_listings")}
    with engine.begin() as connection:
        if "registration_number" not in columns:
            connection.execute(
                text("ALTER TABLE car_listings ADD COLUMN registration_number VARCHAR(20)")
            )
