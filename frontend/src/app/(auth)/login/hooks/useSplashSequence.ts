import { useEffect } from "react";

import { LOGO_SRC } from "../constants";

export function useSplashSequence() {
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const splash = document.getElementById("splash");
    const logoBox = document.getElementById("logoBox");
    const img = document.getElementById("logoImg") as HTMLImageElement | null;
    const boltLayer = document.getElementById("boltLayer");
    const flash = document.getElementById("flash");
    const halfL = document.getElementById("halfL");
    const halfR = document.getElementById("halfR");
    const splitWrap = document.getElementById("splitWrap");

    if (!splash || !logoBox || !img || !boltLayer || !flash || !halfL || !halfR || !splitWrap) {
      return;
    }

    const logoSrc = splash.dataset.logo || LOGO_SRC;
    const timers: number[] = [];
    let started = false;

    const setupHalves = (url: string) => {
      halfL.style.backgroundImage = `url("${url}")`;
      halfR.style.backgroundImage = `url("${url}")`;
      halfL.style.backgroundRepeat = "no-repeat";
      halfR.style.backgroundRepeat = "no-repeat";
      halfL.style.backgroundSize = "200% 100%";
      halfR.style.backgroundSize = "200% 100%";
      halfL.style.backgroundPosition = `left var(--logo-y)`;
      halfR.style.backgroundPosition = `right var(--logo-y)`;
    };

    const spawnBolt = () => {
      const width = 600;
      const height = 600;
      const cx = width / 2 + (Math.random() * 80 - 40);
      const cy = height / 2 + (Math.random() * 60 - 30);
      const len = 160 + Math.random() * 120;
      const steps = 6 + Math.floor(Math.random() * 4);
      let x = cx;
      let y = cy;
      const points: Array<[number, number]> = [[x, y]];

      for (let i = 0; i < steps; i += 1) {
        x += Math.random() * 60 - 30;
        y += (len / steps) * (0.7 + Math.random() * 0.6);
        points.push([x, y]);
      }

      const poly = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
      poly.setAttribute("points", points.map((p) => p.join(",")).join(" "));
      poly.setAttribute("class", "bolt");
      boltLayer.appendChild(poly);
      poly.addEventListener("animationend", () => {
        poly.remove();
      });
    };

    const flashOnce = () => {
      flash.classList.remove("show");
      void flash.offsetWidth;
      flash.classList.add("show");
    };

    const schedule = (fn: () => void, delay: number) => {
      const id = window.setTimeout(() => {
        fn();
      }, delay);
      timers.push(id);
    };

    const startSequence = () => {
      if (started) {
        return;
      }
      started = true;

      splitWrap.style.display = "block";
      halfL.style.transform = "translateX(0)";
      halfR.style.transform = "translateX(0)";

      const START_DELAY = 40;
      const OPEN_ANIM = 900;
      const OPEN_HOLD = 450;
      const CLOSE_ANIM = 900;
      const AFTER_CLOSE = 280;

      schedule(() => {
        flashOnce();
        for (let i = 0; i < 3; i += 1) {
          schedule(spawnBolt, i * 90);
        }
        splash.classList.add("split");
      }, START_DELAY);

      schedule(() => {
        flashOnce();
        for (let i = 0; i < 2; i += 1) {
          schedule(spawnBolt, i * 90);
        }
      }, START_DELAY + 260);

      schedule(() => {
        splash.classList.remove("split");
        flashOnce();
        for (let i = 0; i < 2; i += 1) {
          schedule(spawnBolt, i * 80);
        }
      }, START_DELAY + OPEN_ANIM + OPEN_HOLD);

      schedule(() => {
        splash.classList.add("hide");
      }, START_DELAY + OPEN_ANIM + OPEN_HOLD + CLOSE_ANIM + AFTER_CLOSE);
    };

    const handleLoad = () => {
      setupHalves(logoSrc);
      startSequence();
    };

    const handleError = () => {
      setupHalves(logoSrc);
      startSequence();
    };

    if (img.getAttribute("src") !== logoSrc) {
      img.setAttribute("src", logoSrc);
    }

    img.addEventListener("load", handleLoad);
    img.addEventListener("error", handleError);

    if (img.complete) {
      handleLoad();
    }

    const failsafeId = window.setTimeout(() => {
      if (!started) {
        setupHalves(logoSrc);
        startSequence();
      }
    }, 1200);
    timers.push(failsafeId);

    return () => {
      timers.forEach((id) => window.clearTimeout(id));
      img.removeEventListener("load", handleLoad);
      img.removeEventListener("error", handleError);
      boltLayer.innerHTML = "";
      splash.classList.add("hide");
    };
  }, []);
}
