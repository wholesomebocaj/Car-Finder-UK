import os


def get_api_key() -> str | None:
    return os.getenv("DVLA_API_KEY")


def is_configured() -> bool:
    return bool(get_api_key())


def lookup_vehicle(registration_number: str) -> dict:
    if not is_configured():
        return {
            "source": "DVLA",
            "configured": False,
            "success": False,
            "message": "DVLA lookup is not connected yet. Add DVLA_API_KEY to the backend environment to enable this later.",
            "data": None,
        }

    return {
        "source": "DVLA",
        "configured": True,
        "success": False,
        "message": "DVLA_API_KEY is configured, but live DVLA integration has not been implemented yet.",
        "data": {
            "registration_number": registration_number.upper().replace(" ", ""),
        },
    }
