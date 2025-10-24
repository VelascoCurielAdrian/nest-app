import type { FastifyReply, FastifyRequest } from 'fastify';

export function setAuthCookie(res: FastifyReply, token: string, opts?: { isDevelopment?: boolean; maxAgeSeconds?: number }) {
  const isDevelopment = opts?.isDevelopment ?? process.env.NODE_ENV === 'development';
  const maxAge = opts?.maxAgeSeconds ?? 60 * 60 * 24 * 140; // 140 días
  // usar plugin de cookies
  (res as unknown as { setCookie: (...args: any[]) => void }).setCookie('access_token', token, {
    httpOnly: true,
    secure: !isDevelopment,
    sameSite: isDevelopment ? 'lax' : 'none',
    path: '/',
    maxAge,
  });
}

export function clearAuthCookie(res: FastifyReply) {
  (res as unknown as { clearCookie: (...args: any[]) => void }).clearCookie('access_token', { path: '/' });
}

export function getCookie(req: FastifyRequest, name: string): string | undefined {
  const cookies = (req as unknown as { cookies?: Record<string, string> }).cookies;
  return cookies ? cookies[name] : undefined;
}
