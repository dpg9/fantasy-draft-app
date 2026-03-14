const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const csv = require('csv-parser');

const app = express();
const PORT = process.env.PORT || 5001;
const DATA_FILE = path.join(__dirname, 'data', 'draft-data.json');
const UPLOADS_DIR = path.join(__dirname, 'uploads');

// Ensure directories exist
if (!fs.existsSync(path.join(__dirname, 'data'))) {
    fs.mkdirSync(path.join(__dirname, 'data'));
}
if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR);
}

const upload = multer({ dest: UPLOADS_DIR });

app.use(cors());
app.use(bodyParser.json());

// Default State
const defaultState = {
    teams: Array.from({ length: 10 }).map((_, i) => ({
        id: `team-placeholder-${i + 1}`,
        name: `Team ${i + 1}`,
        owner: `Owner ${i + 1}`,
        avatar: "",
        draftOrder: i + 1
    })),
    players: [],
    picks: [], // { round, pickNumber, teamId, playerId }
    currentPick: { round: 1, pickNumber: 1, teamIndex: 0 },
    settings: {
        draftTitle: "FANTASY DRAFT '26",
        totalRounds: 15,
        timePerPick: 120, // seconds
        isSnakeDraft: true,
        rosterPositions: {
            QB: 1,
            RB: 2,
            WR: 2,
            TE: 1,
            FLEX: 1,
            K: 1,
            DEF: 1,
            DL: 0,
            DE: 0,
            DT: 0,
            LB: 0,
            DB: 0,
            CB: 0,
            S: 0,
            IDP: 0,
            BENCH: 6
        }
    }
};

// Data Manager
const loadData = () => {
    if (fs.existsSync(DATA_FILE)) {
        try {
            const data = fs.readFileSync(DATA_FILE, 'utf8');
            return JSON.parse(data);
        } catch (err) {
            console.error("Error reading data file:", err);
            return defaultState;
        }
    }
    return defaultState;
};

const saveData = (data) => {
    const TEMP_FILE = `${DATA_FILE}.tmp`;
    try {
        // Atomic write: Write to a temporary file first, then rename it
        // This prevents file corruption if the power goes out mid-save
        fs.writeFileSync(TEMP_FILE, JSON.stringify(data, null, 2), 'utf8');
        fs.renameSync(TEMP_FILE, DATA_FILE);
    } catch (err) {
        console.error("CRITICAL: Error saving data file:", err);
        // Attempt to cleanup temp file if rename failed
        if (fs.existsSync(TEMP_FILE)) {
            try { fs.unlinkSync(TEMP_FILE); } catch(e) {}
        }
    }
};

// API Endpoints
app.get('/api/state', (req, res) => {
    const data = loadData();
    res.json(data);
});

app.post('/api/upload-players', upload.single('file'), (req, res) => {
    const results = [];
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    fs.createReadStream(req.file.path)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => {
            const state = loadData();
            // Assign IDs if not present and normalize data
            state.players = results.map((p, index) => ({
                id: p.id || `player-${index}`,
                name: p.name || p.Name,
                position: p.position || p.Position,
                team: p.team || p.Team, // NFL/NBA Team
                rank: p.rank || p.Rank || 999
            }));
            saveData(state);
            // Cleanup uploaded file
            fs.unlinkSync(req.file.path);
            res.json({ message: 'Players uploaded successfully', count: state.players.length });
        });
});

app.post('/api/teams', (req, res) => {
    const state = loadData();
    const newTeam = {
        id: `team-${Date.now()}`,
        name: req.body.name,
        owner: req.body.owner,
        avatar: req.body.avatar || '',
        draftOrder: state.teams.length + 1
    };
    state.teams.push(newTeam);
    saveData(state);
    res.json(newTeam);
});

