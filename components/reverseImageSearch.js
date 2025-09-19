import FormData from 'form-data';
import axios from 'axios';

// Upload image sur telegra.ph et retourner l'URL
async function uploadImage(buffer) {
    try {
        const form = new FormData();
        form.append('file', buffer, { filename: 'image.jpg' });

        const res = await axios.post('https://telegra.ph/upload', form, {
            headers: form.getHeaders()
        });

        if (res.data && res.data[0] && res.data[0].src) {
            return 'https://telegra.ph' + res.data[0].src;
        } else {
            throw new Error('Erreur upload image');
        }
    } catch (err) {
        console.error('uploadImage error:', err.message);
        return null;
    }
}

// Fonction de recherche inversée simple (exemple fictif)
async function reverseImageSearch(imageUrl, maxResults = 3) {
    // Ici tu peux mettre ton code de recherche inversée (Google API, Bing API, etc.)
    // Pour tester, on retourne juste l'image elle-même
    return {
        text: 'Résultats de la recherche inversée',
        images: [imageUrl]
    };
}

export{ uploadImage, reverseImageSearch };


// const axios = require('axios');
// const FormData = require('form-data');

// async function uploadImage(buffer) {
//     try {
//         const API_KEY = process.env.IMGBB_API_KEY;
//         if (!API_KEY) throw new Error('Clé IMGBB non définie dans .env');

//         const form = new FormData();
//         form.append('image', buffer.toString('base64'));

//         const res = await axios.post(`https://api.imgbb.com/1/upload?key=${API_KEY}`, form, {
//             headers: form.getHeaders()
//         });

//         if (res.data && res.data.data && res.data.data.url) {
//             return res.data.data.url;
//         } else {
//             throw new Error('Upload image échoué');
//         }
//     } catch (err) {
//         console.error('uploadImage error:', err.message);
//         return null;
//     }
// }

// // Exemple simple de fonction reverse (à adapter selon ton API ou logique)
// async function reverseImageSearch(imageUrl, limit = 3) {
//     // Ici tu peux mettre ton code qui fait la recherche inversée
//     // Pour test, on renvoie un résultat fictif
//     return {
//         text: `Résultats de recherche pour l'image: ${imageUrl}`,
//         images: [imageUrl] // tableau d'images trouvées
//     };
// }

// export{ uploadImage, reverseImageSearch };
