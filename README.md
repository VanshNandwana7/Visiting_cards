# Smart Visita – Business Card Scanner

An AI-powered application for extracting and managing business card data. Upload photos of visiting cards and the AI instantly extracts all contact details, which can then be exported to Excel.

## Tech Stack

- **Frontend**: Vite + React + TypeScript + Tailwind CSS + shadcn/ui
- **Backend**: Node.js + Express (deployed on Render)
- **Database**: PostgreSQL (hosted on Render)
- **AI**: Google Gemini 2.5 Flash

## Project Structure

```
smart-visita/
├── src/              # Frontend React application
├── backend/          # Express API server
│   ├── routes/       # API route handlers
│   ├── middleware/   # Auth middleware
│   ├── db/           # Database connection & schema
│   └── scripts/      # Utility scripts (seed admins)
├── public/
└── ...
```

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (or Render PostgreSQL)
- Google Gemini API key ([get one free](https://aistudio.google.com))

### Frontend Setup

```bash
npm install
cp .env.example .env
# Fill in VITE_API_URL with your backend URL
npm run dev
```

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Fill in DATABASE_URL, JWT_SECRET, GEMINI_API_KEY
npm run dev
```

### Seed Admin Accounts

```bash
cd backend
node scripts/seed-admins.js
```

## Deployment

- **Frontend** → [Vercel](https://vercel.com)
- **Backend + Database** → [Render](https://render.com)

## Features

- 📷 Upload business card images (JPG, PNG, PDF)
- 🤖 AI-powered data extraction (company, name, phone, email, etc.)
- 📊 Export to categorized Excel sheets
- 📜 History view with search & filter
- 🔒 Multi-admin login (JWT-based)
