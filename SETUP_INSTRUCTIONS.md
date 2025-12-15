# Setup Instructions - .env and Logo

## ✅ Quick Setup (2 Steps)

### Step 1: Create .env File

**Option A: Copy from template (Easiest)**

Windows:
```cmd
cd server
copy ..\ENV_TEMPLATE.txt .env
```

Linux/Mac:
```bash
cd server
cp ../ENV_TEMPLATE.txt .env
```

**Option B: Manual creation**

Create `server/.env` file with this content:
```env
MONGODB_URI=mongodb://localhost:27017/tabaani
JWT_SECRET=your_secret_key_here_change_in_production
PORT=5000
NODE_ENV=development
```

**Important:** 
- For MongoDB Atlas, replace `MONGODB_URI` with your connection string
- Change `JWT_SECRET` to a secure random string for production

### Step 2: Copy Logo

Copy `logo.jpeg` from root to `client/public/`:

**Windows:**
```cmd
copy logo.jpeg client\public\logo.jpeg
```

**Linux/Mac:**
```bash
cp logo.jpeg client/public/logo.jpeg
```

**Note:** The server also has a fallback to serve the logo from the root directory, but it's recommended to have it in `client/public/` for best performance.

## ✅ Verification

After setup, verify:

1. ✅ File exists: `server/.env`
2. ✅ File exists: `client/public/logo.jpeg`
3. ✅ Start the app: `npm run dev`
4. ✅ Check browser: Logo should display in navbar and home page

## 🔧 Troubleshooting

### Logo Not Showing?

1. **Check file location:** `client/public/logo.jpeg` must exist
2. **Check file name:** Must be exactly `logo.jpeg` (case-sensitive on Linux/Mac)
3. **Clear cache:** 
   - Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)
   - Restart React dev server
4. **Check console:** Look for 404 errors in browser console
5. **Fallback:** The server will try to serve from root directory as backup

### Database Connection Error?

1. **Check MongoDB is running:**
   ```bash
   # Windows
   net start MongoDB
   
   # Check if running
   mongo --version
   ```

2. **Verify .env file:**
   - File is in `server/` directory
   - `MONGODB_URI` is correct
   - No extra spaces or quotes

3. **For MongoDB Atlas:**
   - Check connection string format
   - Ensure IP is whitelisted
   - Verify username/password

## 📝 Files Created

- ✅ `server/.env` - Environment variables (you need to create this)
- ✅ `ENV_TEMPLATE.txt` - Template for .env file
- ✅ `setup-env.ps1` - Windows setup script
- ✅ `setup-env.sh` - Linux/Mac setup script
- ✅ `QUICK_START.md` - Quick reference guide

## 🚀 After Setup

Once both files are in place:

```bash
npm run dev
```

The application will:
- Connect to MongoDB using settings from `.env`
- Display logo from `client/public/logo.jpeg`
- Run on http://localhost:3000 (frontend) and http://localhost:5000 (backend)

