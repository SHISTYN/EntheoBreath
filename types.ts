
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
  retentionProfile?: number[]; // Custom retention times per round
}

export interface MusicLink {
  label: string;
  url: string;
  icon: string; // FontAwesome icon name (e.g., 'telegram', 'cloud')
  color?: string; // Optional specific color class
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
  // Added 'manual' for Castaneda/Tensegrity/Qigong techniques
  mode: 'loop' | 'wim-hof' | 'stopwatch' | 'manual'; 
  inhale: number;
  holdIn: number;
  exhale: number;
  holdOut: number;
  breathCount?: number; // Target breaths for Wim Hof mode (e.g., 30)
  retentionProfile?: number[]; // Array of seconds for retention per round [30, 60, 90...]
  
  // Optional override for the pattern display text (e.g., "0-0-0-0")
  displayLabel?: string; 

  audioUrl?: string; // Legacy Link (Single)
  musicLinks?: MusicLink[]; // NEW: Multiple links support
  
  category: 'Calm' | 'Energy' | 'Balance' | 'Sleep' | 'Focus' | 'Health' | 'Transcendence' | 'Toltec' | 'Qigong' | 'Tao';
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
  sessionResults: number[]; // Stores retention times for WHM
}

export interface GeminiAnalysis {
  history: string;
  benefits: string;
  technique: string;
  tips: string;
}
