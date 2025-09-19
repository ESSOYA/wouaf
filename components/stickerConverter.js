

// const { downloadContentFromMessage } = require('baileys');
// const fs = require('fs');
// const { exec } = require('child_process');
// const path = require('path');
// const os = require('os');

// // Constantes pour les métadonnées du sticker
// const STICKER_PACK = 'AquilBot';
// const STICKER_AUTHOR = 'LE PRINCE MYENE';

// async function mediaToSticker(sock, sender, quoted) {
//     if (!quoted) {
//         console.log('Aucun message cité pour .sticker');
//         await sock.sendMessage(sender, { text: 'Veuillez citer une image ou une vidéo courte pour la convertir en sticker.' });
//         return;
//     }
//     console.log('Message cité:', JSON.stringify(quoted, null, 2));

//     const isImage = quoted.imageMessage || (quoted.documentMessage && quoted.documentMessage.mimetype.startsWith('image/'));
//     const isVideo = quoted.videoMessage || (quoted.documentMessage && quoted.documentMessage.mimetype.startsWith('video/'));

//     if (!isImage && !isVideo) {
//         await sock.sendMessage(sender, { text: 'Le message cité n’est pas une image ou une vidéo courte valide.' });
//         return;
//     }

//     let inputPath;
//     let outputPath;

//     try {
//         const mediaType = isImage ? 'image' : 'video';
//         const stream = await downloadContentFromMessage(isImage ? (quoted.imageMessage || quoted.documentMessage) : (quoted.videoMessage || quoted.documentMessage), mediaType);
//         let buffer = Buffer.from([]);
//         for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

//         inputPath = path.join(os.tmpdir(), `input_${Date.now()}.${isImage ? 'jpg' : 'mp4'}`);
//         outputPath = path.join(os.tmpdir(), `sticker_${Date.now()}.webp`);
//         fs.writeFileSync(inputPath, buffer);

//         // Commande FFmpeg pour la conversion
//         const ffmpegCmd = isImage
//             ? `ffmpeg -i ${inputPath} -vf scale=512:512 -c:v libwebp -lossless 1 -q:v 100 -preset default ${outputPath}`
//             : `ffmpeg -i ${inputPath} -vcodec libwebp -filter:v fps=fps=15 -lossless 1 -loop 0 -preset default -an -vsync 0 -s 512:512 ${outputPath}`;

//         console.log(`Exécution de la commande FFmpeg : ${ffmpegCmd}`);
//         await new Promise((resolve, reject) => {
//             exec(ffmpegCmd, (err, stdout, stderr) => {
//                 if (err) {
//                     console.error('Erreur FFmpeg:', stderr);
//                     reject(new Error(`Échec de la conversion FFmpeg : ${stderr}`));
//                 } else {
//                     console.log('Conversion FFmpeg réussie');
//                     resolve();
//                 }
//             });
//         });

//         const stickerBuffer = fs.readFileSync(outputPath);
//         console.log('Envoi du sticker avec métadonnées:', {
//             pack: STICKER_PACK,
//             author: STICKER_AUTHOR,
//             isAnimated: isVideo
//         });

//         // Envoi du sticker avec métadonnées
//         await sock.sendMessage(sender, {
//             sticker: stickerBuffer,
//             isAnimated: isVideo,
//             packname: STICKER_PACK, // Format alternatif pour les métadonnées
//             author: STICKER_AUTHOR
//         });

//         await sock.sendMessage(sender, { text: `Sticker envoyé ! Package: ${STICKER_PACK}, Auteur: ${STICKER_AUTHOR}` });

//     } catch (err) {
//         console.error('Erreur lors de la conversion en sticker:', err.message);
//         await sock.sendMessage(sender, { text: `Impossible de convertir en sticker : ${err.message}. Assurez-vous que la vidéo est courte (< 8 secondes) et que FFmpeg est installé.` });
//     } finally {
//         // Nettoyage des fichiers temporaires
//         if (inputPath && fs.existsSync(inputPath)) {
//             fs.unlinkSync(inputPath);
//             console.log(`Fichier temporaire supprimé : ${inputPath}`);
//         }
//         if (outputPath && fs.existsSync(outputPath)) {
//             fs.unlinkSync(outputPath);
//             console.log(`Fichier temporaire supprimé : ${outputPath}`);
//         }
//     }
// }

// export{ mediaToSticker };









// const { downloadContentFromMessage } = require('baileys');
// const fs = require('fs');
// const path = require('path');
// const os = require('os');
// const { Sticker } = require('wa-sticker-formatter');

// // Constants for sticker metadata
// const STICKER_PACK = 'AquilBot';
// const STICKER_AUTHOR = 'LE PRINCE MYENE';

// async function mediaToSticker(sock, sender, quoted) {
//     if (!quoted) {
//         console.log('No quoted message for .sticker');
//         await sock.sendMessage(sender, { text: 'Veuillez citer une image ou une vidéo courte pour la convertir en sticker.' });
//         return;
//     }
//     console.log('Quoted message:', JSON.stringify(quoted, null, 2));

