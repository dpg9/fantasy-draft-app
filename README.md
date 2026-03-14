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

### 📱 Responsive Design
- **Cross-Platform:** Optimized for Desktops, Tablets, and Phones.
- **Sticky UI:** Headers, team names, and search bars stay anchored while you scroll through long drafts.

---

## 🛠️ Prerequisites
- **Node.js** (v20+ recommended)
- **npm**

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

## 🖥️ Running on Windows
The app is fully compatible with Windows. For the easiest experience, use **Git Bash** to run the `./start-dev.sh` script, or run the server and client in two separate PowerShell/Command Prompt windows.

## 🐳 Docker Deployment
*Detailed Dockerfile and Docker-Compose instructions coming soon for Proxmox and Home Server hosting.*
