# TravHub

A full-stack travel booking website: browse tours, save favourites, book seats, check out and track orders.
Administrators manage tours, orders and users from a protected Admin Panel.

- **Frontend:** React 19 + Vite, React Router (`/` – project root)
- **Backend:** Node.js + Express 5 REST API (`/backend`)
- **Database:** MongoDB + Mongoose
- **Auth:** JWT, roles `user` / `admin`, password reset, Google / Facebook OAuth (optional)

## Features

**Visitors and users**

- Tours list, carousel and sidebar page with search (title or location), category filter, sorting and "Load more"
- Tour details with booking form (seats are checked against stock)
- Register / login / logout, "Remember me", session restored with `/api/auth/me`
- Wishlist (heart button), cart, checkout and "My Orders"
- Forgot password → one-time reset link (15 minutes)

**Administrators** (`/admin`, role checked by the backend)

- Dashboard: products, orders, users, pending orders, recent orders
- Products: create, edit, delete, search, pagination
- Orders: all customers' orders, change status (cancelling returns seats to stock)
- Users: list and delete (admin accounts cannot be deleted)

## Project structure

```
TravHub/
├── src/                  React app (pages, components, context, services/api.js)
├── public/
├── index.html
├── vite.config.js
├── render.yaml           Render Blueprint: backend web service + frontend static site
├── .env.example          frontend environment variables
└── backend/
    ├── server.js         entry point (connects MongoDB, listens on PORT)
    ├── app.js            Express app: security headers, CORS, routes, errors
    ├── config/           env loading + checks, MongoDB connection
    ├── models/           User, Product, Cart, Order
    ├── controllers/      route logic
    ├── routes/           /api/auth, /api/products, /api/cart, /api/orders, /api/users, /api/wishlist
    ├── middleware/       protect / admin, rate limits, error handler
    ├── scripts/          seed, make-admin, reset-link, reset-test-users
    ├── tests/            API tests (node:test, separate test database)
    └── .env.example      backend environment variables
```

## Requirements

- Node.js **20.19 or newer**
- MongoDB – a local installation or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster

## Getting started (local)

```bash
# 1. install dependencies
npm install
npm --prefix backend install

# 2. create environment files from the examples
cp .env.example .env
cp backend/.env.example backend/.env
# then edit backend/.env: set MONGO_URI and a long random JWT_SECRET
# node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# 3. (first time only) add the sample tours to an EMPTY database
npm --prefix backend run seed

# 4. start the backend (http://localhost:5000)
npm --prefix backend run dev

# 5. start the frontend in a second terminal (http://localhost:5173)
npm run dev
```

> `npm run seed` replaces all products and clears carts and wishlists. Run it only on a new, empty database.

### Create the first administrator

Register a normal account on the website, then promote it:

```bash
npm --prefix backend run make-admin -- your@email.com
```

### Forgot password without email (local development)

If SMTP is not configured, reset emails are not sent. Create the same one-time link from the terminal and open it in the browser:

```bash
npm --prefix backend run reset-link -- your@email.com
```

## Scripts

| Where | Command | What it does |
|---|---|---|
| root | `npm run dev` | Vite dev server |
| root | `npm run build` | production build into `dist/` |
| root | `npm run preview` | serve the production build locally |
| root | `npm run lint` | ESLint |
| backend | `npm run dev` | API with auto-restart |
| backend | `npm start` | API (production) |
| backend | `npm test` | API tests (uses `MONGO_URI_TEST`, a separate `_test` database) |
| backend | `npm run seed` | add sample tours (empty database only) |
| backend | `npm run make-admin -- email` | give an existing account the admin role |
| backend | `npm run reset-link -- email` | print a password reset link (development only) |
| backend | `npm run reset-test-users -- email … [--confirm]` | delete listed test accounts (dry run without `--confirm`; admins are protected) |
| backend | `npm run copy-db [-- --confirm]` | copy the local database to an empty Atlas database (dry run without `--confirm`) |

## Environment variables

Real values live in `.env` files, which are **git-ignored**. Never commit them.

### Frontend (`.env` in the project root)

| Variable | Example | Notes |
|---|---|---|
| `VITE_API_URL` | `http://localhost:5000/api` | Backend URL **including `/api`**. Read at **build time** – rebuild after changing it. |

### Backend (`backend/.env`)

