# 📧 Email Setup Guide - Real-Time Email Functionality

This guide will help you set up **Resend** for real-time email notifications when someone submits the contact form.

---

## 🚀 Quick Setup (5 minutes)

### Step 1: Sign Up for Resend

1. Go to [resend.com](https://resend.com)
2. Click **"Sign Up"** (free tier available)
3. Verify your email address

### Step 2: Get Your API Key

1. After signing in, go to **"API Keys"** in the dashboard
2. Click **"Create API Key"**
3. Give it a name (e.g., "Portfolio Contact Form")
4. Copy the API key (starts with `re_...`)

### Step 3: Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Create the file
touch .env.local
```

Add these variables:

```env
RESEND_API_KEY=re_your_api_key_here
FROM_EMAIL=onboarding@resend.dev
TO_EMAIL=sarbajit2001@gmail.com
```

**Important Notes:**
- Replace `re_your_api_key_here` with your actual Resend API key
- For `FROM_EMAIL`: 
  - Free tier: Use `onboarding@resend.dev` (Resend's test domain)
  - Paid tier: Use your verified domain (e.g., `noreply@yourdomain.com`)
- `TO_EMAIL`: Your email where you want to receive contact form submissions

### Step 4: Verify Domain (Optional - For Production)

If you want to use your own domain:

1. Go to **"Domains"** in Resend dashboard
2. Click **"Add Domain"**
3. Add your domain (e.g., `yourdomain.com`)
4. Add the DNS records Resend provides to your domain registrar
5. Wait for verification (usually a few minutes)
6. Update `FROM_EMAIL` in `.env.local` to use your domain

### Step 5: Install Resend Package

The package is already in `package.json`, but if you need to install:

```bash
npm install resend
```

### Step 6: Test It!

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Go to the Contact page: `http://localhost:3000/contact`

3. Fill out and submit the form

4. Check your email inbox - you should receive the message!

---

## 🔧 Troubleshooting

### Issue: "Email not sending"

**Check:**
- API key is correct in `.env.local`
- `.env.local` is in the root directory (not in a subfolder)
- Restart your dev server after adding environment variables
- Check Resend dashboard for any errors

### Issue: "Invalid API key"

**Solution:**
- Make sure you copied the full API key (starts with `re_`)
- No extra spaces or quotes in `.env.local`
- Regenerate the API key if needed

### Issue: "Domain not verified"

**Solution:**
- For development, use `onboarding@resend.dev`
- For production, verify your domain in Resend dashboard
- Check DNS records are correctly added

### Issue: "Email goes to spam"

**Solution:**
- Use a verified domain (not `onboarding@resend.dev`)
- Add SPF and DKIM records (Resend provides these)
- Check spam folder initially

---

## 📊 Resend Pricing

- **Free Tier:** 3,000 emails/month, 100 emails/day
- **Pro Tier:** $20/month - 50,000 emails/month
- Perfect for portfolio contact forms!

---

## ✅ Verification Checklist

- [ ] Resend account created
- [ ] API key generated and copied
- [ ] `.env.local` file created with correct values
- [ ] Dev server restarted
- [ ] Contact form tested
- [ ] Email received successfully

---

## 🎉 You're Done!

Your contact form now sends real-time emails! Every submission will be delivered directly to your inbox.

**Need help?** Check the [Resend Documentation](https://resend.com/docs) or the error logs in your terminal.

