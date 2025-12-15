# Setup Instructions

## Prerequisites
- Node.js (v14 or higher)
- MongoDB (running locally or MongoDB Atlas connection string)
- npm or yarn

## Installation Steps

### 1. Install Dependencies

From the root directory:
```bash
npm install
```

Then install server dependencies:
```bash
cd server
npm install
cd ..
```

Then install client dependencies:
```bash
cd client
npm install
cd ..
```

Or use the convenience script:
```bash
npm run install-all
```

### 2. Configure Environment Variables

Copy the `.env.example` file to `.env` in the `server/` directory:
```bash
cd server
copy .env.example .env
```

Or create a `.env` file manually with:
```
MONGODB_URI=mongodb://localhost:27017/tabaani
JWT_SECRET=your_secret_key_here_change_in_production
PORT=5000
NODE_ENV=development
```

For MongoDB Atlas, use:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/tabaani
```

**Note**: The `.env` file is used to initialize the database connection automatically when the server starts.

### 3. Setup Logo

Copy the logo file to the client public folder:
```bash
copy logo.jpeg client\public\logo.jpeg
```

Or manually copy `logo.jpeg` from the root directory to `client/public/logo.jpeg`.

### 4. Start MongoDB

Make sure MongoDB is running on your system:
- **Windows**: Start MongoDB service or run `mongod`
- **macOS**: `brew services start mongodb-community` or `mongod`
- **Linux**: `sudo systemctl start mongod` or `mongod`

### 5. Start the Application

From the root directory, run:
```bash
npm run dev
```

This will start:
- Backend server on `http://localhost:5000`
- Frontend React app on `http://localhost:3000`

Or start them separately:
```bash
# Terminal 1 - Backend
npm run server

# Terminal 2 - Frontend
npm run client
```

### 6. Create Admin Account

1. Navigate to `http://localhost:3000/admin/login`
2. Click on the "Register" tab
3. Fill in:
   - Username
   - Email
   - Password (minimum 6 characters)
4. Click "Register"

### 7. Access the Application

- **Public Website**: `http://localhost:3000`
- **Admin Panel**: `http://localhost:3000/admin`
- **Admin Login**: `http://localhost:3000/admin/login`

## Features

### Public Features
- View articles by section (Tourism, Culture, Environment, Other)
- Read full article details
- Responsive design for mobile and desktop

### Admin Features
- **Dashboard**: View statistics and quick actions
- **Article Management**: Create, edit, delete articles with:
  - Images (multiple uploads)
  - Videos (file upload, YouTube link, or Facebook link)
  - Rich text content
  - Publishing status
  - Featured articles
  - Section assignment
- **Website Configuration**: 
  - Drag and drop to reorder sections
  - Toggle section visibility
  - Preview changes before publishing
- **Preview Mode**: See exactly how visitors will see the website

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running
- Check your `MONGODB_URI` in `.env`
- For MongoDB Atlas, ensure your IP is whitelisted

### Port Already in Use
- Change `PORT` in `server/.env`
- Or kill the process using the port

### CORS Issues
- Ensure backend is running on port 5000
- Check `proxy` setting in `client/package.json`

### Image/Video Upload Issues
- Ensure `server/uploads/` directory exists
- Check file size limits (default: 50MB)
- Verify file types are allowed

## Production Deployment

1. Build the React app:
```bash
cd client
npm run build
```

2. Serve the build folder with your backend or a static server

3. Update environment variables for production

4. Use a production MongoDB instance

5. Set secure JWT_SECRET

6. Configure proper CORS settings

