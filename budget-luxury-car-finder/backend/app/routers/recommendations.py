from fastapi import APIRouter

from ..scoring import get_avoid_models, get_recommended_models


router = APIRouter(prefix="/api", tags=["recommendations"])


@router.get("/recommendations")
def list_recommendations():
    return get_recommended_models()


@router.get("/avoid")
def list_avoid_models():
    return get_avoid_models()
