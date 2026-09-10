# GitPulse

GitPulse is a full-stack dashboard for tracking repository activity: commit history, pull request throughput, deploy health, and language distribution across a team's repositories. The backend serves realistic, deterministic mock data (no GitHub token required), so the whole thing runs locally out of the box.

<p>
  <em>React (Vite + Tailwind CSS) frontend · Node.js/Express REST API backend · monorepo via npm workspaces</em>
</p>

---

## Table of contents

- [Project structure](#project-structure)
- [Local setup](#local-setup)
- [Available scripts](#available-scripts)
- [Architecture](#architecture)
- [API reference](#api-reference)
- [Design system notes](#design-system-notes)
- [Extending GitPulse](#extending-gitpulse)

---

## Project structure

```
gitpulse/
├── package.json              # root workspace config + orchestration scripts
├── client/                   # React + Vite + Tailwind frontend
│   ├── src/
│   │   ├── api/              # axios client, one function per endpoint
│   │   ├── components/       # presentational + chart components
│   │   ├── context/          # ThemeContext (dark/light mode)
│   │   ├── hooks/            # useRepoData — data-fetching hook
│   │   ├── pages/            # Dashboard page
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
└── server/                   # Express REST API
    ├── src/
    │   ├── controllers/      # request handlers, one file per resource
    │   ├── routes/           # express.Router definitions
    │   ├── data/             # mock data generators + base repo dataset
    │   ├── middleware/       # error handling
    │   ├── app.js             # express app assembly
    │   └── index.js           # server entry point
    └── package.json
```

## Local setup

**Requirements:** Node.js 18+ and npm 9+.

```bash
# 1. Install dependencies for both client and server (run from the repo root)
npm install

# 2. Copy the server env file (defaults are fine for local dev)
cp server/.env.example server/.env

# 3. Start both the API and the frontend together
npm run dev
```

This runs the Express API on **http://localhost:4000** and the Vite dev server on **http://localhost:5173**. The frontend's dev server proxies any request to `/api/*` through to the backend (see `client/vite.config.js`), so you only ever need to open `http://localhost:5173`.

To run either half on its own:

```bash
npm run dev:server   # API only, http://localhost:4000
npm run dev:client   # frontend only, http://localhost:5173
```

### Production build

```bash
npm run build        # builds the client into client/dist
npm start            # starts the Express API (serve client/dist separately,
                      # or add static-file serving to server/src/app.js)
```

## Available scripts

Run from the repository root, these delegate to the appropriate workspace:

| Script | Description |
| --- | --- |
| `npm run dev` | Runs the API and the client concurrently, with colored log prefixes |
| `npm run dev:server` | Runs only the Express API with `nodemon` (auto-restart) |
| `npm run dev:client` | Runs only the Vite dev server |
| `npm run build` | Builds the production frontend bundle |
| `npm start` | Starts the Express API in production mode |

## Architecture

### Backend (`/server`)

The API follows a conventional **routes → controllers → data** layering:

- **`data/repositories.js`** — the base catalogue of six sample repositories (name, owner, languages, visibility, star count). This is the one place that defines what repos "exist."
- **`data/mockGenerators.js`** — pure functions that generate commit activity, individual commits, pull requests, and deploy records for a given repo ID. Each generator seeds a small deterministic PRNG (mulberry32) from the repo ID and resource type, so repeated calls within a server run stay internally consistent.
- **`controllers/*.controller.js`** — one file per resource (`repos`, `commits`, `pullRequests`, `deploys`). Controllers read query params, call the generators, filter/shape the response, and handle the 404 case for unknown repo IDs.
- **`routes/*.routes.js`** — thin `express.Router` definitions that map HTTP verbs and paths to controller functions.
- **`middleware/errorHandler.js`** — centralized 404 and error-handling middleware.
- **`app.js` / `index.js`** — `app.js` assembles the Express app; `index.js` is the entry point.

### Frontend (`/client`)

- **`api/client.js`** — a single axios instance plus one exported function per backend endpoint.
- **`hooks/useRepoData.js`** — loads the repository list once, then re-fetches the detail bundle whenever the selected repo changes.
- **`context/ThemeContext.jsx`** — dark/light mode toggle with localStorage persistence.
- **`components/`** — presentational components and Recharts chart wrappers.
- **`pages/Dashboard.jsx`** — composes the metric cards, charts, repo list, and event log.

## API reference

Base URL (dev): `http://localhost:4000/api`

All responses are JSON. Unknown repo IDs return `404 { "error": "Repository not found", "repoId": "..." }`.

### Repositories

| Method & path | Description | Query params |
| --- | --- | --- |
| `GET /repos` | List all repositories with rolled-up metrics | `search`, `language`, `visibility` |
| `GET /repos/:repoId` | Single repository with metrics | — |
| `GET /repos/:repoId/languages` | Language breakdown for one repo | — |
| `GET /repos/languages/summary` | Aggregate language distribution across all repos | — |

### Commits

| Method & path | Description | Query params |
| --- | --- | --- |
| `GET /repos/:repoId/commits` | Recent individual commits | `limit` (default 20, max 100) |
| `GET /repos/:repoId/commits/activity` | Daily commit counts + additions/deletions | `days` (default 30, 7–90) |

### Pull requests

| Method & path | Description | Query params |
| --- | --- | --- |
| `GET /repos/:repoId/pull-requests` | List pull requests | `state` (`open`, `merged`, `closed`, `draft`) |
| `GET /repos/:repoId/pull-requests/completion` | Completion rate + average cycle time for one repo | — |
| `GET /pull-requests/completion/summary` | Completion rate across all repos | — |

### Deploys

| Method & path | Description | Query params |
| --- | --- | --- |
| `GET /repos/:repoId/deploys` | Recent simulated deploys, plus a summary block | `limit` (default 15, max 50) |
| `GET /repos/:repoId/deploys/summary` | Just the rolled-up deploy health numbers | — |

### Health

| Method & path | Description |
| --- | --- |
| `GET /health` | Liveness check — `{ status, service, timestamp }` |

## Design system notes

The UI intentionally avoids the generic "SaaS card kit" look:

- **Accent bars, not shadows** — metric cards use a thin colored left bar keyed to what the metric means.
- **Monospace for data** — commit hashes, percentages, and headline numbers render in IBM Plex Mono.
- **One signature motif** — a small EKG-style "pulse line" appears once, in the top bar next to the wordmark.
- **Dark mode first-class** — every surface, border, and text color has a `dark:` variant.

## Extending GitPulse

- **Swap in real data:** replace the functions in `server/src/data/mockGenerators.js` with calls to the GitHub REST/GraphQL API.
- **Add authentication:** a JWT or session middleware would slot in ahead of the route mounts in `app.js`.
- **Persist data:** swap in a database so the generators become repository/query functions instead.
