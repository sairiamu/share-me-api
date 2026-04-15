# Share-Me API

A modern Node.js/Express API for sharing and managing notes with secure authentication and file uploads.

## Features

✅ User Authentication (JWT)
✅ Password Hashing (bcrypt)
✅ Notes Management (CRUD operations)
✅ File Uploads to Cloudinary
✅ Input Validation (Zod schemas)
✅ Error Handling & Logging
✅ Security Headers (Helmet)
✅ Rate Limiting
✅ CORS Support
✅ Request Logging (Morgan)

## Prerequisites

- Node.js (v14 or higher)
- MySQL database
- npm or yarn
- Cloudinary account (for file uploads)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd API
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```
   MYSQL_HOST=localhost
   MYSQL_USER=root
   MYSQL_PASSWORD=your_password
   MYSQL_DATABASE=share_me
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   PORT=3000
   JWT_SECRET=your_secure_secret
   ```

4. **Create MySQL database and tables**
   ```sql
   CREATE DATABASE share_me;
   
   USE share_me;
   
   CREATE TABLE users (
       id INT AUTO_INCREMENT PRIMARY KEY,
       email VARCHAR(255) NOT NULL UNIQUE,
       name VARCHAR(100) NOT NULL,
       password VARCHAR(255) NOT NULL,
       phone VARCHAR(20),
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
   );
   
   CREATE TABLE notes (
       id INT AUTO_INCREMENT PRIMARY KEY,
       title VARCHAR(255) NOT NULL,
       file_url VARCHAR(500),
       file_type VARCHAR(50),
       uploaded_by INT NOT NULL,
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
       FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE
   );
   ```

5. **Start the server**
   ```bash
   npm start
   ```

   Server will run at `http://localhost:3000` (or your configured PORT)

## API Endpoints

### Health Check
```
GET /health
```

### Authentication
```
POST /api/auth/signup
POST /api/auth/signin
```

### Notes (🔒 = Protected)
```
GET    /api/notes              - Get all notes
POST   /api/notes    🔒        - Upload a new note
GET    /api/notes/:id 🔒       - Get note details
DELETE /api/notes/delete-notes/:id 🔒 - Delete a note
```

### Profile (🔒 = Protected)
```
GET    /api/profile 🔒         - Get user profile
PUT    /api/profile 🔒         - Update user profile
DELETE /api/profile/delete/:id 🔒 - Delete account
```

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. 

**To access protected routes:**
1. Sign up or sign in to get a token
2. Include the token in the Authorization header:
   ```
   Authorization: Bearer <your_jwt_token>
   ```

## Error Handling

All error responses follow this format:
```json
{
  "success": false,
  "message": "Error description",
  "errors": []
}
```

## Logging

Logs are stored in the `logs/` directory:
- `error.log` - Error logs only
- `combined.log` - All logs

Console output also displays formatted logs with color coding.

## Security Features

- **Helmet** - Sets secure HTTP headers
- **CORS** - Controlled cross-origin requests
- **Rate Limiting** - Prevents brute force attacks
- **Password Hashing** - Bcrypt for secure password storage
- **JWT** - Secure token-based authentication
- **Input Validation** - Zod schemas for all inputs
- **Error Handling** - Comprehensive error middleware

## Development

### Project Structure
```
├── auth/              # Authentication utilities
├── bot/               # Bot/AI features
├── config/            # Configuration files
├── controller/        # Route controllers/handlers
├── data/              # Data layer utilities
├── middleware/        # Express middleware
├── routes/            # API route definitions
├── schema/            # Zod validation schemas
├── services/          # Business logic services
├── utils/             # Utility functions
├── index.js           # Application entry point
└── package.json       # Project dependencies
```

### TODO Items
- [ ] Password reset functionality
- [ ] Email verification
- [ ] Refresh token mechanism
- [ ] API documentation (Swagger)
- [ ] Unit tests
- [ ] Integration tests
- [ ] Complete profile endpoints
- [ ] Database migrations system

## License

MIT

## Author

sairiamu
