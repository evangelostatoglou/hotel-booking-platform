# Hotel Booking Platform

A full-stack booking application for a single hotel, built with TypeScript, Express, PostgreSQL, and React. Visitors can browse room types, check availability, create an account, make bookings, and view their own reservations.

This is primarily a backend portfolio project. Its focus is relational database design, handwritten SQL, authentication, validation, transactions, and concurrent room allocation. The React frontend provides a practical way to use the API.

## Why I built it

I built this project to show how I organize a small backend application, model hotel data in PostgreSQL, and protect a limited resource when multiple booking requests compete for it.

I chose direct SQL with `pg` rather than an ORM so that joins, transaction boundaries, pricing, and PostgreSQL row locks are visible in the code.

The React frontend was developed with AI assistance. My main contribution and focus are the backend and database design.

## What works

- Browse Single, Double, Twin, and Suite room types.
- View a room type with amenities and images.
- Register, log in, log out, and load the current user.
- Check availability for one or more room types.
- Create a confirmed booking with adults, children, and an optional special request.
- Calculate the booking price from database prices and the requested number of nights.
- Assign physical rooms inside a transaction.
- View bookings belonging to the authenticated user.
- Start with existing data, a clean catalogue, or demo data.
- Run the project with Docker Compose.

New API bookings are immediately confirmed. Payments, cancellation, and admin features are not implemented yet.

## Technology

| Part | Tools |
| --- | --- |
| Backend | Node.js 24, TypeScript, Express 5 |
| Database | PostgreSQL 17, `pg`, handwritten SQL |
| Migrations | `node-pg-migrate` |
| Authentication | bcrypt, JWT, HTTP-only cookies |
| Validation | Zod |
| Middleware | Helmet, CORS, cookie-parser, Morgan, express-rate-limit |
| Tests | Jest, Supertest, ts-jest |
| Frontend | React, TypeScript, Vite, React Router |
| Containers | Docker Compose, multi-stage Dockerfiles, Nginx |

## Run with Docker

Docker Desktop must be running. From the project root, create `server/.env.docker`:

```env
PORT=5000
DB_HOST=db
DB_PORT=5432
DB_USER=hotel_app
DB_PASSWORD=hotel_password
DB_NAME=hotel_booking
DB_ADMIN_DATABASE=postgres
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=1h
CLIENT_ORIGIN=http://localhost:5173
NODE_ENV=development
```

Then start with demo data:

```bash
STARTUP_MODE=demo docker compose up --build
```

| Service | Address |
| --- | --- |
| Website | http://localhost:5173 |
| API | http://localhost:5000 |
| Health check | http://localhost:5000/health |
| PostgreSQL from the host | `localhost:5433` |

Demo accounts:

| Email | Password | Role |
| --- | --- | --- |
| `alice@example.com` | `Guest123!` | Guest |
| `michael@example.com` | `Guest123!` | Guest |
| `sofia@example.com` | `Guest123!` | Guest |
| `admin@hotel.test` | `Admin123!` | Admin; no admin features yet |

### Startup modes

| Mode | Result |
| --- | --- |
| `resume` | Applies pending migrations and keeps existing data. |
| `empty` | Resets application data and seeds the room catalogue. |
| `demo` | Performs `empty` and adds demo users, bookings, and payments. |

`empty` and `demo` reset application data. After creating demo data, use `resume` to preserve it:

```bash
STARTUP_MODE=resume docker compose up --build
```

Useful commands:

```bash
docker compose ps
docker compose logs -f server
docker compose down
```

## Run locally

Install Node.js 24 and PostgreSQL. Create `server/.env` from `server/.env.example`, set your database credentials and JWT secret, then start the backend:

```bash
cd server
npm ci
npm run dev -- demo
```

Start the frontend in another terminal:

```bash
cd client
npm ci
npm run dev
```

Use `npm run dev -- resume` on later runs. For a compiled backend:

```bash
npm run build
npm start -- resume
```

## Backend structure

```text
server/
├── migrations/      Versioned schema migrations
├── src/
│   ├── app.ts       Express app, middleware, and route mounting
│   ├── server.ts    Database setup and HTTP startup
│   ├── config/      Connection pools and environment configuration
│   ├── routes/      Endpoint paths and route middleware
│   ├── controllers/ HTTP validation and responses
│   ├── services/    Application logic
│   ├── repositories/ SQL queries and booking transaction
│   ├── middleware/  Authentication, origin, and error handling
│   ├── validators/  Zod request schemas
│   ├── db/          Database creation, migrations, reset, and seed logic
│   └── utils/       JWT, cookie, and date helpers
└── tests/
```

