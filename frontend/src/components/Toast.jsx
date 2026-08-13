import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from "lucide-react";

const STYLES = {
  success: { icon: CheckCircle2, ring: "border-state-success/40", glow: "shadow-glow", color: "text-state-success" },
  error: { icon: XCircle, ring: "border-state-error/40", glow: "", color: "text-state-error" },
  warning: { icon: AlertTriangle, ring: "border-state-warning/40", glow: "", color: "text-state-warning" },
  info: { icon: Info, ring: "border-brand-cyan/40", glow: "shadow-glow", color: "text-brand-cyan" },
};

export default function Toast({ message, type = "info", onClose }) {
  const { icon: Icon, ring, glow, color } = STYLES[type] || STYLES.info;

  return (
    <motion.div
      role="status"
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 40, transition: { duration: 0.2 } }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`glass-panel pointer-events-auto flex items-center gap-3 border ${ring} ${glow} px-4 py-3 min-w-[260px] max-w-sm`}
    >
      <Icon size={18} className={color} />
      <p className="text-sm text-gray-200 flex-1">{message}</p>
      <button
        onClick={onClose}
        aria-label="Dismiss notification"
        className="text-gray-500 hover:text-white transition-colors"
      >
        <X size={16} />
      </button>
    </motion.div>
  );
}
