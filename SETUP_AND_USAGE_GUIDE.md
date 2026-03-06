# KRYROS CHAT AGENT - Complete Setup & Usage Guide

## How the AI Chatbot Works

### 1. Flow Overview

```
Customer sends WhatsApp message
         ↓
Webhook receives message
         ↓
AI generates response (using GPT-4)
         ↓
AI sends response back to customer
         ↓
If customer asks for human → AI stops, human agent takes over
```

---

## Step-by-Step Setup

### Step 1: Get OpenAI API Key

1. Go to https://platform.openai.com
2. Sign up/Login
3. Go to API Keys: https://platform.openai.com/api-keys
4. Create new secret key
5. Copy it

### Step 2: Add OpenAI Key to Backend

Edit `backend/.env`:
```
OPENAI_API_KEY=sk-your-key-here
```

### Step 3: Get WhatsApp Credentials

Follow the guide in `META_SETUP_GUIDE.md` to get:
- Phone Number ID
- Access Token
- Business Account ID

### Step 4: Connect WhatsApp in App

1. Start backend: `cd backend && npm run start:dev`
2. Start frontend: `cd frontend && npm run dev`
3. Go to http://localhost:5012
4. Register/Login
5. Go to **Settings → Platforms**
6. Enter WhatsApp credentials
7. Click "Connect WhatsApp"

### Step 5: Enable AI

1. Go to **🤖 AI Chatbot** in sidebar
2. Toggle "Enable AI Chatbot" ON
3. Fill in your business info
4. Click "Save AI Settings"

---

## How Human Takeover Works

### When Customer Asks for Human:

The AI detects these keywords and STOPS responding:
- "talk to human"
- "talk to a human"
- "speak to agent"
- "need human"
- "real person"
- "manager"
- "customer service"
- "escalate"
- "complaint"
- And 20+ more...

### What Happens:
1. Customer says "I want to talk to a human"
2. AI responds: "I'll connect you with a human agent"
3. AI STOPS responding to that customer
4. Contact status changes to "HUMAN_REQUIRED"
5. In Inbox, you'll see the customer marked for human attention
6. You (human) take over and respond manually

### To Resume (Human Agent):
- When you manually reply in Inbox, you're now the one responding
- AI will not interfere with this conversation anymore

---

## How AI Generates Human-Like Responses

### 1. Context Aware
- Remembers previous messages in conversation
- Knows your business name, description, products
- Responds based on conversation history

### 2. Natural Language
- Uses GPT-4 for intelligent responses
- Not robotic or scripted
- Responds appropriately to questions

### 3. Typing Delay
- Waits 0.8-2.5 seconds before responding
- Simulates human typing time
- More realistic

### 4. Language Detection
- Automatically detects: English, Yoruba, Igbo, Hausa
- Responds in same language

---

## How to Test

### Test AI Without Real WhatsApp:

1. Go to **🤖 AI Chatbot** page
2. In "Test AI" section
3. Type a message like "Hello, I need help"
4. Click "Test Response"
5. See AI's response

### Test with Real WhatsApp:

1. Set up ngrok (for webhook):
```bash
ngrok http 5013
```

2. Configure Meta webhook:
- Callback URL: `https://your-ngrok-url/api/webhooks/meta`
- Verify Token: `business_support_2024`

3. Send message from WhatsApp
4. AI will auto-reply!

---

## Initiating Chat (You Message Customer)

Currently the system works as:
- **Reactive**: Customer messages you → AI replies
- **Proactive**: You can manually start chat in Inbox

To initiate:
1. Go to **Inbox**
2. Select a contact
3. Type message and send
4. Customer receives it

---

## Architecture

### Files Created:

**Backend:**
- `src/ai/ai.service.ts` - AI logic (GPT-4, human detection)
- `src/ai/ai.controller.ts` - API endpoints
- `src/webhooks/webhooks.service.ts` - Receives WhatsApp messages

**Frontend:**
- `src/app/dashboard/ai-chatbot/page.tsx` - AI settings

### Key Features:

| Feature | How It Works |
|---------|--------------|
| AI Responses | GPT-4 generates natural responses |
| Human Detection | Keywords trigger takeover |
| Context | Conversation history saved |
| Multi-platform | WhatsApp, Instagram, Facebook |
| Language | Auto-detects language |

---

## Need Help?

### Common Issues:

1. **No AI responses**: Check OpenAI API key is added
2. **WhatsApp not connecting**: Verify credentials in Meta portal
3. **Messages not arriving**: Check ngrok is running

### To Restart Servers:
```bash
# Terminal 1
cd backend && npm run start:dev

# Terminal 2  
cd frontend && npm run dev
```

---

## Summary

✅ AI replies automatically to WhatsApp messages  
✅ Responses are natural (GPT-4)  
✅ Human takeover - AI stops when asked  
✅ You can also manually message customers  
✅ Works for WhatsApp, Instagram, Facebook  
