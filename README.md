# 🧠 BRAIN DOCK LIBRARY
### Premium Intelligent Library Management & Digital Sanctuary Ecosystem

---

## 🏛️ Official Brand Identity
- **Brand Name:** BRAIN DOCK LIBRARY
- **Official Brand Colors:**
  - **Deep Violet / Dark Purple:** `#0F021C`, `#18042B`, `#2E0854`
  - **Electric Purple / Violet:** `#7C3AED`, `#8B5CF6`, `#A855F7`
  - **Lavender / Glow:** `#F3E8FF`, `#FAF5FF`
- **Cloudinary Official Logo (CDN):**
  - Primary Logo: `https://res.cloudinary.com/hiifll86/image/upload/v1790483676/braindock/branding/braindock_logo_primary.png`
  - Horizontal Logo: `https://res.cloudinary.com/hiifll86/image/upload/v1790483678/braindock/branding/braindock_logo_horizontal.jpg`

---

## 🏗️ 3-Folder Clean Architecture

```
brain-dock-library/
├── backend/                  # Node.js + Express + Mongoose + JWT + Cloudinary REST API
│   ├── config/               # db.js & cloudinary.js
│   ├── data/                 # seedData.js & store.js (high-speed fallback bridge)
│   ├── models/               # schemas.js (Mongoose models for all 29 modules)
│   ├── routes/               # api.js (Comprehensive REST endpoints)
│   ├── .env                  # MongoDB Atlas URI, Cloudinary keys, JWT secret
│   └── server.js             # Express server on Port 5000
│
├── user-side/                # React 18 + Vite + Tailwind CSS + Lucide Icons (Port 5173)
│   ├── public/logo.png       # Official Brain Dock logo
│   └── src/
│       ├── components/       # Navbar, Footer, DigitalCard, BookCard, NotificationDrawer
│       ├── context/          # AuthContext (JWT auth, smart pass, notifications)
│       └── pages/            # 25 Complete public & member portal pages
│
└── admin-panel/              # React 18 + Vite + Tailwind CSS + Analytics + RBAC (Port 5174)
    ├── public/logo.png       # Official Brain Dock logo
    └── src/
        ├── components/       # AdminSidebar (29 modules), AdminHeader (live RBAC switcher)
        ├── context/          # AdminAuthContext (RBAC governance & roles)
        └── pages/            # All 29 Admin Modules, Reports, Audit Logs, Settings
```

---

## ⚡ Quick Start & Startup

### One-Click Launch (All 3 Services)
Double-click `start.bat` or run:
```bash
node start-all.js
```

### Or Run Individually
1. **Backend:**
   ```bash
   cd backend
   npm start
   # Runs on http://localhost:5000
   ```
2. **User Portal & Digital Library:**
   ```bash
   cd user-side
   npm run dev
   # Runs on http://localhost:5173
   ```
3. **Admin & ERP Panel:**
   ```bash
   cd admin-panel
   npm run dev
   # Runs on http://localhost:5174
   ```

---

## 🔑 Demo Login Accounts

| Role | Email | Password | Access Scope |
|---|---|---|---|
| **Member** | `member@braindock.com` | `member123` | Public Website, Smart Pass, My Books, Room/Seat Booking |
| **Super Admin** | `admin@braindock.com` | `admin123` | Full Access to all 29 modules & system settings |
| **Librarian** | `librarian@braindock.com` | `librarian123` | Books CRUD, Issue/Return, Reservations, Members |
| **Accountant** | `finance@braindock.com` | `finance123` | Financial Ledger, Invoices, Fine Collections, Reports |
| **Content Manager** | `content@braindock.com` | `content123` | Events, Announcements, Gallery, FAQs, Contact Inbox |

---

## 🗄️ MongoDB Atlas & Cloudinary Credentials

### MongoDB Atlas URI:
`mongodb+srv://braindocklibrary_db_user:braindock123@cluster0.7dpsi7g.mongodb.net/braindock_library?retryWrites=true&w=majority&appName=Cluster0`

> **Note on MongoDB Atlas IP Whitelist:**
> Your current machine public IP is `106.215.153.247`. In your MongoDB Atlas dashboard under **Network Access**, add this IP or add `0.0.0.0/0` (Allow Access from Anywhere) to permit cloud database persistence. While Atlas is syncing, our backend operates on an automatic high-speed store bridge so you never experience crashes or timeouts.

### Cloudinary Configuration:
- **Cloud Name:** `hiifll86`
- **API Key:** `462785225922261`
- **API Secret:** `0twa0k3FswbX-vSzSvS1E4eBTsQ`
- **Folder:** `braindock`
