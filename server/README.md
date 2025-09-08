# ShopStream Server

A comprehensive e-commerce backend API built with Node.js, Express, and MongoDB. This server provides a complete solution for managing products, orders, payments, users, and analytics for an e-commerce platform.

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Running Locally](#running-locally)
- [Deployment](#deployment)
- [Folder Structure](#folder-structure)
- [API Documentation](#api-documentation)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Testing](#testing)
- [Contribution Guidelines](#contribution-guidelines)
- [Upload Service](#upload-service)

## 🚀 Project Overview

ShopStream Server is a microservices-oriented e-commerce backend that handles:

- **User Management**: Authentication, profiles, addresses, wishlists
- **Product Catalog**: Products, categories, brands, search, recommendations
- **Order Processing**: Order creation, tracking, status updates
- **Payment Integration**: Stripe, Razorpay, multiple payment methods
- **Inventory Management**: Stock tracking, low stock alerts
- **Analytics**: User behavior, sales analytics, reporting
- **Notifications**: Email, SMS, push notifications
- **Reviews & Ratings**: Product reviews and rating system

## ✨ Features

### Core Features

- 🔐 **JWT Authentication** with refresh tokens
- 👤 **User Management** with role-based access control
- 🛍️ **Product Catalog** with advanced search and filtering
- 🛒 **Shopping Cart** with persistent storage
- 📦 **Order Management** with real-time tracking
- 💳 **Payment Processing** (Stripe, Razorpay)
- 📊 **Analytics Dashboard** with comprehensive reporting
- 🔍 **Elasticsearch Integration** for advanced search
- 📧 **Email & SMS Notifications**
- ⭐ **Review & Rating System**

### Technical Features

- 🏗️ **Modular Architecture** with microservices pattern
- 🔄 **Event-Driven Architecture** with Kafka
- 📝 **Joi Validation** with comprehensive error handling
- 🚀 **Redis Caching** for improved performance
- 📈 **Rate Limiting** and security middleware
- 🐳 **Docker Support** for containerization
- 📊 **Winston Logging** with structured logging
- 🧪 **Jest Testing** with comprehensive test coverage

## 🛠️ Tech Stack

### Backend Framework

- **Node.js** (v16+)
- **Express.js** - Web framework
- **MongoDB** - Primary database
- **Mongoose** - ODM for MongoDB

### Additional Services

- **Redis** - Caching and session storage
- **Elasticsearch** - Search and analytics
- **Kafka** - Event streaming
- **Cloudinary** - Image storage and processing

### Payment Gateways

- **Stripe** - International payments
- **Razorpay** - Indian payments

### Development Tools

- **Jest** - Testing framework
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Nodemon** - Development server
- **Docker** - Containerization

## 📦 Installation

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- Redis (v6 or higher)
- Elasticsearch (v8 or higher)
- Kafka (v2.8 or higher)

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd shopstream/server
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Environment Setup

Create a `.env` file in the server root directory:

```bash
cp .env.example .env
```

### Step 4: Database Setup

```bash
# Start MongoDB
mongod

# Start Redis
redis-server

# Start Elasticsearch
elasticsearch

# Start Kafka
kafka-server-start.sh config/server.properties
```

## 🚀 Running Locally

### Development Mode

```bash
# Start the development server
npm run dev

# Or with Docker
npm run dev:docker
```

The server will start on `http://localhost:5000`

### Production Mode

```bash
# Build the application
npm run build

# Start the production server
npm start
```

### Available Scripts

```bash
npm run dev          # Start development server with nodemon
npm run dev:docker   # Start with Docker Compose
npm start           # Start production server
npm test            # Run tests
npm run test:watch  # Run tests in watch mode
npm run test:coverage # Run tests with coverage
npm run lint        # Run ESLint
npm run lint:fix    # Fix ESLint issues
npm run format      # Format code with Prettier
npm run seed        # Seed database with sample data
npm run db:migrate  # Run database migrations
```

## 🐳 Deployment

### Docker Deployment

```bash
# Build Docker image
docker build -t shopstream-server .

# Run container
docker run -p 5000:5000 shopstream-server

# Or use Docker Compose
docker-compose up -d
```

### Environment Variables for Production

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://localhost:27017/shopstream
REDIS_URL=redis://localhost:6379
ELASTICSEARCH_URL=http://localhost:9200
KAFKA_BROKERS=localhost:9092
JWT_SECRET=your-super-secret-jwt-key
STRIPE_SECRET_KEY=your-stripe-secret-key
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-secret
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-cloudinary-key
CLOUDINARY_API_SECRET=your-cloudinary-secret
```

## 📁 Folder Structure

```
server/
├── docs/                          # Documentation
│   ├── modules/                   # Module-specific documentation
│   │   ├── user/                 # User module docs
│   │   ├── product/              # Product module docs
│   │   ├── order/                # Order module docs
│   │   ├── payment/              # Payment module docs
│   │   └── shared/               # Shared module docs
│   └── api/                      # API documentation
├── src/
│   ├── modules/                  # Feature modules
│   │   ├── user/                 # User management
│   │   │   ├── controllers/      # Route controllers
│   │   │   ├── models/           # Database models
│   │   │   ├── routes/           # API routes
│   │   │   ├── services/         # Business logic
│   │   │   ├── validators/       # Input validation
│   │   │   └── events/           # Event handlers
│   │   ├── product/              # Product management
│   │   ├── order/                # Order processing
│   │   ├── payment/              # Payment processing
│   │   ├── cart/                 # Shopping cart
│   │   ├── inventory/            # Inventory management
│   │   ├── analytics/            # Analytics and reporting
│   │   ├── notification/         # Notifications
│   │   └── review/               # Reviews and ratings
│   ├── shared/                   # Shared utilities
│   │   ├── constants/            # Application constants
│   │   ├── events/               # Event system
│   │   ├── middleware/           # Express middleware
│   │   └── utils/                # Utility functions
│   ├── config/                   # Configuration files
│   ├── jobs/                     # Background jobs
│   └── routes/                   # Main route definitions
├── tests/                        # Test files
├── uploads/                      # File uploads
├── logs/                         # Application logs
├── scripts/                      # Utility scripts
├── docker-compose.yml            # Docker Compose configuration
├── Dockerfile                    # Docker configuration
├── package.json                  # Dependencies and scripts
└── server.js                     # Application entry point
```

## 📚 API Documentation

### Base URL

```
Development: http://localhost:5000/api/v1
Production: https://your-domain.com/api/v1
```

### Authentication

All protected routes require a valid JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Main Endpoints

#### User Management

- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `GET /users/profile` - Get user profile
- `PUT /users/profile` - Update user profile

#### Product Management

- `GET /products` - Get all products
- `GET /products/:id` - Get product by ID
- `POST /products` - Create product (Admin)
- `PUT /products/:id` - Update product (Admin)
- `DELETE /products/:id` - Delete product (Admin)

#### Order Management

- `POST /orders` - Create order
- `GET /orders` - Get user orders
- `GET /orders/:id` - Get order by ID
- `PUT /orders/:id/cancel` - Cancel order

#### Payment Processing

- `POST /payments/create` - Create payment intent
- `POST /payments/confirm` - Confirm payment
- `GET /payments/:id` - Get payment status

For detailed API documentation, see [API Documentation](./docs/api/README.md)

## 🔧 Environment Variables

| Variable                | Description               | Required | Default       |
| ----------------------- | ------------------------- | -------- | ------------- |
| `NODE_ENV`              | Environment mode          | Yes      | `development` |
| `PORT`                  | Server port               | No       | `5000`        |
| `MONGODB_URI`           | MongoDB connection string | Yes      | -             |
| `REDIS_URL`             | Redis connection string   | Yes      | -             |
| `ELASTICSEARCH_URL`     | Elasticsearch URL         | Yes      | -             |
| `KAFKA_BROKERS`         | Kafka broker URLs         | Yes      | -             |
| `JWT_SECRET`            | JWT signing secret        | Yes      | -             |
| `JWT_REFRESH_SECRET`    | JWT refresh secret        | Yes      | -             |
| `STRIPE_SECRET_KEY`     | Stripe secret key         | No       | -             |
| `RAZORPAY_KEY_ID`       | Razorpay key ID           | No       | -             |
| `RAZORPAY_KEY_SECRET`   | Razorpay secret           | No       | -             |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name     | No       | -             |
| `CLOUDINARY_API_KEY`    | Cloudinary API key        | No       | -             |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret     | No       | -             |

## 🗄️ Database Setup

### MongoDB Collections

The application uses the following main collections:

- **users** - User accounts and profiles
- **products** - Product catalog
- **categories** - Product categories
- **brands** - Product brands
- **orders** - Order information
- **orderItems** - Order line items
- **payments** - Payment transactions
- **carts** - Shopping carts
- **reviews** - Product reviews
- **notifications** - User notifications
- **analytics** - Analytics data

### Database Seeding

```bash
# Seed the database with sample data
npm run seed
```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- --testNamePattern="User Controller"
```

### Test Structure

```
tests/
├── unit/              # Unit tests
├── integration/       # Integration tests
├── e2e/              # End-to-end tests
└── fixtures/         # Test data fixtures
```

## 🤝 Contribution Guidelines

### Getting Started

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Add tests for your changes
5. Run the test suite: `npm test`
6. Commit your changes: `git commit -m 'Add amazing feature'`
7. Push to the branch: `git push origin feature/amazing-feature`
8. Open a Pull Request

### Code Style

- Follow ESLint configuration
- Use Prettier for code formatting
- Write meaningful commit messages
- Add JSDoc comments for functions
- Follow the existing folder structure

### Pull Request Process

1. Ensure all tests pass
2. Update documentation if needed
3. Request review from maintainers
4. Address feedback promptly
5. Squash commits if necessary

### Development Workflow

1. **Feature Development**: Create feature branches from `main`
2. **Bug Fixes**: Create bugfix branches from `main`
3. **Hotfixes**: Create hotfix branches from `main`
4. **Testing**: Write tests for all new features
5. **Documentation**: Update relevant documentation

## 📞 Support

For support and questions:

- Create an issue in the repository
- Check the [documentation](./docs/)
- Review existing issues and discussions

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Express.js community
- MongoDB documentation
- Joi validation library
- All contributors and maintainers

---

## 📸 Upload Service

The ShopStream platform includes a comprehensive, modular upload service that supports multiple cloud providers and different user types.

### Features

- **Multi-Provider Support**: Easily switch between Cloudinary, AWS S3, and other providers
- **Role-Based Uploads**: Different upload permissions and configurations for users, sellers, and admins
- **Organized File Structure**: Automatic folder organization by user type and category
- **Image Transformations**: Built-in image resizing and optimization (provider-dependent)
- **Security**: File type validation, size limits, and secure upload URLs
- **Event-Driven**: Integrates with the platform's event system for analytics and notifications

### Supported Providers

1. **Cloudinary** (Default)

   - Image transformations and optimizations
   - CDN delivery
   - Advanced image management features

2. **AWS S3**
   - Scalable object storage
   - Cost-effective for large files
   - Integration with other AWS services

### Configuration

Set up your preferred upload provider in your `.env` file:

```bash
# Upload Service Configuration
UPLOAD_PROVIDER=cloudinary  # or 'aws'
UPLOAD_MAX_FILE_SIZE=5242880  # 5MB in bytes
UPLOAD_ALLOWED_MIME_TYPES=image/jpeg,image/png,image/gif,image/webp

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# AWS S3 Configuration (if using AWS)
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=your_bucket_name
```

### API Endpoints

#### User Uploads

- `POST /api/v1/uploads/avatar` - Upload user avatar
- `POST /api/v1/uploads/custom` - Custom upload with parameters

#### Seller Uploads

- `POST /api/v1/uploads/products/images` - Upload product images
- `POST /api/v1/uploads/products/:productId/images` - Upload images for specific product

#### Admin Uploads

- `POST /api/v1/uploads/banners` - Upload banner images
- `POST /api/v1/uploads/categories/:categoryId/image` - Upload category images

#### File Management

- `DELETE /api/v1/uploads/files/:publicId` - Delete a file
- `GET /api/v1/uploads/files/:publicId/info` - Get file information
- `POST /api/v1/uploads/signed-url` - Generate signed upload URL

#### Utility Endpoints

- `GET /api/v1/uploads/provider/info` - Get current provider information
- `POST /api/v1/uploads/provider/switch` - Switch provider (admin only)

### Usage Examples

#### Upload Avatar

```javascript
const formData = new FormData();
formData.append("avatar", file);

const response = await fetch("/api/v1/uploads/avatar", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
  },
  body: formData,
});
```

#### Upload Product Images

```javascript
const formData = new FormData();
files.forEach((file) => formData.append("productImages", file));

const response = await fetch("/api/v1/uploads/products/images", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
  },
  body: formData,
});
```

#### Switch Provider (Admin)

```javascript
const response = await fetch("/api/v1/uploads/provider/switch", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${adminToken}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    providerName: "aws",
    providerConfig: {
      accessKeyId: "your_key",
      secretAccessKey: "your_secret",
      region: "us-east-1",
      bucketName: "your_bucket",
    },
  }),
});
```

### File Organization

Files are automatically organized in the following structure:

```
/{category}/{userType}/{userId}/filename
```

Examples:

- `users/user/12345/avatar_1234567890_abc123.jpg`
- `products/seller/67890/product_1234567890_def456.jpg`
- `banners/admin/admin123/banner_1234567890_ghi789.jpg`

### Adding New Providers

To add a new upload provider:

1. Create a new provider class extending `BaseUploadProvider`
2. Implement all required methods
3. Register the provider in `providers/index.js`
4. Update configuration as needed

```javascript
const MyProvider = require("./my.provider");

ProviderFactory.registerProvider("myprovider", MyProvider);
```

---

**Happy Coding! 🚀**
