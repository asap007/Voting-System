# VoteHub AI - Setup Checklist

## ✅ Pre-Deployment Checklist

### Backend Setup
- [ ] Cloudflare account created
- [ ] Wrangler CLI installed: `npm install -g wrangler`
- [ ] Logged in to Wrangler: `npx wrangler login`
- [ ] D1 database created: `npx wrangler d1 create votehub-db`
- [ ] Database ID updated in `wrangler.toml`
- [ ] KV namespace created: `npx wrangler kv:namespace create KV`
- [ ] KV ID updated in `wrangler.toml`
- [ ] Database schema applied: `npx wrangler d1 execute votehub-db --file=./schema.sql`
- [ ] Gemini API key obtained from https://makersuite.google.com/app/apikey
- [ ] Encryption key generated: `openssl rand -base64 32`
- [ ] `.dev.vars` file created for local development
- [ ] Secrets set for production:
  - [ ] `npx wrangler secret put GEMINI_API_KEY`
  - [ ] `npx wrangler secret put ENCRYPTION_KEY`
- [ ] Backend dependencies installed: `npm install`
- [ ] Backend tested locally: `npm run dev`
- [ ] Backend deployed: `npm run deploy`
- [ ] Backend health check works: `curl https://your-worker.workers.dev/health`

### Frontend Setup
- [ ] Frontend dependencies installed: `npm install`
- [ ] `.env.local` file created
- [ ] `NEXT_PUBLIC_API_URL` set to backend URL
- [ ] Frontend tested locally: `npm run dev`
- [ ] Can access landing page: `http://localhost:3000`
- [ ] Can register a new account
- [ ] Can login successfully
- [ ] Can create a form with AI
- [ ] Can view dashboard
- [ ] CORS updated in backend with frontend URL
- [ ] Frontend deployed to Vercel
- [ ] Production environment variable set in Vercel

### Testing Checklist
- [ ] Register new user works
- [ ] Login works
- [ ] Logout works
- [ ] Create form with AI works
- [ ] Generated form has questions
- [ ] Publish form works
- [ ] Form link accessible without auth
- [ ] Submit response works
- [ ] Response counter increments
- [ ] Analytics page loads
- [ ] AI insights are generated
- [ ] Export responses works
- [ ] One-response-per-person enforcement works
- [ ] Anonymous mode works
- [ ] Conditional logic works (if present)

### Security Checklist
- [ ] All passwords are hashed
- [ ] All responses are encrypted
- [ ] Sessions expire after 30 days
- [ ] CORS is properly configured
- [ ] API requires authentication for protected routes
- [ ] Form submissions validate required fields
- [ ] SQL injection protection (parameterized queries)
- [ ] XSS protection (React auto-escaping)
- [ ] HTTPS enforced (automatic on Cloudflare/Vercel)

### Performance Checklist
- [ ] Frontend loads in <3 seconds
- [ ] Backend responds in <500ms
- [ ] Images optimized (if any)
- [ ] Lazy loading implemented
- [ ] Analytics cached (5 minutes)
- [ ] Database queries optimized with indexes

### Documentation Checklist
- [ ] README.md is complete
- [ ] QUICKSTART.md is available
- [ ] DEPLOYMENT.md has full instructions
- [ ] PROJECT_SUMMARY.md explains architecture
- [ ] Code is well-commented
- [ ] Environment variables documented
- [ ] API endpoints documented

---

## 🧪 Manual Testing Steps

### Test 1: User Registration & Login
1. Go to homepage
2. Click "Get Started"
3. Fill in registration form
4. Submit
5. Verify redirect to dashboard
6. Logout
7. Login again with same credentials
8. Verify redirect to dashboard

**Expected**: ✅ User can register, login, and logout

---

### Test 2: AI Form Generation
1. Login to dashboard
2. Click "+ Create Form"
3. Enter prompt: "Create a quick satisfaction survey with 3 questions"
4. Click "Generate Form"
5. Wait for AI generation
6. Verify questions are created

**Expected**: ✅ Form generated with 3+ questions in <10 seconds

---

### Test 3: Form Submission
1. Publish a form from dashboard
2. Copy form link
3. Open link in incognito window
4. Fill out all questions
5. Submit form
6. Verify thank you message

**Expected**: ✅ Response submitted successfully

---

### Test 4: One-Response-Per-Person
1. Complete Test 3
2. Try to submit again in same incognito window
3. Verify error: "You have already submitted a response"

**Expected**: ✅ Duplicate submission blocked

---

### Test 5: Analytics
1. Login to dashboard
2. Submit 2-3 responses to a form
3. Click "Analytics" on the form
4. Wait for AI insights generation
5. Verify charts and statistics appear

**Expected**: ✅ Analytics load with AI insights

---

### Test 6: Data Export
1. Go to analytics page
2. Click "Export Data"
3. Verify JSON file downloads
4. Open file and verify response data

**Expected**: ✅ Decrypted responses exported

---

### Test 7: Conditional Logic (if implemented)
1. Create form with conditional questions
2. Submit response that triggers condition
3. Verify follow-up question appears
4. Submit response that doesn't trigger condition
5. Verify follow-up question doesn't appear

**Expected**: ✅ Conditional logic works

---

## 🐛 Common Issues & Fixes

### Issue: "Failed to load form"
**Fix**: Check backend URL in `.env.local`, verify backend is deployed

### Issue: "Invalid credentials"
**Fix**: Clear localStorage, re-register

### Issue: "Database error"
**Fix**: Verify schema was applied, check database ID in wrangler.toml

### Issue: CORS error
**Fix**: Update CORS origins in `backend/src/index.ts`, redeploy

### Issue: "AI generation failed"
**Fix**: Check Gemini API key, verify quota not exceeded

### Issue: Encryption error
**Fix**: Verify ENCRYPTION_KEY is set, must be 32+ characters

---

## 📋 Production Readiness

### Before Going Live:
- [ ] All tests pass
- [ ] No console errors
- [ ] Custom domain configured (optional)
- [ ] Analytics tracking added (optional)
- [ ] Terms of service added
- [ ] Privacy policy added
- [ ] Contact/support email configured
- [ ] Rate limiting considered
- [ ] Monitoring/alerting set up
- [ ] Backup strategy in place

### Monitoring:
- [ ] Cloudflare Analytics enabled
- [ ] Vercel Analytics enabled
- [ ] Error tracking (Sentry/LogRocket) - optional
- [ ] Uptime monitoring - optional

---

## 🎉 Launch Checklist

- [ ] Announce on social media
- [ ] Share on Product Hunt
- [ ] Post on Reddit (relevant subreddits)
- [ ] Share on Hacker News
- [ ] Write blog post
- [ ] Update portfolio
- [ ] Add to GitHub
- [ ] Create demo video
- [ ] Prepare press kit

---

## 📞 Support Resources

- **Cloudflare Docs**: https://developers.cloudflare.com/
- **Next.js Docs**: https://nextjs.org/docs
- **Vercel Docs**: https://vercel.com/docs
- **Gemini AI Docs**: https://ai.google.dev/
- **Community Discord**: (create one if needed)

---

**Status**: Ready for deployment! 🚀

Last updated: November 18, 2025
