

// const axios = require('axios');
// const { CohereClient } = require('cohere-ai');
// require('dotenv').config();

// // Contact du créateur pour logs
// const CREATOR_CONTACT = '24106813542@s.whatsapp.net';

// // Gestion multi-clés depuis le .env
// const GEMINI_KEYS = process.env.GEMINI_API_KEYS.split(',').filter(Boolean);
// const COHERE_KEYS = process.env.CO_API_KEY.split(',').filter(Boolean);

// const blockedGeminiKeys = {};
// const blockedCohereKeys = {};
// const BLOCK_TIME = 5 * 60 * 1000; // 5 minutes

// // ---------- FONCTION SUPPRIMER LES EMOJIS ----------
// function removeEmojis(text) {
//     return text.replace(
//         /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|\uD83E[\uDD00-\uDDFF])/g,
//         ''
//     ).trim();
// }

// // ---------- LOG VERS LE CRÉATEUR ----------
// async function sendLogToCreator(message) {
//     console.log(`[LOG vers créateur] ${message}`);
//     // Intégrer ici l'envoi réel WhatsApp si nécessaire
// }

// // ---------- SYSTEM PROMPT ----------
// function getSystemPrompt(isCreator, isAudio = false) {
//     let basePrompt = `
// Vous êtes Aquila Bot, créé par Essoya le prince myènè.
// Assistant WhatsApp amical et drôle.
// ${isCreator ? "Adressez-vous à l'utilisateur comme 'Mon créateur'." 
//             : "Adressez-vous de manière amicale et expressive."}
// Répondez de manière concise et percutante.
// `;

//     if (isAudio) basePrompt += " N'utilisez pas d'emojis dans vos réponses.";

//     if (!isCreator && !isAudio && Math.random() < 0.5) {
//         basePrompt += " Vous pouvez proposer à l'utilisateur de taper la commande (.menu) pour afficher le menu ou (.catalogue) pour afficher les réalisations de votre maître.";
//     }

//     return basePrompt;
// }

// // ---------- FONCTION COHERE ----------
// async function askCohereFallback(question, sender, isAudio = false) {
//     if (isAudio) {
//         const text = "Je ne peux pas lire les notes vocales pour le moment, réessayez plus tard.";
//         await sendLogToCreator(`[Cohere] Réponse audio envoyée à ${sender}: ${text}`);
//         return text;
//     }

//     const now = Date.now();
//     const isCreator = sender === CREATOR_CONTACT;
//     const prompt = `${getSystemPrompt(isCreator)}\nQuestion: ${question}`;

//     for (const key of COHERE_KEYS) {
//         if (blockedCohereKeys[key] && blockedCohereKeys[key] > now) continue;

//         try {
//             const cohere = new CohereClient({ apiKey: key });
//             const response = await cohere.chat({
//                 model: "command-xlarge-nightly",
//                 message: prompt
//             });

//             const text = response.text || 'Désolé, je n’ai pas compris.';
//             await sendLogToCreator(`[Cohere] Réponse envoyée à ${sender}: ${text}`);
//             return text;

//         } catch (err) {
//             console.error(`[Cohere] Erreur avec clé ${key}:`, err.message);
//             blockedCohereKeys[key] = now + BLOCK_TIME;
//         }
//     }

//     return 'Toutes les clés Cohere ont échoué.';
// }

// // ---------- FONCTION GEMINI ----------
// async function askGemini(question, sender, audioData = null) {
//     const now = Date.now();
//     const isCreator = sender === CREATOR_CONTACT;
//     const isAudio = !!audioData;

//     const systemPrompt = getSystemPrompt(isCreator, isAudio);
//     const parts = [{ text: systemPrompt }];
//     if (audioData) {
//         // On ne retranscrit pas pour l'utilisateur, juste on demande à Gemini de répondre
//         parts.push({ text: "Répondez directement à l'audio fourni sans le retranscrire pour l'utilisateur." });
//         parts.push({ inline_data: { mime_type: "audio/ogg", data: audioData.toString('base64') } });
//     } else {
//         parts.push({ text: question });
//     }

//     for (const key of GEMINI_KEYS) {
//         if (blockedGeminiKeys[key] && blockedGeminiKeys[key] > now) continue;

//         try {
//             const response = await axios.post(
//                 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
//                 { contents: [{ parts }] },
//                 { headers: { 'X-goog-api-key': key, 'Content-Type': 'application/json' } }
//             );

//             let text = response.data.candidates?.[0]?.content?.parts?.[0]?.text || '';

//             if (isAudio) text = removeEmojis(text);

//             if (text) {
//                 await sendLogToCreator(`[Gemini] Réponse envoyée à ${sender}: ${text}`);
//                 return text;
//             }

//         } catch (err) {
//             console.error(`[Gemini] Erreur avec clé ${key}:`, err.message);

//             if ([429, 403].includes(err.response?.status)) {
//                 blockedGeminiKeys[key] = now + BLOCK_TIME;
//             }
//         }
//     }

//     // Fallback Cohere
//     return await askCohereFallback(question, sender, isAudio);
// }