app.post('/api/teams/bulk-add', (req, res) => {
    const { count } = req.body;
    const state = loadData();
    const startCount = state.teams.length;
    const timestamp = Date.now();
    
    for (let i = 0; i < count; i++) {
        const num = startCount + i + 1;
        state.teams.push({
            id: `team-${timestamp}-${i}`,
            name: `Team ${num}`,
            owner: `Owner ${num}`,
            avatar: "",
            draftOrder: num
        });
    }
    saveData(state);
    res.json({ message: `${count} teams added`, teams: state.teams });
});

app.post('/api/teams/bulk-set', (req, res) => {
    const { count } = req.body;
    const state = loadData();
    const timestamp = Date.now();
    
    // Replace all existing teams with a new set
    state.teams = Array.from({ length: count }).map((_, i) => ({
        id: `team-${timestamp}-${i}`,
        name: `Team ${i + 1}`,
        owner: `Owner ${i + 1}`,
        avatar: "",
        draftOrder: i + 1
    }));
    
    saveData(state);
    res.json({ message: `Teams set to ${count}`, teams: state.teams });
});

app.post('/api/teams/clear-all', (req, res) => {
    const state = loadData();
    state.teams = [];
    saveData(state);
    res.json({ message: "All teams cleared", teams: [] });
});

app.put('/api/teams/reorder', (req, res) => {
    const { teamIds } = req.body;
    const state = loadData();
    
    if (!Array.isArray(teamIds)) {
        return res.status(400).json({ error: 'teamIds must be an array' });
    }

    const newTeams = [];
    teamIds.forEach(id => {
        const team = state.teams.find(t => t.id === id);
        if (team) newTeams.push(team);
    });
    
    // Only save if all teams were found (prevents data loss)
    if (newTeams.length === state.teams.length) {
        state.teams = newTeams;
        state.teams.forEach((t, i) => t.draftOrder = i + 1);
        saveData(state);
        res.json({ message: 'Teams reordered', teams: state.teams });
    } else {
        res.status(400).json({ error: 'Invalid team IDs provided' });
    }
});

app.put('/api/teams/:id', (req, res) => {
    const state = loadData();
    const teamIndex = state.teams.findIndex(t => t.id === req.params.id);
    if (teamIndex === -1) return res.status(404).json({ error: 'Team not found' });

    state.teams[teamIndex] = { ...state.teams[teamIndex], ...req.body };
    saveData(state);
    res.json(state.teams[teamIndex]);
});

app.delete('/api/teams/:id', (req, res) => {
    const state = loadData();
    state.teams = state.teams.filter(t => t.id !== req.params.id);
    // Re-assign draft order
    state.teams.forEach((t, i) => t.draftOrder = i + 1);
    saveData(state);
    res.json({ message: 'Team deleted' });
});

app.post('/api/teams/shuffle', (req, res) => {
    const state = loadData();
    // Fisher-Yates shuffle
    for (let i = state.teams.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [state.teams[i], state.teams[j]] = [state.teams[j], state.teams[i]];
    }
    // Re-assign draft order
    state.teams.forEach((t, i) => t.draftOrder = i + 1);
    saveData(state);
    res.json({ message: 'Teams shuffled', teams: state.teams });
});

const getNextAutomatedPick = (state) => {
    const totalTeams = state.teams.length;
    if (totalTeams === 0) return { round: 1, pickNumber: 1, teamIndex: 0 };

    const totalPossiblePicks = totalTeams * state.settings.totalRounds;

    // Find the first pick number that doesn't have a record in state.picks
    for (let pNum = 1; pNum <= totalPossiblePicks; pNum++) {
        if (!state.picks.some(p => p.pickNumber === pNum)) {
            // Found the first empty hole. Calculate round and teamIndex for this pick number.
            const round = Math.ceil(pNum / totalTeams);
            const positionInRound = (pNum - 1) % totalTeams;

            let teamIndex;
            const isSnake = state.settings.isSnakeDraft !== false;
            if (isSnake && round % 2 === 0) {
                // Even round in snake: reverse order
                teamIndex = totalTeams - 1 - positionInRound;
            } else {
                // Odd round or standard draft: normal order
                teamIndex = positionInRound;
            }

            return { round, pickNumber: pNum, teamIndex };
        }
    }

    // If all slots are full
    return { round: state.settings.totalRounds + 1, pickNumber: totalPossiblePicks + 1, teamIndex: 0 };
};

