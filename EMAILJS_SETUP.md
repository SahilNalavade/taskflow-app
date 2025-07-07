# EmailJS Setup Guide for TaskFlow Invitations

## Overview
This guide will help you set up EmailJS to enable real email invitations in your TaskFlow application. With EmailJS, you can send professional invitation emails to team members with zero backend setup.

## What You Get
- ✅ Real email delivery (200 emails/month free)
- ✅ Professional invitation templates
- ✅ Secure invitation links with expiration
- ✅ Invitation tracking and resend functionality
- ✅ No backend server required

## Step 1: Create EmailJS Account

1. Go to [https://www.emailjs.com/](https://www.emailjs.com/)
2. Click "Sign Up" and create a free account
3. Verify your email address

## Step 2: Add Email Service

1. In your EmailJS dashboard, go to **Email Services**
2. Click **Add New Service**
3. Choose your email provider:
   - **Gmail**: Easiest for personal use
   - **Outlook**: Good for business accounts
   - **Custom SMTP**: For other providers

### For Gmail:
1. Select "Gmail"
2. Click "Connect Account"
3. Sign in with your Google account
4. Allow EmailJS permissions
5. Your service will be created automatically

### For Other Providers:
Follow the provider-specific setup instructions in EmailJS.

## Step 3: Create Email Template

1. Go to **Email Templates** in your EmailJS dashboard
2. Click **Create New Template**
3. Use this template content:

### Template Settings:
- **Template Name**: TaskFlow Team Invitation
- **Subject**: You're invited to join {{team_name}}

### Email Template HTML:
Copy and paste this HTML template (EmailJS uses double curly braces):

```html
<div style="max-width: 600px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">You're Invited!</h1>
    <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Join {{team_name}} on {{app_name}}</p>
  </div>
  
  <div style="background: white; padding: 40px 30px;">
    <p style="font-size: 18px; color: #374151; margin: 0 0 20px 0;">Hi {{to_name}},</p>
    
    <p style="font-size: 16px; color: #6b7280; line-height: 1.6; margin: 0 0 20px 0;">
      <strong>{{from_name}}</strong> has invited you to join <strong>{{team_name}}</strong> as a <strong>{{role}}</strong>.
    </p>
    
    <div style="background: #f8fafc; border-left: 4px solid #3b82f6; padding: 16px; margin: 20px 0;">
      <p style="margin: 0; color: #374151; font-style: italic;">"{{personal_message}}"</p>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="{{invitation_url}}" 
         style="background: #3b82f6; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; font-size: 16px;">
        Accept Invitation
      </a>
    </div>
    
    <p style="font-size: 14px; color: #9ca3af; margin: 20px 0 0 0; text-align: center;">
      This invitation expires in {{expires_in}}. If you have any questions, reply to this email.
    </p>
  </div>
  
  <div style="background: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 12px;">
    <p style="margin: 0;">{{app_name}} - Collaborative Task Management</p>
  </div>
</div>
```

### Alternative Simple Template (if above doesn't work):
If you're still getting variable errors, try this simpler template first:

```html
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1 style="color: #3b82f6;">You're Invited to Join {{team_name}}!</h1>
  
  <p>Hi {{to_name}},</p>
  
  <p>{{from_name}} has invited you to join <strong>{{team_name}}</strong> as a <strong>{{role}}</strong>.</p>
  
  <p style="background: #f0f0f0; padding: 15px; border-radius: 5px;">
    <em>{{personal_message}}</em>
  </p>
  
  <div style="text-align: center; margin: 30px 0;">
    <a href="{{invitation_url}}" style="background: #3b82f6; color: white; padding: 15px 25px; text-decoration: none; border-radius: 5px; display: inline-block;">
      Accept Invitation
    </a>
  </div>
  
  <p style="font-size: 12px; color: #666;">
    This invitation expires in {{expires_in}}. 
    <br>Powered by {{app_name}}
  </p>
</div>
```

### Template Variables:
Make sure these variables are configured in your template:
- `{{to_email}}` - Recipient's email
- `{{to_name}}` - Recipient's name
- `{{from_name}}` - Sender's name
- `{{team_name}}` - Team name
- `{{role}}` - Role being assigned
- `{{personal_message}}` - Optional personal message
- `{{invitation_url}}` - Link to accept invitation
- `{{app_name}}` - Application name (TaskFlow)
- `{{expires_in}}` - Expiration time

## Step 4: Get Your Credentials

1. Go to **Integration** in your EmailJS dashboard
2. Note down these three values:
   - **Service ID**: (e.g., `service_xxxxxxx`)
   - **Template ID**: (e.g., `template_xxxxxxx`)
   - **Public Key**: (e.g., `xxxxxxxxxxxxxxx`)

## Step 5: Update Environment Variables

1. Open your `.env` file in the TaskFlow project
2. Replace the placeholder values:

```env
# EmailJS Configuration
VITE_EMAILJS_SERVICE_ID=service_your_actual_service_id
VITE_EMAILJS_TEMPLATE_ID=template_your_actual_template_id
VITE_EMAILJS_PUBLIC_KEY=your_actual_public_key
```

## Step 6: Test the Setup

1. Restart your development server:
   ```bash
   npm run dev
   ```

2. Try sending a test invitation:
   - Go to the team management section
   - Click "Invite Member"
   - Fill in the form with your own email
   - Click "Send Invitation"

## Troubleshooting

### Error: "One or more dynamic variables are corrupted"
This is the most common error! It means your EmailJS template variables don't match what the code is sending.

**Fix:**
1. Go to your EmailJS dashboard → Email Templates
2. Edit your template
3. Make sure these EXACT variables exist in your template:
   - `{{to_email}}`
   - `{{to_name}}`
   - `{{from_name}}`
   - `{{team_name}}`
   - `{{role}}`
   - `{{personal_message}}`
   - `{{invitation_url}}`
   - `{{app_name}}`
   - `{{expires_in}}`

4. Use the template HTML provided above exactly as written
5. Save the template and test again

### Error: "EmailJS not properly configured"
- Check that all three environment variables are set correctly
- Ensure there are no extra spaces in the values
- Restart your development server after changing .env

### Error: "Failed to send invitation"
- Verify your EmailJS service is active
- Check that your email template has all required variables
- Make sure your EmailJS account hasn't exceeded the free tier limit (200 emails/month)

### Emails not being received
- Check spam/junk folders
- Verify the recipient email address is correct
- Check your EmailJS dashboard for delivery status

### Template not rendering correctly
- Ensure all template variables are spelled exactly as shown above
- Test your template in the EmailJS dashboard first
- Remove any extra spaces or characters around variable names

## EmailJS Dashboard URLs

- **Service Management**: https://dashboard.emailjs.com/admin
- **Template Editor**: https://dashboard.emailjs.com/admin/templates
- **Integration Guide**: https://dashboard.emailjs.com/admin/integration
- **Usage Statistics**: https://dashboard.emailjs.com/admin/usage

## Free Tier Limits

EmailJS free tier includes:
- 200 emails per month
- 2 email services
- 2 email templates
- Basic support

## Next Steps

Once EmailJS is configured:
1. Test invitations with different email providers
2. Customize the email template with your branding
3. Set up team management workflows
4. Monitor invitation acceptance rates

## Security Notes

- Invitation tokens expire after 7 days automatically
- Each invitation link is unique and single-use
- No sensitive data is stored in the tokens
- All email delivery is handled by EmailJS's secure infrastructure

## Support

If you encounter issues:
1. Check the browser console for error messages
2. Verify your EmailJS configuration in their dashboard
3. Test with a simple template first
4. Contact EmailJS support for email delivery issues

---

**Need Help?** The EmailJS setup should take about 15 minutes. Once configured, you'll have professional team invitations working immediately!