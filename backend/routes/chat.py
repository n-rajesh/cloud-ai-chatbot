"""
routes/chat.py
Handles sending a user message to the AI and persisting the exchange.
"""

import json
from flask import Blueprint, request, jsonify, Response, current_app

from database import db
from models.conversation import Conversation
from services.ai_service import ai_service
from utils.validators import validate_chat_payload, ValidationError
from utils.auth import get_optional_user_id

chat_bp = Blueprint("chat", __name__)


@chat_bp.route("/chat", methods=["POST"])
def chat():
    """Standard (non-streaming) chat endpoint. Returns the full AI response."""
    data = request.get_json(silent=True) or {}
    message, session_id, history = validate_chat_payload(data)

    ai_response = ai_service.get_response(message, history)

    conversation = Conversation(
        user_id=get_optional_user_id(),
        session_id=session_id,
        user_message=message,
        ai_response=ai_response,
    )
    db.session.add(conversation)
    db.session.commit()

    return jsonify({"success": True, "data": conversation.to_dict()}), 201


@chat_bp.route("/chat/stream", methods=["POST"])
def chat_stream():
    """
    Server-Sent-Events style streaming endpoint. Streams the AI response as it is
    generated, then persists the full exchange once the stream completes.
    """
    data = request.get_json(silent=True) or {}
    message, session_id, history = validate_chat_payload(data)
    user_id = get_optional_user_id()  # must read before entering the generator/stream

    app = current_app._get_current_object()

    def generate():
        full_response = ""
        try:
            for token in ai_service.stream_response(message, history):
                full_response += token
                yield f"data: {json.dumps({'token': token})}\n\n"
        except Exception as exc:  # noqa: BLE001
            app.logger.exception("Streaming AI response failed")
            yield f"data: {json.dumps({'error': str(exc)})}\n\n"
            return

        with app.app_context():
            conversation = Conversation(
                user_id=user_id,
                session_id=session_id,
                user_message=message,
                ai_response=full_response,
            )
            db.session.add(conversation)
            db.session.commit()
            yield f"data: {json.dumps({'done': True, 'id': conversation.id})}\n\n"

    return Response(
        generate(),
        mimetype="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )


@chat_bp.errorhandler(ValidationError)
def handle_validation_error(err):
    return jsonify({"success": False, "error": err.message}), err.status_code
