import React, { useState, useEffect } from 'react';

const TeamSettings = ({ teams, settings, onUpdateSettings, onAddTeam, onUpdateTeam, onDeleteTeam, onUpload, onReset }) => {
    const [newTeamName, setNewTeamName] = useState('');
    const [newOwnerName, setNewOwnerName] = useState('');
    const [newAvatarUrl, setNewAvatarUrl] = useState('');
    const [pickTime, setPickTime] = useState(settings?.timePerPick || 120);

    useEffect(() => {
        if (settings?.timePerPick) {
            setPickTime(settings.timePerPick);
        }
    }, [settings]);

    const handleUpdateSettings = () => {
        onUpdateSettings({ timePerPick: parseInt(pickTime) });
    };

    const handleAdd = () => {
        if (newTeamName && newOwnerName) {
            onAddTeam({ 
                name: newTeamName, 
                owner: newOwnerName, 
                avatar: newAvatarUrl 
            });
            setNewTeamName('');
            setNewOwnerName('');
            setNewAvatarUrl('');
        }
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            onUpload(file);
        }
    };

    return (
        <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-6">Draft Settings</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <h3 className="text-lg font-semibold mb-4">Manage Teams</h3>
                    <div className="flex flex-col gap-2 mb-4">
                        <div className="flex gap-2">
                            <input 
                                type="text" 
                                placeholder="Team Name" 
                                className="border p-2 rounded flex-grow"
                                value={newTeamName}
                                onChange={(e) => setNewTeamName(e.target.value)}
                            />
                            <input 
                                type="text" 
                                placeholder="Owner Name" 
                                className="border p-2 rounded flex-grow"
                                value={newOwnerName}
                                onChange={(e) => setNewOwnerName(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2">
                            <input 
                                type="text" 
                                placeholder="Avatar Image URL (Optional)" 
                                className="border p-2 rounded flex-grow"
                                value={newAvatarUrl}
                                onChange={(e) => setNewAvatarUrl(e.target.value)}
                            />
                            <button 
                                onClick={handleAdd}
                                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 font-bold"
                            >
                                Add Team
                            </button>
                        </div>
                    </div>

                    <div className="space-y-2 max-h-60 overflow-y-auto">
                        {teams.map((team, index) => (
                            <div key={team.id} className="flex justify-between items-center bg-gray-50 p-2 rounded border">
                                <div className="flex items-center gap-3">
                                    {team.avatar && <img src={team.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />}
                                    <div>
                                        <span className="font-bold">{index + 1}. {team.name}</span>
                                        <span className="text-gray-500 ml-2 text-sm">({team.owner})</span>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => onDeleteTeam(team.id)}
                                    className="text-red-500 hover:text-red-700 px-2"
                                >
                                    Delete
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <h3 className="text-lg font-semibold mb-4">Data Management</h3>

                    <div className="mb-6 p-4 bg-gray-50 rounded border">
                        <h4 className="font-bold mb-2">Draft Settings</h4>
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-2">
                                <label className="text-sm">Time Per Pick (sec):</label>
                                <input 
                                    type="number" 
                                    className="border p-1 rounded w-20"
                                    value={pickTime}
                                    onChange={(e) => setPickTime(e.target.value)}
                                />
                            </div>
                            <button 
                                onClick={handleUpdateSettings}
                                className="bg-slate-600 text-white px-3 py-1 rounded text-sm hover:bg-slate-700"
                            >
                                Save Settings
                            </button>
                        </div>
                    </div>

                    <div className="mb-6">
                        <label className="block mb-2 font-medium">Upload Players CSV</label>
                        <input 
                            type="file" 
                            accept=".csv"
                            onChange={handleFileUpload}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                        <p className="text-xs text-gray-400 mt-1">Columns: id, name, position, team, rank</p>
                    </div>

                    <div className="border-t pt-6">
                         <h3 className="text-lg font-semibold mb-4 text-red-600">Danger Zone</h3>
                         <button 
                            onClick={() => {
                                if(confirm('Are you sure you want to reset the entire draft?')) onReset();
                            }}
                            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 w-full"
                        >
                            Reset Draft
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeamSettings;
