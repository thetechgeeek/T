// Geometric flat illustrations. Reads theme colors via CSS vars.
// Sizes are parameterized so they work inline and in hero positions.

function IlloVault({ size = 120 }) {
  return (
    <svg width={size} height={size * 0.9} viewBox="0 0 120 108" fill="none">
      <defs>
        <clipPath id="vault-c"><rect x="10" y="14" width="100" height="84" rx="6"/></clipPath>
      </defs>
      <rect x="10" y="14" width="100" height="84" rx="6" fill="var(--c-chartA)" opacity="0.12"/>
      <rect x="10" y="14" width="100" height="84" rx="6" stroke="var(--c-chartA)" strokeWidth="2" fill="none"/>
      <g clipPath="url(#vault-c)">
        <circle cx="60" cy="56" r="28" fill="var(--c-chartA)" opacity="0.18"/>
        <circle cx="60" cy="56" r="22" fill="var(--c-surface)" stroke="var(--c-chartA)" strokeWidth="2"/>
        <circle cx="60" cy="56" r="4" fill="var(--c-chartA)"/>
        <path d="M60 36v-6M60 82v-6M40 56h-6M86 56h-6M44 40l-4-4M80 72l-4-4M44 72l-4 4M80 40l-4 4" stroke="var(--c-chartA)" strokeWidth="2" strokeLinecap="round"/>
      </g>
      <rect x="14" y="18" width="6" height="6" rx="1" fill="var(--c-chartC)"/>
      <rect x="100" y="18" width="6" height="6" rx="1" fill="var(--c-chartB)"/>
      <rect x="14" y="88" width="6" height="6" rx="1" fill="var(--c-chartE)"/>
      <rect x="100" y="88" width="6" height="6" rx="1" fill="var(--c-chartD)"/>
    </svg>
  );
}

function IlloChart({ size = 120 }) {
  return (
    <svg width={size} height={size * 0.75} viewBox="0 0 120 90" fill="none">
      <rect x="4" y="4" width="112" height="82" rx="6" fill="var(--c-surfaceAlt)"/>
      <circle cx="36" cy="46" r="24" fill="var(--c-chartA)"/>
      <path d="M36 22a24 24 0 0 1 24 24H36z" fill="var(--c-chartB)"/>
      <path d="M36 22v24l20.8 12A24 24 0 0 0 60 46 24 24 0 0 0 36 22z" fill="var(--c-chartC)"/>
      <rect x="70" y="32" width="8" height="36" rx="1" fill="var(--c-chartA)"/>
      <rect x="82" y="20" width="8" height="48" rx="1" fill="var(--c-chartB)"/>
      <rect x="94" y="42" width="8" height="26" rx="1" fill="var(--c-chartC)"/>
      <rect x="106" y="28" width="8" height="40" rx="1" fill="var(--c-chartE)"/>
    </svg>
  );
}

function IlloEmpty({ size = 120 }) {
  return (
    <svg width={size} height={size * 0.85} viewBox="0 0 120 102" fill="none">
      <ellipse cx="60" cy="90" rx="42" ry="6" fill="var(--c-text)" opacity="0.08"/>
      <rect x="26" y="30" width="68" height="52" rx="4" fill="var(--c-surface)" stroke="var(--c-border)" strokeWidth="1.5"/>
      <rect x="34" y="40" width="30" height="4" rx="1" fill="var(--c-textMuted)" opacity="0.4"/>
      <rect x="34" y="50" width="44" height="4" rx="1" fill="var(--c-textMuted)" opacity="0.25"/>
      <rect x="34" y="60" width="22" height="4" rx="1" fill="var(--c-textMuted)" opacity="0.25"/>
      <circle cx="80" cy="28" r="14" fill="var(--c-chartC)"/>
      <path d="M74 28h12M80 22v12" stroke="var(--c-surface)" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  );
}

function IlloShield({ size = 120 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none">
      <path d="M60 10l42 12v28c0 28-20 52-42 60-22-8-42-32-42-60V22z" fill="var(--c-chartB)" opacity="0.2"/>
      <path d="M60 20l32 10v22c0 22-14 40-32 48-18-8-32-26-32-48V30z" fill="var(--c-chartB)"/>
      <path d="m46 60 10 10 18-20" stroke="var(--c-surface)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    </svg>
  );
}

function IlloCoins({ size = 120 }) {
  return (
    <svg width={size} height={size * 0.83} viewBox="0 0 120 100" fill="none">
      <ellipse cx="60" cy="92" rx="46" ry="5" fill="var(--c-text)" opacity="0.08"/>
      <ellipse cx="60" cy="78" rx="26" ry="8" fill="var(--c-chartC)" opacity="0.5"/>
      <rect x="34" y="60" width="52" height="18" rx="2" fill="var(--c-chartC)"/>
      <ellipse cx="60" cy="60" rx="26" ry="8" fill="var(--c-chartC)" stroke="var(--c-text)" strokeWidth="1.2" opacity="0.9"/>
      <ellipse cx="60" cy="42" rx="30" ry="10" fill="var(--c-chartA)" opacity="0.5"/>
      <rect x="30" y="22" width="60" height="20" rx="2" fill="var(--c-chartA)"/>
      <ellipse cx="60" cy="22" rx="30" ry="10" fill="var(--c-chartA)" stroke="var(--c-text)" strokeWidth="1.2"/>
      <text x="60" y="26" fontFamily="var(--f-mono)" fontSize="9" fontWeight="700" textAnchor="middle" fill="var(--c-surface)">$</text>
    </svg>
  );
}

