# KRYROS CHAT AGENT - Omnichannel Inbox & CRM Platform

A production-ready Omnichannel Business Inbox + Automation + Mini CRM designed for small and medium businesses. Built with scalability and reselling in mind.

## 🚀 Features

### Core Features
- **Unified Inbox** - WhatsApp, Instagram DM, and Facebook Messenger in one interface
- **Message Normalization** - All platforms normalized to a common schema
- **Webhook Handlers** - Real-time message processing for all Meta platforms
- **Mini CRM** - Lead management with status tracking (New → Lead → Qualified → Customer)
- **Automation Engine** - Auto-replies, keyword responses, and business hours logic

### Admin Features
- **Organization Management** - Multi-tenant architecture for reselling
- **Platform Connections** - API key/token management for each client
- **Business Profile** - Company branding and settings
- **Subscription Plans** - Free, Starter ($29/mo), Professional ($99/mo), Enterprise ($299/mo)

## 📦 Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Node.js + NestJS |
| Database | PostgreSQL |
| ORM | Prisma |
| Frontend | Next.js 14 (App Router) |
| UI | Tailwind CSS |
| Auth | JWT (email/password) |

## 🛠️ Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL 14+
- npm or yarn

### 1. Clone and Install

```bash
cd c:/Users/AsaphisPC/Bussiness_Support

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Database Setup

```bash
# Create PostgreSQL database
createdb business_support

# Run migrations
cd backend
npx prisma migrate dev --name init
```

### 3. Environment Configuration

**Backend (.env)**
```env
DATABASE_URL="postgresql://user:password@localhost:5432/business_support?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN="7d"
PORT=5013
CORS_ORIGIN="http://localhost:5012"
```

**Frontend (.env.local)**
```env
NEXT_PUBLIC_API_URL="http://localhost:5013/api/v1"
NEXT_PUBLIC_APP_URL="http://localhost:5012"
```

### 4. Start Development Servers

```bash
# Terminal 1: Start Backend
cd backend
npm run start:dev
# Backend runs at http://localhost:5013

# Terminal 2: Start Frontend
cd frontend
npm run dev
# Frontend runs at http://localhost:5012
```

### 5. Access the Application

- **Frontend**: http://localhost:5012
- **Backend API**: http://localhost:5013/api/v1
- **Webhook Endpoint**: http://localhost:5013/api/webhooks/meta

---

## 🔴 HOW TO CONNECT REAL META WEBHOOKS AND TEST

### Step 1: Create Meta Developer Account

1. Go to **https://developers.facebook.com**
2. Click "My Apps" → "Create App"
3. Choose **"Consumer"** app type
4. Fill in:
   - Display Name: "Business Support"
   - Contact Email: your@email.com
5. Click "Create App"

### Step 2: Get WhatsApp Credentials

1. In your app dashboard, scroll down to **"Add products to your app"**
2. Find **WhatsApp** and click "Set up"
3. Click **"API Setup"** on the left sidebar
4. You will see:
   - **Phone Number ID** (copy this)
   - **WhatsApp Business Account ID** (copy this)
5. To get Access Token:
   - Click **"Settings"** → **"Advanced"** → **"Access Tokens"**
   - Click "Generate Token" for the test token
   - Or go to **https://business.facebook.com/settings/system-users** for a permanent token

### Step 3: Set Up Webhook

1. In your Meta app, click **"Products"** → **"Webhooks"**
2. Click **"Add Webhook"**
3. Fill in:
   - **Callback URL**: `http://YOUR_PUBLIC_IP:5013/api/webhooks/meta`
     - Note: For local testing, use **ngrok** (see below)
   - **Verify Token**: `business_support_2024`
4. Click "Verify and Save"
5. After verification, click "Add Subscriptions"
6. Select:
   - `messages`
   - `message_deliveries`
   - `message_reads`
7. Click "Save"

### Step 4: Use ngrok for Local Testing (Required!)

Meta webhooks need a public URL. Use ngrok:

```bash
# Install ngrok
npm install -g ngrok

# Start tunnel to backend
ngrok http 5013
```

Copy the ngrok URL (e.g., `https://abc123.ngrok.io`) and use it as your webhook URL:
```
https://abc123.ngrok.io/api/webhooks/meta
```

### Step 5: Connect WhatsApp in Your App

1. Go to http://localhost:5012
2. Register a new account
3. Go to **Settings → Platforms**
4. Enter your WhatsApp credentials:
   - **Phone Number ID**: From Meta Developer Portal
   - **Access Token**: From Meta Developer Portal
   - **Business Account ID**: From Meta Developer Portal
5. Click **Connect WhatsApp**

### Step 6: Send a Test Message

1. In Meta Developer Portal:
   - Go to WhatsApp → **"API Setup"**
   - Find the **"To"** phone number (your test number)
   - Click **"Send Message"**
   - Enter a phone number to send to
   - Type a test message
