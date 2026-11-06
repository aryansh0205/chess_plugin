// apps/web/src/embed/RelmesEmbedScrollSync.tsx
import { useEffect } from "react";

const RELMES_EMBED_SCROLL = "relmes:embed:scroll";
const THRESHOLD = 12; // px of movement before reporting a change
const TOP_LOCK = 8;   // near the top always reports "up"

export function RelmesEmbedScrollSync() {
  useEffect(() => {
    if (window.parent === window) return;
    const last = new WeakMap<object, number>();
    let acc = 0;
    let sent: "up" | "down" | null = null;

    const send = (direction: "up" | "down") => {
      if (direction === sent) return;
      sent = direction;
      window.parent.postMessage(
        { type: RELMES_EMBED_SCROLL, payload: { direction } },
        "*",
      );
    };

    const onScroll = (e: Event) => {
      const t = e.target;
      const el = t instanceof Element ? t : document.scrollingElement;
      if (!el) return;
      const top = el.scrollTop;
      const prev = last.get(el);
      last.set(el, top);
      if (top <= TOP_LOCK) { acc = 0; send("up"); return; }
      if (prev === undefined) return;
      const delta = top - prev;
      if (delta === 0) return;
      if (Math.sign(delta) !== Math.sign(acc)) acc = 0;
      acc += delta;
      if (acc >= THRESHOLD) send("down");
      else if (acc <= -THRESHOLD) send("up");
    };

    document.addEventListener("scroll", onScroll, { capture: true, passive: true });
    return () => document.removeEventListener("scroll", onScroll, true);
  }, []);
  return null;
}
