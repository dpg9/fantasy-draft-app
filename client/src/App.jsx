import React, { useState, useEffect } from 'react';
import { fetchState, draftPlayer, addTeam, deleteTeam, uploadPlayers, resetDraft } from './api';
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
    const interval = setInterval(loadData, 2000); // Poll every 2s
    return () => clearInterval(interval);
  }, []);

  const handleDraft = async (player) => {
    // Optimistic UI update or just wait for fetch
    const currentTeam = data.teams[data.currentPick.teamIndex];
    if (!currentTeam) return;

    try {
      const res = await draftPlayer(player.id, currentTeam.id);
      if (res.error) {
        alert(res.error);
      } else {
        soundService.playPick();
        setLastPickTime(Date.now());
        loadData();
      }
    } catch (err) {
      console.error("Draft failed", err);
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
                    />
                </div>
                <div className="w-96 flex-shrink-0">
                    <PlayerList 
                        players={availablePlayers}
                        onDraft={handleDraft}
                        currentTeam={currentTeam}
                    />
                </div>
            </div>
        )}
      </main>
    </div>
  );
}

export default App;
