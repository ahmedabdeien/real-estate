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
  navbarBg: '#ffffff',
  navbarText: '#231f20',
  navbarBorder: '#ededed',
  tableStriped: false,
  tableHover: true,
  density: 'comfortable',
  loginTitle: 'مرحباً بعودتك',
  loginSubtitle: 'سجّل دخولك للمتابعة إلى لوحة التحكم',
  loginBg: '#fafafc',
  reduceMotion: false,
  scrollbarStyle: 'thin',
  successColor: '#009756',
  warningColor: '#fbb140',
  dangerColor: '#dc2626',
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

  // الشريط العلوي
  if (theme.navbarBg)     r.setProperty('--navbar-bg', theme.navbarBg);
  if (theme.navbarText)   r.setProperty('--navbar-text', theme.navbarText);
  if (theme.navbarBorder) r.setProperty('--navbar-border', theme.navbarBorder);

  // ألوان الحالات
  if (theme.successColor) r.setProperty('--color-success', theme.successColor);
  if (theme.warningColor) r.setProperty('--color-warning', theme.warningColor);
  if (theme.dangerColor)  r.setProperty('--color-danger', theme.dangerColor);

  // كثافة العرض
  r.setProperty('--row-py', theme.density === 'compact' ? '6px' : '12px');
  r.setProperty('--card-p', theme.density === 'compact' ? '12px' : '20px');

  // إعدادات سلوكية تُطبق عبر <style> ديناميكي
  let behaviorEl = document.getElementById('theme-behavior-css');
  if (!behaviorEl) { behaviorEl = document.createElement('style'); behaviorEl.id = 'theme-behavior-css'; document.head.appendChild(behaviorEl); }
  const rules = [];
  if (theme.reduceMotion) {
    rules.push('*, *::before, *::after { animation-duration: 0.001s !important; transition-duration: 0.001s !important; }');
  }
  if (theme.scrollbarStyle === 'thin') {
    rules.push('::-webkit-scrollbar { width: 6px; height: 6px; } ::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.18); border-radius: 99px; } ::-webkit-scrollbar-track { background: transparent; }');
  } else if (theme.scrollbarStyle === 'hidden') {
    rules.push('::-webkit-scrollbar { width: 0; height: 0; }');
  }
  if (theme.tableStriped) {
    rules.push('tbody tr:nth-child(even) { background: rgba(0,0,0,0.022); }');
  }
  if (theme.tableHover !== false) {
    rules.push('tbody tr:hover { background: color-mix(in srgb, var(--color-primary) 4%, transparent); }');
  }
  behaviorEl.textContent = rules.join('\n');

  /* الوضع الليلي — يتفوق على كل الألوان (آخر ما يُطبق) */
  if (theme.darkMode) {
    r.setProperty('--color-background', '#151213');
    r.setProperty('--color-surface', '#211d1e');
    r.setProperty('--color-text-dark', '#f3f4f6');
    r.setProperty('--color-text-muted', '#9ca3af');
    r.setProperty('--color-border', '#373132');
    r.setProperty('--navbar-bg', '#211d1e');
    r.setProperty('--navbar-text', '#f3f4f6');
    r.setProperty('--navbar-border', '#373132');
    document.documentElement.classList.add('dark-mode');
  } else {
    document.documentElement.classList.remove('dark-mode');
  }
};

/* تفضيلات المستخدم الشخصية — تُحفظ في المتصفح وتتفوق على ثيم الشركة
   وتُسترجع تلقائياً عند تحديث الصفحة أو إعادة الدخول */
const USER_THEME_KEY = 'egyestate-user-theme';

const loadUserOverrides = () => {
  try { return JSON.parse(localStorage.getItem(USER_THEME_KEY)) || {}; }
  catch { return {}; }
};

const initialOverrides = loadUserOverrides();

const themeSlice = createSlice({
  name: 'theme',
  initialState: { ...defaults, ...initialOverrides, userOverrides: initialOverrides },
  reducers: {
    /* ثيم الشركة من السيرفر — تفضيلات المستخدم تبقى فوقه دائماً */
    setTheme: (state, { payload }) => {
      Object.assign(state, payload, state.userOverrides);
      applyTheme({ ...state });
    },
    /* تفضيل شخصي — يُحفظ فوراً في localStorage */
    setUserTheme: (state, { payload }) => {
      state.userOverrides = { ...state.userOverrides, ...payload };
      try { localStorage.setItem(USER_THEME_KEY, JSON.stringify(state.userOverrides)); } catch { /* تجاهل امتلاء التخزين */ }
      Object.assign(state, payload);
      applyTheme({ ...state });
    },
    /* استعادة ثيم الشركة الافتراضي */
    resetUserTheme: (state) => {
      try { localStorage.removeItem(USER_THEME_KEY); } catch { /* */ }
      state.userOverrides = {};
      state.darkMode = false;
      applyTheme({ ...state });
    },
  },
});

export const { setTheme, setUserTheme, resetUserTheme } = themeSlice.actions;
export { applyTheme };

/* تطبيق التفضيلات المحفوظة فور تحميل التطبيق — قبل وصول ثيم السيرفر */
if (typeof document !== 'undefined') {
  applyTheme({ ...defaults, ...initialOverrides });
}

export default themeSlice.reducer;
