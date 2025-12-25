import React, { useId } from 'react';

interface Props {
    className?: string;
    animated?: boolean;
    size?: number; // Backwards compatibility
    idSuffix?: string; // Optional manual ID suffix
}

const EntheoLogo: React.FC<Props> = ({ className, animated = true, size, idSuffix }) => {
    // Generate unique ID for gradients to avoid conflicts between Header/Splash instances
    const uniqueId = useId();
    const auraId = `goldAura-${uniqueId}`;

    // Handling size prop if provided, otherwise rely on className
    const style = size ? { width: size, height: size } : {};
    // Default class if none provided to ensure visibility
    const finalClassName = className || "w-12 h-12";

    return (
        <svg 
            viewBox="0 0 120 120" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg" 
            className={finalClassName}
            style={!className ? style : undefined}
        >
            <defs>
                <radialGradient id={auraId} cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(60 60) rotate(90) scale(60)">
                    <stop stopColor="#F59E0B" stopOpacity="0.4" /> 
                    <stop offset="0.8" stopColor="#7C3AED" stopOpacity="0" />
                </radialGradient>
            </defs>

            {/* Aura (Soft Glow behind the pixels) */}
            <circle 
                cx="60" 
                cy="65" 
                r="50" 
                fill={`url(#${auraId})`} 
                className={animated ? "animate-pulse-slow" : ""}
            />

            {/* PIXEL ART GROUP (Crisp Edges) */}
            <g shapeRendering="crispEdges" transform="translate(0, 5)">
                
                {/* --- MUSHROOM --- */}
                
                {/* Stem (Cream) */}
                <path d="M50 70 H70 V100 H50 Z" fill="#FFF9E5" />
                <path d="M45 100 H75 V105 H45 Z" fill="#FFF9E5" /> {/* Base flare */}
                <path d="M70 70 H75 V100 H70 Z" fill="#E5E7EB" opacity="0.3" /> {/* Shadow right */}

                {/* Cap (Red) */}
                <path d="M25 70 H95 V50 H85 V40 H35 V50 H25 Z" fill="#ef4444" />
                <path d="M25 70 H95 V75 H25 Z" fill="#991b1b" /> {/* Cap Shadow/Rim */}

                {/* Spots (White Pixels) */}
                <rect x="35" y="55" width="5" height="5" fill="white" />
                <rect x="75" y="60" width="5" height="5" fill="white" />
                <rect x="55" y="45" width="5" height="5" fill="white" />
                <rect x="85" y="50" width="5" height="5" fill="white" />
                <rect x="30" y="65" width="5" height="5" fill="white" />

                {/* --- KAMBO FROG (Sitting on top) --- */}
                
                {/* Body (Green) */}
                <path d="M45 40 H75 V25 H45 Z" fill="#84cc16" />
                
                {/* Legs (Darker Green) */}
                <rect x="40" y="35" width="5" height="5" fill="#65a30d" />
                <rect x="75" y="35" width="5" height="5" fill="#65a30d" />

                {/* Eyes (Protruding) */}
                <rect x="45" y="20" width="10" height="5" fill="#84cc16" />
                <rect x="65" y="20" width="10" height="5" fill="#84cc16" />
                
                {/* Eye Whites & Pupils */}
                <rect x="45" y="20" width="5" height="5" fill="white" />
                <rect x="47" y="22" width="2" height="2" fill="black" />
                
                <rect x="70" y="20" width="5" height="5" fill="white" />
                <rect x="72" y="22" width="2" height="2" fill="black" />

                {/* Belly/Throat (Light Green) */}
                <rect x="55" y="30" width="10" height="10" fill="#bef264" />

            </g>
        </svg>
    );
};

export default EntheoLogo;