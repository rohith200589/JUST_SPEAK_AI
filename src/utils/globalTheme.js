export const THEME_KEY = 'globalTheme';

export function setGlobalTheme(theme) {
 localStorage.setItem(THEME_KEY, theme);
 window.dispatchEvent(new CustomEvent('themeChange', { detail: theme }));
}

export function getGlobalTheme() {
 return localStorage.getItem(THEME_KEY) || 'light';
}

export function subscribeToThemeChange(callback) {
 window.addEventListener('themeChange', (e) => callback(e.detail));
 window.addEventListener('storage', (e) => {
 if (e.key === THEME_KEY) callback(e.newValue);
 });
}
