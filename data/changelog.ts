
export interface Release {
    version: string;
    date: string;
    title: string;
    features: {
        type: 'new' | 'fix' | 'polish' | 'magic' | 'audio' | 'perf';
        text: string;
    }[];
}

export const CURRENT_VERSION = '1.3.0';

export const CHANGELOG: Release[] = [
    {
        version: '1.3.0',
        date: '02 Янв',
        title: 'Liquid Glass & Zen',
        features: [
            { type: 'magic', text: 'Changelog 2.0: Полный редизайн окна "Что нового" (Liquid Glass).' },
            { type: 'fix', text: 'Portal Rendering: Исправлено центрирование модальных окон.' },
            { type: 'new', text: 'Zen Mode: Полное скрытие интерфейса для фокусировки.' },
            { type: 'polish', text: 'HUD Таймера: Компактный и читаемый дизайн оверлея.' },
            { type: 'fix', text: 'Adaptive: Улучшено отображение на мобильных устройствах.' }
        ]
    },
    {
        version: '1.2.0',
        date: '26 Дек',
        title: 'Wim Hof & Audio Engine',
        features: [
            { type: 'magic', text: 'Visualizer: Гексагональный таймер для метода Вима Хофа.' },
            { type: 'audio', text: 'Crystal Bowls: Генеративный оркестр поющих чаш (Tone.js).' },
            { type: 'new', text: 'YouTube Guide: Встроенные видео-гайды с обходом блокировок.' }
        ]
    },
    {
        version: '1.1.0',
        date: '20 Дек',
        title: 'Атмосфера и Звук',
        features: [
            { type: 'audio', text: 'Binaural Beats: Генератор Тета и Альфа волн.' },
            { type: 'audio', text: 'Nature Sounds: Процедурный ветер и шум.' },
            { type: 'polish', text: 'Sound Menu: Новое меню управления слоями звука.' }
        ]
    },
    {
        version: '1.0.0',
        date: '15 Дек',
        title: 'Релиз PWA & Библиотека',
        features: [
            { type: 'new', text: 'PWA: Полноценная установка на iOS и Android.' },
            { type: 'new', text: 'Библиотека: Умный поиск, теги и категории состояний.' },
            { type: 'perf', text: 'Optimization: Быстрая загрузка и плавные переходы.' }
        ]
    }
];
