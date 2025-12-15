# Database Initialization Guide

## MongoDB Collections

The application uses the following MongoDB collections:

### 1. **admins**
- Stores admin user accounts
- Fields: `username`, `email`, `password` (hashed), `createdAt`, `updatedAt`
- Index: `email` (unique), `username` (unique)

### 2. **articles**
- Stores article content
- Fields: `title`, `content`, `section`, `images[]`, `video{}`, `published`, `featured`, `order`, `createdAt`, `updatedAt`
- Index: `section`, `published`, `featured`

### 3. **sections**
- Stores section configuration
- Fields: `name`, `title`, `description`, `order`, `visible`, `createdAt`, `updatedAt`
- Default sections: `tourism`, `culture`, `environment`, `autre`
- Index: `name` (unique), `order`

### 4. **websiteconfigs**
- Stores website layout configuration
- Fields: `layout{}`, `preview{}`, `isPreview`, `createdAt`, `updatedAt`
- Index: `isPreview`

## Automatic Initialization

The database is automatically initialized when the server starts. The initialization process:

1. ✅ Connects to MongoDB
2. ✅ Creates default sections (if they don't exist)
3. ✅ Creates default website configuration (if it doesn't exist)
4. ✅ Sets up all required collections

## Manual Initialization

If you need to manually initialize the database:

```bash
cd server
npm run init-db
```

## Database Connection

**Connection String:**
```
mongodb://localhost:27017/tabani
```

**Database Name:** `tabani`

## Default Data

### Default Sections

When initialized, the following sections are created:

1. **Tourism** (`tourism`)
   - Order: 0
   - Visible: true
   - Description: "Tourism articles and travel guides"

2. **Culture** (`culture`)
   - Order: 1
   - Visible: true
   - Description: "Cultural articles and heritage"

3. **Environment** (`environment`)
   - Order: 2
   - Visible: true
   - Description: "Environmental articles and sustainability"

4. **Other** (`autre`)
   - Order: 3
   - Visible: true
   - Description: "Other articles and news"

### Default Website Configuration

- Layout with all 4 sections in default order
- All sections visible by default
- Preview mode: false (active configuration)

## Verification

After starting the server, check the console for:

```
MongoDB Connected: localhost:27017
✓ Default sections created
✓ Default website configuration created
Database initialization completed successfully!
Collections initialized:
  - admins
  - articles
  - sections
  - websiteconfigs
```

## Troubleshooting

### Collections Not Created

If collections are not created automatically:

1. **Check MongoDB is running:**
   ```bash
   # Windows
   net start MongoDB
   
   # Linux/Mac
   sudo systemctl start mongod
   ```

2. **Verify connection string in `.env`:**
   ```
   MONGODB_URI=mongodb://localhost:27017/tabani
   ```

3. **Run manual initialization:**
   ```bash
   cd server
   npm run init-db
   ```

### Reset Database

To reset and reinitialize the database:

```bash
# Connect to MongoDB
mongo

# Switch to database
use tabani

# Drop collections (optional - be careful!)
db.admins.drop()
db.articles.drop()
db.sections.drop()
db.websiteconfigs.drop()

# Exit MongoDB
exit

# Reinitialize
cd server
npm run init-db
```

## Collection Schemas

### Admin Schema
```javascript
{
  username: String (required, unique),
  email: String (required, unique),
  password: String (required, hashed),
  createdAt: Date,
  updatedAt: Date
}
```

### Article Schema
```javascript
{
  title: String (required),
  content: String (required),
  section: String (required, enum: ['tourism', 'culture', 'environment', 'autre']),
  images: [String],
  video: {
    type: String (enum: ['file', 'youtube', 'facebook', null]),
    url: String
  },
  published: Boolean (default: false),
  featured: Boolean (default: false),
  order: Number (default: 0),
  createdAt: Date,
  updatedAt: Date
}
```

### Section Schema
```javascript
{
  name: String (required, unique, enum: ['tourism', 'culture', 'environment', 'autre']),
  title: String (required),
  description: String,
  order: Number (default: 0),
  visible: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

### WebsiteConfig Schema
```javascript
{
  layout: {
    sections: [{
      name: String,
      order: Number,
      visible: Boolean
    }]
  },
  preview: Object (optional),
  isPreview: Boolean (default: false),
  createdAt: Date,
  updatedAt: Date
}
```

