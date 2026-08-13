import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, Code2, Lightbulb, FileText, ChevronDown } from "lucide-react";
import { useChat } from "../context/ChatContext.jsx";
import ChatBubble from "./ChatBubble.jsx";
import MessageInput from "./MessageInput.jsx";
import useAutoScroll from "../hooks/useAutoScroll.js";

const SUGGESTIONS = [
  { icon: Lightbulb, text: "Explain quantum computing simply" },
  { icon: Code2, text: "Write a Python function to reverse a string" },
  { icon: FileText, text: "Summarize the plot of a great sci-fi novel" },
  { icon: Sparkles, text: "Give me 5 creative startup ideas" },
];

function EmptyState({ onPick }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="flex h-full flex-col items-center justify-center gap-6 px-6 text-center"
    >
      <motion.div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-cyan to-brand-purple shadow-glow animate-float">
        <Sparkles size={28} className="text-bg-deep" />
      </motion.div>
      <div>
        <h2 className="text-gradient font-display text-2xl font-semibold">
          What can I help you build today?
        </h2>
        <p className="mt-2 text-sm text-gray-400">
          Ask anything — code, writing, ideas, or explanations.
        </p>
      </div>
      <div className="grid w-full max-w-lg grid-cols-1 gap-2 sm:grid-cols-2">
        {SUGGESTIONS.map(({ icon: Icon, text }, i) => (
          <motion.button
            key={text}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.06 }}
            whileHover={{ y: -3 }}
            onClick={() => onPick(text)}
            className="glass-panel glass-panel-hover flex items-center gap-2.5 rounded-xl px-4 py-3 text-left text-sm text-gray-300"
          >
            <Icon size={16} className="shrink-0 text-brand-cyan" />
            <span>{text}</span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}

export default function ChatWindow() {
  const { messages, sendMessage, regenerateLastResponse, isStreaming } = useChat();
  const { containerRef, bottomRef, showScrollButton, scrollToBottom } = useAutoScroll([
    messages.length,
    messages[messages.length - 1]?.content,
  ]);

  return (
    <div className="relative flex h-full flex-col">
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto px-4 py-6 pb-32 sm:px-8"
        id="chat-export-root"
      >
        {messages.length === 0 ? (
          <EmptyState onPick={(text) => sendMessage(text)} />
        ) : (
          <div className="mx-auto flex max-w-3xl flex-col gap-5">
            <AnimatePresence initial={false}>
              {messages.map((m, i) => (
                <ChatBubble
                  key={m.id}
                  index={i}
                  isLast={i === messages.length - 1}
                  onRegenerate={m.role === "assistant" && i === messages.length - 1 ? regenerateLastResponse : undefined}
                  {...m}
                />
              ))}
            </AnimatePresence>
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      <AnimatePresence>
        {showScrollButton && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            onClick={scrollToBottom}
            aria-label="Scroll to latest message"
            className="absolute bottom-28 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-white/10 bg-bg-surface/90 px-3.5 py-2 text-xs text-gray-300 shadow-glass backdrop-blur-xl hover:text-brand-cyan"
          >
            <ChevronDown size={14} /> New messages
          </motion.button>
        )}
      </AnimatePresence>

      <MessageInput />
    </div>
  );
}
