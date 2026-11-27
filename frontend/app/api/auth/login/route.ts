import { NextResponse } from "next/server";

import { API_V1 } from "@/lib/api/config";
import { isSameOrigin, setTokenCookies, type TokenPair } from "@/lib/auth/tokens";

/**
 * POST { identifier, password }  (identifier = email or username)
 *
 * Logs in against Django, stores the JWTs in HttpOnly cookies and returns
 * the user. The tokens themselves never reach the browser.
 */
export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ detail: "Cross-site request blocked." }, { status: 403 });
  }

  let credentials: { identifier?: string; password?: string };
  try {
    credentials = await request.json();
  } catch {
    return NextResponse.json({ detail: "Invalid request body." }, { status: 400 });
  }

  try {
    const login = await fetch(`${API_V1}/auth/login/`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        identifier: credentials.identifier ?? "",
        password: credentials.password ?? "",
      }),
      cache: "no-store",
    });

    const loginData = await login.json().catch(() => ({}));
    if (!login.ok) {
      return NextResponse.json(loginData, { status: login.status });
    }

    const tokens = loginData as TokenPair;
    const me = await fetch(`${API_V1}/profile/me/`, {
      headers: { Authorization: `Bearer ${tokens.access}`, Accept: "application/json" },
      cache: "no-store",
    });
    const user = me.ok ? await me.json() : null;

    const response = NextResponse.json({ user });
    setTokenCookies(response, tokens);
    return response;
  } catch {
    return NextResponse.json(
      { detail: "The API server is not reachable. Is Django running?" },
      { status: 502 },
    );
  }
}
