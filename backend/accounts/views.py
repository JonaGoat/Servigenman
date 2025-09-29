import json

from django.contrib.auth import authenticate, login
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST


def _parse_payload(request):
    try:
        return json.loads(request.body.decode("utf-8"))
    except (UnicodeDecodeError, json.JSONDecodeError):
        return None


@csrf_exempt
@require_POST
def login_view(request):
    """Authenticate an existing user using username/password credentials."""

    payload = _parse_payload(request)
    if payload is None:
        return JsonResponse({"error": "Invalid JSON payload."}, status=400)

    username = (payload.get("username") or payload.get("usuario") or "").strip()
    password_raw = payload.get("password")
    password = password_raw if isinstance(password_raw, str) else ""

    if not username or not password:
        return JsonResponse(
            {"error": "Username and password are required."}, status=400
        )

    user = authenticate(request, username=username, password=password)

    if user is None:
        return JsonResponse({"error": "Invalid credentials."}, status=401)

    login(request, user)

    return JsonResponse(
        {
            "message": "Login successful.",
            "user": {
                "username": user.username,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "email": user.email,
            },
        }
    )
