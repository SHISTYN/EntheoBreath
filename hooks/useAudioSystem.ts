import { useRef, useState, useEffect } from 'react';

export type SoundMode = 'mute' | 'bell' | 'hang' | 'bowl' | 'gong' | 'rain' | 'om' | 'flute' | 'harp' | 'binaural_theta' | 'binaural_alpha';

export const useAudioSystem = () => {
    const [soundMode, setSoundMode] = useState<SoundMode>('bell');
    const audioContextRef = useRef<AudioContext | null>(null);
    // Refs to keep track of continuous oscillators for binaural beats
    const binauralNodesRef = useRef<{
        leftOsc: OscillatorNode | null;
        rightOsc: OscillatorNode | null;
        gain: GainNode | null;
    }>({ leftOsc: null, rightOsc: null, gain: null });

    const initAudio = () => {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        if (audioContextRef.current.state === 'suspended') {
            audioContextRef.current.resume();
        }
    };

    const stopBinaural = () => {
        const { leftOsc, rightOsc, gain } = binauralNodesRef.current;
        if (gain) {
            // Smooth fade out
            gain.gain.exponentialRampToValueAtTime(0.001, audioContextRef.current!.currentTime + 1);
            setTimeout(() => {
                leftOsc?.stop();
                rightOsc?.stop();
                leftOsc?.disconnect();
                rightOsc?.disconnect();
            }, 1000);
        }
        binauralNodesRef.current = { leftOsc: null, rightOsc: null, gain: null };
    };

    const playBinauralDrone = (baseFreq: number, beatFreq: number) => {
        if (!audioContextRef.current) initAudio();
        const ctx = audioContextRef.current!;
        
        // Cleanup previous if exists
        stopBinaural();

        const masterGain = ctx.createGain();
        masterGain.gain.setValueAtTime(0, ctx.currentTime);
        masterGain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 2); // Slow fade in
        masterGain.connect(ctx.destination);

        // Left Ear (Carrier)
        const leftOsc = ctx.createOscillator();
        leftOsc.type = 'sine';
        leftOsc.frequency.value = baseFreq;
        const leftPan = ctx.createStereoPanner();
        leftPan.pan.value = -1; // Full Left
        leftOsc.connect(leftPan).connect(masterGain);

        // Right Ear (Carrier + Beat)
        const rightOsc = ctx.createOscillator();
        rightOsc.type = 'sine';
        rightOsc.frequency.value = baseFreq + beatFreq; // The difference creates the wave
        const rightPan = ctx.createStereoPanner();
        rightPan.pan.value = 1; // Full Right
        rightOsc.connect(rightPan).connect(masterGain);

        leftOsc.start();
        rightOsc.start();

        binauralNodesRef.current = { leftOsc, rightOsc, gain: masterGain };
    };

    const playSoundEffect = (mode: SoundMode) => {
        if (mode === 'mute') return;
        if (!audioContextRef.current) initAudio();
        const ctx = audioContextRef.current!;
        const now = ctx.currentTime;

        const createOsc = (type: OscillatorType, freq: number, gainVal: number, duration: number, delay: number = 0) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = type;
            osc.frequency.setValueAtTime(freq, now);
            
            gain.gain.setValueAtTime(0, now + delay);
            gain.gain.linearRampToValueAtTime(gainVal, now + delay + 0.05); // Faster attack
            gain.gain.exponentialRampToValueAtTime(0.001, now + delay + duration);

            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now + delay);
            osc.stop(now + delay + duration);
        };

        // Generative Sound Logic
        switch(mode) {
            case 'bell':
                // Tibetan Bell: Fundamental + Harmonic
                createOsc('sine', 523.25, 0.1, 2.5);
                createOsc('sine', 1569.75, 0.02, 2.0); // 3rd harmonic
                break;
            case 'gong':
                // Deep Gong: Sawtooth for texture, low freq
                createOsc('sine', 110, 0.2, 4.0);
                createOsc('triangle', 112, 0.15, 3.5); // Detuned for wobble
                createOsc('sine', 220, 0.05, 3.0);
                break;
            case 'om':
                 // Synth OM: Low drone
                createOsc('sine', 136.1, 0.15, 3.0); // C# (Om frequency)
                createOsc('sine', 272.2, 0.05, 3.0);
                break;
            case 'binaural_theta':
                // 4Hz Theta (Deep Meditation) on 200Hz carrier
                playBinauralDrone(200, 4); 
                break;
            default:
                createOsc('sine', 440, 0.1, 1.0);
                break;
        }
    };

    // When changing modes, if it's not a drone mode, stop any running drones
    const changeSoundMode = (mode: SoundMode) => {
        initAudio(); 
        setSoundMode(mode);
        if (!mode.startsWith('binaural')) {
            stopBinaural();
            playSoundEffect(mode); 
        } else {
            playSoundEffect(mode); // Will trigger the drone
        }
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => stopBinaural();
    }, []);

    return {
        soundMode,
        setSoundMode,
        playSoundEffect,
        changeSoundMode,
        initAudio
    };
};