import React, { useState, useEffect, useRef } from 'react';
import { soundService } from '../SoundService';

const Timer = ({ initialTime, onTimeUp, resetTrigger, isPaused, onTogglePause, onReset }) => {
    const [timeLeft, setTimeLeft] = useState(initialTime);
    const [isActive, setIsActive] = useState(!isPaused);
    const timerRef = useRef(null);

    // Sync timeLeft when initialTime changes or a reset is triggered
    useEffect(() => {
        console.log(`Timer Sync: initialTime=${initialTime}, isPaused=${isPaused}`);
        setTimeLeft(initialTime);
        setIsActive(!isPaused);
    }, [resetTrigger, initialTime, isPaused]);

    useEffect(() => {
        if (isActive && timeLeft > 0) {
            timerRef.current = setInterval(() => {
                setTimeLeft((prev) => {
                    const next = prev - 1;
                    if (next < 10 && next >= 0) {
                        soundService.playWarning();
                    }
                    if (next <= 0) {
                        clearInterval(timerRef.current);
                        setIsActive(false);
                        soundService.playBuzzer();
                        if (onTimeUp) onTimeUp();
                        return 0;
                    }
                    return next;
                });
            }, 1000);
        } else {
            clearInterval(timerRef.current);
        }
        return () => clearInterval(timerRef.current);
    }, [isActive, onTimeUp]); // Only depend on isActive to avoid double intervals

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
            <div className={`text-4xl font-bold font-mono ${timeLeft < 10 && timeLeft > 0 ? 'text-red-500 animate-pulse' : 'text-gray-800'}`}>
                {formatTime(timeLeft)}
            </div>
            <div className="flex gap-2">
                <button 
                    onClick={onTogglePause}
                    className={`${isPaused ? 'bg-green-600 hover:bg-green-700' : 'bg-yellow-600 hover:bg-yellow-700'} text-white text-xs px-3 py-1 rounded uppercase font-black transition-colors`}
                >
                    {isPaused ? 'Start' : 'Stop'}
                </button>
                <button 
                    onClick={handleReset}
                    className="bg-gray-500 hover:bg-gray-600 text-white text-xs px-3 py-1 rounded uppercase font-black transition-colors"
                >
                    Reset
                </button>
            </div>
        </div>
    );
};

export default Timer;
