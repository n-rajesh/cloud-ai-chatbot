"""
routes/history.py
Read and delete persisted conversation history.
"""

from flask import Blueprint, request, jsonify
from sqlalchemy import or_

from database import db
from models.conversation import Conversation
from utils.auth import get_optional_user_id

history_bp = Blueprint("history", __name__)


@history_bp.route("/history", methods=["GET"])
def get_history():
    """
    Returns all conversations, most recent first.
    If a valid auth token is present, results are scoped to that user.
    Optional query params: session_id, search, limit, offset
    """
    session_id = request.args.get("session_id")
    search = request.args.get("search", "").strip()
    limit = request.args.get("limit", default=200, type=int)
    offset = request.args.get("offset", default=0, type=int)
    user_id = get_optional_user_id()

    query = Conversation.query
    if user_id is not None:
        query = query.filter(Conversation.user_id == user_id)

    if session_id:
        query = query.filter(Conversation.session_id == session_id)

    if search:
        like = f"%{search}%"
        query = query.filter(
            or_(Conversation.user_message.ilike(like), Conversation.ai_response.ilike(like))
        )

    query = query.order_by(Conversation.created_at.desc()).limit(limit).offset(offset)
    conversations = [c.to_dict() for c in query.all()]

    return jsonify({"success": True, "data": conversations, "count": len(conversations)}), 200


@history_bp.route("/history/<int:conversation_id>", methods=["DELETE"])
def delete_one(conversation_id):
    conversation = Conversation.query.get(conversation_id)
    if not conversation:
        return jsonify({"success": False, "error": "Conversation not found."}), 404

    user_id = get_optional_user_id()
    if user_id is not None and conversation.user_id != user_id:
        return jsonify({"success": False, "error": "Conversation not found."}), 404

    db.session.delete(conversation)
    db.session.commit()
    return jsonify({"success": True, "message": f"Conversation {conversation_id} deleted."}), 200


@history_bp.route("/history", methods=["DELETE"])
def delete_all():
    session_id = request.args.get("session_id")
    user_id = get_optional_user_id()

    query = Conversation.query
    if user_id is not None:
        query = query.filter(Conversation.user_id == user_id)
    if session_id:
        query = query.filter(Conversation.session_id == session_id)

    deleted = query.delete(synchronize_session=False)
    db.session.commit()
    return jsonify({"success": True, "message": f"Deleted {deleted} conversation(s)."}), 200
