// Plain (non-'use client') module on purpose: the root layout is a server
// component and needs to embed THEME_INIT_SCRIPT as a string, which it
// can't do if this lived in a 'use client' file.

export const THEME_STORAGE_KEY = 'bp-theme';

/**
 * Runs in <head> BEFORE first paint (see app/layout.tsx), so the right
 * theme is on <html> before any content renders — otherwise dark-mode
 * users would see a flash of the light theme on every page load.
 * Order of precedence: saved choice, then the OS preference, then light.
 */
export const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem('${THEME_STORAGE_KEY}');if(t!=='light'&&t!=='dark'){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`;
