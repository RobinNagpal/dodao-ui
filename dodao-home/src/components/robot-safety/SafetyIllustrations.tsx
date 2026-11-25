/**
 * Line diagrams for the four questions on /robot-safety. Drawn for the dark
 * viewport panels; colors come from theme tokens via Tailwind fill/stroke classes.
 */

const labelClass = 'fill-on-viewport-muted text-[11px] font-medium';
const strongLabelClass = 'fill-on-viewport text-[12px] font-semibold';

/** Top-down view of a robot with stop / slow / full-speed zones and a person walking in. */
export function SafetyZonesIllustration() {
  return (
    <svg
      viewBox="0 0 420 300"
      role="img"
      aria-label="Top-down view of a robot cell: the robot slows when a person enters the outer zone and stops in the inner zone"
      className="h-full w-full"
    >
      <circle cx="190" cy="160" r="128" className="fill-success/5 stroke-success/60" strokeWidth="1.5" strokeDasharray="6 6" />
      <circle cx="190" cy="160" r="88" className="fill-warning/10 stroke-warning/70" strokeWidth="1.5" strokeDasharray="6 6" />
      <circle cx="190" cy="160" r="46" className="fill-danger/15 stroke-danger/80" strokeWidth="1.5" />

      {/* Robot: base and a two-link arm seen from above */}
      <circle cx="190" cy="160" r="14" className="fill-primary stroke-on-viewport/40" strokeWidth="1.5" />
      <path d="M190 160 L222 138 L238 162" className="stroke-on-viewport" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <circle cx="222" cy="138" r="5" className="fill-on-viewport" />

      <text x="190" y="214" textAnchor="middle" className="fill-danger text-[11px] font-semibold">
        STOP
      </text>
      <text x="190" y="257" textAnchor="middle" className="fill-warning text-[11px] font-semibold">
        SLOW
      </text>
      <text x="190" y="298" textAnchor="middle" className="fill-success text-[11px] font-semibold">
        FULL SPEED
      </text>

      {/* Person walking towards the robot */}
      <g transform="translate(352 64)">
        <circle cx="0" cy="-14" r="8" className="fill-accent" />
        <path d="M0 -4 L0 20 M0 4 L-11 13 M0 4 L11 11 M0 20 L-9 38 M0 20 L9 38" className="stroke-accent" strokeWidth="4" strokeLinecap="round" fill="none" />
      </g>
      <path d="M334 112 Q300 130 278 132" className="stroke-accent/70" strokeWidth="1.5" strokeDasharray="4 5" fill="none" />
      <path d="M284 126 L276 132 L285 137" className="stroke-accent/70" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <text x="352" y="128" textAnchor="middle" className={labelClass}>
        Person enters
      </text>
    </svg>
  );
}