Requests normally follow:

```text
route → middleware → controller → service → repository → PostgreSQL
```

## Authentication and request handling

Registration validates input, checks the email, hashes the password with bcrypt, and stores the user. Login compares the submitted password with the stored hash.

Login and registration issue a JWT in an `access_token` HTTP-only cookie. Protected routes verify the JWT locally and store its identity in `res.locals.auth`; most authenticated requests do not need a user lookup.

`GET /auth/me` is intentionally different: after verifying the token, it loads the latest public user profile from PostgreSQL. This means a current name, email, and role are returned.

`JWT_EXPIRES_IN` is required and accepts whole-number durations such as `30m`, `1h`, or `7d`. The cookie expiration matches the token expiration. Browser POST requests with an `Origin` header must match `CLIENT_ORIGIN`; this is a lightweight CSRF safeguard, not a replacement for JWT security or a full CSRF-token system.

The central error handler maps booking business errors consistently:

| Case | Status | Code |
| --- | --- | --- |
| Invalid room type | `400` | `INVALID_ROOM_TYPE` |
| Insufficient rooms | `409` | `INSUFFICIENT_AVAILABILITY` |
| Guest capacity exceeded | `422` | `CAPACITY_EXCEEDED` |

Unexpected errors return a generic `500` response.

## Database and booking logic

The main tables are:

| Table | Purpose |
| --- | --- |
| `users` | User accounts, password hashes, and roles. |
| `room_types` | Public room categories, capacities, and nightly prices. |
| `rooms` | Physical hotel rooms. |
| `bookings` | Booking dates, guests, status, price, and request. |
| `bookings_rooms` | Links bookings to allocated physical rooms. |
| `payments` | Demo payment-shaped data; no payment gateway exists. |
| `amenities`, `room_types_amenities`, `room_type_images` | Room metadata. |

The overlap rule is:

```sql
existing.check_in < requested_check_out
AND existing.check_out > requested_check_in
```

The availability endpoint only reports current availability; it does not reserve a room. Booking creation is authoritative and runs in a transaction:

1. Read room capacity and current price from the database.
2. Select physical rooms with `FOR UPDATE OF r SKIP LOCKED`.
3. Check capacity and calculate the final price.
4. Insert the booking and its room links.
5. Commit, or roll back the whole operation on failure.

`SKIP LOCKED` means competing transactions skip rooms another booking transaction already locked. This prevents two concurrent requests from allocating the same room.

## Database migrations

Migration files live in `server/migrations`. The initial schema is `001_initial_schema.js`, and PostgreSQL records applied migrations in `schema_migrations`.

Pending migrations run at server startup. For a future schema change, create a new migration instead of editing an already-applied file:

```bash
cd server
npm run migrate:create -- add_booking_index
```

Then add the required SQL to the generated migration file.

## API overview

Base URL: `http://localhost:5000`

| Method | Endpoint | Authentication | Purpose |
| --- | --- | --- | --- |
| GET | `/` | No | Basic API response. |
| GET | `/health` | No | Simple server health response. |
| POST | `/auth/register` | No | Creates an account and sets a cookie. |
| POST | `/auth/login` | No | Logs in and sets a cookie. |
| POST | `/auth/logout` | No | Clears the cookie. |
| GET | `/auth/me` | Yes | Returns the current public user profile. |
| GET | `/rooms` | No | Lists room types. |
| GET | `/rooms/:slug` | No | Gets a room type with amenities and images. |
| POST | `/bookings/availability` | No | Checks room availability. |
| POST | `/bookings` | Yes | Creates a booking. |
| GET | `/bookings/me` | Yes | Lists the current user's bookings. |

## Tests

Tests use Jest and Supertest to call the Express app without starting the HTTP server.

From `server`:

```bash
npm run typecheck
npm test -- --runInBand
```

Run one test file with:

```bash
npx jest tests/bookings.test.ts --runInBand
```

The tests use the database configured in `server/.env` and create test records. Use a disposable test database instead of one whose data you want to keep.

## Current limitations

- No payment gateway, cancellation flow, or admin features.
- Logout clears the browser cookie but does not revoke an already copied JWT.
- No refresh-token, password-reset, or email-verification flow.
- Booking concurrency tests and isolated test-database setup are still needed.
- Availability does not yet exclude physical rooms marked out of service.
- Money uses PostgreSQL `MONEY` and JavaScript numbers; a decimal/minor-unit approach would be safer for a larger system.
