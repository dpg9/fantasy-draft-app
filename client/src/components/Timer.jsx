import React, { useState, useEffect } from 'react';
import { soundService } from '../SoundService';

const Timer = ({ initialTime, onTimeUp, resetTrigger, isPaused, onTogglePause, onReset }) => {
    const [timeLeft, setTimeLeft] = useState(initialTime);
    const [isActive, setIsActive] = useState(false);

    useEffect(() => {
        setTimeLeft(initialTime);
        setIsActive(!isPaused);
    }, [resetTrigger, initialTime]);

    useEffect(() => {
        setIsActive(!isPaused);
    }, [isPaused]);

    useEffect(() => {
        let interval = null;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                const newTime = timeLeft - 1;
                setTimeLeft(newTime);
                
                // Play warning sound every second under 10 seconds
                if (newTime < 10 && newTime >= 0) {
                    soundService.playWarning();
                }
            }, 1000);
        } else if (timeLeft === 0 && isActive) {
            setIsActive(false);
            soundService.playBuzzer();
            if (onTimeUp) onTimeUp();
        }
        return () => clearInterval(interval);
    }, [isActive, timeLeft, onTimeUp]);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const handleReset = () => {
        setTimeLeft(initialTime);
        if (onReset) onReset();
    };

    return (
        <div className="flex flex-col items-center gap-2">
            <div className={`text-4xl font-bold font-mono ${timeLeft < 10 ? 'text-red-500 animate-pulse' : 'text-gray-800'}`}>
                {formatTime(timeLeft)}
            </div>
            <div className="flex gap-2">
                <button 
                    onClick={onTogglePause}
                    className="bg-gray-600 hover:bg-gray-700 text-white text-xs px-2 py-1 rounded uppercase font-bold"
                >
                    {isPaused ? 'Start' : 'Stop'}
                </button>
                <button 
                    onClick={handleReset}
                    className="bg-gray-400 hover:bg-gray-500 text-white text-xs px-2 py-1 rounded uppercase font-bold"
                >
                    Reset
                </button>
            </div>
        </div>
    );
};

export default Timer;
