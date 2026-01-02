
import { BreathingPattern } from "./types";
import { toltecTechniques } from "./data/techniques/toltec";
import { energyTechniques } from "./data/techniques/energy";
import { relaxTechniques } from "./data/techniques/relax";
import { balanceTechniques } from "./data/techniques/balance";
import { focusTechniques } from "./data/techniques/focus";
import { healthTechniques } from "./data/techniques/health";
import { qigongTechniques } from "./data/techniques/qigong";
import { daoTechniques } from "./data/techniques/dao";
import { transcendenceTechniques } from "./data/techniques/transcendence";

// --- КОНСТАНТЫ UI ---

export const CATEGORY_NAMES: Record<string, string> = {
  Calm: 'Спокойствие',
  Energy: 'Энергия',
  Balance: 'Баланс',
  Sleep: 'Сон',
  Focus: 'Фокус',
  Health: 'Здоровье',
  Transcendence: 'Трансценденция',
  Toltec: 'Магия Тольтеков',
  Qigong: 'Цигун',
  Tao: 'ДАО Система'
};

export const CATEGORY_ICONS: Record<string, string> = {
  Calm: 'spa',
  Energy: 'fire',
  Balance: 'balance-scale',
  Sleep: 'moon',
  Focus: 'crosshairs',
  Health: 'heartbeat',
  Transcendence: 'om',
  Toltec: 'crow',
  Qigong: 'yin-yang',
  Tao: 'leaf'
};

// --- CONTENT ---
export const PHILOSOPHY_CONTENT = `
# Заветы Дыхания и Энергии

Согласно многим духовным и оздоровительным системам (включая метод К.П. Бутейко), **уменьшение дыхания** и накопление энергии — ключ к здоровью и долголетию.

### 1. Периодическая депривация сна
Некоторые исследования показывают, что кратковременная осознанная депривация сна может стимулировать определенные резервные процессы в организме, улучшать когнитивные функции и повышать уровень энергии после восстановления. 
*Важно: Соблюдайте баланс, не во вред здоровью.*

### 2. Питание и Энергия
*   **Животная пища:** Если человек не занимается активным спортом, тяжелая пища требует огромных затрат энергии на переваривание, что ведет к усталости и увеличению потребности во сне.
*   **Растительная пища:** Легче усваивается, дает "чистую" энергию и может уменьшить потребность в длительном сне.

### 3. Физическая активность
Регулярные упражнения учат организм эффективно расходовать и восстанавливать энергию. Это помогает легче переносить стрессы и меньше спать без потери качества жизни.

### 4. Утечки Энергии
Высокий уровень стресса, эмоциональные всплески, гнев, чрезмерная половая активность (потеря семени) и пустые разговоры заставляют сердце биться чаще, а дыхание — становиться частым и глубоким. Это "сливает" жизненную силу.

### 5. Метод Вима Хофа
Сочетает **гипервентиляцию** (насыщение кислородом) и **гипоксию** (накопление CO2 и адаптация к стрессу), плюс холод. Это тренировка сосудов и митохондрий.

### 6. Метод Бутейко
*   **Суть:** "Дыши меньше, чтобы жить дольше".
*   **Цель:** Нормализация уровня углекислого газа (CO2). Именно CO2 необходим, чтобы кислород оторвался от гемоглобина и перешел в клетки (Эффект Вериго-Бора). Глубокое дыхание вымывает CO2, вызывая кислородное голодание клеток.

### 7. Анулома-Вилома
Балансирует "Солнечный" (горячий) и "Лунный" (холодный) каналы. Успокаивает ум, что автоматически делает дыхание поверхностным и эффективным.

### 8. Закаливание
Холодная вода — мощнейший адаптоген. Она учит тело не реагировать на стресс выбросом кортизола, а сохранять спокойствие.

---

**[Love: Канал о любви и осознанности](https://t.me/loveisalllove)**
*(Голодание, дыхание, религии, закаливание)*
`;

// --- SHORT URL MAPPING (SLUGS) ---
export const URL_SLUGS: Record<string, string> = {
    // Energy
    'wim-hof-session': 'wh',
    'tummo': 'tm',
    'kapalabhati': 'kb',
    'bhastrika': 'bs',
    'surya-bhedana': 'sb',
    'ujjayi': 'uj',
    
    // Relax
    '4-7-8': '478',
    'chandra-bhedana': 'cb',
    'sitkari': 'sk',
    'udgeeth': 'om',
    '7-11': '711',
    'bhramari': 'bee',
    'sitali': 'sl',

    // Balance
    'anuloma-viloma-base': 'anu', // Was 'av', changed to 'anu' per request
    'nadi-shodhana': 'ns',
    'coherent': 'co',
    'dirga-pranayama': 'dp',
    'sama-vritti': 'sv',
    'kaki-mudra': 'km',

    // Focus
    'box-breathing': 'box',
    'viloma': 'vl',
    'triangle': 'tri',
    'murcha': 'mu',
    'simhasana': 'sim',

    // Health
    'buteyko': 'vlgd',
    'pursed-lip': 'pl',
    'vrajana': 'walk',
    'kumbhaka-training': 'co2',

    // Qigong
    'qigong-ba-duan-jin': 'q8',
    'qigong-wu-qin-xi': 'q5',
    'qigong-yi-jin-jing': 'qjj',
    'qigong-zhan-zhuang': 'zz',
    'qigong-liu-zi-jue': 'q6',
    'qigong-xiao-zhou-tian': 'mco',

    // Toltec
    'toltec-recapitulation': 'rc',
    'toltec-pass-35': 'tp35',
    'toltec-pass-36': 'tp36',
    'toltec-pass-37': 'tp37',
    'toltec-infinity': 'inf',
    'toltec-decision-center': 'tdc',

    // Tao
    'tao-inner-smile': 'is',
    'tao-turtle-breathing': 'ttr',
    'tao-deer-breathing': 'tdr',
    'tao-bone-marrow': 'tbm',
    'tao-dantian-breathing': 'dt',
    'tao-wu-ji': 'wj',
    'tao-spinal-cord': 'tsc',
    'tao-iron-shirt-packing': 'isp',
    'tao-soles-breathing': 'tsb',
    'tao-macrocosmic': 'mac',

    // Transcendence
    'holotropic': 'holo'
};

export const REVERSE_SLUGS: Record<string, string> = Object.fromEntries(
    Object.entries(URL_SLUGS).map(([k, v]) => [v, k])
);

// --- MAIN LIST AGGREGATION ---

export const DEFAULT_PATTERNS: BreathingPattern[] = [
  ...energyTechniques,      // 1. Энергия (Теперь первая)
  ...relaxTechniques,       // 2. Спокойствие/Сон
  ...balanceTechniques,     // 3. Баланс
  ...focusTechniques,       // 4. Фокус
  ...healthTechniques,      // 5. Здоровье
  ...qigongTechniques,      // 6. Цигун
  ...toltecTechniques,      // 7. Магия Тольтеков (Спустили вниз)
  ...daoTechniques,         // 8. ДАО
  ...transcendenceTechniques // 9. Трансценденция
];
