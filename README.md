# Hotel Booking Platform

A full-stack booking application for a single hotel, built with TypeScript, Express, PostgreSQL, and React. Visitors can browse room types, check availability, create an account, book rooms, and view their own reservations.

I built this portfolio project to demonstrate my backend development skills through a complete application. The main focus is relational database design, SQL, authentication, request validation, and transactional booking logic. The core booking flow is implemented, with remaining improvements documented below.

## Why I built it

I wanted to give recruiters and technical reviewers a concrete example of how I approach backend work: organize an API, model relationships in PostgreSQL, enforce booking rules on the server, and handle competing requests for limited room availability. Docker setup and demo data make it possible to run the application and inspect those decisions in practice.

I chose to write SQL directly with `pg` so the queries, joins, transaction boundaries, and row-locking logic are explicit in the repository. Database access is a central part of the work I wanted to demonstrate.

### A note about AI assistance

The React frontend was developed with AI assistance, including the interface, layout, components, and frontend integration. My primary contribution and the focus of this portfolio are the backend and database. The frontend provides a practical way to explore the application and exercise its API through a complete booking flow.

## What currently works

- Browse Single, Double, Twin, and Suite room types without an account.
- View a room type by its slug, including amenities and an image gallery.
- Register, log in, log out, and check the current authentication state.
- Check availability for multiple room types and quantities in one request.
- Create a booking after logging in, with total adults, children, and an optional special request.
- Calculate the booking price on the server using database prices and the number of nights.
- Assign physical rooms inside a database transaction.
- View bookings belonging to the authenticated user on the profile page.
- Keep a guest's booking draft through the login/registration flow.
- Start with existing data, basic hotel data, or demo accounts and bookings.
- Run the client, server, and PostgreSQL together with Docker Compose.

New bookings created through the API are immediately `confirmed`. Payment processing, cancellation, and administration are not implemented features yet. Their current status is explained below.

## Technology

| Part | Tools |
| --- | --- |
| Backend | Node.js 24, TypeScript, Express 5 |
| Database | PostgreSQL 17, `pg`, handwritten SQL |
| Authentication | `bcrypt`, `jsonwebtoken`, HTTP-only cookies |
| Validation | Zod |
| HTTP middleware | Helmet, CORS, cookie-parser, Morgan, express-rate-limit |
| Tests | Jest, Supertest, ts-jest |
| Frontend | React, TypeScript, Vite, React Router |
| Containers | Docker Compose, multi-stage Dockerfiles, Nginx |

## Run the project with Docker

The commands below are written for Git Bash on Windows. Docker Desktop must be running, with its WSL 2 backend set up. Node.js, npm, and PostgreSQL do not need to be installed directly on your machine for this option.

### 1. Clone and configure

Clone this repository and open a terminal in `hotel-booking-platform`, the directory containing `docker-compose.yml`.

Create `server/.env.docker` with:

```env
PORT=5000
DB_HOST=db
DB_PORT=5432
DB_USER=hotel_app
DB_PASSWORD=hotel_password
DB_NAME=hotel_booking
DB_ADMIN_DATABASE=postgres
JWT_SECRET=replace_this_with_a_long_random_secret
JWT_EXPIRES_IN=1h
CLIENT_ORIGIN=http://localhost:5173
NODE_ENV=development
```

Replace the JWT secret before running. The database credentials above match the current Compose configuration and are intended for a local demo. If you change them, update both places. PostgreSQL's initialization variables only set credentials when its data volume is first initialized.

The environment files are ignored by Git, so they need to be created after cloning. `NODE_ENV=development` allows the authentication cookie to work over local HTTP. A public deployment needs HTTPS and a separate production configuration.

### 2. Start with demo data

```bash
STARTUP_MODE=demo docker compose up --build
```

This builds the server and frontend images, starts PostgreSQL, and runs the server's demo setup. The client is served by Nginx.

| Service | Address |
| --- | --- |
| Website | http://localhost:5173 |
| Backend | http://localhost:5000 |
| PostgreSQL from Windows/Postbird | `localhost:5433` |

Docker containers talk to PostgreSQL at `db:5432`. The different host port lets a local PostgreSQL installation continue using port `5432`.

