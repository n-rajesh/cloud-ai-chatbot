"""
utils/auth_validators.py
Validation for registration and login payloads.
"""

import re
from utils.validators import ValidationError

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
MIN_PASSWORD_LENGTH = 8
MIN_USERNAME_LENGTH = 3
MAX_USERNAME_LENGTH = 30


def validate_registration_payload(data):
    if not isinstance(data, dict):
        raise ValidationError("Request body must be a JSON object.")

    username = (data.get("username") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if len(username) < MIN_USERNAME_LENGTH or len(username) > MAX_USERNAME_LENGTH:
        raise ValidationError(
            f"Username must be between {MIN_USERNAME_LENGTH} and {MAX_USERNAME_LENGTH} characters."
        )
    if not re.match(r"^[a-zA-Z0-9_.-]+$", username):
        raise ValidationError(
            "Username can only contain letters, numbers, underscores, dots, and hyphens."
        )
    if not EMAIL_RE.match(email):
        raise ValidationError("Please provide a valid email address.")
    if len(password) < MIN_PASSWORD_LENGTH:
        raise ValidationError(f"Password must be at least {MIN_PASSWORD_LENGTH} characters.")

    return username, email, password


def validate_login_payload(data):
    if not isinstance(data, dict):
        raise ValidationError("Request body must be a JSON object.")

    identifier = (data.get("identifier") or data.get("email") or data.get("username") or "").strip()
    password = data.get("password") or ""

    if not identifier:
        raise ValidationError("Email or username is required.")
    if not password:
        raise ValidationError("Password is required.")

    return identifier, password
