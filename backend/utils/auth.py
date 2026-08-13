"""
utils/auth.py
Lightweight JWT issuing/verification and a @login_required decorator.
Tokens are sent by the frontend as: Authorization: Bearer <token>
"""

import os
from datetime import datetime, timedelta, timezone
from functools import wraps

import jwt
from flask import request, jsonify, g

TOKEN_EXPIRY_DAYS = 7


def _secret_key():
    return os.getenv("SECRET_KEY", "dev-secret-key")


def generate_token(user_id):
    payload = {
        "sub": str(user_id),
        "exp": datetime.now(timezone.utc) + timedelta(days=TOKEN_EXPIRY_DAYS),
        "iat": datetime.now(timezone.utc),
    }
    return jwt.encode(payload, _secret_key(), algorithm="HS256")


def decode_token(token):
    """Returns the user id (int) if valid, raises jwt exceptions otherwise."""
    payload = jwt.decode(token, _secret_key(), algorithms=["HS256"])
    return int(payload["sub"])


def get_token_from_request():
    auth_header = request.headers.get("Authorization", "")
    if auth_header.startswith("Bearer "):
        return auth_header[len("Bearer ") :].strip()
    return None


def login_required(fn):
    """Route decorator: rejects the request with 401 unless a valid token is present.
    On success, sets g.user_id for the view to use."""

    @wraps(fn)
    def wrapper(*args, **kwargs):
        token = get_token_from_request()
        if not token:
            return jsonify({"success": False, "error": "Authentication required."}), 401
        try:
            g.user_id = decode_token(token)
        except jwt.ExpiredSignatureError:
            return jsonify({"success": False, "error": "Session expired. Please log in again."}), 401
        except jwt.InvalidTokenError:
            return jsonify({"success": False, "error": "Invalid authentication token."}), 401
        return fn(*args, **kwargs)

    return wrapper


def get_optional_user_id():
    """Returns the user id if a valid token is present, otherwise None.
    Does not reject the request — used for routes that work for both
    logged-in and anonymous users."""
    token = get_token_from_request()
    if not token:
        return None
    try:
        return decode_token(token)
    except jwt.PyJWTError:
        return None
