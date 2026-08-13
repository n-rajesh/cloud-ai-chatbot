"""
database.py
Central SQLAlchemy database instance, shared across models and the app factory.
Kept separate from app.py to avoid circular imports between routes and models.
"""

from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()
