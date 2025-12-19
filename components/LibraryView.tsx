import React, { useState, useMemo } from 'react';
import { BreathingPattern } from '../types';
import { DEFAULT_PATTERNS, CATEGORY_NAMES, CATEGORY_ICONS } from '../constants';
import TechniqueCard from './library/TechniqueCard';
import LibraryHeader from './library/LibraryHeader';

// High Impact Techniques selected by Author (Ordered)
const POWER_PACK_IDS = [
    'wim-hof-session',     // 1. The King
    'anuloma-viloma-base', // 2. Balance King
    'buteyko',             // 3. Health King
    'toltec-recapitulation', // 4. Magic King
    '4-7-8',               // 5. Sleep King
];

interface LibraryViewProps {
    selectPattern: (p: BreathingPattern) => void;
    favorites: string[];
    toggleFavorite: (id: string) => void;
}

const LibraryView: React.FC<LibraryViewProps> = ({ selectPattern, favorites, toggleFavorite }) => {
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
                'sleep': ['sleep', 'insomnia'],
                'panic': ['panic', 'anxiety', 'stress'],
                'energy-return': ['energy-return', 'clearing']
            };
            const targetTags = QUICK_FILTERS_MAP[selectedTag] || [selectedTag];
            patterns = patterns.filter(p => 
                p.tags && p.tags.some(t => targetTags.includes(t))
            );
        }

        // 2. Search Filter
        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            patterns = patterns.filter(p => 
                p.name.toLowerCase().includes(lowerQuery) || 
                p.description.toLowerCase().includes(lowerQuery) ||
                p.category.toLowerCase().includes(lowerQuery) ||
                (p.tags && p.tags.some(t => t.toLowerCase().includes(lowerQuery)))
            );
        }

        // 3. Category Filter & Special Sort Logic
        if (selectedCategory === 'Favorites') {
            patterns = patterns.filter(p => favorites.includes(p.id));
        } else if (selectedCategory === 'AuthorChoice') {
            // Filter
            patterns = patterns.filter(p => POWER_PACK_IDS.includes(p.id));
            // Sort strictly by the POWER_PACK_IDS order
            patterns.sort((a, b) => {
                return POWER_PACK_IDS.indexOf(a.id) - POWER_PACK_IDS.indexOf(b.id);
            });
            // Return as a SINGLE group to avoid scattering them across original categories
            return { 'AuthorChoice': patterns };
        } else if (selectedCategory !== 'All') {
            patterns = patterns.filter(p => p.category === selectedCategory);
        }

        // 4. Group by Category (Default behavior)
        return patterns.reduce((acc, pattern) => {
            if (!acc[pattern.category]) acc[pattern.category] = [];
            acc[pattern.category].push(pattern);
            return acc;
        }, {} as Record<string, BreathingPattern[]>);
    }, [searchQuery, selectedCategory, favorites, selectedTag]);

    return (
        <div className="animate-fade-in px-4 py-8 md:p-10 pb-32">
            <div className="max-w-[1600px] mx-auto">
                
                <LibraryHeader 
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    selectedCategory={selectedCategory}
                    onCategoryChange={setSelectedCategory}
                    totalCount={DEFAULT_PATTERNS.length}
                    selectedTag={selectedTag}
                    onTagSelect={(tag) => {
                        setSelectedTag(tag);
                        if (tag) setSelectedCategory('All'); 
                    }}
                />

                {/* UX EXPLANATION FOR AUTHOR CHOICE */}
                {selectedCategory === 'AuthorChoice' && (
                    <div className="max-w-3xl mx-auto mb-12 text-center animate-fade-in">
                        <div className="inline-block p-6 rounded-3xl bg-gradient-to-br from-amber-500/10 to-orange-600/10 border border-amber-500/20 backdrop-blur-md shadow-[0_0_30px_rgba(245,158,11,0.1)]">
                            <h3 className="text-xl font-display font-bold text-amber-500 mb-2">Золотой Стандарт</h3>
                            <p className="text-amber-800 dark:text-amber-200 font-medium text-sm md:text-base leading-relaxed opacity-80">
                                "Эти 5 практик дают 80% результата за 20% усилий. Если у вас мало времени — делайте только их."
                            </p>
                        </div>
                    </div>
                )}
                
                {/* GRID SECTION */}
                <div className="space-y-12">
                    {Object.entries(filteredGroupedPatterns).map(([category, patterns], catIdx) => (
                        <div key={category} className="animate-fade-in-up" style={{ animationDelay: `${catIdx * 100}ms` }}>
                            
                            {/* Category Title - Hide for AuthorChoice as we have a custom header above */}
                            {category !== 'AuthorChoice' && (
                                <div className="flex items-center gap-4 mb-6 px-2">
                                    <div className="w-10 h-10 rounded-xl bg-cyan-100/50 dark:bg-white/5 flex items-center justify-center border border-cyan-200/50 dark:border-white/5 text-cyan-600 dark:text-zen-accent text-lg shadow-sm backdrop-blur-sm">
                                        <i className={`fas fa-${CATEGORY_ICONS[category] || 'wind'}`}></i>
                                    </div>
                                    <h3 className="text-2xl font-display font-bold text-gray-900 dark:text-white tracking-tight">
                                        {CATEGORY_NAMES[category] || category}
                                    </h3>
                                </div>
                            )}
                            
                            {/* Cards Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                                {patterns.map((p) => (
                                    <TechniqueCard 
                                        key={p.id} 
                                        pattern={p} 
                                        onClick={() => selectPattern(p)}
                                        isFavorite={favorites.includes(p.id)}
                                        onToggleFavorite={toggleFavorite}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}

                    {Object.keys(filteredGroupedPatterns).length === 0 && (
                        <div className="text-center py-20 opacity-50 flex flex-col items-center">
                            {selectedCategory === 'Favorites' ? (
                                <>
                                    <i className="fas fa-heart-broken text-4xl mb-4 text-gray-400"></i>
                                    <p className="text-xl font-display">У вас пока нет любимых техник</p>
                                    <p className="text-sm mt-2">Добавляйте техники в избранное, нажимая на сердечко</p>
                                </>
                            ) : (
                                <>
                                    <i className="fas fa-wind text-4xl mb-4 text-gray-400"></i>
                                    <p className="text-xl font-display">Техники не найдены</p>
                                    <p className="text-sm mt-2">Попробуйте изменить фильтры или поиск</p>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
            
            {/* FOOTER */}
            <footer className="mt-24 pb-10 text-center animate-fade-in text-gray-500 dark:text-gray-500 border-t border-gray-100 dark:border-white/5 pt-10">
                <div className="flex flex-col items-center gap-6">
                    <div className="text-sm font-bold tracking-[0.1em] opacity-70">
                        СОЗДАНО С 
                        <a 
                            href="https://t.me/+D78P1fpaduBlOTc6" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-block mx-1 align-middle cursor-default"
                        >
                            <span className="text-rose-500 animate-pulse text-lg">❤️</span>
                        </a> 
                        — <a href="https://t.me/nikolaiovchinnikov" target="_blank" rel="noopener noreferrer" className="text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 transition-colors border-b border-transparent hover:border-cyan-500">НИКОЛАЙ ОВЧИННИКОВ</a>
                    </div>
                    <a 
                        href="https://t.me/nikolaiovchinnikov" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white dark:bg-[#1c1c1e] border border-gray-200 dark:border-white/10 hover:border-cyan-500 dark:hover:border-cyan-500 hover:scale-105 transition-all text-xs font-bold uppercase tracking-widest shadow-lg"
                    >
                        <i className="fab fa-telegram-plane text-cyan-500 text-lg"></i>
                        Предложения и обратная связь
                    </a>
                </div>
            </footer>
        </div>
    );
};

export default LibraryView;