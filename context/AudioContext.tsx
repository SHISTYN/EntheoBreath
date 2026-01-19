
import React, { createContext, useContext, useRef, useState, useEffect, ReactNode } from 'react';
import * as Tone from 'tone';
import { BinauralGenerator } from '../utils/binaural';

export type PlaybackMode = 'always' | 'practice_only';
export type SolfeggioFreq = 396 | 417 | 432 | 528 | 639 | 741 | 852 | 0;
export type NoiseColor = 'brown' | 'pink' | 'white';

interface AudioContextType {
    isReady: boolean;
    initializeAudio: () => Promise<void>;

    // Master Control
    masterVolume: number;
    setMasterVolume: (val: number) => void;
    playbackMode: PlaybackMode;
    setPlaybackMode: (mode: PlaybackMode) => void;
    isTimerActive: boolean;
    setTimerActive: (active: boolean) => void;

    // Layers
    activeBinaural: 'none' | 'theta' | 'alpha';
    toggleBinaural: (type: 'theta' | 'alpha') => void;

    activeSolfeggio: SolfeggioFreq;
    setSolfeggio: (freq: SolfeggioFreq) => void;

    // Crystal Bowls Session (Generative)
    activeCrystalMode: boolean;
    toggleCrystalMode: () => void;

    // Wind (Generative)
    activeAmbience: boolean;
    toggleAmbience: () => void;
    windIntensity: number; // 0.0 to 1.0
    setWindIntensity: (val: number) => void;

    // Static Noise
    activeNoise: boolean;
    toggleNoise: () => void;
    noiseColor: NoiseColor;
    setNoiseColor: (color: NoiseColor) => void;

    // Breathing Engine (Core)
    playPhaseSound: (phase: any) => void;
    playCountdownTick: (number: number) => void;
    playSoundEffect: (mode: any) => void;
    soundMode: 'mute' | 'bell' | 'hang' | 'bowl' | 'rain' | 'om' | 'gong' | 'harp' | 'flute';
    setSoundMode: (mode: any) => void;
}

const AudioContext = createContext<AudioContextType | null>(null);

export const useAudioEngine = () => {
    const context = useContext(AudioContext);
    if (!context) {
        throw new Error('useAudioEngine must be used within an AudioProvider');
    }
    return context;
};

// --- CRYSTAL BOWL CLASS (HYBRID ENGINE) ---
class CrystalBowl {
    // 1. Rubbing Engine (Continuous Singing)
    private rubOsc: Tone.FMOscillator;
    private rubTremolo: Tone.Tremolo;
    private rubGain: Tone.Gain;

    // 2. Striking Engine (Percussive Ding)
    private strikeSynth: Tone.Synth;

    // 3. Common FX
    private panner: Tone.Panner;
    private filter: Tone.Filter;

    public readonly frequency: number;
    public isRubbing: boolean = false;

    constructor(freq: number, destination: Tone.ToneAudioNode) {
        this.frequency = freq;

        // --- SPATIAL & COLOR ---
        // Random pan for immersive stereo field
        this.panner = new Tone.Panner(Math.random() * 1.6 - 0.8).connect(destination);
        // Lowpass filter to keep it "Crystal" warm, removing digital harshness
        this.filter = new Tone.Filter(3500, "lowpass", -12).connect(this.panner);

        // --- RUBBING ENGINE ---
        // FM Synthesis simulates the complex interference of a singing bowl
        // Harmonicity 1.002 creates the characteristic slow "wow-wow" beating
        this.rubOsc = new Tone.FMOscillator({
            frequency: freq,
            type: "sine",
            modulationType: "sine",
            harmonicity: 1.002,
            modulationIndex: 0.5
        });

        // Tremolo simulates the hand moving around the rim (Amplitude Modulation)
        this.rubTremolo = new Tone.Tremolo({
            frequency: 0.8 + Math.random(), // Unique rotation speed per bowl
            depth: 0.4, // Subtle volume wobble
            spread: 0
        }).start();

        this.rubGain = new Tone.Gain(0); // Start silent

        // Chain: Osc -> Tremolo -> Gain -> Filter
        this.rubOsc.connect(this.rubTremolo);
        this.rubTremolo.connect(this.rubGain);
        this.rubGain.connect(this.filter);

        this.rubOsc.start();

        // --- STRIKING ENGINE ---
        // Separate synth for the "Ding" sound (Soft Mallet impact)
        this.strikeSynth = new Tone.Synth({
            oscillator: { type: "sine" }, // Pure tone for crystal
            envelope: {
                attack: 0.05, // Soft hit
                decay: 4.0,   // Long ring
                sustain: 0,
                release: 4.0
            },
            volume: -4 // Slightly quieter than full rub
        }).connect(this.filter);
    }

