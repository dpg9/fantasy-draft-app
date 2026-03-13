class SoundService {
    constructor() {
        this.ctx = null;
    }

    init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
    }

    playOscillator(frequency, type, duration, volume = 0.1) {
        this.init();
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(frequency, this.ctx.currentTime);

        gain.gain.setValueAtTime(volume, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    }

    playPick() {
        // High chime
        this.playOscillator(880, 'sine', 0.5, 0.1);
        setTimeout(() => this.playOscillator(1320, 'sine', 0.4, 0.05), 100);
    }

    playWarning() {
        // Short beep
        this.playOscillator(440, 'square', 0.1, 0.05);
    }

    playBuzzer() {
        // Low buzzer
        this.playOscillator(100, 'sawtooth', 1, 0.1);
        this.playOscillator(110, 'sawtooth', 1, 0.1);
    }
}

export const soundService = new SoundService();
