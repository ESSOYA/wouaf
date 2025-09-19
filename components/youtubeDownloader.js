const ytdl = require('ytdl-core');
const fs = require('fs');
const path = require('path');
const os = require('os');

async function downloadYouTube(sock, sender, url) {
    if (!ytdl.validateURL(url)) {
        await sock.sendMessage(sender, { text: 'URL YouTube invalide. Utilisez : -yt <url>' });
        return;
    }

    try {
        const info = await ytdl.getInfo(url);

        // Choisir un format contenant vidéo + audio
        const format = ytdl.chooseFormat(info.formats, { quality: 'highest', filter: f => f.hasAudio && f.hasVideo });
        if (!format) {
            await sock.sendMessage(sender, { text: 'Impossible de trouver une vidéo avec audio intégré sur YouTube.' });
            return;
        }

        const tempPath = path.join(os.tmpdir(), `yt_${Date.now()}.mp4`);
        await new Promise((resolve, reject) => {
            ytdl(url, { format })
                .pipe(fs.createWriteStream(tempPath))
                .on('finish', resolve)
                .on('error', reject);
        });

        const videoBuffer = fs.readFileSync(tempPath);
        await sock.sendMessage(sender, { video: videoBuffer, mimetype: 'video/mp4', caption: info.videoDetails.title });

        fs.unlinkSync(tempPath);

    } catch (err) {
        console.error('Erreur lors du téléchargement YouTube:', err.message);
        await sock.sendMessage(sender, { text: 'Impossible de télécharger la vidéo YouTube.' });
    }
}

export{ downloadYouTube };





// import youtubedl from 'youtube-dl-exec';
// import fs from 'fs/promises';
// import path from 'path';
// import os from 'os';

// async function downloadYouTube(sock, sender, url) {
//     try {
//         // Valider l'URL
//         if (!url.includes('youtube.com') && !url.includes('youtu.be')) {
//             await sock.sendMessage(sender, { text: '❌ URL YouTube invalide. Utilisez : *.yt <URL>' });
//             await sock.sendMessage(sender, { react: { text: '❌', key: { id: sender, remoteJid: sender, fromMe: false } } });
//             return;
//         }

//         await sock.sendMessage(sender, { text: '📥 Téléchargement de la vidéo YouTube en cours, veuillez patienter...' });

//         // Obtenir les informations de la vidéo
//         const info = await youtubedl(url, { dumpSingleJson: true });
//         const title = info.title || 'Sans titre';
//         const duration = info.duration || 0;
//         const author = info.uploader || 'Inconnu';
//         const views = info.view_count?.toLocaleString() || 'N/A';
//         const publishDate = info.upload_date || 'N/A';
//         const description = info.description?.slice(0, 200) + (info.description?.length > 200 ? '...' : '') || 'Aucune description';

//         const formatDuration = (seconds) => {
//             const minutes = Math.floor(seconds / 60);
//             const secs = seconds % 60;
//             return `${minutes}:${secs.toString().padStart(2, '0')}`;
//         };

//         const caption = `🎥 **Vidéo YouTube téléchargée avec succès !** 🎉\n` +
//                        `📜 **Titre** : ${title}\n` +
//                        `👤 **Auteur** : ${author}\n` +
//                        `⏱️ **Durée** : ${duration ? formatDuration(duration) : 'N/A'}\n` +
//                        `👀 **Vues** : ${views}\n` +
//                        `📅 **Date de publication** : ${publishDate}\n` +
//                        `📝 **Description** : ${description}\n` +
//                        `🔗 **Lien original** : ${url}`;

//         // Télécharger la vidéo
//         const tempDir = path.join(os.tmpdir());
//         const tempFilePath = path.join(tempDir, `youtube_${Date.now()}.mp4`);
//         await youtubedl(url, { output: tempFilePath, format: 'mp4', mergeOutputFormat: 'mp4' });

//         // Vérifier la taille
//         const stats = await fs.stat(tempFilePath);
//         if (stats.size > 16 * 1024 * 1024) {
//             await fs.unlink(tempFilePath);
//             throw new Error('La vidéo est trop volumineuse pour WhatsApp (>16 Mo).');
//         }

//         // Envoyer la vidéo
//         await sock.sendMessage(sender, {
//             video: { url: tempFilePath },
//             mimetype: 'video/mp4',
//             caption: caption
//         });

//         // Nettoyer
//         await fs.unlink(tempFilePath);

//         await sock.sendMessage(sender, { react: { text: '✅', key: { id: sender, remoteJid: sender, fromMe: false } } });
//     } catch (err) {
//         console.error('Erreur lors du téléchargement YouTube:', err.message, err.stack);
//         await sock.sendMessage(sender, { text: `❌ Erreur lors du téléchargement de la vidéo YouTube : ${err.message}` });
//         await sock.sendMessage(sender, { react: { text: '❌', key: { id: sender, remoteJid: sender, fromMe: false } } });
//     }
// }


// export{ downloadYouTube };
