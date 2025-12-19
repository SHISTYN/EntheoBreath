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
    const capId = `magicCap-${uniqueId}`;
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
                <linearGradient id={capId} x1="60" y1="20" x2="60" y2="70" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#ef4444" />
                    <stop offset="1" stopColor="#991b1b" />
                </linearGradient>
                <radialGradient id={auraId} cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(60 60) rotate(90) scale(60)">
                    <stop stopColor="#F59E0B" stopOpacity="0.3" /> 
                    <stop offset="0.8" stopColor="#7C3AED" stopOpacity="0" />
                </radialGradient>
            </defs>

            {/* Aura (Pulse Animation) */}
            <circle 
                cx="60" 
                cy="65" 
                r="50" 
                fill={`url(#${auraId})`} 
                className={animated ? "animate-pulse-slow" : ""}
            />

            {/* Mushroom Shape Group */}
            <g transform="translate(0, 5)">
                {/* Stem */}
                <path d="M 50 65 Q 48 95 45 100 L 75 100 Q 72 95 70 65" fill="#FFF9E5" />
                {/* Stem Shadow */}
                <path d="M 50 65 L 70 65 L 70 100 L 45 100 Z" fill="rgba(0,0,0,0.05)" />
                {/* Ring (Skirt) */}
                <path d="M 50 70 Q 60 80 70 70 L 72 66 L 48 66 Z" fill="#FFF" />
                
                {/* Cap */}
                <g className={animated ? "origin-bottom" : ""}>
                    <path d="M 25 65 C 25 25, 95 25, 95 65 Q 60 55 25 65 Z" fill={`url(#${capId})`} />
                    {/* Spots */}
                    <g fill="#FFFFFF" fillOpacity="0.9">
                        <ellipse cx="45" cy="40" rx="5" ry="3" transform="rotate(-20 45 40)" />
                        <circle cx="65" cy="35" r="4" />
                        <circle cx="82" cy="50" r="3" />
                        <circle cx="35" cy="55" r="2.5" />
                    </g>
                </g>
            </g>
        </svg>
    );
};

export default EntheoLogo;