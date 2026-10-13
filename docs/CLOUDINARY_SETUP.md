# Cloudinary setup — profile pictures (avatar uploads)

Profile-picture upload (`PUT /user/profile/avatar` → `src/controllers/userController.js`
→ `src/config/cloudinary.js`) needs three values from your Cloudinary account.
Without them the API correctly returns:

> `Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.`

Nobody can generate these for you — they come from **your** Cloudinary dashboard.
Setup takes ~5 minutes:

## Step 1 — Create a free account

1. Go to https://cloudinary.com/users/register_free and sign up.
2. The free tier (25 GB storage + 25 GB bandwidth/month) is plenty for avatars.

## Step 2 — Copy your credentials

1. Open the dashboard: https://console.cloudinary.com/ → **Home**.
2. Find the **Product Environment Credentials** card:
   - **Cloud name** → `CLOUDINARY_CLOUD_NAME`
     (also visible in the top-left URL: `console.cloudinary.com/console/c-<cloud-name>/...`)
   - **API Key** → `CLOUDINARY_API_KEY`
   - Click **Show** / generate under **API Secret** → `CLOUDINARY_API_SECRET`
     (treat it like a password — never commit it).

## Step 3 — Configure the backend

Add to `ecosankalan-codebase/.env` (same folder as `.env.example`):

```env
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=your-api-secret
# Optional — override the default folder:
# CLOUDINARY_AVATAR_FOLDER=ecosankalan/avatars
```

These keys already exist (empty) in `.env.example`.

## Step 4 — Restart + test

```bash
cd ecosankalan-codebase
npm run dev        # or: npm start
```

1. Log in to the app → **Profile** → **Edit Profile** → **Change Picture**.
2. Pick a JPG/PNG (≤5 MB). Save.
3. The avatar should update everywhere (Navbar, Profile). In Cloudinary:
   **Media Library → ecosankalan/avatars** shows the 512×512 face-cropped copy.

## How it works (background)

- Frontend sends `multipart/form-data` (`avatar` field) → `avatarUpload` multer
  middleware (memory storage, image-only, 5 MB cap).
- Backend converts to a data-URI and uploads to Cloudinary with a
  `512×512 fill, gravity:face, auto quality/format` transformation.
- The returned `secure_url` is saved as `User.avatarUrl` and returned to the
  client, which refreshes `AuthContext` immediately.

## Troubleshooting

| Symptom | Fix |
|---|---|
| `Cloudinary is not configured...` | `.env` keys missing/typo'd, or backend not restarted after editing |
| `Invalid api_key` / `Invalid signature` | Secret has trailing spaces or belongs to a different cloud name |
| Upload succeeds but old picture shows | Hard-refresh (Ctrl+Shift+R) — avatar URLs are cached by the browser |
| `File too large` | 5 MB cap in `avatarUpload.js` — compress the image first |
