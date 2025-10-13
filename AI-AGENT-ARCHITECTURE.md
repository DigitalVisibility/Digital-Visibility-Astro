# Digital Visibility AI Sales Agent Architecture

## Overview
A comprehensive agentic AI chatbot that handles sales, qualification, booking, and customer support for Digital Visibility's services.

## Core Capabilities

### 1. Knowledge Base
- **Services:** SEO, AEO, GEO, SBO, AI Workflow Automation, Digital Marketing, App Development, Product Design
- **Pricing:** £40/hour standard, £80-120/hour specialist, package deals, yearly discounts
- **Locations:** All UK cities we serve (Swansea, Cardiff, London, Manchester, etc.)
- **Company Info:** Award-winning team, Royal Academy of Engineering award, transparent pricing, no contracts
- **Process:** How we work, what clients can expect, timelines, deliverables

### 2. Sales Qualification
- Identify visitor needs
- Determine budget range
- Assess project scope
- Recommend appropriate service/package
- Calculate potential ROI

### 3. Calendar Booking
- Check availability
- Book consultation slots
- Send confirmation emails
- Send reminder emails (24h, 1h before)
- Handle rescheduling requests

### 4. Email Automation
- Welcome email with booking details
- Pre-meeting preparation email
- Post-meeting follow-up
- Proposal delivery
- Nurture sequences for not-ready-yet leads

### 5. Guardrails & Constraints
- Only discuss Digital Visibility services
- No competitor comparisons
- No guarantees on rankings/results
- Transparent about pricing
- Honest about timelines
- Redirect complex questions to human team

## Technical Stack Options

### Option A: Voiceflow + n8n (RECOMMENDED)
**Pros:**
- Visual workflow builder
- Easy to maintain
- Powerful integrations
- Custom API connections

**Components:**
- Voiceflow: Conversation flow & NLU
- n8n: Backend automation (calendar, email, CRM)
- OpenAI/Claude: LLM for natural responses
- Cal.com/Calendly: Calendar system
- Resend/SendGrid: Email delivery

### Option B: Custom Build (Claude API + MCP)
**Pros:**
- Full control
- Latest MCP capabilities
- Can showcase your own tech

**Components:**
- Claude API with MCP
- Custom React chat widget
- n8n for automations
- Supabase for data storage

### Option C: Hybrid (Custom Frontend + Voiceflow Backend)
**Pros:**
- Best of both worlds
- Custom UI matching your brand
- Voiceflow's powerful backend

## Implementation Plan

### Phase 1: Knowledge Base (Week 1)
1. Extract all service information
2. Create structured knowledge documents
3. Format for AI consumption
4. Include pricing, locations, processes

### Phase 2: Core Chatbot (Week 1-2)
1. Design conversation flows
2. Build qualification logic
3. Implement service recommendations
4. Add ROI calculator logic
5. Test conversation paths

### Phase 3: Calendar Integration (Week 2)
1. Set up Cal.com or Calendly
2. Connect to n8n
3. Build booking workflow
4. Test availability checking
5. Implement confirmation system

### Phase 4: Email Automation (Week 2-3)
1. Design email templates
2. Build n8n workflows
3. Set up reminder system
4. Create nurture sequences
5. Test all triggers

### Phase 5: Deployment (Week 3)
1. Embed on AI Workflow Automation page
2. Add site-wide widget option
3. Set up analytics
4. Monitor conversations
5. Iterate based on feedback

## Conversation Flow Example

```
Agent: Hi! I'm the Digital Visibility AI assistant. I help businesses find the right digital marketing solutions. What brings you here today?

User: I need help with SEO

Agent: Great! SEO is one of our core services. To recommend the best approach, can I ask:
1. Where is your business located?
2. Are you looking for local SEO or national visibility?
3. What's your current situation - new website or existing site that needs improvement?

User: I'm in Manchester, need local SEO, existing site

Agent: Perfect! We have extensive experience with Manchester businesses. Our local SEO services include:
- Google Business Profile optimization
- Local citation building
- Location-specific content
- Review management

Based on typical Manchester projects, most clients see results in 3-6 months with our Growth package (10 hours/month at £40/hour = £400/month).

Would you like to:
A) Book a free 30-minute consultation to discuss your specific needs?
B) Learn more about our pricing and packages?
C) See case studies from other Manchester businesses?

User: Book consultation

Agent: Excellent! I can help you schedule that right now. 

Our consultations are:
- 30 minutes via video call
- Completely free, no obligation
- We'll analyze your current site
- Provide actionable recommendations
- Answer all your questions

What day works best for you this week?
[Shows available slots]

User: Thursday 2pm

Agent: Perfect! I've booked you for Thursday at 2pm GMT.

You'll receive:
✅ Confirmation email with video call link (sent now)
✅ Reminder email 24 hours before
✅ Reminder email 1 hour before

Before the call, it would help if you could:
- Have your website URL ready
- Think about your main business goals
- Note any specific concerns or questions

Is there anything specific you'd like us to prepare for the consultation?

User: No, that's great

Agent: Wonderful! You're all set for Thursday at 2pm. Check your email for the confirmation.

In the meantime, you might find these helpful:
- Our SEO Manchester page: [link]
- Pricing details: [link]
- Client success stories: [link]

Looking forward to speaking with you on Thursday! 🚀
```

## Knowledge Base Structure

