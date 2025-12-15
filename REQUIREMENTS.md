# Requirements Documentation

## System Requirements

### Minimum Requirements
- **Node.js**: Version 14.0.0 or higher
- **npm**: Version 6.0.0 or higher (comes with Node.js)
- **MongoDB**: Version 4.0.0 or higher
- **Operating System**: Windows 10+, macOS 10.14+, or Linux (Ubuntu 18.04+)

### Recommended Requirements
- **Node.js**: Version 18.0.0 or higher (LTS)
- **npm**: Version 9.0.0 or higher
- **MongoDB**: Version 6.0.0 or higher
- **RAM**: 4GB minimum, 8GB recommended
- **Disk Space**: 500MB for application + space for uploaded files

## Backend Dependencies (Server)

### Core Dependencies
| Package | Version | Purpose |
|---------|---------|---------|
| express | ^4.18.2 | Web framework for Node.js |
| mongoose | ^8.0.3 | MongoDB object modeling |
| cors | ^2.8.5 | Cross-Origin Resource Sharing |
| dotenv | ^16.3.1 | Environment variable management |
| bcryptjs | ^2.4.3 | Password hashing |
| jsonwebtoken | ^9.0.2 | JWT authentication |
| multer | ^1.4.5-lts.1 | File upload handling |
| express-validator | ^7.0.1 | Input validation |

### Development Dependencies
| Package | Version | Purpose |
|---------|---------|---------|
| nodemon | ^3.0.2 | Auto-restart server on changes |

## Frontend Dependencies (Client)

### Core Dependencies
| Package | Version | Purpose |
|---------|---------|---------|
| react | ^18.2.0 | UI library |
| react-dom | ^18.2.0 | React DOM renderer |
| react-router-dom | ^6.20.1 | Client-side routing |
| react-scripts | ^5.0.1 | Create React App scripts |
| axios | ^1.6.2 | HTTP client |
| bootstrap | ^5.3.2 | CSS framework |
| react-bootstrap | ^2.9.1 | Bootstrap components for React |
| react-dnd | ^16.0.1 | Drag and drop functionality |
| react-dnd-html5-backend | ^16.0.1 | HTML5 drag and drop backend |
| react-icons | ^4.12.0 | Icon library |
| date-fns | ^2.30.0 | Date formatting utilities |

## Root Dependencies (Development Tools)

| Package | Version | Purpose |
|---------|---------|---------|
| concurrently | ^8.2.2 | Run multiple commands simultaneously |
| nodemon | ^3.0.2 | Auto-restart server on changes |

## Environment Variables Required

Create a `.env` file in the `server/` directory with:

```env
MONGODB_URI=mongodb://localhost:27017/tabaani
JWT_SECRET=your_secret_key_here_change_in_production
PORT=5000
```

### MongoDB Connection Options

**Local MongoDB:**
```
MONGODB_URI=mongodb://localhost:27017/tabaani
```

**MongoDB Atlas (Cloud):**
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/tabaani
```

**MongoDB with Authentication:**
```
MONGODB_URI=mongodb://username:password@localhost:27017/tabaani?authSource=admin
```

## Browser Support

### Supported Browsers
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

### Minimum Browser Versions
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Installation Commands

### Install All Dependencies
```bash
# Install root dependencies
npm install

# Install server dependencies
cd server && npm install && cd ..

# Install client dependencies
cd client && npm install && cd ..
```

Or use the convenience script:
```bash
npm run install-all
```

## Port Requirements

- **Backend Server**: Port 5000 (default, configurable via `.env`)
- **Frontend Development Server**: Port 3000 (default)
- **MongoDB**: Port 27017 (default)

Make sure these ports are available on your system.

## File Upload Requirements

- **Maximum File Size**: 50MB per file
- **Allowed Image Types**: JPEG, JPG, PNG, GIF
- **Allowed Video Types**: MP4, MOV, AVI
- **Storage Location**: `server/uploads/` (created automatically)

## Security Requirements

- **JWT Secret**: Must be a strong, random string in production
- **Password Minimum Length**: 6 characters
- **HTTPS**: Recommended for production deployment
- **CORS**: Configured for development (adjust for production)

## Database Requirements

### MongoDB Collections
The application automatically creates the following collections:
- `admins` - Admin user accounts
- `articles` - Article content
- `sections` - Section configuration
- `websiteconfigs` - Website layout configuration

### Initial Data
- Default sections are created automatically on first run
- Admin account must be created through the registration interface

## Production Deployment Requirements

### Additional Requirements for Production
- **Reverse Proxy**: Nginx or Apache (recommended)
- **Process Manager**: PM2 or similar
- **SSL Certificate**: For HTTPS
- **Backup Strategy**: For MongoDB database
- **Monitoring**: Application monitoring tools
- **Logging**: Centralized logging solution

### Environment-Specific Variables
```env
NODE_ENV=production
MONGODB_URI=your_production_mongodb_uri
JWT_SECRET=your_strong_production_secret
PORT=5000
```

## Version Compatibility

### Node.js Compatibility
- **Minimum**: Node.js 14.x
- **Recommended**: Node.js 18.x LTS
- **Tested**: Node.js 18.x, 20.x

### MongoDB Compatibility
- **Minimum**: MongoDB 4.0
- **Recommended**: MongoDB 6.0+
- **Mongoose**: Compatible with MongoDB 4.0+

## Notes

- All version numbers use semantic versioning (^ allows minor and patch updates)
- Dependencies are locked in `package-lock.json` files
- For production, consider using exact versions instead of ranges
- Regular security updates recommended for all dependencies

