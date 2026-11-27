/**
 * Where the Django API lives, as seen from the Next.js server.
 *
 * Only server code (route handlers, server components) talks to Django
 * directly. The browser calls same-origin /api/* routes, so this value is
 * never sent to the client and Django needs no CORS for the storefront.
 */
const API_INTERNAL_URL = (process.env.API_INTERNAL_URL || "http://127.0.0.1:8000").replace(
  /\/+$/,
  "",
);

export const API_ROOT = API_INTERNAL_URL;
export const API_V1 = `${API_INTERNAL_URL}/api/v1`;
export const TOKEN_REFRESH_URL = `${API_INTERNAL_URL}/api/token/refresh/`;
