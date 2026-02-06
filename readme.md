# PF Stock Portfolio Tracker (Node + React)

This project is a lightweight portfolio tracker that combines a Node.js API with a React
dashboard (served from a static HTML file) to help you log holdings and view market news.

## Features
- **Holdings tracking** (add/update/delete positions).
- **Portfolio summary** with total invested cost basis.
- **Market news feed** for the tickers you follow.

## Local development
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the server:
   ```bash
   npm start
   ```
3. Open the app:
   ```
   http://localhost:3000
   ```

## Data storage
The API uses JSON files for storage so it works without a database:
- `data/holdings.json`
- `data/news.json`

You can replace these with a database later (MongoDB, Postgres, etc.) if needed.

## API endpoints
- `GET /api/holdings`
- `POST /api/holdings`
- `DELETE /api/holdings/:symbol`
- `GET /api/news`
- `GET /api/summary`

## Free hosting (Render)
This app runs as-is on Render’s free web service tier.

1. Create a new Web Service on https://render.com and connect this GitHub repo.
2. Render will read `render.yaml` and auto-configure the build/start commands.
3. Click **Deploy**. When it finishes, your app will be live at the Render URL.

If you prefer a manual setup in Render, use:
- **Build command:** `npm install`
- **Start command:** `node app.js`

> Tip: If you want your own custom domain, Render supports it on paid plans.
