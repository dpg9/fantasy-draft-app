import React, { useState, useEffect } from 'react';
import { soundService } from '../SoundService';

const Timer = ({ initialTime, onTimeUp, resetTrigger }) => {
    const [timeLeft, setTimeLeft] = useState(initialTime);
    const [isActive, setIsActive] = useState(false);

    useEffect(() => {
        setTimeLeft(initialTime);
        setIsActive(true);
    }, [resetTrigger, initialTime]);

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

    return (
        <div className={`text-4xl font-bold font-mono ${timeLeft < 10 ? 'text-red-500 animate-pulse' : 'text-gray-800'}`}>
            {formatTime(timeLeft)}
        </div>
    );
};

export default Timer;