    // Start "Singing" (Rim rubbing)
    startRub(fadeInTime: number = 4) {
        if (this.isRubbing) return;
        this.isRubbing = true;

        // Randomize dynamics slightly for organic feel
        this.rubOsc.modulationIndex.rampTo(0.5 + Math.random() * 0.5, 6);
        this.rubTremolo.frequency.rampTo(0.5 + Math.random() * 1.5, 10);

        this.rubGain.gain.rampTo(0.2 + Math.random() * 0.1, fadeInTime); // Fade in
    }

    // Stop "Singing"
    stopRub(fadeOutTime: number = 5) {
        if (!this.isRubbing) return;
        this.isRubbing = false;
        this.rubGain.gain.rampTo(0, fadeOutTime);
    }

    // "Ding" (Soft Strike)
    strike(velocity: number = 1) {
        // Slight detune randomization for realism on impact
        this.strikeSynth.triggerAttackRelease(this.frequency, 8, undefined, velocity);
    }

    // Clean up
    dispose() {
        this.rubOsc.dispose();
        this.rubTremolo.dispose();
        this.rubGain.dispose();
        this.strikeSynth.dispose();
        this.panner.dispose();
        this.filter.dispose();
    }
}

export const AudioProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isReady, setIsReady] = useState(false);
    const [masterVolume, setMasterVal] = useState(0.8);
    const [playbackMode, setPlaybackMode] = useState<PlaybackMode>('always');
    const [isTimerActive, setTimerActive] = useState(false);
    const [soundMode, setSoundMode] = useState<any>('bell');

    // --- LAYERS STATE ---
    const [activeBinaural, setActiveBinaural] = useState<'none' | 'theta' | 'alpha'>('none');
    const [activeSolfeggio, setActiveSolfeggio] = useState<SolfeggioFreq>(0);
    const [activeCrystalMode, setActiveCrystalMode] = useState(false);

    // Wind
    const [activeAmbience, setActiveAmbience] = useState(false);
    const [windIntensity, setWindIntensity] = useState(0.5);

    // Noise
    const [activeNoise, setActiveNoise] = useState(false);
    const [noiseColor, setNoiseColor] = useState<NoiseColor>('pink');

    // --- REFS (Audio Nodes) ---
    const binauralRef = useRef<BinauralGenerator | null>(null);
    const solfeggioOscRef = useRef<Tone.Oscillator | null>(null);
    const solfeggioGainRef = useRef<Tone.Gain | null>(null);

    // Crystal Session Engine
    const crystalSessionRef = useRef<{
        bowls: CrystalBowl[];
        reverb: Tone.Reverb;
        masterGain: Tone.Gain;
        conductorLoop: number;
    } | null>(null);

    // Wind Nodes
    const windNodesRef = useRef<{ noise: Tone.Noise; filter: Tone.AutoFilter; gain: Tone.Gain } | null>(null);

    // Noise Nodes
    const staticNoiseRef = useRef<{ source: Tone.Noise; filter: Tone.Filter; gain: Tone.Gain } | null>(null);

    // --- BREATHING SYNTH REFS ---
    const inhaleSynthRef = useRef<Tone.PolySynth | null>(null);
    const exhaleSynthRef = useRef<Tone.PolySynth | null>(null);
    const holdInSynthRef = useRef<Tone.MetalSynth | null>(null);
    const holdOutSynthRef = useRef<Tone.Synth | null>(null);
    const doneSynthRef = useRef<Tone.PolySynth | null>(null);
    const tickSynthRef = useRef<Tone.FMSynth | null>(null);

    const masterGainRef = useRef<Tone.Gain | null>(null);

    // --- INITIALIZATION ---
    const initializeAudio = async () => {
        if (isReady) return;
        await Tone.start();

        // Compressor helps glue the layers together and prevents clipping
        const limiter = new Tone.Limiter(-1).toDestination();
        const master = new Tone.Gain(1).connect(limiter);
        masterGainRef.current = master;

        binauralRef.current = new BinauralGenerator(master);

        // --- INIT BREATHING SYNTHS ---
        // 1. Inhale
        inhaleSynthRef.current = new Tone.PolySynth(Tone.FMSynth, {
            harmonicity: 3, modulationIndex: 3.5, oscillator: { type: "sine" },
            envelope: { attack: 0.2, decay: 0.1, sustain: 0.3, release: 2 },
            modulation: { type: "sine" }, modulationEnvelope: { attack: 0.5, decay: 0, sustain: 1, release: 0.5 }
        }).connect(master);

        // 2. Exhale
        exhaleSynthRef.current = new Tone.PolySynth(Tone.AMSynth, {
            harmonicity: 2, oscillator: { type: "sine" },
            envelope: { attack: 0.1, decay: 2, sustain: 0.1, release: 3 },
            modulation: { type: "sine" }, modulationEnvelope: { attack: 0.5, decay: 0, sustain: 1, release: 0.5 }
        }).connect(master);

        // 3. Hold In
        holdInSynthRef.current = new Tone.MetalSynth({
            envelope: { attack: 0.005, decay: 1.4, release: 0.2 },
            harmonicity: 5.1, modulationIndex: 32, resonance: 4000, octaves: 1.5
        }).connect(master);
        holdInSynthRef.current.frequency.value = 200;
        holdInSynthRef.current.volume.value = -12;

        // 4. Hold Out
        holdOutSynthRef.current = new Tone.Synth({
            oscillator: { type: "sine" },
            envelope: { attack: 0.5, decay: 0.5, sustain: 0, release: 1 }
        }).connect(master);
        holdOutSynthRef.current.volume.value = -5;

        // 5. Done
        doneSynthRef.current = new Tone.PolySynth(Tone.Synth).connect(master);

        // 6. Tick
        tickSynthRef.current = new Tone.FMSynth({
            harmonicity: 1.5, modulationIndex: 3, oscillator: { type: "sine" },
            modulation: { type: "sine" },
            envelope: { attack: 0.005, decay: 0.15, sustain: 0, release: 1 },
            modulationEnvelope: { attack: 0.001, decay: 0.1, sustain: 0, release: 0.1 }
        }).connect(master);
        tickSynthRef.current.volume.value = -4;

        setIsReady(true);
        console.log('🔊 Tone.js Engine Started (Full Suite)');
    };

    // --- GLOBAL FADE LOGIC ---
    useEffect(() => {
        if (!masterGainRef.current) return;
        let targetVol = 0;
        if (playbackMode === 'always') {
            targetVol = Tone.gainToDb(masterVolume);
        } else {
            targetVol = isTimerActive ? Tone.gainToDb(masterVolume) : -60;
        }
        masterGainRef.current.gain.rampTo(Tone.dbToGain(targetVol), 2);
    }, [playbackMode, isTimerActive, masterVolume, isReady]);


    // --- BINAURAL HANDLER ---
    const toggleBinauralHandler = async (type: 'theta' | 'alpha') => {
        await initializeAudio();
        if (!binauralRef.current) return;

        if (activeBinaural === type) {
            binauralRef.current.stop();
            setActiveBinaural('none');
        } else {
            if (type === 'theta') binauralRef.current.play(100, 4.5, -15);
            if (type === 'alpha') binauralRef.current.play(200, 10, -18);
            setActiveBinaural(type);
        }
    };

    // --- SOLFEGGIO HANDLER ---
    const setSolfeggioHandler = async (freq: SolfeggioFreq) => {
        await initializeAudio();
        if (activeCrystalMode && freq !== 0) {
            toggleCrystalModeHandler();
        }

        if (freq === activeSolfeggio) {
            stopSolfeggio();
            setActiveSolfeggio(0);
            return;
        }
        stopSolfeggio();
        if (freq > 0) {
            const osc = new Tone.Oscillator(freq, "sine");
            const gain = new Tone.Gain(0).connect(masterGainRef.current!);
            const reverb = new Tone.Reverb({ decay: 5, wet: 0.5 }).connect(gain);
            osc.connect(reverb);
            osc.start();
            gain.gain.rampTo(0.3, 2);
            solfeggioOscRef.current = osc;
            solfeggioGainRef.current = gain;
            setActiveSolfeggio(freq);
        } else {
            setActiveSolfeggio(0);
        }
    };

    const stopSolfeggio = () => {
        if (solfeggioGainRef.current) {
            solfeggioGainRef.current.gain.rampTo(0, 1);
            const oldOsc = solfeggioOscRef.current;
            const oldGain = solfeggioGainRef.current;
            setTimeout(() => { oldOsc?.stop(); oldOsc?.dispose(); oldGain?.dispose(); }, 1000);
        }
    };

    // --- CRYSTAL BOWLS: THE ORCHESTRA (CONDUCTOR) ---
    const toggleCrystalModeHandler = async () => {
        await initializeAudio();

        // Stop single Solfeggio if active
        if (activeSolfeggio !== 0) {
            stopSolfeggio();
            setActiveSolfeggio(0);
        }

        if (activeCrystalMode) {
            // STOP SESSION
            if (crystalSessionRef.current) {
                Tone.Transport.clear(crystalSessionRef.current.conductorLoop);
                crystalSessionRef.current.masterGain.gain.rampTo(0, 4); // Slow master fade

                // Fade out active bowls
                crystalSessionRef.current.bowls.forEach(b => b.stopRub(4));

                setTimeout(() => {
                    crystalSessionRef.current?.bowls.forEach(b => b.dispose());
                    crystalSessionRef.current?.reverb.dispose();
                    crystalSessionRef.current?.masterGain.dispose();
                    crystalSessionRef.current = null;
                }, 4100);
            }
            setActiveCrystalMode(false);
        } else {
            // START SESSION
            Tone.Transport.start();

            const masterGain = new Tone.Gain(0).connect(masterGainRef.current!);

            // Deep, expansive Cathedral Reverb (20s+ decay for deep immersion)
            const reverb = new Tone.Reverb({ decay: 22, wet: 0.7, preDelay: 0.2 }).connect(masterGain);
            await reverb.generate();

            // Create the Bowl Orchestra (Solfeggio Scale)
            const FREQS = [396, 417, 528, 639, 741, 852];
            const bowls = FREQS.map(f => new CrystalBowl(f, reverb));

            // THE CONDUCTOR LOGIC
            // Every few seconds, makes a decision to change the soundscape
            const conductorLoop = Tone.Transport.scheduleRepeat((time) => {

                // 1. Maintain Singing Drones (Rubbing)
                // Ideally 2-3 bowls singing at once creates rich harmony
                const activeBowls = bowls.filter(b => b.isRubbing);

                if (activeBowls.length < 2) {
                    // Add a bowl if silence is too empty
                    const inactive = bowls.filter(b => !b.isRubbing);
                    if (inactive.length > 0) {
                        const next = inactive[Math.floor(Math.random() * inactive.length)];
                        next.startRub(Math.random() * 3 + 3); // 3-6s fade in
                    }
                } else if (activeBowls.length > 3) {
                    // Remove a bowl if too cluttered
                    const toStop = activeBowls[Math.floor(Math.random() * activeBowls.length)];
                    toStop.stopRub(Math.random() * 4 + 4); // 4-8s fade out
                } else {
                    // Changeover (Crossfade) - 30% chance to swap voices
                    if (Math.random() > 0.7) {
                        const toStop = activeBowls[0]; // Stop oldest/random
                        const inactive = bowls.filter(b => !b.isRubbing);
                        if (inactive.length > 0) {
                            const toStart = inactive[Math.floor(Math.random() * inactive.length)];
                            toStop.stopRub(6);
                            toStart.startRub(6);
                        }
                    }
                }

                // 2. Random Strikes (Accents)
                // 40% chance to gently strike a bowl (can be active or inactive)
                // This creates the "light tapping" effect requested
                if (Math.random() > 0.6) {
                    // Pick any bowl, maybe favour high ones for sparkles
                    const target = bowls[Math.floor(Math.random() * bowls.length)];
                    // Soft velocity for gentle texture
                    const velocity = 0.2 + Math.random() * 0.4;

                    // Add delay so it doesn't happen exactly on the beat
                    const delay = Math.random() * 2;
                    setTimeout(() => target.strike(velocity), delay * 1000);
                }

            }, "4m"); // Check every 4 measures (approx 8-10s)

            // Initial Start: Start root note immediately + one harmony
            bowls[0].startRub(2);
            setTimeout(() => bowls[2].startRub(5), 2000);

            masterGain.gain.rampTo(1, 3);

            crystalSessionRef.current = { bowls, reverb, masterGain, conductorLoop };
            setActiveCrystalMode(true);
        }
    };


    // --- WIND (AMBIENCE) HANDLER ---
    const toggleAmbienceHandler = async () => {
        await initializeAudio();
        if (activeAmbience) {
            if (windNodesRef.current) {
                windNodesRef.current.gain.gain.rampTo(0, 2);
                setTimeout(() => {
                    windNodesRef.current?.noise.stop();
                    windNodesRef.current = null;
                }, 2000);
            }
            setActiveAmbience(false);
        } else {
            const noise = new Tone.Noise("pink").start();

            const filter = new Tone.AutoFilter({
                frequency: 0.05 + (windIntensity * 0.55),
                depth: 0.6 + (windIntensity * 0.4),
                baseFrequency: 150,
                octaves: 2.5 + (windIntensity * 1.5),
                filter: { type: "lowpass", rolloff: -24, Q: 0.5 }
            } as any).start();

            // Manually set min/max after init if needed or use cast
            (filter as any).min = 150;
            (filter as any).max = 600 + (windIntensity * 800);

            const gain = new Tone.Gain(0).connect(masterGainRef.current!);
            noise.connect(filter);
            filter.connect(gain);

            const targetVol = 0.2 + (windIntensity * 0.3);
            gain.gain.rampTo(targetVol, 4);

            windNodesRef.current = { noise, filter, gain };
            setActiveAmbience(true);
        }
    };

    // Update Wind Parameters
    useEffect(() => {
        if (activeAmbience && windNodesRef.current) {
            const { filter, gain } = windNodesRef.current;
            const newFreq = 0.05 + (windIntensity * 0.55);
            filter.frequency.rampTo(newFreq, 3);
            filter.max = 600 + (windIntensity * 800);
            filter.octaves = 2.5 + (windIntensity * 1.5);
            const targetVol = 0.2 + (windIntensity * 0.3);
            gain.gain.rampTo(targetVol, 2);
        }
    }, [windIntensity, activeAmbience]);


    // --- STATIC NOISE HANDLER ---
    const toggleNoiseHandler = async () => {
        await initializeAudio();
        if (activeNoise) {
            if (staticNoiseRef.current) {
                staticNoiseRef.current.gain.gain.rampTo(0, 1);
                setTimeout(() => {
                    staticNoiseRef.current?.source.stop();
                    staticNoiseRef.current = null;
                }, 1200);
            }
            setActiveNoise(false);
        } else {
            const source = new Tone.Noise(noiseColor).start();
            const gain = new Tone.Gain(0).connect(masterGainRef.current!);

            let cutoff = 1000;
            if (noiseColor === 'white') cutoff = 15000;
            if (noiseColor === 'pink') cutoff = 2000;
            if (noiseColor === 'brown') cutoff = 600;

            const filter = new Tone.Filter(cutoff, "lowpass").connect(gain);
            source.connect(filter);

            let targetVol = 0.1;
            if (noiseColor === 'brown') targetVol = 0.4;
            if (noiseColor === 'pink') targetVol = 0.15;
            if (noiseColor === 'white') targetVol = 0.08;

            gain.gain.rampTo(targetVol, 2);

            staticNoiseRef.current = { source, filter, gain };
            setActiveNoise(true);
        }
    };

    // Update Noise Color logic
    useEffect(() => {
        if (activeNoise && staticNoiseRef.current) {
            staticNoiseRef.current.source.type = noiseColor;
            let targetVol = 0.1;
            let targetFreq = 1000;

            if (noiseColor === 'brown') {
                targetVol = 0.4;
                targetFreq = 600;
            } else if (noiseColor === 'pink') {
                targetVol = 0.15;
                targetFreq = 2000;
            } else if (noiseColor === 'white') {
                targetVol = 0.08;
                targetFreq = 15000;
            }

            staticNoiseRef.current.gain.gain.rampTo(targetVol, 0.5);
            staticNoiseRef.current.filter.frequency.rampTo(targetFreq, 0.5);
        }
    }, [noiseColor, activeNoise]);


    // --- BREATHING PLAYBACK LOGIC ---
    const playPhaseSound = async (phase: any) => {
        if (soundMode === 'mute') return;
        if (!isReady) await initializeAudio();
        if (Tone.context.state !== 'running') await Tone.context.resume();

        switch (phase) {
            case 'Вдох':
                inhaleSynthRef.current?.triggerAttackRelease(["A3", "C#4", "E4", "B4"], "2n");
                break;
            case 'Выдох':
                exhaleSynthRef.current?.triggerAttackRelease(["F3", "A3", "C4", "E4"], "1n");
                break;
            case 'Задержка (вдох)':
                holdInSynthRef.current?.triggerAttackRelease(200, "32n", undefined, 0.4);
                break;
            case 'Задержка (выдох)':
                holdOutSynthRef.current?.triggerAttackRelease("C2", "2n");
                break;
            case 'Завершено':
                doneSynthRef.current?.triggerAttackRelease(["C4", "E4", "G4", "C5"], "1n");
                break;
        }
    };

    const playCountdownTick = async (number: number) => {
        if (soundMode === 'mute') return;
        if (!isReady) await initializeAudio();
        if (Tone.context.state !== 'running') await Tone.context.resume();

        const blip = tickSynthRef.current;
        if (!blip) return;

        if (number > 1) {
            blip.modulationIndex.value = 3;
            blip.triggerAttackRelease("G5", "32n");
        } else {
            blip.modulationIndex.value = 5;
            blip.triggerAttackRelease("C6", "32n");
        }
    };

    const playSoundEffect = async (mode: any) => {
        if (mode === 'mute') return;
        if (!isReady) await initializeAudio();
        inhaleSynthRef.current?.triggerAttackRelease(["C5", "E5"], "8n");
    };

    return (
        <AudioContext.Provider value={{
            isReady,
            initializeAudio,
            masterVolume,
            setMasterVolume: setMasterVal,
            playbackMode,
            setPlaybackMode,
            isTimerActive,
            setTimerActive,

            activeBinaural,
            toggleBinaural: toggleBinauralHandler,

            activeSolfeggio,
            setSolfeggio: setSolfeggioHandler,

            // Crystal
            activeCrystalMode,
            toggleCrystalMode: toggleCrystalModeHandler,

            // Wind
            activeAmbience,
            toggleAmbience: toggleAmbienceHandler,
            windIntensity,
            setWindIntensity,

            // Noise
            activeNoise,
            toggleNoise: toggleNoiseHandler,
            noiseColor,
            setNoiseColor,

            // Breathing
            playPhaseSound,
            playCountdownTick,
            playSoundEffect,
            soundMode,
            setSoundMode
        }}>
            {children}
        </AudioContext.Provider>
    );
};
