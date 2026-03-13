import React, { useState, useEffect } from 'react';

const TeamSettings = ({ teams, settings, onUpdateSettings, onAddTeam, onUpdateTeam, onDeleteTeam, onShuffleTeams, onReorderTeams, onUpload, onReset }) => {
    const [newTeamName, setNewTeamName] = useState('');
    const [newOwnerName, setNewOwnerName] = useState('');
    const [newAvatarUrl, setNewAvatarUrl] = useState('');
    const [pickTime, setPickTime] = useState(settings?.timePerPick || 120);
    const [rosterPositions, setRosterPositions] = useState(settings?.rosterPositions || {
        QB: 1, RB: 2, WR: 2, TE: 1, FLEX: 1, K: 1, DEF: 1, BENCH: 6
    });
    const [isSaving, setIsSaving] = useState(false);
    
    // Local state for drag and drop
    const [localTeams, setLocalTeams] = useState(teams);
    
    useEffect(() => {
        setLocalTeams(teams);
    }, [teams]);

    useEffect(() => {
        console.log("Settings Prop Changed:", settings?.timePerPick);
        if (settings?.timePerPick && settings.timePerPick !== parseInt(pickTime)) {
            setPickTime(settings.timePerPick);
        }
        if (settings?.rosterPositions) {
            setRosterPositions(settings.rosterPositions);
        }
    }, [settings]);

    const handleUpdateSettings = async () => {
        console.log("Handle Update Settings Clicked. Value:", pickTime);
        const newTime = parseInt(pickTime);
        if (isNaN(newTime) || newTime <= 0) {
            alert("Please enter a valid number of seconds.");
            return;
        }

        setIsSaving(true);
        try {
            await onUpdateSettings({ 
                timePerPick: newTime,
                rosterPositions: rosterPositions
            });
            console.log("Update Settings Callback Finished");
        } catch (err) {
            console.error("Failed to update settings:", err);
            alert(`Error saving settings: ${err.message}`);
        } finally {
            setIsSaving(false);
        }
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

    const handleDragStart = (e, index) => {
        e.dataTransfer.setData('sourceIndex', index);
        // Delay adding class to leave the drag image normal
        setTimeout(() => {
            e.target.classList.add('opacity-50');
        }, 0);
    };

    const handleDragEnd = (e) => {
        e.target.classList.remove('opacity-50');
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.currentTarget.classList.add('bg-blue-50');
    };

    const handleDragLeave = (e) => {
        e.currentTarget.classList.remove('bg-blue-50');
    };

    const handleDrop = (e, destinationIndex) => {
        e.preventDefault();
        e.currentTarget.classList.remove('bg-blue-50');
        
        const sourceIndex = parseInt(e.dataTransfer.getData('sourceIndex'), 10);
        if (isNaN(sourceIndex) || sourceIndex === destinationIndex) return;

        const newTeams = Array.from(localTeams);
        const [movedTeam] = newTeams.splice(sourceIndex, 1);
        newTeams.splice(destinationIndex, 0, movedTeam);
        
        setLocalTeams(newTeams);
        onReorderTeams(newTeams.map(t => t.id));
    };

    return (
        <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-6">Draft Settings</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">Manage Teams</h3>
                        <button 
                            onClick={onShuffleTeams}
                            className="bg-purple-600 text-white px-4 py-1 rounded hover:bg-purple-700 text-sm font-bold shadow-sm"
                            disabled={teams.length < 2}
                        >
                            Shuffle Order
                        </button>
                    </div>
                    <div className="flex flex-col gap-2 mb-4">
                        <div className="flex flex-col md:flex-row gap-2">
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
                        <div className="flex flex-col md:flex-row gap-2">
                            <input 
                                type="text" 
                                placeholder="Avatar Image URL (Optional)" 
                                className="border p-2 rounded flex-grow"
                                value={newAvatarUrl}
                                onChange={(e) => setNewAvatarUrl(e.target.value)}
                            />
                            <button 
                                onClick={handleAdd}
                                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 font-bold w-full md:w-auto"
                            >
                                Add Team
                            </button>
                        </div>
                    </div>

                    <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                        {localTeams.map((team, index) => (
                            <div 
                                key={team.id} 
                                className="flex justify-between items-center bg-gray-50 p-2 rounded border cursor-grab active:cursor-grabbing transition-colors"
                                draggable
                                onDragStart={(e) => handleDragStart(e, index)}
                                onDragEnd={handleDragEnd}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={(e) => handleDrop(e, index)}
                            >
                                <div className="flex items-center gap-3 pointer-events-none">
                                    <div className="text-gray-400 cursor-grab px-1">⋮</div>
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
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-2">
                                <label className="text-sm font-medium w-32">Time Per Pick (sec):</label>
                                <input 
                                    type="number" 
                                    className="border p-1 rounded w-20"
                                    value={pickTime}
                                    onChange={(e) => setPickTime(e.target.value)}
                                    min="1"
                                />
                            </div>
                            
                            <div className="border-t pt-3">
                                <label className="text-sm font-medium block mb-2">Roster Position Limits:</label>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                    {['QB', 'RB', 'WR', 'TE', 'FLEX', 'K', 'DEF', 'BENCH'].map(pos => (
                                        <div key={pos} className="flex items-center justify-between bg-white p-1 px-2 rounded border text-sm">
                                            <span className="font-bold">{pos}</span>
                                            <input 
                                                type="number"
                                                className="w-12 border rounded px-1 text-center"
                                                value={rosterPositions[pos]}
                                                min="0"
                                                max="10"
                                                onChange={(e) => setRosterPositions({
                                                    ...rosterPositions,
                                                    [pos]: parseInt(e.target.value) || 0
                                                })}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <button 
                                onClick={handleUpdateSettings}
                                disabled={isSaving}
                                className={`${isSaving ? 'bg-gray-400' : 'bg-slate-600 hover:bg-slate-700'} text-white px-3 py-2 rounded text-sm transition-colors mt-2 font-bold shadow-sm`}
                            >
                                {isSaving ? 'Saving...' : 'Save Settings'}
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
