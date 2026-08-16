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
- `GROQ_API_KEY`
- `GROQ_MODEL` — optional; defaults to `llama-3.3-70b-versatile`
- `GEMINI_API_KEY` — from https://aistudio.google.com/apikey. Newly issued keys
  start with `AQ.`; older ones start with `AIza`. Both go in the `?key=` query
  parameter.
- `GEMINI_MODEL` — `gemini-3.5-flash-lite`. The whole `gemini-2.5-*` family now
  returns 404 "no longer available to new users" for recently created keys,
  even though it still appears in the `/models` listing. Note also that
  `generatePostController.js` calls the `v1` endpoint, and `v1` serves fewer
  models than `v1beta`: `gemini-flash-lite-latest` works on `v1beta` but 404s
  on `v1`, whereas `gemini-3.5-flash-lite` works on both. Verify any
  replacement model against `v1` before setting it.
- `YOUTUBE_API_KEY` — Google Cloud key with YouTube Data API v3 enabled
- `CLIENT_URL` — the client's URL, filled in after step 3

There is no `RAPIDAPI_KEY`: nothing in the codebase reads it.

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
- **Reddit trends are disabled in practice.** Reddit now requires OAuth on its
  JSON endpoints and returns 403 to unauthenticated callers regardless of
  User-Agent, from local machines and Vercel alike. Restoring the source means
  registering a Reddit app and adding client credentials. `getTrends` degrades
  per-source, so Twitter and YouTube still return normally.
- **Third-party model names go stale.** Groq decommissioned
  `llama3-70b-8192`; both the Groq and Gemini models are env-configurable so a
  retirement is a settings change rather than a code edit.

## Local development

Unchanged:

```bash
cd server && npm run dev     # nodemon on :4000
cd client && npm run dev     # vite on :5173
```

With `VITE_API_URL` unset, the client defaults to `http://localhost:4000`.
