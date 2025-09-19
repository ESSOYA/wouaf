// const { downloadContentFromMessage } = require('baileys');
// const fs = require('fs');
// const { exec } = require('child_process');
// const path = require('path');
// const os = require('os');

// async function stickerToVideo(sock, sender, quoted) {
//     if (!quoted || !quoted.stickerMessage || !quoted.stickerMessage.isAnimated) {
//         console.log('Aucun sticker animé cité pour -video');
//         await sock.sendMessage(sender, { text: 'Veuillez citer un sticker animé pour le convertir en vidéo.' });
//         return;
//     }
//     try {
//         const stream = await downloadContentFromMessage(quoted.stickerMessage, 'image');
//         let buffer = Buffer.from([]);
//         for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

//         const inputPath = path.join(os.tmpdir(), `sticker_${Date.now()}.webp`);
//         const outputPath = path.join(os.tmpdir(), `video_${Date.now()}.mp4`);
//         fs.writeFileSync(inputPath, buffer);

//         const ffmpegCmd = `ffmpeg -i ${inputPath} -vcodec libx264 -pix_fmt yuv420p ${outputPath}`;

//         await new Promise((resolve, reject) => {
//             exec(ffmpegCmd, (err) => {
//                 if (err) reject(err);
//                 else resolve();
//             });
//         });

//         const videoBuffer = fs.readFileSync(outputPath);
//         await sock.sendMessage(sender, { video: videoBuffer, mimetype: 'video/mp4' });

//         fs.unlinkSync(inputPath);
//         fs.unlinkSync(outputPath);
//     } catch (err) {
//         console.error('Erreur lors de la conversion en vidéo:', err.message);
//         await sock.sendMessage(sender, { text: 'Impossible de convertir le sticker en vidéo.' });
//     }
// }

// export{ stickerToVideo };






import { downloadContentFromMessage } from 'baileys';
import fs from 'fs/promises'; // fs.promises pour async/await
import { exec as execCallback } from 'child_process';
import path from 'path';
import os from 'os';
import util from 'util';

// Convertir exec en version async/await
export const execAsync = util.promisify(execCallback);

async function stickerToVideo(sock, sender, quoted) {
    // Vérifier si un sticker animé est cité
    if (!quoted || !quoted.stickerMessage || !quoted.stickerMessage.isAnimated) {
        await sock.sendMessage(sender, {
            text: 'Veuillez citer un sticker animé pour le convertir en vidéo.'
        });
        return;
    }

    let inputPath, outputPath;

    try {
        // Télécharger le sticker animé
        const stream = await downloadContentFromMessage(quoted.stickerMessage, 'image');
        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }

        // Vérifier si le buffer est valide
        if (buffer.length === 0) {
            throw new Error('Le sticker téléchargé est vide.');
        }

        // Créer des chemins temporaires pour les fichiers
        inputPath = path.join(os.tmpdir(), `sticker_${Date.now()}.webp`);
        outputPath = path.join(os.tmpdir(), `video_${Date.now()}.mp4`);

        // Sauvegarder le sticker WebP
        await fs.writeFile(inputPath, buffer);

        // Vérifier la taille du fichier WebP
        const stats = await fs.stat(inputPath);
        if (stats.size === 0) {
            throw new Error('Le fichier WebP téléchargé est vide.');
        }

        // Convertir WebP en MP4 avec FFmpeg
        const ffmpegCmd = `ffmpeg -i ${inputPath} -c:v libx264 -pix_fmt yuv420p -movflags +faststart -loop 0 ${outputPath}`;
        await execAsync(ffmpegCmd);

        // Vérifier si le fichier vidéo a été créé
        if (!await fs.access(outputPath).then(() => true).catch(() => false)) {
            throw new Error('Le fichier vidéo de sortie n\'a pas été créé.');
        }

        // Lire le fichier vidéo
        const videoBuffer = await fs.readFile(outputPath);
        if (videoBuffer.length === 0) {
            throw new Error('Le fichier vidéo de sortie est vide.');
        }

        // Envoyer la vidéo
        await sock.sendMessage(sender, {
            video: videoBuffer,
            mimetype: 'video/mp4',
            caption: 'Voici votre vidéo convertie !'
        });

    } catch (err) {
        console.error('Erreur lors de la conversion en vidéo:', err.message);
        await sock.sendMessage(sender, {
            text: `Impossible de convertir le sticker en vidéo : ${err.message}`
        });
    } finally {
        // Nettoyer les fichiers temporaires
        try {
            if (inputPath && await fs.access(inputPath).then(() => true).catch(() => false)) {
                await fs.unlink(inputPath);
                console.log(`Fichier temporaire supprimé : ${inputPath}`);
            }
            if (outputPath && await fs.access(outputPath).then(() => true).catch(() => false)) {
                await fs.unlink(outputPath);
                console.log(`Fichier temporaire supprimé : ${outputPath}`);
            }
        } catch (cleanupErr) {
            console.error('Erreur lors du nettoyage des fichiers temporaires:', cleanupErr.message);
        }
    }
}

export{ stickerToVideo };