### 3. Try the application

Log in with one of these seeded accounts:

| Email | Password | Seeded role |
| --- | --- | --- |
| `alice@example.com` | `Guest123!` | Guest |
| `michael@example.com` | `Guest123!` | Guest |
| `sofia@example.com` | `Guest123!` | Guest |
| `admin@hotel.test` | `Admin123!` | Admin, with no admin functionality yet |

These are public demo credentials, not real accounts. Browse a room type, choose future dates, check availability, and make a reservation. The profile page displays your bookings.

The existing demo reservations use fixed dates from September 5–15, 2026. They do not move with today's date. Choose future dates for new bookings; the current validator requires check-in to be strictly after today.

### Startup modes and keeping data

| Mode | What the server does |
| --- | --- |
| `resume` | Checks the database, creates missing tables, and preserves existing records without reseeding. |
| `empty` | Resets booking/user data and restores the basic hotel catalogue: rooms, types, amenities, and images. |
| `demo` | Performs the basic reset/setup, then adds sample users, bookings, and payment records. |

`empty` means no users or bookings, but still has tables and room catalogue.

Both `demo` and `empty` reset existing application data on server startup. Only use them with a database you are happy to reset. The reset currently retains the amenities catalogue itself and reseeds its relationships.

After trying the demo, stop the application with `Ctrl+C`, then use resume mode to keep your changes:

```bash
STARTUP_MODE=resume docker compose up --build
```

For a fresh hotel with no users or bookings:

```bash
STARTUP_MODE=empty docker compose up --build
```

Plain `docker compose up --build` defaults to `resume`, unless `STARTUP_MODE` is set in your shell. On the first Docker run, explicitly choose `demo` or `empty`: PostgreSQL already creates the database, so `resume` can create the tables without populating the room catalogue.

The selected mode is stored in the container's command. A container created in `demo` or `empty` mode will reset data again if it restarts, including through the current restart policy. Start it with `resume` after initializing the data you want to keep.

### Useful Docker commands

Run these from the repository root:

```bash
# See the running services
docker compose ps

# Read backend logs
docker compose logs -f server

# Stop the services and keep their containers and data
docker compose stop

# Remove the containers and network, but keep the database volume
docker compose down

# Rebuild and run after changing application code
docker compose up --build
```

The current images contain copies of the code. Editing a local source file does not update a running container automatically; rebuild to use the changes. Local development with `tsx watch` and Vite is usually quicker while coding.

For a completely fresh local demo, the following deletes the project's containers, service images, and database volume. **All data in that Docker database is lost.**

```bash
docker compose down --rmi all -v
docker compose build --no-cache
STARTUP_MODE=demo docker compose up
```

## Run locally without Docker

