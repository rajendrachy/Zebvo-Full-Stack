# Zebvo Social Media Scraper Dashboard – Study Guide

## 📚 Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture Diagram](#architecture-diagram)
3. [Backend](#backend)
   - Express server
   - CORS configuration
   - Database (MongoDB Atlas)
   - Services
     - **scraper.js** – periodic scraping
     - **nlp.js** – categorisation, summary, clustering, gibberish filter, translation helper
   - API routes (`/api/posts`, `/api/posts/clustered`, `/api/stats`)
   - Postman collection
4. [Frontend (Vite + React)](#frontend)
   - Project structure
   - Environment variables (`VITE_API_BASE`)
   - Core components (`App.jsx`, UI icons, charts)
   - State management (filters, sorting, translation cache)
   - Export utilities (CSV / PDF)
5. [NLP Summary Logic](#nlp-summary-logic)
   - Template‑based 30‑word summary
   - Padding for short posts and Punjab‑specific fallback
6. [CORS Fix & Development Tips](#cors-fix--development-tips)
7. [Deployment](#deployment)
   - Backend on Render
   - Frontend on Vercel
   - Environment variable sync
8. [Testing the Stack Locally](#testing-the-stack-locally)
9. [Future Enhancements](#future-enhancements)
10. [References & Useful Links](#references--useful-links)

---

## Project Overview {#project-overview}
The **Zebvo Social Media Scraper Dashboard** aggregates passport‑related social‑media posts from the last 24 hours, enriches them with NLP (auto‑categorisation, short AI summary, clustering, gibberish filtering) and presents a filterable, multilingual dashboard. It is a full‑stack application designed for college‑level hands‑on learning.

Key goals:
- Real‑time scraping from multiple platforms (mocked in `scraper.js`).
- One‑click translation into 10 languages (via MyMemory API with offline fallbacks).
- 30‑word AI summary for each post, with a Punjab‑specific fallback when the text is too short.
- Cluster similar posts to avoid duplicates.
- Comprehensive UI with dark/light mode, filter/sort, search, export.

---

## Architecture Diagram {#architecture-diagram}
```
+-------------------+       +-------------------+       +-------------------+
|   Frontend (Vite) | <---> |   Backend (Node)  | <---> |   MongoDB Atlas   |
+-------------------+       +-------------------+       +-------------------+
        ^   ^                     ^   ^                     ^   ^
        |   |                     |   |                     |   |
  VITE_API_BASE          /api routes               Data models
  (Vercel/localhost)    (posts, stats, etc.)      (Post schema)
```
*The diagram is kept in ASCII for portability – you can replace it with a PNG if desired.*

---

## Backend {#backend}
### Tech Stack
- **Node 18+**, **Express**, **Mongoose**
- **dotenv** for env variables (`MONGODB_URI`, `PORT`)
- **cors** middleware (now permissive for local dev)
- **nodemon** for auto‑restart during development.

### Server (`backend/server.js`)
- Sets up CORS with `origin: true` (reflects any incoming origin – solves the dev‑time CORS error you encountered).
- Parses JSON bodies, mounts the API router at `/api`.
- Health‑check endpoint `/health`.
- Graceful shutdown on `SIGTERM`.

### Database (`backend/models/Post.js`)
```js
import mongoose from 'mongoose';
const PostSchema = new mongoose.Schema({
  platform: String,
  handle: String,
  text: String,
  language: String,
  category: String,
  sentiment: String,
  engagement: { likes: Number, shares: Number, comments: Number },
  createdAt: { type: Date, default: Date.now },
  isSpam: { type: Boolean, default: false }
});
export default mongoose.model('Post', PostSchema);
```
- Indexes on `createdAt` and `category` improve query performance.

### Services
#### `scraper.js`
- Uses `node-cron` to run every 30 seconds, generates mock posts, saves them via the `Post` model, and logs activity.
- In a real deployment you would replace the mock generator with platform‑specific SDK/API calls.

#### `nlp.js`
- **Gibberish filter** (`isGibberish`) – regex + vowel‑ratio.
- **Sentiment analysis** – simple lexicon scoring.
- **Category classification** – keyword matching (`CATEGORY_KEYWORDS`).
- **Summary (`generateSummary`)** – extracts delay, location, topic; pads to ~30 words; adds a Punjab‑specific fallback when under 15 words.
- **Clustering (`clusterPosts`)** – Jaccard similarity > 0.45 groups similar posts.
- **Translation (`translation.js`)** – MyMemory API with cache and offline dictionary fallbacks for 10 languages.

### API Routes (`backend/routes/api.js`)
| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/posts` | Returns filtered posts (supports query params: `includeSpam`, `platform`, `region`, `category`, `sentiment`, `language`, `search`, `sortBy`, `sortOrder`). |
| `GET` | `/posts/clustered` | Same filters, but returns posts already clustered via `clusterPosts`. |
| `GET` | `/stats` | Dashboard metrics: total posts, spam count, top categories, engagement totals. |
| `POST` | `/posts` | Add a new post (used by the scraper). |
| `GET` | `/health` | Simple health check. |

### Postman Collection (`backend/docs/postman_collection.json`)
- Exported collection includes all endpoints with example queries, ready for QA.

---

## Frontend {#frontend}
### Tech Stack
- **Vite + React 18**
- **Lucide‑react** icons, **Recharts** for graphs.
- **CSS variables** for dark/light mode (stored in `frontend/src/index.css`).
- **Environment variable** `VITE_API_BASE` (defaults to `http://localhost:5000/api`).

### Core Component (`frontend/src/App.jsx`)
- Global state via `useState` / `useEffect` for posts, filters, stats, translations.
- `fetchFeed` builds a `URLSearchParams` object from filter state and calls `/posts` and `/posts/clustered`.
- `fetchStats` calls `/stats`.
- Translation button triggers `POST /translate` (via `translation.js` backend helper). 
- Export buttons call utility functions `exportToCSV` and `exportToPDF`.

### UI Highlights
- Dark/Light mode toggle (`data-theme` attr on `<html>`).
- Responsive layout – mobile‑first CSS grid.
- Filter bar with dropdowns for platform, region, category, sentiment, language.
- Search bar (`<input>` with debounced fetch).
- Cluster view collapsible cards.
- Real‑time “scraping” badge updates when the scheduler adds new posts.

---

## NLP Summary Logic {#nlp-summary-logic}
The final implementation in `generateSummary` (lines 188‑226) follows this flow:
1. Lower‑case the text.
2. Extract **delay** (`/delayed for (\d+\s?(weeks?|days?))/`).
3. Extract **location** (`/in ([a-zA-Z]+)/`).
4. Detect **topic** – passport renewal vs generic passport.
5. Build the base sentence:
   ```js
   let summary = "User reports";
   if (duration) summary += ` a ${duration}`;
   if (topic) summary += ` ${topic}`;
   if (location) summary += ` in ${location}`;
   ```
6. Append *lack‑of‑response* clause when applicable.
7. Trim, ensure a period, **pad** to ≥ 10 words using the original text, and finally **add a Punjab‑specific fallback** if still < 15 words:
   ```js
   summary += ' This post discusses passport related concerns in Punjab and seeks assistance from the relevant authorities.';
   ```
Result is a fluent ~30‑word summary that satisfies the project spec.

---

## CORS Fix & Development Tips {#cors-fix--development-tips}
- **Problem**: Frontend running on Vite uses a random port (e.g., 5174). The original `cors` whitelist only allowed `localhost:5173` and `localhost:3000`, causing the browser to block requests.
- **Solution**: In `backend/server.js` we changed the CORS config to:
  ```js
  app.use(cors({ origin: true, methods: [...], credentials: true }));
  ```
  This reflects any incoming `Origin` header, allowing any localhost port during development while still supporting credentialed requests.
- **Production**: Replace `origin: true` with a whitelist regex array (`/\.vercel\.app$/`, `/\.onrender\.com$/`) when deploying.

---

## Deployment {#deployment}
### Backend on Render
1. Create a **Render Web Service**.
2. Set **Build Command**: `npm install && npm run build` (if you add a build step) – otherwise just `npm install`.
3. **Start Command**: `npm run dev` (or `node server.js`). Render automatically sets `PORT`.
4. Add **Environment Variable** `MONGODB_URI` with your Atlas connection string.
5. After the first push, Render builds and runs – the live URL is `https://zebvo-backend.onrender.com`.

### Frontend on Vercel
1. Connect the GitHub repo to Vercel.
2. Set **Framework Preset** to *Vite* (or `npm run build`).
3. Add **Vite env variable** `VITE_API_BASE` → `https://zebvo-backend.onrender.com/api`.
4. Deploy – the URL will be something like `https://zebvo-full-stack.vercel.app`.

---

## Testing the Stack Locally {#testing-the-stack-locally}
1. **Start MongoDB Atlas** (or local MongoDB) and ensure `MONGODB_URI` is set in `backend/.env`.
2. Run the backend: `npm run dev` (watch for `Server running on http://localhost:5000`).
3. Run the frontend: `npm run dev` (Vite shows `http://localhost:5174`).
4. Open the Vite URL in a browser – the dashboard loads.
5. Verify:
   - Posts appear (scraper adds a new post every 30 s).
   - Filters work and update the feed.
   - Clicking the **Translate** button shows translated text.
   - Export → CSV / PDF downloads a file.
   - Stats panel shows numbers (total posts, spam, etc.).
6. Check the Network tab – all requests should have a `200` status and no CORS errors.

---

## Future Enhancements {#future-enhancements}
- **Real social‑media integrations** (Twitter API v2, Reddit API, etc.).
- **WebSocket** for instant push of new posts to the dashboard.
- **More advanced NLP** – use a transformer model (e.g., HuggingFace) for sentiment and summary.
- **User authentication** (OAuth) to allow saving personal filter presets.
- **Dockerisation** – create `Dockerfile`s for backend and frontend for easier CI/CD.
- **Unit / integration tests** with Jest + Supertest for the API.
- **CI pipeline** (GitHub Actions) that lints, runs tests, and auto‑deploys on merge to `main`.

---

## References & Useful Links {#references--useful-links}
- **Render docs** – https://render.com/docs
- **Vercel docs** – https://vercel.com/docs
- **MyMemory Translation API** – https://mymemory.translated.net/doc/spec.php
- **Lucide‑react icons** – https://lucide.dev/icons/react
- **Recharts** – https://recharts.org/
- **Node‑cron** – https://github.com/node‑cron/node‑cron
- **Express CORS middleware** – https://github.com/expressjs/cors

---

*Prepared for interview / demo preparation – use this guide to walk through the full stack, explain design decisions, and showcase the working dashboard.*
