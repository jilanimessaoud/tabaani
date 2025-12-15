# Tabaani - Journalist Application

A modern journalist application with admin panel for managing articles across 4 sections: Tourism, Culture, Environment, and Other.

## Features

- 📰 4 Principal Sections: Tourism, Culture, Environment, and Other
- 🎨 Admin Panel with Drag & Drop website configuration
- 👁️ Preview functionality before publishing changes
- 📝 Article Management with rich content (images, videos from files, YouTube, or Facebook)
- 🔐 Secure Admin Authentication
- 📱 Fully Responsive Design (Bootstrap)
- 🎯 Special admin routes (not visible to visitors)

## Tech Stack

- **Frontend**: React, Bootstrap
- **Backend**: Node.js, Express
- **Database**: MongoDB
- **Authentication**: JWT

## Requirements

See [REQUIREMENTS.md](./REQUIREMENTS.md) for detailed system requirements and dependencies, or [requirements.txt](./requirements.txt) for a quick reference of all packages.

## Installation

1. Install root dependencies:
```bash
npm install
```

2. Install server dependencies:
```bash
npm run install-server
```

3. Install client dependencies:
```bash
npm run install-client
```

4. Create `.env` file in `server/` directory:
```
MONGODB_URI=mongodb://localhost:27017/tabaani
JWT_SECRET=your_secret_key_here_change_in_production
PORT=5000
```

5. Start the development server:
```bash
npm run dev
```

The server will run on `http://localhost:5000` and the client on `http://localhost:3000`.

## Default Admin Account

After starting the server, register your first admin account through the admin panel at `/admin/login`.

## Project Structure

```
├── server/
│   ├── config/          # Configuration files (database, upload)
│   ├── controllers/     # MVC Controllers
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   ├── middleware/      # Auth middleware
│   ├── uploads/         # Uploaded files
│   ├── .env            # Environment variables (create from .env.example)
│   └── index.js        # Server entry point
├── client/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── services/   # API services
│   │   └── App.js       # Main app component
│   └── public/          # Static files (logo.jpeg should be here)
├── logo.jpeg           # Application logo (copy to client/public/)
└── package.json
```

## Architecture

The application follows the **MVC (Model-View-Controller)** pattern:

- **Models**: MongoDB schemas in `server/models/`
- **Views**: React components in `client/src/`
- **Controllers**: Business logic in `server/controllers/`
- **Routes**: API endpoints in `server/routes/` (thin layer connecting to controllers)

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register admin
- `POST /api/auth/login` - Login admin
- `GET /api/auth/me` - Get current admin

### Articles
- `GET /api/articles/public` - Get published articles (public)
- `GET /api/articles` - Get all articles (admin)
- `POST /api/articles` - Create article (admin)
- `PUT /api/articles/:id` - Update article (admin)
- `DELETE /api/articles/:id` - Delete article (admin)

### Sections
- `GET /api/sections/public` - Get visible sections (public)
- `GET /api/sections` - Get all sections (admin)
- `PUT /api/sections/:id` - Update section (admin)

### Config
- `GET /api/config/public` - Get active config (public)
- `GET /api/config` - Get config with preview (admin)
- `POST /api/config/preview` - Save preview config (admin)
- `POST /api/config/publish` - Publish preview config (admin)

## License

ISC

