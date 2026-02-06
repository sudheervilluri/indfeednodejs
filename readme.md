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