function IlloRocket({ size = 120 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none">
      <circle cx="60" cy="60" r="50" fill="var(--c-chartA)" opacity="0.1"/>
      <path d="M60 18c18 0 26 18 26 34l-8 14h-36l-8-14c0-16 8-34 26-34z" fill="var(--c-chartA)"/>
      <circle cx="60" cy="46" r="8" fill="var(--c-surface)"/>
      <circle cx="60" cy="46" r="4" fill="var(--c-chartA)"/>
      <path d="M42 72l-10 12 14-4M78 72l10 12-14-4" fill="var(--c-chartC)"/>
      <path d="M52 80h16l-4 14h-8z" fill="var(--c-chartD)"/>
      <circle cx="20" cy="30" r="2" fill="var(--c-chartC)"/>
      <circle cx="100" cy="40" r="2" fill="var(--c-chartB)"/>
      <circle cx="30" cy="90" r="2" fill="var(--c-chartE)"/>
      <circle cx="96" cy="88" r="2" fill="var(--c-chartC)"/>
    </svg>
  );
}

function IlloApproval({ size = 120 }) {
  return (
    <svg width={size} height={size * 0.85} viewBox="0 0 120 102" fill="none">
      <rect x="16" y="14" width="70" height="80" rx="4" fill="var(--c-surface)" stroke="var(--c-border)" strokeWidth="1.5"/>
      <rect x="22" y="22" width="34" height="4" rx="1" fill="var(--c-text)" opacity="0.5"/>
      <rect x="22" y="32" width="58" height="3" rx="1" fill="var(--c-textMuted)" opacity="0.4"/>
      <rect x="22" y="40" width="48" height="3" rx="1" fill="var(--c-textMuted)" opacity="0.4"/>
      <rect x="22" y="48" width="54" height="3" rx="1" fill="var(--c-textMuted)" opacity="0.4"/>
      <rect x="22" y="60" width="40" height="12" rx="2" fill="var(--c-chartB)" opacity="0.22"/>
      <rect x="22" y="76" width="36" height="12" rx="2" fill="var(--c-chartA)" opacity="0.22"/>
      <circle cx="92" cy="72" r="18" fill="var(--c-chartB)"/>
      <path d="m84 72 6 6 12-14" stroke="var(--c-surface)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    </svg>
  );
}

function IlloOffline({ size = 120 }) {
  return (
    <svg width={size} height={size * 0.85} viewBox="0 0 120 102" fill="none">
      <circle cx="60" cy="50" r="40" fill="var(--c-surfaceAlt)"/>
      <path d="M60 26c-12 0-22 4-30 10M60 26c12 0 22 4 30 10" stroke="var(--c-textMuted)" strokeWidth="2.5" strokeLinecap="round" opacity="0.4"/>
      <path d="M60 42c-7 0-13 2-18 6M60 42c7 0 13 2 18 6" stroke="var(--c-textMuted)" strokeWidth="2.5" strokeLinecap="round" opacity="0.4"/>
      <circle cx="60" cy="62" r="4" fill="var(--c-textMuted)"/>
      <path d="M16 14 104 86" stroke="var(--c-danger)" strokeWidth="3" strokeLinecap="round"/>
    </svg>
  );
}

function IlloBank({ size = 120 }) {
  return (
    <svg width={size} height={size * 0.85} viewBox="0 0 120 102" fill="none">
      <path d="M60 14 14 32v8h92v-8z" fill="var(--c-chartE)"/>
      <rect x="14" y="42" width="92" height="4" fill="var(--c-chartE)" opacity="0.7"/>
      <rect x="22" y="50" width="8" height="30" fill="var(--c-chartA)"/>
      <rect x="42" y="50" width="8" height="30" fill="var(--c-chartA)"/>
      <rect x="62" y="50" width="8" height="30" fill="var(--c-chartA)"/>
      <rect x="82" y="50" width="8" height="30" fill="var(--c-chartA)"/>
      <rect x="10" y="82" width="100" height="6" fill="var(--c-chartE)"/>
      <rect x="8" y="90" width="104" height="4" fill="var(--c-chartE)" opacity="0.7"/>
      <circle cx="60" cy="28" r="4" fill="var(--c-surface)"/>
    </svg>
  );
}

window.Illos = { IlloVault, IlloChart, IlloEmpty, IlloShield, IlloCoins, IlloRocket, IlloApproval, IlloOffline, IlloBank };
