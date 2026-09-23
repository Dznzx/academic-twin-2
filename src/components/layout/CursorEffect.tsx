"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function CursorEffect() {
  const pathname = usePathname();
  const isLandingPage = pathname === "/";

  useEffect(() => {
    if (!isLandingPage) return;
    const dot = document.createElement("div");
    dot.style.cssText = "position:fixed;width:8px;height:8px;border-radius:50%;background:#5b7fff;pointer-events:none;z-index:99999;transform:translate(-50%,-50%);transition:width .15s,height .15s,opacity .15s;mix-blend-mode:screen;will-change:left,top;";

    const ring = document.createElement("div");
    ring.style.cssText = "position:fixed;width:38px;height:38px;border-radius:50%;border:1.5px solid rgba(91,127,255,.5);pointer-events:none;z-index:99998;transform:translate(-50%,-50%);transition:width .25s,height .25s,border-color .25s;will-change:left,top;";

    document.body.appendChild(dot);
    document.body.appendChild(ring);
    document.body.style.cursor = "none";

    let mx = -100, my = -100, rx = -100, ry = -100, rafId: number;

    const onMove = (e: MouseEvent) => {
      mx = e.clientX; my = e.clientY;
      dot.style.left = mx + "px";
      dot.style.top = my + "px";
    };

    const animate = () => {
      rx += (mx - rx) * 0.1;
      ry += (my - ry) * 0.1;
      ring.style.left = rx + "px";
      ring.style.top = ry + "px";
      rafId = requestAnimationFrame(animate);
    };
    animate();

    document.addEventListener("mousemove", onMove);

    const onEnter = () => {
      dot.style.width = "12px";
      dot.style.height = "12px";
      dot.style.opacity = "0.6";
      ring.style.width = "54px";
      ring.style.height = "54px";
      ring.style.borderColor = "rgba(91,127,255,.8)";
    };
    const onLeave = () => {
      dot.style.width = "8px";
      dot.style.height = "8px";
      dot.style.opacity = "1";
      ring.style.width = "38px";
      ring.style.height = "38px";
      ring.style.borderColor = "rgba(91,127,255,.5)";
    };

    const attach = () => {
      document.querySelectorAll("a,button,[data-hover]").forEach(el => {
        el.addEventListener("mouseenter", onEnter);
        el.addEventListener("mouseleave", onLeave);
      });
    };
    attach();
    const obs = new MutationObserver(attach);
    obs.observe(document.body, { childList: true, subtree: true });

    return () => {
      document.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(rafId);
      document.body.style.cursor = "";
      dot.remove();
      ring.remove();
      obs.disconnect();
    };
  }, [isLandingPage]);

  return null;
}
