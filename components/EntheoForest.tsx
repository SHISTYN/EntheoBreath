
import React, { useMemo, useEffect, useState } from 'react';
import { motion } from 'framer-motion';

// --- CONFIGURATION ---
const S = 2; // Scale factor (2px per logical unit)
const W = 160; // Logical Width
const H = 100; // Logical Height

// --- PALETTE (Mystical Night) ---
const P = {
    skyTop: '#0f0518',
    skyBot: '#2e1065', // Deep Purple

    stars: '#fbbf24',
    moon: '#fefce8',
    moonGlow: 'rgba(254, 252, 232, 0.1)',

    bgMtns: '#1e1b4b', // Indigo 950
    bgTrees: '#172554', // Blue 950

    // Foreground
    groundDark: '#020617', // Slate 950
    groundMid: '#0f172a',
    grass: '#1e293b',

    // Hero Objects
    treeBark: '#0a0a0a',
    treeLight: '#27272a',
    leaves: '#064e3b',

    cat: '#000000',
    catHighlight: '#3f3f46',
    catEyes: '#fbbf24', // Amber

    shroomStem: '#fffbeb', // Amber 50
    shroomCap: '#e11d48', // Rose 600
    shroomShadow: '#9f1239', // Rose 800
    shroomSpot: '#ffffff',

    frog: '#65a30d', // Lime 600
    frogLight: '#a3e635', // Lime 400

    spore: '#fcd34d', // Amber 300
};

// --- SPRITES (ASCII MAPS) ---

const SPRITE_CAT_SITTING = [
    "......XX........", // Ears
    ".....XXXX.......",
    "....XXYYXX......", // Eyes
    "....XXXXXX......",
    ".....XXXX.......", // Neck
    "...XXXXXXX......", // Body
    "..XXXXXXXXXX....",
    ".XXXXXXXXXXXX...",
    "XXXXXXXXXXXXX...",
    "XX..XXXXXXX..XX.", // Legs/Tail base
];

const SPRITE_MUSHROOM_GIANT = [
    "......RRRRRRRR......",
    "....RRRRRRRRRRRR....",
    "...RRWWRRRRRRWWRR...",
    "..RRRRRRRRRRRRRRRR..",
    ".RRWWRRRRRRRRRRWWRR.",
    "RRRRRRRRRRRRRRRRRRRR",
    "RRRRRRRRRRRRRRRRRRRR",
    ".RRRRRRRRRRRRRRRRRR.", // Shadow under rim
    ".......SSSSSS.......",
    ".......SSSSSS.......",
    ".......SSSSSS.......",
    ".......SSSSSS.......",
    "......SSSSSSSS......",
];

const SPRITE_FROG = [
    "........",
    ".G+..G+.", // Eyes
    "GGGGGGGG",
    "GGLLLLGG", // L = Light belly
    "GGGGGGGG",
    "G.G..G.G"  // Legs
];

// --- RENDERER ---
const PixelGrid = ({ data, colors, scale = 1 }: { data: string[], colors: Record<string, string>, scale?: number }) => {
    // Flatten data to rects
    const rects: React.ReactNode[] = [];
    data.forEach((row, y) => {
        for (let x = 0; x < row.length; x++) {
            const char = row[x];
            if (char !== '.') {
                let fill = colors[char] || colors['#'];
                // Custom mappings
                if (char === 'X') fill = P.cat;
                if (char === 'Y') fill = P.catEyes;
                if (char === 'R') fill = P.shroomCap;
                if (char === 'W') fill = P.shroomSpot;
                if (char === 'S') fill = P.shroomStem;
                if (char === 'G') fill = P.frog;
                if (char === 'L') fill = P.frogLight;
                if (char === '+') fill = '#ffffff';

                rects.push(
                    <rect
                        key={`${x}-${y}`}
                        x={x * scale * S}
                        y={y * scale * S}
                        width={scale * S}
                        height={scale * S}
                        fill={fill}
                    />
                );
            }
        }
    });
    return <>{rects}</>;
};

// --- SCENE COMPONENTS ---

const StarField = () => {
    // Static stars to avoid hydration mismatch, animated via CSS opacity
    return (
        <g>
            {[...Array(30)].map((_, i) => (
                <rect
                    key={i}
                    x={Math.random() * W * S}
                    y={Math.random() * (H * 0.6) * S}
                    width={S}
                    height={S}
                    fill={P.stars}
                    className="animate-pulse"
                    style={{ animationDuration: `${2 + Math.random() * 3}s`, opacity: Math.random() }}
                />
            ))}
        </g>
    );
};

const Mountains = () => (
    <path
        d={`M0 ${H * S} L0 ${60 * S} L${30 * S} ${40 * S} L${60 * S} ${65 * S} L${90 * S} ${35 * S} L${130 * S} ${70 * S} L${160 * S} ${50 * S} V${H * S} Z`}
        fill={P.bgMtns}
        opacity="0.8"
    />
);

const MidgroundTrees = () => (
    <g opacity="0.6">
        {[20, 50, 90, 130].map((x, i) => (
            <path
                key={i}
                d={`M${x * S} ${H * S} L${(x + 5) * S} ${50 * S} L${(x + 10) * S} ${H * S} Z`}
                fill={P.bgTrees}
            />
        ))}
    </g>
);

