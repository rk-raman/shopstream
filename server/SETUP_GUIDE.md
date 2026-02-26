# Server Setup Guide

This guide will help you set up and run the ShopStream server locally and in production.

## 🚀 Quick Start

### Prerequisites

- **Node.js** >= 16.0.0
- **MongoDB** >= 4.4
- **Redis** (optional, for caching and queues)
- **Elasticsearch** (optional, for advanced search)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd shopstream/server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

4. **Configure your environment**
   Edit `.env` file with your configuration (see [Environment Variables](#environment-variables))

5. **Start the server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## 📋 Detailed Setup

### 1. Environment Configuration

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

**Required variables for basic setup:**
- `NODE_ENV` - Set to `development` or `production`
- `PORT` - Server port (default: 5000)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `CLIENT_URL` - Frontend application URL

### 2. Database Setup

#### MongoDB

**Local Setup:**
```bash
# Install MongoDB (macOS)
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB
brew services start mongodb-community
```

**Docker Setup:**
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

**MongoDB Atlas (Cloud):**
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Get your connection string and update `MONGODB_URI` in `.env`

#### Redis (Optional)

**Local Setup:**
```bash
# Install Redis (macOS)
brew install redis

# Start Redis
brew services start redis
```

**Docker Setup:**
```bash
docker run -d -p 6379:6379 --name redis redis:latest
```

#### Elasticsearch (Optional)

**Docker Setup:**
```bash
docker run -d -p 9200:9200 -p 9300:9300 --name elasticsearch -e "discovery.type=single-node" elasticsearch:8.7.0
```

### 3. External Services Setup

#### Email Service (Gmail SMTP)

1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
3. Update `.env`:
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USERNAME=your-email@gmail.com
   SMTP_PASSWORD=your-app-password
   ```

#### Cloudinary (File Upload)

1. Create account at [Cloudinary](https://cloudinary.com)
2. Get your credentials from Dashboard
3. Update `.env`:
   ```env
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

#### Payment Gateways

**Stripe:**
1. Create account at [Stripe](https://stripe.com)
2. Get API keys from Dashboard → Developers → API keys
3. Update `.env`:
   ```env
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

**Razorpay:**
1. Create account at [Razorpay](https://razorpay.com)
2. Get API keys from Dashboard → Settings → API Keys
3. Update `.env`:
   ```env
   RAZORPAY_KEY_ID=rzp_test_...
   RAZORPAY_KEY_SECRET=your_secret
   ```

## 🏃‍♂️ Running the Server

### Development Mode

```bash
# Start with nodemon (auto-restart on changes)
npm run dev

# Start with debugging
npm run debug-dev

# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

### Production Mode

```bash
# Start production server
npm start

# Run with PM2 (recommended for production)
npm install -g pm2
pm2 start server.js --name "shopstream-server"
```

### Docker Setup

**Development:**
```bash
# Build and run with Docker Compose
docker-compose -f docker-compose.dev.yml up
```

**Production:**
```bash
# Build and run production containers
docker-compose up -d
```

## 🗂️ Project Structure

```
server/
├── src/
│   ├── app.js              # Express app configuration
│   ├── config/             # Database and service configurations
│   ├── modules/            # Feature modules (users, products, orders, etc.)
│   ├── routes/             # API routes
│   ├── shared/             # Shared utilities and middleware
│   └── jobs/               # Background jobs
├── scripts/                # Database scripts and utilities
├── tests/                  # Test files
├── docs/                   # Documentation
├── .env.example            # Environment variables template
├── package.json            # Dependencies and scripts
└── server.js               # Server entry point
```

## 🔧 Available Scripts

| Script | Description |
|--------|-------------|
| `npm start` | Start production server |
| `npm run dev` | Start development server with nodemon |
| `npm run debug` | Start with Node.js debugger |
| `npm run debug-dev` | Start development with debugging |
| `npm test` | Run test suite |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Fix linting issues |
| `npm run format` | Format code with Prettier |
| `npm run seed` | Seed database with sample data |
| `npm run db:migrate` | Run database migrations |

## 🌐 API Access

Once the server is running:

- **Base URL**: `http://localhost:5000`
- **API Routes**: `http://localhost:5000/api`
- **Health Check**: `http://localhost:5000/api/health`

## 🔍 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check `MONGODB_URI` in `.env`
   - Verify network connectivity

2. **Port Already in Use**
   ```bash
   # Find process using port 5000
   lsof -i :5000
   
   # Kill the process
   kill -9 <PID>
   ```

3. **Module Not Found**
   ```bash
   # Clear npm cache and reinstall
   npm cache clean --force
   rm -rf node_modules package-lock.json
   npm install
   ```

4. **Environment Variables Not Loading**
   - Ensure `.env` file exists in server root
   - Check for syntax errors in `.env`
   - Verify no spaces around `=` signs

### Debug Mode

Enable detailed logging:
```bash
DEBUG=* npm run dev
```

### Health Check

Verify server status:
```bash
curl http://localhost:5000/api/health
```

## 🚀 Deployment

### Environment Setup

1. **Set production environment:**
   ```env
   NODE_ENV=production
   ```

2. **Configure production database**
3. **Set up SSL certificates**
4. **Configure reverse proxy (Nginx/Apache)**
5. **Set up process manager (PM2)**

### PM2 Configuration

Create `ecosystem.config.js`:
```javascript
module.exports = {
  apps: [{
    name: 'shopstream-server',
    script: 'server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production'
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
```

Start with PM2:
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## 📚 Additional Resources

- [API Documentation](./docs/API.md)
- [Database Schema](./docs/DATABASE.md)
- [Email Setup Guide](./EMAIL_SETUP_GUIDE.md)
- [Testing Guide](./docs/TESTING.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📞 Support

If you encounter any issues during setup:

1. Check the troubleshooting section above
2. Review existing GitHub issues
3. Create a new issue with detailed error information
4. Include your environment details (OS, Node.js version, etc.)
