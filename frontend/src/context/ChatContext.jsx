import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { chatApi, historyApi } from "../services/api.js";
import { generateSessionId } from "../utils/format.js";
import useLocalStorage from "../hooks/useLocalStorage.js";
import { useToast } from "./ToastContext.jsx";

const ChatContext = createContext(null);

export function ChatProvider({ children }) {
  const toast = useToast();
  const [sessionId, setSessionId] = useLocalStorage("cloud-ai:session-id", generateSessionId());
  const [messages, setMessages] = useState([]); // current conversation thread
  const [historyRecords, setHistoryRecords] = useState([]); // all persisted conversations
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [isStreaming, setIsStreaming] = useState(false);
  const abortRef = useRef(null);

  const refreshHistory = useCallback(
    async (search = "") => {
      setIsLoadingHistory(true);
      try {
        const data = await historyApi.getAll({ search });
        setHistoryRecords(data);
      } catch (err) {
        toast.error(err.message);
      } finally {
        setIsLoadingHistory(false);
      }
    },
    [toast]
  );

  useEffect(() => {
    refreshHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startNewChat = useCallback(() => {
    const newId = generateSessionId();
    setSessionId(newId);
    setMessages([]);
  }, [setSessionId]);

  const loadConversationThread = useCallback((record) => {
    setSessionId(record.session_id);
    setMessages([
      { id: `${record.id}-u`, role: "user", content: record.user_message, timestamp: record.created_at },
      { id: `${record.id}-a`, role: "assistant", content: record.ai_response, timestamp: record.created_at },
    ]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sendMessage = useCallback(
    async (text) => {
      const trimmed = text.trim();
      if (!trimmed || isStreaming) return;

      const userMsg = {
        id: `local-${Date.now()}`,
        role: "user",
        content: trimmed,
        timestamp: new Date().toISOString(),
      };
      const assistantMsgId = `local-${Date.now() + 1}`;
      const assistantMsg = {
        id: assistantMsgId,
        role: "assistant",
        content: "",
        timestamp: new Date().toISOString(),
        streaming: true,
      };

      const historyForApi = messages.map((m) => ({ role: m.role, content: m.content }));
      setMessages((prev) => [...prev, userMsg, assistantMsg]);
      setIsStreaming(true);

      const controller = new AbortController();
      abortRef.current = controller;

      // Batch incoming tokens and flush at most once per animation frame instead
      // of on every single token — this is what was causing the re-render/scroll
      // jank during streaming (Markdown + syntax highlighting re-parsing the full
      // accumulated string dozens of times per second).
      let pendingText = "";
      let rafId = null;

      const flush = () => {
        if (pendingText) {
          const chunk = pendingText;
          pendingText = "";
          setMessages((prev) =>
            prev.map((m) => (m.id === assistantMsgId ? { ...m, content: m.content + chunk } : m))
          );
        }
        rafId = null;
      };

      await chatApi.stream({
        message: trimmed,
        sessionId,
        history: historyForApi,
        signal: controller.signal,
        onToken: (token) => {
          pendingText += token;
          if (rafId === null) {
            rafId = requestAnimationFrame(flush);
          }
        },
        onDone: () => {
          if (rafId !== null) cancelAnimationFrame(rafId);
          flush();
          setMessages((prev) =>
            prev.map((m) => (m.id === assistantMsgId ? { ...m, streaming: false } : m))
          );
          setIsStreaming(false);
          refreshHistory();
        },
        onError: (err) => {
          if (rafId !== null) cancelAnimationFrame(rafId);
          flush();
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsgId
                ? { ...m, streaming: false, content: m.content || "Sorry, something went wrong." }
                : m
            )
          );
          setIsStreaming(false);
          toast.error(err.message || "Failed to get a response from the AI.");
        },
      });
    },
    [messages, sessionId, isStreaming, refreshHistory, toast]
  );

  const regenerateLastResponse = useCallback(async () => {
    if (isStreaming || messages.length < 2) return;
    const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
    if (!lastUserMsg) return;
    // Drop the last assistant message (and anything after the last user message), then resend it.
    const lastUserIndex = messages.map((m) => m.id).lastIndexOf(lastUserMsg.id);
    setMessages((prev) => prev.slice(0, lastUserIndex));
    await sendMessage(lastUserMsg.content);
  }, [messages, isStreaming, sendMessage]);

  const stopStreaming = useCallback(() => {
    abortRef.current?.abort();
    setIsStreaming(false);
  }, []);

  const deleteConversation = useCallback(
    async (id) => {
      try {
        await historyApi.deleteOne(id);
        setHistoryRecords((prev) => prev.filter((r) => r.id !== id));
        toast.success("Conversation deleted.");
      } catch (err) {
        toast.error(err.message);
      }
    },
    [toast]
  );

  const clearAllHistory = useCallback(async () => {
    try {
      await historyApi.deleteAll();
      setHistoryRecords([]);
      setMessages([]);
      toast.success("All conversations cleared.");
    } catch (err) {
      toast.error(err.message);
    }
  }, [toast]);

  const value = {
    sessionId,
    messages,
    historyRecords,
    isLoadingHistory,
    isStreaming,
    sendMessage,
    regenerateLastResponse,
    stopStreaming,
    startNewChat,
    loadConversationThread,
    deleteConversation,
    clearAllHistory,
    refreshHistory,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used within a ChatProvider");
  return ctx;
}
