
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT_FILE = path.join(__dirname, '../data/changelog-auto.json');

const TYPE_MAP = {
    feat: { icon: '✨', label: 'Функционал', priority: 10 },
    fix: { icon: '🐞', label: 'Исправления', priority: 5 },
    ui: { icon: '🎨', label: 'Дизайн', priority: 8 },
    style: { icon: '🎨', label: 'Стиль', priority: 4 },
    perf: { icon: '⚡', label: 'Скорость', priority: 9 },
    refactor: { icon: '🧹', label: 'Код', priority: 3 },
    docs: { icon: '📝', label: 'Доки', priority: 2 },
    chore: { icon: '🔧', label: 'Система', priority: 1 },
    build: { icon: '📦', label: 'Сборка', priority: 1 },
    ci: { icon: '🤖', label: 'CI/CD', priority: 1 },
    default: { icon: '🔨', label: 'Другое', priority: 0 }
};

function formatDate(dateStr) {
    const date = new Date(dateStr);
    const months = ['ЯНВ', 'ФЕВ', 'МАР', 'АПР', 'МАЙ', 'ИЮН', 'ИЮЛ', 'АВГ', 'СЕН', 'ОКТ', 'НОЯ', 'ДЕК'];
    return `${date.getDate()} ${months[date.getMonth()]}`; // e.g., 30 ДЕК
}

function generateChangelog() {
    console.log('🔄 Генерация истории изменений (RU)...');
    try {
        // Get git log
        const logOutput = execSync('git log --pretty=format:"%h|%an|%ad|%s" --date=short -n 100', { encoding: 'utf8' });

        if (!logOutput) {
            if (!fs.existsSync(OUTPUT_FILE)) fs.writeFileSync(OUTPUT_FILE, '[]');
            return;
        }

        const lines = logOutput.split('\n');
        const updatesByDate = {};
        const processedMessages = new Set();

        lines.forEach(line => {
            const parts = line.split('|');
            if (parts.length < 4) return;

            const [hash, author, date, ...msgParts] = parts;
            let message = msgParts.join('|');

            // Skip merge commits
            if (message.startsWith('Merge')) return;
            // Deduplicate exact messages
            if (processedMessages.has(message)) return;
            processedMessages.add(message);

            if (!updatesByDate[date]) {
                updatesByDate[date] = {
                    date,
                    version: formatDate(date),
                    changes: [],
                    raw: []
                };
            }

            // Detect Type
            let typeKey = 'default';
            const lower = message.toLowerCase();
            const conventionMatch = message.match(/^([a-z]+)(\(.*\))?: (.+)$/);

            if (conventionMatch) {
                const t = conventionMatch[1];
                if (t === 'add' || t === 'new') typeKey = 'feat';
                else if (t === 'update') typeKey = 'chore';
                else if (TYPE_MAP[t]) typeKey = t;

                message = conventionMatch[3];
            } else {
                if (lower.includes('fix')) typeKey = 'fix';
                else if (lower.includes('feat') || lower.includes('add') || lower.includes('new')) typeKey = 'feat';
                else if (lower.includes('ui') || lower.includes('css') || lower.includes('style')) typeKey = 'ui';
                else if (lower.includes('perf')) typeKey = 'perf';
                else if (lower.includes('refactor')) typeKey = 'refactor';
            }

            // Translate basic English terms if they appear at start (Auto-Translate attempt)
            message = message.replace(/^Add /, 'Добавлено: ')
                .replace(/^Update /, 'Обновлено: ')
                .replace(/^Fix /, 'Исправлено: ')
                .replace(/^Remove /, 'Удалено: ');

            // Capitalize
            message = message.charAt(0).toUpperCase() + message.slice(1);

            updatesByDate[date].raw.push({ typeKey, text: message, hash });
        });

        // Consolidate Logic
        const finalChangelog = Object.values(updatesByDate)
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .map(entry => {
                const changes = [];
                const groups = { feat: [], ui: [], fix: [], other: [] };

                entry.raw.forEach(item => {
                    if (item.typeKey === 'feat' || item.typeKey === 'perf') groups.feat.push(item);
                    else if (item.typeKey === 'ui') groups.ui.push(item);
                    else if (item.typeKey === 'fix') groups.fix.push(item);
                    else groups.other.push(item);
                });

                // 1. Feat & UI - Always show details (up to 5)
                [...groups.feat, ...groups.ui].forEach(item => {
                    const typeDef = TYPE_MAP[item.typeKey] || TYPE_MAP.default;
                    changes.push({ type: typeDef, text: item.text, hash: item.hash });
                });

                // 2. Fixes - Consolidate if too many
                if (groups.fix.length > 2) {
                    changes.push({
                        type: TYPE_MAP.fix,
                        text: `Исправлено ${groups.fix.length} ошибок и недочетов`,
                        hash: groups.fix[0].hash
                    });
                } else {
                    groups.fix.forEach(item => {
                        changes.push({ type: TYPE_MAP.fix, text: item.text, hash: item.hash });
                    });
                }

                // 3. Others (Refactor, Chore) - Consolidate if exists
                if (groups.other.length > 0) {
                    changes.push({
                        type: TYPE_MAP.refactor,
                        text: `Оптимизация кода и системные задачи (${groups.other.length})`,
                        hash: groups.other[0].hash
                    });
                }

                return {
                    date: entry.date,
                    version: entry.version,
                    changes: changes
                };
            });

        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(finalChangelog, null, 2));
        console.log(`✅ Changelog generated: ${finalChangelog.length} days`);
    } catch (e) {
        console.error('Generation failed:', e.message);
        if (!fs.existsSync(OUTPUT_FILE)) fs.writeFileSync(OUTPUT_FILE, '[]');
    }
}

generateChangelog();
