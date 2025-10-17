# Base44 - API Key Management Platform

A complete, production-ready API key management system built with modern web technologies.

## 🚀 Features

- **🔐 Secure Authentication** - JWT-based authentication with HttpOnly cookies
- **🔑 API Key Management** - Create, view, and revoke API keys with AES-256-GCM encryption
- **💳 Stripe Integration** - Seamless subscription management (Free/PRO plans)
- **🎨 Glassmorphism UI** - Modern, beautiful interface with Tailwind CSS
- **📱 Responsive Design** - Works perfectly on all devices
- **🔒 Security First** - Rate limiting, CORS protection, encrypted secrets

## 🛠 Tech Stack

### Frontend
- **React 18** + **TypeScript**
- **Vite** for fast development
- **React Router** for navigation
- **React Query** for server state management
- **Tailwind CSS** with custom glassmorphism design
- **Axios** for API calls

### Backend
- **Fastify** (Node.js) + **TypeScript**
- **Prisma** ORM with **SQLite**
- **JWT** authentication
- **AES-256-GCM** encryption
- **Stripe** for payments
- **Zod** for validation
- **Pino** for logging

## 📁 Project Structure

```
base44/
├─ apps/
│  ├─ server/           # Backend Fastify
│  │  ├─ src/
│  │  │  ├─ libs/       # JWT, crypto, utils
│  │  │  ├─ services/   # Business logic
│  │  │  ├─ routes/     # API endpoints
│  │  │  └─ schemas/    # Zod validation
│  │  └─ prisma/
│  └─ web/              # Frontend React
│     ├─ src/
│     │  ├─ components/ # UI components
│     │  ├─ pages/      # React pages
│     │  └─ lib/        # Services & API
├─ package.json         # Workspace config
└─ README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- pnpm 8+

### Installation

1. **Clone and install dependencies**
```bash
git clone <repository>
cd base44
pnpm install
```

2. **Set up environment variables**

Backend (apps/server/.env):
```bash
cp apps/server/.env.example apps/server/.env
# Edit apps/server/.env with your values
```

Frontend (apps/web/.env):
```bash
cp apps/web/.env.example apps/web/.env
```

3. **Set up the database**
```bash
pnpm prisma:generate
pnpm prisma:migrate
```

4. **Start development servers**
```bash
# Start both frontend and backend
pnpm dev

# Or start individually
pnpm dev:server  # Backend on :8080
pnpm dev:web     # Frontend on :5173
```

## 🔐 Environment Variables

### Backend (.env)
```bash
NODE_ENV=development
PORT=8080
DATABASE_URL="file:./dev.db"
JWT_SECRET="your_super_secret_jwt_key_at_least_32_characters"
CRYPTO_MASTER_KEY="base64_encoded_32_byte_key"
STRIPE_SECRET_KEY="sk_test_your_stripe_key"
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret"
STRIPE_PRICE_PRO="price_your_pro_plan"
WEB_BASE_URL="http://localhost:5173"
```

### Frontend (.env)
```bash
VITE_API_URL=http://localhost:8080
```

## 📊 API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/login` - Login with credentials
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### API Keys
- `GET /api/keys` - List user's API keys
- `POST /api/keys` - Create new API key
- `DELETE /api/keys/:id` - Revoke API key

### Billing
- `POST /api/billing/checkout` - Create Stripe checkout session
- `POST /api/billing/webhook` - Handle Stripe webhooks

## 🎨 Design System

The application features a modern glassmorphism design with:
- **Colors**: Black (#0a0a0a) + Yellow (#FFD400) theme
- **Typography**: Inter font family
- **Components**: Custom glassmorphic cards and buttons
- **Animations**: Smooth transitions and micro-interactions

## 🧪 Development

### Available Scripts

```bash
# Development
pnpm dev              # Start both servers
pnpm dev:server       # Backend only
pnpm dev:web          # Frontend only

# Database
pnpm prisma:generate  # Generate Prisma client
pnpm prisma:migrate   # Run migrations
pnpm prisma:studio    # Open Prisma Studio

# Building
pnpm build            # Build both apps
pnpm build:server     # Backend only
pnpm build:web        # Frontend only
```

## 📝 License

MIT License - see LICENSE file for details.

---

Built with ❤️ using the Base44 architecture template.
# vault-api
