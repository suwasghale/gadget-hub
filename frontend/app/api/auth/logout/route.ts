import { type NextRequest, NextResponse } from "next/server";

import { API_V1 } from "@/lib/api/config";
import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  clearTokenCookies,
  isSameOrigin,
  refreshTokens,
} from "@/lib/auth/tokens";

/**
 * POST: blacklist the refresh token in Django, then clear the cookies.
 * The cookies are cleared even if Django is unreachable.
 */
export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ detail: "Cross-site request blocked." }, { status: 403 });
  }

  let access = request.cookies.get(ACCESS_COOKIE)?.value;
  let refresh = request.cookies.get(REFRESH_COOKIE)?.value;

  if (refresh) {
    try {
      // Django's logout view requires an authenticated request.
      if (!access) {
        const rotated = await refreshTokens(refresh);
        access = rotated?.access;
        refresh = rotated?.refresh ?? refresh;
      }
      if (access) {
        await fetch(`${API_V1}/auth/logout/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${access}`,
          },
          body: JSON.stringify({ refresh }),
          cache: "no-store",
        });
      }
    } catch {
      // Ignore: the local session ends regardless.
    }
  }

  const response = NextResponse.json({ ok: true });
  clearTokenCookies(response);
  return response;
}
