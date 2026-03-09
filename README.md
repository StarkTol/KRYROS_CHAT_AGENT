# KRYROS CHAT AGENT - Omnichannel Business Inbox + AI Chatbot

A production-ready Omnichannel Business Inbox + Automation + Mini CRM MVP, optimized for fast deployment per client and intended for reselling to small and medium businesses.

## Features

- **Unified Inbox**: WhatsApp, Instagram DM, and Facebook Messenger in one interface
- **WhatsApp Gateway**: Connect via QR code (self-hosted using Baileys)
- **AI Auto-Reply**: ChatGPT-powered responses with conversation context
- **Human Takeover**: Detect when customers want to talk to a human agent
- **Mini CRM**: Contact management with lead tracking
- **Automation**: Auto-reply, keyword responses, business hours logic
- **Real-time Updates**: Socket.io for live message updates

## Tech Stack

- **Backend**: Node.js + NestJS
- **Database**: PostgreSQL with Prisma ORM
- **Frontend**: Next.js 14 (App Router) + Tailwind CSS
- **UI Components**: ShadCN UI
- **Auth**: JWT (email & password)
- **WhatsApp**: Baileys (self-hosted Web Gateway)
- **AI**: OpenAI GPT-4 API

## Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

## Quick Start

### 1. Clone and Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend  
cd ../frontend
npm install
```

### 2. Database Setup

```bash
cd backend

# Create PostgreSQL database
createdb business_support

# Copy environment file
cp .env.example .env

# Edit .env with your database credentials
# Required: DATABASE_URL, JWT_SECRET, OPENAI_API_KEY

# Run migrations
npx prisma migrate dev

# Seed demo data (optional)
npx prisma seed
```

### 3. Start Backend

```bash
cd backend
npm run start:dev
```

Backend runs on http://localhost:5013

### 4. Start Frontend

```bash
cd frontend
npm run dev
```

Frontend runs on http://localhost:5012

### 5. Login

Default demo credentials:
- Email: admin@kryros.chat
- Password: admin123

## WhatsApp Gateway Setup

1. Login to the dashboard
2. Navigate to "📱 WhatsApp Gateway" in the sidebar
3. Click "Connect WhatsApp" button
4. A QR code will appear
5. Open WhatsApp on your phone → Settings → Linked Devices
6. Scan the QR code
7. Wait for connection to establish

Once connected, you can:
- View all conversations in real-time
- Send and receive messages
- AI will automatically respond to incoming messages
- If customer types "talk to human", "agent", etc., human takeover mode activates

## Environment Variables

### Backend (.env)

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/business_support"

# JWT
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRES_IN=7d

# OpenAI
OPENAI_API_KEY=sk-...

# App
PORT=5013
NODE_ENV=development
CORS_ORIGIN=http://localhost:5012
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:5013/api/v1
```

## API Documentation

Once the backend is running, visit:
- Swagger UI: http://localhost:5013/api/docs

## Project Structure

```
backend/
├── src/
│   ├── auth/              # JWT authentication
│   ├── contacts/          # CRM contacts
│   ├── messages/          # Message management
│   ├── conversations/     # Conversation handling
│   ├── automation/        # Automation rules
│   ├── ai/                # AI service (OpenAI)
│   ├── whatsapp-gateway/ # WhatsApp Baileys integration
│   ├── events/           # Socket.io gateway
│   ├── settings/         # Organization settings
│   ├── webhooks/         # Platform webhooks
│   └── prisma/           # Database schema

frontend/
├── src/
│   ├── app/
│   │   ├── auth/         # Login/Register pages
│   │   └── dashboard/   # Main dashboard
│   │       ├── inbox/    # Unified inbox
│   │       ├── contacts/ # CRM contacts
│   │       ├── automation/
│   │       ├── ai-chatbot/
│   │       ├── whatsapp-gateway/
│   │       └── settings/
│   ├── components/       # Reusable UI components
│   ├── lib/              # Utilities
│   └── providers/        # React context providers
```

## Deployment

### Production Build

```bash
# Backend
cd backend
npm run build
npm run start:prod

# Frontend
cd frontend
npm run build
npm start
```

### Docker (Optional)

Create a `docker-compose.yml` in the root:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:14
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
      POSTGRES_DB: business_support
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build: ./backend
    ports:
      - "5013:5013"
    environment:
      DATABASE_URL: postgresql://user:password@postgres:5432/business_support
    depends_on:
      - postgres

  frontend:
    build: ./frontend
    ports:
      - "5012:3000"

volumes:
  postgres_data:
```

## Reseller Deployment

For multi-client deployment:

1. Use environment variables to configure per-client:
   - `CLIENT_NAME`
   - `CLIENT_DOMAIN`
   - `WHATSAPP_SESSION_PATH`

2. Each client gets their own:
   - Database schema or database
   - WhatsApp session
   - API keys configuration

3. Use reverse proxy (nginx) for domain routing

## License

MIT License - See LICENSE file for details.
