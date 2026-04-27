# Admin Panel Setup Guide

Your website now has a content management system (CMS) that allows you to edit content from your phone or laptop!

## 🚀 Quick Setup Steps

### Step 1: Enable Netlify Identity

1. Go to your Netlify dashboard: https://app.netlify.com
2. Select your site (jesusinsurancetabernacle)
3. Go to **Site settings** → **Identity**
4. Click **Enable Identity**
5. Scroll down to **Registration preferences** and set it to **Invite only** (recommended for security)
6. Scroll down to **Services** and enable **Git Gateway** (click "Enable Git Gateway")

### Step 2: Access the Admin Panel

1. Visit: `https://jesusinsurancetabernacle.netlify.app/admin`
2. Click **"Sign up"** or **"Log in"**
3. The first time you sign up, check your email for a confirmation link
4. After confirming, you'll be able to log in

### Step 3: Start Editing!

Once logged in, you'll see a dashboard where you can edit:
- **Hero Section** - Main title, subtitle, and buttons
- **About Section** - Mission, vision, values, and statistics
- **Contact Information** - Address, phone, email
- **Events** - Add, edit, or delete upcoming events
- **Programs/Services** - Manage your weekly programs schedule

## 📱 Mobile Access

The admin panel works great on mobile! Just visit `/admin` on your phone's browser and log in.

## 🔒 Security Notes

- Only invite trusted people to the admin panel
- Use strong passwords
- The admin panel is protected - only logged-in users can access it

## 📝 How to Edit Content

1. **Hero Section**: Click "Site Content" → "Hero Section"
   - Edit the title, subtitle, and button text
   - Click "Save" when done

2. **Events**: Click "Events" → "New Event" or click an existing event
   - Fill in event details (title, date, time, description)
   - Mark as "Featured" to highlight it
   - Click "Save"

3. **Programs**: Click "Programs/Services" → "New Program" or edit existing
   - Set the day (e.g., "Sunday", "Every Thursday")
   - Add program name and time slots
   - Click "Save"

4. **About Section**: Click "Site Content" → "About Section"
   - Update mission, vision, values, and statistics
   - Click "Save"

## 🎨 Adding Images

When editing content, you can upload images:
- Click the image field
- Click "Choose an image"
- Upload from your device
- Images are stored in `/static/images/uploads/`

## ⚠️ Important Notes

- Changes are saved to your Git repository
- It may take 1-2 minutes for changes to appear on the live site (Netlify needs to rebuild)
- If you don't see changes immediately, wait a moment and refresh the page

## 🆘 Troubleshooting

**Can't access /admin?**
- Make sure Netlify Identity is enabled in your site settings
- Make sure Git Gateway is enabled

**Changes not showing up?**
- Wait 1-2 minutes for Netlify to rebuild
- Hard refresh your browser (Ctrl+F5 or Cmd+Shift+R)
- Check Netlify deploy logs for errors

**Need help?**
- Check Netlify documentation: https://docs.netlify.com/visitor-access/identity/
- Check Decap CMS docs: https://decapcms.org/docs/

---

**Your admin panel is ready!** 🎉

Visit: `https://jesusinsurancetabernacle.netlify.app/admin`



