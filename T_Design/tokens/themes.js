// Theme definitions — 5 distinct looks × light/dark.
// Every visual token is themeable. Accent hue overrides primary/200/500.

window.THEMES = {
  linear: {
    name: 'Linear',
    description: 'Quiet grays, precise, minimal',
    fonts: { sans: '"Geist", "SF Pro Display", -apple-system, sans-serif', mono: '"Geist Mono", ui-monospace, monospace', display: '"Geist", sans-serif' },
    radius: { sm: 4, md: 6, lg: 10, xl: 14, pill: 999 },
    light: {
      bg: '#FBFBFC', surface: '#FFFFFF', surfaceAlt: '#F4F4F5', surfaceSunken: '#F0F0F2',
      border: '#E4E4E7', borderStrong: '#D4D4D8', divider: 'rgba(9,9,11,0.06)',
      text: '#09090B', textMuted: '#52525B', textSubtle: '#A1A1AA', textInverse: '#FAFAFA',
      primary: '#5E6AD2', primaryHover: '#4E59C7', primaryText: '#FFFFFF', primarySoft: '#ECEDFB',
      success: '#22A06B', warning: '#D97706', danger: '#E5484D', info: '#0BA5E9',
      successSoft: '#E8F5EE', warningSoft: '#FEF3E2', dangerSoft: '#FDECEC', infoSoft: '#E6F6FE',
      chartA: '#5E6AD2', chartB: '#22A06B', chartC: '#D97706', chartD: '#E5484D', chartE: '#8B5CF6', chartF: '#0891B2',
      shadow: '0 1px 2px rgba(9,9,11,0.04), 0 1px 3px rgba(9,9,11,0.06)',
      shadowLg: '0 8px 24px rgba(9,9,11,0.08), 0 2px 6px rgba(9,9,11,0.04)',
      noise: 0, glass: 0,
    },
    dark: {
      bg: '#08090A', surface: '#111113', surfaceAlt: '#1A1B1E', surfaceSunken: '#050506',
      border: '#26272B', borderStrong: '#35363A', divider: 'rgba(255,255,255,0.06)',
      text: '#F7F8F8', textMuted: '#8A8F98', textSubtle: '#62666D', textInverse: '#09090B',
      primary: '#7B8CE5', primaryHover: '#8B9BEB', primaryText: '#FFFFFF', primarySoft: '#1E2140',
      success: '#30A46C', warning: '#F59E0B', danger: '#F16870', info: '#38BDF8',
      successSoft: '#0F2419', warningSoft: '#2A1D0B', dangerSoft: '#2A1416', infoSoft: '#0C2236',
      chartA: '#7B8CE5', chartB: '#30A46C', chartC: '#F59E0B', chartD: '#F16870', chartE: '#A78BFA', chartF: '#22D3EE',
      shadow: '0 1px 2px rgba(0,0,0,0.4)',
      shadowLg: '0 8px 24px rgba(0,0,0,0.5)',
      noise: 0, glass: 0,
    },
  },

  editorial: {
    name: 'Editorial',
    description: 'Warm paper, serif headings, Notion-esque',
    fonts: { sans: '"General Sans", "SF Pro Display", sans-serif', mono: '"JetBrains Mono", monospace', display: '"Fraunces", Georgia, serif' },
    radius: { sm: 3, md: 5, lg: 8, xl: 12, pill: 999 },
    light: {
      bg: '#FAF7F2', surface: '#FFFEFB', surfaceAlt: '#F3EEE5', surfaceSunken: '#EFE9DE',
      border: '#E3DCCD', borderStrong: '#CFC5B0', divider: 'rgba(60,40,20,0.08)',
      text: '#2B1F14', textMuted: '#6B5A48', textSubtle: '#9A8A76', textInverse: '#FAF7F2',
      primary: '#8B4513', primaryHover: '#73380F', primaryText: '#FAF7F2', primarySoft: '#F1E4D6',
      success: '#4A6B3A', warning: '#B8720C', danger: '#A8402E', info: '#3B6E8F',
      successSoft: '#E8EDDF', warningSoft: '#F8ECD4', dangerSoft: '#F4E1DC', infoSoft: '#DCE8EF',
      chartA: '#8B4513', chartB: '#4A6B3A', chartC: '#B8720C', chartD: '#A8402E', chartE: '#6B4E7A', chartF: '#3B6E8F',
      shadow: '0 1px 2px rgba(60,40,20,0.06), 0 1px 2px rgba(60,40,20,0.04)',
      shadowLg: '0 4px 16px rgba(60,40,20,0.1)',
      noise: 0.5, glass: 0,
    },
    dark: {
      bg: '#1A1510', surface: '#221C16', surfaceAlt: '#2B241C', surfaceSunken: '#13100B',
      border: '#3A3128', borderStrong: '#4C4137', divider: 'rgba(255,240,220,0.08)',
      text: '#F1E9D9', textMuted: '#B8A88F', textSubtle: '#8A7A62', textInverse: '#1A1510',
      primary: '#D49662', primaryHover: '#DDA575', primaryText: '#1A1510', primarySoft: '#3A2B1C',
      success: '#7FAB68', warning: '#D9A147', danger: '#D4735E', info: '#6B9ABE',
      successSoft: '#1F2818', warningSoft: '#2E2414', dangerSoft: '#2A1A15', infoSoft: '#14222E',
      chartA: '#D49662', chartB: '#7FAB68', chartC: '#D9A147', chartD: '#D4735E', chartE: '#A387B4', chartF: '#6B9ABE',
      shadow: '0 1px 2px rgba(0,0,0,0.4)',
      shadowLg: '0 4px 20px rgba(0,0,0,0.5)',
      noise: 0.5, glass: 0,
    },
  },

  glass: {
    name: 'Glass',
    description: 'Soft pastels, translucent layers',
    fonts: { sans: '"Satoshi", "SF Pro Display", sans-serif', mono: '"JetBrains Mono", monospace', display: '"Satoshi", sans-serif' },
    radius: { sm: 8, md: 14, lg: 20, xl: 28, pill: 999 },
    light: {
      bg: 'linear-gradient(135deg, #E8EFFF 0%, #FFE8F3 50%, #E8F9FF 100%)',
      bgSolid: '#EFF2FC',
      surface: 'rgba(255,255,255,0.72)', surfaceAlt: 'rgba(255,255,255,0.5)', surfaceSunken: 'rgba(255,255,255,0.3)',
      border: 'rgba(255,255,255,0.6)', borderStrong: 'rgba(180,190,220,0.5)', divider: 'rgba(120,130,160,0.14)',
      text: '#1A1F3A', textMuted: '#55608A', textSubtle: '#8890B0', textInverse: '#FFFFFF',
      primary: '#7B5BFF', primaryHover: '#6A48F0', primaryText: '#FFFFFF', primarySoft: 'rgba(123,91,255,0.14)',
      success: '#10B981', warning: '#F59E0B', danger: '#EF4444', info: '#3B82F6',
      successSoft: 'rgba(16,185,129,0.14)', warningSoft: 'rgba(245,158,11,0.14)', dangerSoft: 'rgba(239,68,68,0.14)', infoSoft: 'rgba(59,130,246,0.14)',
      chartA: '#7B5BFF', chartB: '#10B981', chartC: '#F59E0B', chartD: '#EF4444', chartE: '#EC4899', chartF: '#06B6D4',
      shadow: '0 2px 8px rgba(90,110,180,0.08)',
      shadowLg: '0 12px 40px rgba(90,110,180,0.16), 0 4px 12px rgba(90,110,180,0.08)',
      noise: 0, glass: 1,
    },
    dark: {
      bg: 'linear-gradient(135deg, #1B1533 0%, #331B33 50%, #1B2633 100%)',
      bgSolid: '#1B1B2E',
      surface: 'rgba(255,255,255,0.08)', surfaceAlt: 'rgba(255,255,255,0.05)', surfaceSunken: 'rgba(0,0,0,0.2)',
      border: 'rgba(255,255,255,0.12)', borderStrong: 'rgba(255,255,255,0.2)', divider: 'rgba(255,255,255,0.08)',
      text: '#F0F0FF', textMuted: '#A8AED0', textSubtle: '#70769A', textInverse: '#1A1F3A',
      primary: '#9B80FF', primaryHover: '#AA94FF', primaryText: '#FFFFFF', primarySoft: 'rgba(155,128,255,0.2)',
      success: '#34D399', warning: '#FBBF24', danger: '#F87171', info: '#60A5FA',
      successSoft: 'rgba(52,211,153,0.16)', warningSoft: 'rgba(251,191,36,0.16)', dangerSoft: 'rgba(248,113,113,0.16)', infoSoft: 'rgba(96,165,250,0.16)',
      chartA: '#9B80FF', chartB: '#34D399', chartC: '#FBBF24', chartD: '#F87171', chartE: '#F472B6', chartF: '#22D3EE',
      shadow: '0 2px 8px rgba(0,0,0,0.3)',
      shadowLg: '0 12px 40px rgba(0,0,0,0.4)',
      noise: 0, glass: 1,
    },
  },

  illustrated: {
    name: 'Illustrated',
    description: 'Playful, rounded, hand-drawn accents',
    fonts: { sans: '"Cabinet Grotesk", "SF Pro Display", sans-serif', mono: '"JetBrains Mono", monospace', display: '"Cabinet Grotesk", sans-serif' },
    radius: { sm: 10, md: 16, lg: 22, xl: 32, pill: 999 },
    light: {
      bg: '#FFF8E7', surface: '#FFFFFF', surfaceAlt: '#FFF1CC', surfaceSunken: '#FFEAB8',
      border: '#1F1F1F', borderStrong: '#1F1F1F', divider: 'rgba(31,31,31,0.12)',
      text: '#1F1F1F', textMuted: '#5A5246', textSubtle: '#8A7F6B', textInverse: '#FFF8E7',
      primary: '#FF6B4A', primaryHover: '#FF5538', primaryText: '#FFFFFF', primarySoft: '#FFDECE',
      success: '#3DA668', warning: '#F2994A', danger: '#E14B3B', info: '#3B87E0',
      successSoft: '#CBEAD6', warningSoft: '#FCE4C6', dangerSoft: '#F9D3CE', infoSoft: '#CFE3F8',
      chartA: '#FF6B4A', chartB: '#3DA668', chartC: '#F2C94C', chartD: '#9B51E0', chartE: '#3B87E0', chartF: '#E14B3B',
      shadow: '2px 2px 0 #1F1F1F',
      shadowLg: '4px 4px 0 #1F1F1F',
      noise: 0, glass: 0, neobrutal: 1,
    },
    dark: {
      bg: '#1A1814', surface: '#2A2620', surfaceAlt: '#35302A', surfaceSunken: '#120F0B',
      border: '#FFF8E7', borderStrong: '#FFF8E7', divider: 'rgba(255,248,231,0.14)',
      text: '#FFF8E7', textMuted: '#C8BFA8', textSubtle: '#8A8270', textInverse: '#1A1814',
      primary: '#FF8E70', primaryHover: '#FFA189', primaryText: '#1A1814', primarySoft: '#4A2E24',
      success: '#6FC28F', warning: '#F2B570', danger: '#EE7062', info: '#6FA6E8',
      successSoft: '#1F3527', warningSoft: '#3A2A18', dangerSoft: '#3A1C18', infoSoft: '#1A2C3F',
      chartA: '#FF8E70', chartB: '#6FC28F', chartC: '#F2D270', chartD: '#BA83E8', chartE: '#6FA6E8', chartF: '#EE7062',
      shadow: '2px 2px 0 #FFF8E7',
      shadowLg: '4px 4px 0 #FFF8E7',
      noise: 0, glass: 0, neobrutal: 1,
    },
  },

  vibrant: {
    name: 'Vibrant',
    description: 'Saturated accents, glossy, Stripe-style',
    fonts: { sans: '"Geist", "SF Pro Display", sans-serif', mono: '"Geist Mono", monospace', display: '"Geist", sans-serif' },
    radius: { sm: 6, md: 10, lg: 14, xl: 18, pill: 999 },
    light: {
      bg: '#F6F9FC', surface: '#FFFFFF', surfaceAlt: '#F6F9FC', surfaceSunken: '#EDF2F7',
      border: '#E3E8EE', borderStrong: '#CBD2DB', divider: 'rgba(26,54,93,0.08)',
      text: '#0A2540', textMuted: '#425466', textSubtle: '#8898AA', textInverse: '#FFFFFF',
      primary: '#635BFF', primaryHover: '#5349F7', primaryText: '#FFFFFF', primarySoft: '#EFEEFF',
      success: '#00B67A', warning: '#F5A623', danger: '#E3342F', info: '#0073E6',
      successSoft: '#D8F3E7', warningSoft: '#FCEED5', dangerSoft: '#FAD8D7', infoSoft: '#D1E7FA',
      chartA: '#635BFF', chartB: '#00B67A', chartC: '#F5A623', chartD: '#E3342F', chartE: '#00D4FF', chartF: '#FF4081',
      shadow: '0 2px 5px rgba(50,50,93,0.1), 0 1px 2px rgba(0,0,0,0.07)',
      shadowLg: '0 15px 35px rgba(50,50,93,0.12), 0 5px 15px rgba(0,0,0,0.07)',
      noise: 0, glass: 0, glossy: 1,
    },
    dark: {
      bg: '#0A1628', surface: '#132238', surfaceAlt: '#1A2D47', surfaceSunken: '#05101F',
      border: '#23395B', borderStrong: '#324F7A', divider: 'rgba(255,255,255,0.08)',
      text: '#F0F5FA', textMuted: '#A4B6CA', textSubtle: '#6B7E93', textInverse: '#0A1628',
      primary: '#8C85FF', primaryHover: '#9E98FF', primaryText: '#FFFFFF', primarySoft: '#272A5E',
      success: '#2EE8A5', warning: '#FFB84A', danger: '#FF5A58', info: '#38B7FF',
      successSoft: '#0F2E24', warningSoft: '#2E220F', dangerSoft: '#2E1413', infoSoft: '#0F2433',
      chartA: '#8C85FF', chartB: '#2EE8A5', chartC: '#FFB84A', chartD: '#FF5A58', chartE: '#38EBFF', chartF: '#FF6FB0',
      shadow: '0 2px 5px rgba(0,0,0,0.3)',
      shadowLg: '0 15px 35px rgba(0,0,0,0.45)',
      noise: 0, glass: 0, glossy: 1,
    },
  },
};