const HeroTreeWithCat = () => {
    return (
        <g transform={`translate(0, 0)`}>
            {/* Trunk */}
            <rect x={-5 * S} y={0} width={25 * S} height={H * S} fill={P.treeBark} />
            <rect x={15 * S} y={0} width={2 * S} height={H * S} fill={P.treeLight} opacity="0.2" /> {/* Rim */}

            {/* Branch */}
            <path d={`M${10 * S} ${40 * S} H${60 * S} L${65 * S} ${42 * S} H${10 * S} Z`} fill={P.treeBark} />

            {/* Leaves hanging */}
            {[20, 35, 50].map((x, i) => (
                <rect key={i} x={x * S} y={42 * S} width={2 * S} height={(5 + i * 2) * S} fill={P.leaves} opacity="0.8" />
            ))}

            {/* Cat */}
            <g transform={`translate(${35 * S}, ${29 * S})`}>
                <PixelGrid data={SPRITE_CAT_SITTING} colors={{}} />
                {/* Tail Animation */}
                <motion.rect
                    x={0} y={9 * S} width={2 * S} height={5 * S} fill={P.cat}
                    style={{ originY: 0 }}
                    animate={{ rotate: [-15, 5, -15] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                />
                {/* Blink */}
                <motion.g animate={{ opacity: [1, 0, 1] }} transition={{ duration: 4, times: [0, 0.95, 1], repeat: Infinity }}>
                    <rect x={6 * S} y={2 * S} width={S} height={S} fill={P.catEyes} />
                    <rect x={9 * S} y={2 * S} width={S} height={S} fill={P.catEyes} />
                </motion.g>
            </g>
        </g>
    );
};

const MushroomAltar = () => {
    return (
        <g transform={`translate(${110 * S}, ${65 * S})`}>
            {/* Stone Base */}
            <rect x={-10 * S} y={12 * S} width={40 * S} height={25 * S} fill={P.groundMid} />
            <rect x={-15 * S} y={12 * S} width={50 * S} height={4 * S} fill="#3f3f46" /> {/* Slab */}

            {/* Mushroom */}
            <g transform={`translate(0, -${13 * S})`}>
                <PixelGrid data={SPRITE_MUSHROOM_GIANT} colors={{}} />
            </g>

            {/* Frog */}
            <motion.g
                transform={`translate(${6 * S}, -${18 * S})`}
                animate={{ y: [0, -1 * S, 0] }} // Breathing
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            >
                <PixelGrid data={SPRITE_FROG} colors={{}} />
            </motion.g>

            {/* Magic Spores */}
            {[...Array(8)].map((_, i) => (
                <motion.rect
                    key={i}
                    x={(Math.random() * 20) * S}
                    y={(-Math.random() * 10) * S}
                    width={S} height={S}
                    fill={P.spore}
                    animate={{ y: [-10 * S, -40 * S], opacity: [0, 1, 0], x: [0, (Math.random() - 0.5) * 20] }}
                    transition={{ duration: 2 + Math.random(), repeat: Infinity, delay: Math.random() * 2 }}
                />
            ))}
        </g>
    );
};

const EntheoForest: React.FC<{ className?: string }> = ({ className }) => {
    return (
        <div className={`relative w-full h-full overflow-hidden ${className}`} style={{ background: 'linear-gradient(to bottom, #0f0518, #2e1065)' }}>

            <svg
                viewBox={`0 0 ${W * S} ${H * S}`}
                className="absolute inset-0 w-full h-full"
                preserveAspectRatio="xMidYMax slice"
                shapeRendering="crispEdges"
            >
                {/* 1. SKY */}
                <defs>
                    <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={P.skyTop} />
                        <stop offset="100%" stopColor={P.skyBot} />
                    </linearGradient>
                </defs>
                <rect width="100%" height="100%" fill="url(#skyGrad)" />
                <StarField />

                {/* MOON */}
                <circle cx={140 * S} cy={20 * S} r={12 * S} fill={P.moonGlow} />
                <circle cx={140 * S} cy={20 * S} r={8 * S} fill={P.moon} />

                {/* 2. BACKGROUND LAYERS */}
                <Mountains />
                <MidgroundTrees />

                {/* 3. GROUND */}
                <rect x={0} y={85 * S} width={W * S} height={15 * S} fill={P.groundDark} />
                {/* Grass texture */}
                {[...Array(20)].map((_, i) => (
                    <rect key={i} x={(i * 8 + Math.random() * 4) * S} y={84 * S} width={S} height={2 * S} fill={P.grass} />
                ))}

                {/* 4. MAIN ACTORS */}
                <MushroomAltar />
                <HeroTreeWithCat />

                {/* 5. ATMOSPHERE (Fog) */}
                <rect x={0} y={70 * S} width={W * S} height={30 * S} fill="url(#fogGrad)" opacity="0.2" />
                <linearGradient id="fogGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="transparent" />
                    <stop offset="100%" stopColor="#22d3ee" />
                </linearGradient>

            </svg>

            {/* Cinematic Grain & Vignette */}
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" />
            <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E")` }} />
        </div>
    );
};

export default EntheoForest;