//     // Validate media type
//     const isImage = quoted.imageMessage || (quoted.documentMessage && quoted.documentMessage.mimetype?.startsWith('image/'));
//     const isVideo = quoted.videoMessage || (quoted.documentMessage && quoted.documentMessage.mimetype?.startsWith('video/'));

//     if (!isImage && !isVideo) {
//         console.log('Invalid media type in quoted message');
//         await sock.sendMessage(sender, { text: 'Le message cité n’est pas une image ou une vidéo courte valide.' });
//         return;
//     }

//     let inputPath;

//     try {
//         const mediaType = isImage ? 'image' : 'video';
//         const mediaMessage = isImage ? (quoted.imageMessage || quoted.documentMessage) : (quoted.videoMessage || quoted.documentMessage);

//         // Validate media message structure
//         if (!mediaMessage || !mediaMessage.mimetype) {
//             throw new Error('Message média invalide ou manquant des métadonnées.');
//         }

//         // Download media
//         const stream = await downloadContentFromMessage(mediaMessage, mediaType);
//         let buffer = Buffer.from([]);
//         for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

//         // Save to temporary file for validation (optional, but helps ensure valid media)
//         inputPath = path.join(os.tmpdir(), `input_${Date.now()}.${isImage ? 'jpg' : 'mp4'}`);
//         fs.writeFileSync(inputPath, buffer);

//         // Validate file size and content
//         const stats = fs.statSync(inputPath);
//         if (stats.size === 0) {
//             throw new Error('Le fichier média téléchargé est vide.');
//         }

//         // Create sticker using wa-sticker-formatter
//         const sticker = new Sticker(inputPath, {
//             pack: STICKER_PACK,
//             author: STICKER_AUTHOR,
//             type: 'full', // Full resolution for better quality
//             categories: ['🤩', '🎉'], // Optional emojis for sticker categorization
//             id: `sticker_${Date.now()}`, // Unique ID for the sticker
//             quality: 100, // Maximum quality for high resolution
//             background: 'transparent' // Ensure transparent background
//         });

//         const stickerBuffer = await sticker.toBuffer();
//         console.log('Sticker created with embedded metadata:', {
//             pack: STICKER_PACK,
//             author: STICKER_AUTHOR,
//             isAnimated: isVideo
//         });

//         // Send the sticker
//         await sock.sendMessage(sender, {
//             sticker: stickerBuffer,
//             isAnimated: isVideo
//         });

//     } catch (err) {
//         console.error('Error during sticker conversion:', err.message);
//         await sock.sendMessage(sender, { text: `Impossible de convertir en sticker : ${err.message}. Assurez-vous que la vidéo est courte (< 8 secondes) et que le média est valide.` });
//     } finally {
//         // Clean up temporary files
//         if (inputPath && fs.existsSync(inputPath)) {
//             fs.unlinkSync(inputPath);
//             console.log(`Temporary file deleted: ${inputPath}`);
//         }
//     }
// }

// export{ mediaToSticker };













// const { downloadContentFromMessage } = require('baileys');
// const fs = require('fs');
// const path = require('path');
// const os = require('os');
// const { Sticker } = require('wa-sticker-formatter');

// // Constants for sticker metadata
// const STICKER_PACK = 'AquilaBot';
// const STICKER_AUTHOR = 'LE PRINCE MYENE';

// async function mediaToSticker(sock, sender, quoted) {
//     if (!quoted) {
//         console.log('No quoted message for .sticker');
//         await sock.sendMessage(sender, { text: 'Veuillez citer une image ou une vidéo courte pour la convertir en sticker.' });
//         return;
//     }
//     console.log('Quoted message:', JSON.stringify(quoted, null, 2));

//     // Validate media type
//     const isImage = quoted.imageMessage || (quoted.documentMessage && quoted.documentMessage.mimetype?.startsWith('image/'));
//     const isVideo = quoted.videoMessage || (quoted.documentMessage && quoted.documentMessage.mimetype?.startsWith('video/'));

//     if (!isImage && !isVideo) {
//         console.log('Invalid media type in quoted message');
//         await sock.sendMessage(sender, { text: 'Le message cité n’est pas une image ou une vidéo courte valide.' });
//         return;
//     }

//     let inputPath;

//     try {
//         const mediaType = isImage ? 'image' : 'video';
//         const mediaMessage = isImage ? (quoted.imageMessage || quoted.documentMessage) : (quoted.videoMessage || quoted.documentMessage);

//         // Validate media message structure
//         if (!mediaMessage || !mediaMessage.mimetype) {
//             throw new Error('Message média invalide ou manquant des métadonnées.');
//         }

//         // Download media
//         const stream = await downloadContentFromMessage(mediaMessage, mediaType);
//         let buffer = Buffer.from([]);
//         for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

