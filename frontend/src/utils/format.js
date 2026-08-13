export function formatTimestamp(isoString) {
  if (!isoString) return "";
  const date = new Date(isoString);
  const now = new Date();
  const sameDay = date.toDateString() === now.toDateString();

  const time = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (sameDay) return time;

  const dateStr = date.toLocaleDateString([], { month: "short", day: "numeric" });
  return `${dateStr} · ${time}`;
}

export function wordCount(text = "") {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

export function charCount(text = "") {
  return text.length;
}

export function truncate(text = "", max = 48) {
  if (text.length <= max) return text;
  return `${text.slice(0, max).trimEnd()}…`;
}

export function downloadTextFile(filename, content, mime = "text/markdown") {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function conversationToMarkdown(messages, title = "Cloud AI Chatbot Conversation") {
  const lines = [`# ${title}`, ""];
  messages.forEach((m) => {
    const role = m.role === "user" ? "**You**" : "**Cloud AI**";
    lines.push(`${role} — ${formatTimestamp(m.timestamp)}`, "", m.content, "", "---", "");
  });
  return lines.join("\n");
}

export function generateSessionId() {
  return `session_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}
