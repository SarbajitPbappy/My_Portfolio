# Portfolio Website - Next.js + Supabase CMS

A modern, fully customizable portfolio website built with Next.js, TypeScript, Tailwind CSS, and Supabase. Features a complete admin panel for managing all content without touching code.

## 🚀 Features

- **Fully Editable Content** - Manage Hero, About, Education, Work Experience, Projects, Publications, Research Areas, Courses, Contact, Footer, and Navbar through admin panel
- **Icon Support** - Add icons to Education, Projects, Work Experience, and Research Areas
- **Auto-Refresh** - Frontend automatically updates when you save changes in admin panel
- **Responsive Design** - Beautiful, modern UI that works on all devices
- **Database-Driven** - All content stored in Supabase PostgreSQL database
- **Secure Admin Panel** - Password-protected admin interface
- **Contact Form** - Working contact form with email notifications (Resend)

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
- ✅ Navbar Management

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
