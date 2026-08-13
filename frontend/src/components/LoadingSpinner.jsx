export default function LoadingSpinner({ size = 24, className = "" }) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={`inline-block animate-spin rounded-full border-2 border-white/15 border-t-brand-cyan ${className}`}
      style={{ width: size, height: size }}
    />
  );
}