//         // Save to temporary file for validation
//         inputPath = path.join(os.tmpdir(), `input_${Date.now()}.${isImage ? 'jpg' : 'mp4'}`);
//         fs.writeFileSync(inputPath, buffer);

//         // Validate file size and content
//         const stats = fs.statSync(inputPath);
//         if (stats.size === 0) {
//             throw new Error('Le fichier média téléchargé est vide.');
//         }

//         // Create sticker using wa-sticker-formatter
//         const sticker = new Sticker(inputPath, {
//             pack: STICKER_PACK,
//             author: STICKER_AUTHOR,
//             type: 'full', // Full resolution for high quality
//             categories: ['🤩', '🎉'], // Optional emojis
//             id: `sticker_${Date.now()}`, // Unique ID
//             quality: 100, // Maximum quality
//             background: 'transparent' // Transparent background
//         });

//         const stickerBuffer = await sticker.toBuffer();
//         console.log('Sticker created with embedded metadata:', {
//             pack: STICKER_PACK,
//             author: STICKER_AUTHOR,
//             isAnimated: isVideo
//         });

//         // Send the sticker
//         await sock.sendMessage(sender, {
//             sticker: stickerBuffer,
//             isAnimated: isVideo
//         });

//         // Send success message
//         await sock.sendMessage(sender, { text: 'Voici votre sticker 🙂‍↔️🙂‍↔️🙂‍↔️🥹🤧' });

//     } catch (err) {
//         console.error('Error during sticker conversion:', err.message);
//         await sock.sendMessage(sender, { text: `Impossible de convertir en sticker : ${err.message}. Assurez-vous que la vidéo est courte (< 8 secondes) et que le média est valide.` });
//     } finally {
//         // Clean up temporary files
//         if (inputPath && fs.existsSync(inputPath)) {
//             fs.unlinkSync(inputPath);
//             console.log(`Temporary file deleted: ${inputPath}`);
//         }
//     }
// }

// export{ mediaToSticker };





import { downloadContentFromMessage } from "baileys";
import fs from "fs";
import path from "path";
import os from "os";
import { exec } from "child_process";

// Constants
const STICKER_PACK = "AquilaBot";
const STICKER_AUTHOR = "LE PRINCE MYENE";

async function mediaToSticker(sock, sender, quoted) {
  if (!quoted) {
    await sock.sendMessage(sender, {
      text: "Veuillez citer une image ou une vidéo courte pour la convertir en sticker.",
    });
    return;
  }

  const isImage =
    quoted.imageMessage ||
    (quoted.documentMessage && quoted.documentMessage.mimetype?.startsWith("image/"));
  const isVideo =
    quoted.videoMessage ||
    (quoted.documentMessage && quoted.documentMessage.mimetype?.startsWith("video/"));

  if (!isImage && !isVideo) {
    await sock.sendMessage(sender, {
      text: "Le message cité n’est pas une image ou une vidéo courte valide.",
    });
    return;
  }

  let inputPath, outputPath;

  try {
    const mediaType = isImage ? "image" : "video";
    const mediaMessage = isImage
      ? quoted.imageMessage || quoted.documentMessage
      : quoted.videoMessage || quoted.documentMessage;

    if (!mediaMessage || !mediaMessage.mimetype) {
      throw new Error("Message média invalide ou manquant.");
    }

    // Download media
    const stream = await downloadContentFromMessage(mediaMessage, mediaType);
    let buffer = Buffer.from([]);
    for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

    inputPath = path.join(os.tmpdir(), `input_${Date.now()}.${isImage ? "jpg" : "mp4"}`);
    outputPath = path.join(os.tmpdir(), `output_${Date.now()}.webp`);
    fs.writeFileSync(inputPath, buffer);

    // Convert with ffmpeg
    await new Promise((resolve, reject) => {
      const cmd = isImage
        ? `ffmpeg -i ${inputPath} -vf "scale=512:512:force_original_aspect_ratio=decrease,fps=15, pad=512:512:-1:-1:color=white@0.0" -y -vcodec libwebp ${outputPath}`
        : `ffmpeg -i ${inputPath} -vf "scale=512:512:force_original_aspect_ratio=decrease,fps=15, pad=512:512:-1:-1:color=white@0.0" -loop 0 -t 8 -y -vcodec libwebp ${outputPath}`;

      exec(cmd, (error) => {
        if (error) return reject(error);
        resolve();
      });
    });

    const stickerBuffer = fs.readFileSync(outputPath);

    await sock.sendMessage(sender, {
      sticker: stickerBuffer,
    });

    await sock.sendMessage(sender, {
      text: "Voici votre sticker 🎉",
    });
  } catch (err) {
    console.error("Erreur sticker:", err.message);
    await sock.sendMessage(sender, {
      text: `Impossible de convertir en sticker : ${err.message}.`,
    });
  } finally {
    // Clean up files
    [inputPath, outputPath].forEach((file) => {
      if (file && fs.existsSync(file)) fs.unlinkSync(file);
    });
  }
}

export{ mediaToSticker };
