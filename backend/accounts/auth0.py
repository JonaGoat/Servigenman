"""Utilities for authenticating against Auth0 without third-party deps."""

from __future__ import annotations

import json
import os
from dataclasses import dataclass
from typing import Any, Dict, Optional

from urllib import error, request
from urllib.parse import urlencode


class Auth0Error(Exception):
    """Base class for Auth0 related errors."""


class Auth0ConfigurationError(Auth0Error):
    """Raised when Auth0 is not properly configured."""


class Auth0AuthenticationError(Auth0Error):
    """Raised when Auth0 returns an authentication error."""

    def __init__(self, message: str, status_code: int = 401) -> None:
        super().__init__(message)
        self.status_code = status_code
        self.message = message


@dataclass
class Auth0Config:
    domain: str
    client_id: str
    client_secret: str
    audience: Optional[str] = None
    scope: Optional[str] = None
    realm: Optional[str] = None
    timeout: float = 10.0


@dataclass
class Auth0Result:
    tokens: Dict[str, Any]
    profile: Optional[Dict[str, Any]]


def _get_env(name: str) -> Optional[str]:
    value = os.getenv(name)
    if value is None:
        return None
    value = value.strip()
    return value or None


def load_auth0_config() -> Optional[Auth0Config]:
    """Load Auth0 configuration from environment variables."""

    domain = _get_env("AUTH0_DOMAIN")
    client_id = _get_env("AUTH0_CLIENT_ID")
    client_secret = _get_env("AUTH0_CLIENT_SECRET")

    if not (domain and client_id and client_secret):
        return None

    audience = _get_env("AUTH0_AUDIENCE")
    scope = _get_env("AUTH0_SCOPE") or "openid profile email"
    realm = _get_env("AUTH0_REALM")

    timeout_raw = _get_env("AUTH0_TIMEOUT")
    timeout = 10.0
    if timeout_raw:
        try:
            timeout = float(timeout_raw)
        except ValueError:
            timeout = 10.0

    return Auth0Config(
        domain=domain,
        client_id=client_id,
        client_secret=client_secret,
        audience=audience,
        scope=scope,
        realm=realm,
        timeout=timeout,
    )


def _send_request(
    url: str,
    *,
    data: Optional[bytes],
    headers: Dict[str, str],
    timeout: float,
    method: str,
) -> tuple[int, Dict[str, Any]]:
    req = request.Request(url, data=data, headers=headers, method=method)

    try:
        with request.urlopen(req, timeout=timeout) as response:  # type: ignore[no-untyped-call]
            status_code = response.getcode()
            raw_body = response.read()
    except error.HTTPError as exc:
        status_code = exc.code
        raw_body = exc.read()
    except error.URLError as exc:  # pragma: no cover - network errors
        raise Auth0AuthenticationError("No se pudo conectar con Auth0.", status_code=503) from exc

    try:
        parsed = json.loads(raw_body.decode("utf-8")) if raw_body else {}
    except (ValueError, UnicodeDecodeError):
        parsed = {}

    if not isinstance(parsed, dict):
        parsed = {}

    return status_code, parsed


def _post_form_urlencoded(
    url: str, payload: Dict[str, Any], timeout: float
) -> tuple[int, Dict[str, Any]]:
    filtered_payload = {
        key: value
        for key, value in payload.items()
        if value is not None
    }

    data = urlencode(filtered_payload).encode("utf-8")
    headers = {"Content-Type": "application/x-www-form-urlencoded"}
    return _send_request(url, data=data, headers=headers, timeout=timeout, method="POST")


def _get_json(url: str, headers: Dict[str, str], timeout: float) -> tuple[int, Dict[str, Any]]:
    return _send_request(url, data=None, headers=headers, timeout=timeout, method="GET")


def authenticate_with_auth0(username: str, password: str) -> Auth0Result:
    """Authenticate a user with Auth0 using the Resource Owner Password flow."""

    config = load_auth0_config()
    if config is None:
        raise Auth0ConfigurationError("Auth0 is not configured.")

    token_url = f"https://{config.domain}/oauth/token"
    payload: Dict[str, Any] = {
        "grant_type": "password",
        "username": username,
        "password": password,
        "client_id": config.client_id,
        "client_secret": config.client_secret,
        "scope": config.scope,
    }

    if config.audience:
        payload["audience"] = config.audience
    if config.realm:
        # Depending on the Auth0 tenant configuration this field can be required.
        payload["realm"] = config.realm

    status_code, token_payload = _post_form_urlencoded(token_url, payload, config.timeout)

    if status_code != 200:
        error_message = "No pudimos validar tus credenciales."
        if isinstance(token_payload, dict):
            error_message = (
                token_payload.get("error_description")
                or token_payload.get("description")
                or token_payload.get("error")
                or error_message
            )
        raise Auth0AuthenticationError(error_message, status_code=status_code)

    profile: Optional[Dict[str, Any]] = None
    access_token = token_payload.get("access_token")

    if access_token:
        userinfo_url = f"https://{config.domain}/userinfo"
        headers = {"Authorization": f"Bearer {access_token}"}
        status_info, profile_payload = _get_json(userinfo_url, headers, config.timeout)

        if status_info == 200 and isinstance(profile_payload, dict):
            profile = profile_payload

    return Auth0Result(tokens=token_payload, profile=profile)
