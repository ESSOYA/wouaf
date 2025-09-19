

// require('dotenv').config();
// const axios = require('axios');

// // Recherche Google classique
// async function googleSearch(query) {
//     try {
//         const apiKey = process.env.GOOGLE_API_KEY;
//         const cx = process.env.GOOGLE_CX;
//         const res = await axios.get('https://www.googleapis.com/customsearch/v1', {
//             params: { key: apiKey, cx, q: query, hl: 'fr' }
//         });
//         if (res.data.items && res.data.items.length > 0) {
//             const top = res.data.items[0];
//             return `${top.title}\n${top.snippet}\nSource: ${top.link}`;
//         }
//         return 'Aucun résultat trouvé.';
//     } catch (err) {
//         console.error(err);
//         return 'Erreur Google Search.';
//     }
// }

// // Recherche d'image Google
// async function googleImageSearch(query) {
//     try {
//         const apiKey = process.env.GOOGLE_API_KEY;
//         const cx = process.env.GOOGLE_CX;

//         if (!apiKey || !cx) {
//             console.error('Erreur : GOOGLE_API_KEY ou GOOGLE_CX manquant !');
//             return null;
//         }

//         const res = await axios.get('https://www.googleapis.com/customsearch/v1', {
//             params: { key: apiKey, cx, searchType: 'image', q: query, num: 1 },
//         });

//         if (res.data.items && res.data.items.length > 0) {
//             return res.data.items[0].link;
//         }
//         return null;
//     } catch (err) {
//         if (err.response && err.response.status === 403) {
//             console.error('Erreur 403 : Vérifie ta clé API, ton CX et ton quota.');
//         } else {
//             console.error(err);
//         }
//         return null;
//     }
// }

// export{ googleSearch, googleImageSearch };



// google.js
import 'dotenv/config';
import axios from 'axios';

/**
 * Recherche Google classique (texte)
 */
async function googleSearch(query, num = 10) {
    const apiKey = process.env.GOOGLE_API_KEY;
    const cx = process.env.GOOGLE_CX;

    if (!apiKey || !cx) {
        console.error('Erreur : GOOGLE_API_KEY ou GOOGLE_CX manquant !');
        return [];
    }

    try {
        const res = await axios.get('https://www.googleapis.com/customsearch/v1', {
            params: { key: apiKey, cx, q: query, hl: 'fr', num },
        });

        if (res.data.items?.length) {
            return res.data.items.map(item => ({
                title: item.title,
                snippet: item.snippet,
                link: item.link
            }));
        }

        return [];
    } catch (err) {
        console.error('Erreur Google Search:', err.message);
        return [];
    }
}

/**
 * Recherche d'images Google avec texte associé
 */
async function googleImageSearch(query, num = 15) {
    const apiKey = process.env.GOOGLE_API_KEY;
    const cx = process.env.GOOGLE_CX;

    if (!apiKey || !cx) {
        console.error('Erreur : GOOGLE_API_KEY ou GOOGLE_CX manquant !');
        return [];
    }

    try {
        const res = await axios.get('https://www.googleapis.com/customsearch/v1', {
            params: { key: apiKey, cx, searchType: 'image', q: query, num, hl: 'fr' }
        });

        if (res.data.items?.length) {
            return res.data.items.map(item => ({
                title: item.title,
                snippet: item.snippet,
                pageLink: item.image?.contextLink || '',
                imageLink: item.link
            }));
        }

        return [];
    } catch (err) {
        if (err.response?.status === 403) {
            console.error('Erreur 403 : Vérifie ta clé API, ton CX et ton quota.');
        } else {
            console.error('Erreur Google Image Search:', err.message);
        }
        return [];
    }
}

/**
 * Envoi plusieurs images + texte sur WhatsApp
 */
async function sendGoogleImages(sock, sender, images) {
    for (const img of images) {
        try {
            const response = await axios.get(img.imageLink, {
                responseType: 'arraybuffer',
                headers: { 'User-Agent': 'Mozilla/5.0' }
            });
            const buffer = Buffer.from(response.data);

            const caption = `🔹 ${img.title}\n${img.snippet}\nLien page: ${img.pageLink}`;

            await sock.sendMessage(sender, { image: buffer, caption });
        } catch (err) {
            console.error('Erreur téléchargement image :', err.message);
        }
    }
}

export{ googleSearch, googleImageSearch, sendGoogleImages };
