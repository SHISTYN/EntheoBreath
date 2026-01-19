
import { useRef, useState, useEffect, useCallback } from 'react';
import * as Tone from 'tone';
import { BreathingPhase } from '../types';

export type SoundMode = 'mute' | 'bell' | 'hang' | 'bowl' | 'rain' | 'om' | 'gong' | 'harp' | 'flute';

export const useAudioSystem = () => {
    // Внутреннее состояние для режима звука (по умолчанию 'bell')
    const [soundMode, setSoundMode] = useState<SoundMode>('bell');

    // --- ИНСТРУМЕНТЫ (Refs - это как кладовка, они хранятся между "кадрами" отрисовки) ---
    // Храним синтезаторы здесь, чтобы не создавать их заново каждый раз.
    const reverbRef = useRef<Tone.Reverb | null>(null);
    const volumeRef = useRef<Tone.Volume | null>(null);

    const inhaleSynthRef = useRef<Tone.PolySynth | null>(null);
    const exhaleSynthRef = useRef<Tone.PolySynth | null>(null);
    const holdInSynthRef = useRef<Tone.MetalSynth | null>(null);
    const holdOutSynthRef = useRef<Tone.Synth | null>(null);
    const doneSynthRef = useRef<Tone.PolySynth | null>(null);
    const tickSynthRef = useRef<Tone.FMSynth | null>(null);

    // Эта функция запускается один раз при "смерти" компонента (закрытии)
    // Она выбрасывает мусор, чтобы очистить память.
    useEffect(() => {
        return () => {
            inhaleSynthRef.current?.dispose();
            exhaleSynthRef.current?.dispose();
            holdInSynthRef.current?.dispose();
            holdOutSynthRef.current?.dispose();
            doneSynthRef.current?.dispose();
            tickSynthRef.current?.dispose();
            reverbRef.current?.dispose();
            volumeRef.current?.dispose();
        };
    }, []);

    // Инициализация (Настройка инструментов)
    const initAudio = useCallback(async () => {
        await Tone.start();

        // Если громкость еще не создана - создаем всю цепочку
        if (!volumeRef.current) {
            // Эффект Эха (Reverb) - создает ощущение пространства
            // decay: как долго звучит эхо
            // wet: насколько много эха (0.3 = 30%)
            reverbRef.current = new Tone.Reverb({ decay: 2.5, wet: 0.3 }).toDestination();
            await reverbRef.current.generate();

            // Громкость (Мастер-канал)
            volumeRef.current = new Tone.Volume(-2).connect(reverbRef.current);
        }

        // --- СОЗДАНИЕ ИНСТРУМЕНТОВ (Если их нет) ---

        // 1. Вдох (Светлый, воздушный звук)
        if (!inhaleSynthRef.current && volumeRef.current) {
            inhaleSynthRef.current = new Tone.PolySynth(Tone.FMSynth, {
                harmonicity: 3,
                modulationIndex: 3.5,
                oscillator: { type: "sine" },
                envelope: { attack: 0.2, decay: 0.1, sustain: 0.3, release: 2 },
                modulation: { type: "sine" },
                modulationEnvelope: { attack: 0.5, decay: 0, sustain: 1, release: 0.5 }
            }).connect(volumeRef.current);
        }

        // 2. Выдох (Теплый, мягкий звук)
        if (!exhaleSynthRef.current && volumeRef.current) {
            exhaleSynthRef.current = new Tone.PolySynth(Tone.AMSynth, {
                harmonicity: 2,
                oscillator: { type: "sine" },
                envelope: { attack: 0.1, decay: 2, sustain: 0.1, release: 3 },
                modulation: { type: "sine" },
                modulationEnvelope: { attack: 0.5, decay: 0, sustain: 1, release: 0.5 }
            }).connect(volumeRef.current);
        }

        // 3. Задержка на вдохе (Металлический, высокий звук)
        if (!holdInSynthRef.current && volumeRef.current) {
            holdInSynthRef.current = new Tone.MetalSynth({
                envelope: { attack: 0.005, decay: 1.4, release: 0.2 },
                harmonicity: 5.1,
                modulationIndex: 32,
                resonance: 4000,
                octaves: 1.5
            }).connect(volumeRef.current);
            holdInSynthRef.current.frequency.value = 200;
            holdInSynthRef.current.volume.value = -12; // Потише
        }

        // 4. Задержка на выдохе (Глубокий, низкий пульс)
        if (!holdOutSynthRef.current && volumeRef.current) {
            holdOutSynthRef.current = new Tone.Synth({
                oscillator: { type: "sine" },
                envelope: { attack: 0.5, decay: 0.5, sustain: 0, release: 1 }
            }).connect(volumeRef.current);
            holdOutSynthRef.current.volume.value = -5;
        }

        // 5. Завершение (Аккорд победы)
        if (!doneSynthRef.current && volumeRef.current) {
            doneSynthRef.current = new Tone.PolySynth(Tone.Synth).connect(volumeRef.current);
        }

        // 6. Тиканье таймера (Стеклянный "дзынь")
        if (!tickSynthRef.current && volumeRef.current) {
            tickSynthRef.current = new Tone.FMSynth({
                harmonicity: 1.5,
                modulationIndex: 3,
                oscillator: { type: "sine" },
                modulation: { type: "sine" },
                envelope: { attack: 0.005, decay: 0.15, sustain: 0, release: 1 },
                modulationEnvelope: { attack: 0.001, decay: 0.1, sustain: 0, release: 0.1 }
            }).connect(volumeRef.current);
            tickSynthRef.current.volume.value = -4;
        }
    }, []);

    // --- ФУНКЦИИ ВОСПРОИЗВЕДЕНИЯ ---

    const playPhaseSound = useCallback(async (phase: BreathingPhase) => {
        if (soundMode === 'mute') return;

        // Убеждаемся, что всё готово
        if (!volumeRef.current) await initAudio();

        switch (phase) {
            case BreathingPhase.Inhale:
                // Аккорд A Major Add9 (Светлый)
                inhaleSynthRef.current?.triggerAttackRelease(["A3", "C#4", "E4", "B4"], "2n");
                break;
            case BreathingPhase.Exhale:
                // Аккорд F Major 7 (Успокаивающий)
                exhaleSynthRef.current?.triggerAttackRelease(["F3", "A3", "C4", "E4"], "1n");
                break;
            case BreathingPhase.HoldIn:
                // Короткий "дзынь" - note, duration, time, velocity
                holdInSynthRef.current?.triggerAttackRelease(200, "32n", undefined, 0.4);
                break;
            case BreathingPhase.HoldOut:
                // Низкая нота C2
                holdOutSynthRef.current?.triggerAttackRelease("C2", "2n");
                break;
            case BreathingPhase.Done:
                // Финальный аккорд C Major
                doneSynthRef.current?.triggerAttackRelease(["C4", "E4", "G4", "C5"], "1n");
                break;
        }
    }, [soundMode]); // Зависит только от soundMode

    const playCountdownTick = useCallback(async (number: number) => {
        if (soundMode === 'mute') return;
        if (!volumeRef.current) await initAudio();

        const blip = tickSynthRef.current;
        if (!blip) return;

        if (number > 1) {
            // 3, 2: Обычный "блип"
            blip.modulationIndex.value = 3;
            blip.triggerAttackRelease("G5", "32n");
        } else {
            // 1: Акцент (более яркий звук) - "Внимание!"
            blip.modulationIndex.value = 5;
            blip.triggerAttackRelease("C6", "32n");
        }
    }, [soundMode]);

    const playSoundEffect = useCallback(async (mode: SoundMode) => {
        if (mode === 'mute') return;
        if (!volumeRef.current) await initAudio();

        // Для предпрослушивания можно использовать Inhale синт
        inhaleSynthRef.current?.triggerAttackRelease(["C5", "E5"], "8n");
    }, [initAudio]);

    const changeSoundMode = useCallback((mode: SoundMode) => {
        setSoundMode(mode);
        playSoundEffect(mode);
    }, [playSoundEffect]);

    return {
        soundMode,
        playSoundEffect,
        playCountdownTick,
        playPhaseSound,
        changeSoundMode,
        initAudio
    };
};
