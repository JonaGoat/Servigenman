"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

/* eslint-disable @next/next/no-img-element */
const LOGO_SRC = "/logo-servigenman.svg";

const globalStyles = String.raw`
:root{
  --ocean-deep:#051a2c; --ocean-mid:#0a2e4a; --ocean-teal:#0b3e4a;
  --ink:#eaf2ff; --muted:#b9c8e6;
  --card:#0e2b49; --card-border:#1d456b;
  --field:#0d2742; --field-b:#1a3a5a;
  --btn-a:#6d78ff; --btn-b:#2ad1ff;
  --wave-a:#2ad1ff; --wave-b:#6d78ff;
  --shadow:0 24px 70px rgba(0,0,0,.55);
  --logo-y: 50%;
  --stage-size: 72%;
}

*{box-sizing:border-box}
html.servigenman-login-root,
body.servigenman-login{height:100%}
body.servigenman-login{
  margin:0; font-family:var(--font-inter),system-ui,-apple-system,Segoe UI,Roboto,Arial,Helvetica,sans-serif;
  color:var(--ink); min-height:100%;
  display:grid; place-items:center; padding:32px;
  background:
    radial-gradient(1200px 600px at 75% 90%, rgba(42,209,255,.10), transparent 60%),
    radial-gradient(1100px 520px at 20% 10%, rgba(123,92,255,.10), transparent 60%),
    linear-gradient(160deg, var(--ocean-deep) 0%, var(--ocean-mid) 60%, var(--ocean-teal) 100%);
  overflow:hidden;
}
body.servigenman-login::after{
  content:""; position:fixed; inset:0; pointer-events:none;
  background:
    radial-gradient(1000px 500px at 50% -10%, rgba(255,255,255,.04), transparent 60%),
    radial-gradient(2000px 900px at 50% 120%, rgba(0,0,0,.35), transparent 40%);
}
.noise{ position:fixed; inset:0; pointer-events:none; opacity:.07; mix-blend-mode:soft-light;
  background-image:url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" stitchTiles="stitch"/></filter><rect width="100%" height="100%" filter="url(%23n)"/></svg>');
  background-size:260px 260px;
}

.waves{ position:fixed; inset:0; pointer-events:none; overflow:hidden; }
svg.waves-svg{ position:absolute; inset:0; width:100%; height:100%; }
.wave{
  fill:none; stroke-linecap:round; stroke-width:2.6; opacity:.58;
  filter: drop-shadow(0 10px 22px rgba(42,209,255,.18));
  stroke-dasharray:4 12; animation: drift 28s linear infinite;
}
.wave.mid{ stroke-width:3; opacity:.64; animation-duration:36s; }
.wave.slow{ stroke-width:2.4; opacity:.5; animation-duration:46s; }
@keyframes drift{ to{ stroke-dashoffset:-900; } }

.circuit{ position:fixed; inset:0; pointer-events:none; opacity:.18; }
.circuit svg{ width:100%; height:100%; }
.trace{
  fill:none; stroke:rgba(170,210,255,.35); stroke-width:1.1;
  stroke-linecap:round; stroke-linejoin:round;
  stroke-dasharray:2 6; animation: flow 22s linear infinite;
  filter: drop-shadow(0 0 10px rgba(80,180,255,.12));
}
.node{ fill:rgba(130,200,255,.5); filter: drop-shadow(0 0 6px rgba(42,209,255,.45)); }
@keyframes flow{ to{ stroke-dashoffset:-500; } }

.card{
  width:min(520px, 92vw);
  background:var(--card); border:1px solid var(--card-border);
  border-radius:16px; box-shadow:var(--shadow);
  padding:24px 22px 14px; position:relative; z-index:1;
  display:flex; flex-direction:column;
}
.card::before{
  content:""; position:absolute; inset:-2px; border-radius:18px; z-index:-1;
  background: radial-gradient(60% 50% at 50% 0%, rgba(42,209,255,.22), transparent 60%);
  filter: blur(18px);
}
.brand{ display:flex; align-items:center; gap:10px; color:#d9e4ff; font-weight:800; letter-spacing:.3px; font-size:14px; margin-bottom:6px; }
.brand-logo{
  height:36px; width:36px; border-radius:10px; display:grid; place-items:center;
  background:linear-gradient(135deg,#7b5cff,#26c4ff);
  box-shadow:0 10px 22px rgba(38,196,255,.30);
}
.brand-logo svg{ display:block }
.title{ text-align:center; margin:6px 0 16px; font-size:26px; font-weight:800; letter-spacing:.2px; }
.form{ display:flex; flex-direction:column; gap:14px; }
.label{ font-size:13px; color:var(--muted); }
.field{
  width:100%; background:var(--field); border:1px solid var(--field-b);
  color:var(--ink); border-radius:12px; padding:12px 14px; outline:0; font-size:14px;
  box-shadow: inset 0 1px 0 rgba(255,255,255,.03);
}
.field:focus{ border-color:#3d79c7; box-shadow:0 0 0 3px rgba(61,121,199,.25); }
.row{ display:flex; justify-content:space-between; align-items:center; color:var(--muted); font-size:13px; margin-top:2px; }
.row a{ color:#cfe0ff; text-decoration:none; } .row a:hover{ text-decoration:underline; }
.btn{
  appearance:none; border:0; cursor:pointer; width:100%;
  padding:13px 16px; border-radius:12px; font-weight:700; color:#fff;
  background:linear-gradient(90deg, var(--btn-a), var(--btn-b));
  box-shadow:0 16px 40px rgba(42,209,255,.28), 0 2px 0 rgba(255,255,255,.08) inset;
  transition:filter .15s, transform .05s; margin-top:2px;
}
.btn:hover{ filter:brightness(1.05) } .btn:active{ transform:translateY(1px) }
.btn:disabled{ filter:saturate(.5); opacity:.65; cursor:not-allowed; }
.footnote{
  margin-top:auto; padding-top:10px; font-size:11px; color:#8ea8c9; opacity:.85;
  text-align:center; border-top:1px solid rgba(255,255,255,.06);
}
.footnote a{ color:#cfe0ff; text-decoration:none; } .footnote a:hover{ text-decoration:underline; }
@media (max-width:520px){ .card{ padding:20px 18px 12px } }

.feedback{
  border-radius:12px;
  padding:12px 14px;
  font-size:13px;
  line-height:1.45;
}
.feedback.error{
  background:rgba(255, 95, 95, 0.12);
  border:1px solid rgba(255, 120, 120, 0.4);
  color:#ffc8c8;
}
.feedback.success{
  background:rgba(60, 214, 171, 0.12);
  border:1px solid rgba(60, 214, 171, 0.4);
  color:#b6fbe6;
}

#splash{
  position:fixed; inset:0; z-index:4; display:grid; place-items:center;
  background: radial-gradient(1400px 800px at 50% 50%, rgba(24,60,110,.35), rgba(5,17,34,.92));
  transition: opacity .6s ease, visibility .6s ease;
}
#splash.hide{ opacity:0; visibility:hidden; pointer-events:none; }

.s-wrap{
  position:relative;
  width:min(640px, 90vw);
  aspect-ratio:1/1;
  border-radius:28px;
  overflow:hidden;
  background:
    radial-gradient(60% 55% at 50% 22%, rgba(140,170,230,.28), transparent 62%),
    linear-gradient(180deg, #1f3f66 0%, #0f2b49 64%, #09243d 100%);
  box-shadow:
    0 30px 80px rgba(0,0,0,.6),
    inset 0 1px 0 rgba(255,255,255,.05),
    inset 0 -20px 50px rgba(0,0,0,.25);
}

.s-title, .s-subtitle{
  position:absolute; left:50%; transform:translateX(-50%);
  margin:0; text-align:center; z-index:7;
}
.s-title{
  top:28px; font-weight:800; letter-spacing:.8px;
  font-size:clamp(22px, 4.2vmin, 30px);
  color:#eaf2ff; text-transform:uppercase;
  text-shadow:0 10px 40px rgba(0,0,0,.35), 0 0 30px rgba(120,160,255,.25);
}
.s-subtitle{
  bottom:28px; font-size:clamp(12px, 1.8vmin, 14px);
  color:#cfe0ff; opacity:.95;
}

.stage{
  position:absolute; left:50%; top:50%;
  width:var(--stage-size); aspect-ratio:1/1;
  transform:translate(-50%, -50%);
  z-index:2;
}

.stage .logo-full{
  position:absolute; inset:0; display:grid; place-items:center;
  background:transparent; box-shadow:none; border-radius:0;
  z-index:2;
  opacity:1;
  transition: opacity .22s ease;
}
#splash.split .stage .logo-full{
  opacity:0;
  transition-delay:.08s;
}
.stage .logo-full img{
  width:92%; height:92%; object-fit:contain; object-position:center; display:block;
}

.stage .split-wrap{ position:absolute; inset:0; z-index:3; display:none; pointer-events:none; }
.stage .bolt-layer, .stage .flash{ position:absolute; inset:0; z-index:6; pointer-events:none; }

.doors{
  position:absolute; inset:0; z-index:5; pointer-events:none;
  display:grid; grid-template-columns:1fr 1fr;
}
.door{
  background: linear-gradient(160deg, #071326, #0a1c33 70%);
  box-shadow: inset 0 0 60px rgba(0,0,0,.45);
  transition: transform .9s cubic-bezier(.2,.85,.3,1);
}
.split .door.left{ transform: translateX(-110%) }
.split .door.right{ transform: translateX(110%) }

.logo-half{
  position:absolute; top:0; height:100%;
  width:50.2%;
  background-repeat:no-repeat;
  background-size:200% 100%;
  transform:translateX(0);
  filter: drop-shadow(0 20px 60px rgba(0,0,0,.45));
  transition: transform .9s cubic-bezier(.2,.85,.3,1), opacity .5s ease-out;
}
.logo-half.left{
  left:-0.1%;
  background-position:left var(--logo-y);
}
.logo-half.right{
  left:49.9%;
  background-position:right var(--logo-y);
}
.split .logo-half.left{  transform:translateX(-72%) rotate(-1deg); }
.split .logo-half.right{ transform:translateX( 72%) rotate( 1deg); }

.buzz{ animation: buzz .5s linear 2; }
@keyframes buzz{
  0%{ transform: translate(0,0) }
  20%{ transform: translate(-2px,1px) skewX(.6deg) }
  40%{ transform: translate(2px,-1px) skewX(-.6deg) }
  60%{ transform: translate(-2px,-2px) }
  80%{ transform: translate(1px,2px) }
  100%{ transform: translate(0,0) }
}
.flash{ border-radius:22px; mix-blend-mode: screen; opacity:0; }
.flash.show{ animation: flash .35s ease-out forwards; }
@keyframes flash{ 0%{opacity:0} 25%{opacity:.95} 100%{opacity:0} }

.bolt{
  fill:none; stroke:#e8f7ff; stroke-width:3; filter: drop-shadow(0 0 12px #7fd8ff);
  stroke-dasharray:180; stroke-dashoffset:180;
  animation: draw .35s ease-out forwards, fade .45s .25s ease-out forwards;
}
@keyframes draw{ to{ stroke-dashoffset:0 } }
@keyframes fade{ to{ opacity:0 } }

.waterfx{ position:absolute; inset:0; pointer-events:none; z-index:5; }
.drop{
  position:absolute;
  left:50%; transform:translateX(-50%);
  top:-12%;
  width:34px; height:46px;
  filter: drop-shadow(0 10px 18px rgba(80,150,220,.35));
  animation: dropFall 1.1s cubic-bezier(.2,.9,.2,1) .28s forwards;
}
.ripple{
  position:absolute;
  left:50%; transform:translateX(-50%) translateY(-50%);
  top:46%;
  width:0; height:0; border-radius:50%;
  border:2px solid rgba(140,200,255,.55);
  opacity:0;
  animation: rippleWave 1.05s ease-out 1.38s forwards;
}
@keyframes dropFall{
  0%{ top:-12%; transform:translateX(-50%) scale(1); }
  85%{ top:46%;  transform:translateX(-50%) scale(1); }
  100%{ top:46%; transform:translateX(-50%) scaleX(1.10) scaleY(0.92); }
}
@keyframes rippleWave{
  0%{ opacity:.65; width:0; height:0; border-width:2px; }
  100%{ opacity:0;   width:120px; height:120px; border-width:1px; }
}
#splash.split .drop{ filter: drop-shadow(0 6px 12px rgba(80,150,220,.25)); }

.rays{
  position:fixed; inset:0;
  pointer-events:none; overflow:hidden;
  z-index:0;
  mix-blend-mode:screen;
}
.ray{
  position:absolute;
  top:-15%;
  height:130%;
  left:var(--x, 50%);
  width:var(--w, 12px);
  transform:translateX(-50%) rotate(var(--rot, 0deg));
  opacity:0;
  background:
    linear-gradient(180deg,
      transparent 0%,
      var(--ray-b, rgba(109,120,255,.28)) 18%,
      var(--ray-a, rgba(42,209,255,.40)) 50%,
      transparent 82%
    );
  box-shadow:
    0 0 22px rgba(90,190,255,.25),
    0 0 60px rgba(90,190,255,.18);
  animation:
    rayLife var(--dur, 2600ms) ease-in-out forwards,
    rayFlicker 1100ms linear infinite;
}
.ray::before{
  content:"";
  position:absolute; inset:0;
  left:50%; transform:translateX(-50%);
  width:40%;
  background:linear-gradient(180deg, transparent, rgba(255,255,255,.65), transparent);
  filter:blur(4px);
  opacity:.55;
}
@keyframes rayLife{
  0%{ opacity:0;   transform:translateX(-50%) translateY(4%)  rotate(var(--rot, 0deg)); }
  15%{ opacity:.62; transform:translateX(-50%) translateY(0%)  rotate(var(--rot, 0deg)); }
  75%{ opacity:.34; transform:translateX(-50%) translateY(-1%) rotate(var(--rot, 0deg)); }
  92%{ opacity:.18; transform:translateX(-50%) translateY(-2%) rotate(var(--rot, 0deg)); }
  100%{ opacity:0;   transform:translateX(-50%) translateY(-4%) rotate(var(--rot, 0deg)); }
}
@keyframes rayFlicker{
  0%,100%{ filter:brightness(1) }
  45%{ filter:brightness(1.05) }
  60%{ filter:brightness(0.95) }
}
@media (prefers-reduced-motion: reduce){
  .wave, .trace, .bolt, .buzz, .flash, .door, .logo-half, .sfx-grid, .sfx-sheen, .sfx-lines, .ray, .drop, .ripple{ animation:none!important; transition:none!important }
}
.sfx-grid{
  position:absolute; inset:0; pointer-events:none; opacity:.22;
  background:
    repeating-linear-gradient(
      0deg,
      rgba(160,195,240,.10) 0px,
      rgba(160,195,240,.10) 1px,
      transparent 1px,
      transparent 24px
    ),
    repeating-linear-gradient(
      90deg,
      rgba(160,195,240,.10) 0px,
      rgba(160,195,240,.10) 1px,
      transparent 1px,
      transparent 24px
    ),
    repeating-linear-gradient(
      0deg,
      rgba(180,210,255,.06) 0px,
      rgba(180,210,255,.06) 1px,
      transparent 1px,
      transparent 6px
    ),
    repeating-linear-gradient(
      90deg,
      rgba(180,210,255,.06) 0px,
      rgba(180,210,255,.06) 1px,
      transparent 1px,
      transparent 6px
    );
  animation: gridDrift 18s linear infinite;
  filter: drop-shadow(0 10px 30px rgba(0,0,0,.25));
}
@keyframes gridDrift{
  to{ background-position: 80px 40px, 40px 80px, 20px 10px, 10px 20px; }
}
#splash.split .sfx-grid{ opacity:.10; }

.sfx-sheen{
  position:absolute; inset:-12% -12%; pointer-events:none; opacity:.20;
  background:
    linear-gradient(60deg,
      rgba(255,255,255,0) 32%,
      rgba(255,255,255,.12) 50%,
      rgba(255,255,255,0) 68%);
  transform: translateX(-30%);
  animation: sheenMove 8s ease-in-out infinite;
  mix-blend-mode: screen;
}
@keyframes sheenMove{
  0%,100%{ transform: translateX(-30%) }
  50%    { transform: translateX(30%) }
}
#splash.split .sfx-sheen{ opacity:.08; }

.sfx-lines{
  position:absolute; inset:0; pointer-events:none; opacity:.18;
  filter: drop-shadow(0 8px 22px rgba(70,150,220,.18));
}
.sfx-lines .l{
  fill:none; stroke:url(#ln); stroke-width:1.2; stroke-linecap:round;
  stroke-dasharray:6 10; animation: lineDrift 22s linear infinite;
}
.sfx-lines .l2{ animation-duration: 28s; opacity:.9 }
.sfx-lines .l3{ animation-duration: 34s; opacity:.8 }
@keyframes lineDrift{ to{ stroke-dashoffset:-600 } }
#splash.split .sfx-lines{ opacity:.09; }

.waterfx.gone{ opacity:0; transition: opacity .28s ease; }
`;