// Density multipliers (applied on top of base spacing scale)
window.DENSITY = {
  compact:    { scale: 0.82, row: 40, touchMin: 40, textScale: 0.94 },
  comfortable:{ scale: 1.00, row: 48, touchMin: 44, textScale: 1.00 },
  spacious:   { scale: 1.18, row: 56, touchMin: 48, textScale: 1.06 },
};

// Radius modes: sharp ×0.25, soft ×1, pill ×1 with pill override where marked
window.RADIUS_MODES = {
  sharp: 0.2,
  soft: 1.0,
  pill: 1.8,
};

// Applies tokens to :root via CSS vars. Call on mount and on any tweak change.
window.applyTheme = function applyTheme({ theme, mode, accent, density, radius, font, motion, illustration }) {
  const t = window.THEMES[theme];
  if (!t) return;
  const palette = t[mode] || t.light;
  const root = document.documentElement;

  // Color vars
  Object.entries(palette).forEach(([k, v]) => {
    root.style.setProperty(`--c-${k}`, v);
  });

  // Accent hue override (tints primary)
  if (accent && accent !== 'default') {
    const hueMap = {
      indigo: '#5E6AD2', violet: '#8B5CF6', rose: '#E11D74', amber: '#D97706',
      emerald: '#10B981', sky: '#0BA5E9', red: '#EF4444', orange: '#FF6B4A',
    };
    const c = hueMap[accent];
    if (c) {
      root.style.setProperty('--c-primary', c);
      root.style.setProperty('--c-primaryHover', c);
      root.style.setProperty('--c-chartA', c);
    }
  }

  // Radius
  const rMul = window.RADIUS_MODES[radius] ?? 1;
  Object.entries(t.radius).forEach(([k, v]) => {
    const val = k === 'pill' ? v : Math.round(v * rMul);
    root.style.setProperty(`--r-${k}`, val + 'px');
  });

  // Font
  const fontOverrides = {
    geist: { sans: '"Geist", sans-serif', display: '"Geist", sans-serif' },
    satoshi: { sans: '"Satoshi", sans-serif', display: '"Satoshi", sans-serif' },
    general: { sans: '"General Sans", sans-serif', display: '"General Sans", sans-serif' },
    cabinet: { sans: '"Cabinet Grotesk", sans-serif', display: '"Cabinet Grotesk", sans-serif' },
    fraunces: { sans: '"General Sans", sans-serif', display: '"Fraunces", serif' },
  };
  const f = (font && fontOverrides[font]) || t.fonts;
  root.style.setProperty('--f-sans', f.sans);
  root.style.setProperty('--f-display', f.display);
  root.style.setProperty('--f-mono', t.fonts.mono);

  // Density
  const d = window.DENSITY[density] || window.DENSITY.comfortable;
  root.style.setProperty('--density-scale', d.scale);
  root.style.setProperty('--density-row', d.row + 'px');
  root.style.setProperty('--density-touch', d.touchMin + 'px');
  root.style.setProperty('--density-text', d.textScale);

  // Motion
  const motionMul = motion === 'off' ? 0 : motion === 'reduced' ? 0.4 : 1;
  root.style.setProperty('--motion-mul', motionMul);

  // Theme flags
  root.setAttribute('data-theme', theme);
  root.setAttribute('data-mode', mode);
  root.setAttribute('data-illustration', illustration || 'geometric');
  root.setAttribute('data-glass', palette.glass ? '1' : '0');
  root.setAttribute('data-neobrutal', palette.neobrutal ? '1' : '0');
  root.setAttribute('data-glossy', palette.glossy ? '1' : '0');

  // Shadow
  root.style.setProperty('--shadow', palette.shadow);
  root.style.setProperty('--shadow-lg', palette.shadowLg);

  // Solid bg for places that can't take gradient
  root.style.setProperty('--c-bgSolid', palette.bgSolid || palette.bg);
};
