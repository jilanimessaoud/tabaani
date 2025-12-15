# Database Setup Complete ✅

## MongoDB Configuration

**Database URL:** `mongodb://localhost:27017/tabani`  
**Database Name:** `tabani`  
**JWT Secret:** `tabaaniculture&historique2025@tabani`

## Collections Created

The following MongoDB collections are automatically created and initialized:

### 1. **admins**
- Stores admin user accounts
- Created when first admin registers
- Fields: username, email, password (hashed), timestamps

### 2. **articles**
- Stores article content
- Created when first article is added
- Fields: title, content, section, images, video, published, featured, order, timestamps

### 3. **sections** ✅ Auto-initialized
- Stores section configuration
- **Default sections created automatically:**
  - Tourism (order: 0)
  - Culture (order: 1)
  - Environment (order: 2)
  - Other/Autre (order: 3)

### 4. **websiteconfigs** ✅ Auto-initialized
- Stores website layout configuration
- Default configuration created automatically with all 4 sections

## Automatic Initialization

When the server starts, it automatically:

1. ✅ Connects to MongoDB database `tabani`
2. ✅ Creates default sections (if they don't exist)
3. ✅ Creates default website configuration (if it doesn't exist)
4. ✅ Sets up all required collections

## Manual Initialization

To manually initialize the database:

```bash
# From root directory
npm run init-db

# Or from server directory
cd server
npm run init-db
```

## Verification

After starting the server, you should see:

```
✓ MongoDB Connected: localhost:27017
✓ Database: tabani
✓ Default sections created
✓ Default website configuration created
✓ Database initialization completed successfully!
✓ Collections ready:
    - admins
    - articles
    - sections
    - websiteconfigs
Server running on port 5000
```

## Environment Variables

The `.env` file in `server/` directory contains:

```env
MONGODB_URI=mongodb://localhost:27017/tabani
JWT_SECRET=tabaaniculture&historique2025@tabani
PORT=5000
NODE_ENV=development
```

## Next Steps

1. ✅ Database is configured and ready
2. ✅ Collections will be created automatically
3. ✅ Default sections are initialized
4. Start the server: `npm run dev`
5. Register your first admin account at `/admin/login`

## Troubleshooting

### MongoDB Not Connecting

1. **Check MongoDB is running:**
   ```bash
   # Windows
   net start MongoDB
   
   # Check status
   mongo --version
   ```

2. **Verify connection string:**
   - Check `server/.env` file
   - Ensure MongoDB is running on port 27017
   - Database name should be `tabani`

### Collections Not Created

If collections are not created automatically:

1. Check server console for errors
2. Run manual initialization: `npm run init-db`
3. Verify MongoDB connection in `.env` file

### Reset Database

To reset and reinitialize:

```bash
# Connect to MongoDB
mongo

# Switch to database
use tabani

# Drop collections (be careful!)
db.sections.drop()
db.websiteconfigs.drop()

# Exit
exit

# Reinitialize
npm run init-db
```

## Database Schema Summary

- **admins**: User authentication
- **articles**: Content management
- **sections**: Section configuration (4 default sections)
- **websiteconfigs**: Website layout settings

All collections are ready to use! 🎉

