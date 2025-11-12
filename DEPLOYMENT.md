# GitHub Pages Deployment Guide

Your StudySphere app is now configured for seamless GitHub Pages deployment!

## Automatic Deployment

Once you connect this project to GitHub, every push to the `main` branch will automatically:
1. Build your React app with Vite
2. Deploy to GitHub Pages
3. Make it live at `https://yourusername.github.io/repo-name/`

## Setup Steps

### 1. Connect to GitHub (via Lovable)
- Click **GitHub** → **Connect to GitHub** in Lovable
- Authorize and create a new repository
- Your code will automatically sync

### 2. Enable GitHub Pages
In your GitHub repository:
- Go to **Settings** → **Pages**
- Under "Source", select **GitHub Actions**
- Save

### 3. Configure Base Path (if using repo subdirectory)
If your site will be at `yourusername.github.io/repo-name/` (not root domain):

Edit `vite.config.ts` and change:
```ts
base: '/',  // Change to '/repo-name/'
```

### 4. Push & Deploy
Your site will automatically deploy on every push to `main`!

## How It Works

- **404.html**: Handles client-side routing (fixes direct URL access to routes like `/tools`)
- **GitHub Actions**: Builds and deploys your app automatically
- **Vite Build**: Optimizes and bundles your React app

## All Features Work Offline

✅ Study sessions & timers  
✅ Flashcards (localStorage)  
✅ Whiteboard & drawings  
✅ Voice-to-text (Web Speech API)  
✅ Mind maps & Cornell notes  

No backend required - everything runs in the browser!

## Custom Domain (Optional)

To use a custom domain:
1. Add a `CNAME` file in `/public/` with your domain
2. Configure DNS records with your domain provider
3. Enable HTTPS in GitHub Pages settings

---

**Note**: If you later enable Lovable Cloud (Supabase backend) for cross-device sync or authentication, you'll need to keep using Lovable's hosting or set up your own backend infrastructure.
