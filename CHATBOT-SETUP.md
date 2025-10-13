# AI Chatbot Setup Guide - Claude Sonnet 4.5

## ✅ What's Been Implemented

Your AI chatbot is now connected to **Claude Sonnet 4.5** (the latest and most capable model) with:

- ✅ Real AI conversations (not keyword-based)
- ✅ Complete business knowledge (services, pricing, offers)
- ✅ Short, concise responses (5th grade reading level)
- ✅ Bullet points for easy scanning
- ✅ Professional, friendly tone
- ✅ Conversation memory (remembers context)

---

## 🚀 Setup Instructions

### Step 1: Install Anthropic SDK

```bash
npm install @anthropic-ai/sdk
```

### Step 2: Add API Key to .env

Add this line to your `.env` file:

```bash
ANTHROPIC_API_KEY=your_api_key_here
```

**Get your API key:**
1. Go to: https://console.anthropic.com/
2. Sign up or log in
3. Go to "API Keys" section
4. Create a new key
5. Copy and paste it into your `.env` file

### Step 3: Test Locally

```bash
npm run dev
```

Visit: `http://localhost:4321/services/ai-workflow-automation/`

Click the chat icon in the bottom-right corner and test:
- "Tell me about your free website offer"
- "How much does SEO cost?"
- "I want to book a consultation for tomorrow"
- "What can you automate?"

### Step 4: Deploy

Once tested locally, deploy as normal:

```bash
git add .
git commit -m "Add Claude Sonnet 4.5 AI chatbot integration"
git push
```

Make sure your hosting platform (Vercel/Netlify) has the `ANTHROPIC_API_KEY` environment variable set!

---

## 📊 What the AI Knows

The chatbot has been trained with:

### Services:
- SEO, AEO, GEO, SBO (Supercharged Engine Optimization)
- AI Workflow Automation
- Website Design & Development
- Digital Marketing

### Pricing:
- £40/hour standard rate
- Starter: £200/month (5 hours)
- Growth: £400/month (10 hours) - Most popular
- Accelerated: £800/month (20 hours)
- Enterprise: £1,600+/month (custom)

### Free Website Offer:
- Professional website FREE (worth £2,000+)
- Requires 1-year commitment (minimum £200/month)
- If you cancel before 1 year, you don't keep the website
- After 1 year, the website is yours forever
- Includes responsive design, SEO-ready, contact forms

### Booking:
- Free 30-minute consultations
- Calendar: https://calendar.app.google/jwi4bhf54UUxD9tg9
- Phone: 01792 002 497
- Hours: Monday-Friday, 9am-5pm

### Locations:
- Swansea (headquarters)
- Cardiff, Newport, Carmarthen, Wrexham, Birmingham
- Wales-wide, UK-wide

---

## 🎯 Response Style

The AI is configured to:

- ✅ Write at 5th grade reading level
- ✅ Keep responses SHORT (2-4 sentences max)
- ✅ Use bullet points for lists
- ✅ Be conversational and friendly
- ✅ No jargon or complex words
- ✅ Get straight to the point
- ✅ Max 100 words per response (usually)
- ✅ Max 500 tokens per response (enforced)

**Example response:**
```
Our SEO services help you rank on Google and AI platforms like ChatGPT.

Pricing:
• £40/hour (no contracts)
• Most clients: £400-800/month
• Includes free website

Want to book a free consultation?
```

---

## 💰 Cost Estimate

**Claude Sonnet 4.5 Pricing:**
- Input: ~$3 per million tokens
- Output: ~$15 per million tokens

**Typical Usage:**
- 100 conversations/day
- 10 messages per conversation
- **Estimated cost: £10-25/month**

Much cheaper than hiring a customer service person!

---

## 🔧 Customization

### To Update Business Info:

Edit: `src/pages/api/ai-agent.ts`

Find the `SYSTEM_PROMPT` constant and update:
- Services
- Pricing
- Offers
- Contact details
- Locations

### To Change Response Style:

In `SYSTEM_PROMPT`, modify the "COMMUNICATION STYLE" section:
- Reading level
- Response length
- Tone
- Format

### To Adjust Response Length:

In `ai-agent.ts`, change:
```typescript
max_tokens: 500, // Increase for longer responses
```

---

## 🐛 Troubleshooting

### "API Key not found" error:
- Check `.env` file has `ANTHROPIC_API_KEY=...`
- Restart dev server after adding key
- On production, add key to hosting platform environment variables

### Chatbot not responding:
- Check browser console for errors
- Verify API endpoint is accessible: `/api/ai-agent`
- Check Anthropic API status: https://status.anthropic.com/

### Responses too long:
- Reduce `max_tokens` in `ai-agent.ts`
- Update system prompt to be more strict about brevity

### Wrong information:
- Update `SYSTEM_PROMPT` in `ai-agent.ts`
- Be specific about what the AI should/shouldn't say

---

## 📈 Next Steps (Optional)

### 1. Add n8n Booking Integration
Connect the chatbot to your n8n workflow to automatically book consultations.

### 2. Add to More Pages
Currently only on `/services/ai-workflow-automation/`

To add to other pages:
```astro
---
import AIAgent from '../../components/AIAgent.astro';
---

<!-- At bottom of page, before </MainLayout> -->
<AIAgent />
```

### 3. Analytics
Track chatbot usage:
- Number of conversations
- Most asked questions
- Conversion rate (chat → booking)

### 4. A/B Testing
Test different:
- Welcome messages
- Quick action buttons
- Response styles

---

## 🎉 You're Done!

Your AI chatbot is now live and ready to:
- Answer questions 24/7
- Provide accurate pricing
- Explain services
- Help book consultations
- Never sleep, never complain, never ask for a raise!

**Test it thoroughly before going live!**
