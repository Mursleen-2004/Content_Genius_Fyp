# Deploying Content Genius to Vercel

The app deploys as **two separate Vercel projects** from this one repo:

| Project             | Root directory | What it is                        |
| ------------------- | -------------- | --------------------------------- |
| `content-genius`     | `client`       | Vite/React static site            |
| `content-genius-api` | `server`       | Express app as a serverless function |

They are split because Vercel builds one root directory per project. The client
talks to the API over CORS using `VITE_API_URL`.

## One-time setup

```bash
vercel login
```

### 1. Deploy the API

```bash
cd server
vercel link          # create/link the project
vercel --prod
```

Note the production URL it prints, e.g. `https://content-genius-api.vercel.app`.

### 2. Set the API environment variables

In the Vercel dashboard → `content-genius-api` → Settings → Environment
Variables, add each of these for **Production** and **Preview**
(values are in your local `server/.env`; see `server/.env.example`):

- `MONGO_URI`
- `JWT_SECRET` — use a fresh random value, not the local one
- `RAPIDAPI_KEY`
- `GROQ_API_KEY`
- `GEMINI_API_KEY`
- `GEMINI_MODEL`
- `CLIENT_URL` — the client's URL, filled in after step 3

Do **not** set `PORT`; Vercel manages it.

In **MongoDB Atlas → Network Access**, allow `0.0.0.0/0`. Vercel functions have
no fixed IP, so an IP allowlist will block them.

### 3. Deploy the client

```bash
cd client
vercel link
vercel --prod
```

Then set, in the `content-genius` project's environment variables:

- `VITE_API_URL` = the API URL from step 1, no trailing slash
- `VITE_CLERK_PUBLISHABLE_KEY`

`VITE_*` values are baked in at build time, so **redeploy the client** after
setting them: `vercel --prod --force`.

### 4. Close the CORS loop

Set `CLIENT_URL` on the API project to the client's production URL, then
redeploy the API. `server/server.js` also allows any `*.vercel.app` origin, so
preview deployments work without extra configuration.

## Verifying

```bash
curl https://<api-url>/                      # -> "Welcome to Content Genius API"
curl -i https://<api-url>/api/trends         # -> 401 (auth required) not 503
```

A `503 {"message":"Database unavailable"}` means `MONGO_URI` is wrong or Atlas
is blocking the connection.

## Known constraints

- **60s function timeout** (`server/vercel.json`). Long AI generations in
  `/api/ai/generate` will be cut off; Hobby plan cannot raise this past 60s.
- **Cold starts** re-establish the Atlas connection. `server/config/db.js`
  caches it across warm invocations.
- The server keeps no local state or disk writes, which is what makes the
  serverless model safe here.

## Local development

Unchanged:

```bash
cd server && npm run dev     # nodemon on :4000
cd client && npm run dev     # vite on :5173
```

With `VITE_API_URL` unset, the client defaults to `http://localhost:4000`.