type LoginSuccess = {
  message: string;
  user: {
    username: string;
    first_name: string;
    last_name: string;
    email: string;
  };
};

type LoginError = {
  error?: string;
};

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState<LoginSuccess | null>(null);

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    const bodyClass = "servigenman-login";
    const htmlClass = "servigenman-login-root";
    document.body.classList.add(bodyClass);
    document.documentElement.classList.add(htmlClass);

    return () => {
      document.body.classList.remove(bodyClass);
      document.documentElement.classList.remove(htmlClass);
    };
  }, []);

  const apiBaseUrl = useMemo(() => {
    const sanitizeBaseUrl = (url: string) => url.replace(/\/+$/, "");

    const envUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
    if (envUrl) {
      return sanitizeBaseUrl(envUrl);
    }

    if (typeof window === "undefined") {
      return "";
    }

    if (window.location.hostname === "localhost") {
      return sanitizeBaseUrl("http://localhost:8000");
    }

    const origin = window.location.origin ?? "";
    return origin ? sanitizeBaseUrl(origin) : "";
  }, []);

  const loginUrl = apiBaseUrl ? `${apiBaseUrl}/api/login/` : "/api/login/";

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const container = document.getElementById("rays");
    if (!container) {
      return;
    }

    const prefersReduceMotion =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReduceMotion) {
      return;
    }

    const MAX_AT_ONCE = 5;
    let active = 0;
    let run = true;
    let destroyed = false;
    let cooldownUntil = 0;
    const timeouts: number[] = [];

    const visibilityHandler = () => {
      run = !document.hidden;
    };

    document.addEventListener("visibilitychange", visibilityHandler);

    const spawnRay = () => {
      if (!run || destroyed || active >= MAX_AT_ONCE) {
        return;
      }

      active += 1;

      const el = document.createElement("span");
      el.className = "ray";

      const width = 6 + Math.random() * 18;
      const x = 6 + Math.random() * 88;
      const rotation = (Math.random() - 0.5) * 3.2;
      const duration = 2000 + Math.random() * 3000;

      el.style.setProperty("--w", `${width.toFixed(1)}px`);
      el.style.setProperty("--x", `${x.toFixed(1)}%`);
      el.style.setProperty("--rot", `${rotation.toFixed(2)}deg`);
      el.style.setProperty("--dur", `${duration.toFixed(0)}ms`);

      const handleAnimationEnd = (event: AnimationEvent) => {
        if (event.animationName !== "rayLife") {
          return;
        }

        el.removeEventListener("animationend", handleAnimationEnd);
        el.remove();
        active = Math.max(active - 1, 0);
        cooldownUntil = Date.now() + 220;
      };

      el.addEventListener("animationend", handleAnimationEnd);
      container.appendChild(el);
    };

    const scheduleNext = () => {
      if (destroyed) {
        return;
      }

      const next = 220 + Math.random() * 460;
      const timeoutId = window.setTimeout(() => {
        if (!destroyed && run && Date.now() >= cooldownUntil) {
          spawnRay();
        }
        scheduleNext();
      }, next);
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

    if (
      !splash ||
      !logoBox ||
      !img ||
      !boltLayer ||
      !flash ||
      !halfL ||
      !halfR ||
      !splitWrap
    ) {
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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const sanitizedUsername = username.trim();
    const hasPassword = password.trim().length > 0;

    if (!sanitizedUsername || !hasPassword) {
      setErrorMessage("Por favor ingresa tu usuario y contraseña.");
      setSuccess(null);
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setSuccess(null);

    try {
      const response = await fetch(loginUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ username: sanitizedUsername, password }),
      });

      let payload: LoginSuccess | LoginError | null = null;

      try {
        payload = await response.json();
      } catch {
        payload = null;
      }

      if (!response.ok) {
        const error =
          (payload as LoginError | null)?.error ??
          "No se pudo iniciar sesión. Verifica tus datos e inténtalo nuevamente.";
        setErrorMessage(error);
        return;
      }

      if (payload && "message" in payload) {
        setSuccess(payload as LoginSuccess);
      } else {
        setSuccess({
          message: "Inicio de sesión exitoso.",
          user: {
            username: sanitizedUsername,
            first_name: "",
            last_name: "",
            email: "",
          },
        });
      }
    } catch {
      setErrorMessage(
        "Ocurrió un error inesperado. Verifica tu conexión e inténtalo nuevamente."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style jsx global>{globalStyles}</style>

      <div className="waves" aria-hidden="true">
        <svg className="waves-svg" viewBox="0 0 1440 900" preserveAspectRatio="none">
          <defs>
            <linearGradient id="gA" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="var(--wave-a)" />
              <stop offset="100%" stopColor="var(--wave-b)" />
            </linearGradient>
            <linearGradient id="gB" x1="100%" y1="0%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="var(--wave-b)" />
              <stop offset="100%" stopColor="var(--wave-a)" />
            </linearGradient>
          </defs>
          <path
            className="wave slow"
            stroke="url(#gA)"
            d="M0,130 C180,110 300,85 520,95 C740,105 900,145 1080,135 C1260,125 1360,100 1440,110"
          />
          <path
            className="wave mid"
            stroke="url(#gB)"
            d="M0,450 C220,430 360,410 580,420 C800,430 980,470 1140,460 C1300,450 1380,420 1440,430"
          />
          <path
            className="wave"
            stroke="url(#gA)"
            d="M0,760 C200,740 340,740 560,740 C780,740 960,770 1120,760 C1280,750 1380,730 1440,740"
          />
        </svg>
      </div>

      <div className="circuit" aria-hidden="true">
        <svg viewBox="0 0 1440 900" preserveAspectRatio="none">
          <path className="trace" d="M80 160 H360 L520 260 H780 L980 200 H1320" />
          <circle className="node" cx="360" cy="160" r="3" />
          <circle className="node" cx="520" cy="260" r="3" />
          <circle className="node" cx="980" cy="200" r="3" />
          <path className="trace" d="M120 620 H400 L540 540 L740 560 L980 520 L1300 560" />
          <circle className="node" cx="400" cy="620" r="3" />
          <circle className="node" cx="740" cy="560" r="3" />
          <path className="trace" d="M100 360 L260 360 L420 300 L700 300 L860 360 L1120 340 L1340 380" />
          <circle className="node" cx="260" cy="360" r="3" />
          <circle className="node" cx="700" cy="300" r="3" />
          <circle className="node" cx="1120" cy="340" r="3" />
        </svg>
      </div>

      <div className="noise" aria-hidden="true" />

      <div className="rays" id="rays" aria-hidden="true" />

      <main className="card" role="main" aria-label="Formulario de inicio de sesión">
        <div className="brand">
          <div className="brand-logo" aria-hidden="true" title="Servigenman">
            <svg width="20" height="20" viewBox="0 0 64 64" fill="none">
              <circle cx="23" cy="40" r="8" fill="rgba(255,255,255,.15)" />
              <circle cx="23" cy="40" r="3" fill="#fff" />
              <rect x="31" y="35" width="10" height="10" rx="2" fill="rgba(255,255,255,.2)" />
              <path d="M40 10 L26 30 h9 l-3 14 16-20 h-9 l3-14z" fill="#fff" />
            </svg>
          </div>
          <span>SERVIGENMAN</span>
        </div>

        <h1 className="title">Login</h1>

        <form className="form" id="loginForm" onSubmit={handleSubmit} noValidate>
          <div>
            <label className="label" htmlFor="username">
              Usuario
            </label>
            <input
              className="field"
              type="text"
              id="username"
              name="username"
              placeholder="Nombre de usuario"
              autoComplete="username"
              required
              value={username}
              onChange={(event) => setUsername(event.target.value)}
            />
          </div>
          <div>
            <label className="label" htmlFor="password">
              Contraseña
            </label>
            <input
              className="field"
              type="password"
              id="password"
              name="password"
              placeholder="••••••••"
              autoComplete="current-password"
              required
              minLength={6}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>
          <div className="row">
            <label htmlFor="remember">
              <input type="checkbox" id="remember" style={{ accentColor: "#4b8ef7" }} /> Recordarme
            </label>
            <a href="#">¿Olvidaste tu contraseña?</a>
          </div>

          {errorMessage && (
            <p className="feedback error" role="alert">
              {errorMessage}
            </p>
          )}

          {success && (
            <div className="feedback success" role="status">
              <p>{success.message}</p>
              <p>
                Bienvenido, {success.user.first_name || success.user.username}.
              </p>
            </div>
          )}

          <button className="btn" type="submit" disabled={loading}>
            {loading ? "INGRESANDO..." : "INICIAR SESIÓN"}
          </button>
        </form>

        <div className="footnote">
          © 2025 Servigenman — Uso exclusivo del personal autorizado • Soporte:
          <a href="mailto:soporte@servigenman.cl"> soporte@servigenman.cl</a>
        </div>
      </main>

      <div id="splash" data-logo={LOGO_SRC}>
        <div className="s-wrap">
          <div className="doors">
            <div className="door left" />
            <div className="door right" />
          </div>

          <div className="sfx-grid" aria-hidden="true" />

          <div className="sfx-sheen" aria-hidden="true" />

          <svg
            className="sfx-lines"
            viewBox="0 0 600 600"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="ln" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="rgba(140,200,255,.45)" />
                <stop offset="1" stopColor="rgba(120,160,255,.45)" />
              </linearGradient>
            </defs>
            <path d="M-20,140 C120,120 280,180 620,140" className="l l1" />
            <path d="M-20,260 C100,240 300,300 620,260" className="l l2" />
            <path d="M-20,380 C140,360 280,420 620,380" className="l l3" />
          </svg>

          <h1 className="s-title">SERVIGENMAN</h1>

          <div className="stage" id="stage">
            <div className="logo-full buzz" id="logoBox">
              <img id="logoImg" src={LOGO_SRC} alt="SERVIGENMAN" />
            </div>

            <div className="split-wrap" id="splitWrap">
              <div className="logo-half left" id="halfL" />
              <div className="logo-half right" id="halfR" />
            </div>

            <div className="waterfx" aria-hidden="true">
              <svg className="drop" viewBox="0 0 24 32">
                <defs>
                  <linearGradient id="dropGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#c9ecff" />
                    <stop offset="60%" stopColor="#8fd0ff" />
                    <stop offset="100%" stopColor="#5ab3ef" />
                  </linearGradient>
                </defs>
                <path
                  d="M12 2 C8 10 4 14 4 20a8 8 0 0 0 16 0c0-6-4-10-8-18z"
                  fill="url(#dropGrad)"
                />
                <ellipse cx="10" cy="12" rx="3.8" ry="2" fill="rgba(255,255,255,.6)" />
              </svg>
              <div className="ripple" />
            </div>

            <svg className="bolt-layer" id="boltLayer" viewBox="0 0 600 600" />
            <div className="flash" id="flash" />
          </div>

          <p className="s-subtitle">Mantenimiento de Bombas y Servicios Eléctricos</p>
        </div>
      </div>
    </>
  );
}