// export{ askGemini };






import 'dotenv/config';
import axios from 'axios';
import { CohereClient } from 'cohere-ai';

// Contact du créateur pour logs
export const CREATOR_CONTACT = '24106813542@s.whatsapp.net';

// Gestion multi-clés depuis le .env
export const GEMINI_KEYS = process.env.GEMINI_API_KEYS?.split(',').filter(Boolean) || [];
export const COHERE_KEYS = process.env.CO_API_KEY?.split(',').filter(Boolean) || [];

export const blockedGeminiKeys = {};
export const blockedCohereKeys = {};
export const BLOCK_TIME = 5 * 60 * 1000; // 5 minutes

// ---------- SUPPRESSION DES EMOJIS ----------
function removeEmojis(text) {
    return text.replace(
        /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|\uD83E[\uDD00-\uDDFF])/g,
        ''
    ).trim();
}

// ---------- LOG VERS LE CRÉATEUR ----------
async function sendLogToCreator(message) {
    console.log(`[LOG vers créateur] ${message}`);
    // Intégrer ici l'envoi réel WhatsApp si nécessaire
}

// ---------- SYSTEM PROMPT ----------
function getSystemPrompt(isCreator, isAudio = false) {
    let basePrompt = `
Vous êtes Aquila Bot, créé par Essoya le prince myènè.
Assistant WhatsApp amical et drôle.
${isCreator ? "Adressez-vous à l'utilisateur comme 'Mon créateur'." 
            : "Répondez de manière concise et naturelle, sans salutations inutiles."}
`;

    if (isAudio) basePrompt += " N'utilisez pas d'emojis dans vos réponses.";

    return basePrompt;
}

// ---------- FONCTION COHERE ----------
async function askCohereFallback(question, sender, isAudio = false) {
    if (isAudio) {
        const text = "Je ne peux pas lire les notes vocales pour le moment, réessayez plus tard.";
        await sendLogToCreator(`[Cohere] Réponse audio envoyée à ${sender}: ${text}`);
        return text;
    }

    const now = Date.now();
    const isCreator = sender === CREATOR_CONTACT;
    let prompt = `${getSystemPrompt(isCreator)}\nQuestion: ${question}`;

    // Pour les utilisateurs, on ajoute les commandes en bas
    if (!isCreator) {
        prompt += "\n\nN'oublie pas : commandes disponibles -> .menu pour le menu, .catalogue pour voir les réalisations du maître.";
    }

    for (const key of COHERE_KEYS) {
        if (blockedCohereKeys[key] && blockedCohereKeys[key] > now) continue;

        try {
            const cohere = new CohereClient({ apiKey: key });
            const response = await cohere.chat({
                model: "command-xlarge-nightly",
                message: prompt
            });

            const text = response.text || 'Désolé, je n’ai pas compris.';
            await sendLogToCreator(`[Cohere] Réponse envoyée à ${sender}: ${text}`);
            return text;

        } catch (err) {
            console.error(`[Cohere] Erreur avec clé ${key}:`, err.message);
            blockedCohereKeys[key] = now + BLOCK_TIME;
        }
    }

    return 'Toutes les clés Cohere ont échoué.';
}

// ---------- FONCTION GEMINI ----------
async function askGemini(question, sender, audioData = null) {
    const now = Date.now();
    const isCreator = sender === CREATOR_CONTACT;
    const isAudio = !!audioData;

    const systemPrompt = getSystemPrompt(isCreator, isAudio);
    const parts = [{ text: systemPrompt }];

    if (audioData) {
        // On ne retranscrit pas pour l'utilisateur, juste on demande à Gemini de répondre
        parts.push({ text: "Répondez directement à l'audio fourni sans le retranscrire pour l'utilisateur." });
        parts.push({ inline_data: { mime_type: "audio/ogg", data: audioData.toString('base64') } });
    } else {
        parts.push({ text: question });
    }

    for (const key of GEMINI_KEYS) {
        if (blockedGeminiKeys[key] && blockedGeminiKeys[key] > now) continue;

        try {
            const response = await axios.post(
                'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
                { contents: [{ parts }] },
                { headers: { 'X-goog-api-key': key, 'Content-Type': 'application/json' } }
            );

            let text = response.data.candidates?.[0]?.content?.parts?.[0]?.text || '';

            if (isAudio) text = removeEmojis(text);

            // Pour les utilisateurs, ajout des commandes en bas si ce n'est pas audio
            if (!isCreator && !isAudio) {
                text += "\n\nN'oublie pas : commandes disponibles -> .menu pour le menu, .catalogue pour voir les réalisations du maître.";
            }

            if (text) {
                await sendLogToCreator(`[Gemini] Réponse envoyée à ${sender}: ${text}`);
                return text;
            }

        } catch (err) {
            console.error(`[Gemini] Erreur avec clé ${key}:`, err.message);

            if ([429, 403].includes(err.response?.status)) {
                blockedGeminiKeys[key] = now + BLOCK_TIME;
            }
        }
    }

    // Fallback Cohere
    return await askCohereFallback(question, sender, isAudio);
}

export { askGemini };

