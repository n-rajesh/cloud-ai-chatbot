import { AnimatePresence, motion } from "framer-motion";
import { X, Info, Github, Cpu } from "lucide-react";

export default function SettingsModal({ isOpen, onClose }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="settings-title"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            className="glass-panel w-full max-w-md p-6"
          >
            <div className="mb-5 flex items-center justify-between">
              <h3 id="settings-title" className="font-display text-lg font-semibold text-white">
                Settings
              </h3>
              <button
                onClick={onClose}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-white/5 hover:text-white"
                aria-label="Close settings"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex flex-col gap-4 text-sm">
              <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3">
                <Cpu size={16} className="mt-0.5 shrink-0 text-brand-cyan" />
                <div>
                  <p className="font-medium text-gray-200">AI Model</p>
                  <p className="text-xs text-gray-500">
                    Configured server-side via the <code className="text-brand-cyan">OPENAI_MODEL</code>{" "}
                    environment variable.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3">
                <Info size={16} className="mt-0.5 shrink-0 text-brand-purple" />
                <div>
                  <p className="font-medium text-gray-200">Data storage</p>
                  <p className="text-xs text-gray-500">
                    Conversations are stored in the backend database and can be cleared anytime from
                    the sidebar.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3">
                <Github size={16} className="mt-0.5 shrink-0 text-brand-pink" />
                <div>
                  <p className="font-medium text-gray-200">Cloud AI Chatbot</p>
                  <p className="text-xs text-gray-500">v1.0.0 — built with React, Flask &amp; OpenAI.</p>
                </div>
              </div>
            </div>

            <button onClick={onClose} className="btn-primary mt-6 w-full text-sm">
              Done
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
