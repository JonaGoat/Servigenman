import { useEffect } from "react";

const MAX_RAYS = 5;

export function useAnimatedRays() {
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const container = document.getElementById("rays");

    if (!container) {
      return;
    }

    const prefersReducedMotion =
      window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      return;
    }

    let active = 0;
    let run = true;
    let cooldownUntil = 0;
    let destroyed = false;
    const timeouts: number[] = [];

    const visibilityHandler = () => {
      run = !document.hidden;
    };

    document.addEventListener("visibilitychange", visibilityHandler);

    const spawnRay = () => {
      if (!run || active >= MAX_RAYS) {
        return;
      }

      active += 1;

      const el = document.createElement("span");
      el.className = "ray";

      const width = 6 + Math.random() * 18;
      const left = 6 + Math.random() * 88;
      const rotation = (Math.random() - 0.5) * 3.2;
      const duration = 2000 + Math.random() * 3000;

      el.style.setProperty("--w", `${width.toFixed(1)}px`);
      el.style.setProperty("--x", `${left.toFixed(1)}%`);
      el.style.setProperty("--rot", `${rotation.toFixed(2)}deg`);
      el.style.setProperty("--dur", `${duration.toFixed(0)}ms`);

      const handleAnimationEnd = (event: AnimationEvent) => {
        if (event.animationName !== "rayLife") {
          return;
        }

        el.removeEventListener("animationend", handleAnimationEnd);
        el.remove();
        active -= 1;
        cooldownUntil = Date.now() + 220;
      };

      el.addEventListener("animationend", handleAnimationEnd);
      container.appendChild(el);
    };

    const scheduleNext = () => {
      if (destroyed) {
        return;
      }

      const delay = 220 + Math.random() * 460;
      const timeoutId = window.setTimeout(() => {
        if (!destroyed && run && Date.now() >= cooldownUntil) {
          spawnRay();
        }
        scheduleNext();
      }, delay);

      timeouts.push(timeoutId);
    };

    scheduleNext();

    return () => {
      destroyed = true;
      timeouts.forEach((timeoutId) => window.clearTimeout(timeoutId));
      document.removeEventListener("visibilitychange", visibilityHandler);
      container.querySelectorAll(".ray").forEach((ray) => ray.remove());
    };
  }, []);
}
