"""
utils/validators.py
Small, dependency-free request validation helpers used across routes.
"""

MAX_MESSAGE_LENGTH = 8000


class ValidationError(Exception):
    """Raised when incoming request data fails validation."""

    def __init__(self, message, status_code=400):
        super().__init__(message)
        self.message = message
        self.status_code = status_code


def validate_chat_payload(data):
    """
    Validates the JSON payload sent to POST /api/chat.
    Expects: { "message": str, "session_id": str (optional), "history": list (optional) }
    """
    if not isinstance(data, dict):
        raise ValidationError("Request body must be a JSON object.")

    message = data.get("message")
    if message is None:
        raise ValidationError("Field 'message' is required.")
    if not isinstance(message, str):
        raise ValidationError("Field 'message' must be a string.")

    message = message.strip()
    if len(message) == 0:
        raise ValidationError("Field 'message' cannot be empty.")
    if len(message) > MAX_MESSAGE_LENGTH:
        raise ValidationError(
            f"Field 'message' exceeds the maximum length of {MAX_MESSAGE_LENGTH} characters."
        )

    session_id = data.get("session_id", "default")
    if not isinstance(session_id, str) or len(session_id) == 0:
        session_id = "default"

    history = data.get("history", [])
    if not isinstance(history, list):
        raise ValidationError("Field 'history' must be a list.")

    return message, session_id, history
