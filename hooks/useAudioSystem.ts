
import { useRef, useState, useEffect } from 'react';
import * as Tone from 'tone';

export type SoundMode = 'mute' | 'bell' | 'hang' | 'bowl' | 'rain' | 'om' | 'gong' | 'harp' | 'flute';

export const useAudioSystem = () => {
    // Legacy state, kept for compatibility with prop types
    const [soundMode, setSoundMode] = useState<SoundMode>('bell');
    
    const initAudio = async () => {
        await Tone.start();
    };

    // Soft Tick for Countdown
    const playCountdownTick = () => {
        if (soundMode === 'mute') return;
        // Soft Woodblock / Drop sound
        const synth = new Tone.MembraneSynth({
            pitchDecay: 0.008,
            octaves: 2,
            oscillator: { type: 'sine' },
            envelope: { attack: 0.001, decay: 0.2, sustain: 0, release: 1 }
        }).toDestination();
        // Very quiet, subtle
        synth.volume.value = -18; 
        synth.triggerAttackRelease("C2", "32n");
    };

    const playSoundEffect = async (mode: SoundMode) => {
        if (mode === 'mute') return;
        await Tone.start();

        // Common Reverb
        const reverb = new Tone.Reverb({ decay: 2.5, wet: 0.4 }).toDestination();

        switch(mode) {
            case 'bell': {
                // Bright digital bell
                const synth = new Tone.PolySynth(Tone.Synth, {
                    oscillator: { type: "sine" },
                    envelope: { attack: 0.01, decay: 1.2, sustain: 0, release: 1 }
                }).connect(reverb);
                synth.triggerAttackRelease(["C5", "E5"], "1n");
                break;
            }
            case 'hang': {
                // Warm hang drum
                const synth = new Tone.PolySynth(Tone.Synth, {
                    oscillator: { type: "sine" },
                    envelope: { attack: 0.02, decay: 1.5, sustain: 0, release: 1 }
                }).connect(reverb);
                synth.triggerAttackRelease(["A3", "C4", "E4"], "2n");
                break;
            }
            case 'bowl': {
                // Tibetan Singing Bowl (FM/Metal Synthesis)
                const bowl = new Tone.MetalSynth({
                    frequency: 200,
                    envelope: { attack: 0.1, decay: 2.5, release: 1 },
                    harmonicity: 3.1, // Disharmonic
                    modulationIndex: 16,
                    resonance: 3000,
                    octaves: 1.0
                }).connect(reverb);
                // Lower pitch for bowl
                bowl.triggerAttackRelease("G2", "1n", undefined, 0.6);
                break;
            }
            case 'gong': {
                 // Deep Gong Sound
                 const gong = new Tone.MetalSynth({
                    frequency: 200,
                    envelope: { attack: 0.1, decay: 3.5, release: 2 },
                    harmonicity: 5.1,
                    modulationIndex: 32,
                    resonance: 4000,
                    octaves: 1.5
                }).connect(reverb);
                gong.triggerAttackRelease("C2", "2n", undefined, 0.8);
                break;
            }
            case 'rain': {
                // Rain Stick / Water Drop Effect
                const noise = new Tone.Noise("pink").start();
                const filter = new Tone.Filter(1200, "lowpass").connect(reverb);
                const env = new Tone.AmplitudeEnvelope({
                    attack: 0.05, decay: 0.4, sustain: 0, release: 0.2
                }).connect(filter);
                
                noise.connect(env);
                env.triggerAttackRelease("4n");
                
                // Cleanup noise source after sound
                setTimeout(() => {
                    noise.stop();
                    noise.dispose();
                    env.dispose();
                    filter.dispose();
                    reverb.dispose();
                }, 2000);
                return; // Special return to handle manual cleanup
            }
            case 'om': {
                // Deep OM Drone
                const omSynth = new Tone.Synth({ 
                    oscillator: { type: "fmsine", modulationType: "sine", modulationIndex: 3, harmonicity: 3.4 },
                    envelope: { attack: 0.5, decay: 2, sustain: 0.5, release: 3 }
                }).connect(reverb);
                omSynth.volume.value = -8;
                omSynth.triggerAttackRelease("C#2", "2n"); 
                break;
            }
            case 'harp': {
                // Harp Pluck
                const harp = new Tone.PluckSynth({
                    attackNoise: 1,
                    dampening: 4000,
                    resonance: 0.98
                }).connect(reverb);
                harp.triggerAttack("C4");
                break;
            }
            case 'flute': {
                // Wood Flute
                const flute = new Tone.MonoSynth({
                    oscillator: { type: "sine" },
                    envelope: { attack: 0.1, decay: 0.3, sustain: 0.4, release: 0.8 },
                    filterEnvelope: { attack: 0.06, decay: 0.2, sustain: 0.5, baseFrequency: 300, octaves: 2 }
                }).connect(reverb);
                flute.triggerAttackRelease("A4", "8n");
                break;
            }
            default:
                break;
        }
    };

    const changeSoundMode = (mode: SoundMode) => {
        setSoundMode(mode);
        playSoundEffect(mode);
    };

    return {
        soundMode,
        playSoundEffect,
        playCountdownTick,
        changeSoundMode,
        initAudio
    };
};
