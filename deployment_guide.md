# TimeSphere — Deployment & Mobile Install Guide

Everything you need to go from local code to a live app that anyone can install on their phone.

---

## Step 1 — Build the project

Run this in the project folder:

```bash
npm run build
```

This creates a `dist/` folder containing the complete production-ready app. That folder is what you deploy.

---

## Step 2 — Deploy (choose one platform)

### Option A: Netlify (easiest — drag and drop)

1. Go to [app.netlify.com/drop](https://app.netlify.com/drop)
2. Drag your `dist/` folder into the browser window
3. Netlify gives you a live HTTPS URL instantly (e.g. `timesphere.netlify.app`)
4. Optional: click **Domain settings** to set a custom name

To redeploy after changes: run `npm run build` again and drag the new `dist/` folder.

---

### Option B: Vercel (best for auto-deploys from GitHub)

1. Push your project to a GitHub repository
2. Go to [vercel.com](https://vercel.com) → **New Project** → import your repo
3. Vercel auto-detects Vite. Set:
   - **Framework:** Vite
   - **Build command:** `npm run build`
   - **Output directory:** `dist`
4. Click **Deploy** — you get a URL like `timesphere.vercel.app`

Every time you push to GitHub, Vercel rebuilds and redeploys automatically.

---

### Option C: Cloudflare Pages (fastest globally)

1. Go to [pages.cloudflare.com](https://pages.cloudflare.com) → **Create a project**
2. Connect your GitHub repo
3. Set:
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
4. Deploy — you get a URL like `timesphere.pages.dev`

---

### Option D: GitHub Pages (free, needs one config change)

1. In `vite.config.ts`, add your repo name as the base path:
   ```ts
   export default defineConfig({
     base: '/your-repo-name/',
     plugins: [...]
   })
   ```
2. Run `npm run build`
3. Push the `dist/` folder to a `gh-pages` branch, or use the `gh-pages` npm package:
   ```bash
   npm install gh-pages -D
   npx gh-pages -d dist
   ```
4. In GitHub → repo Settings → Pages → set source to `gh-pages` branch

---

## Step 3 — Install on mobile

The app must be served over **HTTPS** (all the platforms above do this automatically) for PWA install to work.

---

### Android (Chrome)

**Automatic way (built into the app):**
- Open the app URL in Chrome
- After ~8 seconds, a banner appears at the bottom saying **"Install TimeSphere"**
- Tap **Install** — done

**Manual way (if the banner was dismissed):**
1. Open the URL in Chrome
2. Tap the **three-dot menu (⋮)** at the top right
3. Tap **Add to Home screen**
4. Tap **Add**

**Via Settings inside the app:**
1. Open the hamburger menu (☰) → tap **Settings**
2. Scroll down to the **Install App** section
3. Tap the **Install TimeSphere** button

Once installed:
- TimeSphere appears on your home screen and app drawer
- Opens full-screen with no browser address bar
- Works offline (background images cached, clock always works)
- Auto-updates silently in the background

---

### iPhone / iPad (Safari)

> Must use **Safari** — Chrome on iOS cannot install PWAs (Apple restriction).

**Steps:**
1. Open the app URL in **Safari**
2. Tap the **Share button** (box with upward arrow ↑) at the bottom of the screen
3. Scroll down in the share sheet and tap **Add to Home Screen**
4. Edit the name if you want (default: TimeSphere)
5. Tap **Add** in the top right

**Via Settings inside the app:**
1. Open the hamburger menu (☰) → tap **Settings**
2. Scroll down to **Install App** — the step-by-step guide is shown right there

Once installed:
- Appears on your home screen like a native app
- Opens full-screen (no Safari bar)
- Works offline

---

### Desktop (Chrome / Edge)

1. Open the app URL
2. Look for the **install icon** (monitor with down arrow) in the browser address bar
3. Click it → click **Install**

Or: browser menu → **Install TimeSphere**

---

## What "installed" means vs live wallpaper

| Feature | PWA (what we built) | Native Android live wallpaper |
|---|---|---|
| Home screen icon | ✅ | ✅ |
| Full-screen, no browser bar | ✅ | ✅ |
| Works offline | ✅ | ✅ |
| Auto-updates | ✅ | ✅ |
| Always visible on home screen | ❌ (must open the app) | ✅ |
| Visible on lock screen | ❌ | ✅ (with native app) |
| Buildable from this codebase | ✅ | ❌ needs Kotlin/Java |

**To get true live wallpaper / lock screen replacement on Android**, the next step would be converting this project to a native Android app using [Capacitor](https://capacitorjs.com/) and writing a native `WallpaperService` plugin in Kotlin. That is a separate larger project.

---

## Environment variables — don't forget

Before deploying, make sure your hosting platform has these env vars set (same as your `.env` file):

| Variable | Where to get it |
|---|---|
| `VITE_OPENWEATHER_KEY` | [openweathermap.org/api](https://openweathermap.org/api) |
| `VITE_FIREBASE_API_KEY` | Firebase Console → Project Settings |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase Console → Project Settings |
| `VITE_FIREBASE_PROJECT_ID` | Firebase Console → Project Settings |

On Netlify: **Site settings → Environment variables**
On Vercel: **Project → Settings → Environment Variables**
On Cloudflare Pages: **Project → Settings → Environment variables**

> Never commit your `.env` file to GitHub — it's already in `.gitignore`.

---

## Quick reference checklist

- [ ] `npm run build` — creates `dist/`
- [ ] Deploy `dist/` to Netlify / Vercel / Cloudflare
- [ ] Add environment variables on the hosting platform
- [ ] Open the live HTTPS URL on your phone
- [ ] Android: tap Install banner, or Chrome menu → Add to Home screen
- [ ] iPhone: Safari Share (↑) → Add to Home Screen
- [ ] Test: open installed app — should be full-screen with no browser bar
