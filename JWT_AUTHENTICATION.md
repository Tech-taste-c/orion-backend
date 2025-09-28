# JWT Authentication Implementation

This document explains the JWT authentication system implemented for the Orion backend.

## Overview

The application now supports JWT-based authentication for both students and admins. When users log in, they receive a JWT token that must be included in subsequent requests to protected endpoints.

## Authentication Endpoints

### Student Authentication
- **POST** `/students/login` - Student login (now returns JWT token)

### Admin Authentication  
- **POST** `/admins/signin` - Admin login (now returns JWT token)

## JWT Token Usage

### Login Response Format
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "firstName": "John",
    "lastName": "Doe", 
    "email": "john@example.com",
    "phone": "1234567890",
    "type": "student" // or "admin"
  }
}
```

### Using the Token
Include the JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Protected Routes

The following routes now require JWT authentication:

### Student Routes
- `GET /students` - Get all students
- `GET /students/:id/courses` - Get student's enrolled courses
- `PATCH /students/:id/status` - Update student status
- `GET /students/:id/dashboard` - Student dashboard stats

### Admin Routes
- `GET /admins/dashboard` - Admin dashboard stats

## JWT Configuration

- **Secret**: Set via `JWT_SECRET` environment variable (defaults to 'your-secret-key')
- **Expiration**: 24 hours
- **Algorithm**: HS256

## Security Features

1. **Password Hashing**: All passwords are hashed using bcrypt
2. **Token Validation**: JWT tokens are validated on each request
3. **User Type Validation**: Tokens include user type (student/admin) for authorization
4. **Expiration**: Tokens expire after 24 hours

## Environment Variables

Add to your `.env` file:
```
JWT_SECRET=your-super-secret-jwt-key-here
```

## Example Usage

### 1. Student Login
```bash
curl -X POST http://localhost:3000/students/login \
  -H "Content-Type: application/json" \
  -d '{"email": "student@example.com", "password": "password123"}'
```

### 2. Admin Login
```bash
curl -X POST http://localhost:3000/admins/signin \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "password123"}'
```

### 3. Access Protected Route
```bash
curl -X GET http://localhost:3000/students/1/courses \
  -H "Authorization: Bearer <your-jwt-token>"
```

## Migration Notes

- Existing login endpoints (`/students/login`, `/admins/signin`) now return JWT tokens along with user data
- Protected routes now require JWT authentication
- All password validation and user lookup logic remains the same
- No breaking changes to existing API contracts
