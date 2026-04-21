// Minimal inline SVG icon set, stroke-based (Lucide-style).
// Each icon accepts size + color via props. Rendered with currentColor by default.

const Icon = ({ d, size = 18, stroke = 2, fill = 'none', children, style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor"
    strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" style={style}>
    {d ? <path d={d} /> : children}
  </svg>
);

const I = {
  search: (p) => <Icon {...p}><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></Icon>,
  close:  (p) => <Icon {...p}><path d="M18 6 6 18M6 6l12 12"/></Icon>,
  check:  (p) => <Icon {...p}><path d="M20 6 9 17l-5-5"/></Icon>,
  plus:   (p) => <Icon {...p}><path d="M12 5v14M5 12h14"/></Icon>,
  minus:  (p) => <Icon {...p}><path d="M5 12h14"/></Icon>,
  chevR:  (p) => <Icon {...p}><path d="m9 6 6 6-6 6"/></Icon>,
  chevL:  (p) => <Icon {...p}><path d="m15 6-6 6 6 6"/></Icon>,
  chevD:  (p) => <Icon {...p}><path d="m6 9 6 6 6-6"/></Icon>,
  chevU:  (p) => <Icon {...p}><path d="m6 15 6-6 6 6"/></Icon>,
  arrowR: (p) => <Icon {...p}><path d="M5 12h14M13 5l7 7-7 7"/></Icon>,
  arrowUR:(p) => <Icon {...p}><path d="M7 17 17 7M7 7h10v10"/></Icon>,
  arrowDR:(p) => <Icon {...p}><path d="M7 7l10 10M17 7v10H7"/></Icon>,
  trend:  (p) => <Icon {...p}><path d="M3 17 9 11l4 4 8-9"/><path d="M14 7h7v7"/></Icon>,
  home:   (p) => <Icon {...p}><path d="M3 10 12 3l9 7v10a1 1 0 0 1-1 1h-5v-7h-6v7H4a1 1 0 0 1-1-1z"/></Icon>,
  wallet: (p) => <Icon {...p}><rect x="2" y="6" width="20" height="14" rx="2"/><path d="M16 14h.01M2 10h20"/></Icon>,
  pie:    (p) => <Icon {...p}><path d="M21 12A9 9 0 1 1 12 3v9h9z"/></Icon>,
  bell:   (p) => <Icon {...p}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10 21a2 2 0 0 0 4 0"/></Icon>,
  user:   (p) => <Icon {...p}><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></Icon>,
  settings:(p) => <Icon {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></Icon>,
  filter: (p) => <Icon {...p}><path d="M22 3H2l8 9.5V19l4 2v-8.5z"/></Icon>,
  sort:   (p) => <Icon {...p}><path d="M3 6h13M3 12h9M3 18h5M17 8V4l3 3M17 16v4l3-3"/></Icon>,
  more:   (p) => <Icon {...p}><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></Icon>,
  eye:    (p) => <Icon {...p}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></Icon>,
  eyeOff: (p) => <Icon {...p}><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c6.5 0 10 7 10 7a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22"/></Icon>,
  copy:   (p) => <Icon {...p}><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></Icon>,
  upload: (p) => <Icon {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/></Icon>,
  download:(p) => <Icon {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></Icon>,
  file:   (p) => <Icon {...p}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></Icon>,
  calendar:(p) => <Icon {...p}><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></Icon>,
  clock:  (p) => <Icon {...p}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></Icon>,
  lock:   (p) => <Icon {...p}><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></Icon>,
  shield: (p) => <Icon {...p}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></Icon>,
  zap:    (p) => <Icon {...p}><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/></Icon>,
  star:   (p) => <Icon {...p}><path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z"/></Icon>,
  send:   (p) => <Icon {...p}><path d="m22 2-7 20-4-9-9-4z"/><path d="M22 2 11 13"/></Icon>,
  inbox:  (p) => <Icon {...p}><path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></Icon>,
  external:(p) => <Icon {...p}><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3"/></Icon>,
  menu:   (p) => <Icon {...p}><path d="M3 6h18M3 12h18M3 18h18"/></Icon>,
  grid:   (p) => <Icon {...p}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></Icon>,
  coins:  (p) => <Icon {...p}><circle cx="8" cy="8" r="6"/><path d="M18.09 10.37A6 6 0 1 1 10.34 18M7 6h1v4M16.71 13.88.7.71-.71.71"/></Icon>,
  bank:   (p) => <Icon {...p}><path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3"/></Icon>,
  refresh:(p) => <Icon {...p}><path d="M21 12a9 9 0 1 1-3-6.7L21 8"/><path d="M21 3v5h-5"/></Icon>,
  alert:  (p) => <Icon {...p}><circle cx="12" cy="12" r="9"/><path d="M12 8v4M12 16h.01"/></Icon>,
  info:   (p) => <Icon {...p}><circle cx="12" cy="12" r="9"/><path d="M12 16v-4M12 8h.01"/></Icon>,
  danger: (p) => <Icon {...p}><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01"/></Icon>,
  success:(p) => <Icon {...p}><circle cx="12" cy="12" r="9"/><path d="m9 12 2 2 4-4"/></Icon>,
  paint:  (p) => <Icon {...p}><circle cx="13.5" cy="6.5" r="1.5" fill="currentColor"/><circle cx="17.5" cy="10.5" r="1.5" fill="currentColor"/><circle cx="8.5" cy="7.5" r="1.5" fill="currentColor"/><circle cx="6.5" cy="12.5" r="1.5" fill="currentColor"/><path d="M12 2a10 10 0 1 0 0 20 3 3 0 0 0 3-3 2 2 0 0 1 2-2h2a4 4 0 0 0 4-4 10 10 0 0 0-11-11z"/></Icon>,
  swap:   (p) => <Icon {...p}><path d="M7 16h14l-3-3M17 8H3l3 3"/></Icon>,
  briefcase:(p) => <Icon {...p}><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></Icon>,
  globe:  (p) => <Icon {...p}><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></Icon>,
  rocket: (p) => <Icon {...p}><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09zM12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/></Icon>,
};

window.I = I;
window.Icon = Icon;
