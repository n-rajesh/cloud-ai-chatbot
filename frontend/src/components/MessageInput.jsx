import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { SendHorizontal, Square, Sparkles, Mic, MicOff } from "lucide-react";
import { useChat } from "../context/ChatContext.jsx";
import { charCount, wordCount } from "../utils/format.js";
import useVoiceInput from "../hooks/useVoiceInput.js";
import { useToast } from "../context/ToastContext.jsx";

const MAX_LENGTH = 8000;

export default function MessageInput() {
  const { sendMessage, isStreaming, stopStreaming } = useChat();
  const toast = useToast();
  const [value, setValue] = useState("");
  const textareaRef = useRef(null);

  const { isListening, isSupported: voiceSupported, toggleListening } = useVoiceInput({
    onResult: (transcript) => {
      setValue(transcript);
      requestAnimationFrame(() => {
        const el = textareaRef.current;
        if (el) {
          el.style.height = "auto";
          el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
        }
      });
    },
  });

  const handleInput = (e) => {
    setValue(e.target.value);
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
    }
  };

  const handleSend = () => {
    if (!value.trim() || isStreaming) return;
    sendMessage(value);
    setValue("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleMicClick = () => {
    if (!voiceSupported) {
      toast.warning("Voice input isn't supported in this browser. Try Chrome or Edge.");
      return;
    }
    toggleListening();
  };

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-6 z-20 flex justify-center px-4">
      <div className="pointer-events-auto w-full max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="gradient-border flex items-end gap-2 rounded-2xl p-2 shadow-glass backdrop-blur-2xl bg-bg-surface/80"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/5 text-brand-cyan">
            <Sparkles size={16} />
          </div>

          <label htmlFor="chat-input" className="sr-only">
            Message Cloud AI
          </label>
          <textarea
            id="chat-input"
            ref={textareaRef}
            value={value}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder={isListening ? "Listening…" : "Message Cloud AI... (Shift+Enter for a new line)"}
            rows={1}
            maxLength={MAX_LENGTH}
            className="max-h-[200px] flex-1 resize-none bg-transparent py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none"
          />

          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={handleMicClick}
            aria-label={isListening ? "Stop voice input" : "Start voice input"}
            aria-pressed={isListening}
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-all ${
              isListening
                ? "border-state-error/40 bg-state-error/10 text-state-error animate-pulse-glow"
                : "border-white/10 text-gray-400 hover:text-brand-cyan hover:border-brand-cyan/30"
            }`}
          >
            {isListening ? <MicOff size={16} /> : <Mic size={16} />}
          </motion.button>

          {isStreaming ? (
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={stopStreaming}
              aria-label="Stop generating"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-state-error/90 text-white shadow-glow-pink transition-transform hover:-translate-y-0.5"
            >
              <Square size={16} />
            </motion.button>
          ) : (
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={handleSend}
              disabled={!value.trim()}
              aria-label="Send message"
              className="btn-primary h-10 w-10 shrink-0 rounded-xl p-0"
            >
              <SendHorizontal size={16} />
            </motion.button>
          )}
        </motion.div>

        <div className="mt-1.5 flex justify-between px-2 text-[11px] text-gray-500">
          <span>{isListening ? "Speak now…" : "Press Enter to send, Shift+Enter for a new line"}</span>
          <span>
            {wordCount(value)} words · {charCount(value)}/{MAX_LENGTH}
          </span>
        </div>
      </div>
    </div>
  );
}
