# Creating .env File and Logo Setup

## Quick Setup

### Option 1: Run Setup Script (Recommended)

**Windows (PowerShell):**
```powershell
.\setup-env.ps1
```

**Linux/Mac:**
```bash
chmod +x setup-env.sh
./setup-env.sh
```

### Option 2: Manual Setup

#### 1. Create .env File

Create a file named `.env` in the `server/` directory with the following content:

```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/tabaani

# JWT Secret Key (Change this in production!)
JWT_SECRET=your_secret_key_here_change_in_production

# Server Port
PORT=5000

# Environment
NODE_ENV=development
```

**For MongoDB Atlas (Cloud):**
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/tabaani
```

#### 2. Copy Logo

Copy the `logo.jpeg` file from the root directory to `client/public/`:

**Windows:**
```cmd
copy logo.jpeg client\public\logo.jpeg
```

**Linux/Mac:**
```bash
cp logo.jpeg client/public/logo.jpeg
```

## Verification

After setup, verify:

1. ✅ `server/.env` file exists
2. ✅ `client/public/logo.jpeg` exists
3. ✅ Logo displays correctly in the application

## Troubleshooting

### Logo Not Displaying

1. Check that `logo.jpeg` exists in `client/public/`
2. Verify the file name is exactly `logo.jpeg` (case-sensitive on Linux/Mac)
3. Clear browser cache and restart the React development server
4. Check browser console for 404 errors

### Database Connection Issues

1. Verify MongoDB is running
2. Check `MONGODB_URI` in `server/.env`
3. For MongoDB Atlas, ensure your IP is whitelisted
4. Check server console for connection errors

