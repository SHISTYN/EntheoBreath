
import React, { useState, useMemo } from 'react';
import { BreathingPattern } from '../types';
import { DEFAULT_PATTERNS, CATEGORY_NAMES, CATEGORY_ICONS } from '../constants';
import TechniqueCard from './library/TechniqueCard';
import LibraryHeader from './library/LibraryHeader';
import { Heart, Wind, Zap } from 'lucide-react';
import GlassCard from './ui/GlassCard';

// High Impact Techniques selected by Author (Ordered)
const POWER_PACK_IDS = [
    'wim-hof-session',     // 1. The King
    'anuloma-viloma-base', // 2. Balance King
    'buteyko',             // 3. Health King
    'toltec-recapitulation', // 4. Magic King
    '4-7-8',               // 5. Sleep King
];

// English → Russian search aliases for international users
const ENGLISH_ALIASES: Record<string, string[]> = {
    'box': ['квадратное', 'box-breathing'],
    'wim hof': ['вим хоф', 'wim-hof'],
    'buteyko': ['бутейко'],
    'tummo': ['туммо', 'внутренний огонь'],
    'holotropic': ['холотропное'],
    'pranayama': ['пранаяма'],
    'kapalabhati': ['капалабхати'],
    'ujjayi': ['уджайи'],
    'bhastrika': ['бхастрика'],
    'nadi shodhana': ['нади шодхана'],
    'anuloma': ['анулома'],
    'coherent': ['когерентное'],
    '4-7-8': ['4-7-8'],
    'qigong': ['цигун'],
    'tao': ['дао', 'даосск'],
    'toltec': ['толтек'],
};

interface LibraryViewProps {
    selectPattern: (p: BreathingPattern) => void;
    favorites: string[];
    toggleFavorite: (id: string) => void;
    isPro: boolean;
    onShowPaywall: () => void;
}

