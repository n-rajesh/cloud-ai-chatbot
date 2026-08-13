# ⚡ Cloud AI Chatbot

A production-ready, futuristic AI chat application — a React + Flask stack with
streaming responses, persistent chat history, glassmorphism UI, and one-click
deployment to Vercel (frontend) and Render (backend).

![status](https://img.shields.io/badge/status-ready--for--deployment-00E5FF)
![license](https://img.shields.io/badge/license-MIT-7C3AED)

---

## ✨ Features

**Chat experience**
- Real-time streaming AI responses (Server-Sent Events)
- Markdown rendering with syntax-highlighted, copyable code blocks
- Animated typing indicator, message, and bubble transitions
- Auto-scroll, timestamps, word/character counters
- Export a conversation as Markdown or PDF
- **Voice input** — speak your message using the mic button (browser Speech Recognition)
- **Voice output** — click the speaker icon on any AI reply to have it read aloud
- Centered, floating chat input bar docked at the bottom of the screen

**Accounts**
- Email/username + password registration and login (JWT-based)
- Per-user chat history — each account only sees its own conversations
- Protected routes: the chat UI requires login; guests are redirected to `/login`

**History & data**
- Every exchange persisted to a SQLite database via SQLAlchemy
- Search, load, delete individual conversations, or clear all history
- Session-based conversation threading, scoped per logged-in user

**Interface**
- Glassmorphic, gradient-bordered "modern AI SaaS" design system
- Animated aurora backdrop, moving grid, canvas particle field, noise overlay
- Framer Motion throughout: page transitions, stagger reveals, hover lift,
  glow pulses, smooth modals — tuned to 200–500ms, reduced-motion aware
- Fully responsive dashboard layout (collapsible sidebar on mobile)
- Keyboard-navigable, ARIA-labeled, visible focus states

**Engineering**
- Modular Flask backend (blueprints, services, validators, centralized error
  handling, structured logging)
- React with functional components, Context API, custom hooks, lazy loading,
  and an error boundary
- Clean separation of concerns end to end

---

## 📸 Screenshots

> Add screenshots or a screen recording of the app here after your first run,
> e.g. `docs/screenshot-chat.png`, `docs/screenshot-history.png`.

---

## 🗂️ Folder Structure

```
cloud-ai-chatbot/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/       # Navbar, Sidebar, ChatWindow, ChatBubble, etc.
│   │   ├── pages/            # ChatPage, NotFoundPage
│   │   ├── hooks/            # useDebounce, useAutoScroll, useLocalStorage
│   │   ├── services/         # api.js (Axios + streaming fetch client)
│   │   ├── context/          # ChatContext, ToastContext
│   │   ├── animations/       # Framer Motion variants
│   │   ├── utils/            # formatting/export helpers
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── vercel.json
│
├── backend/
│   ├── app.py                # App factory & entrypoint
│   ├── database.py           # SQLAlchemy instance
│   ├── models/
│   │   └── conversation.py
│   ├── routes/
│   │   ├── chat.py           # POST /api/chat, /api/chat/stream
│   │   ├── history.py        # GET/DELETE /api/history
│   │   └── health.py
│   ├── services/
│   │   └── ai_service.py     # OpenAI-compatible client wrapper
│   ├── utils/
│   │   ├── validators.py
│   │   └── logger.py
│   ├── requirements.txt
│   ├── .env.example
│   └── render.yaml
│
├── README.md
└── .gitignore
```

---

## 🚀 Installation

### Prerequisites
- Node.js 18+
- Python 3.10+
- An OpenAI API key (or any OpenAI-compatible endpoint)

### 1. Clone and enter the project
```bash
git clone <your-repo-url>
cd cloud-ai-chatbot
```

### 2. Backend setup
```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# then edit .env and add your OPENAI_API_KEY
```

### 3. Frontend setup
```bash
cd ../frontend
npm install
cp .env.example .env
# VITE_API_BASE_URL defaults to http://localhost:5000/api
```

---

## 🔑 Environment Variables

### Backend (`backend/.env`)
| Variable          | Description                                   | Default                     |
|-------------------|------------------------------------------------|------------------------------|
| `OPENAI_API_KEY`  | Your OpenAI (or compatible) API key            | — (required)                 |
| `OPENAI_BASE_URL` | API base URL                                   | `https://api.openai.com/v1` |
| `OPENAI_MODEL`    | Model name                                     | `gpt-4o-mini`                |
| `SECRET_KEY`      | Flask secret key                               | `dev-secret-key`             |
| `PORT`            | Server port                                    | `5000`                       |
| `ALLOWED_ORIGINS` | Comma-separated CORS origins                   | `http://localhost:5173`      |
| `DATABASE_URL`    | SQLAlchemy database URI                        | `sqlite:///chatbot.db`       |

### Frontend (`frontend/.env`)
| Variable              | Description                | Default                        |
|------------------------|-----------------------------|----------------------------------|
| `VITE_API_BASE_URL`   | Backend API base URL       | `http://localhost:5000/api`     |

---

## 🖥️ Running Locally

**Terminal 1 — backend**
```bash
cd backend
source venv/bin/activate
python app.py
# Server running at http://localhost:5000
```

**Terminal 2 — frontend**
```bash
cd frontend
npm run dev
# App running at http://localhost:5173
```

Open `http://localhost:5173` in your browser.

---

## 📡 API Documentation

Base path: `/api`

| Method | Endpoint             | Description                                   |
|--------|-----------------------|------------------------------------------------|
| POST   | `/chat`               | Send a message, get the full AI response back |
| POST   | `/chat/stream`        | Same as above, streamed via SSE                |
| GET    | `/history`            | List conversations (`search`, `session_id`, `limit`, `offset` query params) |
| DELETE | `/history/:id`        | Delete one conversation                        |
| DELETE | `/history`            | Delete all conversations (optionally scoped by `session_id`) |
| GET    | `/health`             | Liveness check                                 |

**POST `/api/chat` request body**
```json
{
  "message": "Explain recursion in one paragraph",
  "session_id": "session_abc123",
  "history": [{ "role": "user", "content": "..." }]
}
```

**Response**
```json
{
  "success": true,
  "data": {
    "id": 12,
    "session_id": "session_abc123",
    "user_message": "Explain recursion in one paragraph",
    "ai_response": "Recursion is...",
    "created_at": "2026-08-06T10:15:00+00:00"
  }
}
```

---

## ☁️ Deployment Guide

### Backend → Render
1. Push this repo to GitHub.
2. In Render, create a **New Web Service** and point it at `backend/` (or use
   the included `backend/render.yaml` as a Blueprint).
3. Set the environment variables listed above (`OPENAI_API_KEY` at minimum).
4. Render will run `pip install -r requirements.txt` and start the app with
   `gunicorn app:app`.
5. Note your deployed backend URL, e.g. `https://cloud-ai-chatbot-backend.onrender.com`.

### Frontend → Vercel
1. Import the repo into Vercel, set the root directory to `frontend/`.
2. Vercel auto-detects Vite (`vercel.json` is included for SPA rewrites).
3. Add the environment variable `VITE_API_BASE_URL` pointing at your Render
   backend, e.g. `https://cloud-ai-chatbot-backend.onrender.com/api`.
4. Deploy. Update the backend's `ALLOWED_ORIGINS` env var to include your
   Vercel domain.

---

## 🧰 Technology Stack

**Frontend:** React 19, Vite, Tailwind CSS, React Router, Axios, Framer Motion,
Lucide React, React Markdown, React Syntax Highlighter

**Backend:** Python, Flask, Flask-CORS, SQLAlchemy, SQLite, Gunicorn

**AI:** OpenAI API (or any OpenAI-compatible endpoint)

**Deployment:** Vercel (frontend), Render (backend)

---

## 🔮 Future Enhancements

- User authentication and per-user chat history
- Multi-model selector (switch models from the UI)
- Voice input/output
- Shareable conversation links
- File/image uploads and multimodal responses
- Dark/light theme toggle
- Rate limiting and usage analytics dashboard

---

## 📄 License

MIT License — free to use, modify, and distribute.
