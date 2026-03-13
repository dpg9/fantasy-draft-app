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

    return (
        <div className="overflow-x-auto bg-white shadow rounded-lg p-4">
            <h2 className="text-xl font-bold mb-4">Draft Board</h2>
            <div className="min-w-max">
                <div className="flex">
                    <div className="w-16 flex-shrink-0"></div> {/* Row Header Spacer */}
                    {teams.map((team, index) => (
                        <div key={team.id} className="w-32 p-2 text-center font-bold border-b-2 border-gray-200">
                            <div className="text-sm truncate">{team.name}</div>
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
                                        className={`w-32 p-2 h-16 text-xs flex flex-col justify-center items-center border-l border-gray-100 
                                            ${active ? 'bg-yellow-100 ring-2 ring-yellow-400' : ''}
                                            ${player ? 'bg-green-50' : ''}
                                        `}
                                    >
                                        {player ? (
                                            <>
                                                <div className="font-bold truncate w-full text-center">{player.name}</div>
                                                <div className="text-gray-500">{player.position} - {player.team}</div>
                                            </>
                                        ) : active ? (
                                            <div className="text-yellow-600 font-bold animate-pulse">ON CLOCK</div>
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
