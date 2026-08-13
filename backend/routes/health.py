"""
routes/health.py
Simple liveness endpoint for uptime monitors and Render health checks.
"""

from flask import Blueprint, jsonify

health_bp = Blueprint("health", __name__)


@health_bp.route("/health", methods=["GET"])
def health():
    return jsonify({"success": True, "status": "ok"}), 200
