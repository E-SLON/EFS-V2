# Exclusive Fragrance Scents — v2
## Full-Stack E-Commerce Website | Node.js + MongoDB + HTML/CSS/JS

---

## PROJECT STRUCTURE

```
efs-website/
├── .github/
│   └── workflows/ci.yml          ← GitHub Actions: auto-tests on every push
│
├── backend/
│   ├── server.js                 ← Main Express server
│   ├── package.json              ← npm dependencies
│   ├── .env.example              ← Copy to .env and fill in
│   │
│   ├── models/
│   │   ├── Admin.js              ← Admin accounts (roles: superadmin/admin/viewer)
│   │   ├── Order.js              ← Customer orders
│   │   └── Product.js            ← Product catalogue
│   │
│   ├── routes/
│   │   ├── auth.js               ← Login, profile, change password
│   │   ├── admins.js             ← Create/manage admin accounts
│   │   ├── orders.js             ← Place + manage orders
│   │   └── products.js           ← Product catalogue + seed
│   │
│   ├── middleware/
│   │   └── auth.js               ← JWT protection + role checks
│   │
│   └── tests/
│       ├── setup.js              ← In-memory MongoDB for tests
│       ├── auth.test.js          ← Admin auth tests (login, roles, password)
│       └── orders.test.js        ← Orders + products tests
│
└── frontend/
    ├── index.html                ← Main website
    ├── css/style.css             ← All styling (luxury gold/black theme)
    ├── js/app.js                 ← All JavaScript (API, cart, admin, animations)
    └── images/                   ← All 36 perfume images from your document
```

---

## QUICK START (LOCAL)

### 1. Install Node.js
Download from https://nodejs.org — choose the LTS version.

### 2. Set up your .env file
```bash
cd backend
cp .env.example .env
```
Open `.env` and fill in:
```
MONGODB_URI=mongodb+srv://YOUR_USER:YOUR_PASS@cluster55358.xxxxx.mongodb.net/efs_store
PORT=5000
NODE_ENV=production
JWT_SECRET=make_this_a_long_random_string_at_least_50_characters
```

### 3. Install and run
```bash
cd backend
npm install
npm start
```
You should see:
```
✅ Connected to MongoDB
🚀 EFS Server running on port 5000
```

### 4. Open the website
Go to: **http://localhost:5000**

### 5. Create your first admin account
Open the website → click **Admin** in the navbar → click **"Create superadmin account"**
Fill in your name, email, password → submit.

### 6. Seed all 36 products into the database
Log into the admin panel → click **"Seed Products"** button in the top bar.
This loads all products from your document into MongoDB.

---

## RUNNING TESTS

```bash
cd backend
npm test
```

This runs all tests using an **in-memory MongoDB database** — no setup needed.
Tests cover:
- Admin login (correct/wrong password)
- JWT token verification
- Role-based access control (superadmin vs admin vs viewer)
- Creating/deleting admin accounts
- Placing orders (valid + invalid)
- Fetching orders (authenticated vs unauthenticated)
- Order status updates
- Product seeding + filtering
- Dashboard stats

For coverage report:
```bash
npm run test:coverage
```

---

## GITHUB SETUP

### Push your code to GitHub
```bash
git init
git add .
git commit -m "Initial commit — EFS website"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/efs-website.git
git push -u origin main
```

### GitHub Actions (automatic)
The `.github/workflows/ci.yml` file runs automatically every time you push to GitHub.
It will:
1. Run all tests on Node.js 18 and 20
2. Check for syntax errors
3. Deploy to Render (if you set up the deploy hook — see below)

### Set up GitHub Secrets (for deployment)
Go to your GitHub repo → Settings → Secrets and Variables → Actions → New secret:
- Name: `RENDER_DEPLOY_HOOK`
- Value: your Render deploy hook URL (see Hosting section below)

---
## HOSTING ON VERCEL
This repository is now configured for a combined Vercel deployment with a static frontend and a Node API backend.

### What was added
- `vercel.json` → routes `/api/*` to the backend serverless entrypoint and serves static frontend files from `frontend/`
- `api/index.js` → Vercel Node function that loads the existing backend app and connects to MongoDB safely
- `package.json` at repo root → enables npm workspace installation for the `backend` package
- `.env.example` at repo root → environment variable template for local and Vercel deployment

