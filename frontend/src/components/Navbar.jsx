import { motion } from "framer-motion";
import { Bot, Menu, Download, FileDown, Settings2 } from "lucide-react";
import { useChat } from "../context/ChatContext.jsx";
import { conversationToMarkdown, downloadTextFile } from "../utils/format.js";
import { useToast } from "../context/ToastContext.jsx";

export default function Navbar({ onToggleSidebar, onOpenSettings }) {
  const { messages, isStreaming } = useChat();
  const toast = useToast();

  const handleExportMarkdown = () => {
    if (messages.length === 0) {
      toast.warning("Start a conversation before exporting.");
      return;
    }
    const md = conversationToMarkdown(messages);
    downloadTextFile(`cloud-ai-chat-${Date.now()}.md`, md, "text/markdown");
    toast.success("Conversation exported as Markdown.");
  };

  const handleExportPDF = async () => {
    if (messages.length === 0) {
      toast.warning("Start a conversation before exporting.");
      return;
    }
    try {
      const html2pdf = (await import("html2pdf.js")).default;
      const el = document.getElementById("chat-export-root");
      html2pdf()
        .from(el)
        .set({
          margin: 10,
          filename: `cloud-ai-chat-${Date.now()}.pdf`,
          html2canvas: { backgroundColor: "#0F172A", scale: 2 },
        })
        .save();
      toast.success("Preparing PDF download…");
    } catch {
      toast.error("PDF export failed. Try the Markdown export instead.");
    }
  };

  return (
    <header className="flex items-center justify-between border-b border-white/5 px-4 py-3 sm:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="rounded-lg p-2 text-gray-400 hover:bg-white/5 hover:text-white lg:hidden"
          aria-label="Toggle sidebar"
        >
          <Menu size={20} />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-cyan to-brand-purple shadow-glow">
            <Bot size={18} className="text-bg-deep" />
            <motion.span
              className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-bg-deep ${
                isStreaming ? "bg-state-warning" : "bg-state-success"
              }`}
              animate={isStreaming ? { scale: [1, 1.3, 1] } : {}}
              transition={{ repeat: Infinity, duration: 1 }}
            />
          </div>
          <div>
            <h1 className="font-display text-sm font-semibold leading-tight text-white sm:text-base">
              Cloud AI Chatbot
            </h1>
            <p className="text-[11px] leading-tight text-gray-500">
              {isStreaming ? "Generating response…" : "Online · Ready to help"}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        <button
          onClick={handleExportMarkdown}
          className="btn-ghost hidden h-9 px-3 text-xs sm:flex"
          aria-label="Export conversation as Markdown"
        >
          <Download size={14} /> Markdown
        </button>
        <button
          onClick={handleExportPDF}
          className="btn-ghost hidden h-9 px-3 text-xs sm:flex"
          aria-label="Export conversation as PDF"
        >
          <FileDown size={14} /> PDF
        </button>
        <button
          onClick={onOpenSettings}
          className="rounded-lg p-2 text-gray-400 hover:bg-white/5 hover:text-white"
          aria-label="Open settings"
        >
          <Settings2 size={18} />
        </button>
      </div>
    </header>
  );
}
