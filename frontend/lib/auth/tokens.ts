import type { NextResponse } from "next/server";

import { TOKEN_REFRESH_URL } from "@/lib/api/config";

/**
 * JWTs from Django are kept in HttpOnly cookies set by the Next.js server.
 * Browser JavaScript can never read them, so an XSS bug cannot steal a
 * session. Route handlers attach them to Django requests as a Bearer header.
 */
export const ACCESS_COOKIE = "gh_access";
export const REFRESH_COOKIE = "gh_refresh";

// Match Django's SIMPLE_JWT lifetimes (15 minutes / 7 days).
const ACCESS_MAX_AGE = 15 * 60;
const REFRESH_MAX_AGE = 7 * 24 * 60 * 60;

export interface TokenPair {
  access: string;
  refresh?: string;
}

const baseCookie = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

export function setTokenCookies(response: NextResponse, tokens: TokenPair) {
  response.cookies.set(ACCESS_COOKIE, tokens.access, { ...baseCookie, maxAge: ACCESS_MAX_AGE });
  if (tokens.refresh) {
    response.cookies.set(REFRESH_COOKIE, tokens.refresh, {
      ...baseCookie,
      maxAge: REFRESH_MAX_AGE,
    });
  }
}

export function clearTokenCookies(response: NextResponse) {
  response.cookies.set(ACCESS_COOKIE, "", { ...baseCookie, maxAge: 0 });
  response.cookies.set(REFRESH_COOKIE, "", { ...baseCookie, maxAge: 0 });
}

/**
 * Exchange a refresh token for a new pair. Django rotates refresh tokens,
 * so the response normally carries a new refresh token as well.
 */
export async function refreshTokens(refresh: string): Promise<TokenPair | null> {
  try {
    const res = await fetch(TOKEN_REFRESH_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ refresh }),
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = (await res.json()) as TokenPair;
    return data.access ? data : null;
  } catch {
    return null;
  }
}

/**
 * Reject cross-site mutations. SameSite=Lax already keeps the cookies off
 * cross-site POSTs; this is a second check on the Origin header.
 */
export function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true; // same-origin fetches from older browsers / server calls
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}
