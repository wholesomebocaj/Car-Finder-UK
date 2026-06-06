import os


def get_credentials() -> dict[str, str | None]:
    return {
        "client_id": os.getenv("MOT_CLIENT_ID"),
        "client_secret": os.getenv("MOT_CLIENT_SECRET"),
        "api_key": os.getenv("MOT_API_KEY"),
    }


def is_configured() -> bool:
    credentials = get_credentials()
    return bool(
        credentials["api_key"]
        and credentials["client_id"]
        and credentials["client_secret"]
    )


def lookup_mot_history(registration_number: str) -> dict:
    if not is_configured():
        return {
            "source": "MOT",
            "configured": False,
            "success": False,
            "message": "MOT lookup is not connected yet. Add MOT_CLIENT_ID, MOT_CLIENT_SECRET and MOT_API_KEY to enable this later.",
            "data": None,
        }

    return {
        "source": "MOT",
        "configured": True,
        "success": False,
        "message": "MOT credentials are configured, but live MOT integration has not been implemented yet.",
        "data": {
            "registration_number": registration_number.upper().replace(" ", ""),
        },
    }
