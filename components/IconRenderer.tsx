
import React from 'react';
// Explicit imports for tree-shaking (82 icons used in benefits)
import {
  Activity, Anchor, ArrowDown, ArrowDownCircle, ArrowRight, ArrowUp, ArrowUpCircle,
  Atom, Battery, BatteryCharging, Bed, Bone, Brain, BrainCircuit,
  Circle, CloudFog, Coffee, Crosshair, Database, Droplet, Droplets, Eraser,
  Eye, EyeOff, Feather, Flame, Gauge, Ghost, GlassWater, Globe,
  Heart, HeartHandshake, HeartPulse, Hourglass, Infinity, Layers, Leaf, Lightbulb,
  Link, Lock, Maximize, Megaphone, MessageSquareOff, Mic, Mic2,
  Moon, Mountain, MoveUp, Play, RefreshCcw, RefreshCw, RotateCcw,
  Scale, Scissors, Shield, ShieldAlert, ShieldCheck, ShieldPlus, Sliders, Smile, SmilePlus,
  Snowflake, Sparkles, Star, StopCircle, Sun, Swords, Target, ThermometerSun,
  Trash2, TrendingDown, Triangle, Unlock, UserCheck, Utensils, UtensilsCrossed,
  VolumeX, Waves, Wifi, Wind, Zap
} from 'lucide-react';

// Icon map for dynamic rendering
// Note: Bandage, BicepsFlexed, Lungs don't exist in lucide-react 0.344.0
// Using fallbacks: Bandage→HeartPulse, BicepsFlexed→Zap, Lungs→Wind
const ICON_MAP: Record<string, React.FC<{ size?: number; className?: string }>> = {
  Activity, Anchor, ArrowDown, ArrowDownCircle, ArrowRight, ArrowUp, ArrowUpCircle,
  Atom, Battery, BatteryCharging, Bed, Bone, Brain, BrainCircuit,
  Circle, CloudFog, Coffee, Crosshair, Database, Droplet, Droplets, Eraser,
  Eye, EyeOff, Feather, Flame, Gauge, Ghost, GlassWater, Globe,
  Heart, HeartHandshake, HeartPulse, Hourglass, Infinity, Layers, Leaf, Lightbulb,
  Link, Lock, Maximize, Megaphone, MessageSquareOff, Mic, Mic2,
  Moon, Mountain, MoveUp, Play, RefreshCcw, RefreshCw, RotateCcw,
  Scale, Scissors, Shield, ShieldAlert, ShieldCheck, ShieldPlus, Sliders, Smile, SmilePlus,
  Snowflake, Sparkles, Star, StopCircle, Sun, Swords, Target, ThermometerSun,
  Trash2, TrendingDown, Triangle, Unlock, UserCheck, Utensils, UtensilsCrossed,
  VolumeX, Waves, Wifi, Wind, Zap,
  // Fallbacks for missing icons
  Bandage: HeartPulse,
  BicepsFlexed: Zap,
  Lungs: Wind,
};

interface IconRendererProps {
  iconName: string;
  className?: string;
  size?: number;
}

const IconRenderer: React.FC<IconRendererProps> = ({ iconName, className, size = 16 }) => {
  const IconComponent = ICON_MAP[iconName];

  if (!IconComponent) {
    // Fallback icon if name not found
    return <Sparkles size={size} className={className} />;
  }

  return <IconComponent size={size} className={className} />;
};

export default IconRenderer;
