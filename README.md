# Portfolio Website - Next.js + Supabase CMS

A modern, fully customizable portfolio website built with Next.js, TypeScript, Tailwind CSS, and Supabase. Features a complete admin panel for managing all content without touching code.

## 🚀 Features

- **Fully Editable Content** - Manage Hero, About, Education, Work Experience, Projects, Publications, Research Areas, Courses, Contact, Footer, and Navbar through admin panel
- **Dynamic Pages** - Create unlimited custom pages with HTML, JSX, or TSX content
- **Icon Support** - Add icons to Education, Projects, Work Experience, and Research Areas
- **Auto-Refresh** - Frontend automatically updates when you save changes in admin panel
- **Responsive Design** - Beautiful, modern UI that works on all devices
- **Database-Driven** - All content stored in Supabase PostgreSQL database
- **Secure Admin Panel** - Password-protected admin interface
- **Contact Form** - Working contact form with email notifications (Resend)
- **Visitor Analytics** - Cookie-free, self-hosted traffic stats in the admin panel, plus a visitor counter in the footer

## 📋 Prerequisites

Before deploying, make sure you have:

- A [Vercel](https://vercel.com) account
- A [Supabase](https://supabase.com) account
- Node.js 18+ installed (for local development)
- Git installed

## 🛠️ Local Development Setup

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd Portfolio
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration (Required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Admin Panel Password (Required)
ADMIN_PASSWORD=your-secure-password-here

# Email Configuration (Optional - for contact form)
RESEND_API_KEY=your_resend_api_key
FROM_EMAIL=noreply@yourdomain.com
TO_EMAIL=your-email@example.com
```

**Get Supabase credentials:**
1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **API**
3. Copy the **Project URL** and **anon/public** key

### 4. Set Up Database

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Open `supabase_schema_complete.sql` from this project
4. Copy all the SQL code
5. Paste into Supabase SQL Editor
6. Click **Run** (or press Ctrl+Enter)

This will create all necessary tables:
- `hero`, `about`, `contact_info`, `footer`, `navbar`
- `education`, `publications`, `work_experience`, `projects`, `research_areas`, `courses`

### 4b. Enable Visitor Analytics

Run `create_analytics_table.sql` the same way (SQL Editor → paste → Run). It adds
the `page_views` table plus the aggregate functions the dashboard reads.

Then open **/admin → Analytics** for visitors per day, top pages, referrers,
devices and countries. The public site shows only a small visitor counter in the
footer.

How the counting works:

- **No cookies, no localStorage.** Nothing is stored in the visitor's browser.
- **No IP addresses or user agents are saved.** Each hit stores a salted hash of
  (IP + user agent) where the salt rotates every UTC day, so a visitor is counted
  once per day and cannot be followed across days.
- Bots and crawlers are filtered out, and visitors sending Do Not Track / Global
  Privacy Control are not counted.
- Visits from `localhost` are ignored so development doesn't inflate the numbers.
  Set `NEXT_PUBLIC_ANALYTICS_DEBUG=true` in `.env.local` to count them while testing.
- Over a multi-day range, "visitors" is the sum of each day's unique visitors
  (the same convention Plausible and Fathom use).

### 4c. Enable Per-Visit Detail (Sessions + Clicks)

Run `create_analytics_sessions.sql` (after `create_analytics_table.sql`). This
powers **/admin → Analytics → Visitors**:

- when each visit started, shown in **Bangladesh time (UTC+6)**
- how long the visitor stayed
- every page they viewed and every element they clicked, in order
- average time on site, pages per visit, bounce rate, and a "most clicked" list

A visit is keyed by a random id in `sessionStorage` (not a cookie) and lasts as
long as the browser tab. Duration is measured from the first to the last signal
received, so a tab left open in the background reads longer than actual reading
time. **Text typed into forms is never recorded** — only which element was
clicked — and password fields are skipped entirely.

Until this file is run, the Visitors tab shows a setup notice and the headline
counters keep working normally.

### 4d. Google Analytics 4 (Optional)

The site also supports GA4 alongside the built-in analytics.

1. Go to [analytics.google.com](https://analytics.google.com) → **Admin** →
   **Create property** (or pick an existing one).
2. Under **Data streams**, add a **Web** stream for `https://www.sarbajit.tech`.
3. Copy the **Measurement ID** — it looks like `G-XXXXXXXXXX`.
4. Add it as an environment variable, locally in `.env.local` and in the Vercel
   project settings (Settings → Environment Variables), then redeploy:

   ```
   NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
   ```

With no `NEXT_PUBLIC_GA_ID` set, GA never loads and sets no cookie. GA is also
skipped on `/admin`, on `localhost`, and for visitors sending Do Not Track.

> **This changes the site's privacy posture.** The built-in analytics use no
> cookies and keep all data in your own database. GA4 **does** set cookies
> (`_ga`, `_ga_*`) and sends visitor data to Google, which is what brings
> cookie-consent requirements into play for EU/UK visitors. The gates above are
> not a substitute for a consent banner if you need one. Skip this section
> entirely if you would rather stay cookie-free.

### 5. Run Migration (Optional)

If you have existing hardcoded data, migrate it to the database:

```bash
node scripts/migrate-data.js
```

This script will:
- Migrate all existing data to Supabase
- Prevent duplicate entries
- Show progress in the console

### 6. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to see your portfolio.

## 🚀 Deploying to Vercel

### Step 1: Push to GitHub

If you haven't already, push your code to GitHub:

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### Step 2: Import to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **Add New Project**
3. Import your GitHub repository
4. Vercel will auto-detect Next.js settings

### Step 3: Configure Environment Variables

In the Vercel project settings:

1. Go to **Settings** → **Environment Variables**
2. Add all variables from your `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
ADMIN_PASSWORD=your-secure-password-here
RESEND_API_KEY=your_resend_api_key (optional)
FROM_EMAIL=noreply@yourdomain.com (optional)
TO_EMAIL=your-email@example.com (optional)
```

**Important:** 
- Add these for **Production**, **Preview**, and **Development** environments
- `NEXT_PUBLIC_*` variables are exposed to the browser
- Never commit `.env.local` to Git

### Step 4: Deploy

1. Click **Deploy**
2. Wait for the build to complete
3. Your site will be live at `https://your-project.vercel.app`

### Step 5: Set Up Database (If Not Done)

After deployment, make sure your Supabase database is set up:

1. Go to Supabase Dashboard → **SQL Editor**
2. Run `supabase_schema_complete.sql` (if not done already)
3. Run migration script locally or add data through admin panel

## 🔐 Accessing Admin Panel

1. Visit `https://your-site.vercel.app/admin`
2. Login with your `ADMIN_PASSWORD`
3. Start managing your content!

**Admin Panel Features:**
- ✅ Hero Section Management
- ✅ About Section Management
- ✅ Education & Courses Management
- ✅ Work Experience Management
- ✅ Projects Management (with icon support)
- ✅ Publications Management
- ✅ Research Areas Management (with icon support)
- ✅ Contact Information Management
- ✅ Footer Management
- ✅ Navbar Management (with automatic page creation)
- ✅ Dynamic Pages Management (HTML/JSX/TSX support)

## 📝 Managing Content

### Adding Icons

Icons use **Lucide React** icon names (case-sensitive). Common icons:

**Projects:**
- `Shop`, `Store`, `Bag`, `ShoppingBag`, `ShoppingCart`
- `Cloud`, `Code`, `Database`, `Server`, `Globe`
- `Briefcase`, `Package`, `Box`

**Education:**
- `GraduationCap`, `Globe`, `Award`, `BookOpen`, `School`

**Work Experience:**
- `Briefcase`, `Users`, `BookOpen`, `Award`

**Research Areas:**
- `Brain`, `Eye`, `Microscope`, `Leaf`, `Sparkles`, `Layers`

### Gradient Options

All sections support 15 gradient options:
- Blue to Cyan, Purple to Pink, Green to Emerald
- Red to Rose, Amber to Orange, Indigo to Purple
- Teal to Cyan, Rose to Pink, Violet to Purple
- Emerald to Teal, Orange to Red, Cyan to Blue
- Pink to Rose, Yellow to Amber, Slate to Gray

## 🔧 Project Structure

```
portfolio/
├── app/
│   ├── api/              # API routes (CRUD operations)
│   ├── admin/            # Admin panel page
│   └── page.tsx          # Main portfolio page
├── components/
│   ├── admin/            # Admin manager components
│   ├── Hero.tsx          # Hero section
│   ├── About.tsx         # About section
│   ├── Education.tsx     # Education section
│   ├── WorkExperience.tsx
│   ├── Projects.tsx
│   ├── ResearchAndPublications.tsx
│   ├── Contact.tsx
│   ├── Footer.tsx
│   └── Navbar.tsx
├── lib/
│   ├── db.ts             # Database CRUD functions
│   ├── types.ts          # TypeScript interfaces
│   └── supabase.ts       # Supabase client
├── scripts/
│   └── migrate-data.js   # Data migration script
└── supabase_schema_complete.sql  # Database schema
```

## 🐛 Troubleshooting

### "Table doesn't exist" Error

**Solution:** Run `supabase_schema_complete.sql` in Supabase SQL Editor

### "Icon not showing"

**Solution:**
- Check icon name is correct (case-sensitive)
- Icon must match Lucide React icon names
- Check browser console for errors

### "Changes not appearing on frontend"

**Solution:**
1. Hard refresh the page (Ctrl+Shift+R / Cmd+Shift+R)
2. Check if data was saved in Supabase dashboard
3. Check browser console for API errors
4. Verify environment variables are set correctly in Vercel

### "Can't login to admin"

**Solution:**
- Check `ADMIN_PASSWORD` in Vercel environment variables
- Make sure it's set for the correct environment (Production/Preview)
- Clear browser cookies and try again

### "500 Error on API routes"

**Solution:**
- Check Vercel function logs
- Verify Supabase credentials are correct
- Check if tables exist in Supabase
- Review error messages in Vercel dashboard

### Build Errors

**Solution:**
- Check Vercel build logs
- Ensure all dependencies are in `package.json`
- Verify environment variables are set
- Check for TypeScript errors locally first

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Lucide Icons](https://lucide.dev/icons/) - Browse available icons

## 🔄 Updating Your Site

### After Code Changes

1. Push changes to GitHub
2. Vercel will automatically redeploy
3. Changes go live in ~1-2 minutes

### After Content Changes

1. Login to admin panel
2. Make your changes
3. Click "Save"
4. Frontend updates automatically (no redeploy needed!)

## 📧 Contact Form Setup

To enable the contact form:

1. Sign up for [Resend](https://resend.com)
2. Get your API key
3. Add to Vercel environment variables:
   - `RESEND_API_KEY`
   - `FROM_EMAIL` (verified domain email)
   - `TO_EMAIL` (where to receive emails)

## 📚 Documentation

- **[Quick Guide: Add Navbar Page](./QUICK_GUIDE_ADD_NAVBAR_PAGE.md)** - Step-by-step guide for adding a navbar item that creates a page (e.g., "Skills")
- **[Navbar & Pages Guide](./NAVBAR_AND_PAGES_GUIDE.md)** - Complete guide on creating navbar items and dynamic pages with HTML/JSX/TSX support

## 🎨 Customization

### Colors

Edit `tailwind.config.js` to change the color scheme:

```js
theme: {
  extend: {
    colors: {
      primary: {
        // Your color values
      }
    }
  }
}
```

### Fonts

Update fonts in `app/layout.tsx` or `tailwind.config.js`

### Styling

All components use Tailwind CSS. Modify component files in `components/` directory.

## ✅ Checklist for Deployment

- [ ] Code pushed to GitHub
- [ ] Supabase project created
- [ ] Database schema run (`supabase_schema_complete.sql`)
- [ ] Environment variables set in Vercel
- [ ] Project imported to Vercel
- [ ] Build successful
- [ ] Site accessible at Vercel URL
- [ ] Admin panel accessible (`/admin`)
- [ ] Can login to admin panel
- [ ] Can add/edit content
- [ ] Changes appear on frontend
- [ ] Contact form working (if enabled)

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Support

For issues or questions:
1. Check the troubleshooting section
2. Review Vercel/Supabase logs
3. Check browser console for errors
4. Verify all environment variables are set correctly

---

**Built with ❤️ using Next.js, Supabase, and Vercel**
