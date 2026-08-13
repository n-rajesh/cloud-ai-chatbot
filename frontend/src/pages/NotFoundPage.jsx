import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Ghost } from "lucide-react";
import { pageTransition } from "../animations/variants.js";

export default function NotFoundPage() {
  return (
    <motion.div
      {...pageTransition}
      className="flex h-screen w-full flex-col items-center justify-center gap-4 px-6 text-center"
    >
      <Ghost size={40} className="text-brand-cyan animate-float" />
      <h1 className="text-gradient font-display text-3xl font-bold">404</h1>
      <p className="text-sm text-gray-400">This page drifted off into the cloud.</p>
      <Link to="/" className="btn-primary text-sm">
        Back to chat
      </Link>
    </motion.div>
  );
}