Install Node.js 24 and PostgreSQL. In `server/.env`, add:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_local_postgres_password
DB_NAME=hotel_booking
DB_ADMIN_DATABASE=postgres
JWT_SECRET=replace_this_with_a_long_random_secret
JWT_EXPIRES_IN=1h
CLIENT_ORIGIN=http://localhost:5173
NODE_ENV=development
```

The configured PostgreSQL account must be able to create the database if it does not exist. Use a simple database name such as `hotel_booking`; database-name handling is still on my cleanup list.

Start the backend:

```bash
cd server
npm ci
npm run dev -- demo
```

Then open a second terminal at the repository root:

```bash
cd client
npm ci
npm run dev
```

Use `npm run dev -- resume` on later backend starts to preserve your data. For a compiled backend run:

```bash
npm run build
npm start -- resume
```

The current TypeScript configuration emits the entry point to `server/dist/src/server.js`.

You can also run only PostgreSQL in Docker with `docker compose up -d db`, and run both applications locally. In that case, the local backend's `.env` should use `localhost`, port `5433`, and the Compose database credentials. Avoid running the local and containerized server/client on the same host ports at the same time.

## Backend structure

```text
hotel-booking-platform/
├── docker-compose.yml
├── server/
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── src/
│   │   ├── app.ts
│   │   ├── server.ts
│   │   ├── config/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── validators/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── repositories/
│   │   ├── db/
│   │   └── utils/
│   └── tests/
├── client/
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── src/
│   └── public/images/rooms/
├── db/
└── scripts/
```

The root `db` and `scripts` folders are reserved for further organization. The executable database setup currently lives in `server/src/db`.

A request generally travels through a route and any middleware, then a controller, service, repository, and PostgreSQL. The result comes back to the controller, which sends the HTTP response.

| File or folder | Responsibility |
| --- | --- |
| `app.ts` | Creates the Express app, adds middleware, mounts routes, and registers the error handler. |
| `server.ts` | Reads the startup mode, awaits database setup, and starts the HTTP listener. |
| `config/database.ts` | Reads database settings and creates the connection pools. |
| `routes` | Maps HTTP methods and paths to handlers and middleware. |
| `middleware` | Checks authentication, handles errors, and supports cross-cutting request behavior. |
| `validators` | Defines Zod schemas for request input. |
| `controllers` | Validates input using those schemas and chooses HTTP responses. |
| `services` | Coordinates application logic, such as checking credentials or preparing a booking. |
| `repositories` | Runs SQL and returns database results. Booking transaction logic also lives here. |
| `db` | Initializes, resets, and seeds the database. |
| `utils` | Shared helpers such as JWT creation and verification. |

Function names describe their work directly; the folder and module identify the architectural layer. Some services are thin because their current job is just to call a repository.

### Authentication and request handling

Registration validates user input, checks for an existing email, hashes the password with bcrypt using 12 salt rounds, and inserts the user. Login compares the submitted password with the stored hash. The hash is excluded from successful authentication responses.

Login and registration issue a JWT in an `access_token` HTTP-only cookie. The token contains the user ID and role. Authentication middleware verifies the token and its expiry, then stores the authenticated identity in `res.locals.auth` for the controller. Booking ownership comes from this identity rather than a user ID supplied in the request body.

Guests can browse rooms and check availability. Creating a booking and viewing personal bookings require authentication. A registered hotel guest has role `G`; an unauthenticated visitor has no token. An `A` role exists in demo data, but admin authorization and routes are not implemented.

Logout clears the browser cookie. There is no server-side token revocation or refresh-token system yet. `/auth/me` currently returns the ID and role from the verified token, not a refreshed user profile from the database.

Helmet adds HTTP security headers, CORS allows the configured frontend origin with credentials, cookie-parser reads cookies, and Morgan logs requests. Selected authentication and booking routes have rate limiters. Their coverage and configuration still need cleanup.

Zod checks request structure and values. SQL uses parameters such as `$1` for user-provided values; validation is not a replacement for parameterized SQL.

## Database design

| Table | Purpose |
| --- | --- |
| `users` | Account details, password hashes, and roles. |
| `room_types` | Public categories, capacities, nightly prices, bed types, and sizes. |
| `rooms` | Physical hotel rooms linked to a room type. |
| `bookings` | User, dates, total guests, status, total price, and special request. |
| `bookings_rooms` | Links one booking to one or more physical rooms. |
| `payments` | Payment-shaped records for demo data; no payment gateway is connected. |
| `amenities` | Shared amenities such as WiFi, AC, and a minibar. |
| `room_types_amenities` | Links room types to amenities. |
| `room_type_images` | Image URLs, alt text, and display order for each room type. |

The schema uses generated identity IDs, foreign keys, unique emails and room numbers, and composite primary keys on the relationship tables. Deleting a booking cascades to its room links and payments. That database behavior is separate from the planned cancellation feature, which should update a status and retain history.

Basic seeding creates 48 physical rooms across four floors. Room numbers are three-character strings, for example `201` for room 01 on floor 2. Visitors select room types and quantities; the backend chooses the physical room IDs.

`adminPool` connects to the administrative database to check/create the application database. `appPool` connects to the application database for normal queries. Transactions use one checked-out client from beginning to end and release it afterward.

The file called `migrate.ts` currently runs `CREATE TABLE IF NOT EXISTS` statements in TypeScript. It is initial schema setup, not a versioned migration system: it does not automatically update existing columns or constraints. Resetting data also does not change the schema.

### Availability and booking creation

Bookings overlap when:

```sql
existing.check_in < requested_check_out
AND existing.check_out > requested_check_in
```

This allows a new check-in on the same date that a previous guest checks out. A common table expression identifies occupied rooms, and `NOT EXISTS` selects rooms outside that set.

The availability endpoint returns whether the requested quantities can be found. It does not reserve rooms or guarantee that they will still be available later.

When creating a booking, the backend:

1. Validates dates, quantities, and guest totals.
2. Performs an initial availability check.
3. Opens a transaction and reads capacities and prices from the database.
4. Selects the requested rooms using `LIMIT` and `FOR UPDATE OF r SKIP LOCKED`.
5. Checks total adult and child capacity and calculates the price.
6. Inserts a confirmed booking and its `bookings_rooms` rows.
7. Commits, or rolls back if the operation cannot be completed.

The locks apply to selected rows in `rooms` and remain until the transaction ends. Competing booking transactions using the same selection method skip those locked rows. This is the current approach to avoiding double allocation; dedicated concurrency tests are still needed, and there is no database exclusion constraint independently enforcing non-overlapping reservations.

Guest capacities are checked in total across the selected rooms. The request does not describe the adult/child distribution per individual room. Prices currently use PostgreSQL `MONEY` and JavaScript number calculations, which I plan to replace with a more consistent decimal or minor-unit approach.

## API overview

Base URL for the local setup: `http://localhost:5000`.

