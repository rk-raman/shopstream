# ShopStream - Quick Setup Guide

A full-stack e-commerce platform built with **Next.js 15** (client) and **Express.js + MongoDB** (server).

---

## Prerequisites

| Tool | Version | Check |
|------|---------|-------|
| Node.js | >= 16.0.0 | `node -v` |
| npm / yarn | latest | `npm -v` |
| MongoDB | 6.x+ (or Atlas) | `mongosh --version` |
| Redis | 7.x+ | `redis-cli ping` |
| Git | any | `git --version` |

**Optional (for full feature set):**

- Elasticsearch 8.x (product search)
- Docker & Docker Compose (containerized setup)
- Kafka (event streaming)

---

## 1. Clone the Repository

```bash
git clone <repo-url> shopstream
cd shopstream
```

---

## 2. Server Setup

### Install dependencies

```bash
cd server
npm install
```

### Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` and fill in the required values:

```env
# --- REQUIRED ---
NODE_ENV=development
PORT=5000

# MongoDB (use Atlas URI or local)
MONGODB_URI=mongodb://localhost:27017/shopstream

# JWT (generate your own secrets)
JWT_ACCESS_SECRET=<random-64-char-hex-string>
JWT_REFRESH_SECRET=<random-64-char-hex-string>
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
JWT_ISSUER=shopstream-app
JWT_AUDIENCE=shopstream-users

# Frontend URL (for CORS)
CLIENT_URL=http://localhost:3000

# --- OPTIONAL (features degrade gracefully without these) ---

# Redis (caching + background jobs)
REDIS_URL=redis://localhost:6379
REDIS_QUEUE_HOST=localhost
REDIS_QUEUE_PORT=6379

# Cloudinary (image uploads)
UPLOAD_PROVIDER=cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Stripe (payments)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Razorpay (alternative payments)
RAZORPAY_KEY_ID=your-key-id
RAZORPAY_KEY_SECRET=your-key-secret

# Email (Gmail SMTP)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587

# Elasticsearch (product search)
ELASTICSEARCH_URL=http://localhost:9200

# Rate limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

> **Tip:** Generate JWT secrets with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

### Seed the database (optional)

```bash
npm run seed
```

### Run database migrations (if needed)

```bash
npm run db:migrate
```

### Start the server

```bash
# Development (auto-reload with nodemon)
npm run dev

# Production
npm start
```

Server runs at **http://localhost:5000**.

---

## 3. Client Setup

### Install dependencies

```bash
cd client
npm install
```

### Configure environment variables

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_APP_ENV=development
```

### Start the client

```bash
# Development (with Turbopack)
npm run dev

# Production build
npm run build
npm start
```

Client runs at **http://localhost:3000**.

---

## 4. Running Both Together

Open two terminal windows:

```bash
# Terminal 1 - Server
cd server && npm run dev

# Terminal 2 - Client
cd client && npm run dev
```

---

## 5. Infrastructure Services

### MongoDB

**Option A: Local**
```bash
# macOS
brew install mongodb-community
brew services start mongodb-community
```

**Option B: MongoDB Atlas (cloud)**
1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Get the connection string and set `MONGODB_URI` in `.env`

### Redis

```bash
# macOS
brew install redis
brew services start redis

# Verify
redis-cli ping   # Should return PONG
```

### Elasticsearch (optional)

```bash
# macOS
brew install elasticsearch
brew services start elasticsearch

# Verify
curl http://localhost:9200
```

---

## 6. Third-Party Service Setup

### Stripe (Payments)

