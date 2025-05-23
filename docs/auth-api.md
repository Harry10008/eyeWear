# EyeWear Authentication API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication Endpoints

### 1. Register User
Register a new user account.

**Endpoint:** `POST /auth/register`

**Request Body:**
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "Password123!",
  "confirmPassword": "Password123!",
  "mobileNumber": "1234567890",
  "dateOfBirth": "1990-01-01",
  "gender": "male",
  "addresses": [
    {
      "street": "123 Main St",
      "city": "New York",
      "state": "NY",
      "country": "USA",
      "pincode": "123456",
      "isDefault": true
    }
  ]
}
```

**Validation Rules:**
- `fullName`: 2-50 characters
- `email`: Valid email format
- `password`: Minimum 8 characters, must contain uppercase, lowercase, number, and special character
- `mobileNumber`: 10 digits
- `dateOfBirth`: Valid date format (YYYY-MM-DD)
- `gender`: One of ["male", "female", "other"]
- `addresses`: At least one address required
  - `pincode`: 6 digits

**Success Response (201):**
```json
{
  "id": "60d21b4667d0d8992e610c85",
  "fullName": "John Doe",
  "email": "john@example.com",
  "role": "user",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "isEmailVerified": false,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Error Response (400):**
```json
{
  "status": "error",
  "message": "Email already in use"
}
```

### 2. Login User
Authenticate user with email and password.

**Endpoint:** `POST /auth/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "Password123!"
}
```

**Success Response (200):**
```json
{
  "id": "60d21b4667d0d8992e610c85",
  "fullName": "John Doe",
  "email": "john@example.com",
  "role": "user",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "isEmailVerified": true,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Error Response (401):**
```json
{
  "status": "error",
  "message": "Invalid email or password"
}
```

### 3. Forgot Password
Request password reset instructions.

**Endpoint:** `POST /auth/forgot-password`

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Success Response (200):**
```json
{
  "message": "Password reset instructions sent to email"
}
```

**Error Response (404):**
```json
{
  "status": "error",
  "message": "User not found"
}
```

### 4. Reset Password
Reset password using token.

**Endpoint:** `POST /auth/reset-password`

**Request Body:**
```json
{
  "token": "reset-token-from-email",
  "password": "NewPassword123!",
  "confirmPassword": "NewPassword123!"
}
```

**Success Response (200):**
```json
{
  "message": "Password reset successful"
}
```

**Error Response (400):**
```json
{
  "status": "error",
  "message": "Invalid or expired token"
}
```

### 5. Update Password
Update user's password (requires authentication).

**Endpoint:** `PATCH /auth/update-password`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "currentPassword": "CurrentPassword123!",
  "newPassword": "NewPassword123!",
  "confirmPassword": "NewPassword123!"
}
```

**Success Response (200):**
```json
{
  "message": "Password updated successfully"
}
```

**Error Responses:**
- 401 Unauthorized
- 400 Bad Request (Invalid current password)

### 6. Update Profile
Update user's profile information (requires authentication).

**Endpoint:** `PATCH /auth/profile`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "mobileNumber": "1234567890",
  "dateOfBirth": "1990-01-01",
  "gender": "male",
  "addresses": [
    {
      "street": "123 Main St",
      "city": "New York",
      "state": "NY",
      "country": "USA",
      "pincode": "123456",
      "isDefault": true
    }
  ],
  "profilePicture": "https://example.com/profile.jpg"
}
```

**Success Response (200):**
```json
{
  "id": "60d21b4667d0d8992e610c85",
  "fullName": "John Doe",
  "email": "john@example.com",
  "mobileNumber": "1234567890",
  "dateOfBirth": "1990-01-01",
  "gender": "male",
  "addresses": [
    {
      "id": "address-id",
      "street": "123 Main St",
      "city": "New York",
      "state": "NY",
      "country": "USA",
      "pincode": "123456",
      "isDefault": true
    }
  ],
  "profilePicture": "https://example.com/profile.jpg",
  "isEmailVerified": true,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Error Response (401):**
```json
{
  "status": "error",
  "message": "Unauthorized"
}
```

### 7. Get Profile
Get user's profile information (requires authentication).

**Endpoint:** `GET /auth/profile`

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "id": "60d21b4667d0d8992e610c85",
  "fullName": "John Doe",
  "email": "john@example.com",
  "mobileNumber": "1234567890",
  "dateOfBirth": "1990-01-01",
  "gender": "male",
  "addresses": [
    {
      "id": "address-id",
      "street": "123 Main St",
      "city": "New York",
      "state": "NY",
      "country": "USA",
      "pincode": "123456",
      "isDefault": true
    }
  ],
  "profilePicture": "https://example.com/profile.jpg",
  "isEmailVerified": true,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Error Response (401):**
```json
{
  "status": "error",
  "message": "Unauthorized"
}
```

## Authentication Token
- All authenticated endpoints require a Bearer token in the Authorization header
- Token format: `Bearer <token>`
- Token is received upon successful login or registration
- Token expires after 1 hour (configurable)

## Error Handling
All error responses follow this format:
```json
{
  "status": "error",
  "message": "Error description"
}
```

Common HTTP Status Codes:
- 200: Success
- 201: Created
- 400: Bad Request (Invalid input)
- 401: Unauthorized (Invalid/missing token)
- 404: Not Found
- 500: Internal Server Error

## Rate Limiting
- 100 requests per 15 minutes per IP address
- Exceeding the limit returns a 429 status code with message: "Too many requests from this IP, please try again later." 