The backend booking prefix is **`/bookings`**, matching the bookings resource.

| Method | Endpoint | Authentication | Purpose / response |
| --- | --- | --- | --- |
| GET | `/` | No | Basic API-online response; does not check database health. |
| POST | `/auth/register` | No | Creates an account, sets a cookie, returns `201` and `{ message, user }`. |
| POST | `/auth/login` | No | Sets a cookie and returns `{ message, user }`. |
| POST | `/auth/logout` | No | Clears the cookie and returns a message. |
| GET | `/auth/me` | Yes | Returns `{ user: { id, role } }` from the token. |
| GET | `/rooms` | No | Returns `{ result: [...] }` with room types and one image each. |
| GET | `/rooms/:slug` | No | Returns `{ result: {...} }` with amenities and images. |
| POST | `/bookings/availability` | No | Returns `{ availability: true }` or `{ availability: false }`. |
| POST | `/bookings` | Yes | Creates a booking; returns `201` and `{ message, bookingId }`. |
| GET | `/bookings/me` | Yes | Returns `{ bookings: [...] }` for the authenticated user. |

Room details return `imageUrl` as the main image string and `imageUrls` as an array of `{ imageUrl: string }` objects. Image files are in the client, while the database stores their paths.

### Example requests

Register with `POST /auth/register`:

```json
{
  "firstName": "Test",
  "lastName": "Guest",
  "email": "test@example.com",
  "password": "Password123!",
  "phone": "6900000000"
}
```

The current password rules require 8–30 characters, at least one uppercase letter, and at least one number. The phone field is optional. Email validation checks format; there is no email verification flow.

Check availability with `POST /bookings/availability`:

```json
{
  "checkIn": "2027-06-10",
  "checkOut": "2027-06-13",
  "rooms": [
    { "roomTypeId": 4, "quantity": 2 },
    { "roomTypeId": 1, "quantity": 1 }
  ]
}
```

Use IDs returned by `/rooms` and dates after today. Each room type can appear once, quantities are 1–10, and checkout must be later than check-in.

Create a booking with `POST /bookings` using the authentication cookie:

```json
{
  "checkIn": "2027-06-10",
  "checkOut": "2027-06-13",
  "rooms": [
    { "roomTypeId": 4, "quantity": 2 },
    { "roomTypeId": 1, "quantity": 1 }
  ],
  "adults": 4,
  "children": 1,
  "specialRequest": "Late check-in if possible"
}
```

Do not supply the booking's user ID, final price, or physical room IDs. Those are determined by the backend.

Current error responses include `400` for validation, `401` for authentication, `404` for an unknown room type, `409` for duplicate email/unavailable booking capacity, and `500` for unexpected failures. No availability is a normal `200` response with `availability: false`. One known controller issue returns `222` for too many guests; changing that to `422` is on the cleanup list.

## Frontend and Docker details

