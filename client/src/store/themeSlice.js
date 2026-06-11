import { createSlice } from '@reduxjs/toolkit';

const defaults = {
  primaryColor: '#da1f27',
  primaryDark: '#a01820',
  primaryLight: '#f04048',
  accentColor: '#fbb140',
  backgroundColor: '#fcfcfc',
  surfaceColor: '#FFFFFF',
  textDark: '#1F1F1F',
  textMuted: '#6B7280',
  borderColor: '#E5E0DC',
  fontFamily: 'Tajawal',
  buttonRadius: '0.5rem',
  cardRadius: '0.75rem',
  sidebarStyle: 'dark',
  sidebarBg: '#0F0E0E',
  sidebarActiveBg: 'rgba(218,31,39,0.35)',
  sidebarActiveColor: '#ff7b82',
  sidebarTextColor: 'rgba(255,255,255,0.68)',
  sidebarGroupColor: 'rgba(255,255,255,0.28)',
  logo: null,
  logoWhite: null,
  loginImage: null,
  announcementBar: {
    enabled: false,
    text: '',
    bgColor: '#da1f27',
    textColor: '#ffffff',
    link: '',
    dismissible: true,
  },
};

const applyTheme = (theme) => {
  const r = document.documentElement.style;
  r.setProperty('--color-primary', theme.primaryColor);
  r.setProperty('--color-primary-dark', theme.primaryDark);
  r.setProperty('--color-primary-light', theme.primaryLight);
  r.setProperty('--color-accent', theme.accentColor);
  r.setProperty('--color-background', theme.backgroundColor);
  r.setProperty('--color-surface', theme.surfaceColor);
  r.setProperty('--color-text-dark', theme.textDark);
  r.setProperty('--color-text-muted', theme.textMuted);
  r.setProperty('--color-border', theme.borderColor);
  r.setProperty('--font-family', theme.fontFamily);
  r.setProperty('--btn-radius', theme.buttonRadius);
  r.setProperty('--card-radius', theme.cardRadius);
  if (theme.sidebarBg)          r.setProperty('--sidebar-bg', theme.sidebarBg);
  if (theme.sidebarActiveBg)    r.setProperty('--sidebar-active-bg', theme.sidebarActiveBg);
  if (theme.sidebarActiveColor) r.setProperty('--sidebar-active-color', theme.sidebarActiveColor);
  if (theme.sidebarTextColor)   r.setProperty('--sidebar-text', theme.sidebarTextColor);
  if (theme.sidebarGroupColor)  r.setProperty('--sidebar-group', theme.sidebarGroupColor);
  if (theme.fontScale) document.documentElement.style.fontSize = theme.fontScale;
  if (theme.cardShadow) {
    const shadows = { none: 'none', soft: '0 1px 3px rgba(0,0,0,0.06)', medium: '0 4px 14px rgba(0,0,0,0.10)' };
    r.setProperty('--card-shadow', shadows[theme.cardShadow] || shadows.soft);
  }
  if (theme.fontFamily) {
    r.setProperty('--font-family', theme.fontFamily);
    document.body.style.fontFamily = `'${theme.fontFamily}', sans-serif`;
  }
  if (theme.customCss) {
    let styleEl = document.getElementById('custom-theme-css');
    if (!styleEl) { styleEl = document.createElement('style'); styleEl.id = 'custom-theme-css'; document.head.appendChild(styleEl); }
    styleEl.textContent = theme.customCss;
  }
};

const themeSlice = createSlice({
  name: 'theme',
  initialState: defaults,
  reducers: {
    setTheme: (state, { payload }) => {
      Object.assign(state, payload);
      applyTheme({ ...state, ...payload });
    },
  },
});

export const { setTheme } = themeSlice.actions;
export { applyTheme };
export default themeSlice.reducer;
