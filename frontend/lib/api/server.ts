import { cookies } from "next/headers";

import { API_V1 } from "@/lib/api/config";
import { ApiError, parseResponse } from "@/lib/api/client";
import { ACCESS_COOKIE } from "@/lib/auth/tokens";

/**
 * Server-side API call for server components: talks to Django directly,
 * forwarding the visitor's access token when there is one.
 *
 * Server components cannot set cookies, so an expired token is not refreshed
 * here; the next client-side call through /api/proxy does that.
 */
export async function serverApi<T = unknown>(
  path: string,
  init: RequestInit & { revalidate?: number } = {},
): Promise<T> {
  const { revalidate, headers, ...rest } = init;
  const finalHeaders = new Headers(headers);
  finalHeaders.set("Accept", "application/json");

  const access = (await cookies()).get(ACCESS_COOKIE)?.value;
  if (access) finalHeaders.set("Authorization", `Bearer ${access}`);

  const response = await fetch(`${API_V1}/${path.replace(/^\/+/, "")}`, {
    ...rest,
    headers: finalHeaders,
    // Per-user responses must not be cached across visitors.
    ...(access || revalidate === undefined
      ? { cache: "no-store" as const }
      : { next: { revalidate } }),
  });
  return parseResponse<T>(response);
}

export { ApiError };
