import React, { useState } from 'react';

const TeamRoster = ({ teams, picks, players, rosterPositions }) => {
    const [selectedTeamId, setSelectedTeamId] = useState('ALL');
    const [viewMode, setViewMode] = useState('position'); // 'position' or 'order'

    if (!teams || teams.length === 0) {
        return <div className="p-4 text-gray-500 text-center">No teams available.</div>;
    }

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
        return colors[pos?.toUpperCase()] || 'bg-slate-200 text-slate-800';
    };

    const renderRosterContent = (team) => {
        // Get all picks for this team, sorted by pick number
        const teamPicks = picks
            .filter(p => p.teamId === team.id)
            .sort((a, b) => a.pickNumber - b.pickNumber);

        const teamPlayers = teamPicks.map(pick => {
            const player = players.find(p => p.id === pick.playerId);
            return player ? { ...player, pickNumber: pick.pickNumber, round: pick.round } : null;
        }).filter(Boolean);

        if (viewMode === 'position') {
            const rosterSlots = [];
            const positionsToProcess = ['QB', 'RB', 'WR', 'TE', 'FLEX', 'K', 'DEF', 'DL', 'DE', 'DT', 'LB', 'DB', 'CB', 'S', 'IDP', 'BENCH'];
            
            positionsToProcess.forEach(pos => {
                const count = rosterPositions[pos] || 0;
                for (let i = 0; i < count; i++) {
                    rosterSlots.push({ slot: pos, player: null });
                }
            });

            let remainingPlayers = [...teamPlayers];

            // Priority 1: Exact matches
            rosterSlots.forEach(slot => {
                if (!['FLEX', 'IDP', 'BENCH'].includes(slot.slot) && !slot.player) {
                    const playerIndex = remainingPlayers.findIndex(p => p.position === slot.slot);
                    if (playerIndex !== -1) {
                        slot.player = remainingPlayers[playerIndex];
                        remainingPlayers.splice(playerIndex, 1);
                    }
                }
            });

            // Priority 2: FLEX matches
            rosterSlots.forEach(slot => {
                if (slot.slot === 'FLEX' && !slot.player) {
                    const playerIndex = remainingPlayers.findIndex(p => ['RB', 'WR', 'TE'].includes(p.position));
                    if (playerIndex !== -1) {
                        slot.player = remainingPlayers[playerIndex];
                        remainingPlayers.splice(playerIndex, 1);
                    }
                }
            });

            // Priority 3: IDP FLEX matches
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

            const extraPlayers = remainingPlayers;

            return (
                <div className="space-y-1.5">
                    {rosterSlots.map((slot, index) => (
                        <div key={index} className={`flex items-center border rounded-lg overflow-hidden h-10 bg-white transition-all ${!slot.player ? 'border-slate-100 opacity-40' : 'border-slate-200 shadow-sm'}`}>
                            <div className="w-12 flex-shrink-0 bg-slate-50 h-full flex items-center justify-center font-black text-slate-400 border-r border-slate-100 text-[8px] uppercase tracking-tighter">
                                {slot.slot}
                            </div>
                            {slot.player ? (
                                <div className="flex-grow flex items-center px-3 gap-3">
                                    <div className={`text-[8px] px-1.5 py-0.5 rounded font-black w-10 text-center shadow-sm ${getPositionColor(slot.player.position)}`}>
                                        {slot.player.position}
                                    </div>
                                    <div className="flex flex-col leading-none">
                                        <div className="font-bold text-slate-800 uppercase text-xs truncate max-w-[120px]">{slot.player.name}</div>
                                        <div className="text-[8px] text-slate-400 font-bold uppercase">{slot.player.team}</div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex-grow px-3 text-[10px] text-slate-200 font-bold uppercase italic tracking-widest">---</div>
                            )}
                        </div>
                    ))}
                    {extraPlayers.length > 0 && (
                        <div className="mt-4 pt-2 border-t border-red-100">
                            <div className="text-[8px] font-black text-red-400 uppercase tracking-[0.2em] mb-2 flex items-center gap-1">
                                ⚠️ LIMIT REACHED
                            </div>
                            {extraPlayers.map((player, index) => (
                                <div key={index} className="flex items-center border border-red-100 bg-red-50/20 rounded-lg overflow-hidden h-10 mb-1">
                                    <div className="w-12 flex-shrink-0 bg-red-50 h-full flex items-center justify-center font-black text-red-300 border-r border-red-100 text-[8px] uppercase">
                                        EXTRA
                                    </div>
                                    <div className="flex-grow flex items-center px-3 gap-3">
                                        <div className={`text-[8px] px-1.5 py-0.5 rounded font-black w-10 text-center shadow-sm ${getPositionColor(player.position)}`}>
                                            {player.position}
                                        </div>
                                        <div className="flex flex-col leading-none">
                                            <div className="font-bold text-red-900 uppercase text-xs truncate max-w-[120px]">{player.name}</div>
                                            <div className="text-[8px] text-red-400 font-bold uppercase">{player.team}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            );
        } else {
            /* Pick Order View */
            return (
                <div className="space-y-2">
                    {teamPlayers.length === 0 ? (
                        <div className="py-10 text-center text-slate-300 text-[10px] font-black uppercase tracking-widest">No picks yet</div>
                    ) : (
                        teamPlayers.map((player, index) => (
                            <div key={index} className="flex items-center border border-slate-200 bg-white rounded-lg overflow-hidden shadow-sm h-12 hover:border-blue-200 transition-all">
                                <div className="w-10 flex-shrink-0 bg-slate-800 h-full flex items-center justify-center text-white font-black text-xs">
                                    {player.pickNumber}
                                </div>
                                <div className="flex-grow flex items-center px-3 gap-3">
                                    <div className={`text-[8px] px-1.5 py-0.5 rounded font-black w-10 text-center shadow-sm ${getPositionColor(player.position)}`}>
                                        {player.position}
                                    </div>
                                    <div className="flex flex-col leading-tight">
                                        <div className="font-bold text-slate-800 uppercase text-xs truncate max-w-[120px]">{player.name}</div>
                                        <div className="text-[8px] text-slate-400 font-bold uppercase">{player.team}</div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            );
        }
    };

    const isAllMode = selectedTeamId === 'ALL';
    const displayedTeams = isAllMode ? teams : [teams.find(t => t.id === selectedTeamId) || teams[0]];

    return (
        <div className="bg-white shadow-xl rounded-2xl border border-slate-200 h-full flex flex-col overflow-hidden">
            {/* Header Section */}
            <div className="bg-slate-800 p-6 space-y-4">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <h2 className="text-2xl font-black text-white uppercase tracking-tight">Team Rosters</h2>
                    <select 
                        className="bg-slate-700 text-white border-2 border-slate-600 p-2.5 rounded-xl font-bold w-full md:w-72 outline-none focus:border-blue-500 transition-all cursor-pointer shadow-lg"
                        value={selectedTeamId || ''}
                        onChange={(e) => setSelectedTeamId(e.target.value)}
                    >
                        <option value="ALL">📋 All Teams (Overview)</option>
                        {teams.map(t => (
                            <option key={t.id} value={t.id}>{t.name} ({t.owner})</option>
                        ))}
                    </select>
                </div>

                {/* View Mode Toggle */}
                <div className="flex p-1 bg-slate-900 rounded-xl w-full max-w-md mx-auto md:mx-0 shadow-inner">
                    <button 
                        onClick={() => setViewMode('position')}
                        className={`flex-1 py-2 px-4 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${viewMode === 'position' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                        Filled By Position
                    </button>
                    <button 
                        onClick={() => setViewMode('order')}
                        className={`flex-1 py-2 px-4 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${viewMode === 'order' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                        By Pick Order
                    </button>
                </div>
            </div>

            {/* Content Section */}
            <div className="flex-grow overflow-y-auto p-6 bg-slate-50/50">
                <div className={`grid gap-6 ${isAllMode ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1 max-w-2xl mx-auto'}`}>
                    {displayedTeams.map(team => (
                        <div key={team.id} className="flex flex-col h-full bg-slate-100/50 rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                            <div className="bg-slate-700 px-4 py-3 border-b-2 border-slate-800 flex items-center gap-3">
                                {team.avatar ? (
                                    <img src={team.avatar} alt="" className="w-8 h-8 rounded-full object-cover border border-slate-500 shadow-sm" />
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center text-slate-300 text-[10px] font-black uppercase">
                                        {team.name.substring(0, 2)}
                                    </div>
                                )}
                                <div className="leading-none">
                                    <div className="text-white font-black uppercase text-xs tracking-tight truncate max-w-[180px]">{team.name}</div>
                                    <div className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{team.owner}</div>
                                </div>
                            </div>
                            <div className="p-4 flex-grow">
                                {renderRosterContent(team)}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TeamRoster;
