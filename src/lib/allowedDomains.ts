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