### Vercel deployment steps
1. Push this repo to GitHub.
2. Open Vercel and import the GitHub repository.
3. In Vercel Project Settings → Environment Variables, add:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `JWT_EXPIRES_IN` (recommended: `8h`)
   - `ADMIN_PASSWORD`
   - `EMAIL_USER` (optional, for order emails)
   - `EMAIL_PASS` (optional, for order emails)
   - `OWNER_EMAIL` (optional, for order emails)
   - `FRONTEND_URL` (optional, your Vercel domain)
4. Deploy the project.

### Vercel config note
This project uses a Vercel config file compatible with the older Vercel platform version 2 because your import flow rejected `version: 3`.

### Expected Vercel behavior
- The static website is served from `/` via the `frontend/` folder.
- The backend API is served from `/api/*`.
- The frontend already points to `/api` in production, so it will call the backend automatically when deployed on the same domain.

### Local development after this update
```bash
npm install
npm --prefix backend install
npm --prefix backend run dev
```
If you want to preview the full stack locally with Vercel CLI, install Vercel and run:
```bash
npm install -g vercel
vercel dev
```

---
## HOSTING ON RENDER (FREE)

### Step 1 — Sign up
Go to https://render.com and create a free account.

### Step 2 — Create Web Service
1. Click **New → Web Service**
2. Connect your GitHub repo
3. Set these settings:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`

### Step 3 — Add Environment Variables
In Render → Your Service → Environment, add:
```
MONGODB_URI      = your MongoDB connection string
PORT             = 5000
NODE_ENV         = production
JWT_SECRET       = your long random string
FRONTEND_URL     = https://your-service-name.onrender.com
```

### Step 4 — Get Deploy Hook
Render → Your Service → Settings → Deploy Hook → Copy the URL
Add it as `RENDER_DEPLOY_HOOK` in GitHub Secrets (above).

Now every push to `main` on GitHub will automatically test and deploy.

### Step 5 — Custom Domain (optional)
Get a `.co.za` domain from Domains.co.za (~R99/year)
Point it to Render by adding a custom domain in Render → Settings → Custom Domains.

---

## ADMIN PANEL GUIDE

| Feature | How |
|---------|-----|
| Log in | Click "Admin" in navbar → enter email + password |
| View orders | Orders tab — all customer orders with status |
| Update order status | Use the dropdown in the Orders table |
| Export orders | Click "Export CSV" button → downloads spreadsheet |
| Create admin | Admins tab → fill in name, email, password, role |
| Deactivate admin | Admins tab → click "Deactivate" |
| Change password | My Profile tab |
| Seed products | Click "Seed Products" button (superadmin only) |

### Admin Roles
- **Superadmin** — full access: orders, admins, products
- **Admin** — orders and products
- **Viewer** — read-only access

---

## API REFERENCE

### Public
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/products | Get all products |
| GET | /api/products?tag=oud | Filter by category |
| GET | /api/products?gender=women | Filter by gender |
| GET | /api/products?search=dior | Search by name |
| POST | /api/orders | Place a new order |
| POST | /api/admins/setup | Create first superadmin (one-time only) |

### Authenticated (requires Bearer token)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/login | Login → get token |
| GET | /api/auth/me | Get my profile |
| PATCH | /api/auth/change-password | Change password |
| GET | /api/orders | Get all orders |
| GET | /api/orders/stats | Dashboard stats |
| PATCH | /api/orders/:id/status | Update order status |
| GET | /api/admins | List all admins (superadmin) |
| POST | /api/admins | Create admin (superadmin) |
| PATCH | /api/admins/:id | Update admin (superadmin) |
| DELETE | /api/admins/:id | Delete admin (superadmin) |
| POST | /api/products/seed/all | Seed all products |

---

## ADDING IMAGES

Product images are already in `frontend/images/`. They load automatically.
If you want to swap an image for a specific product:
1. Add your image file to `frontend/images/`
2. Log in as admin and use the API to update the product:
```
PATCH /api/products/1
{ "imageFile": "your-new-image.jpg" }
```

---

Built for Exclusive Fragrance Scents. South Africa 🇿🇦