The frontend includes a home page, room list and details, login/registration forms, a booking form, and a profile with booking history. It uses a shared fetch helper with `credentials: "include"` so the browser sends the authentication cookie. Booking drafts are saved in session storage before redirecting a guest to authentication.

The browser's API address defaults to `http://localhost:5000`. It can be configured through `VITE_API_URL` for a Vite build. These values are public and are compiled into the frontend; adding a runtime environment variable to Nginx alone will not change them. The current Dockerfile has no dedicated build-argument setup for a custom API URL, and ignores `.env` files.

Nginx serves the compiled frontend and falls back to `index.html` for React Router paths. It currently does not proxy API requests. The browser calls the backend's published address, not the Docker hostname `server`.

Both application Dockerfiles use separate build and runtime stages. The backend compiles TypeScript and installs only runtime dependencies in the final stage. The client builds with Vite and serves the resulting static files with Nginx. PostgreSQL uses its official image and stores data in a named volume.

## Tests and development commands

The automated tests currently cover room endpoints and one successful registration case. The room tests have been exercised during development; authentication, booking, failure-path, and concurrency coverage are incomplete.

Tests use Jest and Supertest to call the Express app without starting `server.ts`. They connect to the database configured in `server/.env`; there is no automatic isolated test-database setup yet. Registration tests write users to that database.

Before running tests, point the local server environment at a dedicated disposable test database and initialize it with `npm run dev -- empty`, then stop that server. Do not use a database containing records you want to keep for test initialization. Tests expect the basic room catalogue to exist.

From `server`:

```bash
npm run typecheck
npx jest tests/rooms.test.ts --runInBand
npm test -- --runInBand
```

From `client`:

```bash
npm run lint
npm run build
```

The server's `rootDir` is currently `.` so local builds can emit both `dist/src` and `dist/tests`. The Docker build excludes tests through `.dockerignore`. Separating the application and test TypeScript configurations is planned.

## Work still to do

These are unfinished parts of the project, not features that should be assumed to work already:

- **Tests:** isolated fixtures/cleanup, invalid and expired token cases, booking ownership, date boundaries, unavailable rooms, transaction failures, and simultaneous booking attempts. Rate limiters also need a predictable test configuration.
- **Error handling:** the central handler returns a generic JSON `500`, but error responses are not fully standardized. Add a JSON 404 handler, fix the `222` booking response, and consistently map database constraint errors. Migration failures currently roll back without rethrowing.
- **Booking cancellation:** let an authenticated guest cancel their own booking if check-in is at least 30 days away. Keep the booking history and update availability to ignore cancelled bookings. Current availability queries count every overlapping booking regardless of status.
- **Availability rules:** account for physical rooms marked unavailable or under maintenance. The queries currently do not filter `rooms.status`. Improve capacity allocation beyond aggregate adult/child totals if needed.
- **Validation:** settle whether same-day check-in is allowed, standardize the hotel's timezone, and correct the check-in error field. At present the validator rejects today and attaches that error to `checkOut`.
- **Profile data:** load the user's full current details for `/auth/me`. It currently only returns token identity, so name/email information can be missing after a frontend reload. Editing profile details is not implemented.
- **Database evolution:** introduce versioned migrations, improve database-name quoting, review constraints and indexes, and make money/date representations consistent between PostgreSQL, TypeScript, and JSON.
- **Authentication:** handle simultaneous duplicate registrations cleanly, review cookie/token lifetime consistency, and add password reset/email verification if the project scope expands. Logout currently clears the cookie without invalidating a copied JWT.
- **Operations:** graceful HTTP/database shutdown, database-aware readiness checks, automated checks in CI, and a production configuration for secrets, HTTPS, CORS, and cookie-based request protection.
- **Documentation:** expand the API examples into an OpenAPI specification and keep response types aligned between the client and server.

Payment records and statuses exist in the schema/demo seed, including a pending demo booking, but there is no checkout, charge, refund, or payment-provider integration. New API bookings do not create a real payment. Admin and profile router placeholders also exist, but are not mounted as working API features. Admin functionality is outside my current focus.

The next priorities are broader automated test coverage, consistent error responses, and stronger database and deployment safeguards.