### services.json
```json
{
  "seo": {
    "name": "SEO Services",
    "description": "Search engine optimization with transparent pricing and no contracts",
    "pricing": {
      "hourly": 40,
      "packages": {
        "starter": { "hours": 5, "monthly": 200 },
        "growth": { "hours": 10, "monthly": 400 },
        "accelerated": { "hours": 20, "monthly": 800 }
      }
    },
    "timeline": "4-8 weeks for initial improvements, 3-6 months for significant results",
    "includes": [
      "Technical SEO audits",
      "Keyword research",
      "Content optimization",
      "Local SEO",
      "Google Business Profile optimization"
    ]
  },
  "ai_automation": {
    "name": "AI Workflow Automation",
    "description": "Custom AI agents and workflow automation",
    "pricing": {
      "standard": 40,
      "specialist": { "min": 80, "max": 120 }
    },
    "use_cases": [
      "Lead qualification chatbots",
      "Customer support automation",
      "Data entry automation",
      "Report generation",
      "Email response automation"
    ]
  }
}
```

### locations.json
```json
{
  "wales": ["Swansea", "Cardiff", "Newport", "Carmarthen", "Wrexham", "Bangor"],
  "england": ["Birmingham", "Bristol", "Manchester", "London", "Liverpool", "Leeds"],
  "scotland": ["Glasgow", "Edinburgh", "Aberdeen"],
  "northern_ireland": ["Belfast"]
}
```

### company_info.json
```json
{
  "name": "Digital Visibility",
  "tagline": "Award-winning digital agency",
  "founder": "Darran Goulding",
  "awards": ["Royal Academy of Engineering Enterprise Fellow"],
  "differentiators": [
    "No contracts - cancel anytime",
    "Transparent £40/hour pricing",
    "See exactly what work gets done",
    "Real results from our own business (70% efficiency gain)",
    "Award-winning team"
  ],
  "contact": {
    "phone": "+44-01792-002497",
    "email": "support@digitalvisibility.com",
    "address": "235 Peniel Green Road, Llansamlet, Swansea, SA7 9BA"
  }
}
```

## Agent Instructions (System Prompt)

```
You are the Digital Visibility AI Sales Assistant. Your role is to help potential clients find the right digital marketing solutions for their business.

CORE PRINCIPLES:
1. Be helpful, friendly, and professional
2. Ask qualifying questions to understand needs
3. Recommend appropriate services based on budget and goals
4. Be transparent about pricing and timelines
5. Never make guarantees about rankings or specific results
6. Only discuss Digital Visibility services
7. Escalate complex questions to the human team

KNOWLEDGE:
- You have access to information about all Digital Visibility services
- Pricing: £40/hour standard, £80-120/hour specialist
- Locations: We serve all UK cities
- No contracts, cancel anytime policy
- Free 30-minute consultations available

CAPABILITIES:
- Answer questions about services
- Calculate ROI and pricing estimates
- Book consultation appointments
- Provide case studies and examples
- Explain processes and timelines

GUARDRAILS:
- Never compare to competitors
- Don't guarantee specific rankings or results
- Don't discuss services we don't offer
- Don't provide technical implementation details
- Redirect complex technical questions to consultation

BOOKING PROCESS:
1. Confirm they want to book
2. Explain what the consultation includes
3. Show available time slots
4. Collect: name, email, phone, company name
5. Confirm booking details
6. Send confirmation email

TONE:
- Conversational but professional
- Enthusiastic but not pushy
- Honest and transparent
- Use UK English spelling
- No emojis in formal communications (emails)
- Emojis OK in chat for friendliness

RESPONSE FORMAT:
- Keep responses concise (2-4 sentences)
- Use bullet points for lists
- Ask one question at a time
- Provide clear next steps
```

## n8n Workflow: Calendar Booking

```
TRIGGER: Webhook from chatbot (booking confirmed)

INPUT DATA:
- name
- email
- phone
- company
- preferred_date
- preferred_time
- service_interest
- notes

WORKFLOW:
1. Create event in Cal.com/Google Calendar
2. Generate unique meeting link
3. Send confirmation email (immediate)
4. Schedule reminder email (24h before)
5. Schedule reminder email (1h before)
6. Add to CRM (optional)
7. Notify team on Slack/email
8. Return booking confirmation to chatbot

ERROR HANDLING:
- If slot unavailable, return alternative times
- If email fails, retry 3 times
- Log all bookings to database
```

## Next Steps

1. **Choose Technical Stack:** Voiceflow + n8n recommended for speed
2. **Set Up Calendar:** Cal.com (free, open-source) or Calendly
3. **Create Knowledge Base:** Extract from existing pages
4. **Build Conversation Flows:** Start with qualification → booking
5. **Set Up Email Templates:** Confirmation, reminders, follow-ups
6. **Build n8n Workflows:** Calendar + email automation
7. **Test Thoroughly:** Multiple conversation paths
8. **Deploy:** Start on AI Automation page, expand site-wide
9. **Monitor & Iterate:** Track conversations, improve responses

## Success Metrics

- Consultation booking rate
- Qualification accuracy
- Response time
- User satisfaction
- Conversion to paid clients
- Time saved vs human sales team

## Estimated Timeline

- **Week 1:** Knowledge base + core chatbot
- **Week 2:** Calendar integration + email automation
- **Week 3:** Testing + deployment
- **Ongoing:** Monitoring + optimization

## Cost Estimate

**Using Voiceflow + n8n:**
- Voiceflow: $50/month (Pro plan)
- n8n: Self-hosted (free) or Cloud ($20/month)
- Cal.com: Free (self-hosted) or $12/month
- Resend: Free tier (3,000 emails/month)
- OpenAI API: ~$20-50/month (depends on usage)

**Total: ~$100-150/month**

**ROI:**
- If agent books 5 consultations/month
- 40% convert to clients
- Average client value £400/month
- ROI: £800/month revenue from £150/month cost = 533% ROI
```
