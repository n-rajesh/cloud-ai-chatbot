import { useState, memo } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Bot, User, Copy, Check, Volume2, VolumeX, RefreshCw } from "lucide-react";
import useVoiceOutput from "../hooks/useVoiceOutput.js";
import { formatTimestamp } from "../utils/format.js";
import TypingIndicator from "./TypingIndicator.jsx";

function CodeBlock({ inline, className, children }) {
  const [copied, setCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || "");
  const code = String(children).replace(/\n$/, "");

  if (inline) {
    return (
      <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[0.85em] text-brand-cyan">
        {children}
      </code>
    );
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="group relative my-3 overflow-hidden rounded-xl border border-white/10">
      <div className="flex items-center justify-between bg-white/5 px-3 py-1.5">
        <span className="text-xs font-mono text-gray-400">{match?.[1] || "text"}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-brand-cyan transition-colors"
          aria-label="Copy code"
        >
          {copied ? <Check size={13} /> : <Copy size={13} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <SyntaxHighlighter
        language={match?.[1] || "text"}
        style={oneDark}
        customStyle={{ margin: 0, background: "#0b1220", fontSize: "0.85rem", padding: "1rem" }}
        wrapLongLines
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}

function ChatBubble({ role, content, timestamp, streaming, index = 0, onRegenerate }) {
  const isUser = role === "user";
  const { speak, stop, isSpeaking, isSupported: voiceOutputSupported } = useVoiceOutput();
  const [messageCopied, setMessageCopied] = useState(false);

  const handleToggleSpeak = () => {
    if (isSpeaking) stop();
    else speak(content);
  };

  const handleCopyMessage = async () => {
    await navigator.clipboard.writeText(content);
    setMessageCopied(true);
    setTimeout(() => setMessageCopied(false), 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.03, 0.2), ease: "easeOut" }}
      className={`flex w-full gap-3 ${isUser ? "justify-end" : "justify-start"}`}
    >
      {!isUser && (
        <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-cyan to-brand-purple shadow-glow">
          <Bot size={16} className="text-bg-deep" />
        </div>
      )}

      <div className={`group flex max-w-[80%] flex-col ${isUser ? "items-end" : "items-start"}`}>
        <div
          className={
            isUser
              ? "gradient-border rounded-2xl rounded-tr-sm px-4 py-3 bg-gradient-to-br from-brand-purple/25 to-brand-cyan/10"
              : "glass-panel rounded-2xl rounded-tl-sm px-4 py-3"
          }
        >
          {streaming && !content ? (
            <TypingIndicator />
          ) : (
            <div className="prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-transparent prose-pre:p-0">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code: CodeBlock,
                  a: (props) => (
                    <a
                      {...props}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-cyan underline underline-offset-2 hover:text-brand-pink"
                    />
                  ),
                }}
              >
                {content}
              </ReactMarkdown>
              {streaming && content && (
                <span className="ml-0.5 inline-block h-4 w-1.5 animate-pulse bg-brand-cyan align-middle" />
              )}
            </div>
          )}
        </div>

        <div className="mt-1 flex items-center gap-2 px-1">
          {timestamp && <span className="text-[11px] text-gray-500">{formatTimestamp(timestamp)}</span>}

          {!streaming && content && (
            <button
              onClick={handleCopyMessage}
              aria-label="Copy message"
              className="text-gray-500 opacity-0 transition-opacity hover:text-brand-cyan group-hover:opacity-100"
            >
              {messageCopied ? <Check size={12} /> : <Copy size={12} />}
            </button>
          )}

          {!isUser && !streaming && content && voiceOutputSupported && (
            <button
              onClick={handleToggleSpeak}
              aria-label={isSpeaking ? "Stop reading aloud" : "Read message aloud"}
              className="text-gray-500 hover:text-brand-cyan transition-colors"
            >
              {isSpeaking ? <VolumeX size={12} /> : <Volume2 size={12} />}
            </button>
          )}

          {!isUser && !streaming && content && onRegenerate && (
            <button
              onClick={onRegenerate}
              aria-label="Regenerate response"
              className="flex items-center gap-1 text-gray-500 opacity-0 transition-opacity hover:text-brand-cyan group-hover:opacity-100"
            >
              <RefreshCw size={12} /> Regenerate
            </button>
          )}
        </div>
      </div>

      {isUser && (
        <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 border border-white/10">
          <User size={16} className="text-gray-300" />
        </div>
      )}
    </motion.div>
  );
}

// Memoized so earlier, unchanged messages in the list don't re-render on
// every token of a streaming response — a big contributor to scroll lag.
export default memo(ChatBubble);
