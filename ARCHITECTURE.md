# Architecture Documentation

## Overview

The Tabaani Journalist Application follows the **MVC (Model-View-Controller)** architectural pattern, providing a clean separation of concerns and maintainable codebase.

## Architecture Pattern: MVC

### Model-View-Controller Structure

```
┌─────────────┐
│   Client    │  (View Layer)
│   React     │
└──────┬──────┘
       │ HTTP Requests
       ▼
┌─────────────────────────────────────┐
│         Express Server              │
│  ┌──────────────────────────────┐  │
│  │      Routes Layer            │  │  (Routing)
│  │  - auth.js                   │  │
│  │  - articles.js               │  │
│  │  - sections.js               │  │
│  │  - config.js                 │  │
│  │  - admin.js                  │  │
│  └───────────┬──────────────────┘  │
│              │                      │
│              ▼                      │
│  ┌──────────────────────────────┐  │
│  │    Controllers Layer         │  │  (Business Logic)
│  │  - authController.js         │  │
│  │  - articleController.js      │  │
│  │  - sectionController.js      │  │
│  │  - configController.js        │  │
│  │  - adminController.js         │  │
│  └───────────┬──────────────────┘  │
│              │                      │
│              ▼                      │
│  ┌──────────────────────────────┐  │
│  │      Models Layer           │  │  (Data Layer)
│  │  - Admin.js                  │  │
│  │  - Article.js                │  │
│  │  - Section.js                │  │
│  │  - WebsiteConfig.js          │  │
│  └───────────┬──────────────────┘  │
└──────────────┼──────────────────────┘
               │
               ▼
        ┌──────────────┐
        │   MongoDB    │
        └──────────────┘
```

## Directory Structure

### Backend (Server)

```
server/
├── config/              # Configuration files
│   ├── database.js     # MongoDB connection
│   └── upload.js       # Multer file upload config
├── controllers/        # Business logic (Controller Layer)
│   ├── authController.js
│   ├── articleController.js
│   ├── sectionController.js
│   ├── configController.js
│   └── adminController.js
├── models/             # Data models (Model Layer)
│   ├── Admin.js
│   ├── Article.js
│   ├── Section.js
│   └── WebsiteConfig.js
├── routes/              # API routes (Routing Layer)
│   ├── auth.js
│   ├── articles.js
│   ├── sections.js
│   ├── config.js
│   └── admin.js
├── middleware/          # Custom middleware
│   └── auth.js          # JWT authentication
├── uploads/             # Uploaded files storage
├── .env                 # Environment variables
└── index.js             # Application entry point
```

### Frontend (Client)

```
client/
├── public/              # Static assets
│   ├── logo.jpeg       # Application logo
│   └── index.html
├── src/
│   ├── components/     # Reusable React components
│   │   ├── Navbar.js
│   │   ├── ArticleCard.js
│   │   └── PrivateRoute.js
│   ├── pages/          # Page components (View Layer)
│   │   ├── Home.js
│   │   ├── SectionPage.js
│   │   ├── ArticleDetail.js
│   │   └── admin/
│   │       ├── AdminLogin.js
│   │       ├── AdminDashboard.js
│   │       ├── AdminArticles.js
│   │       ├── AdminConfig.js
│   │       └── AdminPreview.js
│   ├── context/        # React Context
│   │   └── AuthContext.js
│   ├── services/       # API service layer
│   │   └── api.js
│   ├── App.js           # Main application component
│   └── index.js         # React entry point
└── package.json
```

## Layer Responsibilities

### 1. Model Layer (`server/models/`)

**Responsibility**: Define data structure and database schemas

- Mongoose schemas for MongoDB collections
- Data validation rules
- Model methods (e.g., password hashing in Admin model)
- Database relationships

**Example**:
```javascript
// models/Article.js
const articleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  // ...
});
```

### 2. Controller Layer (`server/controllers/`)

**Responsibility**: Handle business logic and request processing

- Process incoming requests
- Validate data
- Interact with models
- Format responses
- Error handling

**Example**:
```javascript
// controllers/articleController.js
exports.getAllArticles = async (req, res) => {
  try {
    const articles = await Article.find();
    res.json(articles);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
```

### 3. Route Layer (`server/routes/`)

**Responsibility**: Define API endpoints and connect to controllers

- Define HTTP routes
- Apply middleware (authentication, validation)
- Map routes to controller methods
- Keep routes thin (delegate to controllers)

**Example**:
```javascript
// routes/articles.js
router.get('/', auth, articleController.getAllArticles);
router.post('/', auth, upload.array('images'), articleController.createArticle);
```

### 4. View Layer (`client/src/`)

**Responsibility**: User interface and user interactions

- React components for UI
- User input handling
- API calls through service layer
- State management

**Example**:
```javascript
// pages/Home.js
const Home = () => {
  const [articles, setArticles] = useState([]);
  // Fetch data and render UI
};
```

## Data Flow

### Request Flow (Client → Server)

1. **User Action** → React component
2. **API Call** → `services/api.js`
3. **HTTP Request** → Express server
4. **Route Handler** → `routes/*.js`
5. **Middleware** → Authentication, validation
6. **Controller** → `controllers/*.js`
7. **Model** → Database operation
8. **Response** → Back to client

### Example: Creating an Article

```
User fills form
    ↓
AdminArticles.js (View)
    ↓
api.post('/api/articles', formData) (Service)
    ↓
POST /api/articles (Route)
    ↓
auth middleware (Authentication)
    ↓
upload middleware (File handling)
    ↓
articleController.createArticle (Controller)
    ↓
Article.create() (Model)
    ↓
MongoDB save
    ↓
Response → Client
```

## Key Design Patterns

### 1. Separation of Concerns
- Models: Data structure
- Controllers: Business logic
- Routes: Endpoint definitions
- Views: User interface

### 2. Middleware Pattern
- Authentication middleware
- File upload middleware
- Error handling middleware

### 3. Service Layer (Frontend)
- Centralized API calls
- Request/response handling
- Token management

### 4. Context Pattern (React)
- Global state management
- Authentication state
- User session

## Configuration Management

### Environment Variables (`server/.env`)
- Database connection
- JWT secret
- Server port
- Environment mode

### Configuration Files (`server/config/`)
- Database connection setup
- File upload configuration
- Reusable configurations

## Security Architecture

1. **Authentication**: JWT tokens
2. **Authorization**: Middleware-based route protection
3. **Validation**: Express-validator for input validation
4. **File Upload**: Multer with type and size restrictions
5. **Password Security**: bcryptjs hashing

## Benefits of MVC Architecture

1. **Maintainability**: Clear separation makes code easier to maintain
2. **Scalability**: Easy to add new features
3. **Testability**: Each layer can be tested independently
4. **Reusability**: Controllers and models can be reused
5. **Team Collaboration**: Different developers can work on different layers

## Future Enhancements

- Add service layer between controllers and models
- Implement repository pattern for data access
- Add validation layer
- Implement error handling middleware
- Add logging and monitoring

