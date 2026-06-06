from fastapi import APIRouter
from pydantic import BaseModel, Field

from ..services import dvla_service, mot_service


router = APIRouter(prefix="/api/vehicle", tags=["vehicle lookup"])


class VehicleLookupRequest(BaseModel):
    registration_number: str = Field(..., min_length=2, max_length=20)


@router.post("/lookup")
def lookup_vehicle_data(request: VehicleLookupRequest):
    registration_number = request.registration_number.strip().upper()
    dvla_result = dvla_service.lookup_vehicle(registration_number)
    mot_result = mot_service.lookup_mot_history(registration_number)
    any_configured = dvla_result["configured"] or mot_result["configured"]

    if not any_configured:
        message = (
            "Vehicle lookup is not connected yet. Manual entry still works, "
            "and you can add API keys later when you are ready."
        )
    else:
        message = (
            "Vehicle lookup credentials were detected, but the live DVLA/MOT "
            "API calls are still placeholders."
        )

    return {
        "registration_number": registration_number,
        "connected": False,
        "configured": any_configured,
        "message": message,
        "dvla": dvla_result,
        "mot": mot_result,
    }
