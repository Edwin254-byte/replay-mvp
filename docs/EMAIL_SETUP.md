# Email Setup Guide

## Resend Integration

This application uses [Resend](https://resend.com) for sending email notifications during the interview process.

### Environment Variables Required

Add these to your `.env.local` file:

```bash
RESEND_API_KEY="your-resend-api-key-here"
FROM_EMAIL="no-reply@yourdomain.com"
NEXTAUTH_URL="http://localhost:3000" # Change to your production URL
```

### Resend Setup Steps

1. **Create Resend Account**
   - Go to [resend.com](https://resend.com)
   - Sign up for a free account (100 emails/day limit)

2. **Generate API Key**
   - Navigate to API Keys in your dashboard
   - Click "Create API Key"
   - Copy the API key to `RESEND_API_KEY`

3. **Configure Domain**
   - For testing: Use `onboarding@resend.dev` as `FROM_EMAIL`
   - For production: Add and verify your own domain### Email Flow

The application automatically sends emails at these key moments:

#### 1. Application Start Email (to Applicant)

**Triggered when:** A new applicant creates an application (not for returning users)
**Recipients:** Applicant email
**Content:**

- Welcome message with position title
- Resume interview link for future access
- Professional hiring team signature

#### 2. Application Complete Emails (to Applicant & Manager)

**Triggered when:** Applicant completes all interview questions
**Recipients:** Both applicant and position manager
**Content:**

- **To Applicant:** Confirmation of submission and next steps timeline
- **To Manager:** New completed application notification with review link

### Email Templates

All email templates include:

- Professional HTML formatting
- Responsive design for mobile/desktop
- Clear call-to-action buttons
- Fallback text links
- Brand-consistent styling

### Setup Instructions

1. **Get Resend API Key:**
   - Sign up at [resend.com](https://resend.com)
   - Create a new API key in your dashboard
   - Add key to `RESEND_API_KEY` environment variable

2. **Configure Email Address:**
   - For development: Use `onboarding@resend.dev` as `FROM_EMAIL`
   - For production: Set up domain verification and use your own email
   - Ensure the FROM_EMAIL is properly configured in Resend

3. **Set Base URL:**
   - Update `NEXTAUTH_URL` for your production deployment
   - Used to generate correct links in emails

### Error Handling

- Email failures don't prevent application creation/completion
- All email errors are logged to console
- Users see appropriate success messages regardless of email status
- Graceful degradation ensures core functionality works even if email service is down

### Testing Emails

To test email functionality:

1. Ensure environment variables are set correctly
2. Create a new application (triggers start email)
3. Complete all questions (triggers completion emails)
4. Check console logs for email sending status
5. Verify emails arrive in inbox (check spam folder)

### Troubleshooting

**Common Issues:**

- **401 Unauthorized:** Check `RESEND_API_KEY` is correct
- **Domain not verified:** Use `onboarding@resend.dev` for testing
- **Emails not arriving:** Check spam folder, verify FROM_EMAIL
- **Rate limiting:** Resend free tier has daily limits
