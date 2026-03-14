import React, { useState, useEffect } from 'react';

const TeamSettings = ({ teams, settings, onUpdateSettings, onAddTeam, onUpdateTeam, onDeleteTeam, onShuffleTeams, onReorderTeams, onUpload, onReset }) => {
    const [newTeamName, setNewTeamName] = useState('');
    const [newOwnerName, setNewOwnerName] = useState('');
    const [newAvatarUrl, setNewAvatarUrl] = useState('');
    const [draftTitle, setDraftTitle] = useState(settings?.draftTitle || "FANTASY DRAFT '26");
    const [pickTime, setPickTime] = useState(settings?.timePerPick || 120);
    const [rosterPositions, setRosterPositions] = useState(settings?.rosterPositions || {
        QB: 1, RB: 2, WR: 2, TE: 1, FLEX: 1, K: 1, DEF: 1, DL: 0, DE: 0, DT: 0, LB: 0, DB: 0, CB: 0, S: 0, IDP: 0, BENCH: 6
    });
    const [isSaving, setIsSaving] = useState(false);
    const [editingTeamId, setEditingTeamId] = useState(null);
    const [editTeamName, setEditTeamName] = useState('');
    const [editOwnerName, setEditOwnerName] = useState('');
    const [editAvatarUrl, setEditAvatarUrl] = useState('');
    
    // Local state for drag and drop
    const [localTeams, setLocalTeams] = useState(teams);
    
    useEffect(() => {
        setLocalTeams(teams);
    }, [teams]);

    useEffect(() => {
        if (settings?.draftTitle) {
            setDraftTitle(settings.draftTitle);
        }
        if (settings?.timePerPick && settings.timePerPick !== parseInt(pickTime)) {
            setPickTime(settings.timePerPick);
        }
        if (settings?.rosterPositions) {
            setRosterPositions(settings.rosterPositions);
        }
    }, [settings]);

    const handleUpdateSettings = async () => {
        const newTime = parseInt(pickTime);
        if (isNaN(newTime) || newTime <= 0) {
            alert("Please enter a valid number of seconds.");
            return;
        }

        setIsSaving(true);
        try {
            await onUpdateSettings({ 
                draftTitle: draftTitle,
                timePerPick: newTime,
                rosterPositions: rosterPositions
            });
        } catch (err) {
            console.error("Failed to update settings:", err);
            alert(`Error saving settings: ${err.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    const handleStartEdit = (team) => {
        setEditingTeamId(team.id);
        setEditTeamName(team.name);
        setEditOwnerName(team.owner);
        setEditAvatarUrl(team.avatar || '');
    };

    const handleSaveEdit = async () => {
        try {
            await onUpdateTeam(editingTeamId, {
                name: editTeamName,
                owner: editOwnerName,
                avatar: editAvatarUrl
            });
            setEditingTeamId(null);
        } catch (err) {
            alert("Failed to update team");
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

    const offensivePositions = ['QB', 'RB', 'WR', 'TE', 'FLEX', 'BENCH'];
    const defensivePositions = ['K', 'DEF', 'DL', 'DE', 'DT', 'LB', 'DB', 'CB', 'S', 'IDP'];

    return (
        <div className="flex flex-col gap-6 h-full overflow-y-auto pb-10">
            <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                <div className="flex-grow space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Draft Title</label>
                    <input 
                        type="text" 
                        className="text-3xl font-black text-slate-800 uppercase tracking-tight bg-transparent border-b-2 border-transparent hover:border-slate-200 focus:border-blue-500 outline-none w-full transition-all"
                        value={draftTitle}
                        onChange={(e) => setDraftTitle(e.target.value)}
                        onBlur={handleUpdateSettings}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* TEAM MANAGEMENT SECTION */}
                <div className="flex flex-col gap-6">
                    <section className="bg-white shadow-sm border border-slate-200 rounded-xl overflow-hidden">
                        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                            <h3 className="font-bold text-slate-700 flex items-center gap-2">
                                <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
                                Manage Teams
                            </h3>
                            <button 
                                onClick={onShuffleTeams}
                                className="bg-purple-100 text-purple-700 px-3 py-1 rounded-md hover:bg-purple-200 text-xs font-bold transition-colors border border-purple-200"
                                disabled={teams.length < 2}
                            >
                                🔀 Shuffle Draft Order
                            </button>
                        </div>
                        
                        <div className="p-6">
                            <div className="space-y-4 mb-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Team Name</label>
                                        <input 
                                            type="text" 
                                            className="w-full border border-slate-200 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                            value={newTeamName}
                                            onChange={(e) => setNewTeamName(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Owner Name</label>
                                        <input 
                                            type="text" 
                                            className="w-full border border-slate-200 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                            value={newOwnerName}
                                            onChange={(e) => setNewOwnerName(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Avatar URL (Optional)</label>
                                    <div className="flex gap-2">
                                        <input 
                                            type="text" 
                                            className="flex-grow border border-slate-200 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                            value={newAvatarUrl}
                                            onChange={(e) => setNewAvatarUrl(e.target.value)}
                                        />
                                        <button 
                                            onClick={handleAdd}
                                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-bold shadow-md transition-all active:scale-95"
                                        >
                                            Add
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                {localTeams.map((team, index) => (
                                    <div 
                                        key={team.id} 
                                        className={`flex flex-col bg-white rounded-lg border transition-all group ${editingTeamId === team.id ? 'border-blue-500 shadow-md p-4' : 'p-3 border-slate-100 hover:border-blue-200 hover:shadow-sm'}`}
                                        draggable={editingTeamId !== team.id}
                                        onDragStart={(e) => handleDragStart(e, index)}
                                        onDragEnd={handleDragEnd}
                                        onDragOver={handleDragOver}
                                        onDragLeave={handleDragLeave}
                                        onDrop={(e) => handleDrop(e, index)}
                                    >
                                        {editingTeamId === team.id ? (
                                            <div className="space-y-3">
                                                <div className="grid grid-cols-2 gap-2">
                                                    <input 
                                                        type="text" 
                                                        className="border p-2 rounded text-sm w-full"
                                                        value={editTeamName}
                                                        onChange={(e) => setEditTeamName(e.target.value)}
                                                        placeholder="Team Name"
                                                    />
                                                    <input 
                                                        type="text" 
                                                        className="border p-2 rounded text-sm w-full"
                                                        value={editOwnerName}
                                                        onChange={(e) => setEditOwnerName(e.target.value)}
                                                        placeholder="Owner Name"
                                                    />
                                                </div>
                                                <input 
                                                    type="text" 
                                                    className="border p-2 rounded text-sm w-full"
                                                    value={editAvatarUrl}
                                                    onChange={(e) => setEditAvatarUrl(e.target.value)}
                                                    placeholder="Avatar URL"
                                                />
                                                <div className="flex gap-2 justify-end">
                                                    <button onClick={() => setEditingTeamId(null)} className="text-xs text-slate-500 font-bold px-3 py-1">Cancel</button>
                                                    <button onClick={handleSaveEdit} className="bg-blue-600 text-white text-xs font-bold px-4 py-1 rounded shadow-sm">Save Team</button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex justify-between items-center">
                                                <div className="flex items-center gap-4 pointer-events-none">
                                                    <div className="text-slate-300 group-hover:text-blue-400 transition-colors">⋮⋮</div>
                                                    <span className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center text-[10px] font-bold text-slate-500">
                                                        {index + 1}
                                                    </span>
                                                    {team.avatar ? (
                                                        <img src={team.avatar} alt="" className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm" />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-400 text-xs font-bold uppercase">
                                                            {team.name.substring(0, 2)}
                                                        </div>
                                                    )}
                                                    <div>
                                                        <div className="font-bold text-slate-800">{team.name}</div>
                                                        <div className="text-xs text-slate-400">{team.owner}</div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <button 
                                                        onClick={() => handleStartEdit(team)}
                                                        className="text-slate-300 hover:text-blue-500 p-2 transition-colors opacity-0 group-hover:opacity-100"
                                                        title="Edit Team"
                                                    >
                                                        ✎
                                                    </button>
                                                    <button 
                                                        onClick={() => onDeleteTeam(team.id)}
                                                        className="text-slate-300 hover:text-red-500 p-2 transition-colors opacity-0 group-hover:opacity-100"
                                                        title="Remove Team"
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                </div>

                {/* DRAFT CONFIGURATION SECTION */}
                <div className="flex flex-col gap-6">
                    <section className="bg-white shadow-sm border border-slate-200 rounded-xl overflow-hidden">
                        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                            <h3 className="font-bold text-slate-700 flex items-center gap-2">
                                <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span>
                                Draft Configuration
                            </h3>
                            <button 
                                onClick={handleUpdateSettings}
                                disabled={isSaving}
                                className={`${isSaving ? 'bg-slate-300' : 'bg-green-600 hover:bg-green-700'} text-white px-4 py-1 rounded-md text-xs font-bold transition-all shadow-sm active:scale-95`}
                            >
                                {isSaving ? 'Saving...' : '💾 Save All Changes'}
                            </button>
                        </div>
                        
                        <div className="p-6 space-y-8">
                            {/* Timer Setting */}
                            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                                <div className="bg-white p-3 rounded-lg shadow-sm">⏱️</div>
                                <div className="flex-grow">
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Time Per Pick</label>
                                    <div className="flex items-center gap-2">
                                        <input 
                                            type="number" 
                                            className="border border-slate-200 p-2 rounded-lg w-24 focus:ring-2 focus:ring-blue-500 outline-none"
                                            value={pickTime}
                                            onChange={(e) => setPickTime(e.target.value)}
                                            min="1"
                                        />
                                        <span className="text-sm text-slate-400 font-medium">seconds</span>
                                    </div>
                                </div>
                            </div>

                            {/* Roster Positions */}
                            <div className="space-y-4">
                                <div>
                                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                        🏈 Offensive Slots
                                    </h4>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        {offensivePositions.map(pos => (
                                            <div key={pos} className="flex flex-col bg-slate-50 rounded-lg border border-slate-100 p-2">
                                                <span className="text-[10px] font-black text-slate-500 mb-1">{pos}</span>
                                                <input 
                                                    type="number"
                                                    className="w-full bg-white border border-slate-200 rounded p-1 text-center font-bold text-slate-700"
                                                    value={rosterPositions[pos]}
                                                    min="0"
                                                    onChange={(e) => setRosterPositions({
                                                        ...rosterPositions,
                                                        [pos]: parseInt(e.target.value) || 0
                                                    })}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 mt-6 flex items-center gap-2">
                                        🛡️ Defensive & IDP Slots
                                    </h4>
                                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                                        {defensivePositions.map(pos => (
                                            <div key={pos} className="flex flex-col bg-slate-50 rounded-lg border border-slate-100 p-2">
                                                <span className="text-[10px] font-black text-slate-500 mb-1">{pos}</span>
                                                <input 
                                                    type="number"
                                                    className="w-full bg-white border border-slate-200 rounded p-1 text-center font-bold text-slate-700"
                                                    value={rosterPositions[pos]}
                                                    min="0"
                                                    onChange={(e) => setRosterPositions({
                                                        ...rosterPositions,
                                                        [pos]: parseInt(e.target.value) || 0
                                                    })}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="bg-white shadow-sm border border-slate-200 rounded-xl overflow-hidden">
                        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
                            <h3 className="font-bold text-slate-700 flex items-center gap-2">
                                <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">3</span>
                                Import Players
                            </h3>
                        </div>
                        <div className="p-6">
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-3 ml-1">Upload CSV Database</label>
                            <input 
                                type="file" 
                                accept=".csv"
                                onChange={handleFileUpload}
                                className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-all cursor-pointer"
                            />
                            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                                <p className="text-[10px] text-blue-600 leading-relaxed font-medium">
                                    <strong>Required Columns:</strong> id, name, position, team, rank
                                </p>
                            </div>
                        </div>
                    </section>

                    <section className="bg-red-50 shadow-sm border border-red-100 rounded-xl overflow-hidden mt-auto">
                        <div className="bg-red-100 px-6 py-3 border-b border-red-200 flex justify-between items-center">
                            <h3 className="font-bold text-red-700 flex items-center gap-2 text-sm uppercase tracking-wider">
                                ⚠️ Danger Zone
                            </h3>
                        </div>
                        <div className="p-6">
                            <p className="text-xs text-red-600 mb-4 font-medium italic">Warning: This will permanently erase all picks and team data.</p>
                            <button 
                                onClick={() => {
                                    if(confirm('Are you sure you want to reset the entire draft? This cannot be undone.')) onReset();
                                }}
                                className="bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 w-full font-black uppercase tracking-widest text-sm shadow-md transition-all active:scale-95"
                            >
                                Reset Draft State
                            </button>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default TeamSettings;
