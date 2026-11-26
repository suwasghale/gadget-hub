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
cp .env.example .env            # then fill in database, email and payment values
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

`manage.py` uses `config.settings.dev`. `wsgi.py` and `asgi.py` use `config.settings.prod`, which requires `SECRET_KEY` and `ALLOWED_HOSTS` from the environment.

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
