# n8n AI Agent Calendar Booking Setup Guide

## Overview
This workflow automates consultation bookings through your AI chat agent, integrating with Google Workspace Calendar and Resend for email notifications.

## Workflow File
`ai-agent-calendar-booking-resend.json`

## Prerequisites

### 1. n8n Installation
- Self-hosted n8n instance OR n8n Cloud account
- Access to n8n workflow editor

### 2. Google Workspace Calendar
- Google Workspace account with Calendar API enabled
- OAuth2 credentials for Google Calendar

### 3. Resend API
- Resend account (resend.com)
- Verified domain: `updates.digitalvisibility.com`
- API key stored in `.env` file

### 4. Environment Variables
Add to your n8n environment or `.env` file:
```bash
RESEND_API_KEY=re_your_actual_api_key_here
```

## Setup Instructions

### Step 1: Import Workflow to n8n

1. Open your n8n instance
2. Click "Workflows" → "Import from File"
3. Select `ai-agent-calendar-booking-resend.json`
4. Click "Import"

### Step 2: Configure Google Calendar Credentials

1. In the workflow, click on the "Create Google Calendar Event" node
2. Click "Credentials" → "Create New"
3. Select "Google Calendar OAuth2 API"
4. Follow the OAuth2 setup process:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Enable Google Calendar API
   - Create OAuth2 credentials
   - Add authorized redirect URIs for n8n
   - Copy Client ID and Client Secret to n8n
5. Authorize the connection
6. Select your primary calendar

### Step 3: Configure Resend API

The workflow uses HTTP Request nodes to call Resend API. Ensure:

1. Your `RESEND_API_KEY` environment variable is set
2. Domain `updates.digitalvisibility.com` is verified in Resend dashboard
3. DNS records (SPF, DKIM, DMARC) are configured

### Step 4: Test the Workflow

1. Click "Execute Workflow" in n8n
2. Send a test POST request to the webhook URL:

```bash
curl -X POST https://your-n8n-instance.com/webhook/ai-agent-booking \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "+44 1234 567890",
    "company": "Test Company",
    "service_interest": "AI Automation",
    "preferred_date": "2025-01-20",
    "preferred_time": "14:00",
    "notes": "This is a test booking"
  }'
```

3. Check that:
   - ✅ Calendar event is created
   - ✅ Confirmation email is sent to customer
   - ✅ Notification email is sent to support@digitalvisibility.com
   - ✅ Webhook returns success response

### Step 5: Activate the Workflow

1. Click the toggle switch to "Active"
2. Note the webhook URL for your AI chat integration

## Webhook URL

Once activated, your webhook URL will be:
```
https://your-n8n-instance.com/webhook/ai-agent-booking
```

## Expected Payload

The AI chat agent should send this JSON structure:

```json
{
  "name": "Client Name",
  "email": "client@example.com",
  "phone": "+44 1234 567890",
  "company": "Company Name",
  "service_interest": "AI Automation | SEO | Digital Marketing | etc.",
  "preferred_date": "2025-01-20",
  "preferred_time": "14:00",
  "notes": "Additional notes from conversation"
}
```

## Workflow Features

### Immediate Actions
1. ✅ Validates booking data
2. ✅ Creates Google Calendar event with Google Meet link
3. ✅ Sends confirmation email to customer (Resend)
4. ✅ Sends notification to support team (Resend)
5. ✅ Returns booking confirmation to chat agent

### Scheduled Reminders
1. ⏰ 24-hour reminder email (sent 24h before appointment)
2. ⏰ 1-hour reminder email (sent 1h before appointment)

## Email Templates

All emails are sent from: `noreply@updates.digitalvisibility.com`

### Confirmation Email
- Booking details
- Google Meet link
- What to expect
- Preparation tips

### 24-Hour Reminder
- Friendly reminder
- Meeting details
- Quick link to join

### 1-Hour Reminder
- Urgent reminder
- Direct join link
- Last-minute checklist

### Team Notification
- Complete booking details
- Client information
- Calendar event link

## Troubleshooting

### Calendar Event Not Creating
- Check Google Calendar OAuth2 credentials
- Verify calendar permissions
- Ensure date/time format is correct (ISO 8601)

### Emails Not Sending
- Verify `RESEND_API_KEY` environment variable
- Check domain verification in Resend dashboard
- Review DNS records (SPF, DKIM, DMARC)
- Check Resend API logs for errors

### Webhook Not Responding
- Ensure workflow is "Active"
- Check n8n logs for errors
- Verify webhook URL is correct
- Test with curl command

### Reminders Not Sending
- Check "Wait" node configurations
- Ensure workflow execution doesn't time out
- Verify date/time calculations are correct

## Integration with AI Chat Agent

To integrate with your AI chat widget:

1. Configure the chat agent to collect:
   - Name, email, phone
   - Company name
   - Service interest
   - Preferred date and time
   - Additional notes

2. When booking is confirmed by user, POST to webhook URL

3. Handle the response:
```json
{
  "success": true,
  "booking_id": "DV-1705152000000",
  "message": "Consultation booked successfully! Check your email for confirmation.",
  "details": {
    "date": "2025-01-20",
    "time": "14:00",
    "meeting_link": "https://meet.google.com/xxx-xxxx-xxx"
  }
}
```

4. Display confirmation message to user with meeting link

## Monitoring

### n8n Executions
- Monitor workflow executions in n8n dashboard
- Check for failed executions
- Review execution logs

### Resend Dashboard
- Monitor email delivery rates
- Check for bounces or complaints
- Review API usage

### Google Calendar
- Verify events are being created correctly
- Check for scheduling conflicts
- Monitor Google Meet link generation

## Support

For issues or questions:
- Email: support@digitalvisibility.com
- Phone: +44 01792 002 497

## Version History

- **v2.0** (2025-01-13): Updated to use Resend API instead of SMTP
- **v1.0** (2025-01-12): Initial version with SMTP email
