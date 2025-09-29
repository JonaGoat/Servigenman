export function AnimatedBackground() {
  return (
    <>
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
    </>
  );
}
