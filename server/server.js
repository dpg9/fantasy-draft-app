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

app.post('/api/draft', (req, res) => {
    const { playerId, teamId } = req.body;
    const state = loadData();

    // Validation
    if (!playerId || !teamId) return res.status(400).json({ error: 'Missing playerId or teamId' });
    
    // Check if player is already drafted
    if (state.picks.some(p => p.playerId === playerId)) {
        return res.status(400).json({ error: 'Player already drafted' });
    }

    // Record Pick
    const pick = {
        round: state.currentPick.round,
        pickNumber: state.currentPick.pickNumber,
        teamId,
        playerId,
        timestamp: Date.now()
    };
    state.picks.push(pick);

    // Update Current Pick Logic (Snake Draft)
    const totalTeams = state.teams.length;
    let nextPick = state.currentPick.pickNumber + 1;
    let nextRound = state.currentPick.round;
    let nextTeamIndex = state.currentPick.teamIndex;

    // Logic for Snake Draft:
    // Odd Rounds: 0 -> N-1
    // Even Rounds: N-1 -> 0
    
    if (nextPick > totalTeams * nextRound) {
        nextRound++;
    }

    // Determine next team index based on round parity
    // This is a simplified logic, for a real app we need robust index calc
    // But for now, let's just increment pickNumber and let the frontend calculate who is up
    // Or do it here:
    
    // Snake Logic:
    // Round 1 (Odd): 0, 1, 2...
    // Round 2 (Even): 2, 1, 0...
    
    // Current total picks made = state.picks.length
    // Next pick index (0-based) = state.picks.length
    const nextPickIndex = state.picks.length; 
    const round = Math.floor(nextPickIndex / totalTeams) + 1;
    const positionInRound = nextPickIndex % totalTeams;
    
    let teamIndex;
    if (round % 2 !== 0) { // Odd round (1, 3, 5...)
        teamIndex = positionInRound;
    } else { // Even round (2, 4, 6...)
        teamIndex = totalTeams - 1 - positionInRound;
    }

    state.currentPick = {
        round,
        pickNumber: nextPickIndex + 1,
        teamIndex
    };

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
