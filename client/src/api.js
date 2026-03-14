const API_URL = 'http://localhost:5001/api';

const handleResponse = async (res) => {
    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
    }
    return res.json();
};

export const fetchState = async () => {
    const res = await fetch(`${API_URL}/state`);
    return handleResponse(res);
};

export const uploadPlayers = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_URL}/upload-players`, {
        method: 'POST',
        body: formData,
    });
    return handleResponse(res);
};

export const addTeam = async (team) => {
    const res = await fetch(`${API_URL}/teams`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(team),
    });
    return handleResponse(res);
};

export const updateTeam = async (id, team) => {
    const res = await fetch(`${API_URL}/teams/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(team),
    });
    return handleResponse(res);
};

export const deleteTeam = async (id) => {
    const res = await fetch(`${API_URL}/teams/${id}`, {
        method: 'DELETE',
    });
    return handleResponse(res);
};

export const bulkAddTeams = async (count) => {
    const res = await fetch(`${API_URL}/teams/bulk-add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count }),
    });
    return handleResponse(res);
};

export const clearAllTeams = async () => {
    const res = await fetch(`${API_URL}/teams/clear-all`, {
        method: 'POST',
    });
    return handleResponse(res);
};

export const shuffleTeams = async () => {
    const res = await fetch(`${API_URL}/teams/shuffle`, {
        method: 'POST',
    });
    return handleResponse(res);
};

export const reorderTeams = async (teamIds) => {
    const res = await fetch(`${API_URL}/teams/reorder`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamIds }),
    });
    return handleResponse(res);
};

export const draftPlayer = async (playerId, teamId, round, pickNumber) => {
    const res = await fetch(`${API_URL}/draft`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId, teamId, round, pickNumber }),
    });
    return handleResponse(res);
};

export const undraftPlayer = async (playerId) => {
    const res = await fetch(`${API_URL}/undraft`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId }),
    });
    return handleResponse(res);
};

export const updateSettings = async (settings) => {
    const res = await fetch(`${API_URL}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
    });
    return handleResponse(res);
};

export const resetDraft = async () => {
    const res = await fetch(`${API_URL}/reset`, {
        method: 'POST',
    });
    return handleResponse(res);
};

export const clearPicks = async () => {
    const res = await fetch(`${API_URL}/clear-picks`, {
        method: 'POST',
    });
    return handleResponse(res);
};
