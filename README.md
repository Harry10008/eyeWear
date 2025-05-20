# Eyewear E-commerce Platform

A full-featured e-commerce platform for eyewear products, built with Node.js, Express, MongoDB, and TypeScript.

## Features

- User Authentication & Authorization
  - Email verification
  - Password reset functionality
  - JWT-based authentication
  - Role-based access control (User/Admin)

- Product Management
  - Product listing with categories
  - Detailed product information
  - Product search and filtering
  - Product images management

- User Features
  - User registration and profile management
  - Shopping cart functionality
  - Wishlist management
  - Order history
  - Address management
  - Profile picture upload

- Admin Dashboard
  - Product management
  - User management
  - Order management
  - Category management
  - Analytics and reporting

- Category Management
  - Multiple category levels
  - Category-wise product filtering
  - Special categories (Kids, Unisex, Men, Women)
  - Product types (Sunglasses, Screen glasses, Power glasses)

## Tech Stack

- Node.js
- Express.js
- TypeScript
- MongoDB
- JWT Authentication
- Nodemailer for email services
- Winston for logging
- Jest for testing

## Project Structure

```
├── src/
│   ├── app.ts              # Express app configuration
│   ├── server.ts           # Server entry point
│   ├── config/            # Configuration files
│   ├── controllers/       # Route controllers
│   ├── dto/              # Data Transfer Objects
│   ├── interfaces/       # TypeScript interfaces
│   ├── middleware/       # Custom middleware
│   ├── models/          # Mongoose models
│   ├── repositories/    # Database repositories
│   ├── routes/         # API routes
│   ├── services/       # Business logic
│   └── utils/          # Utility functions
├── uploads/            # File uploads
│   ├── merchants/     # Merchant uploads
│   └── users/         # User uploads
├── logs/              # Application logs
└── tests/            # Test files
```

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=3000
   MONGODB_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   SMTP_HOST=your_smtp_host
   SMTP_PORT=your_smtp_port
   SMTP_USER=your_smtp_user
   SMTP_PASS=your_smtp_password
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```

## Available Scripts

- `npm start` - Start the production server
- `npm run dev` - Start the development server with hot reload
- `npm run build` - Build the TypeScript code
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## API Documentation

API documentation will be available at `/api-docs` when running the server.

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License. 