app.post('/api/undraft', (req, res) => {
    const { playerId } = req.body;
    const state = loadData();

    // Remove the pick
    state.picks = state.picks.filter(p => p.playerId !== playerId);

    // Recalculate currentPick to fill the hole we just created (if it's earlier than the current pointer)
    state.currentPick = getNextAutomatedPick(state);

    saveData(state);
    res.json({ message: 'Player returned to pool', state });
});

app.post('/api/draft', (req, res) => {
    const { playerId, teamId, round, pickNumber } = req.body;
    const state = loadData();

    // Validation
    if (!playerId || !teamId) return res.status(400).json({ error: 'Missing playerId or teamId' });

    // Check if player is already drafted
    if (state.picks.some(p => p.playerId === playerId)) {
        return res.status(400).json({ error: 'Player already drafted' });
    }

    // Determine if this is a manual placement or a "standard" next-pick draft
    const isManual = round !== undefined && pickNumber !== undefined;

    // If manual, check if the specific slot is already occupied
    if (isManual && state.picks.some(p => p.round === round && p.teamId === teamId)) {
        return res.status(400).json({ error: 'This draft slot is already occupied' });
    }

    // Record Pick
    const pick = {
        round: isManual ? round : state.currentPick.round,
        pickNumber: isManual ? pickNumber : state.currentPick.pickNumber,
        teamId,
        playerId,
        timestamp: Date.now()
    };

    state.picks.push(pick);

    // Always recalculate currentPick to ensure it points to the earliest "hole" in the draft
    state.currentPick = getNextAutomatedPick(state);

    saveData(state);
    res.json({ message: 'Pick recorded', pick, nextState: state.currentPick });
});

app.post('/api/settings', (req, res) => {
    console.log("POST /api/settings received:", req.body);
    const state = loadData();
    state.settings = { ...state.settings, ...req.body };
    
    // Automatically recalculate totalRounds based on roster limits
    if (state.settings.rosterPositions) {
        let total = 0;
        for (const count of Object.values(state.settings.rosterPositions)) {
            total += parseInt(count) || 0;
        }
        state.settings.totalRounds = total > 0 ? total : 15;
    }

    saveData(state);
    console.log("New settings saved:", state.settings);
    res.json({ message: "Settings updated", settings: state.settings });
});

app.post('/api/clear-picks', (req, res) => {
    const state = loadData();
    state.picks = [];
    state.currentPick = { round: 1, pickNumber: 1, teamIndex: 0 };
    saveData(state);
    res.json({ message: "Draft picks cleared", state });
});

app.post('/api/reset', (req, res) => {
    saveData(defaultState);
    res.json({ message: "Draft state reset", state: defaultState });
});

// Serve Frontend Static Files
// In production, the built React app is placed in the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// Catch-all middleware to serve the React index.html for any non-API requests
// This handles client-side routing and is compatible with Express 5
app.use((req, res, next) => {
    // If request is for an API route that wasn't handled, let it 404
    if (req.url.startsWith('/api')) {
        return res.status(404).json({ error: 'API route not found' });
    }
    
    // Otherwise, serve index.html for the React app
    const indexPath = path.join(__dirname, 'public', 'index.html');
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.status(404).send('Frontend build not found');
    }
});

// Global Error Handlers (The "Uptime Safety Net")
// This prevents the server from crashing if an unexpected logic error occurs
process.on('uncaughtException', (err) => {
    console.error('SERVER CRASH PREVENTED: Uncaught Exception:', err.stack || err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('SERVER CRASH PREVENTED: Unhandled Rejection at:', promise, 'reason:', reason);
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
});
