import React, { useEffect, useRef } from 'react';

const DraftBoard = ({ teams, picks, players, totalRounds, currentPick, onUndraft, manualPickTarget, onSelectTarget }) => {
    const activePickRef = useRef(null);

    // Auto-scroll to the active pick when it changes
    useEffect(() => {
        if (activePickRef.current) {
            activePickRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
                inline: 'center'
            });
        }
    }, [currentPick]);

    // Helper to find pick for a specific cell
    const getPick = (round, teamIndex) => {
        const teamId = teams[teamIndex].id;
        const pick = picks.find(p => p.round === round && p.teamId === teamId);
        if (!pick) return null;
        
        return players.find(p => p.id === pick.playerId);
    };

    const isCurrentPick = (round, teamIndex) => {
        if (!currentPick) return false;
        return currentPick.round === round && currentPick.teamIndex === teamIndex;
    };

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
        <div className="p-4 h-full">
            <div className="min-w-max relative">
                <div className="flex sticky top-0 z-20 bg-white border-b-2 border-gray-200">
                    <div className="w-16 flex-shrink-0 bg-white"></div>
                    {teams.map((team, index) => {
                        const isOnClock = currentPick?.teamIndex === index;
                        return (
                            <div 
                                key={team.id} 
                                className={`w-40 p-2 text-center font-bold flex flex-col items-center transition-all duration-300
                                    ${isOnClock ? 'bg-yellow-50 ring-b-4 ring-yellow-400 scale-105 z-30 shadow-md' : 'bg-white'}
                                `}
                            >
                                {team.avatar ? (
                                    <img src={team.avatar} alt="" className={`w-10 h-10 rounded-full mb-1 object-cover border-2 transition-all ${isOnClock ? 'border-yellow-400 scale-110 shadow-sm' : 'border-transparent'}`} />
                                ) : (
                                    <div className={`w-10 h-10 rounded-full mb-1 flex items-center justify-center text-xs font-black uppercase transition-all ${isOnClock ? 'bg-yellow-400 text-yellow-900 scale-110 shadow-sm' : 'bg-slate-100 text-slate-400'}`}>
                                        {team.name.substring(0, 2)}
                                    </div>
                                )}
                                <div className={`text-sm truncate w-full transition-colors ${isOnClock ? 'text-yellow-700' : 'text-slate-800'}`}>{team.name}</div>
                                <div className={`text-[10px] uppercase tracking-tighter transition-colors ${isOnClock ? 'text-yellow-600' : 'text-slate-400'}`}>
                                    {isOnClock ? '⚡ On the Clock' : team.owner}
                                </div>
                            </div>
                        );
                    })}
                </div>
                
                {Array.from({ length: totalRounds }).map((_, rIndex) => {
                    const round = rIndex + 1;
                    return (
                        <div key={round} className="flex border-b border-gray-100">
                            <div className="w-16 p-2 font-bold text-gray-400 flex items-center justify-center bg-gray-50">
                                R{round}
                            </div>
                            {teams.map((team, tIndex) => {
                                const player = getPick(round, tIndex);
                                const active = isCurrentPick(round, tIndex);
                                const isOnClock = currentPick?.teamIndex === tIndex;
                                const isManualTarget = manualPickTarget?.round === round && manualPickTarget?.teamId === team.id;
                                
                                return (
                                    <div 
                                        key={`${round}-${team.id}`} 
                                        ref={active ? activePickRef : null}
                                        className={`w-40 p-1 h-20 text-xs flex flex-col justify-center items-center border-l border-gray-100 transition-all relative group cursor-pointer
                                            ${active ? 'bg-yellow-100 ring-4 ring-yellow-400 z-10 scale-105 shadow-lg' : ''}
                                            ${isOnClock && !active ? 'bg-yellow-50/50' : ''}
                                            ${isManualTarget ? 'bg-blue-100 ring-4 ring-blue-500 z-20 scale-105 shadow-lg' : ''}
                                            ${!player && !active && !isManualTarget && !isOnClock ? 'hover:bg-gray-50' : ''}
                                        `}
                                        onClick={() => {
                                            if (!player && !active) {
                                                if (isManualTarget) {
                                                    onSelectTarget(null);
                                                } else {
                                                    onSelectTarget({ round, teamId: team.id, teamIndex: tIndex });
                                                }
                                            }
                                        }}
                                    >
                                        {player ? (
                                            <div className={`w-full h-full rounded p-2 flex flex-col justify-center items-center shadow-sm relative cursor-default ${getPositionColor(player.position)}`}>
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); onUndraft(player.id); }}
                                                    className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:scale-110 cursor-pointer z-30"
                                                    title="Drop Player"
                                                >
                                                    ×
                                                </button>
                                                <div className="font-bold truncate w-full text-center leading-tight">{player.name}</div>
                                                <div className="text-[10px] opacity-90">{player.position} - {player.team}</div>
                                            </div>
                                        ) : active ? (
                                            <div className="text-yellow-600 font-black animate-pulse text-center">
                                                <div className="text-sm">PICKING</div>
                                                <div className="text-[10px]">NOW</div>
                                            </div>
                                        ) : isManualTarget ? (
                                            <div className="text-blue-600 font-bold text-center">
                                                <div className="text-xs">INSERT</div>
                                                <div className="text-[10px]">HERE</div>
                                            </div>
                                        ) : null}
                                    </div>
                                );
                            })}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default DraftBoard;
