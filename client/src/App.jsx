import React, { useState, useEffect } from 'react';
import { fetchState, draftPlayer, undraftPlayer, addTeam, updateTeam, deleteTeam, bulkAddTeams, clearAllTeams, uploadPlayers, resetDraft, clearPicks, updateSettings, shuffleTeams, reorderTeams } from './api';
import DraftBoard from './components/DraftBoard';
import PlayerList from './components/PlayerList';
import TeamSettings from './components/TeamSettings';
import TeamRoster from './components/TeamRoster';
import Timer from './components/Timer';
import { soundService } from './SoundService';

function App() {
  const [data, setData] = useState({
    teams: [],
    players: [],
    picks: [],
    currentPick: { round: 1, pickNumber: 1, teamIndex: 0 },
    settings: { totalRounds: 15, timePerPick: 120 }
  });
  const [view, setView] = useState('board'); // 'board' or 'settings'
  const [lastPickTime, setLastPickTime] = useState(Date.now());
  const [isPaused, setIsPaused] = useState(true); // Default to paused!
  const [manualPickTarget, setManualPickTarget] = useState(null);

  const loadData = async () => {
    try {
      const state = await fetchState();
      setData(state);
    } catch (err) {
      console.error("Failed to fetch state", err);
    }
  };

  useEffect(() => {
    loadData();
    // Only poll if NOT in settings view
    if (view !== 'settings') {
      const interval = setInterval(loadData, 2000); // Poll every 2s
      return () => clearInterval(interval);
    }
  }, [view]);

  const handleDraft = async (player) => {
    let targetTeamId, targetRound, targetPickNumber;
    
    if (manualPickTarget) {
      targetTeamId = manualPickTarget.teamId;
      targetRound = manualPickTarget.round;
      targetPickNumber = manualPickTarget.pickNumber;
    } else {
      const currentTeam = data.teams[data.currentPick.teamIndex];
      if (!currentTeam) return;
      targetTeamId = currentTeam.id;
    }

    try {
      const res = await draftPlayer(player.id, targetTeamId, targetRound, targetPickNumber);
      if (res.error) {
        alert(res.error);
      } else {
        soundService.playPick();
        if (!manualPickTarget) {
          setLastPickTime(Date.now());
          setIsPaused(false); // Auto-start next pick timer
        }
        setManualPickTarget(null); // Clear manual selection
        loadData();
      }
    } catch (err) {
      console.error("Draft failed", err);
    }
  };

  const handleUndraft = async (playerId) => {
    if (!confirm("Remove this player and move the draft back?")) return;
    try {
      await undraftPlayer(playerId);
      setLastPickTime(Date.now());
      setIsPaused(true); // Pause after correction
      loadData();
    } catch (err) {
      console.error("Undraft failed", err);
    }
  };

  const handleUpload = async (file) => {
    try {
        await uploadPlayers(file);
        loadData();
        alert('Players uploaded!');
    } catch (err) {
        console.error(err);
        alert('Upload failed');
    }
  };

  // Filter out drafted players
  const availablePlayers = data.players.filter(
    p => !data.picks.some(pick => pick.playerId === p.id)
  );

  const isDraftComplete = data.picks.length >= (data.teams.length * data.settings.totalRounds) && data.teams.length > 0;
  const currentTeam = data.teams[data.currentPick.teamIndex];

  const handleDownloadResults = () => {
    const headers = ['Round', 'Pick', 'Team', 'Owner', 'Player', 'Position', 'NFL Team'];
    const rows = data.picks.map(pick => {
      const team = data.teams.find(t => t.id === pick.teamId);
      const player = data.players.find(p => p.id === pick.playerId);
      return [
        pick.round,
        pick.pickNumber,
        `"${team?.name || 'Unknown'}"`,
        `"${team?.owner || 'Unknown'}"`,
        `"${player?.name || 'Unknown'}"`,
        player?.position || 'Unknown',
        player?.team || 'Unknown'
      ];
    });

    rows.sort((a, b) => a[1] - b[1]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    const fileName = (data.settings.draftTitle || 'Draft').replace(/[^a-z0-9]/gi, '_');
    link.setAttribute('download', `${fileName}_Results.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="h-screen bg-gray-100 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-slate-800 text-white p-4 flex flex-col md:flex-row justify-between items-center shadow-lg gap-4 sticky top-0 z-50">
        <h1 className="text-2xl font-bold tracking-wider text-center md:text-left">{data.settings.draftTitle || "FANTASY DRAFT '26"}</h1>
        
        {data.teams.length > 0 && (
            <div className="flex flex-wrap justify-center items-center gap-4 md:gap-8">
                {isDraftComplete ? (
                    <div className="flex items-center gap-6">
                        <div className="text-center animate-bounce">
                            <div className="text-xl md:text-3xl font-black text-green-400 uppercase tracking-widest drop-shadow-[0_0_8px_rgba(74,222,128,0.8)]">
                                Draft Complete!
                            </div>
                        </div>
                        <button 
                            onClick={handleDownloadResults}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-black uppercase tracking-widest text-xs shadow-lg transition-all active:scale-95 border-b-4 border-green-800 flex items-center gap-2"
                        >
                            <span>📥</span> Download Results
                        </button>
                    </div>
                ) : currentTeam && (
                    <>
                        <div className="text-center">
                            <div className="text-xs md:text-sm text-gray-400">ON THE CLOCK</div>
                            <div className="text-lg md:text-2xl font-bold text-yellow-400">{currentTeam.name}</div>
                        </div>
                        <div className="bg-slate-700 px-4 md:px-6 py-2 rounded-lg border border-slate-600">
                            <Timer 
                                initialTime={data.settings.timePerPick} 
                                onTimeUp={() => console.log('Time Up!')} 
                                resetTrigger={lastPickTime}
                                isPaused={isPaused}
                                onTogglePause={() => setIsPaused(!isPaused)}
                                onReset={() => {
                                  setLastPickTime(Date.now());
                                  setIsPaused(true);
                                }}
                            />
                        </div>
                        <div className="flex gap-4 md:gap-6">
                            <div className="text-center border-r border-slate-700 pr-4 md:pr-6">
                                <div className="text-xs md:text-sm text-gray-400 font-bold uppercase tracking-tighter">Round</div>
                                <div className="text-lg md:text-2xl font-black">{data.currentPick.round}</div>
                            </div>
                            <div className="text-center">
                                <div className="text-xs md:text-sm text-gray-400 font-bold uppercase tracking-tighter">Pick</div>
                                <div className="text-lg md:text-2xl font-black">{data.currentPick.pickNumber}</div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        )}

        <div className="flex gap-2 w-full md:w-auto justify-center">
            <button 
                onClick={() => setView('board')} 
                className={`flex-1 md:flex-none px-4 py-2 rounded ${view === 'board' ? 'bg-blue-600' : 'bg-slate-700 hover:bg-slate-600'}`}
            >
                Draft Board
            </button>
            <button 
                onClick={() => setView('rosters')} 
                className={`flex-1 md:flex-none px-4 py-2 rounded ${view === 'rosters' ? 'bg-blue-600' : 'bg-slate-700 hover:bg-slate-600'}`}
            >
                Rosters
            </button>
            <button 
                onClick={() => setView('settings')} 
                className={`flex-1 md:flex-none px-4 py-2 rounded ${view === 'settings' ? 'bg-blue-600' : 'bg-slate-700 hover:bg-slate-600'}`}
            >
                Settings
            </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-2 md:p-4 overflow-hidden flex flex-col min-h-0">
        {view === 'settings' ? (
            <TeamSettings 
                teams={data.teams}
                settings={data.settings}
                picks={data.picks}
                onUpdateSettings={async (s) => { 
                  await updateSettings(s); 
                  const state = await fetchState(); // Get fresh state
                  setData(state);
                  setLastPickTime(Date.now()); // FORCE RE-RENDER OF TIMER
                  setIsPaused(true); 
                  alert('Settings updated successfully!');
                }}
                onAddTeam={async (team) => { await addTeam(team); loadData(); }}
                onUpdateTeam={async (id, team) => { await updateTeam(id, team); loadData(); }}
                onDeleteTeam={async (id) => { await deleteTeam(id); loadData(); }}
                onBulkAddTeams={async (count) => { 
                  await bulkAddTeams(count); 
                  setLastPickTime(Date.now());
                  setIsPaused(true);
                  loadData(); 
                }}
                onClearAllTeams={async () => { 
                  await clearAllTeams(); 
                  setLastPickTime(Date.now());
                  setIsPaused(true);
                  loadData(); 
                }}
                onShuffleTeams={async () => { await shuffleTeams(); loadData(); }}
                onReorderTeams={async (teamIds) => { await reorderTeams(teamIds); loadData(); }}
                onUpload={handleUpload}
                onClearPicks={async () => { 
                  await clearPicks(); 
                  setLastPickTime(Date.now());
                  setIsPaused(true);
                  loadData(); 
                }}
                onReset={async () => { 
                  await resetDraft(); 
                  setLastPickTime(Date.now());
                  setIsPaused(true);
                  loadData(); 
                }}
            />
        ) : view === 'rosters' ? (
            <div className="h-full w-full">
                <TeamRoster 
                    teams={data.teams}
                    picks={data.picks}
                    players={data.players}
                    rosterPositions={data.settings.rosterPositions || { QB: 1, RB: 2, WR: 2, TE: 1, FLEX: 1, K: 1, DEF: 1, BENCH: 6 }}
                />
            </div>
        ) : (
            <div className="flex flex-col lg:flex-row gap-4 h-full min-h-0">
                <div className="flex-1 overflow-auto bg-white shadow rounded-lg">
                    <DraftBoard 
                        teams={data.teams} 
                        picks={data.picks} 
                        players={data.players}
                        totalRounds={data.settings.totalRounds}
                        settings={data.settings}
                        currentPick={data.currentPick}
                        onUndraft={handleUndraft}
                        manualPickTarget={manualPickTarget}
                        onSelectTarget={setManualPickTarget}
                    />
                </div>
                <div className="w-full lg:w-96 flex-1 lg:flex-none flex flex-col min-h-0 bg-white shadow rounded-lg">
                    <PlayerList 
                        players={availablePlayers}
                        picks={data.picks}
                        onDraft={handleDraft}
                        currentTeam={manualPickTarget ? data.teams.find(t => t.id === manualPickTarget.teamId) : currentTeam}
                        isManual={!!manualPickTarget}
                        manualPickTarget={manualPickTarget}
                        isDraftComplete={isDraftComplete}
                    />
                </div>
            </div>
        )}
      </main>
    </div>
  );
}

export default App;
