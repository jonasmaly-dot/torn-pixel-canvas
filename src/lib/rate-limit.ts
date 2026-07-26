const attempts = new Map<string, { count: number; reset: number }>();
export function rateLimit(key: string, max = 8, windowMs = 60_000) {
  const now = Date.now(); const current = attempts.get(key);
  if (!current || current.reset < now) { attempts.set(key, { count: 1, reset: now + windowMs }); return true; }
  current.count++; return current.count <= max;
}
