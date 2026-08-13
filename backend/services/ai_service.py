"""
services/ai_service.py
Thin wrapper around the OpenAI (or any OpenAI-compatible) Chat Completions API.
Keeps API-key handling and prompt construction out of the route layer.
"""

import os
from openai import OpenAI

SYSTEM_PROMPT = (
    "You are Cloud AI, a helpful, concise, and friendly AI assistant embedded in a "
    "web chat application. Format answers using Markdown, and use fenced code blocks "
    "with a language tag for any code you provide."
)


class AIService:
    def __init__(self):
        api_key = os.getenv("OPENAI_API_KEY")
        base_url = os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1")
        self.model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

        if not api_key:
            # Defer the hard failure until a request actually needs the client,
            # so the server can still boot (e.g. for local frontend dev) without a key.
            self.client = None
        else:
            self.client = OpenAI(api_key=api_key, base_url=base_url)

    def _ensure_client(self):
        if self.client is None:
            raise RuntimeError(
                "OPENAI_API_KEY is not configured on the server. "
                "Add it to your .env file (see .env.example)."
            )

    def _build_messages(self, message, history):
        messages = [{"role": "system", "content": SYSTEM_PROMPT}]
        for turn in history[-20:]:  # cap context window sent from client
            role = turn.get("role")
            content = turn.get("content")
            if role in ("user", "assistant") and isinstance(content, str) and content.strip():
                messages.append({"role": role, "content": content})
        messages.append({"role": "user", "content": message})
        return messages

    def get_response(self, message, history=None):
        """Non-streaming completion. Returns the full response text."""
        self._ensure_client()
        history = history or []
        messages = self._build_messages(message, history)

        completion = self.client.chat.completions.create(
            model=self.model,
            messages=messages,
            temperature=0.7,
            max_tokens=1500,
        )
        return completion.choices[0].message.content

    def stream_response(self, message, history=None):
        """Streaming completion. Yields text chunks as they arrive."""
        self._ensure_client()
        history = history or []
        messages = self._build_messages(message, history)

        stream = self.client.chat.completions.create(
            model=self.model,
            messages=messages,
            temperature=0.7,
            max_tokens=1500,
            stream=True,
        )
        for chunk in stream:
            delta = chunk.choices[0].delta
            if delta and delta.content:
                yield delta.content


ai_service = AIService()