const LibraryView: React.FC<LibraryViewProps> = ({ selectPattern, favorites, toggleFavorite, isPro, onShowPaywall }) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [selectedTag, setSelectedTag] = useState<string | null>(null);

    // Memoize filtering
    const filteredGroupedPatterns = useMemo(() => {
        let patterns = DEFAULT_PATTERNS;

        // 1. Tag Filter
        if (selectedTag) {
            const QUICK_FILTERS_MAP: Record<string, string[]> = {
                'wakeup': ['wakeup', 'power', 'morning'],
                'focus': ['focus', 'work', 'study', 'brain'],
                'sleep': ['sleep', 'insomnia'],
                'panic': ['panic', 'anxiety', 'stress'],
                'energy-return': ['energy-return', 'clearing']
            };
            const targetTags = QUICK_FILTERS_MAP[selectedTag] || [selectedTag];
            patterns = patterns.filter(p =>
                p.tags && p.tags.some(t => targetTags.includes(t))
            );
        }

        // 2. Search Filter (with English aliases support)
        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();

            // Get Russian aliases for English terms
            const aliasQueries: string[] = [lowerQuery];
            for (const [eng, rus] of Object.entries(ENGLISH_ALIASES)) {
                if (lowerQuery.includes(eng)) {
                    aliasQueries.push(...rus);
                }
            }

            patterns = patterns.filter(p =>
                aliasQueries.some(q =>
                    p.name.toLowerCase().includes(q) ||
                    p.description.toLowerCase().includes(q) ||
                    p.category.toLowerCase().includes(q) ||
                    p.id.toLowerCase().includes(q) ||
                    (p.tags && p.tags.some(t => t.toLowerCase().includes(q)))
                )
            );
        }

        // 3. Category Filter
        if (selectedTag === null) {
            if (selectedCategory === 'Favorites') {
                patterns = patterns.filter(p => favorites.includes(p.id));
            } else if (selectedCategory === 'AuthorChoice') {
                patterns = patterns.filter(p => POWER_PACK_IDS.includes(p.id));
                patterns.sort((a, b) => {
                    return POWER_PACK_IDS.indexOf(a.id) - POWER_PACK_IDS.indexOf(b.id);
                });
                return { 'AuthorChoice': patterns };
            } else if (selectedCategory !== 'All') {
                patterns = patterns.filter(p => p.category === selectedCategory);
            }
        }

        // 4. Group by Category (Default behavior)
        return patterns.reduce((acc, pattern) => {
            if (!acc[pattern.category]) acc[pattern.category] = [];
            acc[pattern.category].push(pattern);
            return acc;
        }, {} as Record<string, BreathingPattern[]>);
    }, [searchQuery, selectedCategory, favorites, selectedTag]);

    // HANDLERS FOR MUTUAL EXCLUSIVITY
    const handleCategoryChange = (cat: string) => {
        setSelectedCategory(cat);
        setSelectedTag(null);
    };

    const handleTagSelect = (tag: string | null) => {
        setSelectedTag(tag);
        if (tag) {
            setSelectedCategory('All');
        }
    };

    return (
        <div className="animate-fade-in px-4 py-8 md:p-10 pb-0 min-h-full">
            <div className="max-w-[1600px] mx-auto">

                <LibraryHeader
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    selectedCategory={selectedCategory}
                    onCategoryChange={handleCategoryChange}
                    totalCount={DEFAULT_PATTERNS.length}
                    selectedTag={selectedTag}
                    onTagSelect={handleTagSelect}
                />

                {/* UX EXPLANATION FOR AUTHOR CHOICE */}
                {selectedCategory === 'AuthorChoice' && !selectedTag && (
                    <div className="max-w-3xl mx-auto mb-12 text-center animate-fade-in mt-8">
                        <GlassCard variant="heavy" className="inline-block p-6 rounded-3xl shadow-[0_0_30px_rgba(245,158,11,0.1)] border-amber-500/20">
                            <div className="flex items-center justify-center gap-2 mb-2">
                                <Zap className="text-amber-500" size={20} />
                                <h3 className="text-xl font-display font-bold text-amber-500">Золотой Стандарт</h3>
                            </div>
                            <p className="text-amber-800 dark:text-amber-200 font-medium text-sm md:text-base leading-relaxed opacity-80">
                                "Эти 5 практик дают 80% результата за 20% усилий. Если у вас мало времени — делайте только их."
                            </p>
                        </GlassCard>
                    </div>
                )}

                {/* GRID SECTION */}
                <div className="space-y-16 mt-8">
                    {(Object.entries(filteredGroupedPatterns) as [string, BreathingPattern[]][]).map(([category, patterns], catIdx) => (
                        <div key={category} className="animate-fade-in-up" style={{ animationDelay: `${catIdx * 100}ms` }}>

                            {/* Category Title - Hide for AuthorChoice as we have a custom header above */}
                            {category !== 'AuthorChoice' && (
                                <div className="flex items-center gap-4 mb-8 px-2">
                                    <div className="w-10 h-10 rounded-xl bg-cyan-100/50 dark:bg-white/5 flex items-center justify-center border border-cyan-200/50 dark:border-white/5 text-cyan-600 dark:text-zen-accent text-lg shadow-sm backdrop-blur-sm">
                                        <i className={`fas fa-${CATEGORY_ICONS[category] || 'wind'}`}></i>
                                    </div>
                                    <h3 className="text-2xl font-display font-bold text-gray-900 dark:text-white tracking-tight">
                                        {CATEGORY_NAMES[category] || category}
                                    </h3>
                                </div>
                            )}

                            {/* Cards Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {patterns.map((p) => {
                                    // 🔒 PREMIUM LOGIC
                                    // Lock 'wim-hof-session' (King), 'buteyko', 'tummo'
                                    const LOCKED_IDS = ['wim-hof-session', 'buteyko', 'tummo-inner-fire'];
                                    const isLocked = !isPro && LOCKED_IDS.includes(p.id);

                                    return (
                                        <TechniqueCard
                                            key={p.id}
                                            pattern={p}
                                            onClick={() => isLocked ? onShowPaywall() : selectPattern(p)}
                                            isFavorite={favorites.includes(p.id)}
                                            onToggleFavorite={toggleFavorite}
                                            searchQuery={searchQuery}
                                            isLocked={isLocked}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    ))}

                    {Object.keys(filteredGroupedPatterns).length === 0 && (
                        <div className="text-center py-20 opacity-50 flex flex-col items-center">
                            {selectedCategory === 'Favorites' ? (
                                <>
                                    <Heart size={48} className="mb-4 text-gray-400 stroke-1" />
                                    <p className="text-xl font-display">У вас пока нет любимых техник</p>
                                    <p className="text-sm mt-2">Добавляйте техники в избранное, нажимая на сердечко</p>
                                </>
                            ) : (
                                <>
                                    <Wind size={48} className="mb-4 text-gray-400 stroke-1" />
                                    <p className="text-xl font-display">Техники не найдены</p>
                                    <p className="text-sm mt-2">Попробуйте изменить фильтры или поиск</p>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* FOOTER - STEALTH LINKS */}
            <footer className="mt-8 pb-[calc(1rem+env(safe-area-inset-bottom))] text-center animate-fade-in text-gray-500 dark:text-gray-500 pt-2">
                <div className="flex flex-col items-center gap-6">
                    <div className="text-xs font-bold tracking-[0.2em] opacity-70 uppercase flex items-center gap-2">
                        СОЗДАНО С
                        <a
                            href="https://t.me/+D78P1fpaduBlOTc6"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block transition-transform hover:scale-110 cursor-pointer group"
                            title="Love Is All Love"
                        >
                            <Heart size={14} className="text-orange-500 fill-orange-500 animate-pulse group-hover:scale-125 transition-transform" />
                        </a>
                        — <a href="https://t.me/nikolaiovchinnikov" target="_blank" rel="noopener noreferrer" className="text-cyan-600 dark:text-cyan-400 hover:text-cyan-300 transition-colors border-b border-transparent hover:border-cyan-500 cursor-pointer">НИКОЛАЙ ОВЧИННИКОВ</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LibraryView;
