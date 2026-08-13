import { motion } from "framer-motion";
import ParticleCanvas from "./ParticleCanvas.jsx";

/**
 * Layered animated backdrop: aurora blobs + gradient mesh + animated grid +
 * particles + noise overlay. Purely decorative — aria-hidden.
 */
export default function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-bg-deep" aria-hidden="true">
      {/* Base gradient mesh */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 20% 10%, rgba(124,58,237,0.20), transparent 60%), radial-gradient(ellipse 70% 60% at 85% 20%, rgba(0,229,255,0.16), transparent 60%), radial-gradient(ellipse 70% 70% at 50% 100%, rgba(255,77,157,0.14), transparent 60%)",
        }}
      />

      {/* Aurora blobs */}
      <motion.div
        className="absolute -top-40 -left-40 h-[36rem] w-[36rem] rounded-full bg-brand-purple/30 blur-[120px] animate-aurora"
        style={{ willChange: "transform" }}
      />
      <motion.div
        className="absolute top-1/3 -right-40 h-[32rem] w-[32rem] rounded-full bg-brand-cyan/25 blur-[120px] animate-aurora"
        style={{ animationDelay: "3s", willChange: "transform" }}
      />
      <motion.div
        className="absolute -bottom-40 left-1/4 h-[30rem] w-[30rem] rounded-full bg-brand-pink/20 blur-[120px] animate-aurora"
        style={{ animationDelay: "6s", willChange: "transform" }}
      />

      {/* Animated grid */}
      <div className="absolute inset-0 bg-grid opacity-40 animate-grid-pan" />

      {/* Particles */}
      <ParticleCanvas />

      {/* Noise texture overlay */}
      <div className="absolute inset-0 bg-noise mix-blend-overlay" />

      {/* Vignette to keep content legible */}
      <div className="absolute inset-0 bg-gradient-to-b from-bg-deep/40 via-transparent to-bg-deep/70" />
    </div>
  );
}
