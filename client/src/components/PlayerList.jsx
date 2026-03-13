import React, { useState, useMemo } from 'react';

const PlayerList = ({ players, onDraft, currentTeam, isManual }) => {
    const [search, setSearch] = useState('');
    const [positionFilter, setPositionFilter] = useState('ALL');

    const positions = ['ALL', ...new Set(players.map(p => p.position))].sort();

    const filteredPlayers = useMemo(() => {
        return players.filter(p => {
            const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
            const matchPos = positionFilter === 'ALL' || p.position === positionFilter;
            return matchSearch && matchPos;
        }).sort((a, b) => a.rank - b.rank); // Sort by rank
    }, [players, search, positionFilter]);

    return (
        <div className="bg-white shadow rounded-lg p-4 h-full flex flex-col">
            <h2 className="text-xl font-bold mb-4">Available Players</h2>
            
            <div className="flex gap-2 mb-4">
                <input 
                    type="text" 
                    placeholder="Search player..." 
                    className="border p-2 rounded flex-grow"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <select 
                    className="border p-2 rounded"
                    value={positionFilter}
                    onChange={(e) => setPositionFilter(e.target.value)}
                >
                    {positions.map(pos => (
                        <option key={pos} value={pos}>{pos}</option>
                    ))}
                </select>
            </div>

            <div className="overflow-y-auto flex-grow">
                <table className="w-full text-left">
                    <thead className="bg-gray-100 sticky top-0">
                        <tr>
                            <th className="p-2">Rank</th>
                            <th className="p-2">Name</th>
                            <th className="p-2">Pos</th>
                            <th className="p-2">Team</th>
                            <th className="p-2">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredPlayers.slice(0, 50).map(player => (
                            <tr key={player.id} className="border-b hover:bg-gray-50">
                                <td className="p-2">{player.rank}</td>
                                <td className="p-2 font-medium">{player.name}</td>
                                <td className="p-2">{player.position}</td>
                                <td className="p-2 text-gray-500">{player.team}</td>
                                <td className="p-2">
                                    <button 
                                        onClick={() => onDraft(player)}
                                        className={`${isManual ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'} text-white px-3 py-1 rounded text-sm`}
                                        disabled={!currentTeam}
                                    >
                                        {isManual ? 'Insert' : 'Draft'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredPlayers.length === 0 && <div className="text-center p-4 text-gray-500">No players found</div>}
            </div>
        </div>
    );
};

export default PlayerList;
