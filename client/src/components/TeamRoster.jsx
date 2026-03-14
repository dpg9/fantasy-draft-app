import React, { useState } from 'react';

const TeamRoster = ({ teams, picks, players, rosterPositions }) => {
    const [selectedTeamId, setSelectedTeamId] = useState(teams[0]?.id || null);

    if (!teams || teams.length === 0) {
        return <div className="p-4 text-gray-500 text-center">No teams available.</div>;
    }

    const selectedTeam = teams.find(t => t.id === selectedTeamId) || teams[0];
    
    // Get all players drafted by this team
    const teamPicks = picks.filter(p => p.teamId === selectedTeam.id);
    const teamPlayers = teamPicks.map(pick => players.find(p => p.id === pick.playerId)).filter(Boolean);

    // Build the roster structure based on settings
    const rosterSlots = [];
    const positionsToProcess = ['QB', 'RB', 'WR', 'TE', 'FLEX', 'K', 'DEF', 'DL', 'DE', 'DT', 'LB', 'DB', 'CB', 'S', 'IDP', 'BENCH'];
    
    positionsToProcess.forEach(pos => {
        const count = rosterPositions[pos] || 0;
        for (let i = 0; i < count; i++) {
            rosterSlots.push({ slot: pos, player: null });
        }
    });

    // Create a copy of players to assign
    let remainingPlayers = [...teamPlayers];

    // Priority 1: Exact matches (QB to QB, LB to LB, etc.)
    rosterSlots.forEach(slot => {
        if (!['FLEX', 'IDP', 'BENCH'].includes(slot.slot) && !slot.player) {
            const playerIndex = remainingPlayers.findIndex(p => p.position === slot.slot);
            if (playerIndex !== -1) {
                slot.player = remainingPlayers[playerIndex];
                remainingPlayers.splice(playerIndex, 1);
            }
        }
    });

    // Priority 2: FLEX matches (RB, WR, TE)
    rosterSlots.forEach(slot => {
        if (slot.slot === 'FLEX' && !slot.player) {
            const playerIndex = remainingPlayers.findIndex(p => ['RB', 'WR', 'TE'].includes(p.position));
            if (playerIndex !== -1) {
                slot.player = remainingPlayers[playerIndex];
                remainingPlayers.splice(playerIndex, 1);
            }
        }
    });

    // Priority 3: IDP FLEX matches (DL, LB, DB)
    rosterSlots.forEach(slot => {
        if (slot.slot === 'IDP' && !slot.player) {
            const playerIndex = remainingPlayers.findIndex(p => ['DL', 'DE', 'DT', 'LB', 'DB', 'CB', 'S'].includes(p.position));
            if (playerIndex !== -1) {
                slot.player = remainingPlayers[playerIndex];
                remainingPlayers.splice(playerIndex, 1);
            }
        }
    });

    // Priority 4: BENCH
    rosterSlots.forEach(slot => {
        if (slot.slot === 'BENCH' && !slot.player) {
            if (remainingPlayers.length > 0) {
                slot.player = remainingPlayers[0];
                remainingPlayers.splice(0, 1);
            }
        }
    });

    // Anything left is over the limit
    const extraPlayers = remainingPlayers;

    const getPositionColor = (pos) => {
        const colors = {
            'QB': 'bg-red-500 text-white',
            'RB': 'bg-blue-500 text-white',
            'WR': 'bg-green-500 text-white',
            'TE': 'bg-orange-500 text-white',
            'K': 'bg-purple-500 text-white',
            'DEF': 'bg-yellow-600 text-white',
            'DST': 'bg-yellow-600 text-white',
            'DL': 'bg-cyan-600 text-white',
            'DE': 'bg-cyan-600 text-white',
            'DT': 'bg-cyan-700 text-white',
            'LB': 'bg-teal-600 text-white',
            'DB': 'bg-indigo-600 text-white',
            'CB': 'bg-indigo-600 text-white',
            'S': 'bg-indigo-700 text-white',
            'IDP': 'bg-zinc-600 text-white'
        };
        return colors[pos?.toUpperCase()] || 'bg-gray-200 text-gray-800';
    };

    return (
        <div className="bg-white shadow rounded-lg p-4 h-full flex flex-col overflow-hidden">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4 border-b pb-4">
                <h2 className="text-xl font-bold">Team Rosters</h2>
                <select 
                    className="border p-2 rounded bg-gray-50 font-semibold w-full md:w-64"
                    value={selectedTeamId || ''}
                    onChange={(e) => setSelectedTeamId(e.target.value)}
                >
                    {teams.map(t => (
                        <option key={t.id} value={t.id}>{t.name} ({t.owner})</option>
                    ))}
                </select>
            </div>

            <div className="flex-grow overflow-y-auto pr-2">
                <div className="space-y-2">
                    {rosterSlots.map((slot, index) => (
                        <div key={index} className="flex items-center border rounded overflow-hidden shadow-sm h-12">
                            <div className="w-16 flex-shrink-0 bg-gray-100 h-full flex items-center justify-center font-bold text-gray-500 border-r border-gray-200 text-xs">
                                {slot.slot}
                            </div>
                            {slot.player ? (
                                <div className="flex-grow flex items-center px-3 gap-3">
                                    <div className={`text-[10px] px-2 py-0.5 rounded font-bold w-10 text-center ${getPositionColor(slot.player.position)}`}>
                                        {slot.player.position}
                                    </div>
                                    <div className="font-bold truncate">{slot.player.name}</div>
                                    <div className="text-xs text-gray-400 ml-auto">{slot.player.team}</div>
                                </div>
                            ) : (
                                <div className="flex-grow px-3 text-sm text-gray-300 italic">Empty</div>
                            )}
                        </div>
                    ))}
                </div>

                {extraPlayers.length > 0 && (
                    <div className="mt-8">
                        <h3 className="font-bold text-red-500 mb-2 border-b border-red-200 pb-1">OVER ROSTER LIMIT</h3>
                        <div className="space-y-2">
                            {extraPlayers.map((player, index) => (
                                <div key={index} className="flex items-center border border-red-200 rounded overflow-hidden shadow-sm h-12 bg-red-50">
                                    <div className="w-16 flex-shrink-0 bg-red-100 h-full flex items-center justify-center font-bold text-red-400 border-r border-red-200 text-xs">
                                        EXTRA
                                    </div>
                                    <div className="flex-grow flex items-center px-3 gap-3">
                                        <div className={`text-[10px] px-2 py-0.5 rounded font-bold w-10 text-center ${getPositionColor(player.position)}`}>
                                            {player.position}
                                        </div>
                                        <div className="font-bold truncate text-red-900">{player.name}</div>
                                        <div className="text-xs text-red-400 ml-auto">{player.team}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TeamRoster;
