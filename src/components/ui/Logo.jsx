/**
 * Gladooš logo — inline SVG, no external assets needed.
 *
 * variant: 'dark'  → wordmark in #121212  (for light/cream backgrounds)
 * variant: 'light' → wordmark in #FFFFFF  (for dark backgrounds)
 *
 * The icon mark (G-cloche + speed lines) always uses brand orange + black.
 */
export function Logo({ variant = 'dark', className = '' }) {
  const textColor  = variant === 'light' ? '#FFFFFF' : '#121212'
  const orange     = '#FF7A00'
  const black      = '#121212'

  return (
    <svg
      viewBox="0 0 220 56"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Gladooš"
      role="img"
      fill="none"
    >
      {/* ── ICON MARK (0–56 wide) ───────────────────────────────── */}

      {/* Speed lines */}
      <rect x="1"  y="16" width="8"  height="3"   rx="1.5" fill={orange}/>
      <rect x="1"  y="22" width="12" height="3"   rx="1.5" fill={orange}/>
      <rect x="1"  y="28" width="8"  height="3"   rx="1.5" fill={orange}/>

      {/* Dome (black half-ellipse) */}
      <path d="M15,28 C15,14 50,14 50,28Z" fill={black}/>
      {/* Dome knob */}
      <rect x="30.5" y="8"  width="3.5" height="6" rx="1.75" fill={black}/>
      <circle cx="32" cy="8" r="3.2" fill={black}/>

      {/* Tray rim (orange bar) */}
      <rect x="13" y="26" width="39" height="5" rx="2.5" fill={orange}/>

      {/* G arc — filled ring open at upper-right
          Circle center (32, 42), outer r=13, inner r=6.5
          Outer start (upper-right ~45°): (32+9.2, 42-9.2) = (41, 33)
          Outer end  (right side 0°):     (32+13, 42)      = (45, 42)
          Inner right:                    (32+6.5, 42)     = (38.5, 42)
          Inner upper-right:              (32+4.6, 42-4.6) = (36.6, 37) */}
      <path
        d="M41,33 A13,13 0 1,1 45,42 L38.5,42 A6.5,6.5 0 1,0 36.6,37 Z"
        fill={orange}
      />

      {/* ── WORDMARK (starts at x=60) ───────────────────────────── */}
      <text
        x="62"
        y="40"
        fontFamily="'Outfit', system-ui, sans-serif"
        fontWeight="900"
        fontSize="34"
        fill={textColor}
        letterSpacing="-1"
      >
        Gladooš
      </text>
    </svg>
  )
}
