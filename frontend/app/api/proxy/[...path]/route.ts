import { type NextRequest, NextResponse } from "next/server";

import { API_V1 } from "@/lib/api/config";
import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  clearTokenCookies,
  isSameOrigin,
  refreshTokens,
  setTokenCookies,
  type TokenPair,
} from "@/lib/auth/tokens";

/**
 * Same-origin gateway to the Django API.
 *
 *   browser  ->  /api/proxy/products/?page=2  ->  {API_V1}/products/?page=2
 *
 * Adds the access token from the HttpOnly cookie, refreshes it once on a 401,
 * and writes rotated tokens back to the cookies.
 */

type RouteContext = { params: Promise<{ path: string[] }> };

const FORWARDED_REQUEST_HEADERS = ["accept", "content-type", "accept-language"];
const FORWARDED_RESPONSE_HEADERS = ["content-type", "content-disposition", "cache-control"];

async function handle(request: NextRequest, { params }: RouteContext) {
  const method = request.method.toUpperCase();

  if (method !== "GET" && method !== "HEAD" && !isSameOrigin(request)) {
    return NextResponse.json({ detail: "Cross-site request blocked." }, { status: 403 });
  }

  const { path } = await params;
  // Django routes end in a slash; Next drops it from catch-all segments.
  const target = `${API_V1}/${path.map(encodeURIComponent).join("/")}/${request.nextUrl.search}`;

  const headers = new Headers();
  for (const name of FORWARDED_REQUEST_HEADERS) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }

  const body =
    method === "GET" || method === "HEAD" ? undefined : await request.arrayBuffer();

  let access = request.cookies.get(ACCESS_COOKIE)?.value;
  const refresh = request.cookies.get(REFRESH_COOKIE)?.value;
  let rotated: TokenPair | null = null;
  let refreshFailed = false;

  // Access cookie expired (the browser dropped it) but the session is alive.
  if (!access && refresh) {
    rotated = await refreshTokens(refresh);
    if (rotated) access = rotated.access;
    else refreshFailed = true;
  }

  const send = (token?: string) => {
    const outgoing = new Headers(headers);
    if (token) outgoing.set("Authorization", `Bearer ${token}`);
    return fetch(target, { method, headers: outgoing, body, cache: "no-store", redirect: "manual" });
  };

  let upstream: Response;
  try {
    upstream = await send(access);

    // Access token rejected (expired or revoked): refresh once and retry.
    if (upstream.status === 401 && access && refresh && !rotated) {
      rotated = await refreshTokens(refresh);
      if (rotated) upstream = await send(rotated.access);
      else refreshFailed = true;
    }
  } catch {
    return NextResponse.json(
      { detail: "The API server is not reachable. Is Django running?" },
      { status: 502 },
    );
  }

  const responseHeaders = new Headers();
  for (const name of FORWARDED_RESPONSE_HEADERS) {
    const value = upstream.headers.get(name);
    if (value) responseHeaders.set(name, value);
  }

  const hasBody = upstream.status !== 204 && upstream.status !== 304 && method !== "HEAD";
  const response = new NextResponse(hasBody ? upstream.body : null, {
    status: upstream.status,
    headers: responseHeaders,
  });

  if (rotated) setTokenCookies(response, rotated);
  else if (refreshFailed) clearTokenCookies(response);

  return response;
}

export {
  handle as GET,
  handle as HEAD,
  handle as POST,
  handle as PUT,
  handle as PATCH,
  handle as DELETE,
};
