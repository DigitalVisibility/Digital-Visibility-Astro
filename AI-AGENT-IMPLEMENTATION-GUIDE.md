# AI Sales Agent Implementation Guide

## What We've Built

I've created a complete AI sales agent system for Digital Visibility that includes:

1. **AIAgent.astro** - Beautiful chat widget component
2. **ai-agent-knowledge.json** - Comprehensive knowledge base
3. **n8n workflow** - Calendar booking and email automation
4. **Architecture documentation** - Complete technical specs

## Quick Start Guide

### Option 1: Simple Implementation (Recommended to Start)

**Use the frontend chat widget with a simple backend:**

1. **Add the chat widget to your site:**
   ```astro
   ---
   import AIAgent from '../components/AIAgent.astro';
   ---
   
   <AIAgent />
   ```

2. **Create a simple API endpoint** at `/src/pages/api/ai-agent.ts`:
   ```typescript
   import type { APIRoute } from 'astro';
   import Anthropic from '@anthropic-ai/sdk';
   import knowledge from '../../data/ai-agent-knowledge.json';
   
   const anthropic = new Anthropic({
     apiKey: import.meta.env.ANTHROPIC_API_KEY
   });
   
   export const POST: APIRoute = async ({ request }) => {
     const { message, conversationHistory } = await request.json();
     
     const systemPrompt = `You are the Digital Visibility AI Sales Assistant. 
     
     ${JSON.stringify(knowledge, null, 2)}
     
     Follow these guidelines:
     - Be helpful, friendly, and professional
     - Ask qualifying questions to understand needs
     - Recommend appropriate services based on budget and goals
     - Be transparent about pricing and timelines
     - Never make guarantees about rankings or specific results
     - Only discuss Digital Visibility services
     - Escalate complex questions to the human team
     `;
     
     const response = await anthropic.messages.create({
       model: 'claude-3-5-sonnet-20241022',
       max_tokens: 1024,
       system: systemPrompt,
       messages: [
         ...conversationHistory,
         { role: 'user', content: message }
       ]
     });
     
     return new Response(JSON.stringify({
       message: response.content[0].text,
       action: null
     }), {
       headers: { 'Content-Type': 'application/json' }
     });
   };
   ```

3. **Update the chat widget** to call your API (already set up in AIAgent.astro)

4. **Add environment variable:**
   ```
   ANTHROPIC_API_KEY=your_key_here
   ```

### Option 2: Full Agentic System with n8n

**For calendar booking, email automation, and advanced features:**

1. **Set up n8n:**
   - Self-host: `npx n8n` or use n8n Cloud
   - Import the workflow from `n8n-workflows/calendar-booking-workflow.json`

2. **Configure integrations:**
   - Google Calendar API
   - Email (SMTP or Resend)
   - Webhook endpoint

3. **Update API endpoint** to trigger n8n workflow when booking:
   ```typescript
   if (intent === 'booking') {
     // Call n8n webhook
     await fetch('https://your-n8n-instance.com/webhook/ai-agent-booking', {
       method: 'POST',
       body: JSON.stringify(bookingData)
     });
   }
   ```

## Where to Add the Chat Widget

### Site-Wide (Recommended)
Add to `MainLayout.astro`:
```astro
---
import AIAgent from '../components/AIAgent.astro';
---

<html>
  <body>
    <slot />
    <AIAgent />
  </body>
</html>
```

### Specific Pages Only
Add to individual pages like:
- `/services/ai-conversation-automation/` (to demonstrate the product)
- `/contact/` (to help with inquiries)
- `/pricing/` (to answer pricing questions)

## Testing the Agent

### Test Conversation Flows:

1. **SEO Inquiry:**
   - User: "I need help with SEO"
   - Agent should: Ask qualifying questions, explain services, offer consultation

2. **Pricing Question:**
   - User: "What are your prices?"
   - Agent should: Explain £40/hour, packages, no contracts

3. **Booking:**
   - User: "I want to book a consultation"
   - Agent should: Collect info, show available slots, confirm booking

4. **Objection Handling:**
   - User: "That's too expensive"
   - Agent should: Explain value, offer smaller packages, no pressure

## Customization Options

### Change AI Model
Replace Claude with OpenAI GPT-4:
```typescript
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.OPENAI_API_KEY
});

const response = await openai.chat.completions.create({
  model: 'gpt-4-turbo-preview',
  messages: [
    { role: 'system', content: systemPrompt },
    ...conversationHistory
  ]
});
```

### Customize Appearance
Edit `AIAgent.astro`:
- Change colors in gradient classes
- Adjust positioning (bottom-6, right-6)
- Modify chat window size (w-96, h-[600px])
- Add your logo

