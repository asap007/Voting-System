# VoteHub AI - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Prerequisites
- Node.js 18+ installed
- A Google Gemini API key ([Get one here](https://makersuite.google.com/app/apikey))
- A Cloudflare account (free tier works!)

---

## Step 1: Clone and Install

```bash
# Navigate to your project
cd /home/anshulsinghsengar/Documents/VoteHub

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

---

## Step 2: Set Up Backend (Local Development)

```bash
cd backend

# Login to Cloudflare
npx wrangler login

# Create D1 database
npx wrangler d1 create votehub-db
# Copy the database_id from output

# Update wrangler.toml with your database_id
# Edit the file and replace YOUR_DATABASE_ID

# Create KV namespace
npx wrangler kv:namespace create KV
# Copy the id from output

# Update wrangler.toml with your KV id
# Edit the file and replace YOUR_KV_ID

# Apply database schema
npx wrangler d1 execute votehub-db --file=./schema.sql

# Set secrets (for local development, create .dev.vars file)
echo 'GEMINI_API_KEY="your-gemini-api-key-here"' > .dev.vars
echo 'ENCRYPTION_KEY="'$(openssl rand -base64 32)'"' >> .dev.vars

# Start backend
npm run dev
```

Your backend is now running at `http://localhost:8787`

---

## Step 3: Set Up Frontend

```bash
cd ../frontend

# Create environment file
echo 'NEXT_PUBLIC_API_URL=http://localhost:8787' > .env.local

# Start frontend
npm run dev
```

Your frontend is now running at `http://localhost:3000`

---

## Step 4: Test It Out!

1. **Open your browser**: `http://localhost:3000`

2. **Create an account**:
   - Click "Get Started"
   - Fill in your details
   - You'll be redirected to the dashboard

3. **Create your first form**:
   - Click "+ Create Form"
   - Try this prompt:
     ```
     Create a quick event feedback form. Ask about overall 
     satisfaction (1-10), what they liked most, what could be 
     improved, and if they'd attend again. Keep it under 1 minute.
     ```
   - Click "Generate Form"
   - The AI will create a smart form with 4-5 questions

4. **Publish and test**:
   - Click "Edit" on your form
   - You'll see all the AI-generated questions
   - Click "Publish Form"
   - Copy the form link (e.g., `/f/frm_abc123`)
   - Open it in an incognito window
   - Fill it out!

5. **View analytics**:
   - Go back to dashboard
   - Click "Analytics" on your form
   - See AI-generated insights, charts, and stats

---

## 🎨 What You Can Build

### Example Prompts to Try:

**For Educators:**
```
Create an anonymous mid-semester feedback form for my Machine 
Learning course. Ask about lecture pace, assignment difficulty, 
understanding of concepts, and what topics need more coverage.
Use Likert scales and open-ended questions.
```

**For Event Organizers:**
```
Create a post-hackathon survey. Ask about team experience, 
project difficulty, venue quality, food rating, and improvement 
suggestions. Keep it fun and under 2 minutes.
```

**For Product Teams:**
```
Create a user research form for our mobile app. Ask about 
feature usage, pain points, desired features, and overall 
satisfaction. Use yes/no, ratings, and checkboxes.
```

**For HR/Teams:**
```
Create an anonymous team health check. Ask about workload, 
communication, collaboration, and any concerns. Add follow-up 
questions if someone rates satisfaction below 3.
```

---

## 🔧 Troubleshooting

### Backend won't start?
- Make sure you're logged into Wrangler: `npx wrangler login`
- Check `.dev.vars` file exists with secrets
- Verify database ID in `wrangler.toml` matches your D1 database

### Frontend can't connect to backend?
- Check `NEXT_PUBLIC_API_URL` in `.env.local`
- Make sure backend is running on port 8787
- Check browser console for CORS errors

### Database errors?
- Verify schema was applied: 
  ```bash
  npx wrangler d1 execute votehub-db --command "SELECT name FROM sqlite_master WHERE type='table';"
  ```
- If tables are missing, reapply schema:
  ```bash
  npx wrangler d1 execute votehub-db --file=./schema.sql
  ```

### AI not generating forms?
- Check your Gemini API key in `.dev.vars`
- Verify you have API quota available
- Check backend logs for errors: `npx wrangler dev` shows real-time logs

---

## 📱 Features to Explore

### Question Types
- **Text**: Short answers
- **Textarea**: Long-form responses
- **Likert Scale**: 1-5 agreement scale
- **Rating**: 1-10 numeric rating
- **Multiple Choice**: Single selection
- **Checkboxes**: Multiple selections
- **Yes/No**: Binary choice

### Conditional Logic
The AI automatically adds conditional questions! For example:
- If rating < 3 → "What specifically was problematic?"
- If answer = "Yes" → "Tell us more about that"

### Analytics Features
- **AI Insights**: Gemini analyzes responses and provides actionable insights
- **Distribution Charts**: Visual representation of answer patterns
- **Theme Extraction**: AI identifies common themes in open-ended responses
- **Sentiment Analysis**: Understand positive/negative feedback
- **Export**: Download raw data as JSON

### Privacy & Security
- **Anonymous Mode**: No personal data collected
- **One Response Per Person**: Browser fingerprinting prevents duplicates
- **Encrypted Storage**: All responses encrypted with AES-256
- **Secure Sessions**: 30-day token-based authentication

---

## 🚢 Ready to Deploy?

See `DEPLOYMENT.md` for full deployment instructions to:
- **Cloudflare Workers** (backend) - Free tier: 100k requests/day
- **Vercel** (frontend) - Free tier: unlimited websites

---

## 💡 Pro Tips

1. **Be Specific with AI Prompts**: The more detail you provide, the better the form
2. **Test Before Publishing**: Always test your form before sharing
3. **Review Questions**: AI generates smart defaults, but you can edit in the form editor
4. **Check Analytics Regularly**: Insights update every 5 minutes
5. **Export Data**: Always back up important response data

---

## 🤝 Need Help?

- Check `README.md` for detailed documentation
- Check `DEPLOYMENT.md` for deployment guide
- Open an issue on GitHub
- Review the code - it's well-commented!

---

## 🎉 You're All Set!

You now have a fully functional AI-powered form builder. Create engaging surveys, collect feedback, and get instant insights powered by AI.

**Happy form building! 🚀**