1. Create an account at [stripe.com](https://stripe.com)
2. Get test API keys from Dashboard > Developers > API Keys
3. Set `STRIPE_SECRET_KEY` and `STRIPE_PUBLISHABLE_KEY` in `.env`
4. For webhooks: `stripe listen --forward-to localhost:5000/api/payments/webhook`

### Cloudinary (Image Uploads)

1. Create an account at [cloudinary.com](https://cloudinary.com)
2. Get credentials from Dashboard
3. Set `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` in `.env`

### Gmail SMTP (Email)

1. Enable 2FA on your Google account
2. Generate an App Password: Google Account > Security > App Passwords
3. Set `EMAIL_USER` and `EMAIL_PASSWORD` in `.env`

---

## 7. Available Scripts

### Server (`/server`)

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with nodemon |
| `npm start` | Start production server |
| `npm run seed` | Seed database with sample data |
| `npm run db:migrate` | Run database migrations |
| `npm test` | Run tests (Jest) |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run lint` | Lint source code |
| `npm run lint:fix` | Lint and auto-fix |
| `npm run format` | Format code with Prettier |
| `npm run debug` | Start with Node inspector |

### Client (`/client`)

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (Turbopack) |
| `npm run build` | Production build |
| `npm start` | Start production server |
| `npm run lint` | Lint source code |
| `npm run type-check` | TypeScript type checking |

---

## 8. Project Structure

```
shopstream/
├── client/                     # Next.js 15 frontend
│   ├── src/
│   │   ├── app/                # App Router pages
│   │   │   ├── (customer)/     # Customer-facing pages (shop, cart, checkout, account)
│   │   │   └── (seller)/       # Seller dashboard (products, orders, analytics)
│   │   ├── components/         # Reusable UI components (Radix UI + Tailwind)
│   │   ├── features/           # Feature-based modules
│   │   ├── hooks/              # Custom React hooks
│   │   ├── lib/                # Utility functions
│   │   ├── services/           # API client services
│   │   ├── types/              # TypeScript type definitions
│   │   └── constants/          # App constants
│   ├── .env.local              # Client environment variables
│   └── package.json
│
├── server/                     # Express.js backend
│   ├── src/
│   │   ├── config/             # App config (database, redis, cloudinary, kafka, etc.)
│   │   ├── modules/            # Feature modules (each with controllers/models/routes/services)
│   │   │   ├── user/           # Auth, profiles, addresses
│   │   │   ├── product/        # Catalog, categories, brands, collections
│   │   │   ├── cart/           # Shopping cart
│   │   │   ├── order/          # Order processing
│   │   │   ├── payment/        # Stripe, Razorpay, PayPal
│   │   │   ├── inventory/      # Stock management
│   │   │   ├── notification/   # Email, SMS, push notifications
│   │   │   ├── review/         # Product reviews & ratings
│   │   │   ├── analytics/      # Sales & user analytics
│   │   │   └── upload/         # File upload management
│   │   ├── shared/             # Shared middleware, utils, events, constants
│   │   └── jobs/               # Background job processors (Bull/Redis)
│   ├── scripts/                # DB seed, migrations, and utility scripts
│   ├── .env.example            # Environment variable template
│   └── package.json
│
└── SETUP.md                    # This file
```

---

## 9. Tech Stack Summary

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, React 19, TypeScript, Tailwind CSS, Radix UI |
| Backend | Express.js 4, Node.js |
| Database | MongoDB (Mongoose ODM) |
| Cache | Redis |
| Search | Elasticsearch |
| Auth | JWT (access + refresh tokens), Passport.js (Google, Facebook OAuth) |
| Payments | Stripe, Razorpay, PayPal |
| File Storage | Cloudinary (primary), AWS S3 (alternative) |
| Email | Nodemailer (Gmail SMTP) |
| SMS | Twilio |
| Push Notifications | Firebase Cloud Messaging, Web Push |
| Background Jobs | Bull (Redis queues) |
| Event Streaming | Kafka |
| Real-time | Socket.IO |
| Testing | Jest, Supertest |

---

## 10. Troubleshooting

| Issue | Solution |
|-------|---------|
| `ECONNREFUSED` on MongoDB | Ensure MongoDB is running: `brew services start mongodb-community` or check Atlas URI |
| `ECONNREFUSED` on Redis | Start Redis: `brew services start redis` |
| Port 5000 already in use | Change `PORT` in `.env` or kill the process: `lsof -ti:5000 \| xargs kill` |
| Port 3000 already in use | Next.js will auto-pick 3001; or kill the process on 3000 |
| CORS errors in browser | Ensure `CLIENT_URL` in server `.env` matches the client's origin |
| Image uploads failing | Verify Cloudinary credentials in `.env` |
| Email not sending | Ensure Gmail App Password is set (not your regular password) |
| `MODULE_NOT_FOUND` | Run `npm install` in the relevant directory |
| TypeScript errors on build | Run `npm run type-check` in `/client` to see detailed errors |
