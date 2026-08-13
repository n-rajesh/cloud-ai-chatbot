import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, Search, MessageSquare, Trash2, Settings2, Sparkles, X } from "lucide-react";
import { useChat } from "../context/ChatContext.jsx";
import useDebounce from "../hooks/useDebounce.js";
import { truncate, formatTimestamp } from "../utils/format.js";
import SkeletonLoader from "./SkeletonLoader.jsx";
import DeleteDialog from "./DeleteDialog.jsx";

export default function Sidebar({ isOpen, onClose, onOpenSettings }) {
  const {
    historyRecords,
    isLoadingHistory,
    startNewChat,
    loadConversationThread,
    deleteConversation,
    clearAllHistory,
    refreshHistory,
    sessionId,
  } = useChat();

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [pendingDelete, setPendingDelete] = useState(null); // { type: 'one'|'all', id? }

  useEffect(() => {
    refreshHistory(debouncedSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const confirmDelete = async () => {
    if (pendingDelete?.type === "one") {
      await deleteConversation(pendingDelete.id);
    } else if (pendingDelete?.type === "all") {
      await clearAllHistory();
    }
    setPendingDelete(null);
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{ x: isOpen ? 0 : "-100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 32 }}
        className="fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-white/5 bg-bg-surface/70 backdrop-blur-2xl lg:static lg:z-0 lg:translate-x-0 lg:flex"
        style={{ transform: undefined }}
      >
        <div className="flex items-center justify-between gap-2 px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-cyan to-brand-purple shadow-glow">
              <Sparkles size={16} className="text-bg-deep" />
            </div>
            <span className="font-display text-sm font-semibold tracking-wide text-white">
              Cloud AI
            </span>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-white/5 hover:text-white lg:hidden"
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-3">
          <motion.button
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
            onClick={startNewChat}
            className="btn-primary mb-3 w-full text-sm"
          >
            <Plus size={16} /> New Chat
          </motion.button>

          <div className="relative mb-3">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search conversations…"
              aria-label="Search conversations"
              className="w-full rounded-xl border border-white/10 bg-white/5 py-2 pl-9 pr-3 text-xs text-white placeholder:text-gray-500 focus:border-brand-cyan/50 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 pb-3">
          {isLoadingHistory ? (
            <SkeletonLoader count={6} />
          ) : historyRecords.length === 0 ? (
            <div className="mt-6 flex flex-col items-center gap-2 px-4 text-center">
              <MessageSquare size={22} className="text-gray-600" />
              <p className="text-xs text-gray-500">No conversations yet. Start chatting!</p>
            </div>
          ) : (
            <ul className="flex flex-col gap-1">
              <AnimatePresence initial={false}>
                {historyRecords.map((r) => (
                  <motion.li
                    key={r.id}
                    layout
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`group flex items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-white/5 ${
                      r.session_id === sessionId ? "bg-white/[0.06] border border-brand-cyan/20" : ""
                    }`}
                  >
                    <button
                      onClick={() => loadConversationThread(r)}
                      className="flex min-w-0 flex-1 flex-col text-left"
                    >
                      <span className="truncate text-xs font-medium text-gray-200">
                        {truncate(r.user_message, 42)}
                      </span>
                      <span className="text-[10px] text-gray-500">{formatTimestamp(r.created_at)}</span>
                    </button>
                    <button
                      onClick={() => setPendingDelete({ type: "one", id: r.id })}
                      className="shrink-0 rounded-lg p-1.5 text-gray-500 opacity-0 transition-opacity hover:bg-state-error/10 hover:text-state-error group-hover:opacity-100"
                      aria-label="Delete conversation"
                    >
                      <Trash2 size={13} />
                    </button>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          )}
        </div>

        <div className="flex flex-col gap-1 border-t border-white/5 px-3 py-3">
          {historyRecords.length > 0 && (
            <button
              onClick={() => setPendingDelete({ type: "all" })}
              className="btn-ghost w-full justify-start text-xs text-state-error/80 hover:text-state-error"
            >
              <Trash2 size={14} /> Clear all history
            </button>
          )}
          <button onClick={onOpenSettings} className="btn-ghost w-full justify-start text-xs">
            <Settings2 size={14} /> Settings
          </button>
        </div>
      </motion.aside>

      <DeleteDialog
        isOpen={!!pendingDelete}
        title={pendingDelete?.type === "all" ? "Clear all history?" : "Delete conversation?"}
        description={
          pendingDelete?.type === "all"
            ? "This will permanently delete every saved conversation. This action cannot be undone."
            : "This conversation will be permanently deleted. This action cannot be undone."
        }
        onCancel={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
      />
    </>
  );
}
