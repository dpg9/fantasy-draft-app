import React, { useState, useEffect } from 'react';

const TeamSettings = ({ teams, settings, picks, onUpdateSettings, onAddTeam, onUpdateTeam, onDeleteTeam, onBulkAddTeams, onClearAllTeams, onShuffleTeams, onReorderTeams, onUpload, onClearPicks, onReset }) => {
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
    const [dragOverIndex, setDragOverIndex] = useState(null);
    
    // Local state for drag and drop
    const [localTeams, setLocalTeams] = useState(teams);
    
    const isDraftStarted = picks && picks.length > 0;
    
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
            e.target.classList.add('opacity-30');
        }, 0);
    };

    const handleDragEnd = (e) => {
        e.target.classList.remove('opacity-30');
        setDragOverIndex(null);
    };

    const handleDragOver = (e, index) => {
        e.preventDefault();
        if (dragOverIndex !== index) {
            setDragOverIndex(index);
        }
    };

    const handleDragLeave = (e) => {
        // Only clear if we are leaving the container, but since we have multiple items, 
        // handleDragOver will update it for the next item.
    };

    const handleDrop = (e, destinationIndex) => {
        e.preventDefault();
        setDragOverIndex(null);
        
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
        <div className="flex flex-col gap-6 h-full overflow-y-auto pb-10 px-2">
            <div className="flex flex-col md:flex-row justify-between items-end gap-4 bg-slate-800 p-6 rounded-xl shadow-lg border-b-4 border-blue-600">
                <div className="flex-grow space-y-1">
                    <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest ml-1">Draft Control Panel</label>
                    <input 
                        type="text" 
                        className="text-3xl font-black text-white uppercase tracking-tight bg-transparent border-b-2 border-slate-600 hover:border-blue-400 focus:border-blue-500 outline-none w-full transition-all py-1"
                        value={draftTitle}
                        onChange={(e) => setDraftTitle(e.target.value)}
                        onBlur={handleUpdateSettings}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* TEAM MANAGEMENT SECTION */}
                <div className="flex flex-col gap-6">
                    <section className="bg-white shadow-md border-2 border-slate-200 rounded-xl overflow-hidden">
                        <div className="bg-slate-700 px-6 py-4 border-b-2 border-slate-300 flex justify-between items-center">
                            <h3 className="font-black text-white uppercase tracking-wider flex items-center gap-3">
                                <span className="bg-blue-500 text-white w-7 h-7 rounded-lg flex items-center justify-center text-sm shadow-inner">1</span>
                                Manage Teams
                            </h3>
                            <button 
                                onClick={onShuffleTeams}
                                className={`${isDraftStarted ? 'bg-slate-200 text-slate-400 border-slate-300 cursor-not-allowed' : 'bg-purple-600 text-white hover:bg-purple-700 border-purple-400 active:scale-95'} px-4 py-1.5 rounded-lg text-xs font-black transition-all shadow-md border uppercase tracking-tight`}
                                disabled={teams.length < 2 || isDraftStarted}
                                title={isDraftStarted ? "Order is locked once the draft starts" : "Randomize Team Order"}
                            >
                                {isDraftStarted ? '🔒 Order Locked' : '🔀 Randomize Order'}
                            </button>
                        </div>
                        
                        <div className="p-6 bg-slate-50/50">
                            {isDraftStarted && (
                                <div className="mb-6 p-3 bg-amber-50 border-2 border-amber-200 rounded-xl flex items-center gap-3">
                                    <span className="text-xl">🔒</span>
                                    <div className="text-[10px] font-black text-amber-700 uppercase leading-tight">
                                        The draft has already started. <br/>
                                        Adding, deleting, or reordering teams is disabled to prevent board corruption.
                                    </div>
                                </div>
                            )}
                            
                            {!isDraftStarted && (
                                <div className="flex flex-wrap gap-2 mb-6">
                                    <button 
                                        onClick={() => { if(confirm('Clear all current teams?')) onClearAllTeams(); }}
                                        className="bg-white text-red-600 border-2 border-red-100 hover:border-red-200 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tight transition-all active:scale-95 shadow-sm"
                                    >
                                        🗑️ Clear All Teams
                                    </button>
                                    <button 
                                        onClick={() => onBulkAddTeams(10)}
                                        className="bg-white text-blue-600 border-2 border-blue-100 hover:border-blue-200 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tight transition-all active:scale-95 shadow-sm"
                                    >
                                        ➕ Add 10 Teams
                                    </button>
                                    <button 
                                        onClick={() => onBulkAddTeams(12)}
                                        className="bg-white text-blue-600 border-2 border-blue-100 hover:border-blue-200 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tight transition-all active:scale-95 shadow-sm"
                                    >
                                        ➕ Add 12 Teams
                                    </button>
                                </div>
                            )}

                            {!isDraftStarted && (
                                <div className="bg-white p-4 rounded-xl border-2 border-slate-200 shadow-sm mb-8 space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-slate-500 uppercase ml-1 tracking-tighter">New Team Name</label>
                                            <input 
                                                type="text" 
                                                className="w-full bg-slate-50 border-2 border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all font-bold text-slate-800"
                                                value={newTeamName}
                                                placeholder="The Dynamos"
                                                onChange={(e) => setNewTeamName(e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-slate-500 uppercase ml-1 tracking-tighter">Owner Name</label>
                                            <input 
                                                type="text" 
                                                className="w-full bg-slate-50 border-2 border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all font-bold text-slate-800"
                                                value={newOwnerName}
                                                placeholder="John Smith"
                                                onChange={(e) => setNewOwnerName(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-500 uppercase ml-1 tracking-tighter">Avatar URL (Optional)</label>
                                        <div className="flex gap-3">
                                            <input 
                                                type="text" 
                                                className="flex-grow bg-slate-50 border-2 border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all font-medium text-slate-600"
                                                value={newAvatarUrl}
                                                placeholder="https://..."
                                                onChange={(e) => setNewAvatarUrl(e.target.value)}
                                            />
                                            <button 
                                                onClick={handleAdd}
                                                className="bg-blue-600 text-white px-8 py-2.5 rounded-lg hover:bg-blue-700 font-black shadow-lg transition-all active:scale-95 uppercase tracking-widest text-sm"
                                            >
                                                Add
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-3">
                                {localTeams.map((team, index) => {
                                    const isTarget = dragOverIndex === index;
                                    const canModify = !isDraftStarted && editingTeamId !== team.id;
                                    return (
                                        <div 
                                            key={team.id} 
                                            className={`flex flex-col rounded-xl border-2 transition-all group shadow-sm relative
                                                ${editingTeamId === team.id ? 'bg-blue-50/30 border-blue-500 ring-4 ring-blue-50 p-4' : 'p-3'}
                                                ${canModify ? 'cursor-grab active:cursor-grabbing' : ''}
                                                ${isTarget ? 'bg-blue-600 border-blue-800 scale-[1.02] z-10 shadow-xl border-dashed' : 'bg-white border-slate-200 hover:border-blue-300'}
                                            `}
                                            draggable={canModify}
                                            onDragStart={(e) => handleDragStart(e, index)}
                                            onDragEnd={handleDragEnd}
                                            onDragOver={(e) => canModify ? handleDragOver(e, index) : null}
                                            onDragLeave={handleDragLeave}
                                            onDrop={(e) => canModify ? handleDrop(e, index) : null}
                                        >
                                            {isTarget && (
                                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                    <span className="text-white font-black text-xs uppercase tracking-widest bg-blue-800/50 px-3 py-1 rounded-full shadow-lg">Drop Here</span>
                                                </div>
                                            )}
                                            {editingTeamId === team.id ? (
                                                <div className="space-y-4">
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div className="space-y-1">
                                                            <label className="text-[9px] font-black text-blue-600 uppercase ml-1">Team Name</label>
                                                            <input 
                                                                type="text" 
                                                                className="border-2 border-blue-200 p-2 rounded-lg text-sm w-full font-bold focus:border-blue-500 outline-none"
                                                                value={editTeamName}
                                                                onChange={(e) => setEditTeamName(e.target.value)}
                                                            />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-[9px] font-black text-blue-600 uppercase ml-1">Owner Name</label>
                                                            <input 
                                                                type="text" 
                                                                className="border-2 border-blue-200 p-2 rounded-lg text-sm w-full font-bold focus:border-blue-500 outline-none"
                                                                value={editOwnerName}
                                                                onChange={(e) => setEditOwnerName(e.target.value)}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label className="text-[9px] font-black text-blue-600 uppercase ml-1">Avatar URL</label>
                                                        <input 
                                                            type="text" 
                                                            className="border-2 border-blue-200 p-2 rounded-lg text-sm w-full font-medium focus:border-blue-500 outline-none"
                                                            value={editAvatarUrl}
                                                            onChange={(e) => setEditAvatarUrl(e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="flex gap-2 justify-end pt-2">
                                                        <button onClick={() => setEditingTeamId(null)} className="text-xs text-slate-500 font-black uppercase px-4 py-2 hover:text-slate-700">Cancel</button>
                                                        <button onClick={handleSaveEdit} className="bg-blue-600 text-white text-xs font-black uppercase px-6 py-2 rounded-lg shadow-md hover:bg-blue-700 transition-all">Save Changes</button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className={`flex justify-between items-center transition-opacity ${isTarget ? 'opacity-20' : 'opacity-100'}`}>
                                                    <div className="flex items-center gap-4 pointer-events-none">
                                                        <div className={`transition-colors text-xl ${isTarget ? 'text-white' : 'text-slate-300 group-hover:text-blue-400'}`}>⋮⋮</div>
                                                        <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black shadow-md transition-colors ${isTarget ? 'bg-white text-blue-600' : 'bg-slate-800 text-white'}`}>
                                                            {index + 1}
                                                        </span>
                                                        {team.avatar ? (
                                                            <img src={team.avatar} alt="" className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md group-hover:scale-110 transition-all" />
                                                        ) : (
                                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-black uppercase border-2 shadow-inner group-hover:scale-110 transition-all ${isTarget ? 'bg-blue-500 text-white border-blue-400' : 'bg-blue-100 text-blue-600 border-blue-200'}`}>
                                                                {team.name.substring(0, 2)}
                                                            </div>
                                                        )}
                                                        <div>
                                                            <div className={`font-black text-lg leading-tight transition-colors ${isTarget ? 'text-white' : 'text-slate-800'}`}>{team.name}</div>
                                                            <div className={`text-xs font-bold uppercase tracking-wide transition-colors ${isTarget ? 'text-blue-100' : 'text-slate-500'}`}>{team.owner}</div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <button 
                                                            onClick={() => handleStartEdit(team)}
                                                            className={`p-2.5 rounded-lg transition-all opacity-0 group-hover:opacity-100 shadow-sm ${isTarget ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-500 hover:bg-blue-100 hover:text-blue-600'}`}
                                                            title="Edit Team"
                                                        >
                                                            ✎
                                                        </button>
                                                        {!isDraftStarted && (
                                                            <button 
                                                                onClick={() => onDeleteTeam(team.id)}
                                                                className={`p-2.5 rounded-lg transition-all opacity-0 group-hover:opacity-100 shadow-sm ${isTarget ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-500 hover:bg-red-100 hover:text-red-600'}`}
                                                                title="Remove Team"
                                                            >
                                                                ✕
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </section>
                </div>

                {/* DRAFT CONFIGURATION SECTION */}
                <div className="flex flex-col gap-8">
                    <section className="bg-white shadow-md border-2 border-slate-200 rounded-xl overflow-hidden">
                        <div className="bg-slate-700 px-6 py-4 border-b-2 border-slate-300 flex justify-between items-center">
                            <h3 className="font-black text-white uppercase tracking-wider flex items-center gap-3">
                                <span className="bg-blue-500 text-white w-7 h-7 rounded-lg flex items-center justify-center text-sm shadow-inner">2</span>
                                Draft Configuration
                            </h3>
                            <button 
                                onClick={handleUpdateSettings}
                                disabled={isSaving}
                                className={`${isSaving ? 'bg-slate-400' : 'bg-green-600 hover:bg-green-700'} text-white px-6 py-1.5 rounded-lg text-xs font-black transition-all shadow-md active:scale-95 border border-green-400 uppercase tracking-widest`}
                            >
                                {isSaving ? 'Saving...' : '💾 Save Settings'}
                            </button>
                        </div>
                        
                        <div className="p-6 space-y-10 bg-slate-50/50">
                            {/* Timer Setting */}
                            <div className="flex items-center gap-6 p-5 bg-white rounded-2xl border-2 border-slate-200 shadow-sm">
                                <div className="bg-blue-100 text-2xl p-4 rounded-xl shadow-inner">⏱️</div>
                                <div className="flex-grow">
                                    <label className="block text-[10px] font-black text-slate-500 uppercase mb-1 tracking-widest">Time Per Pick</label>
                                    <div className="flex items-center gap-3">
                                        <input 
                                            type="number" 
                                            className="bg-slate-50 border-2 border-slate-200 p-2 rounded-lg w-28 focus:ring-2 focus:ring-blue-500 outline-none text-xl font-black text-slate-800 text-center"
                                            value={pickTime}
                                            onChange={(e) => setPickTime(e.target.value)}
                                            min="1"
                                        />
                                        <span className="text-sm text-slate-400 font-black uppercase tracking-tight">seconds</span>
                                    </div>
                                </div>
                            </div>

                            {/* Roster Positions */}
                            <div className="space-y-8">
                                <div className="bg-white p-5 rounded-2xl border-2 border-slate-200 shadow-sm">
                                    <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-5 pb-2 border-b-2 border-slate-100 flex items-center gap-2">
                                        🏈 Offensive Slots
                                    </h4>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                        {offensivePositions.map(pos => (
                                            <div key={pos} className="flex flex-col bg-slate-50 rounded-xl border-2 border-slate-200 p-3 hover:border-blue-200 transition-colors">
                                                <span className="text-[10px] font-black text-slate-500 mb-2 uppercase text-center">{pos}</span>
                                                <input 
                                                    type="number"
                                                    className="w-full bg-white border-2 border-slate-200 rounded-lg p-1.5 text-center font-black text-slate-800 text-lg shadow-sm focus:border-blue-500 outline-none transition-all"
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

                                <div className="bg-white p-5 rounded-2xl border-2 border-slate-200 shadow-sm">
                                    <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-5 pb-2 border-b-2 border-slate-100 flex items-center gap-2">
                                        🛡️ Defensive & IDP Slots
                                    </h4>
                                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                                        {defensivePositions.map(pos => (
                                            <div key={pos} className="flex flex-col bg-slate-50 rounded-xl border-2 border-slate-200 p-2 hover:border-blue-200 transition-colors">
                                                <span className="text-[9px] font-black text-slate-500 mb-1 uppercase text-center">{pos}</span>
                                                <input 
                                                    type="number"
                                                    className="w-full bg-white border-2 border-slate-200 rounded-lg p-1 text-center font-black text-slate-800 text-md shadow-sm focus:border-blue-500 outline-none transition-all"
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

                    <section className="bg-white shadow-md border-2 border-slate-200 rounded-xl overflow-hidden">
                        <div className="bg-slate-700 px-6 py-4 border-b-2 border-slate-300">
                            <h3 className="font-black text-white uppercase tracking-wider flex items-center gap-3">
                                <span className="bg-blue-500 text-white w-7 h-7 rounded-lg flex items-center justify-center text-sm shadow-inner">3</span>
                                Import Players
                            </h3>
                        </div>
                        <div className="p-6 bg-slate-50/50">
                            <div className="bg-white p-6 rounded-2xl border-2 border-slate-200 shadow-sm">
                                <label className="block text-xs font-black text-slate-500 uppercase mb-4 ml-1 tracking-widest text-center">Upload CSV Database</label>
                                <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-xl p-8 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 transition-all cursor-pointer relative group">
                                    <input 
                                        type="file" 
                                        accept=".csv"
                                        onChange={handleFileUpload}
                                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                    />
                                    <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">📂</div>
                                    <p className="text-sm text-slate-600 font-bold uppercase tracking-tight">Click to select or drag CSV file</p>
                                    <p className="text-[10px] text-slate-400 mt-2 font-medium">CSV Format: id, name, position, team, rank</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="bg-red-50 shadow-lg border-2 border-red-200 rounded-xl overflow-hidden mt-auto">
                        <div className="bg-red-600 px-6 py-4 border-b-2 border-red-700 flex justify-between items-center">
                            <h3 className="font-black text-white flex items-center gap-3 text-sm uppercase tracking-[0.2em]">
                                ⚠️ Danger Zone
                            </h3>
                        </div>
                        <div className="p-6 space-y-4 bg-red-50/50">
                            <div className="p-4 bg-white rounded-xl border-2 border-red-100 shadow-inner">
                                <p className="text-[11px] text-red-600 font-black uppercase text-center mb-4 tracking-tighter">Caution: These actions permanently erase draft data</p>
                                <div className="flex flex-col gap-3">
                                    <button 
                                        onClick={() => {
                                            if(confirm('Clear all draft picks? Teams and settings will be saved.')) onClearPicks();
                                        }}
                                        className="bg-orange-500 text-white px-4 py-3 rounded-xl hover:bg-orange-600 w-full font-black uppercase tracking-widest text-xs shadow-md transition-all active:scale-95 border-b-4 border-orange-700"
                                    >
                                        Clear All Picks
                                    </button>
                                    <button 
                                        onClick={() => {
                                            if(confirm('Are you sure you want to reset the entire draft? This will delete all teams.')) onReset();
                                        }}
                                        className="bg-red-600 text-white px-4 py-3 rounded-xl hover:bg-red-700 w-full font-black uppercase tracking-widest text-xs shadow-md transition-all active:scale-95 border-b-4 border-red-800"
                                    >
                                        Reset Entire Draft
                                    </button>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default TeamSettings;
