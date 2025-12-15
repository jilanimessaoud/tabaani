# Deployment Guide - Tabaani Journalist Application

This guide will help you deploy your Tabaani application to production hosting services.

## Hosting Architecture

For this application, you'll need to host:
1. **Frontend (React)** - Static hosting (Vercel, Netlify, or similar)
2. **Backend (Node.js/Express)** - Platform hosting (Render, Railway, Heroku, or similar)
3. **Database (MongoDB)** - MongoDB Atlas (cloud database)

---

## Option 1: Recommended Setup (Free/Cheap)

### Frontend: Vercel (Free)
### Backend: Render (Free tier available)
### Database: MongoDB Atlas (Free tier available)

---

## Step 1: Setup MongoDB Atlas (Database)

### 1.1 Create MongoDB Atlas Account
1. Go to [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for a free account
3. Create a new cluster (choose FREE tier - M0)
4. Choose your region (closest to your users)

### 1.2 Configure Database Access
1. Go to **Database Access** → **Add New Database User**
2. Create username and password (save these!)
3. Set user privileges to **Read and write to any database**

### 1.3 Configure Network Access
1. Go to **Network Access** → **Add IP Address**
2. Click **Allow Access from Anywhere** (0.0.0.0/0) for development
3. For production, add your backend server IP

### 1.4 Get Connection String
1. Go to **Clusters** → Click **Connect**
2. Choose **Connect your application**
3. Copy the connection string
4. Replace `<password>` with your database user password
5. Replace `<dbname>` with `tabaani` or your preferred database name

**Example connection string:**
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/tabaani?retryWrites=true&w=majority
```

---

## Step 2: Deploy Backend (Node.js/Express)

### Option A: Render.com (Recommended - Free tier)

#### 2.1 Prepare Backend for Deployment

1. **Update server/index.js** to serve static files in production:
```javascript
// Add this before routes
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}
```

2. **Create render.yaml** in root directory (see file below)

3. **Update package.json** in root:
```json
{
  "scripts": {
    "build": "cd client && npm install && npm run build && cd ../server && npm install",
    "start": "cd server && node index.js"
  }
}
```

#### 2.2 Deploy to Render

1. Go to [https://render.com](https://render.com)
2. Sign up/login
3. Click **New +** → **Web Service**
4. Connect your GitHub repository
5. Configure:
   - **Name:** tabaani-backend
   - **Environment:** Node
   - **Build Command:** `npm run build`
   - **Start Command:** `npm start`
   - **Root Directory:** (leave empty or set to root)

6. **Add Environment Variables:**
   - `MONGODB_URI` = Your MongoDB Atlas connection string
   - `JWT_SECRET` = A strong random secret (generate one)
   - `PORT` = 10000 (Render default)
   - `NODE_ENV` = production

7. Click **Create Web Service**
8. Wait for deployment (5-10 minutes)
9. Copy your backend URL (e.g., `https://tabaani-backend.onrender.com`)

---

### Option B: Railway.app

1. Go to [https://railway.app](https://railway.app)
2. Sign up with GitHub
3. Click **New Project** → **Deploy from GitHub**
4. Select your repository
5. Add environment variables (same as Render)
6. Railway auto-detects Node.js and deploys
7. Get your backend URL

---

### Option C: Heroku

1. Install Heroku CLI
2. Login: `heroku login`
3. Create app: `heroku create tabaani-backend`
4. Set environment variables:
```bash
heroku config:set MONGODB_URI=your_mongodb_uri
heroku config:set JWT_SECRET=your_secret
heroku config:set NODE_ENV=production
```
5. Deploy: `git push heroku main`

---

## Step 3: Deploy Frontend (React)

### Option A: Vercel (Recommended - Free)

#### 3.1 Update API Configuration

1. **Update client/src/services/api.js** to use production backend URL:
```javascript
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
```

2. **Create .env.production** in client folder:
```
REACT_APP_API_URL=https://your-backend-url.onrender.com
```

#### 3.2 Deploy to Vercel

1. Go to [https://vercel.com](https://vercel.com)
2. Sign up/login with GitHub
3. Click **Add New Project**
4. Import your GitHub repository
5. Configure:
   - **Framework Preset:** Create React App
   - **Root Directory:** `client`
   - **Build Command:** `npm run build`
   - **Output Directory:** `build`

6. **Add Environment Variable:**
   - `REACT_APP_API_URL` = Your backend URL from Step 2

7. Click **Deploy**
8. Wait for deployment (2-3 minutes)
9. Your site will be live at `https://your-project.vercel.app`

---

### Option B: Netlify

1. Go to [https://netlify.com](https://netlify.com)
2. Sign up/login
3. Click **Add new site** → **Import an existing project**
4. Connect GitHub repository
5. Configure:
   - **Base directory:** `client`
   - **Build command:** `npm run build`
   - **Publish directory:** `client/build`

6. Add environment variable:
   - `REACT_APP_API_URL` = Your backend URL

7. Click **Deploy site**

---

## Step 4: Update CORS Settings

Update `server/index.js` to allow your frontend domain:

```javascript
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://your-frontend.vercel.app',
    'https://your-frontend.netlify.app'
  ],
  credentials: true
}));
```

Or for production, use environment variable:
```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
```

---

## Step 5: File Uploads Configuration

For file uploads to work in production:

### Option A: Use Cloud Storage (Recommended)
- **AWS S3** (requires AWS account)
- **Cloudinary** (free tier available)
- **Uploadcare** (free tier available)

### Option B: Use Server Storage (Temporary)
- Files will be stored on the server
- **Note:** Files may be lost if server restarts (Render free tier)
- For production, use cloud storage

---

## Environment Variables Summary

### Backend (.env)
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/tabaani
JWT_SECRET=your_strong_random_secret_here
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://your-frontend.vercel.app
```

### Frontend (.env.production)
```
REACT_APP_API_URL=https://your-backend.onrender.com
```

---

## Post-Deployment Checklist

- [ ] MongoDB Atlas cluster created and configured
- [ ] Database user created with proper permissions
- [ ] Network access configured (IP whitelist)
- [ ] Backend deployed and accessible
- [ ] Frontend deployed and accessible
- [ ] Environment variables set correctly
- [ ] CORS configured for frontend domain
- [ ] Test admin login
- [ ] Test article creation
- [ ] Test file uploads
- [ ] Test search functionality
- [ ] Test section management

---

## Cost Estimate

### Free Tier (Recommended for Start)
- **MongoDB Atlas:** Free (512MB storage)
- **Render Backend:** Free (spins down after inactivity)
- **Vercel Frontend:** Free (unlimited)
- **Total:** $0/month

### Paid Tier (Production)
- **MongoDB Atlas:** $9/month (M10 cluster)
- **Render Backend:** $7/month (always on)
- **Vercel Frontend:** Free or $20/month (Pro)
- **Total:** ~$16-36/month

---

## Troubleshooting

### Backend not connecting to database
- Check MongoDB Atlas network access (IP whitelist)
- Verify connection string has correct password
- Check database user permissions

### Frontend can't reach backend
- Check CORS settings
- Verify REACT_APP_API_URL environment variable
- Check backend is running and accessible

### File uploads not working
- Check uploads folder permissions
- Verify multer configuration
- Consider using cloud storage for production

---

## Support

For deployment issues, check:
- Render documentation: https://render.com/docs
- Vercel documentation: https://vercel.com/docs
- MongoDB Atlas documentation: https://docs.atlas.mongodb.com

---

**Good luck with your deployment! 🚀**















