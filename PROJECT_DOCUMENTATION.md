# 📋 InsightFlow AI — Complete Project Documentation

> **Project**: InsightFlow AI — AI-Powered Campaign Intelligence Platform  
> **Tech Stack**: React (Vite) Frontend + Node.js/Express Backend + MongoDB  
> **Theme**: Premium Dark UI with Glass-morphism, Animated Gradients & Purple/Blue Accents  
> **Date**: May 2026

---

## 📑 Table of Contents

1. [Project Overview](#1-project-overview)
2. [Development Timeline & Phases](#2-development-timeline--phases)
3. [Phase 1 — Landing Page](#3-phase-1--landing-page)
4. [Phase 2 — Login Page Design](#4-phase-2--login-page-design)
5. [Phase 3 — Signup Page Design](#5-phase-3--signup-page-design)
6. [Phase 4 — React Router & Navigation Setup](#6-phase-4--react-router--navigation-setup)
7. [Phase 5 — Dashboard Layout (Sidebar, Header, Content)](#7-phase-5--dashboard-layout-sidebar-header-content)
8. [Phase 6 — Dashboard Enhancements (Charts, KPIs, AI Insights)](#8-phase-6--dashboard-enhancements-charts-kpis-ai-insights)
9. [Phase 7 — Campaign Creation Multi-Step Form](#9-phase-7--campaign-creation-multi-step-form)
10. [Phase 8 — All Campaigns Page](#10-phase-8--all-campaigns-page)
11. [Phase 9 — Settings Page](#11-phase-9--settings-page)
12. [Phase 10 — Sidebar Active State Navigation](#12-phase-10--sidebar-active-state-navigation)
13. [Phase 11 — Full Backend & Authentication System](#13-phase-11--full-backend--authentication-system)
14. [Phase 12 — Login API Integration](#14-phase-12--login-api-integration)
15. [Phase 13 — Signup API Integration](#15-phase-13--signup-api-integration)
16. [Phase 14 — Dashboard Image Replacement](#16-phase-14--dashboard-image-replacement)
17. [Phase 15 — START_APP.bat One-Click Launcher](#17-phase-15--start_appbat-one-click-launcher)
18. [Complete File Structure](#18-complete-file-structure)
19. [Design System Summary](#19-design-system-summary)
20. [How to Run the Application](#20-how-to-run-the-application)

---

## 1. Project Overview

**InsightFlow AI** is a full-stack AI-powered campaign intelligence platform. It allows users to create, manage, and analyze marketing campaigns across multiple platforms (Facebook, Instagram, Twitter/X, LinkedIn, Google Ads) using AI-generated content.

### Key Features
- 🎨 **Premium Dark Theme UI** — Glass-morphism, animated gradients, micro-animations
- 🏠 **Animated Landing Page** — Hero, features, testimonials, CTA sections
- 🔐 **Full Authentication** — Register/Login with JWT, password strength indicator
- 📊 **Interactive Dashboard** — KPI cards, charts (line, pie, bar), AI insights panel
- ✍️ **Multi-Step Campaign Creator** — 4-step guided form with AI configuration
- 📋 **Campaigns Manager** — Grid view with status tabs, search, and action buttons
- ⚙️ **Settings Panel** — Profile, Notifications, Security, Billing tabs
- 🖥️ **One-Click Launcher** — `START_APP.bat` starts both frontend & backend

---

## 2. Development Timeline & Phases

The project was built incrementally across **15 phases**, each following a structured process:

```
📝 Planning → 🏗️ Implementation → ✅ Verification → 📖 Walkthrough
```

Each phase went through:
1. **Implementation Plan** — Detailed design document describing what to build, which files to modify/create, and how to verify
2. **Task List** — Checkbox-style TODO list tracking progress
3. **Execution** — Code implementation following the approved plan
4. **Walkthrough** — Post-completion summary documenting changes, testing results, and outcomes

| Phase | Feature | Files Modified/Created |
|-------|---------|----------------------|
| 1 | Landing Page | `LandingPage.jsx`, `LandingPage.css`, `App.jsx` |
| 2 | Login Page Design | `Login.jsx`, `Login.css` |
| 3 | Signup Page Design | `Signup.jsx`, `Signup.css` |
| 4 | Router & Navigation | `App.jsx`, `Dashboard.jsx` |
| 5 | Dashboard Layout | `Dashboard.jsx`, `Dashboard.css`, `index.css` |
| 6 | Dashboard Charts & KPIs | `Dashboard.jsx`, `Dashboard.css`, `package.json` |
| 7 | Campaign Creation Form | `Create.jsx`, `Create.css` |
| 8 | All Campaigns Page | `Campaigns.jsx`, `Campaigns.css`, `App.jsx` |
| 9 | Settings Page | `Settings.jsx`, `Settings.css` |
| 10 | Sidebar Active State | `Dashboard.jsx`, `Dashboard.css` |
| 11 | Backend & Auth System | `server.js`, `User.js`, `Campaign.js`, `auth.js`, `campaigns.js`, `api.js` |
| 12 | Login API Integration | `Login.jsx` |
| 13 | Signup API Integration | `Signup.jsx` |
| 14 | Dashboard Image | `Dashboard.jsx` + generated image |
| 15 | START_APP.bat Launcher | `START_APP.bat` |

---

## 3. Phase 1 — Landing Page

### 📝 Planning
**Goal**: Create a premium, animated landing page as the entry point for InsightFlow AI — showcasing the product, highlighting features, and directing users to sign up or log in.

**Planned Sections**:
- Hero with animated gradient background, headline, CTA buttons, floating shapes
- 3 Feature Cards with glass-morphism
- How It Works — 3-step numbered process
- Testimonials with star ratings
- Final CTA section
- Footer with 4-column grid

### 🏗️ Implementation

**New Files Created:**
- `LandingPage.jsx` — Full landing page component with Hero, Features, How It Works, Testimonials, CTA, and Footer sections
- `LandingPage.css` — Comprehensive stylesheet with animated gradient (`@keyframes gradientShift`), floating shapes (`@keyframes float`), glass-morphism cards, gradient text effects, section fade-in animations, and full responsive design

**Modified Files:**
- `App.jsx` — Added route `/` → LandingPage

### ✅ Verification
- `npm run build` — ✅ No errors
- All sections render correctly
- Animations run smoothly
- Responsive layout works on mobile
- Navigation links function properly

---

## 4. Phase 2 — Login Page Design

### 📝 Planning
**Goal**: Completely redesign the Login page with animated gradient background, split layout (branding left, form right), glass-morphism form card, and premium dark-theme styling.

**Planned Layout**:
- Left panel (55%): Logo, tagline, feature highlights, animated floating shapes
- Right panel (45%): Glass-morphism card with email/password inputs, login button, links

### 🏗️ Implementation

**Modified Files:**
- `Login.jsx` — Split layout with branding panel (logo, tagline, 3 feature highlights, floating shapes) + centered form card ("Welcome Back" heading, email/password inputs with icons, show/hide toggle, Remember Me checkbox, gradient login button, Forgot Password & Sign Up links)
- `Login.css` — Animated gradient background (`@keyframes gradientShift`), split flexbox layout, glass-morphism card (`backdrop-filter: blur(30px)`), dark input styling with purple glow, gradient button, responsive stacking on ≤768px

### ✅ Verification
- `npm run build` — ✅ No errors
- Gradient animates smoothly
- Form centered in right panel
- Login functionality preserved
- Responsive on mobile

---

## 5. Phase 3 — Signup Page Design

### 📝 Planning
**Goal**: Redesign the Signup page to match the premium Login page design — same animated gradient, split layout, glass-morphism, with additional features: password strength indicator and confirm password validation.

### 🏗️ Implementation

**Modified Files:**
- `Signup.jsx` — Split layout matching Login page. Left panel: logo, tagline "Start Your AI Campaign Journey", 3 feature highlights, floating shapes. Right panel: "Create Account" heading, Full Name input, Email input, Password input with show/hide toggle, **password strength indicator** (bar + label: Weak/Fair/Good/Strong), Confirm Password with match validation, Terms checkbox, gradient button, "Already have an account?" link
- `Signup.css` — Same animated gradient and split layout as Login.css. Added: password strength bar (color transition red → orange → yellow → green), custom terms checkbox with gradient fill, all responsive

**Password Strength Logic**: Calculates score based on: length ≥8, uppercase, lowercase, number, special character. Updates bar width and color in real-time.

### ✅ Verification
- `npm run build` — ✅ No errors
- Animated gradient matches login page
- Password strength indicator animates with color changes
- Confirm password validation works
- Responsive layout stacks on mobile

---

## 6. Phase 4 — React Router & Navigation Setup

### 📝 Planning
**Goal**: Set up React Router with all necessary routes and ensure proper navigation between Landing Page, Login, Signup, and Dashboard pages (including nested dashboard routes).

**Planned Routes**:
- `/` → LandingPage
- `/login` → Login
- `/signup` → Signup
- `/dashboard` → Dashboard (layout wrapper with `<Outlet>`)
- `/dashboard/create` → Create (nested)
- `/dashboard/campaigns` → Campaigns (nested)
- `/dashboard/settings` → Settings (nested)

### 🏗️ Implementation

**Modified Files:**
- `App.jsx` — Configured `BrowserRouter`, defined all routes including nested dashboard routes with `<Outlet>`, added catch-all redirect
- `Dashboard.jsx` — Added `<Outlet>` from react-router-dom in the content area for nested child route rendering. Default dashboard content (KPIs, charts) shows at `/dashboard`, child routes render in the Outlet

### ✅ Verification
- `npm run build` — ✅ No errors
- Navigation between all pages works via links and direct URL
- Nested dashboard routes render inside dashboard layout
- Browser back/forward buttons work correctly

---

## 7. Phase 5 — Dashboard Layout (Sidebar, Header, Content)

### 📝 Planning
**Goal**: Fix the broken Dashboard layout — the sidebar wasn't fixed, the header wasn't sticky, colors were mismatched, and content didn't fill the viewport. Restructure into a clean 3-part layout.

**Planned Structure**:
1. Fixed Sidebar (left, 72px, full height)
2. Main Wrapper (right of sidebar)
   - Sticky Header (top)
   - Scrollable Content Area (below header)

### 🏗️ Implementation

**Modified Files:**
- `index.css` — Set `html, body, #root` to `height: 100%; margin: 0; padding: 0; overflow: hidden` to prevent double scrollbars
- `Dashboard.css` — Complete rewrite:
  - Root: `display: flex; height: 100vh; overflow: hidden`
  - Sidebar: `position: fixed; width: 72px; height: 100vh; z-index: 100` — dark background (`#0a0a1a`), glass borders, purple accent lines
  - Main wrapper: `margin-left: 72px; flex: 1; flex-direction: column; height: 100vh; overflow: hidden`
  - Header: `position: sticky; top: 0; z-index: 50` — `backdrop-filter: blur(20px)` for glass effect
  - Content: `flex: 1; overflow-y: auto` — only this area scrolls, custom scrollbar styling
- `Dashboard.jsx` — Complete restructure: Fixed sidebar (logo, nav icons, avatar) → Main wrapper (sticky header with search/notifications/user → scrollable content with KPIs, tables, widgets)

### ✅ Verification
- `npm run build` — ✅ No errors
- Sidebar fixed on left (72px), always visible
- Header sticks to top of main content area
- Only content area scrolls
- Dark theme consistent, premium glass effects throughout

---

## 8. Phase 6 — Dashboard Enhancements (Charts, KPIs, AI Insights)

### 📝 Planning
**Goal**: Enhance the Dashboard with interactive data visualizations, animated KPI cards with count-up effects, and an AI Insights panel with campaign recommendations.

**Planned Components**:
- 4 KPI Cards with animated counters and trend indicators
- 4 Charts (Recharts): Campaign Performance line/area, Platform Distribution pie, Budget Overview bar, Conversion Funnel area
- AI Insights Panel: Recommendations, Trending Topics, Best Performing Time
- Recent Activity Feed with timeline layout

### 🏗️ Implementation

**New Dependencies**: `recharts` added to `package.json`

**Modified Files:**
- `Dashboard.jsx` — Major enhancement with 4 sections:
  - **KPI Cards**: Total Campaigns, Active Campaigns, Total Reach, Conversion Rate — animated count-up effect using `useEffect`/`setInterval`, trend indicators (↑ green/↓ red), glass-morphism with gradient left border
  - **Charts**: Recharts `AreaChart` (7-day performance), `PieChart` (platform distribution), `BarChart` (budget allocated vs spent), stacked area (conversion funnel) — all with custom dark-theme tooltips
  - **AI Insights**: Recommendations card (4 bullets), Trending Topics (tag pills), Best Performing Time card — glass-morphism with gradient accents
  - **Activity Feed**: Timeline-style event list with colored dots and timestamps
- `Dashboard.css` — KPI grid (4→2→1 columns responsive), chart containers with dark backgrounds, AI insight cards with gradient borders, activity feed timeline, custom chart tooltip styling

### ✅ Verification
- `npm run build` — ✅ No errors
- All 4 KPI cards render with animated counters
- All 4 charts render with sample data, tooltips work
- AI insights panel displays all 3 sections
- Activity feed shows timeline with events
- Dark theme consistent, responsive layout adapts

---

## 9. Phase 7 — Campaign Creation Multi-Step Form

### 📝 Planning
**Goal**: Transform the Create page from a placeholder into a fully functional, multi-step campaign creation form with 4 steps, premium animations, and backend API integration.

**Planned Steps**:
1. Campaign Basics (name, type, brand, audience)
2. AI Configuration (tone cards, content length slider, messages, CTA)
3. Schedule & Budget (dates, budget, platform checkboxes)
4. Review & Generate (summary + API call)

### 🏗️ Implementation

**New Files Created:**
- `Create.css` — 400+ lines of dark-themed styling: step progress indicator with animated states, glass-morphism form cards, dark inputs with purple focus glow, interactive tone selector cards (hover scale/glow, gradient border on selected), custom platform checkboxes with gradient fill, custom range slider, review summary cards, gradient generate button with pulse animation, step transitions (`@keyframes fadeSlideUp`), responsive design

**Modified Files:**
- `Create.jsx` — Complete rebuild as multi-step form:
  - **Step 1**: Campaign Name, Type dropdown, Brand Name, Target Audience textarea
  - **Step 2**: 5 Tone cards (Professional, Casual, Exciting, Luxury, Friendly — each with emoji/description), Content Length slider (Short/Medium/Long), Key Messages, CTA input
  - **Step 3**: Start/End date pickers, Budget with $ prefix, Platform multi-select (5 platforms with custom checkboxes)
  - **Step 4**: Summary cards organized by section, "Generate Campaign" button → `POST /api/campaigns/generate`, loading spinner, error handling
  - State: `formData` object, `currentStep` (1-4), `isGenerating`/`error`, `validateStep()` per step

### ✅ Verification
- `npm run build` — ✅ No errors
- All 4 steps render with proper styling
- Step navigation with validation works
- Progress indicator updates and animates
- Tone cards interactive, platform checkboxes work
- Review step shows all entered data
- Generate button triggers API call with loading state
- Responsive layout works

---

## 10. Phase 8 — All Campaigns Page

### 📝 Planning
**Goal**: Add a dedicated "All Campaigns" page with status filter tabs (All, Active, Draft, Completed, Paused), search bar, and detailed campaign cards showing platform icons, metrics, and action buttons.

### 🏗️ Implementation

**New Files Created:**
- `Campaigns.jsx` — Status tabs at top (All/Active/Draft/Completed/Paused), search bar filtering by name, responsive card grid. Each card shows: campaign name, type badge, color-coded status pill, platform icons row, performance metrics (impressions, clicks, conversions), date range, action buttons (View, Edit, Pause/Resume). Empty state when no matches. Fetches from `GET /api/campaigns`
- `Campaigns.css` — Glass-morphism cards with hover lift/glow, color-coded status pills (Active=green, Draft=yellow, Completed=blue, Paused=gray), animated tab indicator, responsive grid (3→2→1 columns), custom search input with icon

**Modified Files:**
- `App.jsx` — Added route `/dashboard/campaigns` → Campaigns
- `Dashboard.jsx` — Updated sidebar "Campaigns" link to use React Router navigation

### ✅ Verification
- `npm run build` — ✅ No errors
- Status tabs filter correctly
- Search filters by campaign name
- Campaign cards display all information
- Responsive layout adapts
- Navigation from sidebar works

---

## 11. Phase 9 — Settings Page

### 📝 Planning
**Goal**: Fix and complete the Settings page — restyle to match premium dark theme and ensure all 4 tabs (Profile, Notifications, Security, Billing) are fully functional.

### 🏗️ Implementation

**Modified Files:**
- `Settings.css` — Full dark-theme overhaul: horizontal tabs with animated gradient underline, glass-morphism sections, dark inputs with purple focus glow, custom CSS toggle switches with gradient fill, circular avatar with edit overlay, billing plan cards with gradient borders, gradient save buttons with hover scale, responsive stacking
- `Settings.jsx` — Complete rebuild with 4 working tabs:
  - **Profile**: Avatar, Full Name, Email, Bio, Save button
  - **Notifications**: 6 toggle switches (Email, Push, SMS, Campaign Updates, Weekly Reports, Performance Alerts) — independently controlled via state
  - **Security**: Current/New/Confirm Password inputs, Two-Factor Authentication toggle, Login Notifications toggle, Update Password button
  - **Billing**: Current plan card (Pro Plan $49/mo), feature list, usage stats (API calls, campaigns, storage), Upgrade button

### ✅ Verification
- `npm run build` — ✅ No errors
- All 4 tabs render and switch correctly
- Form inputs accept data, toggles animate and track state
- Dark theme consistent, responsive on mobile

---

## 12. Phase 10 — Sidebar Active State Navigation

### 📝 Planning
**Goal**: Sidebar navigation links don't highlight the currently active page. Add active state styling based on the current route.

### 🏗️ Implementation

**Modified Files:**
- `Dashboard.jsx` — Replaced `<Link>` with `<NavLink>` from React Router for all 4 sidebar items. Each uses `className` callback: applies `active` class when route matches. Routes: `/dashboard` (exact), `/dashboard/create`, `/dashboard/campaigns`, `/dashboard/settings`
- `Dashboard.css` — Added `.sidebar-nav-item.active` styles: 3px left border (`#6c63ff` purple), `rgba(108,99,255,0.1)` background glow, bright white icon color, border-radius, smooth `transition: all 0.3s ease`

### ✅ Verification
- `npm run build` — ✅ No errors
- Navigated to each page — correct sidebar icon highlights each time
- Transitions smooth when switching

---

## 13. Phase 11 — Full Backend & Authentication System

### 📝 Planning
**Goal**: Build a complete Node.js/Express backend with MongoDB — user authentication (register/login/logout), JWT-based sessions, campaign CRUD API, and connect the React frontend.

### 🏗️ Implementation

**New Backend Files:**
- `package.json` — Dependencies: express, mongoose, bcryptjs, jsonwebtoken, cors, dotenv, cookie-parser. Scripts: start, dev (nodemon)
- `.env` — PORT=5000, MONGO_URI, JWT_SECRET
- `server.js` — Express setup, MongoDB connection via Mongoose, CORS middleware, route mounting (/api/auth, /api/campaigns), error handling middleware
- `models/User.js` — Mongoose schema: name, email (unique), password (hashed). Pre-save hook for bcrypt hashing, method to compare passwords
- `middleware/auth.js` — JWT verification middleware. Extracts token from Authorization header or cookie, attaches user to request
- `routes/auth.js` — `POST /register` (create user, hash password, return JWT), `POST /login` (validate credentials, return JWT), `GET /me` (protected, get current user), `POST /logout` (clear cookie)
- `models/Campaign.js` — Mongoose schema: name, type, brand, audience, tone, contentLength, messages, cta, startDate, endDate, budget, platforms, status, generatedContent, userId (ref), createdAt
- `routes/campaigns.js` — Full CRUD: `GET /` (list user's campaigns), `POST /generate` (create new), `GET /:id`, `PUT /:id`, `DELETE /:id` — all protected by auth middleware

**New Frontend Files:**
- `src/utils/api.js` — Axios instance with base URL → backend, request interceptor attaching JWT from localStorage, response interceptor for 401 handling

**Modified Frontend Files:**
- `Login.jsx` — Connected to `POST /api/auth/login`
- `Signup.jsx` — Connected to `POST /api/auth/register`

### ✅ Verification
- Backend starts and connects to MongoDB — ✅
- `npm run build` on frontend — ✅ No errors
- Register → Login → Dashboard flow works
- JWT protection working (401 without token)

---

## 14. Phase 12 — Login API Integration

### 📝 Planning
**Goal**: Connect the Login page UI to the backend authentication API with proper loading states, error handling, and JWT storage.

### 🏗️ Implementation

**Modified Files:**
- `Login.jsx`:
  - Imported `api` axios instance
  - `handleSubmit`: prevents default, sets loading, sends `POST /api/auth/login`, stores JWT in localStorage, redirects to `/dashboard` via `useNavigate`
  - Error handling: extracts message from API response, shows in styled red error banner
  - `isLoading` state: disables button, shows "Signing in..."
  - `error` state: red banner above inputs with error text

### ✅ Verification
- `npm run build` — ✅ No errors
- Login connects to backend API
- JWT stored in localStorage on success
- Redirects to `/dashboard`
- Error messages display correctly
- Loading state works

---

## 15. Phase 13 — Signup API Integration

### 📝 Planning
**Goal**: Connect the Signup page to the backend API with validation, loading states, and error handling.

### 🏗️ Implementation

**Modified Files:**
- `Signup.jsx`:
  - Imported `api` axios instance
  - Validates: all fields filled, passwords match, terms accepted
  - Sends `POST /api/auth/register` with `{ name, email, password }`
  - On success: stores JWT, redirects to `/dashboard`
  - On error: displays server error (e.g., "Email already registered")
  - Loading state during API call

### ✅ Verification
- `npm run build` — ✅ No errors
- Signup with valid data → redirects to dashboard
- Existing email → shows error
- Mismatched passwords → validation error
- Empty fields → validation errors

---

## 16. Phase 14 — Dashboard Image Replacement

### 📝 Planning
**Goal**: Replace the static "outfitters" placeholder image on the Dashboard with an AI-generated brand image matching the InsightFlow AI aesthetic.

### 🏗️ Implementation

- Used `generate_image` tool to create a premium, futuristic brand image (dark background, purple/blue gradient lighting, abstract geometric shapes, glowing nodes and connection lines)
- Saved generated image to `public/` directory
- Updated `Dashboard.jsx` image `src` to reference the new AI-generated image

### ✅ Verification
- `npm run build` — ✅ No errors
- New image displays correctly on dashboard
- Fits the dark/premium aesthetic
- Proper aspect ratio within card layout

---

## 17. Phase 15 — START_APP.bat One-Click Launcher

### 📝 Planning
**Goal**: Create a batch file that launches both backend and frontend with a single double-click.

### 🏗️ Implementation

**New File Created:**
- `START_APP.bat`:
  - ASCII art welcome banner with "InsightFlow AI" branding
  - Opens new terminal "InsightFlow AI — Backend" → `cd autocampaign-backend && npm start`
  - 3-second delay for MongoDB connection
  - Opens new terminal "InsightFlow AI — Frontend" → `cd autocampaign-frontend && npm run dev`
  - Color-coded console status messages
  - Launcher window stays open with "Both servers running" message

### ✅ Verification
- Batch file created at correct path — ✅
- Content includes proper `start` commands for both servers
- Correct Windows batch execution structure

---

## 18. Complete File Structure

```
InsightFlow AI/
├── START_APP.bat                          # One-click launcher
├── .gitignore
├── mg.jpg
│
├── autocampaign-backend/
│   ├── .env                               # Environment variables
│   ├── package.json                       # Backend dependencies
│   ├── server.js                          # Express server entry point
│   ├── middleware/
│   │   └── auth.js                        # JWT verification middleware
│   ├── models/
│   │   ├── User.js                        # User schema (bcrypt hashing)
│   │   └── Campaign.js                    # Campaign schema
│   └── routes/
│       ├── auth.js                        # Auth API (register/login/me/logout)
│       └── campaigns.js                   # Campaign CRUD API
│
└── autocampaign-frontend/
    ├── package.json                       # Frontend dependencies (includes recharts)
    └── src/
        ├── index.css                      # Global styles (viewport lock)
        ├── App.jsx                        # React Router configuration
        ├── utils/
        │   └── api.js                     # Axios instance with JWT interceptor
        └── pages/
            ├── LandingPage.jsx            # Animated landing page
            ├── LandingPage.css
            ├── Login.jsx                  # Login with API integration
            ├── Login.css
            ├── Signup.jsx                 # Signup with strength indicator
            ├── Signup.css
            ├── Dashboard.jsx              # Dashboard layout + content
            ├── Dashboard.css
            ├── Create.jsx                 # Multi-step campaign form
            ├── Create.css
            ├── Campaigns.jsx              # All campaigns with filters
            ├── Campaigns.css
            ├── Settings.jsx               # Settings with 4 tabs
            └── Settings.css
```

---

## 19. Design System Summary

### Color Palette
| Token | Value | Usage |
|-------|-------|-------|
| `--bg-primary` | `#0a0a1a` | Main background, sidebar |
| `--bg-secondary` | `#0f0f2e` | Card backgrounds |
| `--bg-tertiary` | `#1a1a3e` | Hover states |
| `--accent-primary` | `#6c63ff` | Primary accent, buttons |
| `--accent-secondary` | `#a855f7` | Gradient end, highlights |
| `--gradient` | `#6c63ff → #a855f7` | Buttons, borders, accents |
| `--text-primary` | `#ffffff` | Headings, active text |
| `--text-secondary` | `rgba(255,255,255,0.7)` | Body text, subtitles |
| `--glass-bg` | `rgba(255,255,255,0.03-0.05)` | Glass-morphism backgrounds |

### Effects
- **Glass-morphism**: `backdrop-filter: blur(20-30px)` + `rgba` backgrounds + subtle borders
- **Animated Gradients**: `@keyframes gradientShift` with `background-size: 400% 400%`
- **Floating Shapes**: `@keyframes float` with varied delays and durations
- **Count-up Animation**: `useEffect` + `setInterval` for KPI number counters
- **Step Transitions**: `@keyframes fadeSlideUp` for form step changes
- **Hover Effects**: Scale transforms, glow shadows, color transitions

### Typography
- Clean sans-serif system fonts
- Large bold headings for hero sections
- Gradient text effect via `-webkit-background-clip: text`

### Responsive Breakpoints
- Desktop: Full layout (sidebar + header + content)
- Tablet (≤768px): Stacked layouts, reduced columns
- Mobile: Single column, hidden decorative elements

---

## 20. How to Run the Application

### Prerequisites
- Node.js (v16+)
- MongoDB (running locally or MongoDB Atlas connection string)

### Quick Start (One-Click)
```
Double-click START_APP.bat
```

### Manual Start
```bash
# Terminal 1 — Backend
cd autocampaign-backend
npm install
npm start

# Terminal 2 — Frontend
cd autocampaign-frontend
npm install
npm run dev
```

### Environment Configuration
Edit `autocampaign-backend/.env`:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/insightflow
JWT_SECRET=your-secret-key-here
```

### Access
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000

---

> **Document Generated**: May 2026  
> **Total Implementation Plans**: 15  
> **Total Walkthroughs**: 11  
> **All Builds**: ✅ Passed  
> **Status**: Complete & Functional
