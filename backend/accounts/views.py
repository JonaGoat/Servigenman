import json
from typing import Dict, Optional

from django.contrib.auth import authenticate, get_user_model, login
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST

from .auth0 import (
    Auth0AuthenticationError,
    Auth0ConfigurationError,
    authenticate_with_auth0,
)


def _parse_payload(request):
    try:
        return json.loads(request.body.decode("utf-8"))
    except (UnicodeDecodeError, json.JSONDecodeError):
        return None


def _normalize_profile(
    username: str, profile: Optional[Dict[str, object]]
) -> Dict[str, str]:
    """Extract a sanitized payload from the Auth0 profile response."""

    def _coerce(value: object) -> str:
        return str(value).strip() if isinstance(value, str) else ""

    first_name = ""
    last_name = ""
    email = ""

    if profile:
        first_name = _coerce(profile.get("given_name"))
        last_name = _coerce(profile.get("family_name"))
        email = _coerce(profile.get("email"))

        if not first_name and profile.get("name"):
            full_name = _coerce(profile.get("name"))
            if full_name:
                parts = full_name.split()
                first_name = parts[0]
                if len(parts) > 1 and not last_name:
                    last_name = " ".join(parts[1:])

        if not first_name and profile.get("nickname"):
            first_name = _coerce(profile.get("nickname"))

    return {
        "username": username,
        "first_name": first_name,
        "last_name": last_name,
        "email": email,
    }


def _sync_user_with_profile(username: str, profile: Dict[str, str]):
    """Ensure a Django user exists for the authenticated Auth0 identity."""

    user_model = get_user_model()
    user, created = user_model.objects.get_or_create(username=username)

    update_fields: list[str] = []

    if created:
        user.set_unusable_password()
        update_fields.append("password")

    for field in ("first_name", "last_name", "email"):
        value = profile.get(field, "")
        if value and getattr(user, field) != value:
            setattr(user, field, value)
            update_fields.append(field)

    if update_fields:
        user.save(update_fields=list(dict.fromkeys(update_fields)))

    return user


def _build_response_payload(user_profile: Dict[str, str], tokens: Dict[str, object]):
    payload: Dict[str, object] = {
        "message": "Login successful.",
        "user": user_profile,
    }

    filtered_tokens = {
        key: value
        for key, value in tokens.items()
        if key in {"access_token", "id_token", "token_type", "expires_in", "refresh_token"}
        and value is not None
    }

    if filtered_tokens:
        payload["tokens"] = filtered_tokens

    return payload


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

    try:
        auth0_result = authenticate_with_auth0(username=username, password=password)
    except Auth0ConfigurationError:
        auth0_result = None
    except Auth0AuthenticationError as exc:
        return JsonResponse({"error": exc.message}, status=exc.status_code)

    if auth0_result is not None:
        profile = _normalize_profile(username, auth0_result.profile)
        user = _sync_user_with_profile(username, profile)
        login(request, user)
        return JsonResponse(_build_response_payload(profile, auth0_result.tokens))

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
