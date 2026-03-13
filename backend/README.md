# Smart Visita – Backend API

Express.js backend API for the Smart Visita business card scanner.

## Setup

```bash
npm install
cp .env.example .env
# Fill in your values in .env
```

## Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret key for JWT signing (use a long random string) |
| `GEMINI_API_KEY` | Google Gemini API key from [aistudio.google.com](https://aistudio.google.com) |
| `PORT` | Server port (default: 3001) |
| `CORS_ORIGIN` | Comma-separated list of allowed frontend origins |

## Database Setup

1. Create a PostgreSQL database (on Render or locally)
2. Run the schema:
   ```bash
   psql $DATABASE_URL -f db/schema.sql
   ```
3. Seed admin accounts:
   ```bash
   # Edit scripts/seed-admins.js to set your usernames/passwords first!
   node scripts/seed-admins.js
   ```

## Running Locally

```bash
npm run dev    # with hot reload (nodemon)
npm start      # production
```

## API Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | No | Health check |
| POST | `/api/auth/login` | No | Admin login → returns JWT |
| POST | `/api/auth/verify` | Token | Verify token validity |
| POST | `/api/extract-card` | Token | Extract card data via Gemini AI |
| GET | `/api/cards` | Token | Fetch all extracted cards |
| POST | `/api/cards` | Token | Save extracted cards to DB |
| DELETE | `/api/cards/:id` | Token | Delete a single card |
| POST | `/api/cards/delete-batch` | Token | Delete multiple cards |

## Deploying to Render

1. Push this repo to GitHub
2. On [Render](https://render.com), create a **Web Service**:
   - Root directory: `backend`
   - Build command: `npm install`
   - Start command: `npm start`
3. Add a **PostgreSQL** database on Render and copy the connection string to `DATABASE_URL`
4. Set all environment variables in the Render dashboard
5. After deploy, run the schema and seed scripts via Render shell
