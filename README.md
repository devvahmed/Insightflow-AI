# 🚀 InsightFlow AI — AI-Powered Campaign Intelligence Platform

> **An intelligent, multi-agent marketing campaign system for Pakistani small businesses — powered by Gemini AI, live web intelligence, and real-time creative asset generation.**

![Python](https://img.shields.io/badge/Backend-Python_FastAPI-009688?style=flat-square&logo=fastapi)
![React Native](https://img.shields.io/badge/Frontend-React_Native_Expo-61DAFB?style=flat-square&logo=react)
![Gemini](https://img.shields.io/badge/AI-Google_Gemini-4285F4?style=flat-square&logo=google)
![Resend](https://img.shields.io/badge/Email-Resend_API-000000?style=flat-square)

---

## 📑 Table of Contents

1. [Problem Statement](#-problem-statement)
2. [Solution Overview](#-solution-overview)
3. [Architecture Overview](#-architecture-overview)
4. [Multi-Agent Pipeline — The Core Engine](#-multi-agent-pipeline--the-core-engine)
5. [APIs Used (Real & Mock)](#-apis-used-real--mock)
6. [Key Integrations](#-key-integrations)
7. [Frontend Design](#-frontend-design)
8. [Traceability & Observability](#-traceability--observability)
9. [How to Run](#-how-to-run)
10. [Project Structure](#-project-structure)
11. [Demo Scenarios](#-demo-scenarios)
12. [Technical Decisions & Trade-offs](#-technical-decisions--trade-offs)
13. [Team & Credits](#-team--credits)

---

## 🎯 Problem Statement

Small and medium businesses in Pakistan (restaurants, fashion brands, beauty products, electronics stores, etc.) lack the resources and expertise to run data-driven marketing campaigns. They need:

- **Market intelligence** — who are their competitors and what deals are they running?
- **Strategic guidance** — what high-margin growth moves should they make?
- **Creative assets** — ad images, videos, and bilingual copy (Roman Urdu + English)
- **Execution** — actually send campaigns to customer leads via email

**InsightFlow AI solves all four problems in a single automated pipeline.**

---

## 💡 Solution Overview

InsightFlow AI is a **multi-agent, AI-orchestrated campaign generation system** that takes a business owner from raw data to fully executed marketing campaign in under 60 seconds.

### Core Flow

```
User Registration (with brand website crawling)
        ↓
Upload Business Data (5 sources: CSV, PDF, News, Social, Web URL)
        ↓
┌─────────────────────────────────────────────────┐
│           🧠 4-Agent AI Pipeline                │
│                                                 │
│  Agent 1: Data Intelligence (Live Search + AI)  │
│       ↓                                         │
│  Agent 2: Strategy Engine (ROI-Optimized)       │
│       ↓                                         │
│  Agent 3: Creative Assets (Image + Video + Copy)│
│       ↓                                         │
│  Agent 4: Execution (Email Dispatch + Recovery) │
└─────────────────────────────────────────────────┘
        ↓
User Reviews Strategy → Approves → Campaign Executed
        ↓
Real Emails Sent to Customer Leads via Resend API
```

### What Makes It Special

| Feature | Description |
|---------|-------------|
| **Multi-Agent Architecture** | 4 specialized AI agents working in sequence, each with its own reasoning, tool calls, and trace logs |
| **Live Web Intelligence** | Real-time Google Custom Search + DuckDuckGo scraping for competitor tracking and Pakistani trend discovery |
| **Brand-Aware Registration** | On signup, the system crawls the user's website to auto-detect brand colors, persona, industry category, products, and logo |
| **Bilingual Content** | All ad copy generated in both Roman Urdu and English — culturally relevant for Pakistani audiences |
| **Real Email Dispatch** | Actual emails sent to customer leads via Resend API with premium HTML templates branded with the user's colors and logo |
| **AI Image + Video Generation** | Ad images via Pollinations AI, promotional videos via Fal.ai Luma Dream Machine |
| **Full Traceability** | Every agent decision is logged with reasoning, tool calls, confidence scores, and latency — viewable in the Trace Screen |
| **Offline-Resilient** | Every agent has a dynamic fallback engine — if Gemini API is rate-limited, the system generates intelligent local responses |
| **Live Competitor Tracking** | Dedicated `/api/competitors/live` endpoint fetches real competitor promotions, generates strategic counter-insights |
| **14-Industry Knowledge Base** | Curated competitor database covering 14 Pakistani industry verticals (food, fashion, automotive, real estate, etc.) |

---

## 🏗 Architecture Overview

```
┌──────────────────────────────────┐     ┌───────────────────────────────────┐
│     📱 FRONTEND                  │     │          🖥️ BACKEND               │
│     React Native (Expo)          │     │          Python FastAPI            │
│     TypeScript                   │     │                                   │
│                                  │     │  ┌─────────────────────────────┐  │
│  ┌──────────┐ ┌───────────────┐  │     │  │     AGENT PIPELINE          │  │
│  │ Auth     │ │ Dashboard     │  │     │  │                             │  │
│  │ Screen   │ │ Screen        │  │◄───►│  │  Agent 1: Data Intelligence │  │
│  ├──────────┤ ├───────────────┤  │     │  │      ↓                      │  │
│  │ Upload   │ │ Strategy      │  │HTTP │  │  Agent 2: Strategy          │  │
│  │ Screen   │ │ Screen        │  │REST │  │      ↓                      │  │
│  ├──────────┤ ├───────────────┤  │     │  │  Agent 3: Creative          │  │
│  │ Assets   │ │ Approval      │  │     │  │      ↓                      │  │
│  │ Screen   │ │ Screen        │  │     │  │  Agent 4: Execution         │  │
│  ├──────────┤ ├───────────────┤  │     │  └─────────────────────────────┘  │
│  │ Insight  │ │ Trace Screen  │  │     │                                   │
│  │ Screen   │ │ (Observability│  │     │  ┌─────────────────────────────┐  │
│  │          │ │  Dashboard)   │  │     │  │     SERVICES LAYER           │  │
│  ├──────────┤ ├───────────────┤  │     │  │                             │  │
│  │ Outcome  │ │ Contradiction │  │     │  │  • ai_service (Gemini)      │  │
│  │ Screen   │ │ Screen        │  │     │  │  • search_service (Google)  │  │
│  └──────────┘ └───────────────┘  │     │  │  • image_service (AI Gen)   │  │
│                                  │     │  │  • video_service (Fal.ai)   │  │
│  State: Zustand                  │     │  │  • email_service (Resend)   │  │
│  HTTP: Axios                     │     │  │  • scraper_service (HTTPX)  │  │
│                                  │     │  └─────────────────────────────┘  │
│  Components:                     │     │                                   │
│  • AlertCard, StatusBadge        │     │  Storage: JSON files (traces/)    │
│  • AppTour, FuturisticLoader     │     │  Auth: SHA-256 hashed passwords   │
└──────────────────────────────────┘     └───────────────────────────────────┘
                                                       │
                                         ┌─────────────┼─────────────┐
                                         ↓             ↓             ↓
                                   ┌──────────┐ ┌───────────┐ ┌───────────┐
                                   │ Google   │ │ Gemini    │ │ External  │
                                   │ Custom   │ │ 2.5 Flash │ │ Services  │
                                   │ Search   │ │ (Multi-   │ │ • Resend  │
                                   │ API      │ │  Model    │ │ • Fal.ai  │
                                   │          │ │  Fallback)│ │ • Pollin. │
                                   │ DuckDuck │ │           │ │ • Clearbit│
                                   │ Go (Free)│ │           │ │           │
                                   └──────────┘ └───────────┘ └───────────┘
```

### Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React Native (Expo) + TypeScript | Cross-platform mobile app (iOS, Android, Web) |
| **Backend** | Python FastAPI + Uvicorn | REST API server with async support |
| **AI Engine** | Google Gemini 2.5 Flash (with multi-model sequential fallback) | LLM reasoning for all 4 agents |
| **State Management** | Zustand | Lightweight client-side state (user store, campaign store) |
| **HTTP Client** | Axios (frontend) + HTTPX (backend) | API communication |
| **Data Storage** | JSON files (`traces/`, `users.json`) | Lightweight, file-based persistence |
| **Authentication** | SHA-256 password hashing + session management | User registration and login |

---

## 🤖 Multi-Agent Pipeline — The Core Engine

The heart of InsightFlow AI is a **4-agent sequential pipeline** where each agent has a specific role, its own Gemini prompt, tool calls, and trace logging.

### Agent 1: Data Intelligence Agent (`agent1_data.py`)

**Role**: Ingest 5 business data sources + live web search results, extract anomalies, contradictions, credibility scores, temporal trends, and competitor analysis.

**Inputs**:
- 📊 CSV Sales Data
- 📄 PDF Business Report
- 📰 News / Competitor Activity
- 💬 Social Posts / Customer Feedback
- 🔗 Web URL / Live Content

**Tool Calls**:
1. `search_competitors()` — Live Google Custom Search for competitor brands and their current promotions in Pakistan
2. `search_pakistan_trends()` — Live search for what's trending in Pakistan today (viral topics, events)
3. `detect_anomalies()` — Gemini-powered analysis combining business data + live web intelligence

**Output**: Structured JSON containing insights, contradictions, credibility scores, temporal trends, competitor analysis, and trend integration strategy.

**Language Adaptation**: Generates output in Roman Urdu (for "beginner" users) or Advanced Professional English (for "expert" users).

**Fallback**: If Gemini is rate-limited, constructs dynamic local responses using city detection, product extraction, and pre-built templates.

---

### Agent 2: Strategy Agent (`agent2_strategy.py`)

**Role**: Consume Agent 1's data intelligence and generate a high-margin growth strategy with actionable steps, ROI predictions, and budget validation.

**Design Philosophy**: Operates as a "McKinsey/BCG-tier Growth Strategist" — strictly avoids generic flat discounts and instead recommends:
- Value-added bundling (combo meals, outfit sets, starter kits)
- AOV (Average Order Value) threshold rewards
- Premium positioning strategies
- Customer lifetime value (LTV) loyalty programs

**Tool Calls**:
1. `classify_niche()` — Universal niche classifier that maps products/business type to one of 10 category archetypes (quick_service_restaurant, desi_dining, cafe_beverage, fashion_apparel, electronics_tech, etc.)
2. `generate_strategy()` — Gemini prompt engineered for high-margin action chains
3. `check_constraints()` — Budget feasibility validation

**Output**: Root cause analysis, 3-5 step action chain with per-step budgets, ROI prediction (low/mid/high %), and constraint check.

**Fallback**: Fully dynamic offline strategy builder that constructs tailored action plans from the niche classifier output — works for ANY business type.

---

### Agent 3: Creative Asset Agent (`agent3_creative.py`)

**Role**: Generate bilingual ad copy (Roman Urdu + English), an AI-generated ad image, and a promotional video — all culturally relevant to Pakistan and dynamically integrated with live trending topics.

**Tool Calls**:
1. `search_pakistan_trends()` — Fetch today's viral Pakistani trend
2. `search_competitors()` — Competitor brand context
3. `generate_copy(lang='bilingual', trend_injected=True)` — Gemini generates ad copy that naturally weaves in the trending topic
4. `generate_ad_image(style='Pakistani_commercial')` — AI image generation via Pollinations AI
5. `generate_ad_video(endpoint='Fal.ai Luma Dream Machine')` — 10-15s promotional video generation

**Ad Copy Structure**:
```json
{
  "headline_urdu": "Roman Urdu headline referencing trend",
  "headline_english": "Punchy English headline",
  "body_urdu": "Casual friend-tone copy with FOMO",
  "body_english": "3-sentence persuasive English copy",
  "cta_urdu": "Roman Urdu call-to-action",
  "cta_english": "English CTA",
  "email_subject": "FOMO-driven email subject line",
  "email_body": "Persuasive email integrating the trending topic"
}
```

**Image Generation**: Uses culturally-aware prompts for different business types (Pakistani food photography, Lahori fashion photoshoot, karak chai aesthetic, etc.)

**Fallback**: Pre-built bilingual copy templates for 7 business verticals (food, chai, fashion, sports, electronics, beauty, generic) with trend injection.

---

### Agent 4: Execution Agent (`agent4_execution.py`)

**Role**: Execute the approved strategy by simulating multi-channel campaign deployment with deliberate failure simulation and automatic recovery.

**Execution Flow**:
1. Iterates through approved action chain steps
2. Simulates SMS API failure (504 Gateway Timeout)
3. Automatically recovers via WhatsApp API fallback
4. Reports success/failure/recovery for each step

**Unique Feature — Bulk Email Dispatch**: When the user uploads a CSV of customer email leads and approves the campaign, Agent 4 triggers **real email sending** via Resend API as a background task. Emails are branded with the user's:
- Brand colors (hex)
- Logo (auto-resolved via Clearbit)
- Business name
- AI-generated ad copy and images

---

## 🔌 APIs Used (Real & Mock)

### ✅ Real APIs (Live in Production)

| API | Provider | Purpose | Usage |
|-----|----------|---------|-------|
| **Gemini AI** | Google | LLM reasoning for all 4 agents | `google-generativeai` SDK. Sequential model fallback: `gemini-2.5-flash` → `gemini-1.5-flash` → `gemini-1.5-pro` → `gemini-2.0-flash-exp` |
| **Google Custom Search** | Google | Live competitor search, Pakistan trending topics, product image search | REST API with API key + Search Engine ID. Searches with `gl=pk`, `dateRestrict=d7` for fresh results |
| **DuckDuckGo Search** | DuckDuckGo | Free keyless fallback for competitor ad discovery when Google quota exhausts | `duckduckgo-search` Python library. Text search + Image search |
| **Resend Email** | Resend | Actual campaign email dispatch to customer leads | `resend` SDK. Premium HTML email templates with brand colors, logo, ad image, video link, and CTA button |
| **Pollinations AI** | Pollinations | Free AI image generation for ad creatives | REST API. Dynamic prompts with brand color, product name, and business type |
| **Fal.ai Luma Dream Machine** | Fal.ai | AI video generation (10-15s promotional clips) | Async Queue API: submit job → poll status → get video URL |
| **Clearbit Logo** | Clearbit | Auto-resolve brand logos from domain names | `https://logo.clearbit.com/{domain}` with HEAD verification |
| **Google Favicon** | Google | Fallback logo resolution when Clearbit fails | `https://www.google.com/s2/favicons?sz=128&domain={domain}` |

### 🧪 Mock / Fallback Data

| Component | Purpose | Details |
|-----------|---------|---------|
| **Mock Scenarios** | Demo/testing without real data | 3 pre-built JSON scenarios: Lahore Soap Brand, Karachi Inventory, Restaurant Pricing. Located in `mock_data/` |
| **Pakistani Brands Database** | Offline competitor resolution | Curated database of 100+ Pakistani brands across 14 verticals (food, fashion, footwear, beauty, electronics, automotive, health_fitness, home_furniture, grocery, real_estate, jewelry, travel, education, digital) with brand colors and active deal templates |
| **Fallback Trends** | When Google Search quota exhausts | Returns "Current Local Market Momentum" with generic but relevant market insight |
| **Fallback Competitors** | When search fails | Returns "{Product} Competitor A/B" with generic promotional snippets |
| **Fallback Ad Copy** | When Gemini is rate-limited | Pre-built bilingual copy templates for 7 business verticals with live trend injection |
| **Fallback Videos** | When Fal.ai fails or times out | Niche-matched B-roll videos from public sources |

---

## 🔗 Key Integrations

### 1. Brand Website Crawling (Registration Flow)

When a user registers, the backend:
1. Scrapes their website URL using `scraper_service.py` (HTTPX + regex-based HTML parsing)
2. Extracts title, description, keywords, logo, and visible text
3. Sends extracted content to **Gemini** for brand identity analysis
4. Returns: `brand_color`, `brand_persona`, `business_type`, `products[]`, `logo_url`
5. All future campaigns use this brand context automatically

### 2. Live Competitor Intelligence

The `/api/competitors/live` endpoint:
1. Loads the user's registered brand context (business type, products)
2. Runs the **local specialized matcher** (`resolve_competitors_locally()`) against the 14-vertical curated database
3. Fires parallel live searches for both competitors via Google/DuckDuckGo
4. Extracts active promotional deals from search snippets using regex pattern matching
5. Attempts **Gemini synthesis** for McKinsey-grade counter-insights
6. Falls back to local `generate_counter_insight()` if Gemini is unavailable
7. Returns competitor data + AI counter-strategy + brand color

### 3. Email Campaign Execution

When the user approves a campaign with customer leads:
1. Frontend sends CSV file via multipart/form-data to `/api/approve`
2. Backend parses CSV, validates email addresses, logs parsing trace
3. Agent 4 executes the strategy steps
4. **Background task** dispatches branded HTML emails to all leads via Resend API
5. Each email contains: brand-colored header, logo, ad copy, AI-generated image, video link, CTA button
6. Dispatch results are logged in the trace

### 4. AI Asset Generation Pipeline

```
Gemini generates image prompt
       ↓
Pollinations AI generates the ad image (1024x512, brand-colored)
       ↓
Gemini generates video prompt (linking product + strategy + trend)
       ↓
Fal.ai Luma Dream Machine generates 10-15s promotional video
       ↓
Both URLs returned in Agent 3 output
```

---

## 📱 Frontend Design

### Screens (11 total)

| Screen | Purpose |
|--------|---------|
| `WelcomeScreen` | Animated onboarding with app introduction |
| `AuthScreen` | Login + Registration with brand theme toggle, website URL, business type, and products input |
| `DashboardScreen` | Main hub — upload data, set budget, select knowledge level, trigger analysis pipeline |
| `InsightScreen` | Displays Agent 1 output: anomalies, credibility scores, temporal trends |
| `ContradictionScreen` | Displays data contradictions detected by Agent 1 |
| `StrategyScreen` | Displays Agent 2 output: root cause, action chain, ROI predictions |
| `AssetsScreen` | Displays Agent 3 output: bilingual ad copy, AI-generated image, promotional video player |
| `ApprovalScreen` | Campaign review + CSV lead upload + budget confirmation → triggers Agent 4 execution |
| `OutcomeScreen` | Displays Agent 4 results: execution steps, success/failure/recovery status, costs |
| `TraceScreen` | Full observability dashboard: agent trace logs, tool calls, reasoning, latency metrics |

### Components

| Component | Purpose |
|-----------|---------|
| `AlertCard` | Styled notification cards for insights and warnings |
| `StatusBadge` | Color-coded status indicators (SUCCESS/FAILED/RECOVERED) |
| `FuturisticLoader` | Animated loading screen during pipeline execution |
| `AppTour` | Interactive guided tour for first-time users |

### State Management

- **Zustand** stores:
  - `userStore.ts` — User authentication state, brand context (email, business_name, brand_color, products, logo_url)
  - `campaignStore.ts` — Campaign pipeline state (job_id, inputs, strategy, assets, execution results)

---

## 🔍 Traceability & Observability

Every agent produces a `TraceLog` entry with:

```json
{
  "job_id": "JOB-XXXXXXXX",
  "agent": "DataIntelligenceAgent | StrategyAgent | CreativeAssetAgent | ExecutionAgent",
  "timestamp": "2026-05-20T18:30:00Z",
  "workplan": "What the agent planned to do",
  "tool_calls": ["search_competitors()", "generate_strategy()", ...],
  "reasoning": "Why the agent made this decision",
  "decision": "What was decided",
  "confidence": 0.95,
  "latency_ms": 3200,
  "output_summary": "Brief summary of results"
}
```

All traces are persisted to `traces/{job_id}.json` and viewable in the **Trace Screen** — enabling full pipeline observability and debugging.

Additional trace logs:
- **Asset Generation Trace** — image/video generation latency, seeds, URLs
- **Resend Dispatch Trace** — email delivery status per recipient
- **Lead Parsing Trace** — CSV validation errors, email counts

---

## ⚙ How to Run

### Prerequisites
- Python 3.10+
- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)

### Backend Setup

```bash
cd autocampaign-backend
pip install -r requirements.txt
pip install duckduckgo-search

# Configure environment variables in .env
# (Gemini API Key, Google Search keys, Resend API key, Fal.ai key)

# Start the server
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### Frontend Setup

```bash
cd autocampaign-frontend
npm install

# Start Expo dev server
npx expo start
```

### One-Click Launch (Windows)

```
Double-click START_APP.bat
```

---

## 📂 Project Structure

```
InsightFlow AI/
├── START_APP.bat                           # One-click launcher (Windows)
├── README.md                               # This file
├── PROJECT_DOCUMENTATION.md                # Detailed development history
│
├── autocampaign-backend/                   # Python FastAPI Backend
│   ├── main.py                             # FastAPI app, routes, competitor DB (1453 lines)
│   ├── requirements.txt                    # Python dependencies
│   ├── .env                                # API keys & configuration
│   ├── serviceAccount.json                 # Firebase config
│   ├── users.json                          # User database (JSON)
│   │
│   ├── agents/                             # 🤖 AI Agent Pipeline
│   │   ├── agent1_data.py                  # Data Intelligence Agent
│   │   ├── agent2_strategy.py              # Strategy Agent
│   │   ├── agent3_creative.py              # Creative Asset Agent
│   │   └── agent4_execution.py             # Execution Agent
│   │
│   ├── services/                           # 🔧 External Service Integrations
│   │   ├── ai_service.py                   # Gemini API (multi-model fallback)
│   │   ├── search_service.py               # Google Custom Search + DuckDuckGo
│   │   ├── image_service.py                # Pollinations AI + Pillow fallback
│   │   ├── video_service.py                # Fal.ai Luma Dream Machine
│   │   ├── email_service.py                # Resend API email dispatch
│   │   └── scraper_service.py              # Website crawler + brand analyzer
│   │
│   ├── models/                             # 📦 Pydantic Data Models
│   │   ├── campaign.py                     # All request/response schemas
│   │   └── trace.py                        # Trace log model
│   │
│   ├── utils/                              # 🛠️ Utilities
│   │   └── logger.py                       # Trace logging helpers
│   │
│   ├── mock_data/                          # 🧪 Demo Scenarios
│   │   ├── scenario1_lahore_soap.json
│   │   ├── scenario2_karachi_inventory.json
│   │   └── scenario3_restaurant_prices.json
│   │
│   ├── generated_images/                   # AI-generated ad images (runtime)
│   └── traces/                             # Agent trace logs (runtime)
│
└── autocampaign-frontend/                  # React Native Expo Frontend
    └── src/
        ├── api/
        │   └── api.ts                      # Axios HTTP client + all API functions
        ├── screens/                        # 📱 App Screens (11)
        │   ├── WelcomeScreen.tsx
        │   ├── AuthScreen.tsx
        │   ├── DashboardScreen.tsx
        │   ├── UploadScreen.tsx
        │   ├── InsightScreen.tsx
        │   ├── ContradictionScreen.tsx
        │   ├── StrategyScreen.tsx
        │   ├── AssetsScreen.tsx
        │   ├── ApprovalScreen.tsx
        │   ├── OutcomeScreen.tsx
        │   └── TraceScreen.tsx
        ├── components/                     # 🧩 Reusable Components
        │   ├── AlertCard.tsx
        │   ├── StatusBadge.tsx
        │   ├── FuturisticLoader.tsx
        │   └── AppTour.tsx
        ├── store/                          # 🗄️ Zustand State
        │   ├── userStore.ts
        │   └── campaignStore.ts
        └── theme/                          # 🎨 Design Tokens
```

---

## 🎮 Demo Scenarios

Three pre-built scenarios for live demo without real data:

| Scenario | Business | Challenge |
|----------|----------|-----------|
| **Scenario 1** | Lahore Soap Brand | Sales dropping due to competitor CleanCo's 20% summer sale + supplier delivery delay |
| **Scenario 2** | Karachi Inventory | Inventory management crisis with conflicting stock data |
| **Scenario 3** | Restaurant Pricing | Menu pricing optimization in competitive market |

---

## 🧠 Technical Decisions & Trade-offs

### Why Multi-Agent over Single LLM Call?

Each agent has a **focused prompt** with specific instructions, reducing hallucination and improving output quality. The sequential pipeline ensures each agent builds on validated data from the previous one. Trace logging per agent enables granular debugging.

### Why JSON File Storage over a Database?

For a hackathon prototype, JSON files (`users.json`, `traces/{job_id}.json`) provide:
- Zero setup (no MongoDB/PostgreSQL installation)
- Human-readable debugging
- Easy data inspection
- Sufficient for demo-scale data

### Why Sequential Model Fallback?

Free-tier Gemini APIs have rate limits. Our `ai_service.py` sequentially tries:
`gemini-2.5-flash` → `gemini-1.5-flash` → `gemini-1.5-pro` → `gemini-2.0-flash-exp`

This maximizes uptime — if one model is rate-limited, the next one takes over automatically.

### Why Both Google Search AND DuckDuckGo?

Google Custom Search has daily quotas. DuckDuckGo is completely free and keyless. The system uses Google as primary and DuckDuckGo as automatic fallback — ensuring competitor intelligence never goes dark.

### Why Pollinations AI for Images?

Pollinations AI is free, requires no API key, and generates high-quality images via URL-based prompt encoding. Perfect for hackathon budgets while delivering production-quality ad creatives.

### Why Roman Urdu instead of Urdu Script?

Pakistani audiences on WhatsApp and social media predominantly communicate in Roman Urdu (Urdu written in English alphabet). Our AI generates copy in this format for maximum engagement and shareability.

---

## 👥 Team & Credits

**InsightFlow AI** — Built for Hackathon 2026

---

> *"From raw data to real customer emails — in under 60 seconds."*
