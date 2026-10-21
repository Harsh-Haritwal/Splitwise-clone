# Deployment Guide

This project has three parts:

- The React frontend
- The Express backend
- The MongoDB database

The steps below use MongoDB Atlas for the database and Render for the frontend and backend. Render can read the `render.yaml` file in the repository and create both services.

## 1. Create the database on MongoDB Atlas

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a free cluster.
3. Create a database user with a strong password.
4. Open **Network Access** and allow access from Render. For a small free project, `0.0.0.0/0` is the simplest option. You can restrict it later if you have fixed server IPs.
5. Copy the connection string. It looks like this:

   ```text
   mongodb+srv://USERNAME:PASSWORD@cluster.mongodb.net/splitwise?retryWrites=true&w=majority
   ```

6. Replace `USERNAME` and `PASSWORD` with the database user details. Keep the database name, for example `splitwise`.

The indexes used by the app are created by Mongoose when the models are loaded. No manual index setup is needed.

## 2. Deploy the backend on Render

1. Push the repository to GitHub.
2. In Render, choose **New > Blueprint** and connect the repository.
3. Render will read `render.yaml` and create the `splitwise-clone-api` service.
4. Fill in these secret values when Render asks for them:
   - `MONGODB_URI`: the Atlas connection string
   - `CLIENT_URL`: the frontend URL, for example `https://splitwise-clone-web.onrender.com`
5. `JWT_SECRET` is generated automatically by Render. You can also provide your own long random value.
6. Wait for the deploy to finish and open:

   ```text
   https://YOUR-BACKEND.onrender.com/api/health
   ```

   The response should have `"success": true` and `"database": "connected"`.

If the frontend URL is not known yet, deploy the frontend first and then update `CLIENT_URL` in the backend settings.

## 3. Deploy the frontend on Render

1. The same Blueprint creates the `splitwise-clone-web` static site.
2. Set `VITE_API_URL` to the backend URL, without a trailing slash:

   ```text
   https://YOUR-BACKEND.onrender.com
   ```

3. Deploy the site. The build command is `npm ci && npm run build` and the publish directory is `dist`.
4. Open the frontend URL and test signup, login and creating a group.

The `frontend/public/_redirects` file and the Render rewrite rule make React Router work when a user opens a page directly, such as `/groups/123`.

## 4. Local setup

### Backend

```bash
cd backend
copy .env.example .env
npm install
npm run dev
```

Fill in `MONGODB_URI` and `JWT_SECRET` in `backend/.env`.

### Frontend

```bash
cd frontend
copy .env.example .env
npm install
npm run dev
```

The frontend runs at `http://localhost:5173` and the backend runs at `http://localhost:5000` by default.

## 5. Run the tests

```bash
cd backend
npm test

cd ../frontend
npm test
```

The backend tests use an in-memory MongoDB server, so they do not touch the Atlas database. The first test run may download the test database binary.

## 6. Production notes

- Never commit `backend/.env` or `frontend/.env`.
- Use a different `JWT_SECRET` for production.
- Keep `CLIENT_URL` limited to your real frontend domains. Multiple URLs can be separated by commas.
- Render free services may sleep when inactive, so the first request can be slow.
- MongoDB Atlas backups depend on the cluster plan. Export important data before changing the database.
- If you use another frontend host, keep the `_redirects` file for Netlify or add an equivalent rewrite for Vercel so client-side routes do not return 404.

## Alternative hosts

The backend can also run on Railway or Fly.io with `npm start` as the start command. The frontend can run on Vercel or Netlify with `npm run build` as the build command and `dist` as the output directory. In every case, set `VITE_API_URL` when building the frontend and add the frontend URL to `CLIENT_URL` on the backend.
