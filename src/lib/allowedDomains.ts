// Single source of truth for which origins may access admin routes.
const ALLOWED_EXACT = [
  'https://lovable.app',
  'https://aiagecalc.com',
  'https://www.aiagecalc.com',
];

export const isAllowedDomain = (origin: string): boolean => {
  return (
    ALLOWED_EXACT.includes(origin) ||
    origin.endsWith('.lovableproject.com') ||
    origin.endsWith('.lovable.app') ||
    origin.startsWith('http://localhost')
  );
};

export const REDIRECT_DOMAIN = 'https://aiagecalc.com';

// Loop-safe redirect: never navigate to the origin we are already on.
export const redirectToAllowedDomain = () => {
  if (window.location.origin === REDIRECT_DOMAIN) return;
  window.location.href = REDIRECT_DOMAIN;
};
