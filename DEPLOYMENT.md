# Deployment Instructions for VoteHub AI

## Backend Deployment (Cloudflare Workers)

### Initial Setup

1. **Login to Cloudflare**
   ```bash
   cd backend
   npx wrangler login
   ```

2. **Create D1 Database**
   ```bash
   npx wrangler d1 create votehub-db
   ```
   
   Copy the database ID from the output and update `wrangler.toml`:
   ```toml
   [[d1_databases]]
   binding = "DB"
   database_name = "votehub-db"
   database_id = "YOUR_DATABASE_ID_HERE"
   ```

3. **Create KV Namespace**
   ```bash
   npx wrangler kv:namespace create KV
   ```
   
   Copy the namespace ID and update `wrangler.toml`:
   ```toml
   [[kv_namespaces]]
   binding = "KV"
   id = "YOUR_KV_ID_HERE"
   ```

4. **Apply Database Schema**
   ```bash
   npx wrangler d1 execute votehub-db --file=./schema.sql
   ```

5. **Set Secrets**
   
   Generate encryption key:
   ```bash
   openssl rand -base64 32
   ```
   
   Set secrets:
   ```bash
   npx wrangler secret put ENCRYPTION_KEY
   # Paste the generated key
   
   npx wrangler secret put GEMINI_API_KEY
   # Paste your Gemini API key from https://makersuite.google.com/app/apikey
   ```

6. **Deploy**
   ```bash
   npm run deploy
   ```
   
   Your API will be available at: `https://votehub-backend.YOUR_SUBDOMAIN.workers.dev`

### Updating CORS

After deploying, update the CORS origins in `backend/src/index.ts`:

```typescript
app.use('/*', cors({
  origin: ['http://localhost:3000', 'https://your-app.vercel.app'],
  // ...
}));
```

Then redeploy:
```bash
npm run deploy
```

---

## Frontend Deployment (Vercel)

### Option 1: GitHub Integration (Recommended)

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/votehub.git
   git push -u origin main
   ```

2. **Deploy on Vercel**
   - Go to https://vercel.com/new
   - Import your GitHub repository
   - Framework Preset: Next.js
   - Root Directory: `frontend`
   - Add environment variable:
     - `NEXT_PUBLIC_API_URL` = `https://votehub-backend.YOUR_SUBDOMAIN.workers.dev`
   - Click "Deploy"

### Option 2: Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy**
   ```bash
   cd frontend
   vercel
   ```
   
   Follow the prompts:
   - Set up and deploy: Yes
   - Scope: Your account
   - Link to existing project: No
   - Project name: votehub
   - Directory: ./
   - Override settings: No
   
3. **Set Environment Variable**
   ```bash
   vercel env add NEXT_PUBLIC_API_URL
   # Enter your Cloudflare Worker URL
   ```

4. **Deploy to Production**
   ```bash
   vercel --prod
   ```

---

## Post-Deployment Steps

### 1. Update CORS in Backend

Edit `backend/src/index.ts` and update the CORS origins with your Vercel URL:

```typescript
app.use('/*', cors({
  origin: ['http://localhost:3000', 'https://votehub.vercel.app'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
```

Redeploy backend:
```bash
cd backend
npm run deploy
```

### 2. Test the Application

1. Visit your Vercel URL
2. Create an account
3. Generate a form with AI
4. Publish and test the form
5. Submit responses
6. View analytics

### 3. Custom Domain (Optional)

#### For Vercel:
- Go to your project settings in Vercel
- Click "Domains"
- Add your custom domain
- Update DNS records as instructed

#### For Cloudflare Workers:
- Go to Cloudflare Dashboard
- Workers & Pages → Your Worker → Settings → Triggers
- Add Custom Domain
- Select your domain from the dropdown

---

## Environment Variables Summary

### Backend (Cloudflare Workers)
Set using `npx wrangler secret put <NAME>`:
- `GEMINI_API_KEY` - Google Gemini API key
- `ENCRYPTION_KEY` - 32-character encryption key

### Frontend (Vercel)
Set in Vercel dashboard or `.env.local`:
- `NEXT_PUBLIC_API_URL` - Backend API URL

---

## Monitoring & Logs

### Cloudflare Workers
- View logs: `npx wrangler tail`
- Dashboard: https://dash.cloudflare.com → Workers & Pages

### Vercel
- Real-time logs in Vercel dashboard
- Go to Deployments → Select deployment → Functions

---

## Troubleshooting

### CORS Errors
- Ensure backend CORS includes your frontend URL
- Redeploy backend after updating CORS

### Database Errors
- Verify database ID in `wrangler.toml`
- Check if schema was applied: `npx wrangler d1 execute votehub-db --command "SELECT name FROM sqlite_master WHERE type='table';"`

### API Connection Errors
- Verify `NEXT_PUBLIC_API_URL` is set correctly
- Check backend is deployed and accessible
- Test backend health: `curl https://your-worker.workers.dev/health`

### Environment Variables Not Loading
- Ensure variables start with `NEXT_PUBLIC_` for frontend
- Redeploy after adding/changing environment variables

---

## Scaling Considerations

### Cloudflare Workers
- Free tier: 100,000 requests/day
- Paid tier: $5/month for 10M requests
- D1: Free tier includes 5GB storage

### Vercel
- Free tier: 100GB bandwidth/month
- Paid tier: Pro plan at $20/month
- Automatic edge caching

---

## Security Checklist

- [ ] Set strong encryption key (32+ characters)
- [ ] Secure Gemini API key
- [ ] Enable HTTPS only (automatic on Cloudflare & Vercel)
- [ ] Configure CORS properly
- [ ] Review database permissions
- [ ] Enable rate limiting (if needed)
- [ ] Monitor error logs regularly

---

## Backup & Recovery

### Database Backup
```bash
# Export D1 database
npx wrangler d1 backup create votehub-db

# List backups
npx wrangler d1 backup list votehub-db
```

### Code Backup
- Git repository (GitHub/GitLab)
- Regular commits
- Tagged releases for stable versions

---

## Next Steps

1. Set up custom domain
2. Configure email notifications (if needed)
3. Add analytics tracking (Google Analytics, Plausible)
4. Set up monitoring (Sentry, LogRocket)
5. Create user documentation
6. Implement rate limiting for API
7. Add more question types
8. Build mobile app (React Native)

---

For more help, refer to:
- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Vercel Docs](https://vercel.com/docs)
- [Next.js Docs](https://nextjs.org/docs)