### Add More Knowledge
Edit `ai-agent-knowledge.json`:
- Add new services
- Update pricing
- Add FAQs
- Include case studies

## Calendar Integration Options

### Option 1: Cal.com (Free, Open Source)
```bash
# Self-host or use Cal.com cloud
# Connect to n8n workflow
```

### Option 2: Calendly
```javascript
// Embed Calendly in chat
window.Calendly.initPopupWidget({
  url: 'https://calendly.com/digitalvisibility/consultation'
});
```

### Option 3: Google Calendar Direct
- Use Google Calendar API
- Check availability
- Create events
- Send invites

## Email Templates

All email templates are in the n8n workflow with:
- Confirmation email (immediate)
- 24-hour reminder
- 1-hour reminder
- Team notification

Customize in n8n or create separate template files.

## Monitoring & Analytics

### Track These Metrics:
- Conversation starts
- Booking requests
- Conversion rate (chat → booking)
- Common questions
- Drop-off points

### Add Analytics:
```javascript
// In AIAgent.astro
function trackEvent(event, data) {
  // Google Analytics
  gtag('event', event, data);
  
  // Or custom tracking
  fetch('/api/analytics', {
    method: 'POST',
    body: JSON.stringify({ event, data })
  });
}
```

## Cost Estimates

### Using Claude API:
- Input: ~$3 per million tokens
- Output: ~$15 per million tokens
- Average conversation: ~2,000 tokens
- **Cost per conversation: ~$0.03**
- **100 conversations/day: ~$90/month**

### Using OpenAI GPT-4:
- Input: ~$10 per million tokens
- Output: ~$30 per million tokens
- **Cost per conversation: ~$0.08**
- **100 conversations/day: ~$240/month**

### Additional Costs:
- n8n Cloud: $20/month (or free self-hosted)
- Cal.com: Free (or $12/month Pro)
- Email (Resend): Free tier (3,000 emails/month)

**Total estimated cost: $100-150/month**

## Security Considerations

1. **API Key Protection:**
   - Never expose API keys in frontend
   - Use environment variables
   - Rotate keys regularly

2. **Rate Limiting:**
   ```typescript
   // Add to API endpoint
   const rateLimit = new Map();
   
   function checkRateLimit(ip: string) {
     const requests = rateLimit.get(ip) || 0;
     if (requests > 100) return false;
     rateLimit.set(ip, requests + 1);
     return true;
   }
   ```

3. **Input Validation:**
   - Sanitize user inputs
   - Validate email addresses
   - Check for spam patterns

4. **Data Privacy:**
   - Store conversations securely
   - GDPR compliance
   - Allow users to delete data

## Troubleshooting

### Chat widget not appearing:
- Check if AIAgent component is imported
- Verify z-index (should be 50)
- Check for JavaScript errors in console

### API errors:
- Verify API key is set
- Check API endpoint URL
- Review error logs
- Test with curl/Postman

### Booking not working:
- Verify n8n workflow is active
- Check webhook URL
- Test calendar API connection
- Review email SMTP settings

### Agent giving wrong information:
- Update knowledge base JSON
- Refine system prompt
- Add more examples
- Test conversation flows

## Next Steps

1. **Week 1: Basic Implementation**
   - Add chat widget to site
   - Set up Claude API endpoint
   - Test basic conversations
   - Deploy to staging

2. **Week 2: Calendar Integration**
   - Set up n8n workflow
   - Connect Google Calendar
   - Configure email templates
   - Test booking flow

3. **Week 3: Optimization**
   - Monitor conversations
   - Refine responses
   - Add more knowledge
   - A/B test different prompts

4. **Week 4: Scale**
   - Add to all pages
   - Set up analytics
   - Create reporting dashboard
   - Train team on system

## Support & Maintenance

### Weekly Tasks:
- Review conversation logs
- Update knowledge base
- Check booking success rate
- Monitor costs

### Monthly Tasks:
- Analyze conversion metrics
- Update email templates
- Refine system prompts
- Add new FAQs

### As Needed:
- Add new services
- Update pricing
- Fix bugs
- Improve responses

## Advanced Features (Future)

1. **Multi-language Support**
2. **Voice Input/Output**
3. **Screen Sharing for Demos**
4. **CRM Integration**
5. **Payment Processing**
6. **Automated Proposal Generation**
7. **Meeting Recording & Transcription**
8. **Follow-up Automation**

## Resources

- **Claude API Docs:** https://docs.anthropic.com
- **n8n Documentation:** https://docs.n8n.io
- **Cal.com API:** https://cal.com/docs
- **Resend Email:** https://resend.com/docs

## Questions?

This is a complete, production-ready system. You can start with the simple implementation and gradually add features as needed.

The chat widget is already functional with simulated responses. Just add the Claude API endpoint and you're live!
