# Fix "One or more dynamic variables are corrupted" Error

## Step-by-Step Fix (5 minutes)

### Step 1: Go to EmailJS Template Editor
1. Open: https://dashboard.emailjs.com/admin/templates
2. Click on your template (template_cv8dzob)
3. Click "Edit"

### Step 2: Clear ALL Content
1. Delete everything in the template editor
2. Make sure it's completely empty

### Step 3: Copy This EXACT Template
Copy and paste this minimal template:

```html
<div style="font-family: Arial, sans-serif; padding: 20px;">
  <h2>Team Invitation</h2>
  
  <p>Hello {{to_name}},</p>
  
  <p>{{from_name}} has invited you to join {{team_name}}.</p>
  
  <p>Your role: {{role}}</p>
  
  <p>{{personal_message}}</p>
  
  <p>
    <a href="{{invitation_url}}" style="background: blue; color: white; padding: 10px 20px; text-decoration: none;">
      Accept Invitation
    </a>
  </p>
  
  <p>From: {{app_name}}</p>
  <p>Expires: {{expires_in}}</p>
</div>
```

### Step 4: Save Template
1. Click "Save" in EmailJS
2. Make sure no errors appear

### Step 5: Test Again
1. Go back to your TaskFlow app
2. Try sending an invitation
3. Should work now!

## Why This Fixes It

EmailJS template variables must match EXACTLY:
- ✅ `{{to_name}}` - correct
- ❌ `{{ to_name }}` - wrong (extra spaces)
- ❌ `{{to-name}}` - wrong (dash instead of underscore)
- ❌ `{{toName}}` - wrong (camelCase)

The minimal template above uses only the exact variables our code sends.

## If Still Having Issues

1. **Check the browser console** for detailed error messages
2. **Try the EmailJS template test** feature in their dashboard
3. **Make sure your service is connected** and active
4. **Check your free tier limits** (200 emails/month)

## Alternative: Quick Test Template

If you want to test with even simpler content:

```html
Hello {{to_name}}, you're invited! <a href="{{invitation_url}}">Join here</a>
```

This absolute minimal template will definitely work and you can build from there.