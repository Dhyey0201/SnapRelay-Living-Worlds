import { NextResponse } from 'next/server';
export class ApiError extends Error { constructor(public code: string, message: string, public status = 400) { super(message); } }
export const ok = (data: unknown, status = 200) => NextResponse.json({ ok: true, data }, { status, headers: { 'Cache-Control': 'no-store' } });
export const fail = (error: unknown) => {
  const e = error instanceof ApiError ? error : new ApiError('INTERNAL', 'Something went wrong. Please try again.', 500);
  if (!(error instanceof ApiError)) console.error(error);
  return NextResponse.json({ ok: false, error: { code: e.code, message: e.message } }, { status: e.status, headers: { 'Cache-Control': 'no-store' } });
};
export async function body<T>(request: Request, schema: { parse: (v: unknown) => T }): Promise<T> {
  const length = Number(request.headers.get('content-length') ?? 0); if (length > 8000) throw new ApiError('BODY_TOO_LARGE', 'Request is too large.', 413);
  try { return schema.parse(await request.json()); } catch { throw new ApiError('INVALID_REQUEST', 'Please check the request and try again.', 400); }
}
export function sameOrigin(request: Request) {
  const origin = request.headers.get('origin');
  if (origin && new URL(origin).host !== new URL(request.url).host) throw new ApiError('ORIGIN_REJECTED', 'Request origin not allowed.', 403);
}
export async function rateLimit(key: string, limit = 40) {
  const result = await (await import('./db')).pool.query(`INSERT INTO rate_limits(key,window_started_at,count) VALUES($1,now(),1)
    ON CONFLICT(key) DO UPDATE SET count=CASE WHEN rate_limits.window_started_at < now()-interval '1 minute' THEN 1 ELSE rate_limits.count+1 END,
    window_started_at=CASE WHEN rate_limits.window_started_at < now()-interval '1 minute' THEN now() ELSE rate_limits.window_started_at END RETURNING count`, [key]);
  if (result.rows[0].count > limit) throw new ApiError('RATE_LIMITED', 'Too many requests. Please wait a moment.', 429);
}