function Lock({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x - 9} ${y - 10})`}>
      <rect x="0" y="0" width="18" height="20" rx="9" className="fill-viewport stroke-accent/70" strokeWidth="1.2" />
      <rect x="5" y="9" width="8" height="7" rx="1.5" className="fill-accent" />
      <path d="M6.5 9 V7 a2.5 2.5 0 0 1 5 0 V9" className="stroke-accent" strokeWidth="1.4" fill="none" />
    </g>
  );
}

/** The robot's connections: each one a door that needs a lock. */
export function AttackSurfaceIllustration() {
  const nodes = [
    { x: 80, y: 62, label: 'Remote login' },
    { x: 340, y: 62, label: 'Cloud and fleet app' },
    { x: 80, y: 238, label: 'Software updates' },
    { x: 340, y: 238, label: 'Tablet and controller' },
  ];
  return (
    <svg
      viewBox="0 0 420 300"
      role="img"
      aria-label="A robot connected to remote login, a cloud app, software updates and a tablet, with each connection secured"
      className="h-full w-full"
    >
      {nodes.map((node) => (
        <g key={node.label}>
          <line x1="210" y1="150" x2={node.x} y2={node.y} className="stroke-on-viewport/25" strokeWidth="1.5" strokeDasharray="5 5" />
          <Lock x={(210 + node.x) / 2} y={(150 + node.y) / 2} />
          <rect x={node.x - 58} y={node.y - 17} width="116" height="34" rx="17" className="fill-surface stroke-on-viewport/20" strokeWidth="1" />
          <text x={node.x} y={node.y + 4} textAnchor="middle" className={labelClass}>
            {node.label}
          </text>
        </g>
      ))}

      {/* Robot in the middle */}
      <rect x="166" y="112" width="88" height="76" rx="18" className="fill-primary/20 stroke-primary" strokeWidth="1.5" />
      <path d="M196 170 V150 L214 136 L230 146" className="stroke-on-viewport" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <rect x="186" y="168" width="22" height="8" rx="2" className="fill-on-viewport" />
      <text x="210" y="208" textAnchor="middle" className={strongLabelClass}>
        Your robot
      </text>
    </svg>
  );
}

/** Robot data flowing to the company cloud, and the buyer asking how it is protected. */
export function DataFlowIllustration() {
  return (
    <svg
      viewBox="0 0 420 300"
      role="img"
      aria-label="Robot video, maps and logs go to the company cloud; the buyer's IT team asks how that data is protected"
      className="h-full w-full"
    >
      {/* Robot */}
      <rect x="22" y="104" width="84" height="84" rx="18" className="fill-primary/20 stroke-primary" strokeWidth="1.5" />
      <path d="M50 168 V146 L68 132 L84 142" className="stroke-on-viewport" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <rect x="40" y="166" width="22" height="8" rx="2" className="fill-on-viewport" />
      <text x="64" y="210" textAnchor="middle" className={strongLabelClass}>
        Robot
      </text>

      {/* Data packets moving to the cloud */}
      <line x1="112" y1="146" x2="166" y2="146" className="stroke-on-viewport/30" strokeWidth="1.5" strokeDasharray="5 5" />
      {['Video', 'Maps', 'Logs'].map((item, index) => (
        <g key={item} transform={`translate(116 ${88 + index * 22})`}>
          <rect width="46" height="16" rx="8" className="fill-accent/15 stroke-accent/50" strokeWidth="1" />
          <text x="23" y="11.5" textAnchor="middle" className="fill-accent text-[9.5px] font-semibold">
            {item}
          </text>
        </g>
      ))}

      {/* Cloud */}
      <path
        d="M186 172 h70 a24 24 0 0 0 2-48 a32 32 0 0 0-60-8 a22 22 0 0 0-12 56 z"
        className="fill-surface stroke-on-viewport/40"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <text x="222" y="152" textAnchor="middle" className={strongLabelClass}>
        Your cloud
      </text>
      <text x="222" y="200" textAnchor="middle" className={labelClass}>
        Staff logins · access logs
      </text>

      {/* Buyer questionnaire */}
      <line x1="270" y1="146" x2="300" y2="146" className="stroke-on-viewport/30" strokeWidth="1.5" strokeDasharray="5 5" />
      <rect x="304" y="78" width="98" height="134" rx="12" className="fill-on-viewport/5 stroke-on-viewport/30" strokeWidth="1.2" />
      <text x="353" y="100" textAnchor="middle" className="fill-on-viewport text-[10.5px] font-semibold">
        Buyer IT check
      </text>
      {[0, 1, 2, 3].map((row) => (
        <g key={row} transform={`translate(316 ${114 + row * 22})`}>
          <rect width="12" height="12" rx="3" className="fill-success/20 stroke-success" strokeWidth="1" />
          <path d="M3 6.5 L5.5 9 L9.5 3.5" className="stroke-success" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="18" y="3" width={row % 2 ? 48 : 58} height="6" rx="3" className="fill-on-viewport/25" />
        </g>
      ))}
      <rect x="320" y="226" width="66" height="24" rx="12" className="fill-success/15 stroke-success/60" strokeWidth="1" />
      <text x="353" y="242" textAnchor="middle" className="fill-success text-[11px] font-semibold">
        SOC 2
      </text>
    </svg>
  );
}
