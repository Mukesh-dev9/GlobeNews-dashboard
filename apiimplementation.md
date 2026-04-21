# API Implementation Guide (Step by Step)

This document explains how the new API integration is implemented in this project, with a CRUD-oriented view.

Project: `globenews`  
Main implementation file: `src/App.jsx`

---

## 1) APIs Used

### Primary News API
- Base URL: `https://api.spaceflightnewsapi.net/v4`
- List endpoint used: `GET /articles/`
- Detail endpoint used: `GET /articles/{id}/`

### Supporting APIs
- USGS earthquakes: `https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson`
- REST Countries: `https://restcountries.com/v3.1/all?fields=region,population`

---

## 2) Step-by-Step: How News API is Integrated

## Step 1 - Define API constants
In `src/App.jsx`, SNAPI base URL is declared:
- `SNAPI_BASE = 'https://api.spaceflightnewsapi.net/v4'`

This keeps endpoints centralized and reusable.

## Step 2 - Build article query parameters
The app constructs query params with `URLSearchParams`:
- `limit=12`
- `ordering=-published_at`
- `published_at_gte=<ISO timestamp for last 7 days>`
- `summary_contains_one=launch,mission,space,rocket,satellite`

This filters to recent, relevant space news.

## Step 3 - Fetch in parallel
Inside `fetchDashboardData()`, the app runs:
- SNAPI articles list request
- USGS request
- REST Countries request

using `Promise.allSettled(...)` so one failed API does not crash the entire dashboard.

## Step 4 - Normalize SNAPI article payload
SNAPI response `results[]` is transformed into local UI shape:
- `id` -> `article-${item.id}`
- `title`
- `summary`
- `image_url` (with fallback image)
- `news_site`
- `published_at`

Then list is sorted by `published_at` descending and capped for display.

## Step 5 - Update React state
Transformed data is saved to:
- `news`
- `kpis` (score, zones, latency, source count)
- `populationDistribution`

If SNAPI fails, fallback records are shown so UI stays functional.

## Step 6 - Render live modules
`news` state powers:
- compact live feed panel
- full "Every Article Live Modules" grid
- in-app modal detail view

No external route navigation is required.

## Step 7 - Fetch article detail on demand
When a card is clicked:
1. `openNewsDetails(item)` runs
2. Parses article id from `article-<id>`
3. Calls `GET /articles/{id}/`
4. Caches result in `newsDetails[item.id]`
5. Opens modal using cached/live response

This reduces repeated network calls for previously opened articles.

## Step 8 - Auto refresh
After initial load:
- a 60-second polling interval re-runs `fetchDashboardData()`
- dashboard stays near real-time

---

## 3) CRUD Operations for This Project

SNAPI in this frontend integration is currently **read-only**.  
So the implemented operations are:

- **C (Create):** Not implemented (external API data source)
- **R (Read):** Implemented
  - `GET /articles/` (list)
  - `GET /articles/{id}/` (detail)
- **U (Update):** Not implemented
- **D (Delete):** Not implemented

### Why only Read is implemented
- SNAPI is used as a public content source.
- Dashboard is a consumer app, not a content management system.
- Create/Update/Delete would require your own backend + data store.

---

## 4) How to Extend to Full CRUD (Recommended Architecture)

To support full CRUD in your project:

## Step A - Add backend service
Create backend (Node/Express/Nest/FastAPI) with:
- `/api/articles` (GET, POST)
- `/api/articles/:id` (GET, PUT/PATCH, DELETE)

## Step B - Add persistent database
Use PostgreSQL/MongoDB to store:
- imported SNAPI articles
- user-generated notes/tags/status
- optional moderation flags

## Step C - Seed data from SNAPI
Backend cron job:
1. Pull from SNAPI `GET /articles/`
2. Upsert records into DB
3. Keep your local canonical dataset

## Step D - Connect frontend to your backend
Replace direct fetch from SNAPI with:
- `GET /api/articles` (read)
- `POST /api/articles` (create custom article/note)
- `PUT /api/articles/:id` (update metadata)
- `DELETE /api/articles/:id` (remove local record)

## Step E - Secure write operations
Add:
- authentication (JWT/session)
- role-based access control
- request validation + audit logs

---

## 5) Current Request/Response Mapping

## List Request
- URL pattern:
  - `GET ${SNAPI_BASE}/articles/?limit=12&ordering=-published_at&published_at_gte=<iso>&summary_contains_one=...`

## List Response fields used
- `id`
- `title`
- `summary`
- `image_url`
- `news_site`
- `published_at`

## Detail Request
- URL pattern:
  - `GET ${SNAPI_BASE}/articles/{id}/`

## Detail Response fields used
- `title`
- `summary`
- `news_site`
- `published_at`

---

## 6) Error Handling and Resilience

- `Promise.allSettled` prevents total dashboard failure.
- Fallback article data is available for degraded mode.
- Detail calls use per-article cache to avoid duplicate requests.
- UI loading state:
  - dashboard sync state (`loading`)
  - modal detail state (`detailLoading`)

---

## 7) Files Involved

- `src/App.jsx` -> core API implementation, transformations, rendering
- `docs/globenews-architecture.drawio` -> visual architecture/UML documentation
- `apiimplementation.md` -> this step-by-step implementation guide

