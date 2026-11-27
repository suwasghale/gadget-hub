/**
 * Browser-side API client. Every call goes to the same-origin proxy
 * (/api/proxy/...), which forwards to Django with the session cookies.
 *
 *   api<Product[]>("products/featured/")
 *   api("auth/register/", { method: "POST", json: { ... } })
 */

export class ApiError extends Error {
  constructor(
    public status: number,
    public data: unknown,
  ) {
    super(errorMessage(data) || `Request failed with status ${status}`);
    this.name = "ApiError";
  }
}

export interface ApiOptions extends Omit<RequestInit, "body"> {
  /** Sent as a JSON body with the right Content-Type. */
  json?: unknown;
  body?: BodyInit;
}

export async function api<T = unknown>(path: string, options: ApiOptions = {}): Promise<T> {
  const { json, headers, ...init } = options;
  const finalHeaders = new Headers(headers);
  finalHeaders.set("Accept", "application/json");

  let body = init.body;
  if (json !== undefined) {
    finalHeaders.set("Content-Type", "application/json");
    body = JSON.stringify(json);
  }

  const url = proxyUrl(path);
  const response = await fetch(url, {
    ...init,
    headers: finalHeaders,
    body,
    credentials: "same-origin",
  });
  return parseResponse<T>(response);
}

/**
 * "products/featured/?x=1" -> "/api/proxy/products/featured?x=1".
 * Next.js redirects trailing-slash URLs, so the slash is dropped here and
 * the proxy adds back the one Django's routes expect.
 */
export function proxyUrl(path: string): string {
  const trimmed = path.replace(/^\/+/, "");
  const queryStart = trimmed.indexOf("?");
  const pathname = queryStart === -1 ? trimmed : trimmed.slice(0, queryStart);
  const query = queryStart === -1 ? "" : trimmed.slice(queryStart);
  return `/api/proxy/${pathname.replace(/\/+$/, "")}${query}`;
}

export async function parseResponse<T>(response: Response): Promise<T> {
  const text = await response.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }
  if (!response.ok) throw new ApiError(response.status, data);
  return data as T;
}

/**
 * Turn a DRF error body into one readable line:
 *   {"detail": "..."}, {"message": "..."}, {"non_field_errors": [...]},
 *   {"email": ["..."], "password": ["..."]}
 */
export function errorMessage(data: unknown): string {
  if (!data) return "";
  if (typeof data === "string") return data.length > 200 ? "" : data;
  if (Array.isArray(data)) return data.map(errorMessage).filter(Boolean).join(" ");
  if (typeof data === "object") {
    const record = data as Record<string, unknown>;
    for (const key of ["detail", "message", "non_field_errors"]) {
      if (record[key]) return errorMessage(record[key]);
    }
    return Object.entries(record)
      .map(([field, value]) => {
        const text = errorMessage(value);
        return text ? `${field.replace(/_/g, " ")}: ${text}` : "";
      })
      .filter(Boolean)
      .join(" ");
  }
  return "";
}
