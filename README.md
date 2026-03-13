# Fantasy Sports Draft Web Application

A modern, web-based tool for hosting live fantasy sports drafts (Snake Draft format). Built with React and Node.js.

## Features
-   **Live Draft Board:** Visual grid showing rounds and team picks.
-   **Player Database:** Upload custom player rankings via CSV.
-   **Team Management:** Add teams and randomize draft order.
-   **Drafting Interface:** Search and filter players to draft.
-   **Timer:** Countdown timer for each pick.
-   **Auto-Save:** Draft state is persisted to a local JSON file.

## Prerequisites
-   Node.js (v18+)
-   npm

## Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository_url>
    cd fantasy-draft-app
    ```

2.  **Install Backend Dependencies:**
    ```bash
    cd server
    npm install
    ```

3.  **Install Frontend Dependencies:**
    ```bash
    cd ../client
    npm install
    ```

## Usage

You need to run both the backend API and the frontend React app.

### 1. Start the Backend
From the `server` directory:
```bash
node server.js
```
The server will run on `http://localhost:5001`.

### 2. Start the Frontend
From the `client` directory:
```bash
npm run dev
```
Open your browser to `http://localhost:5173`.

## Setup Guide

1.  Open the app in your browser.
2.  Click **Settings**.
3.  Add your Teams (e.g., "Team Alpha", "The fantasy Guru").
4.  Upload a Player CSV file.
    -   **CSV Format:** `Name,Position,Team,Rank`
    -   *Example included in `examples/players.csv` (You'll need to create this)*.
5.  Go back to **Draft Board**.
6.  Start drafting!

## Deployment (Proxmox)
To deploy on a Proxmox server, you can use Docker or run it as a Node service.

### Docker (Recommended)
*Coming soon in Phase 4*
