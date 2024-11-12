# 🎬 Movie Recommendation System Backend

A robust backend system for a movie recommendation platform built with Express.js and MongoDB. The system provides comprehensive movie management, user interactions, and intelligent recommendation features.

[![Node.js](https://img.shields.io/badge/Node.js-v18+-green.svg)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-v4.18+-blue.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-v5+-green.svg)](https://www.mongodb.com/)
[![Swagger](https://img.shields.io/badge/Swagger-API_Docs-85EA2D.svg)](https://swagger.io/)

## 🌟 Features

### 🔐 Authentication & User Management
- JWT-based authentication
- Google OAuth 2.0 integration
- Role-based access control (User, Admin, Moderator)
- Profile management with movie preferences
- Wishlist functionality

### 🎥 Movie Management
- Comprehensive movie database (title, genre, cast, etc.)
- Detailed actor and director profiles
- Trivia and goofs sections
- Soundtrack information
- Age ratings and parental guidance
- Box office information
- Awards tracking

### ⭐ Ratings & Reviews
- 5-star rating system
- Detailed review system
- Review moderation
- Review highlights
- Like/dislike functionality

### 🎯 Recommendations
- Personalized movie suggestions
- Similar movies feature
- Trending movies section
- Genre-based recommendations
- User activity-based suggestions

### 📋 Lists & Collections
- Custom user movie lists
- Shareable collections
- Following other users' lists
- Watchlist functionality

### 🔍 Search & Filters
- Advanced search capabilities
- Multiple filtering options
- Genre-based browsing
- Release year filtering
- Language and country filters

### 📊 Admin Dashboard
- User management
- Content moderation
- Analytics and insights
- Trending data
- User engagement metrics

## 🏗 Architecture

### Project Structure
```plaintext
src/
├── models/
├── controllers/
├── services/
├── scripts/
├── config/
├── middleware/
├── models/
├── utils/
├── validations/
└── app.js
```

### Design Patterns
- MVC Architecture
- Repository Pattern
- Middleware Pattern
- Factory Pattern

## 🛠 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: 
  - JWT
  - Google OAuth 2.0
- **Documentation**: Swagger/OpenAPI 3.0
- **Email**: Nodemailer with Gmail
- **Validation**: Joi
- **Logging**: Winston
- **Testing**: Jest
- **Other Tools**:
  - Morgan (HTTP logging)
  - Cors
  - Helmet (Security)
  - Express Rate Limit

## 📝 Prerequisites

- Node.js (v18 or higher)
- MongoDB (v5 or higher)
- Gmail account for email services
- Google Cloud Console project for OAuth

## ⚙️ Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/movie-recommendation

# JWT Configuration
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

# Google OAuth
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback

# Gmail Configuration
GMAIL_EMAIL=your-email@gmail.com
GMAIL_APP_PASSWORD=your_app_password
GMAIL_CLIENT_ID=your_oauth_client_id
GMAIL_CLIENT_SECRET=your_oauth_client_secret
GMAIL_REFRESH_TOKEN=your_refresh_token
GMAIL_REDIRECT_URI=https://developers.google.com/oauthplayground

# App Configuration
APP_NAME=Movie Recommendation System
```

## 🚀 Installation & Setup

1. Clone the repository:
```bash
git clone https://github.com/your-username/movie-recommendation-system.git
cd movie-recommendation-system
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configurations
```

4. Run database migrations:
```bash
npm run migrate
```

5. Start the server:
```bash
# Development
npm run dev

# Production
npm start
```

## 📚 API Documentation

API documentation is available through Swagger UI at `/api-docs` when the server is running.

Key API endpoints:

```plaintext
Auth:
- POST /api/v1/auth/register
- POST /api/v1/auth/login
- GET /api/v1/auth/google
- GET /api/v1/auth/google/callback

Movies:
- GET /api/v1/movies
- POST /api/v1/movies (Admin)
- GET /api/v1/movies/:id
- PUT /api/v1/movies/:id (Admin)
- DELETE /api/v1/movies/:id (Admin)

Reviews:
- GET /api/v1/movies/:movieId/reviews
- POST /api/v1/movies/:movieId/reviews
- PUT /api/v1/movies/:movieId/reviews
- DELETE /api/v1/movies/:movieId/reviews

Admin:
- GET /api/v1/admin/statistics
- GET /api/v1/admin/moderation
- PATCH /api/v1/admin/moderation/review/:reviewId
```

## 🔒 Security

- JWT Authentication
- Role-based access control
- Request rate limiting
- Input validation
- XSS protection
- CORS configuration
- Helmet security headers

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- tests/auth.test.js
```

## 📈 Monitoring

The application includes:
- Winston logging
- Morgan HTTP request logging
- Error tracking
- Performance monitoring

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## 🔗 Links

- [GitHub Repository](https://github.com/Ninjaa-aa/movie-recommendation-system)
- [API Documentation](http://localhost:3000/api-docs)
- [Issue Tracker](https://github.com/Ninjaa-aa/movie-recommendation-system)

## 👥 Authors

- Your Name - Initial work - [YourGitHub](https://github.com/your-username)

## 🙏 Acknowledgments

- Hat tip to anyone whose code was used
- Inspired by various movie platforms
- Thanks to all contributors