| Variable | Required | Example / notes |
|---|---|---|
| `NODE_ENV` | yes | `development` locally, `production` when deployed |
| `PORT` | no | `5000` locally; hosting platforms set it automatically |
| `MONGO_URI` | yes | `mongodb://127.0.0.1:27017/travhub` or an Atlas `mongodb+srv://…` URI (`MONGODB_URI` is accepted too) |
| `JWT_SECRET` | yes | long random string (production refuses short / example values) |
| `JWT_EXPIRE` | yes | e.g. `7d` |
| `CLIENT_URL` | yes in production | frontend URL(s) for CORS, reset links and OAuth, comma-separated |
| `TRUST_PROXY` | production | `1` behind a hosting proxy (Render, Railway) so rate limits see real IPs |
| `MONGO_URI_TEST` | tests | database name must end with `_test` |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM` | for reset emails | without SMTP, production returns 503 for "Forgot password" |
| `SERVER_URL` | for OAuth | public backend URL, used to build OAuth redirect URIs |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | optional | Google login |
| `FACEBOOK_APP_ID`, `FACEBOOK_APP_SECRET` | optional | Facebook login |

## Deployment

| Part | Service | Why |
|---|---|---|
| Database | **MongoDB Atlas** (free M0) | managed MongoDB, works with the existing Mongoose code unchanged |
| Backend | **Render** – Web Service (free) | runs `npm start` from `backend/`, sets `PORT`, deploys from GitHub on every push |
| Frontend | **Render** – Static Site (free) | builds Vite into `dist/`, free HTTPS domain, SPA rewrite configured in `render.yaml` |

### 1. MongoDB Atlas

1. Create a free M0 cluster and a database user (username + password).
2. Network Access → allow `0.0.0.0/0` (Render's free plan has no fixed IP addresses).
3. Connect → Drivers → copy the URI and add the database name:
   `mongodb+srv://USER:PASSWORD@CLUSTER.mongodb.net/travhub?retryWrites=true&w=majority`
4. Move the existing local data (accounts incl. the admin, tours, carts, wishlists, orders) to Atlas:
   put the URI into `backend/.env.migrate` as `TARGET_MONGO_URI=...` (this file is git-ignored), then
   ```bash
   npm --prefix backend run copy-db              # dry run – shows what will be copied
   npm --prefix backend run copy-db -- --confirm # copies; refuses if the Atlas database is not empty
   ```
   The local database is only read, never changed. Accounts keep their passwords and roles.

### 2. Backend + frontend on Render (Blueprint)

Render → **New → Blueprint** → select this repository. `render.yaml` creates:

- **travhub-sema-api** (Web Service): root `backend`, build `npm install`, start `npm start`, health check `/api/health`,
  `NODE_ENV=production`, `TRUST_PROXY=1`, `JWT_EXPIRE=7d`, and a random `JWT_SECRET` generated by Render.
- **travhub-tours** (Static Site): build `npm install && npm run build`, publish `dist`, every route rewritten to `index.html`.

The public addresses are written in `render.yaml` (they are not secret):

| Service | Variable | Value |
|---|---|---|
| travhub-sema-api | `CLIENT_URL` | `https://travhub-tours.onrender.com` (frontend) |
| travhub-sema-api | `SERVER_URL` | `https://travhub-sema-api.onrender.com` (backend) |
| travhub-tours | `VITE_API_URL` | `https://travhub-sema-api.onrender.com/api` |

Render asks only for `MONGO_URI` (the Atlas URI). Secrets added later in the dashboard
(SMTP, Google, Facebook) are not stored in the repository.

If Render gives a service a different address (when a name is taken), change these values in `render.yaml`
(Vite reads `VITE_API_URL` at build time, so the static site rebuilds after the change).

Free Render web services sleep after ~15 minutes without traffic; the first request afterwards can take up to a minute.

### OAuth redirect URIs (only if Google / Facebook login is used)

- Google: `https://<your-api>.onrender.com/api/auth/google/callback`
- Facebook: `https://<your-api>.onrender.com/api/auth/facebook/callback`

Add `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` and / or `FACEBOOK_APP_ID` / `FACEBOOK_APP_SECRET` to the backend service.
Without SMTP variables, "Forgot password" answers 503 in production (no fake emails).

## Security notes

- Passwords are hashed with bcrypt; password reset tokens are stored only as SHA-256 hashes and expire after 15 minutes.
- JWTs issued before a password change are rejected.
- Admin routes are protected on the backend (`protect` + `admin` middleware); hiding links in the UI is only for convenience.
- Rate limits on login, register and password reset; security headers via `helmet`.
