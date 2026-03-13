const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const csv = require('csv-parser');

const app = express();
const PORT = 5001;
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
    teams: [],
    players: [],
    picks: [], // { round, pickNumber, teamId, playerId }
    currentPick: { round: 1, pickNumber: 1, teamIndex: 0 },
    settings: {
        totalRounds: 15,
        timePerPick: 120, // seconds
        isSnakeDraft: true
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
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    } catch (err) {
        console.error("Error saving data file:", err);
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

app.post('/api/undraft', (req, res) => {
    const { playerId } = req.body;
    const state = loadData();

    // Remove the pick
    state.picks = state.picks.filter(p => p.playerId !== playerId);

    // We no longer recalculate currentPick automatically here
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
    const isManual = round !== undefined;

    // Record Pick
    const pick = {
        round: isManual ? round : state.currentPick.round,
        pickNumber: isManual ? (pickNumber || 0) : state.currentPick.pickNumber,
        teamId,
        playerId,
        timestamp: Date.now()
    };
    state.picks.push(pick);

    // ONLY update currentPick if it was NOT a manual placement
    if (!isManual) {
        const totalTeams = state.teams.length;
        const nextPickIndex = state.picks.length; 
        const nextRound = Math.floor(nextPickIndex / totalTeams) + 1;
        const positionInRound = nextPickIndex % totalTeams;
        
        let teamIndex = 0;
        if (totalTeams > 0) {
            if (nextRound % 2 !== 0) {
                teamIndex = positionInRound;
            } else {
                teamIndex = totalTeams - 1 - positionInRound;
            }
        }

        state.currentPick = {
            round: nextRound,
            pickNumber: nextPickIndex + 1,
            teamIndex
        };
    }

    saveData(state);
    res.json({ message: 'Pick recorded', pick, nextState: state.currentPick });
});

app.post('/api/settings', (req, res) => {
    console.log("POST /api/settings received:", req.body);
    const state = loadData();
    state.settings = { ...state.settings, ...req.body };
    saveData(state);
    console.log("New settings saved:", state.settings);
    res.json({ message: "Settings updated", settings: state.settings });
});

app.post('/api/reset', (req, res) => {
    saveData(defaultState);
    res.json({ message: "Draft state reset", state: defaultState });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
