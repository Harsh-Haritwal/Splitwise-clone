# Splitwise Clone

A full-stack MERN app for sharing expenses with friends, tracking who owes whom, and recording settlements.

The project is complete and includes authentication, groups, expenses, balances, settlements, pagination, responsive screens and automated tests.

## Features

- Email and password signup and login with JWT authentication
- Profile editing, password change and account deletion
- Groups with an owner and members
- Add and remove group members by email
- Expenses split equally, by exact amounts, or by percentage
- Expense history with pagination and a "Load more" button
- Expense details, editing and deletion with permission checks
- Group balances, a personal balance summary and simplified debts
- Settlement history and a settlement form with prefilled simplified debts
- Simple dashboard with an overall balance and group cards
- Loading, error, empty and retry states across the app
- Responsive layout for desktop, tablet and mobile
- Input validation, rate limiting, security headers, CORS restrictions and JSON 404 responses
- Backend API tests and frontend component tests

## Tech Stack

**Frontend:** React 19, Vite, React Router, plain CSS  
**Backend:** Node.js, Express 5, MongoDB, Mongoose, JWT, bcrypt  
**Testing:** Node.js test runner, Supertest, MongoDB Memory Server, Vitest, React Testing Library  
**Deployment:** MongoDB Atlas, Render (or any Node host and static host)

## Project Structure

```text
splitwise-clone/
├── backend/
│   ├── src/
│   │   ├── config/         # MongoDB connection
│   │   ├── controllers/    # API request handlers
│   │   ├── middleware/     # Auth, validation, errors, rate limiting
│   │   ├── models/         # Mongoose models
│   │   ├── routes/         # Express routes
│   │   ├── utils/          # Balance and validation helpers
│   │   ├── app.js          # Express app
│   │   └── server.js       # Server entry point
│   └── tests/              # API tests
├── frontend/
│   ├── public/             # Static files and SPA redirects
│   └── src/
│       ├── components/     # Shared UI components
│       ├── context/        # Auth context
│       ├── pages/          # App pages
│       ├── test/           # Test setup
│       └── api.js          # API client
├── DEPLOYMENT.md
└── render.yaml
```

## Local Setup

### Requirements

- Node.js 20 or newer
- npm
- A MongoDB database, either a local MongoDB server or a free MongoDB Atlas cluster

### 1. Backend

```bash
cd backend
npm install
copy .env.example .env
npm run dev
```

On macOS or Linux, use `cp .env.example .env` instead of `copy`.

Set these values in `backend/.env`:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_long_random_secret
JWT_EXPIRES_IN=1d
CLIENT_URL=http://localhost:5173
```

The API runs at `http://localhost:5000`. Check it at `http://localhost:5000/api/health`.

### 2. Frontend

```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```

Set the backend URL in `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000
```

Open `http://localhost:5173`.

## Environment Variables

| Variable | Where | Description |
| --- | --- | --- |
| `PORT` | Backend | Server port. Defaults to `5000`. |
| `NODE_ENV` | Backend | Use `production` when deployed. |
| `MONGODB_URI` | Backend | MongoDB Atlas or local MongoDB connection string. |
| `JWT_SECRET` | Backend | Secret used to sign login tokens. Use a long random value. |
| `JWT_EXPIRES_IN` | Backend | Token lifetime, for example `1h` or `7d`. |
| `CLIENT_URL` | Backend | Allowed frontend origin. Separate multiple URLs with commas. |
| `VITE_API_URL` | Frontend | Backend URL used by the React app. |

## Scripts

### Backend

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the API with nodemon. |
| `npm start` | Start the API for production. |
| `npm test` | Run API tests with the Node.js test runner. |

### Frontend

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the Vite development server. |
| `npm run build` | Create a production build in `dist`. |
| `npm run preview` | Preview the production build locally. |
| `npm run lint` | Run ESLint. |
| `npm test` | Run Vitest component tests. |

## API Overview

All protected routes require an `Authorization: Bearer <token>` header.

### Authentication and profile

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/user/signup` | Create an account. |
| `POST` | `/user/login` | Log in and receive a JWT. |
| `GET` | `/user/profile` | Get the current user. |
| `PATCH` | `/user/profile` | Update name or avatar. |
| `PATCH` | `/user/change-password` | Change the password. |
| `DELETE` | `/user/profile` | Delete the account. |
| `POST` | `/user/logout` | Log out (the client removes the token). |

### Groups

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/group/create` | Create a group. |
| `GET` | `/group/my-groups` | List groups for the current user. |
| `GET` | `/group/:groupId` | Get one group. |
| `PATCH` | `/group/:groupId` | Rename a group. |
| `DELETE` | `/group/:groupId` | Delete a group and its expenses and settlements. |
| `POST` | `/group/:groupId/members` | Add a member by email or user id. |
| `DELETE` | `/group/:groupId/members/:memberId` | Remove a member. |

### Expenses

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/expense/add` | Add an expense. |
| `GET` | `/expense/group/:groupId?page=1&limit=20` | Get paginated group expenses. |
| `GET` | `/expense/:expenseId` | Get one expense. |
| `PATCH` | `/expense/:expenseId` | Edit an expense. |
| `DELETE` | `/expense/:expenseId` | Delete an expense. |

The expense list response includes `expenses`, `page`, `limit`, `total` and `totalPages`.

### Balances and settlements

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/balance/me` | Get the current user's overall balance. |
| `GET` | `/balance/group/:groupId` | Get balances for each group member. |
| `GET` | `/balance/group/:groupId/summary` | Get a group balance summary. |
| `GET` | `/balance/group/:groupId/settle` | Get simplified debt transactions. |
| `POST` | `/settlement/add` | Record a settlement. |
| `GET` | `/settlement/group/:groupId` | List settlements for a group. |
| `GET` | `/settlement/group/:groupId/summary` | Get a settlement summary. |

### Health

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/health` | Check the API and database connection. |

## Testing

Run both test suites from the project root:

```bash
cd backend
npm test

cd ../frontend
npm test
```

The backend API tests spin up an in-memory MongoDB server, so they do not use or modify your Atlas data. The first run downloads the test MongoDB binary.

The frontend tests use Vitest and React Testing Library. They cover login validation, API error messages and the app error boundary.

GitHub Actions runs the backend tests, frontend lint, frontend tests and the production build on every push to `main` and on pull requests.

## Deployment

The project is ready to deploy with:

- **Database:** MongoDB Atlas
- **Backend:** Render web service
- **Frontend:** Render static site

The included `render.yaml` creates both Render services. Follow the full step-by-step instructions in [DEPLOYMENT.md](DEPLOYMENT.md).

After deployment, set `VITE_API_URL` on the frontend to the backend URL and set `CLIENT_URL` on the backend to the frontend URL.

## Notes

- The backend uses JWT tokens stored in `localStorage`, so logging out removes the token on the client.
- The API returns JSON errors in the form `{ "msg": "..." }`.
- Group and expense actions are limited to the relevant members, payer or group owner.
- Free hosting services may sleep after inactivity, so the first request can take a few seconds.
- Use a strong `JWT_SECRET` and a strong database password in production.
