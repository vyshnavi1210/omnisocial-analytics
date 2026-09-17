# OmniSocial — Centralized Social Media Intelligence & Management Dashboard

A full-stack, enterprise-grade Social Media Dashboard engineered to track, analyze, and orchestrate brand presence across **Twitter/X, Facebook, Instagram, LinkedIn, and YouTube** from a single unified command center.

---

## 🚀 Key Objectives & Features

### 1. Centralized Multi-Platform Social Media Dashboard
- Unified executive overview aggregating cross-platform KPIs:
  - **Total Network Followers & Organic Growth**
  - **30-Day Unique Reach (Millions)**
  - **30-Day Total Timeline Impressions (Millions)**
  - **Average Engagement Rate (%) with Industry Benchmarking**
- Real-time live stream events ticker powered by WebSockets.
- Top-performing social campaigns ranked by engagement, likes, reshares, and clicks.

### 2. Social Media API Integration Architecture
- **Dual-Engine Architecture**:
  - **Live API Adapters**: Pluggable clients ready to communicate with Twitter API v2, Meta (Facebook & Instagram) Graph API v19.0, YouTube Data API v3, and LinkedIn Community API v2 using OAuth Bearer tokens or API keys.
  - **High-Fidelity Dynamic Simulation Engine**: Out-of-the-box synthetic generator providing realistic 90-day time-series data, organic growth increments, comment feeds, and automated publishing when third-party API credentials are not supplied.
- Live API connectivity test button with instant validation feedback.
- Manual and periodic synchronization for all 5 platforms.

### 3. Advanced Data Visualizations
- **Audience Growth Dynamics (Recharts)**: Interactive multi-channel area & line charts with 7-day, 30-day, and 90-day historical window selectors, and metric toggles (Followers, Impressions, Reach).
- **Engagement Rate Benchmarking**: Visual comparisons of platform interaction rates against standard B2B/B2C industry baselines.
- **Audience Sentiment NLP Radar**: Interactive donut breakdown of positive, neutral, and negative customer reactions with **Net Sentiment Score (NSS)**.
- **Peak Engagement Hours Heatmap (D3/SVG)**: 7-day × 24-hour activity density grid highlighting optimal publishing windows (e.g., Tue & Thu 10:00 AM – 1:00 PM).
- **Audience Demographics & Geo Segmentation**: Age bracket bars, gender distribution pills, and top geographic market shares.
- **CSV Data Export**: 1-click export of daily historical metrics across all channels.

### 4. Omnichannel Content Scheduler & Publisher
- Multi-platform post composer supporting Twitter, Instagram, LinkedIn, Facebook, and YouTube.
- Staged scheduling queue with automatic cron execution when the schedule time is reached.
- Real-time post preview card mimicking social media layout with media image attachment support.
- Immediate publishing action and post deletion guards.

### 5. Secure Authentication & Role-Based Access Control (RBAC)
- JWT-based authentication with bcrypt-hashed credentials.
- Three distinct roles with strictly enforced UI permissions and API guards:
  - 👑 **Admin**: Full administrative control — manage team members, assign roles, configure third-party API keys, delete posts, export CSV reports.
  - 💼 **Manager**: Campaign orchestration — compose and schedule posts, publish drafts, inspect all analytics and reports.
  - 👁️ **Viewer / Analyst**: Read-only access — explore charts, view metrics and scheduled posts, but blocked from editing or creating posts and managing team members.
- **1-Click Demo Evaluation Login**: Instant login buttons on the login screen for each role for effortless pairing and evaluation.
- Live system audit trail recording administrative actions, role modifications, and post creation events.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, TypeScript, Tailwind CSS, Lucide Icons, Recharts, D3.js |
| **Backend** | Node.js, Express, TypeScript, WebSockets (`ws`), Axios |
| **Database** | Embedded SQLite / JSON Relational Store with Atomic Persistence |
| **Security** | JWT (`jsonwebtoken`), Password Hashing (`bcryptjs`), RBAC Guards |
| **Testing** | Vitest, Supertest |

---

## 🏁 Quick Start

### 1. Install Dependencies
```bash
# In the root directory:
npm install
npm install --prefix server
npm install --prefix client
```

### 2. Run Both Server & Client Concurrently
```bash
npm run dev
```
- **Frontend**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000/api`
- **WebSocket Stream**: `ws://localhost:5000/ws`

### 3. Run Backend Automated Tests
```bash
npm test
```

---

## 🔐 Pre-Seeded Evaluation Accounts

You can log in with one click on the login screen using the demo buttons, or use these credentials:

| Role | Email | Password | Access Capabilities |
|---|---|---|---|
| **Admin** | `admin@dashboard.io` | `Admin@123` | Full access: Team management, API tokens, Post Scheduler, Analytics |
| **Manager** | `manager@dashboard.io` | `Manager@123` | Create & schedule posts, publish drafts, view all analytics |
| **Viewer** | `viewer@dashboard.io` | `Viewer@123` | Read-only analytics, metrics, and content calendar |

---

## 📁 Project Structure

```
social-media-dashboard/
├── client/                     # Frontend React + Vite application
│   ├── src/
│   │   ├── components/
│   │   │   ├── charts/         # Recharts & D3.js visualization widgets
│   │   │   ├── layout/         # Navbar, Sidebar, ProtectedRoute
│   │   │   ├── platforms/      # PlatformConfigModal & testing UI
│   │   │   └── posts/          # PostComposerModal & PostCard
│   │   ├── context/            # AuthContext & WebSocketContext
│   │   ├── pages/              # Dashboard, Analytics, Posts, Platforms, Team, Settings
│   │   ├── services/           # Axios API client
│   │   └── types/              # TypeScript interface definitions
│   ├── index.html
│   ├── tailwind.config.js
│   └── vite.config.ts
│
├── server/                     # Backend Express API & WebSocket Hub
│   ├── src/
│   │   ├── adapters/           # Twitter, Meta, YouTube, LinkedIn API adapters
│   │   ├── db/                 # Embedded DB with atomic persistence & seeding
│   │   ├── middleware/         # JWT verification & RBAC role guards
│   │   ├── routes/             # Auth, Analytics, Posts, Platforms, Team routes
│   │   ├── services/           # WebSocket stream & Live Simulator engine
│   │   ├── tests/              # Vitest API & RBAC test suite
│   │   ├── types/              # Server data schemas
│   │   └── server.ts           # Server bootstrap
│   ├── tsconfig.json
│   └── package.json
│
├── package.json                # Root orchestration scripts
└── README.md
```
