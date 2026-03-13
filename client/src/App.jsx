import React, { useState, useEffect } from 'react';
import { fetchState, draftPlayer, undraftPlayer, addTeam, deleteTeam, uploadPlayers, resetDraft, updateSettings } from './api';
import DraftBoard from './components/DraftBoard';
import PlayerList from './components/PlayerList';
import TeamSettings from './components/TeamSettings';
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
      targetPickNumber = (manualPickTarget.round - 1) * data.teams.length + manualPickTarget.teamIndex + 1;
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

  const currentTeam = data.teams[data.currentPick.teamIndex];

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-slate-800 text-white p-4 flex justify-between items-center shadow-lg">
        <h1 className="text-2xl font-bold tracking-wider">FANTASY DRAFT '26</h1>
        
        {data.teams.length > 0 && currentTeam && (
            <div className="flex items-center gap-8">
                <div className="text-center">
                    <div className="text-sm text-gray-400">ON THE CLOCK</div>
                    <div className="text-2xl font-bold text-yellow-400">{currentTeam.name}</div>
                </div>
                <div className="bg-slate-700 px-6 py-2 rounded-lg border border-slate-600">
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
                <div className="text-center">
                    <div className="text-sm text-gray-400">ROUND</div>
                    <div className="text-2xl font-bold">{data.currentPick.round}</div>
                </div>
            </div>
        )}

        <div className="flex gap-2">
            <button 
                onClick={() => setView('board')} 
                className={`px-4 py-2 rounded ${view === 'board' ? 'bg-blue-600' : 'bg-slate-700 hover:bg-slate-600'}`}
            >
                Draft Board
            </button>
            <button 
                onClick={() => setView('settings')} 
                className={`px-4 py-2 rounded ${view === 'settings' ? 'bg-blue-600' : 'bg-slate-700 hover:bg-slate-600'}`}
            >
                Settings
            </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow p-4 overflow-hidden flex flex-col">
        {view === 'settings' ? (
            <TeamSettings 
                teams={data.teams}
                settings={data.settings}
                onUpdateSettings={async (s) => { 
                  await updateSettings(s); 
                  const state = await fetchState(); // Get fresh state
                  setData(state);
                  setLastPickTime(Date.now()); // FORCE RE-RENDER OF TIMER
                  setIsPaused(true); 
                  alert('Settings updated successfully!');
                }}
                onAddTeam={async (team) => { await addTeam(team); loadData(); }}
                onDeleteTeam={async (id) => { await deleteTeam(id); loadData(); }}
                onUpload={handleUpload}
                onReset={async () => { await resetDraft(); loadData(); }}
            />
        ) : (
            <div className="flex gap-4 h-full">
                <div className="flex-grow overflow-auto">
                    <DraftBoard 
                        teams={data.teams} 
                        picks={data.picks} 
                        players={data.players}
                        totalRounds={data.settings.totalRounds}
                        currentPick={data.currentPick}
                        onUndraft={handleUndraft}
                        manualPickTarget={manualPickTarget}
                        onSelectTarget={setManualPickTarget}
                    />
                </div>
                <div className="w-96 flex-shrink-0">
                    <PlayerList 
                        players={availablePlayers}
                        onDraft={handleDraft}
                        currentTeam={manualPickTarget ? data.teams.find(t => t.id === manualPickTarget.teamId) : currentTeam}
                        isManual={!!manualPickTarget}
                    />
                </div>
            </div>
        )}
      </main>
    </div>
  );
}

export default App;
