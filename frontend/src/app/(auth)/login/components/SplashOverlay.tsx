/* eslint-disable @next/next/no-img-element */

import { LOGO_SRC } from "../constants";

export function SplashOverlay() {
  return (
    <div id="splash" data-logo={LOGO_SRC}>
      <div className="s-wrap">
        <div className="doors">
          <div className="door left" />
          <div className="door right" />
        </div>

        <div className="sfx-grid" aria-hidden="true" />

        <div className="sfx-sheen" aria-hidden="true" />

        <svg className="sfx-lines" viewBox="0 0 600 600" preserveAspectRatio="none" aria-hidden="true">
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
              <path d="M12 2 C8 10 4 14 4 20a8 8 0 0 0 16 0c0-6-4-10-8-18z" fill="url(#dropGrad)" />
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
  );
}