2. Check your app:
   - Go to **Inbox** in the dashboard
   - You should see the incoming message!

### Step 7: Reply to the Message

1. In your app's Inbox, click the conversation
2. Type a reply and send
3. The reply will appear in the customer's WhatsApp!

---

## 📚 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Register new organization |
| POST | `/api/v1/auth/login` | Login with email/password |
| GET | `/api/v1/auth/me` | Get current user |

### Contacts (Mini CRM)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/contacts` | List all contacts |
| POST | `/api/v1/contacts` | Create new contact |
| PUT | `/api/v1/contacts/:id` | Update contact |
| DELETE | `/api/v1/contacts/:id` | Delete contact |

### Automations
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/automations` | List automations |
| POST | `/api/v1/automations` | Create automation |
| PUT | `/api/v1/automations/:id` | Update automation |
| PATCH | `/api/v1/automations/:id/toggle` | Toggle status |

### Messages
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/messages/conversations` | List conversations |
| POST | `/api/v1/messages` | Send message |
| GET | `/api/v1/messages/:conversationId` | Get conversation messages |

### Webhooks (Meta)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/webhooks/meta` | Webhook verification (Meta calls this first) |
| POST | `/api/webhooks/meta` | Receive webhook events |

### Settings
| Method | Endpoint | Description |
|--------|----------|-------------|
| PUT | `/api/v1/settings/platforms` | Connect/Update platform |
| GET | `/api/v1/settings/business-hours` | Get business hours |
| PUT | `/api/v1/settings/business-hours` | Update business hours |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/admin/organizations` | List all organizations |
| PATCH | `/api/v1/admin/organizations/:id/plan` | Update subscription plan |
| DELETE | `/api/v1/admin/organizations/:id` | Delete organization |

---

## 🔧 Testing Checklist

### ✅ Backend Tests
```bash
cd backend
npm run test

# Test specific module
npm run test automations
npm run test webhooks
```

### ✅ Frontend Tests
```bash
cd frontend
npm run test
```

### ✅ Webhook Testing with Postman

1. **Verify webhook**:
```
GET http://localhost:5013/api/webhooks/meta
?hub.mode=subscribe
&hub.verify_token=business_support_2024
&hub.challenge=CHALLENGE_ACCEPTED
```

2. **Send test message** (simulate Meta webhook):
```
POST http://localhost:5013/api/webhooks/meta
Content-Type: application/json

{
  "object": "whatsapp_business_account",
  "entry": [{
    "id": "WHATSAPP_BUSINESS_ACCOUNT_ID",
    "changes": [{
      "value": {
        "messages": [{
          "from": "+2348001234567",
          "id": "wamid.abc123",
          "timestamp": "1234567890",
          "text": { "body": "Hello, I need help!" },
          "type": "text"
        }]
      }
    }]
  }]
}
```

---

## 🎯 Production Deployment

### Docker

```bash
# Build images
docker-compose build

# Start services
docker-compose up -d
```

### Environment Variables (Production)

```env
# Critical
DATABASE_URL="postgresql://..."
JWT_SECRET="long-random-string"
NODE_ENV=production

# Webhook URLs
CORS_ORIGIN="https://your-domain.com"
```

### Domain Setup

For webhooks to work in production:
1. Point your domain to the server
2. Set up SSL certificate (Let's Encrypt)
3. Update webhook URLs in Meta Developer Portal

---

## 📁 Project Structure

```
business_support/
├── backend/
│   ├── src/
│   │   ├── auth/           # JWT authentication
│   │   ├── contacts/        # CRM contacts
│   │   ├── messages/        # Message handling
│   │   ├── automations/     # Automation rules
│   │   ├── platforms/       # Platform integrations
│   │   ├── webhooks/        # Meta webhooks
│   │   ├── config/          # Settings
│   │   └── admin/           # Super admin
│   ├── prisma/schema.prisma
│   └── package.json
├── frontend/
│   ├── src/app/
│   │   ├── auth/            # Login/Register
│   │   ├── dashboard/       # Main app
│   │   │   ├── inbox/       # Unified inbox
│   │   │   ├── contacts/    # CRM
│   │   │   ├── automation/ # Rules
│   │   │   └── settings/    # Settings
│   │   └── admin/           # Super admin
│   └── package.json
└── README.md
```

---

## 💰 Pricing Plans

| Plan | Price | Features |
|------|-------|----------|
| Free | $0 | Testing, 1 user |
| Starter | $29/mo | 1 agent, 1 platform |
| Professional | $99/mo | 5 agents, all platforms |
| Enterprise | $299/mo | Unlimited, priority support |

---

## 📞 Support

- **Issues**: Report bugs via GitHub Issues
- **Docs**: See API documentation at `/api` when backend is running
- **Meta Docs**: https://developers.facebook.com/docs/whatsapp

---

Built with ❤️ for small and medium businesses.
