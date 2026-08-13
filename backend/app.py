"""
app.py
Application entrypoint. Creates and configures the Flask app, registers
blueprints, sets up the database, and wires centralized error handling.
"""

import os
from dotenv import load_dotenv

# Must run before any local module is imported, since services/ai_service.py
# reads OPENAI_API_KEY from the environment at import time.
load_dotenv()

from flask import Flask, jsonify
from flask_cors import CORS

from database import db
from utils.logger import configure_logger
from routes.chat import chat_bp
from routes.history import history_bp
from routes.health import health_bp
from routes.auth import auth_bp


def create_app():
    app = Flask(__name__)

    app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "dev-secret-key")
    app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URL", "sqlite:///chatbot.db")
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["JSON_SORT_KEYS"] = False

    logger = configure_logger(app)

    # --- CORS ---------------------------------------------------------------
    allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173")
    origins = [o.strip() for o in allowed_origins.split(",") if o.strip()]
    CORS(app, resources={r"/api/*": {"origins": origins}}, supports_credentials=True)

    # --- Database -------------------------------------------------------------
    db.init_app(app)
    with app.app_context():
        db.create_all()

    # --- Blueprints -----------------------------------------------------------
    app.register_blueprint(chat_bp, url_prefix="/api")
    app.register_blueprint(history_bp, url_prefix="/api")
    app.register_blueprint(health_bp, url_prefix="/api")
    app.register_blueprint(auth_bp, url_prefix="/api")

    # --- Centralized error handling --------------------------------------------
    @app.errorhandler(404)
    def not_found(_err):
        return jsonify({"success": False, "error": "Resource not found."}), 404

    @app.errorhandler(405)
    def method_not_allowed(_err):
        return jsonify({"success": False, "error": "Method not allowed."}), 405

    @app.errorhandler(500)
    def server_error(err):
        logger.exception("Unhandled server error")
        return jsonify({"success": False, "error": "Internal server error."}), 500

    @app.errorhandler(Exception)
    def handle_unexpected(err):
        logger.exception("Unexpected exception")
        return jsonify({"success": False, "error": str(err)}), 500

    logger.info("Cloud AI Chatbot backend initialized.")
    return app


app = create_app()

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    debug = os.getenv("FLASK_ENV") != "production"
    app.run(host="0.0.0.0", port=port, debug=debug)
