import { GoogleGenAI, Modality } from "@google/genai";

const getClient = () => {
    // Support both standard process.env (local/node) and Vite's import.meta.env (production/web)
    const apiKey = process.env.API_KEY || (import.meta as any).env?.VITE_API_KEY;
    
    if (!apiKey) {
        console.error("API Key is missing. Make sure to set API_KEY or VITE_API_KEY in your environment variables.");
        throw new Error("API Key not found");
    }
    return new GoogleGenAI({ apiKey });
};

export const getBreathingAnalysis = async (exerciseName: string, pattern: string): Promise<string> => {
    try {
        const ai = getClient();
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Проведи глубокий, всесторонний анализ дыхательной техники: "${exerciseName}" (Паттерн: ${pattern}). 
            Включи исторические корни (Пранаяма, если применимо), физиологические преимущества, ментальную пользу и подробные советы по правильному выполнению.
            Используй Google Search для поиска самых точных и свежих научных исследований или культурного контекста.
            Отвечай на русском языке, используй красивое форматирование Markdown.`,
            config: {
                tools: [{ googleSearch: {} }],
                systemInstruction: "Ты — эксперт по пранаяме и дыхательным практикам. Будь вдохновляющим, подробным и научным. Отвечай только на русском языке.",
            },
        });

        // Handle grounding chunks if present, but primarily return the text
        const text = response.text || "Не удалось сгенерировать анализ.";
        
        // Append source links if available
        const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
        let sources = "";
        if (chunks) {
            const links = chunks
                .map((c: any) => c.web?.uri ? `[${c.web.title}](${c.web.uri})` : "")
                .filter((l: string) => l !== "")
                .join("\n");
            if (links) sources = `\n\n**Источники:**\n${links}`;
        }

        return text + sources;
    } catch (error) {
        console.error("Analysis failed", error);
        return "Не удалось получить анализ. Проверьте квоты API или интернет-соединение.";
    }
};

export const generateVoiceGuidance = async (text: string): Promise<string | null> => {
    try {
        const ai = getClient();
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Kore' }, 
                    },
                },
            },
        });

        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (base64Audio) {
            return `data:audio/wav;base64,${base64Audio}`;
        }
        return null;
    } catch (error) {
        console.error("TTS failed", error);
        return null;
    }
};

export const askChatbot = async (query: string): Promise<string> => {
     try {
        const ai = getClient();
        const response = await ai.models.generateContent({
            model: "gemini-3-pro-preview", 
            contents: query,
            config: {
                 systemInstruction: "Ты — полезный тренер по дыханию. Отвечай на вопросы о мобильном приложении, техниках дыхания и здоровье на русском языке.",
            }
        });
        return response.text || "Я не понял запрос.";
     } catch (e) {
         console.error(e);
         return "Ошибка подключения к AI.";
     }
}