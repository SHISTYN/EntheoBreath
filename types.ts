
export enum BreathingPhase {
  Inhale = 'Вдох',
  HoldIn = 'Задержка (вдох)',
  Exhale = 'Выдох',
  HoldOut = 'Задержка (выдох)',
  Ready = 'Приготовьтесь',
  Done = 'Завершено'
}

export interface BreathPreset {
  name: string;
  inhale: number;
  holdIn: number;
  exhale: number;
  holdOut: number;
  breathCount?: number;
  retentionProfile?: number[];
}

export interface MusicLink {
  label: string;
  url: string;
  icon: string;
  color?: string;
}

export interface Benefit {
  label: string;
  icon: string; // Lucide icon name
  color?: string; // Tailwind color class (optional override)
}

export interface BreathingPattern {
  name: string;
  description: string;
  instruction: string;
  benefits: Benefit[]; // Updated structure
  
  safetyWarning?: string;
  contraindications?: string[];
  conditions?: string[];
  
  id: string;
  mode: 'loop' | 'wim-hof' | 'stopwatch' | 'manual'; 
  inhale: number;
  holdIn: number;
  exhale: number;
  holdOut: number;
  breathCount?: number;
  retentionProfile?: number[];
  
  displayLabel?: string; 

  audioUrl?: string;
  musicLinks?: MusicLink[];
  
  tags?: string[]; // Added tags for smart filtering
  
  category: 'Calm' | 'Energy' | 'Balance' | 'Sleep' | 'Focus' | 'Health' | 'Transcendence' | 'Toltec' | 'Qigong' | 'Tao';
  difficulty: 'Новичок' | 'Средний' | 'Профи';
  presets?: BreathPreset[];
}

export interface BreathState {
  currentPhase: BreathingPhase;
  secondsRemaining: number;
  totalSecondsElapsed: number;
  currentRound: number;
  currentBreath: number;
  isActive: boolean;
  isPaused: boolean;
  sessionResults: number[];
}

export interface SessionHistoryItem {
    id: string;
    patternId: string;
    patternName: string;
    date: string; // ISO string
    durationSeconds: number;
    roundsCompleted: number;
}

export interface GeminiAnalysis {
  history: string;
  benefits: string;
  technique: string;
  tips: string;
}
