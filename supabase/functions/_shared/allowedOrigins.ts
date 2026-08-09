// Shared origin allowlist for admin/2FA edge functions.
const ALLOWED_EXACT = [
  'https://lovable.app',
  'https://aiagecalc.com',
  'https://www.aiagecalc.com',
];

export const isAllowedOrigin = (origin: string): boolean => {
  if (!origin) return true; // no origin header (server-to-server / curl)
  return (
    ALLOWED_EXACT.includes(origin) ||
    origin.endsWith('.lovableproject.com') ||
    origin.endsWith('.lovable.app')
  );
};

export const parseOrigin = (req: Request): string => {
  const raw = req.headers.get('origin') || req.headers.get('referer') || '';
  try {
    return new URL(raw).origin;
  } catch {
    return '';
  }
};
