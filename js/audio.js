// Procedural 8-bit Audio & Chiptune BGM Synthesizer
class SoundSystem {
    constructor() {
        this.ctx = null;
        this.muted = false;
        this.bgmMuted = false;
        this.masterVolume = 0.28;
        this.initialized = false;
        this.bgmTimer = null;
        this.bgmPlaying = false;
        this.bgmStep = 0;
    }

    init() {
        if (this.initialized) return;
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                this.ctx = new AudioContext();
                this.initialized = true;
                this.startBGM();
            }
        } catch (e) {
            console.warn("Web Audio API not supported", e);
        }
    }

    resume() {
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    toggleMute() {
        this.muted = !this.muted;
        return this.muted;
    }

    toggleBGM() {
        this.bgmMuted = !this.bgmMuted;
        if (this.bgmMuted) {
            this.stopBGM();
        } else {
            this.startBGM();
        }
        return !this.bgmMuted;
    }

    // Procedural Chiptune BGM Loop
    startBGM() {
        if (this.bgmPlaying || this.bgmMuted || !this.ctx) return;
        this.bgmPlaying = true;
        this.bgmStep = 0;

        // Cyberpunk bassline notes (Hz)
        const bassProgression = [
            110, 110, 130.81, 110,   146.83, 110, 130.81, 98,   // A2, C3, D3, G2
            110, 110, 164.81, 146.83, 130.81, 110, 123.47, 98   // A2, E3, D3, C3, B2, G2
        ];

        // Lead synth melody notes
        const melodyProgression = [
            220, 0, 329.63, 0,   440, 392, 329.63, 0,
            261.63, 0, 293.66, 0, 329.63, 293.66, 261.63, 246.94
        ];

        const stepDuration = 0.14; // ~107 BPM 16th notes

        const scheduleStep = () => {
            if (!this.bgmPlaying || this.bgmMuted || !this.ctx) return;
            this.resume();

            const now = this.ctx.currentTime;
            const bassNote = bassProgression[this.bgmStep % bassProgression.length];
            const leadNote = melodyProgression[this.bgmStep % melodyProgression.length];

            // 1. Play Bass
            if (bassNote > 0 && !this.muted) {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(bassNote, now);
                gain.gain.setValueAtTime(this.masterVolume * 0.22, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + stepDuration * 0.9);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(now);
                osc.stop(now + stepDuration * 0.9);
            }

            // 2. Play Arpeggiated Melody
            if (leadNote > 0 && !this.muted) {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'square';
                osc.frequency.setValueAtTime(leadNote, now);
                gain.gain.setValueAtTime(this.masterVolume * 0.08, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + stepDuration * 0.7);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(now);
                osc.stop(now + stepDuration * 0.7);
            }

            // 3. Hi-hat noise on alternating steps
            if (this.bgmStep % 2 === 1 && !this.muted) {
                this.playHiHat(now, stepDuration * 0.3);
            }

            this.bgmStep++;
            this.bgmTimer = setTimeout(scheduleStep, stepDuration * 1000);
        };

        scheduleStep();
    }

    stopBGM() {
        this.bgmPlaying = false;
        if (this.bgmTimer) {
            clearTimeout(this.bgmTimer);
            this.bgmTimer = null;
        }
    }

    playHiHat(time, dur) {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(3500 + Math.random() * 500, time);
        gain.gain.setValueAtTime(this.masterVolume * 0.03, time);
        gain.gain.exponentialRampToValueAtTime(0.0001, time + dur);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(time);
        osc.stop(time + dur);
    }

    playSlash() {
        if (this.muted || !this.ctx) return;
        this.resume();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(650, now);
        osc.frequency.exponentialRampToValueAtTime(90, now + 0.12);

        gain.gain.setValueAtTime(this.masterVolume * 0.55, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.12);
    }

    playDash() {
        if (this.muted || !this.ctx) return;
        this.resume();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(250, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.07);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.15);

        gain.gain.setValueAtTime(this.masterVolume * 0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.15);
    }

    playShoot() {
        if (this.muted || !this.ctx) return;
        this.resume();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(220, now + 0.09);

        gain.gain.setValueAtTime(this.masterVolume * 0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.09);
    }

    playBossRoar() {
        if (this.muted || !this.ctx) return;
        this.resume();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(90, now);
        osc.frequency.linearRampToValueAtTime(160, now + 0.2);
        osc.frequency.exponentialRampToValueAtTime(45, now + 0.5);

        gain.gain.setValueAtTime(this.masterVolume * 0.7, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.5);
    }

    playBossHit() {
        if (this.muted || !this.ctx) return;
        this.resume();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.18);

        gain.gain.setValueAtTime(this.masterVolume * 0.6, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.18);
    }

    playJump() {
        if (this.muted || !this.ctx) return;
        this.resume();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(160, now);
        osc.frequency.exponentialRampToValueAtTime(480, now + 0.11);

        gain.gain.setValueAtTime(this.masterVolume * 0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.11);
    }

    playDoubleJump() {
        if (this.muted || !this.ctx) return;
        this.resume();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(340, now);
        osc.frequency.exponentialRampToValueAtTime(720, now + 0.13);

        gain.gain.setValueAtTime(this.masterVolume * 0.45, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.13);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.13);
    }

    playCoin() {
        if (this.muted || !this.ctx) return;
        this.resume();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(987.77, now);
        osc.frequency.setValueAtTime(1318.51, now + 0.07);

        gain.gain.setValueAtTime(this.masterVolume * 0.35, now);
        gain.gain.setValueAtTime(this.masterVolume * 0.35, now + 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.25);
    }

    playGem() {
        if (this.muted || !this.ctx) return;
        this.resume();
        const now = this.ctx.currentTime;
        const notes = [1046.50, 1318.51, 1567.98, 2093.00];
        
        notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const noteStart = now + idx * 0.045;

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, noteStart);

            gain.gain.setValueAtTime(this.masterVolume * 0.3, noteStart);
            gain.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.16);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(noteStart);
            osc.stop(noteStart + 0.16);
        });
    }

    playSpring() {
        if (this.muted || !this.ctx) return;
        this.resume();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(120, now);
        osc.frequency.exponentialRampToValueAtTime(580, now + 0.2);

        gain.gain.setValueAtTime(this.masterVolume * 0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.2);
    }

    playStomp() {
        if (this.muted || !this.ctx) return;
        this.resume();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(70, now + 0.14);

        gain.gain.setValueAtTime(this.masterVolume * 0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.14);
    }

    playHurt() {
        if (this.muted || !this.ctx) return;
        this.resume();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(240, now);
        osc.frequency.exponentialRampToValueAtTime(50, now + 0.17);

        gain.gain.setValueAtTime(this.masterVolume * 0.55, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.17);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.17);
    }

    playDeath() {
        if (this.muted || !this.ctx) return;
        this.resume();
        const now = this.ctx.currentTime;
        const notes = [320, 270, 210, 160, 110];
        
        notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const startTime = now + idx * 0.09;

            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(freq, startTime);

            gain.gain.setValueAtTime(this.masterVolume * 0.45, startTime);
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.11);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(startTime);
            osc.stop(startTime + 0.11);
        });
    }

    playVictory() {
        if (this.muted || !this.ctx) return;
        this.resume();
        const now = this.ctx.currentTime;
        const fanfare = [523.25, 659.25, 783.99, 1046.50];
        const durations = [0.12, 0.12, 0.12, 0.38];
        let offset = 0;

        fanfare.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const start = now + offset;
            const dur = durations[idx];
            offset += dur + 0.02;

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, start);

            gain.gain.setValueAtTime(this.masterVolume * 0.5, start);
            gain.gain.exponentialRampToValueAtTime(0.001, start + dur);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(start);
            osc.stop(start + dur);
        });
    }

    playClick() {
        if (this.muted || !this.ctx) return;
        this.resume();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);

        gain.gain.setValueAtTime(this.masterVolume * 0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.04);
    }
}

const Sound = new SoundSystem();
if (typeof window !== "undefined") window.Sound = Sound;
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SoundSystem;
}
