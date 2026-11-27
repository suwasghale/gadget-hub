# Gadget Hub

A full-stack e-commerce platform for gadgets: a Django REST Framework API and a Next.js storefront and admin, kept in one repository and laid out like `sg-fullstack-starter`.

This repository merges two earlier repositories, with their full commit history:

- `backend/` came from [suwasghale/drf-api](https://github.com/suwasghale/drf-api)
- `frontend/` came from [suwasghale/gadget_hub](https://github.com/suwasghale/gadget_hub)

## Start here

### Backend (http://127.0.0.1:8000)

```sh
cd backend
python -m venv .venv
.venv\Scripts\activate          # Windows; use `source .venv/bin/activate` on macOS/Linux
pip install -r requirements.txt
cp .env.example .env            # set DB_ENGINE=sqlite to skip MySQL locally
python manage.py migrate
python manage.py seed_products  # optional: 8 demo laptops
python manage.py createsuperuser
python manage.py runserver
```

`manage.py` uses `config.settings.dev`. `wsgi.py` and `asgi.py` use `config.settings.prod`, which requires `SECRET_KEY` and `ALLOWED_HOSTS` from the environment.

Locally the backend needs no Redis, Cloudinary or payment keys: without `REDIS_URL` it uses an in-process cache, without Cloudinary credentials uploads are stored in `backend/media/`, and emails (such as the verification link) are printed in the `runserver` console.

### Frontend (http://localhost:3000)

```sh
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

| Service | Local address |
| --- | --- |
| Storefront | http://localhost:3000 |
| Frontend admin | http://localhost:3000/admin |
| Django admin | http://127.0.0.1:8000/admin/ |
| API (v1) | http://127.0.0.1:8000/api/v1/ |
| API documentation | http://127.0.0.1:8000/api/schema/swagger-ui/ |

## How the frontend talks to the backend

```text
browser ──► Next.js (localhost:3000) ──► Django (API_INTERNAL_URL)
            /api/proxy/<path>            /api/v1/<path>/
            /api/auth/login | logout     /api/v1/auth/login|logout/
```

- **The browser only calls Next.js.** Client code uses `api()` from `frontend/lib/api/client.ts`, which goes to the same-origin `/api/proxy/*` route. Because of that, Django needs no CORS setup for the storefront, and `API_INTERNAL_URL` is never sent to the browser.
- **Login tokens live in HttpOnly cookies.** `/api/auth/login` signs in against Django and stores the access and refresh tokens in `gh_access` and `gh_refresh`, which page JavaScript cannot read. The proxy adds `Authorization: Bearer ...` to each request. When the access token expires, the proxy refreshes it once and saves the new tokens. Requests that change data are rejected if they come from another site.
- **Server components call Django directly** through `serverApi()` in `frontend/lib/api/server.ts`. The home page's featured products and the product detail page are built this way.
- **Signed-in state** comes from `useAuth()` (`frontend/features/auth/AuthProvider.tsx`), which loads `profile/me/` once when the page opens.
- **Sign-up** sends a verification email that links to `/verify-email` on the frontend. Users can sign in only after verifying.

## Structure

```text
backend/apps/             Domain apps: users, products, cart, orders, payments,
                          shipments, invoices, discounts, wishlist, addresses,
                          notifications, analytics, support
backend/core/             Shared permissions, mixins and admin logging
backend/config/           Django project: settings (base/dev/prod), urls, asgi, wsgi
frontend/app/             Next.js routes: (site), (admin), products
frontend/components/      Layout and shadcn/ui components
frontend/features/        Feature modules: admin, auth, home, menu, products
frontend/lib/             API client and shared helpers
frontend/public/          Static assets
```

See [backend/README.md](backend/README.md) for the API's features and endpoints.
