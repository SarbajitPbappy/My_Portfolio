# 🚀 Complete Setup Guide - Sarbajit Paul Bappy Portfolio

This is a **step-by-step guide** to get your portfolio website up and running in minutes.

---

## 📋 Prerequisites

Before starting, make sure you have:
- **Node.js 18+** installed ([Download here](https://nodejs.org/))
- **npm** or **yarn** package manager
- A code editor (VS Code recommended)
- Git (optional, for version control)

**Check your Node.js version:**
```bash
node --version
# Should show v18.x.x or higher
```

---

## 🎯 Step 1: Install Dependencies

Open your terminal in the project directory and run:

```bash
npm install
```

This will install all required packages:
- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Framer Motion
- React Hook Form
- Zod
- Lucide React icons
- Resend (for email)

**Expected time:** 2-3 minutes

---

## 🎨 Step 2: Profile Image

The profile image (`profile.jpg`) is already in the `public/` folder and configured. The Next.js Image component will handle it automatically.

**If you need to update the image:**
1. Replace `public/profile.jpg` with your new image
2. Keep the filename as `profile.jpg` (or update the path in `components/Hero.tsx`)

---

## ⚙️ Step 3: Email Setup (Optional but Recommended)

For real-time email notifications when someone contacts you:

### Quick Setup:
1. Sign up at [resend.com](https://resend.com) (free tier available)
2. Get your API key from the dashboard
3. Create `.env.local` in the root directory:
   ```env
   RESEND_API_KEY=re_your_api_key_here
   FROM_EMAIL=onboarding@resend.dev
   TO_EMAIL=sarbajit2001@gmail.com
   ```

**Detailed instructions:** See [EMAIL_SETUP.md](./EMAIL_SETUP.md)

**Note:** Without email setup, form submissions are logged to the console in development mode.

---

## 🚀 Step 4: Run Development Server

Start the development server:

```bash
npm run dev
```

You should see:
```
✓ Ready in 2.5s
○ Local:        http://localhost:3000
```

**Open your browser and visit:** [http://localhost:3000](http://localhost:3000)

🎉 **Your portfolio is now running!**

---

## 📱 Navigation

The website now uses **separate pages** instead of scrolling:

- **Home** (`/`) - Landing page with hero section
- **About** (`/about`) - About me and roles
- **Education** (`/education`) - Academic journey
- **Research** (`/research`) - Research areas
- **Publications** (`/publications`) - Published papers
- **Projects** (`/projects`) - GitHub projects
- **Contact** (`/contact`) - Contact form

Use the navigation bar to switch between pages!

---

## 🛠️ Available Commands

```bash
# Development
npm run dev          # Start dev server (http://localhost:3000)

# Production
npm run build        # Build for production
npm start            # Start production server

# Code Quality
npm run lint         # Check for code issues
```

---

## 🐛 Troubleshooting

### Issue: Port 3000 already in use
**Solution:**
```bash
# Kill the process using port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 npm run dev
```

### Issue: Module not found errors
**Solution:**
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Issue: Image not displaying (404 error)
**Solution:**
- Ensure `profile.jpg` exists in `public/` folder
- Check the filename matches exactly (case-sensitive)
- Restart the dev server
- Clear browser cache

### Issue: Contact form not sending emails
**Solution:**
- Check `.env.local` file exists and has correct values
- Verify Resend API key is correct
- Restart dev server after adding environment variables
- Check [EMAIL_SETUP.md](./EMAIL_SETUP.md) for detailed setup

### Issue: Styles not loading
**Solution:**
```bash
# Rebuild Tailwind
npm run build
```

---

## 📦 Project Structure

```
Portfolio/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   └── contact/       # Contact form endpoint
│   ├── about/             # About page
│   ├── education/         # Education page
│   ├── research/          # Research page
│   ├── publications/      # Publications page
│   ├── projects/          # Projects page
│   ├── contact/           # Contact page
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── Navbar.tsx         # Navigation (multi-page)
│   ├── Hero.tsx           # Landing section
│   ├── About.tsx          # About section
│   ├── Education.tsx     # Education timeline
│   ├── Research.tsx       # Research areas
│   ├── Publications.tsx   # Publications
│   ├── Projects.tsx       # GitHub projects
│   ├── Contact.tsx        # Contact form
│   └── Footer.tsx          # Footer
├── public/                # Static assets
│   ├── profile.jpg        # Profile image
│   └── Bappy_CV_Official.pdf  # CV
├── package.json           # Dependencies
├── tsconfig.json          # TypeScript config
├── tailwind.config.ts     # Tailwind config
└── next.config.js         # Next.js config
```

---

## 🌐 Deployment

### Deploy to Vercel (Recommended - Free)

1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/portfolio.git
   git push -u origin main
   ```

2. **Deploy on Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Add environment variables (RESEND_API_KEY, FROM_EMAIL, TO_EMAIL)
   - Click "Deploy"
   - Done! Your site is live 🎉

**Your site will be live at:** `https://your-project.vercel.app`

### Other Deployment Options

- **Netlify:** Similar to Vercel, great for Next.js
- **Railway:** Full-stack deployment platform
- **AWS Amplify:** Enterprise-grade hosting

---

## ✨ Key Features

✅ **Multi-Page Navigation** - Separate pages instead of scrolling
✅ **Responsive Design** - Works on all devices
✅ **Smooth Animations** - Powered by Framer Motion
✅ **Form Validation** - React Hook Form + Zod
✅ **Real-Time Email** - Resend integration for contact form
✅ **Type-Safe** - Full TypeScript support
✅ **Fast Performance** - Next.js 14 optimizations
✅ **SEO Friendly** - Built-in meta tags
✅ **Easy Deployment** - One-click deploy to Vercel

---

## 📚 Content Updates

All content has been updated from your LaTeX CV:
- ✅ Personal information and contact details
- ✅ Education (DIU, Erasmus+ exchange, HSC)
- ✅ Work experience (Teaching Assistant, IEEE roles)
- ✅ Research areas (domain-based, not specific diseases)
- ✅ Publications (all papers with DOIs and links)
- ✅ Projects (from CV and GitHub)
- ✅ Awards and achievements
- ✅ Technical skills

---

## 🆘 Need Help?

- Check the [README.md](./README.md) for more details
- Review [EMAIL_SETUP.md](./EMAIL_SETUP.md) for email configuration
- Review [Next.js Documentation](https://nextjs.org/docs)
- Check [Tailwind CSS Docs](https://tailwindcss.com/docs)

---

## ✅ Quick Checklist

- [ ] Node.js 18+ installed
- [ ] Dependencies installed (`npm install`)
- [ ] Profile image exists in `public/profile.jpg`
- [ ] Development server running (`npm run dev`)
- [ ] Site loads at http://localhost:3000
- [ ] Navigation works (click between pages)
- [ ] Contact form works (check console or email)
- [ ] (Optional) Email service configured
- [ ] Ready to customize and deploy!

---

**🎉 You're all set! Happy coding!**

---

*Last updated: 2025*
