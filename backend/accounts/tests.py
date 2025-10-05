import json
import os
from unittest import mock

from django.contrib.auth import get_user_model
from django.test import TestCase

from .auth0 import Auth0AuthenticationError


class LoginViewTests(TestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(

            username="jona",
            password="200328",
            first_name="Jonathan",
            last_name="Morales",
        )

    def test_login_success(self):
        response = self.client.post(
            "/api/login/",
            data=json.dumps({"username": "jona", "password": "200328"}),
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["user"]["username"], "jona")
        self.assertIn("message", data)
        self.assertIn("_auth_user_id", self.client.session)

    def test_login_invalid_credentials(self):
        response = self.client.post(
            "/api/login/",
            data=json.dumps({"username": "jona", "password": "incorrecta"}),
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 401)
        self.assertEqual(response.json()["error"], "Invalid credentials.")

    def test_login_missing_fields(self):
        response = self.client.post(
            "/api/login/",
            data=json.dumps({"username": "jona"}),
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertEqual(
            response.json()["error"], "Username and password are required."
        )

    def test_login_accepts_usuario_alias(self):
        response = self.client.post(
            "/api/login/",
            data=json.dumps({"usuario": "  jona  ", "password": "200328"}),
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["user"]["username"], "jona")

    def test_login_handles_invalid_json(self):
        response = self.client.post(
            "/api/login/",
            data="not-json",
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json()["error"], "Invalid JSON payload.")


class LoginViewAuth0Tests(TestCase):
    def setUp(self):
        self.env = {
            "AUTH0_DOMAIN": "servigenman.auth0.com",
            "AUTH0_CLIENT_ID": "client-id",
            "AUTH0_CLIENT_SECRET": "client-secret",
            "AUTH0_SCOPE": "openid profile email",
        }

    def _post(self, payload):
        return self.client.post(
            "/api/login/",
            data=json.dumps(payload),
            content_type="application/json",
        )

    @mock.patch("accounts.auth0._get_json")
    @mock.patch("accounts.auth0._post_form_urlencoded")
    def test_auth0_login_success(self, mock_post, mock_get):
        mock_post.return_value = (
            200,
            {
                "access_token": "access123",
                "id_token": "id123",
                "token_type": "Bearer",
                "expires_in": 86400,
            },
        )

        mock_get.return_value = (
            200,
            {
                "given_name": "Jonathan",
                "family_name": "Morales",
                "email": "jonathan@example.com",
            },
        )

        with mock.patch.dict(os.environ, self.env, clear=False):
            response = self._post({"username": "jona", "password": "200328"})

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["user"]["first_name"], "Jonathan")
        self.assertEqual(data["user"]["last_name"], "Morales")
        self.assertIn("tokens", data)
        self.assertEqual(data["tokens"]["access_token"], "access123")

        user = get_user_model().objects.get(username="jona")
        self.assertEqual(user.first_name, "Jonathan")
        self.assertFalse(user.has_usable_password())

    @mock.patch("accounts.auth0._post_form_urlencoded")
    def test_auth0_login_failure(self, mock_post):
        mock_post.return_value = (
            401,
            {
                "error": "access_denied",
                "error_description": "Wrong email or password.",
            },
        )

        with mock.patch.dict(os.environ, self.env, clear=False):
            response = self._post({"username": "jona", "password": "bad"})

        self.assertEqual(response.status_code, 401)
        self.assertEqual(response.json()["error"], "Wrong email or password.")

    @mock.patch("accounts.views.authenticate_with_auth0")
    def test_auth0_connection_issue(self, mock_auth0):
        mock_auth0.side_effect = Auth0AuthenticationError(
            "No se pudo conectar con Auth0.", status_code=503
        )

        with mock.patch.dict(os.environ, self.env, clear=False):
            response = self._post({"username": "jona", "password": "200328"})

        self.assertEqual(response.status_code, 503)
        self.assertEqual(response.json()["error"], "No se pudo conectar con Auth0.")
