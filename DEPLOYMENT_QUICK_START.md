# Quick Deployment Guide - Step by Step

## Prerequisites
- GitHub account
- 30 minutes

---

## Step 1: Setup MongoDB Atlas (5 minutes)

1. Go to https://www.mongodb.com/cloud/atlas/register
2. Sign up (free)
3. Create a **FREE** cluster (M0)
4. Wait 3-5 minutes for cluster creation
5. Click **Connect** → **Connect your application**
6. Copy the connection string
7. Replace `<password>` with a password you create
8. Save this connection string!

**Example:**
```
mongodb+srv://myuser:mypassword@cluster0.xxxxx.mongodb.net/tabaani?retryWrites=true&w=majority
```

9. Go to **Database Access** → Create database user
10. Go to **Network Access** → Add IP Address → **Allow Access from Anywhere** (0.0.0.0/0)

---

## Step 2: Push Code to GitHub (2 minutes)

1. Create a new repository on GitHub
2. Push your code:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/tabaani.git
git push -u origin main
```

---

## Step 3: Deploy Backend to Render (10 minutes)

1. Go to https://render.com
2. Sign up with GitHub
3. Click **New +** → **Web Service**
4. Connect your repository
5. Fill in:
   - **Name:** tabaani-backend
   - **Root Directory:** (leave empty)
   - **Environment:** Node
   - **Build Command:** `cd server && npm install`
   - **Start Command:** `cd server && npm start`

6. Click **Advanced** → Add Environment Variables:
   ```
   MONGODB_URI = (paste your MongoDB connection string)
   JWT_SECRET = (generate a random string, e.g., use: openssl rand -base64 32)
   NODE_ENV = production
   PORT = 10000
   ```

7. Click **Create Web Service**
8. Wait 5-10 minutes
9. Copy your backend URL (e.g., `https://tabaani-backend.onrender.com`)

---

## Step 4: Deploy Frontend to Vercel (5 minutes)

1. Go to https://vercel.com
2. Sign up with GitHub
3. Click **Add New Project**
4. Import your repository
5. Configure:
   - **Framework Preset:** Create React App
   - **Root Directory:** `client`
   - **Build Command:** `npm run build`
   - **Output Directory:** `build`

6. Add Environment Variable:
   ```
   REACT_APP_API_URL = (your Render backend URL from Step 3)
   ```

7. Click **Deploy**
8. Wait 2-3 minutes
9. Your site is live! 🎉

---

## Step 5: Update Backend CORS (2 minutes)

1. Go back to Render dashboard
2. Find your backend service
3. Go to **Environment** tab
4. Add new variable:
   ```
   FRONTEND_URL = (your Vercel frontend URL)
   ```

5. Update `server/index.js` to use this:
```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
```

6. Redeploy (Render will auto-redeploy)

---

## Step 6: Test Everything (5 minutes)

1. Visit your Vercel URL
2. Go to `/admin/login`
3. Register a new admin account
4. Create a test article
5. Upload an image
6. Test search functionality

---

## You're Done! 🎊

Your website is now live on the internet!

**Frontend URL:** https://your-project.vercel.app
**Backend URL:** https://tabaani-backend.onrender.com
**Database:** MongoDB Atlas (cloud)

---

## Important Notes

1. **Render Free Tier:** Backend spins down after 15 minutes of inactivity. First request after inactivity takes ~30 seconds to wake up.

2. **MongoDB Atlas Free Tier:** 512MB storage, perfect for development/small production.

3. **File Uploads:** Files stored on Render server may be lost. For production, use cloud storage (AWS S3, Cloudinary).

4. **Custom Domain:** You can add custom domains to both Vercel and Render.

---

## Need Help?

- Render Docs: https://render.com/docs
- Vercel Docs: https://vercel.com/docs
- MongoDB Atlas Docs: https://docs.atlas.mongodb.com















