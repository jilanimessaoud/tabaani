# Quick Start Guide

## Step 1: Create .env File

Copy the content from `ENV_TEMPLATE.txt` and create a file named `.env` in the `server/` directory.

**Windows:**
```cmd
cd server
copy ..\ENV_TEMPLATE.txt .env
```

**Linux/Mac:**
```bash
cd server
cp ../ENV_TEMPLATE.txt .env
```

Or manually create `server/.env` with:
```env
MONGODB_URI=mongodb://localhost:27017/tabaani
JWT_SECRET=your_secret_key_here_change_in_production
PORT=5000
NODE_ENV=development
```

## Step 2: Copy Logo

Copy `logo.jpeg` from the root directory to `client/public/`:

**Windows:**
```cmd
copy logo.jpeg client\public\logo.jpeg
```

**Linux/Mac:**
```bash
cp logo.jpeg client/public/logo.jpeg
```

**Note:** If the logo is not in the root directory, you can also place it in `client/public/logo.jpeg` manually.

## Step 3: Install Dependencies

```bash
npm install
npm run install-all
```

## Step 4: Start the Application

```bash
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## Troubleshooting Logo Display

If the logo doesn't display:

1. **Check file location:** Ensure `logo.jpeg` exists in `client/public/`
2. **Check file name:** Must be exactly `logo.jpeg` (case-sensitive)
3. **Clear cache:** Clear browser cache and restart React dev server
4. **Alternative:** The server will also serve the logo from the root directory at `/logo.jpeg` as a fallback

## Troubleshooting Database

If you get MongoDB connection errors:

1. **Check MongoDB is running:**
   ```bash
   # Windows
   net start MongoDB
   
   # Linux/Mac
   sudo systemctl start mongod
   ```

2. **Check .env file:** Verify `MONGODB_URI` is correct
3. **For MongoDB Atlas:** Ensure your IP is whitelisted

