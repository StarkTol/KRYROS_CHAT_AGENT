# KRYROS CHAT AGENT - Complete Meta API Setup Guide

This guide walks you through getting all credentials needed for WhatsApp, Facebook Messenger, and Instagram.

---

## 📋 Table of Contents
1. [Create Meta Developer Account](#1-create-meta-developer-account)
2. [Set Up WhatsApp](#2-set-up-whatsapp)
3. [Set Up Facebook Messenger](#3-set-up-facebook-messenger)
4. [Set Up Instagram](#4-set-up-instagram)
5. [Configure Webhooks](#5-configure-webhooks)

---

## 1. Create Meta Developer Account

### Step 1.1: Go to Meta Developers
Open your browser and go to: **https://developers.facebook.com**

### Step 1.2: Login
- Click "Log In" in the top right
- Use your Facebook account credentials (you need a personal Facebook account)

### Step 1.3: Verify Your Account
- Meta may ask you to verify your identity (phone number, ID)
- Complete the verification process

### Step 1.4: Create an App
1. Click "My Apps" → "Create App"
2. Select **"Consumer"** as the app type
3. Fill in the details:
   - **Display Name**: "Business Support" (or your business name)
   - **Contact Email**: your@email.com
4. Click "Create App"

---

## 2. Set Up WhatsApp

### Step 2.1: Add WhatsApp Product
1. In your app dashboard, scroll to "Add products to your app"
2. Find **WhatsApp** and click "Set up"

### Step 2.2: Get Your Credentials

#### Option A: Quick Test Token (24-hour expiry)
1. Go to **"API Setup"** (left sidebar)
2. Look for **"Temporary Access Token"**
3. Copy it - it expires in ~24 hours

#### Option B: Permanent Token (Recommended)
1. Go to **https://business.facebook.com/settings/system-users**
2. Click "Add System User"
3. Name: "WhatsApp Bot"
4. Role: "Admin" or "Developer"
5. Assign these assets:
   - WhatsApp Business Account
   - Facebook Page (for Messenger)
6. Click "Generate Token"
7. Copy the token

### Step 2.3: Get Phone Number ID
1. Go to **"API Setup"** (left sidebar)
2. Look for **"Phone Numbers"** section
3. You'll see your test phone number
4. Copy the **"Phone Number ID"** (long number like: 123456789012345)

### Step 2.4: Get Business Account ID
1. Go to **"API Setup"** (left sidebar)
2. Look for **"WhatsApp Business Account"**
3. Copy the **"Account ID"** (starts with "BA...")

### Step 2.5: Add a Phone Number (If not already added)
1. Go to **"Phone Numbers"** tab
2. Click **"Add Phone Number"**
3. Fill in:
   - **Phone Number**: Your WhatsApp business number
   - **Country**: Nigeria (or your country)
   - **Timezone**: Africa/Lagos
4. Click "Next"
5. Verify with SMS or call
6. Copy the **"Phone Number ID"** after verification

---

## 3. Set Up Facebook Messenger

### Step 3.1: Add Messenger Product
1. In your Meta app dashboard
2. Scroll to "Add products to your app"
3. Find **Messenger** and click "Set up"

### Step 3.2: Create a Facebook Page (If you don't have one)
1. Go to **https://facebook.com/pages/create**
2. Choose a page type (Business, Brand, Community, etc.)
3. Fill in your business info
4. Complete the setup
Note the5. ** Page ID** (in page URL or page settings)

### Step 3.3: Add Messenger to Your Page
1. Go to your Facebook Page
2. Click "Settings" → "Messenger Platform"
3. Or go to: **https://business.facebook.com/settings/messenger**
4. Add your Facebook Page

### Step 3.4: Get Page Access Token
**Method 1: From Meta Developers**
1. In your app dashboard, go to **Messenger → Settings**
2. Find "Access Tokens" section
3. Click "Add or Remove Pages"
4. Select your Facebook Page
5. A token will be generated
6. Copy the **"Page Access Token"**

**Method 2: From Business Settings**
1. Go to **https://business.facebook.com/settings/system-users**
2. Click on your system user
3. Click "Generate Token"
4. Select your Facebook Page
5. Copy the token

### Step 3.5: Get Page ID
1. Go to your Facebook Page
2. Click "About" (left sidebar)
3. Scroll to "Page ID"
4. Copy it

---

## 4. Set Up Instagram

### Step 4.1: Convert to Business Account
**On Instagram App:**
1. Go to your Instagram profile
2. Tap menu (☰) → Settings → Account
3. Tap "Switch to Professional Account"
4. Select "Business"
5. Connect to your Facebook Page

### Step 4.2: Add Instagram Product to Meta App
1. In your Meta Developer dashboard
2. Scroll to "Add products to your app"
3. Find **"Instagram Graph API"** or **"Instagram"**
4. Click "Set up"

### Step 4.3: Get Instagram Business Account ID
1. Go to **https://business.facebook.com/settings/instagram-accounts**
2. You'll see your connected Instagram accounts
3. Click on your account
4. Copy the **Instagram Business Account ID** (starts with "IG...")

### Step 4.4: Get Access Token
**Option A: System User Token**
1. Go to **https://business.facebook.com/settings/system-users**
2. Create a system user with Instagram permissions
3. Generate token

**Option B: Short-lived Token (1 hour)**
1. Use the Graph API Explorer:
   - Go to **https://developers.facebook.com/tools/explorer**
   - Select your app
   - Permissions: `instagram_basic`, `instagram_manage_messages`, `pages_show_list`
   - Click "Generate Access Token"

**Option C: Long-lived Token (60 days)**
1. Take the short-lived token
2. Exchange it:
```
GET https://graph.facebook.com/v18.0/oauth/access_token?
  grant_type=fb_exchange_token&
  client_id=YOUR_APP_ID&
  client_secret=YOUR_APP_SECRET&
  fb_exchange_token=SHORT_LIVED_TOKEN
```
3. Copy the new token

---

## 5. Configure Webhooks

### Step 5.1: Start Your Backend
```bash
cd backend
npm run start:dev
```

### Step 5.2: Start ngrok
```bash
ngrok http 5013
```
Copy your ngrok URL (e.g., `https://abc123.ngrok.io`)

### Step 5.3: Add Webhook in Meta App

**For WhatsApp:**
1. Go to **Products → Webhooks**
2. Click **"Add Webhook"**
3. Fill:
   - **Callback URL**: `https://YOUR_NGROK_URL/api/webhooks/meta`
   - **Verify Token**: `business_support_2024`
4. Click "Verify and Save"
5. Click **"Add Subscriptions"**
6. Select:
   - `messages`
   - `message_deliveries`
   - `message_reads`
7. Click "Save"

**For Facebook Messenger:**
1. Go to **Products → Webhooks**
2. Click **"Add Webhook"**
3. Fill:
   - **Callback URL**: `https://YOUR_NGROK_URL/api/webhooks/meta`
   - **Verify Token**: `business_support_2024`
4. Click "Verify and Save"
5. Click **"Add Subscriptions"**
6. Select:
   - `messages`
   `message_deliveries`
7. Click "Save"

**For Instagram:**
1. Go to **Products → Instagram Webhooks**
2. Click **"Add Webhook"**
3. Fill:
   - **Callback URL**: `https://YOUR_NGROK_URL/api/webhooks/meta`
   - **Verify Token**: `business_support_2024`
4. Click "Verify and Save"
5. Subscribe to: `messages`

---

## 📝 Credential Summary

Copy all these into your app's Settings → Platforms:

```
WHATSAPP:
├─ Phone Number ID: _____________
├─ Access Token: _____________
└─ Business Account ID: _____________

FACEBOOK:
├─ Page ID: _____________
└─ Page Access Token: _____________

INSTAGRAM:
├─ Account ID: _____________
└─ Access Token: _____________
```

---

## 🧪 Test Your Setup

### Send WhatsApp Test Message:
1. Go to Meta App → WhatsApp → API Setup
2. Under "Send and receive messages", find "To" phone number
3. Click "Send Message"
4. Enter any phone number (your personal number)
5. Send a test message
6. Check your app's **Inbox** - you should see it!

### Send Facebook Messenger Test:
1. Go to your Facebook Page
2. Click "Message" button
3. Send a message to your page
4. Check your app's **Inbox**

### Send Instagram DM Test:
1. Open Instagram app
2. Go to your business profile
3. Send a DM to yourself
4. Check your app's **Inbox**

---

## ❓ Troubleshooting

### "Webhook verification failed"
- Check verify token is `business_support_2024`
- Make sure backend is running
- Make sure ngrok is active

### "Token expired"
- Regenerate token from Meta Developer Portal
- For WhatsApp, you need a long-lived token

### "Phone number not verified"
- WhatsApp numbers must be verified
- Check your phone for SMS/call verification

### "Page not connected"
- Make sure Facebook Page is linked to your Meta App
- Check Business Settings

---

## 🔐 Security Notes

- **Never share your access tokens**
- **Use environment variables** for all credentials in production
- **Rotate tokens regularly**
- **Use webhooks verify token** to secure your endpoint

---

## 📚 Useful Links

- Meta Developer Portal: https://developers.facebook.com
- WhatsApp Documentation: https://developers.facebook.com/docs/whatsapp
- Messenger Documentation: https://developers.facebook.com/docs/messenger
- Instagram Documentation: https://developers.facebook.com/docs/instagram-api
- ngrok: https://ngrok.com
- Graph API Explorer: https://developers.facebook.com/tools/explorer
