# VoteHub AI

A conversational form builder powered by AI with smart analytics.

## Project Structure

```
VoteHub/
├── frontend/          # Next.js frontend
│   ├── src/
│   │   ├── app/      # Next.js app router pages
│   │   ├── components/ # React components
│   │   ├── lib/      # Utilities and API client
│   │   └── types/    # TypeScript types
│   └── package.json
│
└── backend/          # Cloudflare Workers backend
    ├── src/
    │   ├── routes/   # API routes
    │   ├── utils/    # Utilities (crypto, AI)
    │   ├── types.ts  # TypeScript types
    │   └── index.ts  # Main entry point
    ├── schema.sql    # Database schema
    └── wrangler.toml # Cloudflare config
```

## Features

- **AI-Powered Form Generation**: Describe your needs in natural language, get a smart form
- **Conversational UI**: One question at a time with smooth animations
- **Conditional Logic**: Dynamic question flow based on previous answers
- **Anonymous Responses**: Privacy-first with AES-256 encryption
- **One Response Per Person**: Browser fingerprinting to prevent duplicates
- **Smart Analytics**: AI-generated insights, sentiment analysis, visualizations
- **Real-time Updates**: Live response counters and engagement metrics

## Tech Stack

### Frontend
- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS 4
- React 19

### Backend
- Cloudflare Workers
- Hono (lightweight web framework)
- D1 (SQLite database)
- KV Storage
- Google Gemini AI

## Setup Instructions

### Prerequisites
- Node.js 18+
- npm or yarn
- Cloudflare account
- Google Gemini API key

### 1. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create D1 database
npx wrangler d1 create votehub-db

# Update wrangler.toml with the database ID from the previous command

# Create KV namespace
npx wrangler kv:namespace create KV

# Update wrangler.toml with the KV namespace ID

# Apply database schema
npx wrangler d1 execute votehub-db --file=./schema.sql

# Set secrets
npx wrangler secret put GEMINI_API_KEY
# Enter your Gemini API key when prompted

npx wrangler secret put ENCRYPTION_KEY
# Enter a 32-character encryption key (generate with: openssl rand -base64 32)

# Run locally
npm run dev

# Deploy to Cloudflare
npm run deploy
```

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env.local file
cp .env.local.example .env.local

# Update NEXT_PUBLIC_API_URL in .env.local
# For local: http://localhost:8787
# For production: https://your-worker.workers.dev

# Run locally
npm run dev

# Build for production
npm run build

# Deploy to Vercel
# Connect your GitHub repo to Vercel and it will auto-deploy
# Or use: vercel deploy
```

### 3. Database Migration

The `schema.sql` file contains the complete database schema. Apply it with:

```bash
npx wrangler d1 execute votehub-db --file=./schema.sql
```

## Environment Variables

### Backend (Cloudflare Secrets)
- `GEMINI_API_KEY`: Google Gemini API key for AI form generation
- `ENCRYPTION_KEY`: 32-character key for AES-256 encryption

### Frontend (.env.local)
- `NEXT_PUBLIC_API_URL`: Backend API URL

## Deployment

### Backend (Cloudflare Workers)
```bash
cd backend
npm run deploy
```
Your worker will be available at: `https://votehub-backend.your-subdomain.workers.dev`

### Frontend (Vercel)
1. Push code to GitHub
2. Import project in Vercel
3. Set environment variable: `NEXT_PUBLIC_API_URL` to your Cloudflare Worker URL
4. Deploy

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login
- `POST /auth/logout` - Logout
- `GET /auth/me` - Get current user

### Forms
- `POST /forms/generate` - Generate form with AI
- `GET /forms` - Get user's forms
- `GET /forms/:id` - Get form details
- `PUT /forms/:id/publish` - Publish form
- `DELETE /forms/:id` - Delete form

### Responses
- `POST /responses/submit` - Submit form response
- `GET /responses/count/:formId` - Get response count

### Analytics
- `GET /analytics/:formId` - Get form analytics with AI insights
- `GET /analytics/:formId/export` - Export responses as JSON

## Usage Example

### Creating a Form

1. Login to dashboard
2. Click "Create Form"
3. Enter AI prompt:
   ```
   Create an anonymous feedback form for my Data Structures course. 
   Ask about lecture pace, clarity of explanations, difficulty of 
   lab assignments, and what resources students need. Keep it under 
   2 minutes.
   ```
4. AI generates 8-10 smart questions with varied types
5. Review and publish
6. Share the form link: `https://your-app.vercel.app/f/form_abc123`

### Viewing Analytics

1. Go to form in dashboard
2. Click "Analytics"
3. See:
   - AI-generated insights
   - Response distribution charts
   - Sentiment analysis
   - Common themes from open-ended responses
   - Export raw data

## Security Features

- **Password Hashing**: SHA-256 with salt
- **AES-256 Encryption**: All responses encrypted at rest
- **Session Tokens**: 30-day expiry with secure storage
- **CORS Protection**: Configured for frontend-only access
- **Input Validation**: All API inputs validated
- **Anonymous Mode**: No PII collected when enabled

## Contributing

Contributions welcome! Please open an issue or PR.

## License

MIT

## Support

For issues or questions, please open a GitHub issue.
# Voting-System
# Voting-System
# Voting-System
