import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

export interface RateLimitOptions {
  windowMs: number;
  maxRequests: number;
}

export function rateLimitMiddleware(options: RateLimitOptions) {
  const store = new Map<string, RateLimitEntry>();

  return createMiddleware(async (c, next) => {
    const now = Date.now();
    const clientIp =
      c.req.header("x-forwarded-for")?.split(",")[0]?.trim() ??
      c.req.header("x-real-ip") ??
      "anonymous";

    const existing = store.get(clientIp);

    if (!existing || now >= existing.resetAt) {
      store.set(clientIp, {
        count: 1,
        resetAt: now + options.windowMs,
      });
    } else {
      existing.count += 1;
      if (existing.count > options.maxRequests) {
        const retryAfterSec = Math.ceil((existing.resetAt - now) / 1000);
        c.header("Retry-After", String(retryAfterSec));
        throw new HTTPException(429, {
          message: "Demasiadas solicitudes de verificación. Intente nuevamente más tarde.",
        });
      }
    }

    if (store.size > 10000) {
      for (const [key, entry] of store.entries()) {
        if (now >= entry.resetAt) {
          store.delete(key);
        }
      }
    }

    await next();
  });
}
