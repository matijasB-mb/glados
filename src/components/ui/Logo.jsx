/**
 * Gladoš logo — inline SVG, works on any background.
 * variant: 'dark'  → for light backgrounds (forest green text)
 * variant: 'light' → for dark backgrounds (white text)
 */
export function Logo({ variant = 'dark', className = '' }) {
  const textColor = variant === 'dark' ? '#1B3A28' : '#FFFFFF'

  return (
    <svg
      viewBox="0 0 248 68"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Gladoš"
      role="img"
    >
      {/* Speed lines — left of pin */}
      <rect x="1" y="19" width="13" height="3.5" rx="1.75" fill={textColor} opacity="0.85" />
      <rect x="0" y="26" width="17" height="3.5" rx="1.75" fill={textColor} opacity="0.85" />
      <rect x="1" y="33" width="13" height="3.5" rx="1.75" fill={textColor} opacity="0.85" />

      {/* Yellow location pin / teardrop */}
      <path
        d="M55,3 C40,3 28,15 28,30 C28,47 55,65 55,65 C55,65 82,47 82,30 C82,15 70,3 55,3 Z"
        fill="#F5C518"
      />

      {/* Moped silhouette — dark green inside pin */}

      {/* Delivery box (front of moped) */}
      <rect x="34" y="23" width="13" height="11" rx="2" fill={variant === 'dark' ? '#1B3A28' : '#1B3A28'} />
      {/* Box lid line */}
      <line x1="34" y1="27" x2="47" y2="27" stroke="#F5C518" strokeWidth="1.5" />

      {/* Rider torso / seat area */}
      <path d="M47,26 L55,24 L62,31 L47,33 Z" fill="#1B3A28" />

      {/* Rider head with helmet */}
      <circle cx="56" cy="18" r="5.5" fill="#1B3A28" />
      {/* Helmet visor */}
      <path d="M52,19 Q56,22 61,19" stroke="#F5C518" strokeWidth="1.5" fill="none" strokeLinecap="round" />

      {/* Handlebar */}
      <path d="M62,27 L67,24" stroke="#1B3A28" strokeWidth="2.5" strokeLinecap="round" />

      {/* Front fork */}
      <path d="M66,25 L68,37" stroke="#1B3A28" strokeWidth="2.5" strokeLinecap="round" />

      {/* Rear frame */}
      <path d="M47,33 L40,38" stroke="#1B3A28" strokeWidth="2.5" strokeLinecap="round" />

      {/* Seat line */}
      <path d="M48,25 L52,24" stroke="#1B3A28" strokeWidth="2" strokeLinecap="round" />

      {/* Rear wheel */}
      <circle cx="40" cy="43" r="6.5" fill="none" stroke="#1B3A28" strokeWidth="2.8" />
      <circle cx="40" cy="43" r="1.5" fill="#1B3A28" />

      {/* Front wheel */}
      <circle cx="68" cy="43" r="6.5" fill="none" stroke="#1B3A28" strokeWidth="2.8" />
      <circle cx="68" cy="43" r="1.5" fill="#1B3A28" />

      {/* Chassis */}
      <path d="M40,37 L68,37" stroke="#1B3A28" strokeWidth="2" strokeLinecap="round" />

      {/* "Gladoš" text */}
      <text
        x="96"
        y="48"
        fontFamily="'Plus Jakarta Sans', 'Inter', system-ui, sans-serif"
        fontWeight="800"
        fontSize="40"
        fill={textColor}
        letterSpacing="-1.5"
      >
        Gladoš
      </text>
    </svg>
  )
}
