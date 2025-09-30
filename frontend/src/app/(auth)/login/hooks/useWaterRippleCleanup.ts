import { useEffect } from "react";

export function useWaterRippleCleanup() {
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const fx = document.querySelector<HTMLElement>(".waterfx");
    const ripple = fx?.querySelector<HTMLElement>(".ripple");

    if (!fx || !ripple) {
      return;
    }

    const handleAnimationEnd = (event: AnimationEvent) => {
      if (event.animationName !== "rippleWave") {
        return;
      }

      fx.classList.add("gone");
    };

    ripple.addEventListener("animationend", handleAnimationEnd);

    return () => {
      ripple.removeEventListener("animationend", handleAnimationEnd);
      fx.classList.remove("gone");
    };
  }, []);
}
