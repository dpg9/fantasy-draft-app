const API_URL = 'http://localhost:5001/api';

export const fetchState = async () => {
    const res = await fetch(`${API_URL}/state`);
    return res.json();
};

export const uploadPlayers = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_URL}/upload-players`, {
        method: 'POST',
        body: formData,
    });
    return res.json();
};

export const addTeam = async (team) => {
    const res = await fetch(`${API_URL}/teams`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(team),
    });
    return res.json();
};

export const updateTeam = async (id, team) => {
    const res = await fetch(`${API_URL}/teams/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(team),
    });
    return res.json();
};

export const deleteTeam = async (id) => {
    const res = await fetch(`${API_URL}/teams/${id}`, {
        method: 'DELETE',
    });
    return res.json();
};

export const draftPlayer = async (playerId, teamId) => {
    const res = await fetch(`${API_URL}/draft`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId, teamId }),
    });
    return res.json();
};

export const updateSettings = async (settings) => {
    const res = await fetch(`${API_URL}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
    });
    return res.json();
};

export const resetDraft = async () => {
    const res = await fetch(`${API_URL}/reset`, {
        method: 'POST',
    });
    return res.json();
};
