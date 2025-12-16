
export enum BreathingPhase {
  Inhale = 'Вдох',
  HoldIn = 'Задержка (вдох)',
  Exhale = 'Выдох',
  HoldOut = 'Задержка (выдох)',
  Ready = 'Приготовьтесь',
  Done = 'Завершено'
}

export interface BreathPreset {
  name: string; // e.g., "Уровень 1", "Новичок", "Мастер"
  inhale: number;
  holdIn: number;
  exhale: number;
  holdOut: number;
  breathCount?: number; // Override default breath count
}

export interface BreathingPattern {
  name: string;
  description: string; // Short summary text
  instruction: string; // Detailed step-by-step markdown
  benefits: string[]; // List of specific benefits
  
  // New Safety Fields
  safetyWarning?: string; // CRITICAL warnings (Red alert)
  contraindications?: string[]; // Who should NOT do this (hypertension, pregnancy, etc.)
  conditions?: string[]; // When/How: "Empty stomach", "Lying down", "Safe for driving?"
  
  id: string;
  mode: 'loop' | 'wim-hof'; // 'loop' = standard cycle, 'wim-hof' = breaths count -> retention -> recovery
  inhale: number;
  holdIn: number;
  exhale: number;
  holdOut: number;
  breathCount?: number; // Target breaths for Wim Hof mode (e.g., 30)
  
  audioUrl?: string; // Link to external music playlist (Yandex Disk, Spotify, etc.)
  
  category: 'Calm' | 'Energy' | 'Balance' | 'Sleep' | 'Focus' | 'Health' | 'Transcendence';
  difficulty: 'Новичок' | 'Средний' | 'Профи';
  presets?: BreathPreset[]; // Optional list of presets
}

export interface BreathState {
  currentPhase: BreathingPhase;
  secondsRemaining: number;
  totalSecondsElapsed: number;
  currentRound: number;
  currentBreath: number; // For counting breaths in Wim Hof mode
  isActive: boolean;
  isPaused: boolean;
}

export interface GeminiAnalysis {
  history: string;
  benefits: string;
  technique: string;
  tips: string;
}
