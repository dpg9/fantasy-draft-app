import React, { useState } from 'react';

const TeamRoster = ({ teams, picks, players, rosterPositions }) => {
    const [selectedTeamId, setSelectedTeamId] = useState('ALL');
    const [viewMode, setViewMode] = useState('position'); // 'position' or 'order'

    if (!teams || teams.length === 0) {
        return <div className="p-4 text-gray-500 text-center text-xl font-bold">No teams available.</div>;
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

    const isAllMode = selectedTeamId === 'ALL';

    const renderRosterContent = (team) => {
        // Get all picks for this team, sorted by pick number
        const teamPicks = picks
            .filter(p => p.teamId === team.id)
            .sort((a, b) => a.pickNumber - b.pickNumber);

        const teamPlayers = teamPicks.map(pick => {
            const player = players.find(p => p.id === pick.playerId);
            return player ? { ...player, pickNumber: pick.pickNumber, round: pick.round } : null;
        }).filter(Boolean);

        const rowHeight = isAllMode ? 'h-12' : 'h-16';
        const labelSize = isAllMode ? 'text-[10px]' : 'text-xs';
        const nameSize = isAllMode ? 'text-sm' : 'text-xl';
        const subSize = isAllMode ? 'text-[10px]' : 'text-sm';
        const badgeSize = isAllMode ? 'w-12 text-[10px]' : 'w-16 text-xs';

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
                <div className="space-y-2">
                    {rosterSlots.map((slot, index) => (
                        <div key={index} className={`flex items-center border-2 rounded-xl overflow-hidden bg-white transition-all ${rowHeight} ${!slot.player ? 'border-slate-100 opacity-40' : 'border-slate-200 shadow-sm'}`}>
                            <div className={`w-16 md:w-20 flex-shrink-0 bg-slate-50 h-full flex items-center justify-center font-black text-slate-400 border-r-2 border-slate-100 ${labelSize} uppercase tracking-wider`}>
                                {slot.slot}
                            </div>
                            {slot.player ? (
                                <div className="flex-grow flex items-center px-4 gap-4">
                                    <div className={`py-1 rounded-lg font-black text-center shadow-sm ${badgeSize} ${getPositionColor(slot.player.position)}`}>
                                        {slot.player.position}
                                    </div>
                                    <div className="flex flex-col leading-tight overflow-hidden">
                                        <div className={`font-black text-slate-800 uppercase tracking-tight truncate ${nameSize}`}>{slot.player.name}</div>
                                        <div className={`text-slate-400 font-bold uppercase tracking-wide ${subSize}`}>{slot.player.team} • Pick {slot.player.pickNumber}</div>
                                    </div>
                                </div>
                            ) : (
                                <div className={`flex-grow px-4 font-bold uppercase italic tracking-[0.2em] text-slate-200 ${subSize}`}>---</div>
                            )}
                        </div>
                    ))}
                    {extraPlayers.length > 0 && (
                        <div className="mt-8 pt-4 border-t-2 border-red-100">
                            <div className="text-[10px] font-black text-red-400 uppercase tracking-[0.3em] mb-3 flex items-center gap-2">
                                <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></span>
                                Limit Reached
                            </div>
                            {extraPlayers.map((player, index) => (
                                <div key={index} className={`flex items-center border-2 border-red-100 bg-red-50/20 rounded-xl overflow-hidden mb-2 ${rowHeight}`}>
                                    <div className={`w-16 md:w-20 flex-shrink-0 bg-red-50 h-full flex items-center justify-center font-black text-red-300 border-r-2 border-red-100 ${labelSize} uppercase`}>
                                        EXTRA
                                    </div>
                                    <div className="flex-grow flex items-center px-4 gap-4">
                                        <div className={`py-1 rounded-lg font-black text-center shadow-sm ${badgeSize} ${getPositionColor(player.position)}`}>
                                            {player.position}
                                        </div>
                                        <div className="flex flex-col leading-tight overflow-hidden">
                                            <div className={`font-black text-red-900 uppercase tracking-tight truncate ${nameSize}`}>{player.name}</div>
                                            <div className={`text-red-400 font-bold uppercase tracking-wide ${subSize}`}>{player.team} • Pick {player.pickNumber}</div>
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
                <div className="space-y-3">
                    {teamPlayers.length === 0 ? (
                        <div className="py-20 text-center flex flex-col items-center">
                            <div className="text-5xl mb-4 opacity-20">🏈</div>
                            <div className="text-slate-300 text-xs font-black uppercase tracking-[0.3em]">Empty Roster</div>
                        </div>
                    ) : (
                        teamPlayers.map((player, index) => (
                            <div key={index} className={`flex items-center border-2 border-slate-200 bg-white rounded-xl overflow-hidden shadow-sm hover:border-blue-300 transition-all group ${rowHeight}`}>
                                <div className={`${isAllMode ? 'w-12' : 'w-20'} flex-shrink-0 bg-slate-800 h-full flex flex-col items-center justify-center text-white border-r-2 border-slate-800`}>
                                    {!isAllMode && <div className="text-[10px] font-black opacity-50 uppercase tracking-tighter leading-none mb-1">Pick</div>}
                                    <div className={`${isAllMode ? 'text-sm' : 'text-2xl'} font-black leading-none`}>{player.pickNumber}</div>
                                </div>
                                <div className="flex-grow flex items-center px-5 gap-5">
                                    <div className={`py-1.5 rounded-lg font-black text-center shadow-md group-hover:scale-110 transition-transform ${badgeSize} ${getPositionColor(player.position)}`}>
                                        {player.position}
                                    </div>
                                    <div className="flex flex-col overflow-hidden">
                                        <div className={`font-black text-slate-800 uppercase tracking-tight leading-none mb-1 truncate ${nameSize}`}>{player.name}</div>
                                        <div className={`text-slate-400 font-bold uppercase tracking-wide ${subSize}`}>
                                            {player.team} • <span className="text-slate-500">Round {player.round}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            );
        }
    };

    const displayedTeams = isAllMode ? teams : [teams.find(t => t.id === selectedTeamId) || teams[0]];

    return (
        <div className="bg-white shadow-xl rounded-3xl border-2 border-slate-200 h-full flex flex-col overflow-hidden">
            {/* Header Section - Condensed */}
            <div className="bg-slate-800 p-4 md:p-6 flex flex-col md:flex-row items-center justify-between gap-4 border-b-4 border-blue-600">
                <div className="flex items-center gap-3">
                    <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-900/20 text-xl">📋</div>
                    <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight hidden sm:block">Rosters</h2>
                    
                    <select 
                        className="bg-slate-700 text-white border-2 border-slate-600 p-2 rounded-xl font-black text-sm outline-none focus:border-blue-500 transition-all cursor-pointer shadow-lg appearance-none pr-10"
                        value={selectedTeamId || ''}
                        onChange={(e) => setSelectedTeamId(e.target.value)}
                        style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23FFFFFF%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-2.6H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.8rem top 50%', backgroundSize: '.7em auto' }}
                    >
                        <option value="ALL">📋 ALL TEAMS OVERVIEW</option>
                        {teams.map(t => (
                            <option key={t.id} value={t.id}>{t.name.toUpperCase()} ({t.owner})</option>
                        ))}
                    </select>
                </div>

                {/* View Mode Toggle - Smaller */}
                <div className="flex p-1 bg-slate-900 rounded-xl w-full md:w-auto shadow-inner">
                    <button 
                        onClick={() => setViewMode('position')}
                        className={`flex-1 md:flex-none py-1.5 px-4 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'position' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-200'}`}
                    >
                        By Position
                    </button>
                    <button 
                        onClick={() => setViewMode('order')}
                        className={`flex-1 md:flex-none py-1.5 px-4 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'order' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                        By Pick Order
                    </button>
                </div>
            </div>

            {/* Content Section */}
            <div className="flex-grow overflow-y-auto p-4 md:p-8 bg-slate-50/50">
                <div className={`grid gap-8 ${isAllMode ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4' : 'grid-cols-1 w-full'}`}>
                    {displayedTeams.map(team => (
                        <div key={team.id} className="flex flex-col h-full bg-white rounded-[2rem] border-2 border-slate-200 overflow-hidden shadow-md hover:shadow-xl transition-all duration-300">
                            <div className="bg-slate-700 px-6 py-5 border-b-4 border-slate-800 flex items-center gap-5">
                                {team.avatar ? (
                                    <img src={team.avatar} alt="" className="w-16 h-12 rounded-2xl object-cover border-2 border-slate-500 shadow-md" />
                                ) : (
                                    <div className="w-12 h-12 rounded-2xl bg-slate-600 flex items-center justify-center text-slate-300 text-sm font-black uppercase border-2 border-slate-500 shadow-inner">
                                        {team.name.substring(0, 2)}
                                    </div>
                                )}
                                <div className="leading-tight">
                                    <div className="text-white font-black uppercase text-lg tracking-tight truncate max-w-[220px]">{team.name}</div>
                                    <div className="text-xs text-blue-400 font-black uppercase tracking-widest">{team.owner}</div>
                                </div>
                            </div>
                            <div className="p-6 flex-grow bg-slate-50/30">
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
