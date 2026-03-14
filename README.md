# Fantasy Sports Draft Web Application

A professional, full-stack web application designed for hosting live, "local party" fantasy sports drafts. Built for speed, reliability, and 100% offline capability.

## 🚀 Key Features

### 🏈 Elite Drafting Experience
- **Live Draft Board:** A high-contrast, auto-scrolling grid that tracks the current team on the clock.
- **Intelligent Flow:** Automated "Hole-Filling" logic ensures the draft always stays on track, even if you manually adjust picks.
- **Global Pick Tracking:** Every square displays its overall pick number (P1, P2...), dynamically adjusting for **Snake Draft** or linear formats.
- **Draft Complete State:** Celebratory UI once the draft finishes, with a one-click **CSV Download** of the full results.

### 📋 Team & Roster Management
- **Draft Command Center:** A streamlined settings hub to manage teams, randomize orders, or manually reorder via **Drag & Drop**.
- **Deep Roster Customization:** Define exact limits for standard positions (QB, RB, WR, TE, K) and full **IDP Support** (DL, DE, DT, LB, DB, CB, S).
- **Roster Overview:** A dedicated page to view team lineups, switchable between **Position View** (smart-filled slots) or **Pick Order** (chronological).
- **All-Teams View:** A responsive, full-screen grid to compare every team in the league side-by-side.

### 🛡️ Built for Stability
- **Atomic Data Protection:** Zero-risk saving system ensures your draft data is never corrupted, even during sudden power loss.
- **Uptime Safety Net:** Global error handlers prevent the server from crashing during live events.
- **100% Offline-First:** Runs entirely on your local machine. No internet required for draft day once your player database is loaded.

---

## 🛠️ Tech Stack
- **Frontend:** React 18, Vite, Tailwind CSS v4
- **Backend:** Node.js, Express 5 (REST API)
- **Database:** Local JSON Persistence (Flat-file)
- **Deployment:** Docker, Docker Compose

---

## 💻 Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone <repository_url>
   cd fantasy-draft-app
   ```

2. **Quick Start (Recommended):**
   Run the provided developer script to launch both the backend and frontend simultaneously:
   ```bash
   ./start-dev.sh
   ```

3. **Manual Setup:**
   - **Backend:** `cd server && npm install && node server.js` (Runs on port 5001)
   - **Frontend:** `cd client && npm install && npm run dev` (Runs on port 5173)

---

## 📂 Data Setup

To populate your draft, go to the **Settings** page and upload a CSV file.
- **Required Columns:** `id, name, position, team, rank`
- **Example File:** See `examples/full_nfl_roster.csv` for a pre-formatted 2024 NFL roster.

---

## 🐳 Docker & Proxmox Deployment

The app is containerized for easy deployment on Proxmox, home servers, or portable usage.

### 1. Build and Run
Ensure you have **Docker Desktop** installed, then run:
```bash
docker-compose up --build -d
```
The app will be available at `http://localhost:5001`.

### 2. Proxmox / Home Server Tip
To keep the app running forever on your server, the `docker-compose.yml` is configured with `restart: always`. This ensures the draft board comes back online automatically even after a server reboot or power flicker.

### 3. Portable "Offline" Usage
To create a single file you can take anywhere (via USB stick) and run on a machine without internet:

1. **Create the image file:**
   ```bash
   docker build -t fantasy-draft-app .
   docker save fantasy-draft-app > fantasy-draft-app.tar
   ```
2. **On the target machine (offline):**
   ```bash
   docker load < fantasy-draft-app.tar
   docker run -d -p 5001:5001 --name my-draft fantasy-draft-app
   ```

---

## 📁 Project Structure
```text
├── client/           # React Frontend (Vite)
├── server/           # Node.js Express Backend
│   ├── data/         # Persistent Draft JSON data
│   └── uploads/      # Temporary CSV storage
├── examples/         # Sample player rosters (CSV)
├── Dockerfile        # Multi-stage production build
└── docker-compose.yml # Service orchestration
```

## ⚖️ License
MIT License - Free to use for your personal draft parties!
