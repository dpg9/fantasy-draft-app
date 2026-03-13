import React from 'react';

const DraftBoard = ({ teams, picks, players, totalRounds, currentPick }) => {
    // Helper to find pick for a specific cell
    const getPick = (round, teamIndex) => {
        // Snake Draft Logic for pick number
        // Odd rounds (1, 3...): 0 -> N-1
        // Even rounds (2, 4...): N-1 -> 0
        
        // This is complex to calculate pick number from cell, 
        // easier to find if a pick exists for this round/team combination.
        // But our picks store `teamId`.
        
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
            'DST': 'bg-yellow-600 text-white'
        };
        return colors[pos?.toUpperCase()] || 'bg-gray-200 text-gray-800';
    };

    return (
        <div className="overflow-x-auto bg-white shadow rounded-lg p-4">
            <h2 className="text-xl font-bold mb-4">Draft Board</h2>
            <div className="min-w-max">
                <div className="flex">
                    <div className="w-16 flex-shrink-0"></div> {/* Row Header Spacer */}
                    {teams.map((team, index) => (
                        <div key={team.id} className="w-40 p-2 text-center font-bold border-b-2 border-gray-200 flex flex-col items-center">
                            {team.avatar && <img src={team.avatar} alt="" className="w-10 h-10 rounded-full mb-1 object-cover border" />}
                            <div className="text-sm truncate w-full">{team.name}</div>
                            <div className="text-xs text-gray-500">{team.owner}</div>
                        </div>
                    ))}
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
                                
                                return (
                                    <div 
                                        key={`${round}-${team.id}`} 
                                        className={`w-40 p-1 h-20 text-xs flex flex-col justify-center items-center border-l border-gray-100 transition-all
                                            ${active ? 'bg-yellow-100 ring-4 ring-yellow-400 z-10 scale-105 shadow-lg' : ''}
                                        `}
                                    >
                                        {player ? (
                                            <div className={`w-full h-full rounded p-2 flex flex-col justify-center items-center shadow-sm ${getPositionColor(player.position)}`}>
                                                <div className="font-bold truncate w-full text-center leading-tight">{player.name}</div>
                                                <div className="text-[10px] opacity-90">{player.position} - {player.team}</div>
                                            </div>
                                        ) : active ? (
                                            <div className="text-yellow-600 font-black animate-pulse text-center">
                                                <div className="text-sm">PICKING</div>
                                                <div className="text-[10px]">NOW</div>
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
