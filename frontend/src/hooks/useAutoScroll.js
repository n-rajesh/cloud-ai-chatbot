import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Returns refs for the scrollable container and a bottom sentinel, plus a
 * `showScrollButton` flag and `scrollToBottom` action.
 *
 * Auto-scrolls only when the user is already near the bottom (so it doesn't
 * yank the view while someone is reading back through earlier messages),
 * and uses "auto" (instant) scroll behavior for streaming updates rather
 * than "smooth" — smooth-scrolling on every token was a big part of the
 * perceived lag during streaming.
 */
export default function useAutoScroll(deps = []) {
  const containerRef = useRef(null);
  const bottomRef = useRef(null);
  const isNearBottomRef = useRef(true);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const checkNearBottom = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const threshold = 120;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < threshold;
    isNearBottomRef.current = nearBottom;
    setShowScrollButton(!nearBottom);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener("scroll", checkNearBottom, { passive: true });
    return () => el.removeEventListener("scroll", checkNearBottom);
  }, [checkNearBottom]);

  useEffect(() => {
    if (isNearBottomRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: "auto", block: "end" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    isNearBottomRef.current = true;
    setShowScrollButton(false);
  }, []);

  return { containerRef, bottomRef, showScrollButton, scrollToBottom };
}
