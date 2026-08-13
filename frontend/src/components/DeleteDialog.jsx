import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";

export default function DeleteDialog({ isOpen, title, description, onConfirm, onCancel }) {
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
          aria-labelledby="delete-dialog-title"
          onClick={onCancel}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            className="glass-panel w-full max-w-sm border border-state-error/20 p-6"
          >
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-state-error/10">
              <AlertTriangle size={20} className="text-state-error" />
            </div>
            <h3 id="delete-dialog-title" className="font-display text-base font-semibold text-white">
              {title}
            </h3>
            <p className="mt-1.5 text-sm text-gray-400">{description}</p>

            <div className="mt-6 flex justify-end gap-2">
              <button onClick={onCancel} className="btn-ghost text-sm">
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className="rounded-xl bg-state-error px-4 py-2.5 text-sm font-semibold text-white transition-all hover:brightness-110"
              >
                Delete
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
