import json

from django.contrib.auth import get_user_model
from django.test import TestCase


class LoginViewTests(TestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(
            username="juan",
            password="contraseña-segura",
            first_name="Juan",
            last_name="Pérez",
        )

    def test_login_success(self):
        response = self.client.post(
            "/api/login/",
            data=json.dumps({"username": "juan", "password": "contraseña-segura"}),
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["user"]["username"], "juan")
        self.assertIn("message", data)
        self.assertIn("_auth_user_id", self.client.session)

    def test_login_invalid_credentials(self):
        response = self.client.post(
            "/api/login/",
            data=json.dumps({"username": "juan", "password": "incorrecta"}),
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 401)
        self.assertEqual(response.json()["error"], "Invalid credentials.")

    def test_login_missing_fields(self):
        response = self.client.post(
            "/api/login/",
            data=json.dumps({"username": "juan"}),
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertEqual(
            response.json()["error"], "Username and password are required."
        )
