"""
routes/auth.py
Registration, login, and current-user endpoints.
"""

from flask import Blueprint, request, jsonify, g
from sqlalchemy import or_

from database import db
from models.user import User
from utils.auth import generate_token, login_required
from utils.auth_validators import validate_registration_payload, validate_login_payload
from utils.validators import ValidationError

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/auth/register", methods=["POST"])
def register():
    data = request.get_json(silent=True) or {}
    username, email, password = validate_registration_payload(data)

    existing = User.query.filter(
        or_(User.username == username, User.email == email)
    ).first()
    if existing:
        field = "username" if existing.username == username else "email"
        return jsonify({"success": False, "error": f"That {field} is already taken."}), 409

    user = User(username=username, email=email)
    user.set_password(password)
    db.session.add(user)
    db.session.commit()

    token = generate_token(user.id)
    return jsonify({"success": True, "data": {"user": user.to_dict(), "token": token}}), 201


@auth_bp.route("/auth/login", methods=["POST"])
def login():
    data = request.get_json(silent=True) or {}
    identifier, password = validate_login_payload(data)

    user = User.query.filter(
        or_(User.username == identifier, User.email == identifier.lower())
    ).first()

    if not user or not user.check_password(password):
        return jsonify({"success": False, "error": "Invalid credentials."}), 401

    token = generate_token(user.id)
    return jsonify({"success": True, "data": {"user": user.to_dict(), "token": token}}), 200


@auth_bp.route("/auth/me", methods=["GET"])
@login_required
def me():
    user = User.query.get(g.user_id)
    if not user:
        return jsonify({"success": False, "error": "User not found."}), 404
    return jsonify({"success": True, "data": user.to_dict()}), 200


@auth_bp.errorhandler(ValidationError)
def handle_validation_error(err):
    return jsonify({"success": False, "error": err.message}), err.status_code
