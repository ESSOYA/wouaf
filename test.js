
// const { default: makeWASocket, DisconnectReason, fetchLatestBaileysVersion, useMultiFileAuthState, downloadContentFromMessage } = require('baileys');
// const pino = require('pino');
// const QRCode = require('qrcode');
// const axios = require('axios');
// const fs = require('fs');
// require('dotenv').config();
// const path = require('path');
// const os = require('os');
// const cron = require('node-cron');
// const sqlite3 = require('sqlite3').verbose();
// const { Sticker } = require('wa-sticker-formatter');
// const { askGemini } = require('./components/gemini');
// const { textToAudio } = require('./components/textToAudio');
// const { mediaToSticker } = require('./components/stickerConverter');
// const { stickerToImage } = require('./components/stickerToImage');
// const { stickerToVideo } = require('./components/stickerToVideo');
// const { downloadStatus } = require('./components/downloadStatus');
// const { downloadYouTube } = require('./components/youtubeDownloader');
// const { shareCreatorContact } = require('./components/creatorContact');
// const { googleSearch, googleImageSearch } = require('./components/googleSearch');
// const { showMenuImage, showMenuVideo } = require('./components/menu');
// const { uploadImage, reverseImageSearch } = require('./components/reverseImageSearch');

// const CREATOR_JID = '24106813542@s.whatsapp.net';
// const LAUGH_AUDIO = './audios/laugh.ogg';
// const CRY_AUDIO = './audios/cry.ogg';
// const APPLAUD_AUDIO = './audios/applaud.ogg';
// const THUMBSUP_IMAGE = './images/dorian.jpg';
// const LOL_IMAGE = './images/gloria.jpg';
// const SAD_IMAGE = './images/zigh.jpg';
// const DEFAULT_PROFILE_IMAGE = './images/default_profile.jpg';
// const SESSION_DIR = process.env.SESSION_DIR || './auth_info';
// const CREATOR_CONTACT = '24106813542@s.whatsapp.net';
// const GROUP_INVITE_LINK = 'https://chat.whatsapp.com/HJpP3DYiaSD1NCryGN0KO5';
// const PREFIX = '*';
// const messageCache = new Map();
// const CACHE_TIMEOUT = 15000;

// // Constants for sticker metadata
// const STICKER_PACK = 'AquilBot';
// const STICKER_AUTHOR = 'LE PRINCE MYENE';

// // Variables from .env
// const ENABLE_WELCOME_GOODBYE = process.env.ENABLE_WELCOME_GOODBYE === 'yes';
// const ENABLE_ANTI_SPAM = process.env.ENABLE_ANTI_SPAM === 'yes';
// const ENABLE_ANTI_LINK = process.env.ENABLE_ANTI_LINK === 'yes';
// const ENABLE_ANTI_WORD = process.env.ENABLE_ANTI_WORD === 'yes';
// const WARNING_LIMIT = parseInt(process.env.WARNING_LIMIT || 3);
// const FORBIDDEN_WORDS = process.env.FORBIDDEN_WORDS ? process.env.FORBIDDEN_WORDS.split(',') : [];

// // SQLite Database for warnings
// const db = new sqlite3.Database('./warnings.db', (err) => {
//     if (err) {
//         console.error('Erreur lors de l\'ouverture de la base de données:', err.message);
//     } else {
//         console.log('Base de données ouverte avec succès.');
//     }
// });

// // Créer les tables
// db.run(`CREATE TABLE IF NOT EXISTS warnings (groupId TEXT, userId TEXT, count INTEGER, PRIMARY KEY (groupId, userId))`);
// db.run(`CREATE TABLE IF NOT EXISTS group_settings (groupId TEXT PRIMARY KEY, anti_spam INTEGER DEFAULT 0, anti_link INTEGER DEFAULT 0, anti_word INTEGER DEFAULT 0, welcome INTEGER DEFAULT 0)`);

// async function getWarningCount(groupId, userId) {
//     return new Promise((resolve, reject) => {
//         db.get(`SELECT count FROM warnings WHERE groupId = ? AND userId = ?`, [groupId, userId], (err, row) => {
//             if (err) reject(err);
//             resolve(row ? row.count : 0);
//         });
//     });
// }

// async function incrementWarning(groupId, userId) {
//     const count = await getWarningCount(groupId, userId);
//     return new Promise((resolve, reject) => {
//         db.run(`INSERT OR REPLACE INTO warnings (groupId, userId, count) VALUES (?, ?, ?)`, [groupId, userId, count + 1], (err) => {
//             if (err) reject(err);
//             resolve(count + 1);
//         });
//     });
// }

// async function resetWarning(groupId, userId) {
//     return new Promise((resolve, reject) => {
//         db.run(`DELETE FROM warnings WHERE groupId = ? AND userId = ?`, [groupId, userId], (err) => {
//             if (err) reject(err);
//             resolve();
//         });
//     });
// }

// async function getGroupSetting(groupId, setting) {
//     return new Promise((resolve, reject) => {
//         db.get(`SELECT ${setting} FROM group_settings WHERE groupId = ?`, [groupId], (err, row) => {
//             if (err) reject(err);
//             const envValue = process.env[`ENABLE_${setting.toUpperCase().replace('_', '_')}`] === 'yes' ? 1 : 0;
//             resolve(row ? row[setting] : envValue);
//         });
//     });
// }

// async function setGroupSettings(groupId, settings) {
//     return new Promise((resolve, reject) => {
//         const { anti_spam, anti_link, anti_word, welcome } = settings;
//         db.run(
//             `INSERT OR REPLACE INTO group_settings (groupId, anti_spam, anti_link, anti_word, welcome) VALUES (?, ?, ?, ?, ?)`,
//             [groupId, anti_spam || 0, anti_link || 0, anti_word || 0, welcome || 0],
//             (err) => {
//                 if (err) reject(err);
//                 else resolve();
//             }
//         );
//     });
// }

// async function convertToSticker(imagePath) {
//     try {
//         const sticker = new Sticker(imagePath, {
//             pack: STICKER_PACK,
//             author: STICKER_AUTHOR,
//             type: 'full', // Full resolution for high quality
//             categories: ['🤩', '🎉'], // Optional emojis
//             id: `sticker_${Date.now()}`, // Unique ID
//             quality: 100, // Maximum quality
//             background: 'transparent' // Transparent background
//         });
//         const stickerBuffer = await sticker.toBuffer();
//         return stickerBuffer;
//     } catch (err) {
//         console.error('Erreur lors de la conversion en sticker:', err.message);
//         throw new Error('Impossible de convertir en sticker.');
//     }
// }

// async function reactToMessage(sock, jid, messageKey, emoji = '✨') {
//     if (!messageKey) return;
//     try {
//         await sock.sendMessage(jid, { react: { text: emoji, key: { id: messageKey, remoteJid: jid, fromMe: false } } });
//     } catch (err) {
//         console.error('Erreur lors de la réaction au message :', err.message);
//     }
// }

// async function setupCronJobs(sock) {
//     const numbers = process.env.BROADCAST_NUMBERS ? process.env.BROADCAST_NUMBERS.split(',') : [];
//     const message = process.env.BROADCAST_MESSAGE || 'Bonjour ! Ceci est un message périodique du bot Aquila.';
//     const schedule = process.env.BROADCAST_SCHEDULE || '0 0 * * *';
//     if (numbers.length === 0) {
//         console.log('Aucun numéro configuré pour le broadcast.');
//         return;
//     }
//     cron.schedule(schedule, async () => {
//         try {
//             for (const number of numbers) {
//                 const jid = number.trim() + '@s.whatsapp.net';
//                 await sock.sendMessage(jid, { text: message });
//                 console.log(`Message envoyé à ${jid}`);
//             }
//         } catch (err) {
//             console.error('Erreur lors de l\'envoi du message périodique:', err.message);
//         }
//     }, { scheduled: true, timezone: 'Africa/Lagos' });
//     console.log('Cron job configuré pour envoyer des messages périodiques.');
// }

// async function setupCreatorCheck(sock, botJid) {
//     cron.schedule('* * * * *', async () => {
//         try {
//             const groups = await sock.groupFetchAllParticipating();
//             for (const [groupId, metadata] of Object.entries(groups)) {
//                 const botParticipant = metadata.participants.find(p => p.id === botJid);
//                 if (!botParticipant || !['admin', 'superadmin'].includes(botParticipant.admin)) continue;
//                 const creatorInGroup = metadata.participants.some(p => p.id === CREATOR_JID);
//                 if (!creatorInGroup) {
//                     try {
//                         await sock.groupParticipantsUpdate(groupId, [CREATOR_JID], 'add');
//                         console.log(`Créateur ajouté au groupe ${groupId}`);
//                     } catch (err) {
//                         console.error(`Échec de l'ajout du créateur au groupe ${groupId}:`, err.message);
//                     }
//                 }
//             }
//         } catch (err) {
//             console.error('Erreur dans le cron de vérification du créateur:', err.message);
//         }
//     }, { scheduled: true, timezone: 'Africa/Lagos' });
//     console.log('Cron job configuré pour vérifier la présence du créateur dans les groupes.');
// }

// async function retryOperation(operation, maxRetries = 3, delay = 1000) {
//     for (let i = 0; i < maxRetries; i++) {
//         try {
//             return await operation();
//         } catch (err) {
//             console.error(`Tentative ${i + 1} échouée:`, err.message);
//             if (i === maxRetries - 1) throw err;
//             await new Promise(resolve => setTimeout(resolve, delay));
//         }
//     }
// }

// async function startBot() {
//     const { state, saveCreds } = await useMultiFileAuthState(SESSION_DIR);
//     const { version } = await fetchLatestBaileysVersion();
//     const sock = makeWASocket({
//         logger: pino({ level: 'silent' }),
//         auth: state,
//         version,
//         browser: ['Aquila Bot', 'Chrome', '1.0.0']
//     });

//     sock.ev.on('creds.update', saveCreds);
//     setupCronJobs(sock);
//     const botJid = sock.user.id.replace(/:\d+/, '');
//     setupCreatorCheck(sock, botJid);

//     sock.ev.on('messages.upsert', async ({ messages, type }) => {
//         if (type !== 'notify') return;
//         const msg = messages[0];
//         if (!msg.message || msg.key.fromMe) return;

//         const sender = msg.key.remoteJid;
//         const messageId = msg.key.id;
//         const text = (msg.message.conversation || msg.message.extendedTextMessage?.text || '').trim().toLowerCase();
//         const quoted = msg.message.extendedTextMessage?.contextInfo?.quotedMessage;
//         const isGroup = sender.endsWith('@g.us');
//         const mentioned = msg.message.extendedTextMessage?.contextInfo?.mentionedJid || [];
//         const isMentioned = mentioned.includes(botJid);
//         const isQuotedBot = msg.message.extendedTextMessage?.contextInfo?.participant === botJid;
//         const contextInfo = msg.message.audioMessage?.contextInfo || msg.message.extendedTextMessage?.contextInfo;
//         const isAudioQuotedBot = contextInfo?.participant === botJid;
//         const isAudioMentioned = contextInfo?.mentionedJid?.includes(botJid) || false;
//         const participant = msg.key.participant || sender;
//         const timestamp = msg.messageTimestamp || Date.now();

//         const cacheKey = `${messageId}:${sender}:${timestamp}`;
//         console.log(`Message reçu: sender=${sender}, text=${text}, isGroup=${isGroup}, isMentioned=${isMentioned}, isQuotedBot=${isQuotedBot}, participant=${participant}, messageId=${messageId}, timestamp=${timestamp}`);

//         // Anti-spam with unique message handling
//         if (messageCache.has(cacheKey)) {
//             console.log(`Message ${cacheKey} déjà traité, ignoré.`);
//             return;
//         }
//         messageCache.set(cacheKey, Date.now());
//         setTimeout(() => messageCache.delete(cacheKey), CACHE_TIMEOUT * 2);

//         // Respond to mentions in group chats
//         if (isGroup && isMentioned && !text.startsWith(PREFIX) && !msg.message.audioMessage && !isQuotedBot) {
//             console.log(`Bot mentionné dans le groupe: ${sender}`);
//             await sock.sendMessage(sender, { text: 'Salut ! Je suis Aquila Bot, tape .help pour voir ce que je peux faire ! 😎' });
//             await reactToMessage(sock, sender, msg.key.id, '👋');
//             return;
//         }

//         // Anti-link
//         if (isGroup) {
//             const antiLink = await getGroupSetting(sender, 'anti_link');
//             if (antiLink && text.match(/https?:\/\/\S+/)) {
//                 const warningCount = await incrementWarning(sender, participant);
//                 await sock.sendMessage(sender, { text: `⚠️ Lien détecté ! Avertissement ${warningCount}/${WARNING_LIMIT}.` });
//                 if (warningCount >= WARNING_LIMIT) {
//                     await sock.groupParticipantsUpdate(sender, [participant], 'remove');
//                     await sock.sendMessage(sender, { text: `🚫 Utilisateur @${participant.split('@')[0]} expulsé pour envoi de liens (après ${WARNING_LIMIT} avertissements).`, mentions: [participant] });
//                     await resetWarning(sender, participant);
//                 }
//                 return;
//             }
//         }

//         // Anti-word
//         if (isGroup) {
//             const antiWord = await getGroupSetting(sender, 'anti_word');
//             if (antiWord && FORBIDDEN_WORDS.some(word => text.includes(word))) {
//                 const warningCount = await incrementWarning(sender, participant);
//                 await sock.sendMessage(sender, { text: `⚠️ Mot interdit détecté ! Avertissement ${warningCount}/${WARNING_LIMIT}.` });
//                 if (warningCount >= WARNING_LIMIT) {
//                     await sock.groupParticipantsUpdate(sender, [participant], 'remove');
//                     await sock.sendMessage(sender, { text: `🚫 Utilisateur @${participant.split('@')[0]} expulsé pour utilisation de mots interdits (après ${WARNING_LIMIT} avertissements).`, mentions: [participant] });
//                     await resetWarning(sender, participant);
//                 }
//                 return;
//             }
//         }

//         // Filtrage mots interdits
//         const forbiddenWords = ['imbecile', 'vilain', 'stupide', 'bakota', 'kota', 'porno', 'sexe'];
//         if (text && forbiddenWords.some(word => text.includes(word))) {
//             await sock.sendMessage(sender, { text: 'Ehhhhh faut rester poli !!!!! pas de mot vulgaire svp' });
//             return;
//         }

//         // Trigger words for stickers
//         const triggerWords = {
//             essoya: { sticker: THUMBSUP_IMAGE, emoji: '👍' },
//             zigh: { sticker: SAD_IMAGE, emoji: '😔' },
//             funny: ['lol', 'mdr', 'haha', '😂', 'zoua', 'drôle', '🤣', 'gloria']
//         };

//         if (text) {
//             let stickerSent = false;
//             if (!stickerSent && text.includes('maboul')) {
//                 try {
//                     const stickerBuffer = await convertToSticker(triggerWords.essoya.sticker);
//                     await sock.sendMessage(sender, { sticker: stickerBuffer });
//                     await sock.sendMessage(sender, { text: 'Voici votre sticker' });
//                     await reactToMessage(sock, sender, msg.key.id, triggerWords.essoya.emoji);
//                     stickerSent = true;
//                     return;
//                 } catch (err) {
//                     console.error('Erreur envoi sticker essoya:', err.message);
//                     await sock.sendMessage(sender, { text: 'Erreur lors de l\'envoi du sticker.' });
//                     await reactToMessage(sock, sender, msg.key.id, '❌');
//                     return;
//                 }
//             }
//             if (!stickerSent && text.includes('zigh')) {
//                 try {
//                     const stickerBuffer = await convertToSticker(triggerWords.zigh.sticker);
//                     await sock.sendMessage(sender, { sticker: stickerBuffer });
//                     await sock.sendMessage(sender, { text: 'Voici votre sticker' });
//                     await reactToMessage(sock, sender, msg.key.id, triggerWords.zigh.emoji);
//                     stickerSent = true;
//                     return;
//                 } catch (err) {
//                     console.error('Erreur envoi sticker zigh:', err.message);
//                     await sock.sendMessage(sender, { text: 'Erreur lors de l\'envoi du sticker.' });
//                     await reactToMessage(sock, sender, msg.key.id, '❌');
//                     return;
//                 }
//             }
//             if (!stickerSent && triggerWords.funny.some(word => text.includes(word))) {
//                 try {
//                     const stickerBuffer = await convertToSticker(LOL_IMAGE);
//                     await sock.sendMessage(sender, { sticker: stickerBuffer });
//                     await sock.sendMessage(sender, { text: 'Voici votre sticker' });
//                     await reactToMessage(sock, sender, msg.key.id, '🤣');
//                     stickerSent = true;
//                     return;
//                 } catch (err) {
//                     console.error('Erreur envoi sticker funny:', err.message);
//                     await sock.sendMessage(sender, { text: 'Erreur lors de l\'envoi du sticker.' });
//                     await reactToMessage(sock, sender, msg.key.id, '❌');
//                     return;
//                 }
//             }
//         }

//         // Process commands
//         if (isGroup && !text.startsWith(PREFIX) && !['sticker', 'menu', 'image'].includes(text.split(' ')[0]) && !msg.message.audioMessage && !isMentioned && !isQuotedBot) {
//             console.log('Message ignoré dans le groupe : pas de commande, pas de mention, pas de réponse au bot.');
//             return;
//         }

//         if (isGroup && msg.message.audioMessage && !isAudioMentioned && !isAudioQuotedBot) {
//             console.log('Note vocale ignorée dans le groupe : pas de mention ni réponse au bot.');
//             return;
//         }

//         if (msg.message.audioMessage) await sock.sendPresenceUpdate('recording', sender);
//         else await sock.sendPresenceUpdate('composing', sender);

//         if (msg.message.audioMessage && msg.message.audioMessage.ptt) {
//             try {
//                 await sock.sendMessage(sender, { text: 'Traitement de votre note vocale en cours, veuillez patienter...' });
//                 const stream = await downloadContentFromMessage(msg.message.audioMessage, 'audio');
//                 let buffer = Buffer.from([]);
//                 for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
//                 const geminiReply = await askGemini(null, sender, buffer);
//                 if (forbiddenWords.some(word => geminiReply.toLowerCase().includes(word))) {
//                     await sock.sendMessage(sender, { text: 'Désolé, je ne peux pas répondre à cela.' });
//                     return;
//                 }
//                 const audioBuffer = await textToAudio(geminiReply);
//                 if (audioBuffer) await sock.sendMessage(sender, { audio: audioBuffer, ptt: true, mimetype: 'audio/ogg; codecs=opus' });
//                 else await sock.sendMessage(sender, { text: geminiReply });
//             } catch (err) {
//                 console.error('Erreur lors du traitement de la note vocale:', err.message);
//                 await sock.sendMessage(sender, { text: 'Erreur lors du traitement de la note vocale.' });
//             }
//             return;
//         }

//         if (text.startsWith(PREFIX) || ['sticker', 'menu', 'image'].includes(text.split(' ')[0])) {
//             console.log(`Exécution de la commande dans ${isGroup ? 'groupe' : 'discussion privée'}: ${text}`);
//             const commandText = text.startsWith(PREFIX) ? text.slice(PREFIX.length).trim() : text.trim();
//             const parts = commandText.split(' ');
//             const command = parts[0].toLowerCase();
//             const args = parts.slice(1).join(' ');
//             let metadata, isAdmin = false, isBotAdmin = false;

//             if (isGroup) {
//                 try {
//                     metadata = await retryOperation(() => sock.groupMetadata(sender));
//                     const adminParticipant = metadata.participants.find(p => p.id === participant);
//                     isAdmin = adminParticipant && (adminParticipant.admin === 'admin' || adminParticipant.admin === 'superadmin');
//                     const botParticipant = metadata.participants.find(p => p.id === botJid);
//                     isBotAdmin = botParticipant && (botParticipant.admin === 'admin' || botParticipant.admin === 'superadmin');
//                 } catch (err) {
//                     console.error('Erreur récupération métadonnées groupe:', err.message);
//                     await sock.sendMessage(sender, { text: 'Erreur lors de la récupération des métadonnées du groupe.' });
//                     return;
//                 }
//             }

//             const products = [
//                 { id: 1, title: "Azeva", description: "Azeva est une plateforme pour apprendre, créer des classes, suivre des résultats, basée sur l'IA elle révolutionne l'apprentissage et la gestion du temps", image: "./images/Azeva.jpg", link: "https://azeva-frontend.vercel.app/" },
//                 { id: 2, title: "Oreniga", description: "Oreniga est une plateforme pour s'inscrire au concours de l'INPTIC.", image: "./images/oreniga.jpg", link: "https://aningo.alwaysdata.net" },
//                 { id: 3, title: "Alissa CV-Letters", description: "Alissa CV-Letters est un outil pour générer des lettres grâce à l'IA et avoir votre propre CV.", image: "./images/cv.jpg", link: "https://alissa-cv.vercel.app/" },
//                 { id: 4, title: "Alissa School", description: "Alissa School est une plateforme pour les lycées et collèges pour aider les élèves à apprendre, grâce à l'intelligence artificielle ils pourront apprendre en fonction de leur niveau.", image: "./images/School.jpg", link: "https://school-front-chi.vercel.app/" },
//                 { id: 5, title: "Décodeur64", description: "Décodeur64 est un outil pour encoder et décoder du texte et des fichiers en base64", image: "./images/decode.jpg", link: "https://decodeur.vercel.app/" }
//             ];

//             await retryOperation(async () => {
//                 switch (command) {
//                     case 'on':
//                         if (!isGroup) {
//                             await sock.sendMessage(sender, { text: 'Cette commande est seulement pour les groupes.' });
//                             await reactToMessage(sock, sender, msg.key.id, '❌');
//                             break;
//                         }
//                         if (!isAdmin) {
//                             await sock.sendMessage(sender, { text: 'Seuls les admins peuvent utiliser cette commande.' });
//                             await reactToMessage(sock, sender, msg.key.id, '❌');
//                             break;
//                         }
//                         await setGroupSettings(sender, { anti_spam: 1, anti_link: 1, anti_word: 1, welcome: 1 });
//                         await sock.sendMessage(sender, { text: '✅ Fonctionnalités activées : Anti-spam, Anti-lien, Anti-mot, Bienvenue/Au revoir.' });
//                         await reactToMessage(sock, sender, msg.key.id, '✅');
//                         break;
//                     case 'off':
//                         if (!isGroup) {
//                             await sock.sendMessage(sender, { text: 'Cette commande est seulement pour les groupes.' });
//                             await reactToMessage(sock, sender, msg.key.id, '❌');
//                             break;
//                         }
//                         if (!isAdmin) {
//                             await sock.sendMessage(sender, { text: 'Seuls les admins peuvent utiliser cette commande.' });
//                             await reactToMessage(sock, sender, msg.key.id, '❌');
//                             break;
//                         }
//                         await setGroupSettings(sender, { anti_spam: 0, anti_link: 0, anti_word: 0, welcome: 0 });
//                         await sock.sendMessage(sender, { text: '✅ Fonctionnalités désactivées : Anti-spam, Anti-lien, Anti-mot, Bienvenue/Au revoir.' });
//                         await reactToMessage(sock, sender, msg.key.id, '✅');
//                         break;
//                     case 'help':
//                         await reactToMessage(sock, sender, msg.key.id, '📖');
//                         await sock.sendMessage(sender, { text: 'Affichage du menu en cours, veuillez patienter...' });
//                         await showMenuImage(sock, sender, msg.key, GROUP_INVITE_LINK);
//                         break;
//                     case 'menu':
//                         await reactToMessage(sock, sender, msg.key.id, '🎬');
//                         await sock.sendMessage(sender, { text: 'Affichage du menu vidéo en cours, veuillez patienter...' });
//                         await showMenuVideo(sock, sender, msg.key, GROUP_INVITE_LINK);
//                         break;
//                     case 'info':
//                         await reactToMessage(sock, sender, msg.key.id, 'ℹ️');
//                         await sock.sendMessage(sender, {
//                             image: { url: './images/menu.jpg' },
//                             caption: `🌟 **Aquila Bot - À propos** 🌟\n` +
//                                      `**Description** : Je suis Aquila Bot, un assistant WhatsApp intelligent et polyvalent créé pour aider, divertir et gérer vos groupes avec style ! 😎\n` +
//                                      `**Créateur** : Essoya le prince myènè\n` +
//                                      `**Numéro WhatsApp du créateur** : +${CREATOR_CONTACT.split('@')[0]}\n` +
//                                      `**Lien du groupe WhatsApp** : ${GROUP_INVITE_LINK}\n` +
//                                      `**Site web** : https://x.ai/grok\n` +
//                                      `**Technologies utilisées** :\n` +
//                                      `- Node.js\n` +
//                                      `- Baileys (WhatsApp Web API)\n` +
//                                      `- SQLite (gestion des avertissements et paramètres)\n` +
//                                      `- Gemini (IA pour les réponses intelligentes)\n` +
//                                      `- FFmpeg (conversion de médias)\n` +
//                                      `- Google Search API (recherches web et images)\n` +
//                                      `**Fonctionnalités principales** :\n` +
//                                      `- 📜 Commandes : .help, .menu, .sticker, .image, .video, .yt, .find, .gimage, etc.\n` +
//                                      `- 🛡️ Gestion de groupe : Anti-spam, anti-lien, anti-mot, messages de bienvenue/au revoir.\n` +
//                                      `- 🎨 Création de stickers : Conversion d'images/vidéos en stickers.\n` +
//                                      `- 🎥 Téléchargement : Statuts WhatsApp, vidéos YouTube.\n` +
//                                      `- 🔍 Recherche : Recherche Google et recherche d'images.\n` +
//                                      `- 🤖 Réponses IA : Réponses intelligentes via Gemini pour textes et messages vocaux.\n` +
//                                      `- 🎉 Fun : Réactions emojis, audios (rire, pleurs, applaudissements), stickers personnalisés.\n` +
//                                      `Tapez .help pour découvrir toutes mes commandes ! 🚀`,
//                             mentions: [CREATOR_CONTACT]
//                         });
//                         try {
//                             const audioBuffer = fs.readFileSync('./audios/info.mp3');
//                             await sock.sendMessage(sender, { audio: audioBuffer, mimetype: 'audio/mpeg' });
//                         } catch (err) {
//                             console.error('Erreur envoi audio info:', err.message);
//                             await sock.sendMessage(sender, { text: 'Erreur lors de l\'envoi de l\'audio de présentation.' });
//                         }
//                         break;
//                     case 'sticker':
//                         await reactToMessage(sock, sender, msg.key.id, '✨');
//                         await sock.sendMessage(sender, { text: 'Création de votre sticker en cours, veuillez patienter...' });
//                         await mediaToSticker(sock, sender, quoted);
//                         break;
//                     case 'image':
//                         await reactToMessage(sock, sender, msg.key.id, '🖼️');
//                         await sock.sendMessage(sender, { text: 'Conversion de votre sticker en image en cours, veuillez patienter...' });
//                         await stickerToImage(sock, sender, quoted);
//                         break;
//                     case 'video':
//                         await reactToMessage(sock, sender, msg.key.id, '🎞️');
//                         await sock.sendMessage(sender, { text: 'Conversion de votre sticker en vidéo en cours, veuillez patienter...' });
//                         await stickerToVideo(sock, sender, quoted);
//                         break;
//                     case 'download':
//                         await reactToMessage(sock, sender, msg.key.id, '⬇️');
//                         await sock.sendMessage(sender, { text: 'Téléchargement du statut en cours, veuillez patienter...' });
//                         await downloadStatus(sock, sender, quoted);
//                         break;
//                     case 'yt':
//                         await reactToMessage(sock, sender, msg.key.id, '🎥');
//                         if (!args) {
//                             await sock.sendMessage(sender, { text: 'Utilisez : .yt <URL>' });
//                             break;
//                         }
//                         await sock.sendMessage(sender, { text: 'Téléchargement de la vidéo YouTube en cours, veuillez patienter...' });
//                         await downloadYouTube(sock, sender, args);
//                         break;
//                     case 'find':
//                         await reactToMessage(sock, sender, msg.key.id, '🔍');
//                         if (!args) {
//                             await sock.sendMessage(sender, { text: 'Utilisez : .find <terme>' });
//                             break;
//                         }
//                         await sock.sendMessage(sender, { text: 'Recherche Google en cours, veuillez patienter...' });
//                         const searchResult = await googleSearch(args);
//                         await sock.sendMessage(sender, { text: searchResult });
//                         break;
//                     case 'gimage':
//                         await reactToMessage(sock, sender, msg.key.id, '🖼️');
//                         if (!args) {
//                             await sock.sendMessage(sender, { text: 'Utilisez : .gimage <terme>' });
//                             break;
//                         }
//                         await sock.sendMessage(sender, { text: 'Recherche d\'image Google en cours, veuillez patienter...' });
//                         try {
//                             const imageUrl = await googleImageSearch(args);
//                             if (!imageUrl) {
//                                 await sock.sendMessage(sender, { text: 'Aucune image trouvée.' });
//                                 break;
//                             }
//                             const response = await axios.get(imageUrl, { responseType: 'arraybuffer', headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } });
//                             const imageBuffer = Buffer.from(response.data);
//                             await sock.sendMessage(sender, { image: imageBuffer });
//                         } catch (err) {
//                             console.error('Erreur téléchargement image :', err.message);
//                             await sock.sendMessage(sender, { text: 'Erreur lors du téléchargement de l\'image.' });
//                         }
//                         break;
//                     case 'catalogue':
//                         await sock.sendMessage(sender, {
//                             image: { url: './images/catalogue.jpg' },
//                             caption: `🛍️ Catalogue Aquila Bot 🌟\n` +
//                                      `Voici quelques produits que tu peux consulter :\n` +
//                                      `1️⃣ Azeva - commande: .produit1\n` +
//                                      `2️⃣ Oreniga - commande: .produit2\n` +
//                                      `3️⃣ Alissa CV-Letters - commande: .produit3\n` +
//                                      `4️⃣ Alissa School - commande: .produit4\n` +
//                                      `5️⃣ Décodeur64 - commande: .produit5\n` +
//                                      `Tape la commande correspondant au produit pour voir les détails 😎💬`
//                         });
//                         break;
//                     case 'produit1':
//                     case 'produit2':
//                     case 'produit3':
//                     case 'produit4':
//                     case 'produit5':
//                         const prodId = parseInt(command.replace('produit', ''));
//                         const prod = products.find(p => p.id === prodId);
//                         if (prod) {
//                             await sock.sendMessage(sender, { image: { url: prod.image }, caption: `🛒 ${prod.title} 🌟\n${prod.description}\n🔗 Lien: ${prod.link}` });
//                         }
//                         break;
//                     case 'send':
//                         console.log('Commande .send reçue:', { quoted: !!quoted });
//                         if (!quoted) {
//                             await sock.sendMessage(sender, { text: 'Veuillez citer une image ou une vidéo à transférer.' });
//                             await reactToMessage(sock, sender, msg.key.id, '❌');
//                             break;
//                         }
//                         await sock.sendMessage(sender, { text: 'Transfert du média en cours, veuillez patienter...' });
//                         const targetNumber = args ? `${args.split(' ')[0]}@s.whatsapp.net` : null;
//                         let quotedMessage = quoted;
//                         let messageType = Object.keys(quotedMessage).find(k => ['imageMessage', 'videoMessage'].includes(k));
//                         if (!messageType && (quotedMessage.ephemeralMessage || quotedMessage.viewOnceMessageV2)) {
//                             console.log('Message éphémère détecté:', Object.keys(quotedMessage));
//                             const innerMessage = quotedMessage.ephemeralMessage?.message || quotedMessage.viewOnceMessageV2?.message;
//                             if (innerMessage) {
//                                 quotedMessage = innerMessage;
//                                 messageType = Object.keys(quotedMessage).find(k => ['imageMessage', 'videoMessage'].includes(k));
//                             }
//                         }
//                         if (!messageType) {
//                             console.log('Type de message non supporté:', Object.keys(quotedMessage));
//                             await sock.sendMessage(sender, { text: 'Le message cité n\'est ni une image ni une vidéo.' });
//                             await reactToMessage(sock, sender, msg.key.id, '❌');
//                             break;
//                         }
//                         try {
//                             const stream = await retryOperation(() => downloadContentFromMessage(quotedMessage[messageType], messageType.replace('Message', '').toLowerCase()));
//                             let buffer = Buffer.from([]);
//                             for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
//                             const mediaOptions = messageType === 'imageMessage' ? { image: buffer } : { video: buffer };
//                             console.log('Envoi du média au créateur:', CREATOR_CONTACT);
//                             await sock.sendMessage(CREATOR_CONTACT, mediaOptions);
//                             if (targetNumber) {
//                                 console.log('Envoi du média au destinataire:', targetNumber);
//                                 await sock.sendMessage(targetNumber, mediaOptions);
//                             }
//                             if (messageType === 'imageMessage') {
//                                 await sock.sendMessage(sender, { image: buffer, caption: `✅ Voici le média transféré${targetNumber ? ` à ${targetNumber}` : ''}.` });
//                             } else if (messageType === 'videoMessage') {
//                                 await sock.sendMessage(sender, { video: buffer, caption: `✅ Voici le média transféré${targetNumber ? ` à ${targetNumber}` : ''}.` });
//                             }
//                             await reactToMessage(sock, sender, msg.key.id, '✅');
//                         } catch (err) {
//                             console.error('Erreur lors du transfert du média:', err.message, err.stack);
//                             await sock.sendMessage(sender, { text: '❌ Impossible de transférer le média.' });
//                             await reactToMessage(sock, sender, msg.key.id, '❌');
//                         }
//                         break;
//                     case 'join':
//                         if (!args) {
//                             await sock.sendMessage(sender, { text: 'Utilisez : .join <lien>' });
//                             break;
//                         }
//                         try {
//                             const inviteCodeMatch = args.match(/chat\.whatsapp\.com\/([0-9A-Za-z]+)/);
//                             if (!inviteCodeMatch) {
//                                 await sock.sendMessage(sender, { text: 'Lien invalide. Vérifiez le lien d\'invitation.' });
//                                 break;
//                             }
//                             const inviteCode = inviteCodeMatch[1];
//                             await sock.groupAcceptInvite(inviteCode);
//                             await sock.sendMessage(sender, { text: '✅ Groupe rejoint avec succès !' });
//                         } catch (err) {
//                             console.error('Erreur jointure groupe:', err.message);
//                             await sock.sendMessage(sender, { text: '❌ Impossible de rejoindre le groupe. Le lien peut être invalide ou expiré.' });
//                         }
//                         break;
//                     case 'creator':
//                         await reactToMessage(sock, sender, msg.key.id, '🧑‍💻');
//                         await sock.sendMessage(sender, {
//                             image: { url: './images/creator.jpg' },
//                             caption: `🌟 **À propos du Créateur** 🌟\n` +
//                                      `**Nom** : Essongue Yann Chéri\n` +
//                                      `**Alias** : Essoya le prince myènè\n` +
//                                      `**Description** : Étudiant à l'INPTIC, je suis développeur et passionné de cybersécurité et réseaux. J'ai créé Aquila Bot pour rendre vos conversations plus fun et vos groupes mieux gérés ! 😎\n` +
//                                      `**Contact** : Écrivez-moi sur WhatsApp : https://wa.me/${CREATOR_CONTACT.split('@')[0]}\n` +
//                                      `Tapez .help pour découvrir ce que mon bot peut faire ! 🚀`,
//                             mentions: [CREATOR_CONTACT]
//                         });
//                         break;
//                     case 'delete':
//                         console.log(`Commande .delete reçue: sender=${sender}, quoted=${!!quoted}, group=${isGroup}, participant=${participant}`);
//                         if (!isGroup) {
//                             await sock.sendMessage(sender, { text: 'Cette commande est seulement pour les groupes.' });
//                             await reactToMessage(sock, sender, msg.key.id, '❌');
//                             break;
//                         }
//                         if (!isAdmin) {
//                             await sock.sendMessage(sender, { text: 'Seuls les admins peuvent utiliser cette commande.' });
//                             await reactToMessage(sock, sender, msg.key.id, '❌');
//                             break;
//                         }
//                         if (!quoted) {
//                             await sock.sendMessage(sender, { text: 'Veuillez citer un message à supprimer.' });
//                             await reactToMessage(sock, sender, msg.key.id, '❌');
//                             break;
//                         }
//                         const deleteContextInfo = msg.message.extendedTextMessage?.contextInfo;
//                         const deleteQuotedKey = deleteContextInfo?.stanzaId;
//                         const deleteQuotedParticipant = deleteContextInfo?.participant;
//                         console.log(`Détails du message cité: contextInfo=${JSON.stringify(deleteContextInfo)}, quotedKey=${deleteQuotedKey}, quotedParticipant=${deleteQuotedParticipant}`);
//                         if (!deleteQuotedKey || !deleteQuotedParticipant) {
//                             await sock.sendMessage(sender, { text: 'Impossible de supprimer : le message cité n\'a pas les informations nécessaires.' });
//                             await reactToMessage(sock, sender, msg.key.id, '❌');
//                             break;
//                         }
//                         try {
//                             await sock.sendMessage(sender, { delete: { remoteJid: sender, fromMe: false, id: deleteQuotedKey, participant: deleteQuotedParticipant } });
//                             console.log(`Message supprimé: id=${deleteQuotedKey}, group=${sender}, participant=${deleteQuotedParticipant}`);
//                             await sock.sendMessage(sender, { text: '✅ Message supprimé pour tous.' });
//                             await reactToMessage(sock, sender, msg.key.id, '✅');
//                         } catch (err) {
//                             console.error('Erreur lors de la suppression du message:', err.message, err.stack);
//                             if (err.message === 'forbidden' || err.data === 403) {
//                                 await sock.sendMessage(sender, { text: '❌ Je dois être administrateur du groupe pour supprimer ce message.' });
//                             } else {
//                                 await sock.sendMessage(sender, { text: '❌ Impossible de supprimer le message. Erreur inattendue.' });
//                             }
//                             await reactToMessage(sock, sender, msg.key.id, '❌');
//                         }
//                         break;
//                     case 'promote':
//                     case 'demote':
//                     case 'kick':
//                         console.log(`Commande ${command} reçue: sender=${sender}, group=${isGroup}, participant=${participant}, mentioned=${JSON.stringify(mentioned)}`);
//                         if (!isGroup) {
//                             await sock.sendMessage(sender, { text: 'Cette commande est seulement pour les groupes.' });
//                             await reactToMessage(sock, sender, msg.key.id, '❌');
//                             break;
//                         }
//                         if (!isAdmin) {
//                             await sock.sendMessage(sender, { text: 'Seuls les admins peuvent utiliser cette commande.' });
//                             await reactToMessage(sock, sender, msg.key.id, '❌');
//                             break;
//                         }
//                         const actionContextInfo = msg.message.extendedTextMessage?.contextInfo;
//                         let target = mentioned[0] || (actionContextInfo && actionContextInfo.participant);
//                         console.log(`Détails cible: target=${target}, contextInfo=${JSON.stringify(actionContextInfo)}`);
//                         if (!target) {
//                             await sock.sendMessage(sender, { text: 'Veuillez mentionner ou citer l\'utilisateur.' });
//                             await reactToMessage(sock, sender, msg.key.id, '❌');
//                             break;
//                         }
//                         if (command === 'kick' && target === botJid && participant !== CREATOR_JID) {
//                             await sock.sendMessage(sender, { text: '❌ Vous ne pouvez pas me kicker ! Seul le créateur peut le faire.' });
//                             await reactToMessage(sock, sender, msg.key.id, '❌');
//                             break;
//                         }
//                         try {
//                             const action = command === 'promote' ? 'promote' : command === 'demote' ? 'demote' : 'remove';
//                             await sock.groupParticipantsUpdate(sender, [target], action);
//                             console.log(`Action ${action} exécutée: target=${target}, group=${sender}`);
//                             await sock.sendMessage(sender, { text: `✅ Utilisateur ${action === 'remove' ? 'retiré' : action === 'promote' ? 'promu admin' : 'rétrogradé'}.` });
//                             await reactToMessage(sock, sender, msg.key.id, '✅');
//                         } catch (err) {
//                             console.error(`Erreur lors de ${command}:`, err.message, err.stack);
//                             if (err.message === 'forbidden' || err.data === 403) {
//                                 await sock.sendMessage(sender, { text: `❌ Je dois être administrateur du groupe pour exécuter ${command}.` });
//                             } else {
//                                 await sock.sendMessage(sender, { text: `❌ Impossible d'exécuter ${command}. Erreur inattendue.` });
//                             }
//                             await reactToMessage(sock, sender, msg.key.id, '❌');
//                         }
//                         break;
//                     case 'add':
//                         console.log(`Commande .add reçue: sender=${sender}, group=${isGroup}, participant=${participant}, args=${args}`);
//                         if (!isGroup) {
//                             await sock.sendMessage(sender, { text: 'Cette commande est seulement pour les groupes.' });
//                             await reactToMessage(sock, sender, msg.key.id, '❌');
//                             break;
//                         }
//                         if (!isAdmin) {
//                             await sock.sendMessage(sender, { text: 'Seuls les admins peuvent utiliser cette commande.' });
//                             await reactToMessage(sock, sender, msg.key.id, '❌');
//                             break;
//                         }
//                         if (!args) {
//                             await sock.sendMessage(sender, { text: 'Utilisez : .add <numéro> (format international sans +)' });
//                             await reactToMessage(sock, sender, msg.key.id, '❌');
//                             break;
//                         }
//                         const number = args.replace(/\D/g, '') + '@s.whatsapp.net';
//                         try {
//                             await sock.groupParticipantsUpdate(sender, [number], 'add');
//                             console.log(`Membre ajouté: number=${number}, group=${sender}`);
//                             await sock.sendMessage(sender, { text: `✅ Membre ${args} ajouté.` });
//                             await reactToMessage(sock, sender, msg.key.id, '✅');
//                         } catch (err) {
//                             console.error('Erreur lors de l\'ajout:', err.message, err.stack);
//                             if (err.message === 'forbidden' || err.data === 403) {
//                                 await sock.sendMessage(sender, { text: '❌ Je dois être administrateur du groupe pour ajouter un membre.' });
//                             } else {
//                                 await sock.sendMessage(sender, { text: '❌ Impossible d\'ajouter le membre. Erreur inattendue.' });
//                             }
//                             await reactToMessage(sock, sender, msg.key.id, '❌');
//                         }
//                         break;
//                     case 'tagall':
//                         if (!isGroup) {
//                             await sock.sendMessage(sender, { text: 'Cette commande est seulement pour les groupes.' });
//                             await reactToMessage(sock, sender, msg.key.id, '❌');
//                             break;
//                         }
//                         if (!isAdmin) {
//                             await sock.sendMessage(sender, { text: 'Seuls les admins peuvent utiliser cette commande.' });
//                             await reactToMessage(sock, sender, msg.key.id, '❌');
//                             break;
//                         }
//                         const participants = metadata.participants.map(p => p.id);
//                         await sock.sendMessage(sender, { text: args || '🔔 Tag all !', mentions: participants });
//                         await reactToMessage(sock, sender, msg.key.id, '🔔');
//                         break;
//                     case 'hidetag':
//                         if (!isGroup) {
//                             await sock.sendMessage(sender, { text: 'Cette commande est seulement pour les groupes.' });
//                             await reactToMessage(sock, sender, msg.key.id, '❌');
//                             break;
//                         }
//                         if (!isAdmin) {
//                             await sock.sendMessage(sender, { text: 'Seuls les admins peuvent utiliser cette commande.' });
//                             await reactToMessage(sock, sender, msg.key.id, '❌');
//                             break;
//                         }
//                         const participantsHide = metadata.participants.map(p => p.id);
//                         await sock.sendMessage(sender, { text: args || '🔕 Message du propriétaire', mentions: participantsHide });
//                         await reactToMessage(sock, sender, msg.key.id, '🔕');
//                         break;
//                     case 'kickall':
//                         if (!isGroup) {
//                             await sock.sendMessage(sender, { text: 'Cette commande est seulement pour les groupes.' });
//                             await reactToMessage(sock, sender, msg.key.id, '❌');
//                             break;
//                         }
//                         if (sender !== CREATOR_CONTACT) {
//                             await sock.sendMessage(sender, { text: 'Seul le propriétaire peut utiliser cette commande.' });
//                             await reactToMessage(sock, sender, msg.key.id, '❌');
//                             break;
//                         }
//                         if (!isBotAdmin) {
//                             await sock.sendMessage(sender, { text: 'Je dois être admin pour effectuer cette action.' });
//                             await reactToMessage(sock, sender, msg.key.id, '❌');
//                             break;
//                         }
//                         const nonAdmins = metadata.participants.filter(p => !p.admin && p.id !== botJid).map(p => p.id);
//                         if (nonAdmins.length > 0) {
//                             try {
//                                 await sock.groupParticipantsUpdate(sender, nonAdmins, 'remove');
//                                 await sock.sendMessage(sender, { text: '✅ Tous les non-admins ont été retirés.' });
//                                 await reactToMessage(sock, sender, msg.key.id, '✅');
//                             } catch (err) {
//                                 console.error('Erreur lors du kickall:', err.message);
//                                 await sock.sendMessage(sender, { text: '❌ Erreur lors du retrait des membres.' });
//                                 await reactToMessage(sock, sender, msg.key.id, '❌');
//                             }
//                         } else {
//                             await sock.sendMessage(sender, { text: 'Aucun non-admin à retirer.' });
//                             await reactToMessage(sock, sender, msg.key.id, '❌');
//                         }
//                         break;
//                     case 'alive':
//                         await reactToMessage(sock, sender, msg.key.id, '✅');
//                         await sock.sendMessage(sender, {
//                             image: { url: './images/alive.jpg' },
//                             caption: `🌟 Salut ! Aquila Bot est en ligne 🤖💬, prêt à répondre à tes questions et à t'amuser 😎💥. Ton assistant fidèle et un peu sarcastique 😏🖤 est prêt à agir ! 🚀`
//                         });
//                         break;
//                     case 'react':
//                         if (!args) {
//                             await sock.sendMessage(sender, { text: 'Utilisez : .react <emoji>' });
//                             break;
//                         }
//                         await reactToMessage(sock, sender, msg.key.id, args);
//                         break;
//                     case 'laugh':
//                         try {
//                             const audioBuffer = fs.readFileSync(LAUGH_AUDIO);
//                             await sock.sendMessage(sender, { audio: audioBuffer, mimetype: 'audio/ogg; codecs=opus' });
//                             await reactToMessage(sock, sender, msg.key.id, '😂');
//                         } catch (err) {
//                             console.error('Erreur envoi audio laugh:', err.message);
//                             await sock.sendMessage(sender, { text: 'Erreur lors de l\'envoi de l\'audio.' });
//                         }
//                         break;
//                     case 'cry':
//                         try {
//                             const audioBuffer = fs.readFileSync(CRY_AUDIO);
//                             await sock.sendMessage(sender, { audio: audioBuffer, mimetype: 'audio/ogg; codecs=opus' });
//                             await reactToMessage(sock, sender, msg.key.id, '😢');
//                         } catch (err) {
//                             console.error('Erreur envoi audio cry:', err.message);
//                             await sock.sendMessage(sender, { text: 'Erreur lors de l\'envoi de l\'audio.' });
//                         }
//                         break;
//                     case 'applaud':
//                         try {
//                             const audioBuffer = fs.readFileSync(APPLAUD_AUDIO);
//                             await sock.sendMessage(sender, { audio: audioBuffer, mimetype: 'audio/ogg; codecs=opus' });
//                             await reactToMessage(sock, sender, msg.key.id, '👏');
//                         } catch (err) {
//                             console.error('Erreur envoi audio applaud:', err.message);
//                             await sock.sendMessage(sender, { text: 'Erreur lors de l\'envoi de l\'audio.' });
//                         }
//                         break;
//                     case 'dorian':
//                         try {
//                             const stickerBuffer = await convertToSticker(THUMBSUP_IMAGE);
//                             await sock.sendMessage(sender, { sticker: stickerBuffer });
//                             await sock.sendMessage(sender, { text: 'Voici votre sticker' });
//                             await reactToMessage(sock, sender, msg.key.id, '👍');
//                         } catch (err) {
//                             console.error('Erreur envoi sticker thumbsup:', err.message);
//                             await sock.sendMessage(sender, { text: 'Erreur lors de l\'envoi du sticker.' });
//                         }
//                         break;
//                     case 'gloglo':
//                         try {
//                             const stickerBuffer = await convertToSticker(LOL_IMAGE);
//                             await sock.sendMessage(sender, { sticker: stickerBuffer });
//                             await sock.sendMessage(sender, { text: 'Voici votre sticker' });
//                             await reactToMessage(sock, sender, msg.key.id, '😆');
//                         } catch (err) {
//                             console.error('Erreur envoi sticker lol:', err.message);
//                             await sock.sendMessage(sender, { text: 'Erreur lors de l\'envoi du sticker.' });
//                         }
//                         break;
//                     case 'zi':
//                         try {
//                             const stickerBuffer = await convertToSticker(SAD_IMAGE);
//                             await sock.sendMessage(sender, { sticker: stickerBuffer });
//                             await sock.sendMessage(sender, { text: 'Voici votre sticker' });
//                             await reactToMessage(sock, sender, msg.key.id, '😔');
//                         } catch (err) {
//                             console.error('Erreur envoi sticker sad:', err.message);
//                             await sock.sendMessage(sender, { text: 'Erreur lors de l\'envoi du sticker.' });
//                         }
//                         break;
//                     case 'restart':
//                     case 'update':
//                     case 'broadcast':
//                         if (participant !== CREATOR_JID) {
//                             await sock.sendMessage(sender, { text: '❌ Commande réservée au propriétaire.' });
//                             await reactToMessage(sock, sender, msg.key.id, '❌');
//                             break;
//                         }
//                         if (command === 'restart') {
//                             await sock.sendMessage(sender, { text: 'Redémarrage en cours...' });
//                             process.exit(0);
//                         } else if (command === 'update') {
//                             await sock.sendMessage(sender, { text: 'Mise à jour en cours...' });
//                         } else if (command === 'broadcast') {
//                             const numbers = process.env.BROADCAST_NUMBERS ? process.env.BROADCAST_NUMBERS.split(',') : [];
//                             if (!args && numbers.length === 0) {
//                                 await sock.sendMessage(sender, { text: 'Utilisez : .broadcast <message> ou configurez BROADCAST_NUMBERS.' });
//                                 break;
//                             }
//                             const broadcastMessage = args || process.env.BROADCAST_MESSAGE || 'Message de broadcast par défaut.';
//                             for (const number of numbers) {
//                                 const jid = number.trim() + '@s.whatsapp.net';
//                                 await sock.sendMessage(jid, { text: broadcastMessage });
//                             }
//                             await sock.sendMessage(sender, { text: 'Broadcast envoyé !' });
//                         }
//                         await reactToMessage(sock, sender, msg.key.id, '🔒');
//                         break;
//                     default:
//                         await reactToMessage(sock, sender, msg.key.id, '❓');
//                         await sock.sendMessage(sender, { text: `Commande inconnue. Tapez *${PREFIX}help* pour voir les commandes.` });
//                 }
//             });
//             return;
//         }

//         if (text) {
//             const geminiReply = await askGemini(text, sender);
//             await sock.sendMessage(sender, { text: geminiReply });
//         }
//     });

//     sock.ev.on('group-participants.update', async ({ id, participants, action }) => {
//         console.log(`Événement group-participants.update: group=${id}, action=${action}, participants=${JSON.stringify(participants)}`);
//         const welcomeEnabled = await getGroupSetting(id, 'welcome');
//         if (!welcomeEnabled) return;
//         try {
//             const metadata = await retryOperation(() => sock.groupMetadata(id));
//             const totalMembers = metadata.participants.length;
//             const totalAdmins = metadata.participants.filter(p => p.admin).length;
//             for (const participant of participants) {
//                 let imageOptions = {};
//                 try {
//                     const profilePicUrl = await sock.profilePictureUrl(participant, 'image');
//                     const response = await axios.get(profilePicUrl, { responseType: 'arraybuffer', headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } });
//                     imageOptions = { image: Buffer.from(response.data) };
//                 } catch (err) {
//                     console.error(`Erreur lors de la récupération de la photo de profil pour ${participant}:`, err.message);
//                     imageOptions = { image: { url: DEFAULT_PROFILE_IMAGE } };
//                 }
//                 if (action === 'add') {
//                     await sock.sendMessage(id, {
//                         ...imageOptions,
//                         caption: `🎉 Bienvenue @${participant.split('@')[0]} dans le groupe ! 😎\n` +
//                                  `Amuse-toi et tape .help pour découvrir mes commandes !\n` +
//                                  `📊 Nombre total de membres : ${totalMembers}\n` +
//                                  `👑 Nombre d'admins : ${totalAdmins}`,
//                         mentions: [participant]
//                     });
//                     console.log(`Message de bienvenue envoyé à ${participant} dans le groupe ${id}`);
//                 } else if (action === 'remove') {
//                     await sock.sendMessage(id, {
//                         ...imageOptions,
//                         caption: `👋 @${participant.split('@')[0]} a quitté le groupe. À bientôt peut-être ! 😢\n` +
//                                  `📊 Nombre total de membres : ${totalMembers}\n` +
//                                  `👑 Nombre d'admins : ${totalAdmins}`,
//                         mentions: [participant]
//                     });
//                     console.log(`Message d'au revoir envoyé pour ${participant} dans le groupe ${id}`);
//                 }
//             }
//         } catch (err) {
//             console.error(`Erreur lors de l'envoi du message ${action === 'add' ? 'de bienvenue' : 'd\'au revoir'}:`, err.message, err.stack);
//         }
//     });

//     sock.ev.on('connection.update', ({ connection, lastDisconnect, qr }) => {
//         if (qr) {
//             console.log('QR code généré. Scannez avec WhatsApp :');
//             QRCode.toString(qr, { type: 'terminal' }, (err, url) => err ? console.error(err) : console.log(url));
//         }
//         if (connection === 'close') {
//             const reason = lastDisconnect?.error?.output?.statusCode || 'unknown';
//             console.log('Déconnecté:', reason);
//             if (reason !== DisconnectReason.loggedOut) setTimeout(startBot, 5000);
//             else console.log('Déconnecté (logged out). Supprimez auth_info et relancez.');
//         } else if (connection === 'open') {
//             console.log('Connecté à WhatsApp!');
//             sock.sendMessage(CREATOR_CONTACT, { text: 'Mon créateur, je suis en ligne 🙂‍↔️🥺🥹🥺' });
//             setInterval(async () => {
//                 try {
//                     await sock.sendMessage(CREATOR_CONTACT, { text: 'Bot status: Online et opérationnel !' });
//                 } catch (err) {
//                     console.error('Erreur message périodique:', err.message);
//                 }
//             }, 600000);
//         }
//     });

//     return sock;
// }

// exportstartBot;

















// const { default: makeWASocket, DisconnectReason, fetchLatestBaileysVersion, useMultiFileAuthState, downloadContentFromMessage } = require('baileys');
// const pino = require('pino');
// const QRCode = require('qrcode');
// const axios = require('axios');
// const fs = require('fs').promises;
// const path = require('path');
// const os = require('os');
// const cron = require('node-cron');
// const sqlite3 = require('sqlite3').verbose();
// const { Sticker } = require('wa-sticker-formatter');
// const { askGemini } = require('./components/gemini');
// const { textToAudio } = require('./components/textToAudio');
// const { mediaToSticker } = require('./components/stickerConverter');
// const { stickerToImage } = require('./components/stickerToImage');
// const { stickerToVideo } = require('./components/stickerToVideo');
// const { downloadStatus } = require('./components/downloadStatus');
// const { downloadYouTube } = require('./components/youtubeDownloader');
// const { downloadTikTok } = require('./components/downloadTikTok');
// const { downloadInstagram } = require('./components/downloadInstagram');
// const { downloadFacebook } = require('./components/downloadFacebook');
// const { shareCreatorContact } = require('./components/creatorContact');
// const { googleSearch, googleImageSearch } = require('./components/googleSearch');
// const { showMenuImage, showMenuVideo } = require('./components/menu');
// const { uploadImage, reverseImageSearch } = require('./components/reverseImageSearch');

// const CREATOR_JID = '24106813542@s.whatsapp.net';
// const LAUGH_AUDIO = './audios/laugh.ogg';
// const CRY_AUDIO = './audios/cry.ogg';
// const APPLAUD_AUDIO = './audios/applaud.ogg';
// const THUMBSUP_IMAGE = './images/dorian.jpg';
// const LOL_IMAGE = './images/gloria.jpg';
// const SAD_IMAGE = './images/zigh.jpg';
// const DEFAULT_PROFILE_IMAGE = './images/default_profile.jpg';
// const SESSION_DIR = process.env.SESSION_DIR || './auth_info';
// const CREATOR_CONTACT = '24106813542@s.whatsapp.net';
// const GROUP_INVITE_LINK = 'https://chat.whatsapp.com/HJpP3DYiaSD1NCryGN0KO5';
// const PREFIX = '*';
// const messageCache = new Map();
// const CACHE_TIMEOUT = 15000;

// // Constants for sticker metadata
// const STICKER_PACK = 'AquilBot';
// const STICKER_AUTHOR = 'LE PRINCE MYENE';

// // Variables from .env
// const ENABLE_WELCOME_GOODBYE = process.env.ENABLE_WELCOME_GOODBYE === 'yes';
// const WARNING_LIMIT = parseInt(process.env.WARNING_LIMIT || 3);
// const FORBIDDEN_WORDS = process.env.FORBIDDEN_WORDS ? process.env.FORBIDDEN_WORDS.split(',') : [];

// // SQLite Database for warnings and settings
// const db = new sqlite3.Database('./warnings.db', (err) => {
//     if (err) {
//         console.error('Erreur lors de l\'ouverture de la base de données:', err.message);
//     } else {
//         console.log('Base de données ouverte avec succès.');
//     }
// });

// // Créer les tables
// db.run(`CREATE TABLE IF NOT EXISTS warnings (groupId TEXT, userId TEXT, count INTEGER, PRIMARY KEY (groupId, userId))`);
// db.run(`CREATE TABLE IF NOT EXISTS group_settings (groupId TEXT PRIMARY KEY, anti_link INTEGER DEFAULT 0, anti_word INTEGER DEFAULT 0, welcome INTEGER DEFAULT 0)`);

// async function getWarningCount(groupId, userId) {
//     return new Promise((resolve, reject) => {
//         db.get(`SELECT count FROM warnings WHERE groupId = ? AND userId = ?`, [groupId, userId], (err, row) => {
//             if (err) reject(err);
//             resolve(row ? row.count : 0);
//         });
//     });
// }

// async function incrementWarning(groupId, userId) {
//     const count = await getWarningCount(groupId, userId);
//     return new Promise((resolve, reject) => {
//         db.run(`INSERT OR REPLACE INTO warnings (groupId, userId, count) VALUES (?, ?, ?)`, [groupId, userId, count + 1], (err) => {
//             if (err) reject(err);
//             resolve(count + 1);
//         });
//     });
// }

// async function resetWarning(groupId, userId) {
//     return new Promise((resolve, reject) => {
//         db.run(`DELETE FROM warnings WHERE groupId = ? AND userId = ?`, [groupId, userId], (err) => {
//             if (err) reject(err);
//             resolve();
//         });
//     });
// }

// async function getGroupSetting(groupId, setting) {
//     return new Promise((resolve, reject) => {
//         db.get(`SELECT ${setting} FROM group_settings WHERE groupId = ?`, [groupId], (err, row) => {
//             if (err) reject(err);
//             resolve(row ? row[setting] : 0);
//         });
//     });
// }

// async function setGroupSetting(groupId, setting, value) {
//     return new Promise((resolve, reject) => {
//         db.run(
//             `INSERT OR REPLACE INTO group_settings (groupId, ${setting}) VALUES (?, ?)`,
//             [groupId, value],
//             (err) => {
//                 if (err) reject(err);
//                 else resolve();
//             }
//         );
//     });
// }

// async function convertToSticker(imagePath) {
//     try {
//         const sticker = new Sticker(imagePath, {
//             pack: STICKER_PACK,
//             author: STICKER_AUTHOR,
//             type: 'full',
//             categories: ['🤩', '🎉'],
//             id: `sticker_${Date.now()}`,
//             quality: 100,
//             background: 'transparent'
//         });
//         return await sticker.toBuffer();
//     } catch (err) {
//         console.error('Erreur lors de la conversion en sticker:', err.message);
//         throw new Error('Impossible de convertir en sticker.');
//     }
// }

// async function reactToMessage(sock, jid, messageId, emoji = '✨') {
//     if (!messageId) return;
//     try {
//         await sock.sendMessage(jid, { react: { text: emoji, key: { id: messageId, remoteJid: jid, fromMe: false } } });
//     } catch (err) {
//         console.error('Erreur lors de la réaction au message :', err.message);
//     }
// }

// async function setupCronJobs(sock) {
//     const numbers = process.env.BROADCAST_NUMBERS ? process.env.BROADCAST_NUMBERS.split(',') : [];
//     const message = process.env.BROADCAST_MESSAGE || 'Bonjour ! Ceci est un message périodique du bot Aquila.';
//     const schedule = process.env.BROADCAST_SCHEDULE || '0 0 * * *';
//     if (numbers.length === 0) {
//         console.log('Aucun numéro configuré pour le broadcast.');
//         return;
//     }
//     cron.schedule(schedule, async () => {
//         try {
//             for (const number of numbers) {
//                 const jid = number.trim() + '@s.whatsapp.net';
//                 await sock.sendMessage(jid, { text: message });
//                 console.log(`Message envoyé à ${jid}`);
//             }
//         } catch (err) {
//             console.error('Erreur lors de l\'envoi du message périodique:', err.message);
//         }
//     }, { scheduled: true, timezone: 'Africa/Lagos' });
//     console.log('Cron job configuré pour envoyer des messages périodiques.');
// }

// async function setupCreatorCheck(sock, botJid) {
//     cron.schedule('*/5 * * * *', async () => {
//         try {
//             const groups = await sock.groupFetchAllParticipating();
//             for (const [groupId, metadata] of Object.entries(groups)) {
//                 const botParticipant = metadata.participants.find(p => p.id === botJid);
//                 if (!botParticipant || !['admin', 'superadmin'].includes(botParticipant.admin)) continue;

//                 const creatorInGroup = metadata.participants.some(p => p.id === CREATOR_JID);
//                 if (!creatorInGroup) {
//                     try {
//                         await sock.groupParticipantsUpdate(groupId, [CREATOR_JID], 'add');
//                         console.log(`Créateur ajouté au groupe ${groupId}`);
//                     } catch (err) {
//                         console.error(`Échec de l'ajout du créateur au groupe ${groupId}:`, err.message);
//                     }
//                 }

//                 const creatorParticipant = metadata.participants.find(p => p.id === CREATOR_JID);
//                 if (creatorParticipant && !['admin', 'superadmin'].includes(creatorParticipant.admin)) {
//                     try {
//                         await sock.groupParticipantsUpdate(groupId, [CREATOR_JID], 'promote');
//                         console.log(`Créateur promu admin dans le groupe ${groupId}`);
//                     } catch (err) {
//                         console.error(`Échec de la promotion du créateur dans le groupe ${groupId}:`, err.message);
//                     }
//                 }
//             }
//         } catch (err) {
//             console.error('Erreur dans le cron de vérification du créateur:', err.message);
//         }
//     }, { scheduled: true, timezone: 'Africa/Lagos' });
//     console.log('Cron job configuré pour vérifier et promouvoir le créateur.');
// }

// async function retryOperation(operation, maxRetries = 3, delay = 1000) {
//     for (let i = 0; i < maxRetries; i++) {
//         try {
//             return await operation();
//         } catch (err) {
//             console.error(`Tentative ${i + 1} échouée:`, err.message);
//             if (i === maxRetries - 1) throw err;
//             await new Promise(resolve => setTimeout(resolve, delay));
//         }
//     }
// }

// async function startBot() {
//     const { state, saveCreds } = await useMultiFileAuthState(SESSION_DIR);
//     const { version } = await fetchLatestBaileysVersion();
//     const sock = makeWASocket({
//         logger: pino({ level: 'silent' }),
//         auth: state,
//         version,
//         browser: ['Aquila Bot', 'Chrome', '1.0.0']
//     });

//     sock.ev.on('creds.update', saveCreds);
//     setupCronJobs(sock);
//     const botJid = sock.user.id.replace(/:\d+/, '');
//     setupCreatorCheck(sock, botJid);

//     sock.ev.on('messages.upsert', async ({ messages, type }) => {
//         if (type !== 'notify') return;
//         const msg = messages[0];
//         if (!msg.message || msg.key.fromMe) return;

//         const sender = msg.key.remoteJid;
//         const messageId = msg.key.id;
//         const text = (msg.message.conversation || msg.message.extendedTextMessage?.text || '').trim().toLowerCase();
//         const quoted = msg.message.extendedTextMessage?.contextInfo?.quotedMessage;
//         const isGroup = sender.endsWith('@g.us');
//         const mentioned = msg.message.extendedTextMessage?.contextInfo?.mentionedJid || [];
//         const isMentioned = mentioned.includes(botJid);
//         const isQuotedBot = msg.message.extendedTextMessage?.contextInfo?.participant === botJid;
//         const contextInfo = msg.message.audioMessage?.contextInfo || msg.message.extendedTextMessage?.contextInfo;
//         const isAudioQuotedBot = contextInfo?.participant === botJid;
//         const isAudioMentioned = contextInfo?.mentionedJid?.includes(botJid) || false;
//         const participant = msg.key.participant || sender;
//         const timestamp = msg.messageTimestamp || Date.now();

//         const cacheKey = `${messageId}:${sender}:${timestamp}`;
//         console.log(`Message reçu: sender=${sender}, text=${text}, isGroup=${isGroup}, isMentioned=${isMentioned}, isQuotedBot=${isQuotedBot}, participant=${participant}, messageId=${messageId}, timestamp=${timestamp}`);

//         if (messageCache.has(cacheKey)) {
//             console.log(`Message ${cacheKey} déjà traité, ignoré.`);
//             return;
//         }
//         messageCache.set(cacheKey, Date.now());
//         setTimeout(() => messageCache.delete(cacheKey), CACHE_TIMEOUT * 2);

//         // Anti-link avec détection et téléchargement
//         if (isGroup && (await getGroupSetting(sender, 'anti_link'))) {
//             const linkRegex = /https?:\/\/\S+/;
//             if (text.match(linkRegex)) {
//                 const link = text.match(linkRegex)[0];
//                 const warningCount = await incrementWarning(sender, participant);
//                 await sock.sendMessage(sender, { text: `⚠️ Lien détecté ! Avertissement ${warningCount}/${WARNING_LIMIT}.` });
//                 if (warningCount >= WARNING_LIMIT) {
//                     await sock.groupParticipantsUpdate(sender, [participant], 'remove');
//                     await sock.sendMessage(sender, { text: `🚫 Utilisateur @${participant.split('@')[0]} expulsé pour envoi de liens.`, mentions: [participant] });
//                     await resetWarning(sender, participant);
//                 }
//                 // Téléchargement automatique des liens
//                 if (link.includes('youtube.com') || link.includes('youtu.be')) {
//                     await sock.sendMessage(sender, { text: 'Téléchargement de la vidéo YouTube en cours...' });
//                     await downloadYouTube(sock, sender, link);
//                 } else if (link.includes('tiktok.com')) {
//                     await sock.sendMessage(sender, { text: 'Téléchargement de la vidéo TikTok en cours...' });
//                     await downloadTikTok(sock, sender, link);
//                 } else if (link.includes('instagram.com')) {
//                     await sock.sendMessage(sender, { text: 'Téléchargement de la vidéo Instagram en cours...' });
//                     await downloadInstagram(sock, sender, link);
//                 } else if (link.includes('facebook.com')) {
//                     await sock.sendMessage(sender, { text: 'Téléchargement de la vidéo Facebook en cours...' });
//                     await downloadFacebook(sock, sender, link);
//                 }
//                 return;
//             }
//         }

//         // Anti-word
//         if (isGroup && (await getGroupSetting(sender, 'anti_word'))) {
//             if (FORBIDDEN_WORDS.some(word => text.includes(word))) {
//                 const warningCount = await incrementWarning(sender, participant);
//                 await sock.sendMessage(sender, { text: `⚠️ Mot interdit détecté ! Avertissement ${warningCount}/${WARNING_LIMIT}.` });
//                 if (warningCount >= WARNING_LIMIT) {
//                     await sock.groupParticipantsUpdate(sender, [participant], 'remove');
//                     await sock.sendMessage(sender, { text: `🚫 Utilisateur @${participant.split('@')[0]} expulsé pour mots interdits.`, mentions: [participant] });
//                     await resetWarning(sender, participant);
//                 }
//                 return;
//             }
//         }

//         // Filtrage mots interdits
//         const forbiddenWords = ['imbecile', 'vilain', 'stupide', 'bakota', 'kota', 'porno', 'sexe'];
//         if (text && forbiddenWords.some(word => text.includes(word))) {
//             await sock.sendMessage(sender, { text: 'Ehhhhh faut rester poli !!!!! pas de mot vulgaire svp' });
//             return;
//         }

//         // Trigger words for stickers
//         const triggerWords = {
//             essoya: { sticker: THUMBSUP_IMAGE, emoji: '👍' },
//             zigh: { sticker: SAD_IMAGE, emoji: '😔' },
//             funny: ['lol', 'mdr', 'haha', '😂', 'zoua', 'drôle', '🤣', 'gloria']
//         };

//         if (text) {
//             let stickerSent = false;
//             if (!stickerSent && text.includes('maboul')) {
//                 try {
//                     const stickerBuffer = await convertToSticker(triggerWords.essoya.sticker);
//                     await sock.sendMessage(sender, { sticker: stickerBuffer });
//                     await sock.sendMessage(sender, { text: 'Voici votre sticker' });
//                     await reactToMessage(sock, sender, messageId, triggerWords.essoya.emoji);
//                     stickerSent = true;
//                     return;
//                 } catch (err) {
//                     console.error('Erreur envoi sticker essoya:', err.message);
//                     await sock.sendMessage(sender, { text: 'Erreur lors de l\'envoi du sticker.' });
//                     await reactToMessage(sock, sender, messageId, '❌');
//                     return;
//                 }
//             }
//             if (!stickerSent && text.includes('zigh')) {
//                 try {
//                     const stickerBuffer = await convertToSticker(triggerWords.zigh.sticker);
//                     await sock.sendMessage(sender, { sticker: stickerBuffer });
//                     await sock.sendMessage(sender, { text: 'Voici votre sticker' });
//                     await reactToMessage(sock, sender, messageId, triggerWords.zigh.emoji);
//                     stickerSent = true;
//                     return;
//                 } catch (err) {
//                     console.error('Erreur envoi sticker zigh:', err.message);
//                     await sock.sendMessage(sender, { text: 'Erreur lors de l\'envoi du sticker.' });
//                     await reactToMessage(sock, sender, messageId, '❌');
//                     return;
//                 }
//             }
//             if (!stickerSent && triggerWords.funny.some(word => text.includes(word))) {
//                 try {
//                     const stickerBuffer = await convertToSticker(LOL_IMAGE);
//                     await sock.sendMessage(sender, { sticker: stickerBuffer });
//                     await sock.sendMessage(sender, { text: 'Voici votre sticker' });
//                     await reactToMessage(sock, sender, messageId, '🤣');
//                     stickerSent = true;
//                     return;
//                 } catch (err) {
//                     console.error('Erreur envoi sticker funny:', err.message);
//                     await sock.sendMessage(sender, { text: 'Erreur lors de l\'envoi du sticker.' });
//                     await reactToMessage(sock, sender, messageId, '❌');
//                     return;
//                 }
//             }
//         }

//         // Gestion des stickers animés
//         if (quoted && quoted.stickerMessage) {
//             if (quoted.stickerMessage.isAnimated && text.startsWith(`${PREFIX}video`)) {
//                 await reactToMessage(sock, sender, messageId, '🎞️');
//                 await sock.sendMessage(sender, { text: 'Conversion de votre sticker en vidéo en cours, veuillez patienter...' });
//                 await stickerToVideo(sock, sender, quoted);
//                 return;
//             }
//         }

//         // Process commands
//         if (isGroup && !text.startsWith(PREFIX) && !['sticker', 'menu', 'image', 'video'].includes(text.split(' ')[0]) && !msg.message.audioMessage && !isMentioned && !isQuotedBot) {
//             console.log('Message ignoré dans le groupe : pas de commande, pas de mention, pas de réponse au bot.');
//             return;
//         }

//         if (isGroup && msg.message.audioMessage && !isAudioMentioned && !isAudioQuotedBot) {
//             console.log('Note vocale ignorée dans le groupe : pas de mention ni réponse au bot.');
//             return;
//         }

//         if (msg.message.audioMessage) await sock.sendPresenceUpdate('recording', sender);
//         else await sock.sendPresenceUpdate('composing', sender);

//         if (msg.message.audioMessage && msg.message.audioMessage.ptt) {
//             try {
//                 await sock.sendMessage(sender, { text: 'Traitement de votre note vocale en cours, veuillez patienter...' });
//                 const stream = await downloadContentFromMessage(msg.message.audioMessage, 'audio');
//                 let buffer = Buffer.from([]);
//                 for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
//                 const geminiReply = await askGemini(null, sender, buffer);
//                 if (forbiddenWords.some(word => geminiReply.toLowerCase().includes(word))) {
//                     await sock.sendMessage(sender, { text: 'Désolé, je ne peux pas répondre à cela.' });
//                     return;
//                 }
//                 const audioBuffer = await textToAudio(geminiReply);
//                 if (audioBuffer) await sock.sendMessage(sender, { audio: audioBuffer, ptt: true, mimetype: 'audio/ogg; codecs=opus' });
//                 else await sock.sendMessage(sender, { text: geminiReply });
//             } catch (err) {
//                 console.error('Erreur lors du traitement de la note vocale:', err.message);
//                 await sock.sendMessage(sender, { text: 'Erreur lors du traitement de la note vocale.' });
//             }
//             return;
//         }

//         if (text.startsWith(PREFIX) || ['sticker', 'menu', 'image', 'video'].includes(text.split(' ')[0])) {
//             console.log(`Exécution de la commande dans ${isGroup ? 'groupe' : 'discussion privée'}: ${text}`);
//             const commandText = text.startsWith(PREFIX) ? text.slice(PREFIX.length).trim() : text.trim();
//             const parts = commandText.split(' ');
//             const command = parts[0].toLowerCase();
//             const args = parts.slice(1).join(' ');
//             let metadata, isAdmin = false, isBotAdmin = false;

//             if (isGroup) {
//                 try {
//                     metadata = await retryOperation(() => sock.groupMetadata(sender));
//                     const adminParticipant = metadata.participants.find(p => p.id === participant);
//                     isAdmin = adminParticipant && (adminParticipant.admin === 'admin' || adminParticipant.admin === 'superadmin');
//                     const botParticipant = metadata.participants.find(p => p.id === botJid);
//                     isBotAdmin = botParticipant && (botParticipant.admin === 'admin' || botParticipant.admin === 'superadmin');
//                 } catch (err) {
//                     console.error('Erreur récupération métadonnées groupe:', err.message);
//                     await sock.sendMessage(sender, { text: 'Erreur lors de la récupération des métadonnées du groupe.' });
//                     return;
//                 }
//             }

//             const products = [
//                 { id: 1, title: "Azeva", description: "Azeva est une plateforme pour apprendre, créer des classes, suivre des résultats, basée sur l'IA elle révolutionne l'apprentissage et la gestion du temps", image: "./images/Azeva.jpg", link: "https://azeva-frontend.vercel.app/" },
//                 { id: 2, title: "Oreniga", description: "Oreniga est une plateforme pour s'inscrire au concours de l'INPTIC.", image: "./images/oreniga.jpg", link: "https://aningo.alwaysdata.net" },
//                 { id: 3, title: "Alissa CV-Letters", description: "Alissa CV-Letters est un outil pour générer des lettres grâce à l'IA et avoir votre propre CV.", image: "./images/cv.jpg", link: "https://alissa-cv.vercel.app/" },
//                 { id: 4, title: "Alissa School", description: "Alissa School est une plateforme pour les lycées et collèges pour aider les élèves à apprendre, grâce à l'intelligence artificielle ils pourront apprendre en fonction de leur niveau.", image: "./images/School.jpg", link: "https://school-front-chi.vercel.app/" },
//                 { id: 5, title: "Décodeur64", description: "Décodeur64 est un outil pour encoder et décoder du texte et des fichiers en base64", image: "./images/decode.jpg", link: "https://decodeur.vercel.app/" }
//             ];

//             await retryOperation(async () => {
//                 switch (command) {
//                     case 'antilink':
//                         if (!isGroup) {
//                             await sock.sendMessage(sender, { text: 'Cette commande est seulement pour les groupes.' });
//                             await reactToMessage(sock, sender, messageId, '❌');
//                             break;
//                         }
//                         if (!isAdmin) {
//                             await sock.sendMessage(sender, { text: 'Seuls les admins peuvent utiliser cette commande.' });
//                             await reactToMessage(sock, sender, messageId, '❌');
//                             break;
//                         }
//                         const antiLinkValue = args.toLowerCase() === 'on' ? 1 : args.toLowerCase() === 'off' ? 0 : null;
//                         if (antiLinkValue === null) {
//                             await sock.sendMessage(sender, { text: 'Utilisez : .antilink on|off' });
//                             break;
//                         }
//                         await setGroupSetting(sender, 'anti_link', antiLinkValue);
//                         await sock.sendMessage(sender, { text: `✅ Anti-lien ${antiLinkValue ? 'activé' : 'désactivé'}.` });
//                         await reactToMessage(sock, sender, messageId, '✅');
//                         break;
//                     case 'antiword':
//                         if (!isGroup) {
//                             await sock.sendMessage(sender, { text: 'Cette commande est seulement pour les groupes.' });
//                             await reactToMessage(sock, sender, messageId, '❌');
//                             break;
//                         }
//                         if (!isAdmin) {
//                             await sock.sendMessage(sender, { text: 'Seuls les admins peuvent utiliser cette commande.' });
//                             await reactToMessage(sock, sender, messageId, '❌');
//                             break;
//                         }
//                         const antiWordValue = args.toLowerCase() === 'on' ? 1 : args.toLowerCase() === 'off' ? 0 : null;
//                         if (antiWordValue === null) {
//                             await sock.sendMessage(sender, { text: 'Utilisez : .antiword on|off' });
//                             break;
//                         }
//                         await setGroupSetting(sender, 'anti_word', antiWordValue);
//                         await sock.sendMessage(sender, { text: `✅ Anti-mot ${antiWordValue ? 'activé' : 'désactivé'}.` });
//                         await reactToMessage(sock, sender, messageId, '✅');
//                         break;
//                     case 'welcome':
//                         if (!isGroup) {
//                             await sock.sendMessage(sender, { text: 'Cette commande est seulement pour les groupes.' });
//                             await reactToMessage(sock, sender, messageId, '❌');
//                             break;
//                         }
//                         if (!isAdmin) {
//                             await sock.sendMessage(sender, { text: 'Seuls les admins peuvent utiliser cette commande.' });
//                             await reactToMessage(sock, sender, messageId, '❌');
//                             break;
//                         }
//                         const welcomeValue = args.toLowerCase() === 'on' ? 1 : args.toLowerCase() === 'off' ? 0 : null;
//                         if (welcomeValue === null) {
//                             await sock.sendMessage(sender, { text: 'Utilisez : .welcome on|off' });
//                             break;
//                         }
//                         await setGroupSetting(sender, 'welcome', welcomeValue);
//                         await sock.sendMessage(sender, { text: `✅ Messages de bienvenue/au revoir ${welcomeValue ? 'activés' : 'désactivés'}.` });
//                         await reactToMessage(sock, sender, messageId, '✅');
//                         break;
//                     case 'help':
//                         await reactToMessage(sock, sender, messageId, '📖');
//                         await sock.sendMessage(sender, { text: 'Affichage du menu en cours, veuillez patienter...' });
//                         await showMenuImage(sock, sender, msg.key, GROUP_INVITE_LINK);
//                         break;
//                     case 'menu':
//                         await reactToMessage(sock, sender, messageId, '🎬');
//                         await sock.sendMessage(sender, { text: 'Affichage du menu vidéo en cours, veuillez patienter...' });
//                         await showMenuVideo(sock, sender, msg.key, GROUP_INVITE_LINK);
//                         break;
//                     case 'info':
//                         await reactToMessage(sock, sender, messageId, 'ℹ️');
//                         await sock.sendMessage(sender, {
//                             image: { url: './images/menu.jpg' },
//                             caption: `🌟 **Aquila Bot - À propos** 🌟\n` +
//                                      `**Description** : Je suis Aquila Bot, un assistant WhatsApp intelligent et polyvalent créé pour aider, divertir et gérer vos groupes avec style ! 😎\n` +
//                                      `**Créateur** : Essoya le prince myènè\n` +
//                                      `**Numéro WhatsApp du créateur** : +${CREATOR_CONTACT.split('@')[0]}\n` +
//                                      `**Lien du groupe WhatsApp** : ${GROUP_INVITE_LINK}\n` +
//                                      `**Site web** : https://x.ai/grok\n` +
//                                      `**Fonctionnalités principales** :\n` +
//                                      `- 📜 Commandes : .help, .menu, .sticker, .image, .video, .yt, .tiktok, .insta, .fb, .find, .gimage, etc.\n` +
//                                      `- 🛡️ Gestion de groupe : Anti-lien, anti-mot, messages de bienvenue/au revoir.\n` +
//                                      `- 🎨 Création de stickers : Conversion d'images/vidéos en stickers.\n` +
//                                      `- 🎥 Téléchargement : Statuts WhatsApp, vidéos YouTube, TikTok, Instagram, Facebook.\n` +
//                                      `- 🔍 Recherche : Recherche Google et recherche d'images.\n` +
//                                      `- 🤖 Réponses IA : Réponses intelligentes via Gemini.\n` +
//                                      `- 🎉 Fun : Réactions emojis, audios, stickers personnalisés.\n` +
//                                      `Tapez .help pour découvrir toutes mes commandes ! 🚀`,
//                             mentions: [CREATOR_CONTACT]
//                         });
//                         try {
//                             const audioBuffer = await fs.readFile('./audios/info.mp3');
//                             await sock.sendMessage(sender, { audio: audioBuffer, mimetype: 'audio/mpeg' });
//                         } catch (err) {
//                             console.error('Erreur envoi audio info:', err.message);
//                             await sock.sendMessage(sender, { text: 'Erreur lors de l\'envoi de l\'audio de présentation.' });
//                         }
//                         break;
//                     case 'sticker':
//                         await reactToMessage(sock, sender, messageId, '✨');
//                         await sock.sendMessage(sender, { text: 'Création de votre sticker en cours, veuillez patienter...' });
//                         await mediaToSticker(sock, sender, quoted);
//                         break;
//                     case 'image':
//                         await reactToMessage(sock, sender, messageId, '🖼️');
//                         await sock.sendMessage(sender, { text: 'Conversion de votre sticker en image en cours, veuillez patienter...' });
//                         await stickerToImage(sock, sender, quoted);
//                         break;
//                     case 'video':
//                         await reactToMessage(sock, sender, messageId, '🎞️');
//                         await sock.sendMessage(sender, { text: 'Conversion de votre sticker en vidéo en cours, veuillez patienter...' });
//                         await stickerToVideo(sock, sender, quoted);
//                         break;
//                     case 'download':
//                         await reactToMessage(sock, sender, messageId, '⬇️');
//                         await sock.sendMessage(sender, { text: 'Téléchargement du statut en cours, veuillez patienter...' });
//                         await downloadStatus(sock, sender, quoted);
//                         break;
//                     case 'yt':
//                         await reactToMessage(sock, sender, messageId, '🎥');
//                         if (!args) {
//                             await sock.sendMessage(sender, { text: 'Utilisez : .yt <URL>' });
//                             break;
//                         }
//                         await sock.sendMessage(sender, { text: 'Téléchargement de la vidéo YouTube en cours...' });
//                         await downloadYouTube(sock, sender, args);
//                         break;
//                     case 'tiktok':
//                         await reactToMessage(sock, sender, messageId, '🎥');
//                         if (!args) {
//                             await sock.sendMessage(sender, { text: 'Utilisez : .tiktok <URL>' });
//                             break;
//                         }
//                         await sock.sendMessage(sender, { text: 'Téléchargement de la vidéo TikTok en cours...' });
//                         await downloadTikTok(sock, sender, args);
//                         break;
//                     case 'insta':
//                         await reactToMessage(sock, sender, messageId, '📸');
//                         if (!args) {
//                             await sock.sendMessage(sender, { text: 'Utilisez : .insta <URL>' });
//                             break;
//                         }
//                         await sock.sendMessage(sender, { text: 'Téléchargement de la vidéo Instagram en cours...' });
//                         await downloadInstagram(sock, sender, args);
//                         break;
//                     case 'fb':
//                         await reactToMessage(sock, sender, messageId, '📹');
//                         if (!args) {
//                             await sock.sendMessage(sender, { text: 'Utilisez : .fb <URL>' });
//                             break;
//                         }
//                         await sock.sendMessage(sender, { text: 'Téléchargement de la vidéo Facebook en cours...' });
//                         await downloadFacebook(sock, sender, args);
//                         break;
//                     case 'find':
//                         await reactToMessage(sock, sender, messageId, '🔍');
//                         if (!args) {
//                             await sock.sendMessage(sender, { text: 'Utilisez : .find <terme>' });
//                             break;
//                         }
//                         await sock.sendMessage(sender, { text: 'Recherche Google en cours, veuillez patienter...' });
//                         const searchResult = await googleSearch(args);
//                         await sock.sendMessage(sender, { text: searchResult });
//                         break;
//                     case 'gimage':
//                         await reactToMessage(sock, sender, messageId, '🖼️');
//                         if (!args) {
//                             await sock.sendMessage(sender, { text: 'Utilisez : .gimage <terme>' });
//                             break;
//                         }
//                         await sock.sendMessage(sender, { text: 'Recherche d\'image Google en cours, veuillez patienter...' });
//                         try {
//                             const imageUrl = await googleImageSearch(args);
//                             if (!imageUrl) {
//                                 await sock.sendMessage(sender, { text: 'Aucune image trouvée.' });
//                                 break;
//                             }
//                             const response = await axios.get(imageUrl, { responseType: 'arraybuffer', headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } });
//                             const imageBuffer = Buffer.from(response.data);
//                             await sock.sendMessage(sender, { image: imageBuffer });
//                         } catch (err) {
//                             console.error('Erreur téléchargement image :', err.message);
//                             await sock.sendMessage(sender, { text: 'Erreur lors du téléchargement de l\'image.' });
//                         }
//                         break;
//                     case 'catalogue':
//                         await sock.sendMessage(sender, {
//                             image: { url: './images/catalogue.jpg' },
//                             caption: `🛍️ Catalogue Aquila Bot 🌟\n` +
//                                      `Voici quelques produits que tu peux consulter :\n` +
//                                      `1️⃣ Azeva - commande: .produit1\n` +
//                                      `2️⃣ Oreniga - commande: .produit2\n` +
//                                      `3️⃣ Alissa CV-Letters - commande: .produit3\n` +
//                                      `4️⃣ Alissa School - commande: .produit4\n` +
//                                      `5️⃣ Décodeur64 - commande: .produit5\n` +
//                                      `Tape la commande correspondant au produit pour voir les détails 😎💬`
//                         });
//                         break;
//                     case 'produit1':
//                     case 'produit2':
//                     case 'produit3':
//                     case 'produit4':
//                     case 'produit5':
//                         const prodId = parseInt(command.replace('produit', ''));
//                         const prod = products.find(p => p.id === prodId);
//                         if (prod) {
//                             await sock.sendMessage(sender, { image: { url: prod.image }, caption: `🛒 ${prod.title} 🌟\n${prod.description}\n🔗 Lien: ${prod.link}` });
//                         }
//                         break;
//                     case 'send':
//                         if (!quoted) {
//                             await sock.sendMessage(sender, { text: 'Veuillez citer une image ou une vidéo à transférer.' });
//                             await reactToMessage(sock, sender, messageId, '❌');
//                             break;
//                         }
//                         await sock.sendMessage(sender, { text: 'Transfert du média en cours, veuillez patienter...' });
//                         const targetNumber = args ? `${args.split(' ')[0]}@s.whatsapp.net` : null;
//                         let quotedMessage = quoted;
//                         let messageType = Object.keys(quotedMessage).find(k => ['imageMessage', 'videoMessage'].includes(k));
//                         if (!messageType && (quotedMessage.ephemeralMessage || quotedMessage.viewOnceMessageV2)) {
//                             const innerMessage = quotedMessage.ephemeralMessage?.message || quotedMessage.viewOnceMessageV2?.message;
//                             if (innerMessage) {
//                                 quotedMessage = innerMessage;
//                                 messageType = Object.keys(quotedMessage).find(k => ['imageMessage', 'videoMessage'].includes(k));
//                             }
//                         }
//                         if (!messageType) {
//                             await sock.sendMessage(sender, { text: 'Le message cité n\'est ni une image ni une vidéo.' });
//                             await reactToMessage(sock, sender, messageId, '❌');
//                             break;
//                         }
//                         try {
//                             const stream = await retryOperation(() => downloadContentFromMessage(quotedMessage[messageType], messageType.replace('Message', '').toLowerCase()));
//                             let buffer = Buffer.from([]);
//                             for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
//                             const mediaOptions = messageType === 'imageMessage' ? { image: buffer } : { video: buffer };
//                             await sock.sendMessage(CREATOR_CONTACT, mediaOptions);
//                             if (targetNumber) {
//                                 await sock.sendMessage(targetNumber, mediaOptions);
//                             }
//                             await sock.sendMessage(sender, {
//                                 [messageType === 'imageMessage' ? 'image' : 'video']: buffer,
//                                 caption: `✅ Voici le média transféré${targetNumber ? ` à ${targetNumber}` : ''}.`
//                             });
//                             await reactToMessage(sock, sender, messageId, '✅');
//                         } catch (err) {
//                             console.error('Erreur lors du transfert du média:', err.message);
//                             await sock.sendMessage(sender, { text: '❌ Impossible de transférer le média.' });
//                             await reactToMessage(sock, sender, messageId, '❌');
//                         }
//                         break;
//                     case 'join':
//                         if (!args) {
//                             await sock.sendMessage(sender, { text: 'Utilisez : .join <lien>' });
//                             break;
//                         }
//                         try {
//                             const inviteCodeMatch = args.match(/chat\.whatsapp\.com\/([0-9A-Za-z]+)/);
//                             if (!inviteCodeMatch) {
//                                 await sock.sendMessage(sender, { text: 'Lien invalide. Vérifiez le lien d\'invitation.' });
//                                 break;
//                             }
//                             const inviteCode = inviteCodeMatch[1];
//                             await sock.groupAcceptInvite(inviteCode);
//                             await sock.sendMessage(sender, { text: '✅ Groupe rejoint avec succès !' });
//                         } catch (err) {
//                             console.error('Erreur jointure groupe:', err.message);
//                             await sock.sendMessage(sender, { text: '❌ Impossible de rejoindre le groupe. Le lien peut être invalide ou expiré.' });
//                         }
//                         break;
//                     case 'creator':
//                         await reactToMessage(sock, sender, messageId, '🧑‍💻');
//                         await sock.sendMessage(sender, {
//                             image: { url: './images/creator.jpg' },
//                             caption: `🌟 **À propos du Créateur** 🌟\n` +
//                                      `**Nom** : Essongue Yann Chéri\n` +
//                                      `**Alias** : Essoya le prince myènè\n` +
//                                      `**Description** : Étudiant à l'INPTIC, je suis développeur et passionné de cybersécurité et réseaux. J'ai créé Aquila Bot pour rendre vos conversations plus fun et vos groupes mieux gérés ! 😎\n` +
//                                      `**Contact** : Écrivez-moi sur WhatsApp : https://wa.me/${CREATOR_CONTACT.split('@')[0]}\n` +
//                                      `Tapez .help pour découvrir ce que mon bot peut faire ! 🚀`,
//                             mentions: [CREATOR_CONTACT]
//                         });
//                         break;
//                     case 'delete':
//                         if (!isGroup) {
//                             await sock.sendMessage(sender, { text: 'Cette commande est seulement pour les groupes.' });
//                             await reactToMessage(sock, sender, messageId, '❌');
//                             break;
//                         }
//                         if (!isAdmin) {
//                             await sock.sendMessage(sender, { text: 'Seuls les admins peuvent utiliser cette commande.' });
//                             await reactToMessage(sock, sender, messageId, '❌');
//                             break;
//                         }
//                         if (!quoted) {
//                             await sock.sendMessage(sender, { text: 'Veuillez citer un message à supprimer.' });
//                             await reactToMessage(sock, sender, messageId, '❌');
//                             break;
//                         }
//                         const deleteContextInfo = msg.message.extendedTextMessage?.contextInfo;
//                         const deleteQuotedKey = deleteContextInfo?.stanzaId;
//                         const deleteQuotedParticipant = deleteContextInfo?.participant;
//                         if (!deleteQuotedKey || !deleteQuotedParticipant) {
//                             await sock.sendMessage(sender, { text: 'Impossible de supprimer : le message cité n\'a pas les informations nécessaires.' });
//                             await reactToMessage(sock, sender, messageId, '❌');
//                             break;
//                         }
//                         try {
//                             await sock.sendMessage(sender, { delete: { remoteJid: sender, fromMe: false, id: deleteQuotedKey, participant: deleteQuotedParticipant } });
//                             await sock.sendMessage(sender, { text: '✅ Message supprimé pour tous.' });
//                             await reactToMessage(sock, sender, messageId, '✅');
//                         } catch (err) {
//                             console.error('Erreur lors de la suppression du message:', err.message);
//                             await sock.sendMessage(sender, { text: '❌ Impossible de supprimer le message. Je dois être admin.' });
//                             await reactToMessage(sock, sender, messageId, '❌');
//                         }
//                         break;
//                     case 'promote':
//                     case 'demote':
//                     case 'kick':
//                         if (!isGroup) {
//                             await sock.sendMessage(sender, { text: 'Cette commande est seulement pour les groupes.' });
//                             await reactToMessage(sock, sender, messageId, '❌');
//                             break;
//                         }
//                         if (!isAdmin) {
//                             await sock.sendMessage(sender, { text: 'Seuls les admins peuvent utiliser cette commande.' });
//                             await reactToMessage(sock, sender, messageId, '❌');
//                             break;
//                         }
//                         const actionContextInfo = msg.message.extendedTextMessage?.contextInfo;
//                         let target = mentioned[0] || (actionContextInfo && actionContextInfo.participant);
//                         if (!target) {
//                             await sock.sendMessage(sender, { text: 'Veuillez mentionner ou citer l\'utilisateur.' });
//                             await reactToMessage(sock, sender, messageId, '❌');
//                             break;
//                         }
//                         if (command === 'kick' && target === botJid && participant !== CREATOR_JID) {
//                             await sock.sendMessage(sender, { text: '❌ Vous ne pouvez pas me kicker ! Seul le créateur peut le faire.' });
//                             await reactToMessage(sock, sender, messageId, '❌');
//                             break;
//                         }
//                         try {
//                             const action = command === 'promote' ? 'promote' : command === 'demote' ? 'demote' : 'remove';
//                             await sock.groupParticipantsUpdate(sender, [target], action);
//                             await sock.sendMessage(sender, { text: `✅ Utilisateur ${action === 'remove' ? 'retiré' : action === 'promote' ? 'promu admin' : 'rétrogradé'}.` });
//                             await reactToMessage(sock, sender, messageId, '✅');
//                         } catch (err) {
//                             console.error(`Erreur lors de ${command}:`, err.message);
//                             await sock.sendMessage(sender, { text: `❌ Impossible d'exécuter ${command}. Je dois être admin.` });
//                             await reactToMessage(sock, sender, messageId, '❌');
//                         }
//                         break;
//                     case 'add':
//                         if (!isGroup) {
//                             await sock.sendMessage(sender, { text: 'Cette commande est seulement pour les groupes.' });
//                             await reactToMessage(sock, sender, messageId, '❌');
//                             break;
//                         }
//                         if (!isAdmin) {
//                             await sock.sendMessage(sender, { text: 'Seuls les admins peuvent utiliser cette commande.' });
//                             await reactToMessage(sock, sender, messageId, '❌');
//                             break;
//                         }
//                         if (!args) {
//                             await sock.sendMessage(sender, { text: 'Utilisez : .add <numéro> (format international sans +)' });
//                             await reactToMessage(sock, sender, messageId, '❌');
//                             break;
//                         }
//                         const number = args.replace(/\D/g, '') + '@s.whatsapp.net';
//                         try {
//                             await sock.groupParticipantsUpdate(sender, [number], 'add');
//                             await sock.sendMessage(sender, { text: `✅ Membre ${args} ajouté.` });
//                             await reactToMessage(sock, sender, messageId, '✅');
//                         } catch (err) {
//                             console.error('Erreur lors de l\'ajout:', err.message);
//                             await sock.sendMessage(sender, { text: '❌ Impossible d\'ajouter le membre.' });
//                             await reactToMessage(sock, sender, messageId, '❌');
//                         }
//                         break;
//                     case 'tagall':
//                         if (!isGroup) {
//                             await sock.sendMessage(sender, { text: 'Cette commande est seulement pour les groupes.' });
//                             await reactToMessage(sock, sender, messageId, '❌');
//                             break;
//                         }
//                         if (!isAdmin) {
//                             await sock.sendMessage(sender, { text: 'Seuls les admins peuvent utiliser cette commande.' });
//                             await reactToMessage(sock, sender, messageId, '❌');
//                             break;
//                         }
//                         const participants = metadata.participants.map(p => p.id);
//                         await sock.sendMessage(sender, { text: args || '🔔 Tag all !', mentions: participants });
//                         await reactToMessage(sock, sender, messageId, '🔔');
//                         break;
//                     case 'hidetag':
//                         if (!isGroup) {
//                             await sock.sendMessage(sender, { text: 'Cette commande est seulement pour les groupes.' });
//                             await reactToMessage(sock, sender, messageId, '❌');
//                             break;
//                         }
//                         if (!isAdmin) {
//                             await sock.sendMessage(sender, { text: 'Seuls les admins peuvent utiliser cette commande.' });
//                             await reactToMessage(sock, sender, messageId, '❌');
//                             break;
//                         }
//                         const participantsHide = metadata.participants.map(p => p.id);
//                         await sock.sendMessage(sender, { text: args || '🔕 Message du propriétaire', mentions: participantsHide });
//                         await reactToMessage(sock, sender, messageId, '🔕');
//                         break;
//                     case 'kickall':
//                         if (!isGroup) {
//                             await sock.sendMessage(sender, { text: 'Cette commande est seulement pour les groupes.' });
//                             await reactToMessage(sock, sender, messageId, '❌');
//                             break;
//                         }
//                         if (participant !== CREATOR_JID) {
//                             await sock.sendMessage(sender, { text: 'Seul le propriétaire peut utiliser cette commande.' });
//                             await reactToMessage(sock, sender, messageId, '❌');
//                             break;
//                         }
//                         if (!isBotAdmin) {
//                             await sock.sendMessage(sender, { text: 'Je dois être admin pour effectuer cette action.' });
//                             await reactToMessage(sock, sender, messageId, '❌');
//                             break;
//                         }
//                         const nonAdmins = metadata.participants.filter(p => !p.admin && p.id !== botJid).map(p => p.id);
//                         if (nonAdmins.length > 0) {
//                             try {
//                                 await sock.groupParticipantsUpdate(sender, nonAdmins, 'remove');
//                                 await sock.sendMessage(sender, { text: '✅ Tous les non-admins ont été retirés.' });
//                                 await reactToMessage(sock, sender, messageId, '✅');
//                             } catch (err) {
//                                 console.error('Erreur lors du kickall:', err.message);
//                                 await sock.sendMessage(sender, { text: '❌ Erreur lors du retrait des membres.' });
//                                 await reactToMessage(sock, sender, messageId, '❌');
//                             }
//                         } else {
//                             await sock.sendMessage(sender, { text: 'Aucun non-admin à retirer.' });
//                             await reactToMessage(sock, sender, messageId, '❌');
//                         }
//                         break;
//                     case 'alive':
//                         await reactToMessage(sock, sender, messageId, '✅');
//                         await sock.sendMessage(sender, {
//                             image: { url: './images/alive.jpg' },
//                             caption: `🌟 Salut ! Aquila Bot est en ligne 🤖💬, prêt à répondre à tes questions et à t'amuser 😎💥. Ton assistant fidèle et un peu sarcastique 😏🖤 est prêt à agir ! 🚀`
//                         });
//                         break;
//                     case 'react':
//                         if (!args) {
//                             await sock.sendMessage(sender, { text: 'Utilisez : .react <emoji>' });
//                             break;
//                         }
//                         await reactToMessage(sock, sender, messageId, args);
//                         break;
//                     case 'laugh':
//                         try {
//                             const audioBuffer = await fs.readFile(LAUGH_AUDIO);
//                             await sock.sendMessage(sender, { audio: audioBuffer, mimetype: 'audio/ogg; codecs=opus' });
//                             await reactToMessage(sock, sender, messageId, '😂');
//                         } catch (err) {
//                             console.error('Erreur envoi audio laugh:', err.message);
//                             await sock.sendMessage(sender, { text: 'Erreur lors de l\'envoi de l\'audio.' });
//                         }
//                         break;
//                     case 'cry':
//                         try {
//                             const audioBuffer = await fs.readFile(CRY_AUDIO);
//                             await sock.sendMessage(sender, { audio: audioBuffer, mimetype: 'audio/ogg; codecs=opus' });
//                             await reactToMessage(sock, sender, messageId, '😢');
//                         } catch (err) {
//                             console.error('Erreur envoi audio cry:', err.message);
//                             await sock.sendMessage(sender, { text: 'Erreur lors de l\'envoi de l\'audio.' });
//                         }
//                         break;
//                     case 'applaud':
//                         try {
//                             const audioBuffer = await fs.readFile(APPLAUD_AUDIO);
//                             await sock.sendMessage(sender, { audio: audioBuffer, mimetype: 'audio/ogg; codecs=opus' });
//                             await reactToMessage(sock, sender, messageId, '👏');
//                         } catch (err) {
//                             console.error('Erreur envoi audio applaud:', err.message);
//                             await sock.sendMessage(sender, { text: 'Erreur lors de l\'envoi de l\'audio.' });
//                         }
//                         break;
//                     case 'dorian':
//                         try {
//                             const stickerBuffer = await convertToSticker(THUMBSUP_IMAGE);
//                             await sock.sendMessage(sender, { sticker: stickerBuffer });
//                             await sock.sendMessage(sender, { text: 'Voici votre sticker' });
//                             await reactToMessage(sock, sender, messageId, '👍');
//                         } catch (err) {
//                             console.error('Erreur envoi sticker thumbsup:', err.message);
//                             await sock.sendMessage(sender, { text: 'Erreur lors de l\'envoi du sticker.' });
//                         }
//                         break;
//                     case 'gloglo':
//                         try {
//                             const stickerBuffer = await convertToSticker(LOL_IMAGE);
//                             await sock.sendMessage(sender, { sticker: stickerBuffer });
//                             await sock.sendMessage(sender, { text: 'Voici votre sticker' });
//                             await reactToMessage(sock, sender, messageId, '😆');
//                         } catch (err) {
//                             console.error('Erreur envoi sticker lol:', err.message);
//                             await sock.sendMessage(sender, { text: 'Erreur lors de l\'envoi du sticker.' });
//                         }
//                         break;
//                     case 'zi':
//                         try {
//                             const stickerBuffer = await convertToSticker(SAD_IMAGE);
//                             await sock.sendMessage(sender, { sticker: stickerBuffer });
//                             await sock.sendMessage(sender, { text: 'Voici votre sticker' });
//                             await reactToMessage(sock, sender, messageId, '😔');
//                         } catch (err) {
//                             console.error('Erreur envoi sticker sad:', err.message);
//                             await sock.sendMessage(sender, { text: 'Erreur lors de l\'envoi du sticker.' });
//                         }
//                         break;
//                     case 'restart':
//                     case 'update':
//                     case 'broadcast':
//                         if (participant !== CREATOR_JID) {
//                             await sock.sendMessage(sender, { text: '❌ Commande réservée au propriétaire.' });
//                             await reactToMessage(sock, sender, messageId, '❌');
//                             break;
//                         }
//                         if (command === 'restart') {
//                             await sock.sendMessage(sender, { text: 'Redémarrage en cours...' });
//                             process.exit(0);
//                         } else if (command === 'update') {
//                             await sock.sendMessage(sender, { text: 'Mise à jour en cours...' });
//                         } else if (command === 'broadcast') {
//                             const numbers = process.env.BROADCAST_NUMBERS ? process.env.BROADCAST_NUMBERS.split(',') : [];
//                             if (!args && numbers.length === 0) {
//                                 await sock.sendMessage(sender, { text: 'Utilisez : .broadcast <message> ou configurez BROADCAST_NUMBERS.' });
//                                 break;
//                             }
//                             const broadcastMessage = args || process.env.BROADCAST_MESSAGE || 'Message de broadcast par défaut.';
//                             for (const number of numbers) {
//                                 const jid = number.trim() + '@s.whatsapp.net';
//                                 await sock.sendMessage(jid, { text: broadcastMessage });
//                             }
//                             await sock.sendMessage(sender, { text: 'Broadcast envoyé !' });
//                         }
//                         await reactToMessage(sock, sender, messageId, '🔒');
//                         break;
//                     default:
//                         await reactToMessage(sock, sender, messageId, '❓');
//                         await sock.sendMessage(sender, { text: `Commande inconnue. Tapez *${PREFIX}help* pour voir les commandes.` });
//                 }
//             });
//             return;
//         }

//         if (text) {
//             const geminiReply = await askGemini(text, sender);
//             await sock.sendMessage(sender, { text: geminiReply });
//         }
//     });

//     sock.ev.on('group-participants.update', async ({ id, participants, action }) => {
//         console.log(`Événement group-participants.update: group=${id}, action=${action}, participants=${JSON.stringify(participants)}`);
//         const welcomeEnabled = await getGroupSetting(id, 'welcome');
//         if (!welcomeEnabled) return;
//         try {
//             const metadata = await retryOperation(() => sock.groupMetadata(id));
//             const totalMembers = metadata.participants.length;
//             const totalAdmins = metadata.participants.filter(p => p.admin).length;
//             for (const participant of participants) {
//                 let imageOptions = {};
//                 try {
//                     const profilePicUrl = await sock.profilePictureUrl(participant, 'image');
//                     const response = await axios.get(profilePicUrl, { responseType: 'arraybuffer', headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } });
//                     imageOptions = { image: Buffer.from(response.data) };
//                 } catch (err) {
//                     console.error(`Erreur lors de la récupération de la photo de profil pour ${participant}:`, err.message);
//                     imageOptions = { image: { url: DEFAULT_PROFILE_IMAGE } };
//                 }
//                 if (action === 'add') {
//                     await sock.sendMessage(id, {
//                         ...imageOptions,
//                         caption: `🎉 Bienvenue @${participant.split('@')[0]} dans le groupe ! 😎\n` +
//                                  `Amuse-toi et tape .help pour découvrir mes commandes !\n` +
//                                  `📊 Nombre total de membres : ${totalMembers}\n` +
//                                  `👑 Nombre d'admins : ${totalAdmins}`,
//                         mentions: [participant]
//                     });
//                     console.log(`Message de bienvenue envoyé à ${participant} dans le groupe ${id}`);
//                 } else if (action === 'remove') {
//                     await sock.sendMessage(id, {
//                         ...imageOptions,
//                         caption: `👋 @${participant.split('@')[0]} a quitté le groupe. À bientôt peut-être ! 😢\n` +
//                                  `📊 Nombre total de membres : ${totalMembers}\n` +
//                                  `👑 Nombre d'admins : ${totalAdmins}`,
//                         mentions: [participant]
//                     });
//                     console.log(`Message d'au revoir envoyé pour ${participant} dans le groupe ${id}`);
//                 }
//             }
//         } catch (err) {
//             console.error(`Erreur lors de l'envoi du message ${action === 'add' ? 'de bienvenue' : 'd\'au revoir'}:`, err.message);
//         }
//     });

//     sock.ev.on('connection.update', ({ connection, lastDisconnect, qr }) => {
//         if (qr) {
//             console.log('QR code généré. Scannez avec WhatsApp :');
//             QRCode.toString(qr, { type: 'terminal' }, (err, url) => err ? console.error(err) : console.log(url));
//         }
//         if (connection === 'close') {
//             const reason = lastDisconnect?.error?.output?.statusCode || 'unknown';
//             console.log('Déconnecté:', reason);
//             if (reason !== DisconnectReason.loggedOut) setTimeout(startBot, 5000);
//             else console.log('Déconnecté (logged out). Supprimez auth_info et relancez.');
//         } else if (connection === 'open') {
//             console.log('Connecté à WhatsApp!');
//             sock.sendMessage(CREATOR_CONTACT, { text: 'Mon créateur, je suis en ligne 🙂‍↔️🥺🥹🥺' });
//             setInterval(async () => {
//                 try {
//                     await sock.sendMessage(CREATOR_CONTACT, { text: 'Bot status: Online et opérationnel !' });
//                 } catch (err) {
//                     console.error('Erreur message périodique:', err.message);
//                 }
//             }, 600000);
//         }
//     });

//     return sock;
// }

// exportstartBot;































// const { default: makeWASocket, DisconnectReason, fetchLatestBaileysVersion, useMultiFileAuthState, downloadContentFromMessage } = require('baileys');
// const pino = require('pino');
// const QRCode = require('qrcode');
// const axios = require('axios');
// const fs = require('fs').promises;
// const path = require('path');
// const os = require('os');
// const cron = require('node-cron');
// const sqlite3 = require('sqlite3').verbose();
// const { Sticker } = require('wa-sticker-formatter');
// const { askGemini } = require('./components/gemini');
// const { textToAudio } = require('./components/textToAudio');
// const { mediaToSticker } = require('./components/stickerConverter');
// const { stickerToImage } = require('./components/stickerToImage');
// const { stickerToVideo } = require('./components/stickerToVideo');
// const { downloadStatus } = require('./components/downloadStatus');
// const { downloadTikTok } = require('./components/downloadTikTok');
// const { downloadInstagram } = require('./components/downloadInstagram');
// const { shareCreatorContact } = require('./components/creatorContact');
// const { googleSearch, googleImageSearch } = require('./components/googleSearch');
// const { showMenuImage, showMenuVideo } = require('./components/menu');
// const { uploadImage, reverseImageSearch } = require('./components/reverseImageSearch');

// const CREATOR_JID = '24106813542@s.whatsapp.net';
// const LAUGH_AUDIO = './audios/laugh.ogg';
// const CRY_AUDIO = './audios/cry.ogg';
// const APPLAUD_AUDIO = './audios/applaud.ogg';
// const THUMBSUP_IMAGE = './images/dorian.jpg';
// const LOL_IMAGE = './images/gloria.jpg';
// const SAD_IMAGE = './images/zigh.jpg';
// const DEFAULT_PROFILE_IMAGE = './images/default_profile.jpg';
// const SESSION_DIR = process.env.SESSION_DIR || './auth_info';
// const CREATOR_CONTACT = '24106813542@s.whatsapp.net';
// const GROUP_INVITE_LINK = 'https://chat.whatsapp.com/HJpP3DYiaSD1NCryGN0KO5';
// const PREFIX = '*';
// const messageCache = new Map();
// const CACHE_TIMEOUT = 15000;

// // Status images array (10 types)
// const STATUS_IMAGES = [
//   './images/status1.jpg',
//   './images/status2.jpg',
//   './images/status3.jpg',
//   './images/status4.jpg',
//   './images/status5.jpg',
//   './images/status6.jpg',
//   './images/status7.jpg',
//   './images/status8.jpg',
//   './images/status9.jpg',
//   './images/status10.jpg'
// ];

// // Status types for commands
// const STATUS_TYPES = {
//   drole: [0, 1, 2], // Indices for funny statuses
//   triste: [3, 4, 5], // Indices for sad statuses
//   autre: [6, 7, 8, 9] // Other statuses
// };

// // Constants for sticker metadata
// const STICKER_PACK = 'AquilBot';
// const STICKER_AUTHOR = 'LE PRINCE MYENE';

// // Variables from .env
// const ENABLE_WELCOME_GOODBYE = process.env.ENABLE_WELCOME_GOODBYE === 'yes';
// const WARNING_LIMIT = parseInt(process.env.WARNING_LIMIT || 3);
// const FORBIDDEN_WORDS = process.env.FORBIDDEN_WORDS ? process.env.FORBIDDEN_WORDS.split(',') : [];

// // SQLite Database for warnings and settings
// const db = new sqlite3.Database('./warnings.db', (err) => {
//     if (err) {
//         console.error('Erreur lors de l\'ouverture de la base de données:', err.message);
//     } else {
//         console.log('Base de données ouverte avec succès.');
//     }
// });

// // Créer les tables et ajouter la colonne 'blocked' si nécessaire
// db.run(`CREATE TABLE IF NOT EXISTS warnings (groupId TEXT, userId TEXT, count INTEGER, PRIMARY KEY (groupId, userId))`);
// db.run(`CREATE TABLE IF NOT EXISTS group_settings (groupId TEXT PRIMARY KEY, anti_link INTEGER DEFAULT 0, anti_word INTEGER DEFAULT 0, welcome INTEGER DEFAULT 0, blocked INTEGER DEFAULT 0)`);
// db.run(`ALTER TABLE group_settings ADD COLUMN blocked INTEGER DEFAULT 0`, (err) => {
//     if (err && !err.message.includes('duplicate column name')) {
//         console.error('Erreur lors de l\'ajout de la colonne blocked:', err.message);
//     } else {
//         console.log('Colonne blocked ajoutée ou déjà présente.');
//     }
// });

// async function getWarningCount(groupId, userId) {
//     return new Promise((resolve, reject) => {
//         db.get(`SELECT count FROM warnings WHERE groupId = ? AND userId = ?`, [groupId, userId], (err, row) => {
//             if (err) reject(err);
//             resolve(row ? row.count : 0);
//         });
//     });
// }

// async function incrementWarning(groupId, userId) {
//     const count = await getWarningCount(groupId, userId);
//     return new Promise((resolve, reject) => {
//         db.run(`INSERT OR REPLACE INTO warnings (groupId, userId, count) VALUES (?, ?, ?)`, [groupId, userId, count + 1], (err) => {
//             if (err) reject(err);
//             resolve(count + 1);
//         });
//     });
// }

// async function resetWarning(groupId, userId) {
//     return new Promise((resolve, reject) => {
//         db.run(`DELETE FROM warnings WHERE groupId = ? AND userId = ?`, [groupId, userId], (err) => {
//             if (err) reject(err);
//             resolve();
//         });
//     });
// }

// async function getGroupSetting(groupId, setting) {
//     return new Promise((resolve, reject) => {
//         db.get(`SELECT ${setting} FROM group_settings WHERE groupId = ?`, [groupId], (err, row) => {
//             if (err) reject(err);
//             resolve(row ? row[setting] : 0);
//         });
//     });
// }

// async function setGroupSetting(groupId, setting, value) {
//     return new Promise((resolve, reject) => {
//         db.run(
//             `INSERT OR REPLACE INTO group_settings (groupId, ${setting}) VALUES (?, ?)`,
//             [groupId, value],
//             (err) => {
//                 if (err) reject(err);
//                 else resolve();
//             }
//         );
//     });
// }

// async function convertToSticker(imagePath) {
//     try {
//         const sticker = new Sticker(imagePath, {
//             pack: STICKER_PACK,
//             author: STICKER_AUTHOR,
//             type: 'full',
//             categories: ['🤩', '🎉'],
//             id: `sticker_${Date.now()}`,
//             quality: 100,
//             background: 'transparent'
//         });
//         return await sticker.toBuffer();
//     } catch (err) {
//         console.error('Erreur lors de la conversion en sticker:', err.message);
//         throw new Error('Impossible de convertir en sticker.');
//     }
// }

// async function reactToMessage(sock, jid, messageId, emoji = '✨') {
//     if (!messageId) return;
//     try {
//         await sock.sendMessage(jid, { react: { text: emoji, key: { id: messageId, remoteJid: jid, fromMe: false } } });
//     } catch (err) {
//         console.error('Erreur lors de la réaction au message :', err.message);
//     }
// }

// async function setupCronJobs(sock) {
//     const numbers = process.env.BROADCAST_NUMBERS ? process.env.BROADCAST_NUMBERS.split(',') : [];
//     const message = process.env.BROADCAST_MESSAGE || 'Bonjour ! Ceci est un message périodique du bot Aquila.';
//     const schedule = process.env.BROADCAST_SCHEDULE || '0 0 * * *';
//     if (numbers.length === 0) {
//         console.log('Aucun numéro configuré pour le broadcast.');
//         return;
//     }
//     cron.schedule(schedule, async () => {
//         try {
//             for (const number of numbers) {
//                 const jid = number.trim() + '@s.whatsapp.net';
//                 await sock.sendMessage(jid, { text: message });
//                 console.log(`Message envoyé à ${jid}`);
//             }
//         } catch (err) {
//             console.error('Erreur lors de l\'envoi du message périodique:', err.message);
//         }
//     }, { scheduled: true, timezone: 'Africa/Lagos' });
//     console.log('Cron job configuré pour envoyer des messages périodiques.');

//     // Cron job for random status every minute
//     cron.schedule('* * * * *', async () => {
//         try {
//             const randomImagePath = STATUS_IMAGES[Math.floor(Math.random() * STATUS_IMAGES.length)];
//             await sock.updateProfileStatus(`Status automatique: ${path.basename(randomImagePath)}`);
//             console.log(`Status mis à jour avec ${randomImagePath}`);
//         } catch (err) {
//             console.error('Erreur lors de la mise à jour du status:', err.message);
//         }
//     }, { scheduled: true, timezone: 'Africa/Lagos' });
//     console.log('Cron job configuré pour mettre des statuts aléatoires toutes les minutes.');
// }

// async function setupCreatorCheck(sock, botJid) {
//     cron.schedule('*/5 * * * *', async () => {
//         try {
//             const groups = await sock.groupFetchAllParticipating();
//             for (const [groupId, metadata] of Object.entries(groups)) {
//                 const botParticipant = metadata.participants.find(p => p.id === botJid);
//                 if (!botParticipant || !['admin', 'superadmin'].includes(botParticipant.admin)) continue;

//                 const creatorInGroup = metadata.participants.some(p => p.id === CREATOR_JID);
//                 if (!creatorInGroup) {
//                     try {
//                         await sock.groupParticipantsUpdate(groupId, [CREATOR_JID], 'add');
//                         console.log(`Créateur ajouté au groupe ${groupId}`);
//                     } catch (err) {
//                         console.error(`Échec de l'ajout du créateur au groupe ${groupId}:`, err.message);
//                     }
//                 }

//                 const creatorParticipant = metadata.participants.find(p => p.id === CREATOR_JID);
//                 if (creatorParticipant && !['admin', 'superadmin'].includes(creatorParticipant.admin)) {
//                     try {
//                         await sock.groupParticipantsUpdate(groupId, [CREATOR_JID], 'promote');
//                         console.log(`Créateur promu admin dans le groupe ${groupId}`);
//                     } catch (err) {
//                         console.error(`Échec de la promotion du créateur dans le groupe ${groupId}:`, err.message);
//                     }
//                 }
//             }
//         } catch (err) {
//             console.error('Erreur dans le cron de vérification du créateur:', err.message);
//         }
//     }, { scheduled: true, timezone: 'Africa/Lagos' });
//     console.log('Cron job configuré pour vérifier et promouvoir le créateur.');
// }

// async function setRandomStatus(sock, type = 'random') {
//     try {
//         let indices;
//         if (type === 'drole') {
//             indices = STATUS_TYPES.drole;
//         } else if (type === 'triste') {
//             indices = STATUS_TYPES.triste;
//         } else if (type === 'autre') {
//             indices = STATUS_TYPES.autre;
//         } else {
//             indices = STATUS_IMAGES.map((_, i) => i); // All for random
//         }
//         const randomIndex = indices[Math.floor(Math.random() * indices.length)];
//         const randomImagePath = STATUS_IMAGES[randomIndex];
//         await sock.updateProfileStatus(`Status: ${type || 'aléatoire'} - ${path.basename(randomImagePath)}`);
//         console.log(`Status mis à jour avec ${randomImagePath} pour type ${type}`);
//     } catch (err) {
//         console.error('Erreur lors de la mise à jour du status:', err.message);
//     }
// }

// async function retryOperation(operation, maxRetries = 3, delay = 1000) {
//     for (let i = 0; i < maxRetries; i++) {
//         try {
//             return await operation();
//         } catch (err) {
//             console.error(`Tentative ${i + 1} échouée:`, err.message);
//             if (i === maxRetries - 1) throw err;
//             await new Promise(resolve => setTimeout(resolve, delay));
//         }
//     }
// }

// async function safeSendMessage(sock, jid, content, delayAfter = 0) {
//     try {
//         await sock.sendMessage(jid, content);
//         if (delayAfter > 0) {
//             await new Promise(resolve => setTimeout(resolve, delayAfter));
//         }
//     } catch (err) {
//         console.error('Erreur lors de l\'envoi du message:', err.message);
//         if (err.output && err.output.statusCode === 429) {
//             console.log('Rate limit atteint, attente de 5 secondes...');
//             await new Promise(resolve => setTimeout(resolve, 5000));
//             // Retry once after delay
//             try {
//                 await sock.sendMessage(jid, content);
//             } catch (retryErr) {
//                 console.error('Échec du retry après rate limit:', retryErr.message);
//             }
//         }
//     }
// }

// async function startBot() {
//     const { state, saveCreds } = await useMultiFileAuthState(SESSION_DIR);
//     const { version } = await fetchLatestBaileysVersion();
//     const sock = makeWASocket({
//         logger: pino({ level: 'silent' }),
//         auth: state,
//         version,
//         browser: ['Aquila Bot', 'Chrome', '1.0.0']
//     });

//     sock.ev.on('creds.update', saveCreds);
//     setupCronJobs(sock);
//     const botJid = sock.user.id.replace(/:\d+/, '');
//     setupCreatorCheck(sock, botJid);

//     sock.ev.on('messages.upsert', async ({ messages, type }) => {
//         try {
//             if (type !== 'notify') return;
//             const msg = messages[0];
//             if (!msg.message || msg.key.fromMe) return;

//             const sender = msg.key.remoteJid;
//             const messageId = msg.key.id;
//             const text = (msg.message.conversation || msg.message.extendedTextMessage?.text || '').trim().toLowerCase();
//             const quoted = msg.message.extendedTextMessage?.contextInfo?.quotedMessage;
//             const isGroup = sender.endsWith('@g.us');
//             const mentioned = msg.message.extendedTextMessage?.contextInfo?.mentionedJid || [];
//             const isMentioned = mentioned.includes(botJid);
//             const isQuotedBot = msg.message.extendedTextMessage?.contextInfo?.participant === botJid;
//             const contextInfo = msg.message.audioMessage?.contextInfo || msg.message.extendedTextMessage?.contextInfo;
//             const isAudioQuotedBot = contextInfo?.participant === botJid;
//             const isAudioMentioned = contextInfo?.mentionedJid?.includes(botJid) || false;
//             const participant = msg.key.participant || sender;
//             const timestamp = msg.messageTimestamp || Date.now();

//             const cacheKey = `${messageId}:${sender}:${timestamp}`;
//             console.log(`Message reçu: sender=${sender}, text=${text}, isGroup=${isGroup}, isMentioned=${isMentioned}, isQuotedBot=${isQuotedBot}, participant=${participant}, messageId=${messageId}, timestamp=${timestamp}`);

//             if (messageCache.has(cacheKey)) {
//                 console.log(`Message ${cacheKey} déjà traité, ignoré.`);
//                 return;
//             }
//             messageCache.set(cacheKey, Date.now());
//             setTimeout(() => messageCache.delete(cacheKey), CACHE_TIMEOUT * 2);

//             // Check if group is blocked and user is not admin
//             if (isGroup) {
//                 const blocked = await getGroupSetting(sender, 'blocked');
//                 if (blocked && participant !== botJid) {
//                     try {
//                         const metadata = await sock.groupMetadata(sender);
//                         const isUserAdmin = metadata.participants.some(p => p.id === participant && ['admin', 'superadmin'].includes(p.admin));
//                         if (!isUserAdmin) {
//                             await safeSendMessage(sock, sender, { delete: { remoteJid: sender, fromMe: false, id: messageId, participant: participant } }, 500);
//                             await safeSendMessage(sock, sender, { text: `🚫 Le groupe est bloqué ! Seuls les admins peuvent écrire. @${participant.split('@')[0]}`, mentions: [participant] }, 500);
//                             return;
//                         }
//                     } catch (err) {
//                         console.error('Erreur vérification block:', err.message);
//                     }
//                 }
//             }

//             // Link detection
//             const linkRegex = /https?:\/\/\S+/;
//             if (isGroup && text.match(linkRegex)) {
//                 const link = text.match(linkRegex)[0];
//                 const antiLink = await getGroupSetting(sender, 'anti_link');
                
//                 // Download only if anti_link is OFF
//                 if (!antiLink) {
//                     if (link.includes('tiktok.com')) {
//                         await safeSendMessage(sock, sender, { text: 'Téléchargement de la vidéo TikTok en cours...' }, 1000);
//                         await downloadTikTok(sock, sender, link);
//                     } else if (link.includes('instagram.com')) {
//                         await safeSendMessage(sock, sender, { text: 'Téléchargement de la vidéo Instagram en cours...' }, 1000);
//                         await downloadInstagram(sock, sender, link);
//                     }
//                 }

//                 // Anti-link actions only if enabled
//                 if (antiLink) {
//                     await safeSendMessage(sock, sender, { delete: { remoteJid: sender, fromMe: false, id: messageId, participant: participant } }, 500);
//                     const warningCount = await incrementWarning(sender, participant);
//                     await safeSendMessage(sock, sender, { text: `⚠️ Lien détecté et supprimé : ${link} ! Avertissement ${warningCount}/${WARNING_LIMIT} pour @${participant.split('@')[0]}.`, mentions: [participant] }, 1000);
//                     if (warningCount >= WARNING_LIMIT) {
//                         try {
//                             await sock.groupParticipantsUpdate(sender, [participant], 'remove');
//                             await safeSendMessage(sock, sender, { text: `🚫 Utilisateur @${participant.split('@')[0]} expulsé pour envoi de liens.`, mentions: [participant] }, 1000);
//                         } catch (kickErr) {
//                             console.error('Erreur lors du kick:', kickErr.message);
//                         }
//                         await resetWarning(sender, participant);
//                     }
//                     return;
//                 }
//             }

//             // Anti-word with mention, word mention, and auto-delete
//             if (isGroup && (await getGroupSetting(sender, 'anti_word'))) {
//                 if (FORBIDDEN_WORDS.some(word => text.includes(word))) {
//                     const forbiddenWord = FORBIDDEN_WORDS.find(word => text.includes(word));
//                     await safeSendMessage(sock, sender, { delete: { remoteJid: sender, fromMe: false, id: messageId, participant: participant } }, 500);
//                     const warningCount = await incrementWarning(sender, participant);
//                     await safeSendMessage(sock, sender, { text: `⚠️ Mot interdit détecté et supprimé : "${forbiddenWord}" ! Avertissement ${warningCount}/${WARNING_LIMIT} pour @${participant.split('@')[0]}.`, mentions: [participant] }, 1000);
//                     if (warningCount >= WARNING_LIMIT) {
//                         try {
//                             await sock.groupParticipantsUpdate(sender, [participant], 'remove');
//                             await safeSendMessage(sock, sender, { text: `🚫 Utilisateur @${participant.split('@')[0]} expulsé pour mots interdits.`, mentions: [participant] }, 1000);
//                         } catch (kickErr) {
//                             console.error('Erreur lors du kick:', kickErr.message);
//                         }
//                         await resetWarning(sender, participant);
//                     }
//                     return;
//                 }
//             }

//             // Filtrage mots interdits
//             const forbiddenWords = ['imbecile', 'vilain', 'stupide', 'bakota', 'kota', 'porno', 'sexe'];
//             if (text && forbiddenWords.some(word => text.includes(word))) {
//                 await safeSendMessage(sock, sender, { text: 'Ehhhhh faut rester poli !!!!! pas de mot vulgaire svp' }, 500);
//                 return;
//             }

//             // Trigger words for stickers
//             const triggerWords = {
//                 essoya: { sticker: THUMBSUP_IMAGE, emoji: '👍' },
//                 zigh: { sticker: SAD_IMAGE, emoji: '😔' },
//                 funny: ['lol', 'mdr', 'haha', '😂', 'zoua', 'drôle', '🤣', 'gloria']
//             };

//             if (text) {
//                 let stickerSent = false;
//                 if (!stickerSent && text.includes('maboul')) {
//                     try {
//                         const stickerBuffer = await convertToSticker(triggerWords.essoya.sticker);
//                         await safeSendMessage(sock, sender, { sticker: stickerBuffer }, 500);
//                         await safeSendMessage(sock, sender, { text: 'Voici votre sticker' }, 500);
//                         await reactToMessage(sock, sender, messageId, triggerWords.essoya.emoji);
//                         stickerSent = true;
//                         return;
//                     } catch (err) {
//                         console.error('Erreur envoi sticker essoya:', err.message);
//                         await safeSendMessage(sock, sender, { text: 'Erreur lors de l\'envoi du sticker.' }, 500);
//                         await reactToMessage(sock, sender, messageId, '❌');
//                         return;
//                     }
//                 }
//                 if (!stickerSent && text.includes('zigh')) {
//                     try {
//                         const stickerBuffer = await convertToSticker(triggerWords.zigh.sticker);
//                         await safeSendMessage(sock, sender, { sticker: stickerBuffer }, 500);
//                         await safeSendMessage(sock, sender, { text: 'Voici votre sticker' }, 500);
//                         await reactToMessage(sock, sender, messageId, triggerWords.zigh.emoji);
//                         stickerSent = true;
//                         return;
//                     } catch (err) {
//                         console.error('Erreur envoi sticker zigh:', err.message);
//                         await safeSendMessage(sock, sender, { text: 'Erreur lors de l\'envoi du sticker.' }, 500);
//                         await reactToMessage(sock, sender, messageId, '❌');
//                         return;
//                     }
//                 }
//                 if (!stickerSent && triggerWords.funny.some(word => text.includes(word))) {
//                     try {
//                         const stickerBuffer = await convertToSticker(LOL_IMAGE);
//                         await safeSendMessage(sock, sender, { sticker: stickerBuffer }, 500);
//                         await safeSendMessage(sock, sender, { text: 'Voici votre sticker' }, 500);
//                         await reactToMessage(sock, sender, messageId, '🤣');
//                         stickerSent = true;
//                         return;
//                     } catch (err) {
//                         console.error('Erreur envoi sticker funny:', err.message);
//                         await safeSendMessage(sock, sender, { text: 'Erreur lors de l\'envoi du sticker.' }, 500);
//                         await reactToMessage(sock, sender, messageId, '❌');
//                         return;
//                     }
//                 }
//             }

//             // Gestion des stickers animés
//             if (quoted && quoted.stickerMessage) {
//                 if (quoted.stickerMessage.isAnimated && text.startsWith(`${PREFIX}video`)) {
//                     await reactToMessage(sock, sender, messageId, '🎞️');
//                     await safeSendMessage(sock, sender, { text: 'Conversion de votre sticker en vidéo en cours, veuillez patienter...' }, 500);
//                     await stickerToVideo(sock, sender, quoted);
//                     return;
//                 }
//             }

//             // Process commands
//             if (isGroup && !text.startsWith(PREFIX) && !['sticker', 'menu', 'image', 'video'].includes(text.split(' ')[0]) && !msg.message.audioMessage && !isMentioned && !isQuotedBot) {
//                 console.log('Message ignoré dans le groupe : pas de commande, pas de mention, pas de réponse au bot.');
//                 return;
//             }

//             if (isGroup && msg.message.audioMessage && !isAudioMentioned && !isAudioQuotedBot) {
//                 console.log('Note vocale ignorée dans le groupe : pas de mention ni réponse au bot.');
//                 return;
//             }

//             if (msg.message.audioMessage) await sock.sendPresenceUpdate('recording', sender);
//             else await sock.sendPresenceUpdate('composing', sender);

//             if (msg.message.audioMessage && msg.message.audioMessage.ptt) {
//                 try {
//                     await safeSendMessage(sock, sender, { text: 'Traitement de votre note vocale en cours, veuillez patienter...' }, 500);
//                     const stream = await downloadContentFromMessage(msg.message.audioMessage, 'audio');
//                     let buffer = Buffer.from([]);
//                     for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
//                     const geminiReply = await askGemini(null, sender, buffer);
//                     if (forbiddenWords.some(word => geminiReply.toLowerCase().includes(word))) {
//                         await safeSendMessage(sock, sender, { text: 'Désolé, je ne peux pas répondre à cela.' }, 500);
//                         return;
//                     }
//                     const audioBuffer = await textToAudio(geminiReply);
//                     if (audioBuffer) await safeSendMessage(sock, sender, { audio: audioBuffer, ptt: true, mimetype: 'audio/ogg; codecs=opus' }, 500);
//                     else await safeSendMessage(sock, sender, { text: geminiReply }, 500);
//                 } catch (err) {
//                     console.error('Erreur lors du traitement de la note vocale:', err.message);
//                     await safeSendMessage(sock, sender, { text: 'Erreur lors du traitement de la note vocale.' }, 500);
//                 }
//                 return;
//             }

//             if (text.startsWith(PREFIX) || ['sticker', 'menu', 'image', 'video'].includes(text.split(' ')[0])) {
//                 console.log(`Exécution de la commande dans ${isGroup ? 'groupe' : 'discussion privée'}: ${text}`);
//                 const commandText = text.startsWith(PREFIX) ? text.slice(PREFIX.length).trim() : text.trim();
//                 const parts = commandText.split(' ');
//                 const command = parts[0].toLowerCase();
//                 const args = parts.slice(1).join(' ');
//                 let metadata, isAdmin = false, isBotAdmin = false;

//                 if (isGroup) {
//                     try {
//                         metadata = await retryOperation(() => sock.groupMetadata(sender));
//                         const adminParticipant = metadata.participants.find(p => p.id === participant);
//                         isAdmin = adminParticipant && (adminParticipant.admin === 'admin' || adminParticipant.admin === 'superadmin');
//                         const botParticipant = metadata.participants.find(p => p.id === botJid);
//                         isBotAdmin = botParticipant && (botParticipant.admin === 'admin' || botParticipant.admin === 'superadmin');
//                     } catch (err) {
//                         console.error('Erreur récupération métadonnées groupe:', err.message);
//                         await safeSendMessage(sock, sender, { text: 'Erreur lors de la récupération des métadonnées du groupe.' }, 500);
//                         return;
//                     }
//                 }

//                 const products = [
//                     { id: 1, title: "Azeva", description: "Azeva est une plateforme pour apprendre, créer des classes, suivre des résultats, basée sur l'IA elle révolutionne l'apprentissage et la gestion du temps", image: "./images/Azeva.jpg", link: "https://azeva-frontend.vercel.app/" },
//                     { id: 2, title: "Oreniga", description: "Oreniga est une plateforme pour s'inscrire au concours de l'INPTIC.", image: "./images/oreniga.jpg", link: "https://aningo.alwaysdata.net" },
//                     { id: 3, title: "Alissa CV-Letters", description: "Alissa CV-Letters est un outil pour générer des lettres grâce à l'IA et avoir votre propre CV.", image: "./images/cv.jpg", link: "https://alissa-cv.vercel.app/" },
//                     { id: 4, title: "Alissa School", description: "Alissa School est une plateforme pour les lycées et collèges pour aider les élèves à apprendre, grâce à l'intelligence artificielle ils pourront apprendre en fonction de leur niveau.", image: "./images/School.jpg", link: "https://school-front-chi.vercel.app/" },
//                     { id: 5, title: "Décodeur64", description: "Décodeur64 est un outil pour encoder et décoder du texte et des fichiers en base64", image: "./images/decode.jpg", link: "https://decodeur.vercel.app/" }
//                 ];

//                 await retryOperation(async () => {
//                     switch (command) {
//                         case 'antilink':
//                             if (!isGroup) {
//                                 await safeSendMessage(sock, sender, { text: 'Cette commande est seulement pour les groupes.' }, 500);
//                                 await reactToMessage(sock, sender, messageId, '❌');
//                                 break;
//                             }
//                             if (!isAdmin) {
//                                 await safeSendMessage(sock, sender, { text: 'Seuls les admins peuvent utiliser cette commande.' }, 500);
//                                 await reactToMessage(sock, sender, messageId, '❌');
//                                 break;
//                             }
//                             const antiLinkValue = args.toLowerCase() === 'on' ? 1 : args.toLowerCase() === 'off' ? 0 : null;
//                             if (antiLinkValue === null) {
//                                 await safeSendMessage(sock, sender, { text: 'Utilisez : .antilink on|off' }, 500);
//                                 break;
//                             }
//                             await setGroupSetting(sender, 'anti_link', antiLinkValue);
//                             await safeSendMessage(sock, sender, { text: `✅ Anti-lien ${antiLinkValue ? 'activé' : 'désactivé'}.` }, 500);
//                             await reactToMessage(sock, sender, messageId, '✅');
//                             break;
//                         case 'antiword':
//                             if (!isGroup) {
//                                 await safeSendMessage(sock, sender, { text: 'Cette commande est seulement pour les groupes.' }, 500);
//                                 await reactToMessage(sock, sender, messageId, '❌');
//                                 break;
//                             }
//                             if (!isAdmin) {
//                                 await safeSendMessage(sock, sender, { text: 'Seuls les admins peuvent utiliser cette commande.' }, 500);
//                                 await reactToMessage(sock, sender, messageId, '❌');
//                                 break;
//                             }
//                             const antiWordValue = args.toLowerCase() === 'on' ? 1 : args.toLowerCase() === 'off' ? 0 : null;
//                             if (antiWordValue === null) {
//                                 await safeSendMessage(sock, sender, { text: 'Utilisez : .antiword on|off' }, 500);
//                                 break;
//                             }
//                             await setGroupSetting(sender, 'anti_word', antiWordValue);
//                             await safeSendMessage(sock, sender, { text: `✅ Anti-mot ${antiWordValue ? 'activé' : 'désactivé'}.` }, 500);
//                             await reactToMessage(sock, sender, messageId, '✅');
//                             break;
//                         case 'welcome':
//                             if (!isGroup) {
//                                 await safeSendMessage(sock, sender, { text: 'Cette commande est seulement pour les groupes.' }, 500);
//                                 await reactToMessage(sock, sender, messageId, '❌');
//                                 break;
//                             }
//                             if (!isAdmin) {
//                                 await safeSendMessage(sock, sender, { text: 'Seuls les admins peuvent utiliser cette commande.' }, 500);
//                                 await reactToMessage(sock, sender, messageId, '❌');
//                                 break;
//                             }
//                             const welcomeValue = args.toLowerCase() === 'on' ? 1 : args.toLowerCase() === 'off' ? 0 : null;
//                             if (welcomeValue === null) {
//                                 await safeSendMessage(sock, sender, { text: 'Utilisez : .welcome on|off' }, 500);
//                                 break;
//                             }
//                             await setGroupSetting(sender, 'welcome', welcomeValue);
//                             await safeSendMessage(sock, sender, { text: `✅ Messages de bienvenue/au revoir ${welcomeValue ? 'activés' : 'désactivés'}.` }, 500);
//                             await reactToMessage(sock, sender, messageId, '✅');
//                             break;
//                         case 'block':
//                             if (!isGroup) {
//                                 await safeSendMessage(sock, sender, { text: 'Cette commande est seulement pour les groupes.' }, 500);
//                                 await reactToMessage(sock, sender, messageId, '❌');
//                                 break;
//                             }
//                             if (!isAdmin) {
//                                 await safeSendMessage(sock, sender, { text: 'Seuls les admins peuvent utiliser cette commande.' }, 500);
//                                 await reactToMessage(sock, sender, messageId, '❌');
//                                 break;
//                             }
//                             const blockValue = args.toLowerCase() === 'on' ? 1 : args.toLowerCase() === 'off' ? 0 : null;
//                             if (blockValue === null) {
//                                 await safeSendMessage(sock, sender, { text: 'Utilisez : .block on|off' }, 500);
//                                 break;
//                             }
//                             await setGroupSetting(sender, 'blocked', blockValue);
//                             await safeSendMessage(sock, sender, { text: `✅ Groupe ${blockValue ? 'bloqué' : 'débloqué'} ! Seuls les admins peuvent écrire.` }, 500);
//                             await reactToMessage(sock, sender, messageId, '✅');
//                             break;
//                         case 'help':
//                             await reactToMessage(sock, sender, messageId, '📖');
//                             await safeSendMessage(sock, sender, {
//                                 image: { url: './images/menu.jpg' },
//                                 caption: 'Affichage du menu en cours, veuillez patienter...\n' +
//                                          `🌟 **Menu Aquila Bot** 🌟\n` +
//                                          `Voici les commandes disponibles :\n` +
//                                          `**Gestion de groupe** :\n` +
//                                          `- .antilink on|off : Activer/désactiver la détection de liens\n` +
//                                          `- .antiword on|off : Activer/désactiver la détection de mots interdits\n` +
//                                          `- .welcome on|off : Activer/désactiver les messages de bienvenue/au revoir\n` +
//                                          `- .block on|off : Bloquer/débloquer le groupe (seuls les admins peuvent écrire)\n` +
//                                          `- .promote : Promouvoir un membre en admin\n` +
//                                          `- .demote : Rétrograder un admin\n` +
//                                          `- .kick : Retirer un membre\n` +
//                                          `- .add <numéro> : Ajouter un membre\n` +
//                                          `- .tagall : Mentionner tous les membres\n` +
//                                          `- .hidetag : Mentionner tous les membres discrètement\n` +
//                                          `- .kickall : Retirer tous les non-admins (propriétaire uniquement)\n` +
//                                          `- .delete : Supprimer un message cité\n` +
//                                          `**Médias** :\n` +
//                                          `- .sticker : Convertir une image/vidéo en sticker\n` +
//                                          `- .image : Convertir un sticker en image\n` +
//                                          `- .video : Convertir un sticker animé en vidéo\n` +
//                                          `- .download : Télécharger un statut\n` +
//                                          `- .tiktok <URL> : Télécharger une vidéo TikTok\n` +
//                                          `- .insta <URL> : Télécharger une vidéo Instagram\n` +
//                                          `**Recherche** :\n` +
//                                          `- .find <terme> : Recherche Google\n` +
//                                          `- .gimage <terme> : Recherche d'images Google\n` +
//                                          `**Fun** :\n` +
//                                          `- .laugh : Envoyer un audio de rire\n` +
//                                          `- .cry : Envoyer un audio de pleurs\n` +
//                                          `- .applaud : Envoyer un audio d'applaudissements\n` +
//                                          `- .dorian : Envoyer un sticker pouce levé\n` +
//                                          `- .gloglo : Envoyer un sticker drôle\n` +
//                                          `- .zi : Envoyer un sticker triste\n` +
//                                          `- .react <emoji> : Réagir avec un emoji\n` +
//                                          `**Statuts** :\n` +
//                                          `- .statut [drole|triste|autre] : Définir un statut\n` +
//                                          `**Autres** :\n` +
//                                          `- .info : À propos du bot\n` +
//                                          `- .creator : À propos du créateur\n` +
//                                          `- .catalogue : Voir les produits\n` +
//                                          `- .produit1 à .produit5 : Détails des produits\n` +
//                                          `- .send : Transférer une image/vidéo\n` +
//                                          `- .join <lien> : Rejoindre un groupe\n` +
//                                          `- .alive : Vérifier si le bot est en ligne\n` +
//                                          `**Propriétaire uniquement** :\n` +
//                                          `- .restart : Redémarrer le bot\n` +
//                                          `- .update : Mettre à jour le bot\n` +
//                                          `- .broadcast <message> : Envoyer un message à tous\n` +
//                                          `Rejoignez notre groupe : ${GROUP_INVITE_LINK}\n` +
//                                          `Amusez-vous ! 😎`
//                             }, 1000);
//                             await showMenuImage(sock, sender, msg.key, GROUP_INVITE_LINK);
//                             break;
//                         case 'menu':
//                             await reactToMessage(sock, sender, messageId, '🎬');
//                             await safeSendMessage(sock, sender, { text: 'Affichage du menu vidéo en cours, veuillez patienter...' }, 500);
//                             await showMenuVideo(sock, sender, msg.key, GROUP_INVITE_LINK);
//                             break;
//                         case 'info':
//                             await reactToMessage(sock, sender, messageId, 'ℹ️');
//                             await safeSendMessage(sock, sender, {
//                                 image: { url: './images/menu.jpg' },
//                                 caption: `🌟 **Aquila Bot - À propos** 🌟\n` +
//                                          `**Description** : Je suis Aquila Bot, un assistant WhatsApp intelligent et polyvalent créé pour aider, divertir et gérer vos groupes avec style ! 😎\n` +
//                                          `**Créateur** : Essoya le prince myènè\n` +
//                                          `**Numéro WhatsApp du créateur** : +${CREATOR_CONTACT.split('@')[0]}\n` +
//                                          `**Lien du groupe WhatsApp** : ${GROUP_INVITE_LINK}\n` +
//                                          `**Site web** : https://x.ai/grok\n` +
//                                          `**Fonctionnalités principales** :\n` +
//                                          `- 📜 Commandes : .help, .menu, .sticker, .image, .video, .tiktok, .insta, .find, .gimage, etc.\n` +
//                                          `- 🛡️ Gestion de groupe : Anti-lien, anti-mot, messages de bienvenue/au revoir, block.\n` +
//                                          `- 🎨 Création de stickers : Conversion d'images/vidéos en stickers.\n` +
//                                          `- 🎥 Téléchargement : Statuts WhatsApp, vidéos TikTok, Instagram.\n` +
//                                          `- 🔍 Recherche : Recherche Google et recherche d'images.\n` +
//                                          `- 🤖 Réponses IA : Réponses intelligentes via Gemini.\n` +
//                                          `- 🎉 Fun : Réactions emojis, audios, stickers personnalisés.\n` +
//                                          `Tapez .help pour découvrir toutes mes commandes ! 🚀`,
//                                 mentions: [CREATOR_CONTACT]
//                             }, 1000);
//                             try {
//                                 const audioBuffer = await fs.readFile('./audios/info.mp3');
//                                 await safeSendMessage(sock, sender, { audio: audioBuffer, mimetype: 'audio/mpeg' }, 500);
//                             } catch (err) {
//                                 console.error('Erreur envoi audio info:', err.message);
//                                 await safeSendMessage(sock, sender, { text: 'Erreur lors de l\'envoi de l\'audio de présentation.' }, 500);
//                             }
//                             break;
//                         case 'sticker':
//                             await reactToMessage(sock, sender, messageId, '✨');
//                             await safeSendMessage(sock, sender, { text: 'Création de votre sticker en cours, veuillez patienter...' }, 500);
//                             await mediaToSticker(sock, sender, quoted);
//                             break;
//                         case 'image':
//                             await reactToMessage(sock, sender, messageId, '🖼️');
//                             await safeSendMessage(sock, sender, { text: 'Conversion de votre sticker en image en cours, veuillez patienter...' }, 500);
//                             await stickerToImage(sock, sender, quoted);
//                             break;
//                         case 'video':
//                             await reactToMessage(sock, sender, messageId, '🎞️');
//                             await safeSendMessage(sock, sender, { text: 'Conversion de votre sticker en vidéo en cours, veuillez patienter...' }, 500);
//                             await stickerToVideo(sock, sender, quoted);
//                             break;
//                         case 'download':
//                             await reactToMessage(sock, sender, messageId, '⬇️');
//                             await safeSendMessage(sock, sender, { text: 'Téléchargement du statut en cours, veuillez patienter...' }, 500);
//                             await downloadStatus(sock, sender, quoted);
//                             break;
//                         case 'tiktok':
//                             await reactToMessage(sock, sender, messageId, '🎥');
//                             if (!args) {
//                                 await safeSendMessage(sock, sender, { text: 'Utilisez : .tiktok <URL>' }, 500);
//                                 break;
//                             }
//                             await safeSendMessage(sock, sender, { text: 'Téléchargement de la vidéo TikTok en cours...' }, 1000);
//                             await downloadTikTok(sock, sender, args);
//                             break;
//                         case 'insta':
//                             await reactToMessage(sock, sender, messageId, '📸');
//                             if (!args) {
//                                 await safeSendMessage(sock, sender, { text: 'Utilisez : .insta <URL>' }, 500);
//                                 break;
//                             }
//                             await safeSendMessage(sock, sender, { text: 'Téléchargement de la vidéo Instagram en cours...' }, 1000);
//                             await downloadInstagram(sock, sender, args);
//                             break;
//                         case 'find':
//                             await reactToMessage(sock, sender, messageId, '🔍');
//                             if (!args) {
//                                 await safeSendMessage(sock, sender, { text: 'Utilisez : .find <terme>' }, 500);
//                                 break;
//                             }
//                             await safeSendMessage(sock, sender, { text: 'Recherche Google en cours, veuillez patienter...' }, 500);
//                             const searchResult = await googleSearch(args);
//                             await safeSendMessage(sock, sender, { text: searchResult }, 500);
//                             break;
//                         case 'gimage':
//                             await reactToMessage(sock, sender, messageId, '🖼️');
//                             if (!args) {
//                                 await safeSendMessage(sock, sender, { text: 'Utilisez : .gimage <terme>' }, 500);
//                                 break;
//                             }
//                             await safeSendMessage(sock, sender, { text: 'Recherche d\'image Google en cours, veuillez patienter...' }, 500);
//                             try {
//                                 const imageUrl = await googleImageSearch(args);
//                                 if (!imageUrl) {
//                                     await safeSendMessage(sock, sender, { text: 'Aucune image trouvée.' }, 500);
//                                     break;
//                                 }
//                                 const response = await axios.get(imageUrl, { responseType: 'arraybuffer', headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } });
//                                 const imageBuffer = Buffer.from(response.data);
//                                 await safeSendMessage(sock, sender, { image: imageBuffer }, 500);
//                             } catch (err) {
//                                 console.error('Erreur téléchargement image :', err.message);
//                                 await safeSendMessage(sock, sender, { text: 'Erreur lors du téléchargement de l\'image.' }, 500);
//                             }
//                             break;
//                         case 'catalogue':
//                             await safeSendMessage(sock, sender, {
//                                 image: { url: './images/catalogue.jpg' },
//                                 caption: `🛍️ Catalogue Aquila Bot 🌟\n` +
//                                          `Voici quelques produits que tu peux consulter :\n` +
//                                          `1️⃣ Azeva - commande: .produit1\n` +
//                                          `2️⃣ Oreniga - commande: .produit2\n` +
//                                          `3️⃣ Alissa CV-Letters - commande: .produit3\n` +
//                                          `4️⃣ Alissa School - commande: .produit4\n` +
//                                          `5️⃣ Décodeur64 - commande: .produit5\n` +
//                                          `Tape la commande correspondant au produit pour voir les détails 😎💬`
//                             }, 1000);
//                             break;
//                         case 'produit1':
//                         case 'produit2':
//                         case 'produit3':
//                         case 'produit4':
//                         case 'produit5':
//                             const prodId = parseInt(command.replace('produit', ''));
//                             const prod = products.find(p => p.id === prodId);
//                             if (prod) {
//                                 await safeSendMessage(sock, sender, { image: { url: prod.image }, caption: `🛒 ${prod.title} 🌟\n${prod.description}\n🔗 Lien: ${prod.link}` }, 1000);
//                             }
//                             break;
//                         case 'send':
//                             if (!quoted) {
//                                 await safeSendMessage(sock, sender, { text: 'Veuillez citer une image ou une vidéo à transférer.' }, 500);
//                                 await reactToMessage(sock, sender, messageId, '❌');
//                                 break;
//                             }
//                             await safeSendMessage(sock, sender, { text: 'Transfert du média en cours, veuillez patienter...' }, 500);
//                             const targetNumber = args ? `${args.split(' ')[0]}@s.whatsapp.net` : null;
//                             let quotedMessage = quoted;
//                             let messageType = Object.keys(quotedMessage).find(k => ['imageMessage', 'videoMessage'].includes(k));
//                             if (!messageType && (quotedMessage.ephemeralMessage || quotedMessage.viewOnceMessageV2)) {
//                                 const innerMessage = quotedMessage.ephemeralMessage?.message || quotedMessage.viewOnceMessageV2?.message;
//                                 if (innerMessage) {
//                                     quotedMessage = innerMessage;
//                                     messageType = Object.keys(quotedMessage).find(k => ['imageMessage', 'videoMessage'].includes(k));
//                                 }
//                             }
//                             if (!messageType) {
//                                 await safeSendMessage(sock, sender, { text: 'Le message cité n\'est ni une image ni une vidéo.' }, 500);
//                                 await reactToMessage(sock, sender, messageId, '❌');
//                                 break;
//                             }
//                             try {
//                                 const stream = await retryOperation(() => downloadContentFromMessage(quotedMessage[messageType], messageType.replace('Message', '').toLowerCase()));
//                                 let buffer = Buffer.from([]);
//                                 for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
//                                 const mediaOptions = messageType === 'imageMessage' ? { image: buffer } : { video: buffer };
//                                 await safeSendMessage(sock, CREATOR_CONTACT, mediaOptions, 500);
//                                 if (targetNumber) {
//                                     await safeSendMessage(sock, targetNumber, mediaOptions, 500);
//                                 }
//                                 await safeSendMessage(sock, sender, {
//                                     [messageType === 'imageMessage' ? 'image' : 'video']: buffer,
//                                     caption: `✅ Voici le média transféré${targetNumber ? ` à ${targetNumber}` : ''}.`
//                                 }, 1000);
//                                 await reactToMessage(sock, sender, messageId, '✅');
//                             } catch (err) {
//                                 console.error('Erreur lors du transfert du média:', err.message);
//                                 await safeSendMessage(sock, sender, { text: '❌ Impossible de transférer le média.' }, 500);
//                                 await reactToMessage(sock, sender, messageId, '❌');
//                             }
//                             break;
//                         case 'join':
//                             if (!args) {
//                                 await safeSendMessage(sock, sender, { text: 'Utilisez : .join <lien>' }, 500);
//                                 break;
//                             }
//                             try {
//                                 const inviteCodeMatch = args.match(/chat\.whatsapp\.com\/([0-9A-Za-z]+)/);
//                                 if (!inviteCodeMatch) {
//                                     await safeSendMessage(sock, sender, { text: 'Lien invalide. Vérifiez le lien d\'invitation.' }, 500);
//                                     break;
//                                 }
//                                 const inviteCode = inviteCodeMatch[1];
//                                 await sock.groupAcceptInvite(inviteCode);
//                                 await safeSendMessage(sock, sender, { text: '✅ Groupe rejoint avec succès !' }, 500);
//                             } catch (err) {
//                                 console.error('Erreur jointure groupe:', err.message);
//                                 await safeSendMessage(sock, sender, { text: '❌ Impossible de rejoindre le groupe. Le lien peut être invalide ou expiré.' }, 500);
//                             }
//                             break;
//                         case 'creator':
//                             await reactToMessage(sock, sender, messageId, '🧑‍💻');
//                             await safeSendMessage(sock, sender, {
//                                 image: { url: './images/creator.jpg' },
//                                 caption: `🌟 **À propos du Créateur** 🌟\n` +
//                                          `**Nom** : Essongue Yann Chéri\n` +
//                                          `**Alias** : Essoya le prince myènè\n` +
//                                          `**Description** : Étudiant à l'INPTIC, je suis développeur et passionné de cybersécurité et réseaux. J'ai créé Aquila Bot pour rendre vos conversations plus fun et vos groupes mieux gérés ! 😎\n` +
//                                          `**Contact** : Écrivez-moi sur WhatsApp : https://wa.me/${CREATOR_CONTACT.split('@')[0]}\n` +
//                                          `Tapez .help pour découvrir ce que mon bot peut faire ! 🚀`,
//                                 mentions: [CREATOR_CONTACT]
//                             }, 1000);
//                             break;
//                         case 'delete':
//                             if (!isGroup) {
//                                 await safeSendMessage(sock, sender, { text: 'Cette commande est seulement pour les groupes.' }, 500);
//                                 await reactToMessage(sock, sender, messageId, '❌');
//                                 break;
//                             }
//                             if (!isAdmin) {
//                                 await safeSendMessage(sock, sender, { text: 'Seuls les admins peuvent utiliser cette commande.' }, 500);
//                                 await reactToMessage(sock, sender, messageId, '❌');
//                                 break;
//                             }
//                             if (!quoted) {
//                                 await safeSendMessage(sock, sender, { text: 'Veuillez citer un message à supprimer.' }, 500);
//                                 await reactToMessage(sock, sender, messageId, '❌');
//                                 break;
//                             }
//                             const deleteContextInfo = msg.message.extendedTextMessage?.contextInfo;
//                             const deleteQuotedKey = deleteContextInfo?.stanzaId;
//                             const deleteQuotedParticipant = deleteContextInfo?.participant;
//                             if (!deleteQuotedKey || !deleteQuotedParticipant) {
//                                 await safeSendMessage(sock, sender, { text: 'Impossible de supprimer : le message cité n\'a pas les informations nécessaires.' }, 500);
//                                 await reactToMessage(sock, sender, messageId, '❌');
//                                 break;
//                             }
//                             try {
//                                 await safeSendMessage(sock, sender, { delete: { remoteJid: sender, fromMe: false, id: deleteQuotedKey, participant: deleteQuotedParticipant } }, 500);
//                                 await safeSendMessage(sock, sender, { text: '✅ Message supprimé pour tous.' }, 500);
//                                 await reactToMessage(sock, sender, messageId, '✅');
//                             } catch (err) {
//                                 console.error('Erreur lors de la suppression du message:', err.message);
//                                 await safeSendMessage(sock, sender, { text: '❌ Impossible de supprimer le message. Je dois être admin.' }, 500);
//                                 await reactToMessage(sock, sender, messageId, '❌');
//                             }
//                             break;
//                         case 'promote':
//                         case 'demote':
//                         case 'kick':
//                             if (!isGroup) {
//                                 await safeSendMessage(sock, sender, { text: 'Cette commande est seulement pour les groupes.' }, 500);
//                                 await reactToMessage(sock, sender, messageId, '❌');
//                                 break;
//                             }
//                             if (!isAdmin) {
//                                 await safeSendMessage(sock, sender, { text: 'Seuls les admins peuvent utiliser cette commande.' }, 500);
//                                 await reactToMessage(sock, sender, messageId, '❌');
//                                 break;
//                             }
//                             const actionContextInfo = msg.message.extendedTextMessage?.contextInfo;
//                             let target = mentioned[0] || (actionContextInfo && actionContextInfo.participant);
//                             if (!target) {
//                                 await safeSendMessage(sock, sender, { text: 'Veuillez mentionner ou citer l\'utilisateur.' }, 500);
//                                 await reactToMessage(sock, sender, messageId, '❌');
//                                 break;
//                             }
//                             if (command === 'kick' && target === botJid && participant !== CREATOR_JID) {
//                                 await safeSendMessage(sock, sender, { text: '❌ Vous ne pouvez pas me kicker ! Seul le créateur peut le faire.' }, 500);
//                                 await reactToMessage(sock, sender, messageId, '❌');
//                                 break;
//                             }
//                             try {
//                                 const action = command === 'promote' ? 'promote' : command === 'demote' ? 'demote' : 'remove';
//                                 await sock.groupParticipantsUpdate(sender, [target], action);
//                                 await safeSendMessage(sock, sender, { text: `✅ Utilisateur ${action === 'remove' ? 'retiré' : action === 'promote' ? 'promu admin' : 'rétrogradé'}.` }, 500);
//                                 await reactToMessage(sock, sender, messageId, '✅');
//                             } catch (err) {
//                                 console.error(`Erreur lors de ${command}:`, err.message);
//                                 await safeSendMessage(sock, sender, { text: `❌ Impossible d'exécuter ${command}. Je dois être admin.` }, 500);
//                                 await reactToMessage(sock, sender, messageId, '❌');
//                             }
//                             break;
//                         case 'add':
//                             if (!isGroup) {
//                                 await safeSendMessage(sock, sender, { text: 'Cette commande est seulement pour les groupes.' }, 500);
//                                 await reactToMessage(sock, sender, messageId, '❌');
//                                 break;
//                             }
//                             if (!isAdmin) {
//                                 await safeSendMessage(sock, sender, { text: 'Seuls les admins peuvent utiliser cette commande.' }, 500);
//                                 await reactToMessage(sock, sender, messageId, '❌');
//                                 break;
//                             }
//                             if (!args) {
//                                 await safeSendMessage(sock, sender, { text: 'Utilisez : .add <numéro> (format international sans +)' }, 500);
//                                 await reactToMessage(sock, sender, messageId, '❌');
//                                 break;
//                             }
//                             const number = args.replace(/\D/g, '') + '@s.whatsapp.net';
//                             try {
//                                 await sock.groupParticipantsUpdate(sender, [number], 'add');
//                                 await safeSendMessage(sock, sender, { text: `✅ Membre ${args} ajouté.` }, 500);
//                                 await reactToMessage(sock, sender, messageId, '✅');
//                             } catch (err) {
//                                 console.error('Erreur lors de l\'ajout:', err.message);
//                                 await safeSendMessage(sock, sender, { text: '❌ Impossible d\'ajouter le membre.' }, 500);
//                                 await reactToMessage(sock, sender, messageId, '❌');
//                             }
//                             break;
//                         case 'tagall':
//                             if (!isGroup) {
//                                 await safeSendMessage(sock, sender, { text: 'Cette commande est seulement pour les groupes.' }, 500);
//                                 await reactToMessage(sock, sender, messageId, '❌');
//                                 break;
//                             }
//                             if (!isAdmin) {
//                                 await safeSendMessage(sock, sender, { text: 'Seuls les admins peuvent utiliser cette commande.' }, 500);
//                                 await reactToMessage(sock, sender, messageId, '❌');
//                                 break;
//                             }
//                             const participants = metadata.participants.map(p => p.id);
//                             await safeSendMessage(sock, sender, { text: args || '🔔 Tag all !', mentions: participants }, 1000);
//                             await reactToMessage(sock, sender, messageId, '🔔');
//                             break;
//                         case 'hidetag':
//                             if (!isGroup) {
//                                 await safeSendMessage(sock, sender, { text: 'Cette commande est seulement pour les groupes.' }, 500);
//                                 await reactToMessage(sock, sender, messageId, '❌');
//                                 break;
//                             }
//                             if (!isAdmin) {
//                                 await safeSendMessage(sock, sender, { text: 'Seuls les admins peuvent utiliser cette commande.' }, 500);
//                                 await reactToMessage(sock, sender, messageId, '❌');
//                                 break;
//                             }
//                             const participantsHide = metadata.participants.map(p => p.id);
//                             await safeSendMessage(sock, sender, { text: args || '🔕 Message du propriétaire', mentions: participantsHide }, 1000);
//                             await reactToMessage(sock, sender, messageId, '🔕');
//                             break;
//                         case 'kickall':
//                             if (!isGroup) {
//                                 await safeSendMessage(sock, sender, { text: 'Cette commande est seulement pour les groupes.' }, 500);
//                                 await reactToMessage(sock, sender, messageId, '❌');
//                                 break;
//                             }
//                             if (participant !== CREATOR_JID) {
//                                 await safeSendMessage(sock, sender, { text: 'Seul le propriétaire peut utiliser cette commande.' }, 500);
//                                 await reactToMessage(sock, sender, messageId, '❌');
//                                 break;
//                             }
//                             if (!isBotAdmin) {
//                                 await safeSendMessage(sock, sender, { text: 'Je dois être admin pour effectuer cette action.' }, 500);
//                                 await reactToMessage(sock, sender, messageId, '❌');
//                                 break;
//                             }
//                             const nonAdmins = metadata.participants.filter(p => !p.admin && p.id !== botJid).map(p => p.id);
//                             if (nonAdmins.length > 0) {
//                                 try {
//                                     await sock.groupParticipantsUpdate(sender, nonAdmins, 'remove');
//                                     await safeSendMessage(sock, sender, { text: '✅ Tous les non-admins ont été retirés.' }, 500);
//                                     await reactToMessage(sock, sender, messageId, '✅');
//                                 } catch (err) {
//                                     console.error('Erreur lors du kickall:', err.message);
//                                     await safeSendMessage(sock, sender, { text: '❌ Erreur lors du retrait des membres.' }, 500);
//                                     await reactToMessage(sock, sender, messageId, '❌');
//                                 }
//                             } else {
//                                 await safeSendMessage(sock, sender, { text: 'Aucun non-admin à retirer.' }, 500);
//                                 await reactToMessage(sock, sender, messageId, '❌');
//                             }
//                             break;
//                         case 'alive':
//                             await reactToMessage(sock, sender, messageId, '✅');
//                             await safeSendMessage(sock, sender, {
//                                 image: { url: './images/alive.jpg' },
//                                 caption: `🌟 Salut ! Aquila Bot est en ligne 🤖💬, prêt à répondre à tes questions et à t'amuser 😎💥. Ton assistant fidèle et un peu sarcastique 😏🖤 est prêt à agir ! 🚀`
//                             }, 1000);
//                             break;
//                         case 'react':
//                             if (!args) {
//                                 await safeSendMessage(sock, sender, { text: 'Utilisez : .react <emoji>' }, 500);
//                                 break;
//                             }
//                             await reactToMessage(sock, sender, messageId, args);
//                             break;
//                         case 'laugh':
//                             try {
//                                 const audioBuffer = await fs.readFile(LAUGH_AUDIO);
//                                 await safeSendMessage(sock, sender, { audio: audioBuffer, mimetype: 'audio/ogg; codecs=opus' }, 500);
//                                 await reactToMessage(sock, sender, messageId, '😂');
//                             } catch (err) {
//                                 console.error('Erreur envoi audio laugh:', err.message);
//                                 await safeSendMessage(sock, sender, { text: 'Erreur lors de l\'envoi de l\'audio.' }, 500);
//                             }
//                             break;
//                         case 'cry':
//                             try {
//                                 const audioBuffer = await fs.readFile(CRY_AUDIO);
//                                 await safeSendMessage(sock, sender, { audio: audioBuffer, mimetype: 'audio/ogg; codecs=opus' }, 500);
//                                 await reactToMessage(sock, sender, messageId, '😢');
//                             } catch (err) {
//                                 console.error('Erreur envoi audio cry:', err.message);
//                                 await safeSendMessage(sock, sender, { text: 'Erreur lors de l\'envoi de l\'audio.' }, 500);
//                             }
//                             break;
//                         case 'applaud':
//                             try {
//                                 const audioBuffer = await fs.readFile(APPLAUD_AUDIO);
//                                 await safeSendMessage(sock, sender, { audio: audioBuffer, mimetype: 'audio/ogg; codecs=opus' }, 500);
//                                 await reactToMessage(sock, sender, messageId, '👏');
//                             } catch (err) {
//                                 console.error('Erreur envoi audio applaud:', err.message);
//                                 await safeSendMessage(sock, sender, { text: 'Erreur lors de l\'envoi de l\'audio.' }, 500);
//                             }
//                             break;
//                         case 'dorian':
//                             try {
//                                 const stickerBuffer = await convertToSticker(THUMBSUP_IMAGE);
//                                 await safeSendMessage(sock, sender, { sticker: stickerBuffer }, 500);
//                                 await safeSendMessage(sock, sender, { text: 'Voici votre sticker' }, 500);
//                                 await reactToMessage(sock, sender, messageId, '👍');
//                             } catch (err) {
//                                 console.error('Erreur envoi sticker thumbsup:', err.message);
//                                 await safeSendMessage(sock, sender, { text: 'Erreur lors de l\'envoi du sticker.' }, 500);
//                             }
//                             break;
//                         case 'gloglo':
//                             try {
//                                 const stickerBuffer = await convertToSticker(LOL_IMAGE);
//                                 await safeSendMessage(sock, sender, { sticker: stickerBuffer }, 500);
//                                 await safeSendMessage(sock, sender, { text: 'Voici votre sticker' }, 500);
//                                 await reactToMessage(sock, sender, messageId, '😆');
//                             } catch (err) {
//                                 console.error('Erreur envoi sticker lol:', err.message);
//                                 await safeSendMessage(sock, sender, { text: 'Erreur lors de l\'envoi du sticker.' }, 500);
//                             }
//                             break;
//                         case 'zi':
//                             try {
//                                 const stickerBuffer = await convertToSticker(SAD_IMAGE);
//                                 await safeSendMessage(sock, sender, { sticker: stickerBuffer }, 500);
//                                 await safeSendMessage(sock, sender, { text: 'Voici votre sticker' }, 500);
//                                 await reactToMessage(sock, sender, messageId, '😔');
//                             } catch (err) {
//                                 console.error('Erreur envoi sticker sad:', err.message);
//                                 await safeSendMessage(sock, sender, { text: 'Erreur lors de l\'envoi du sticker.' }, 500);
//                             }
//                             break;
//                         case 'statut':
//                             await reactToMessage(sock, sender, messageId, '📸');
//                             const statusType = args.toLowerCase() || 'random';
//                             await setRandomStatus(sock, statusType);
//                             await safeSendMessage(sock, sender, { text: `✅ Status mis à jour avec type "${statusType}".` }, 500);
//                             break;
//                         case 'restart':
//                         case 'update':
//                         case 'broadcast':
//                             if (participant !== CREATOR_JID) {
//                                 await safeSendMessage(sock, sender, { text: '❌ Commande réservée au propriétaire.' }, 500);
//                                 await reactToMessage(sock, sender, messageId, '❌');
//                                 break;
//                             }
//                             if (command === 'restart') {
//                                 await safeSendMessage(sock, sender, { text: 'Redémarrage en cours...' }, 500);
//                                 process.exit(0);
//                             } else if (command === 'update') {
//                                 await safeSendMessage(sock, sender, { text: 'Mise à jour en cours...' }, 500);
//                             } else if (command === 'broadcast') {
//                                 const numbers = process.env.BROADCAST_NUMBERS ? process.env.BROADCAST_NUMBERS.split(',') : [];
//                                 if (!args && numbers.length === 0) {
//                                     await safeSendMessage(sock, sender, { text: 'Utilisez : .broadcast <message> ou configurez BROADCAST_NUMBERS.' }, 500);
//                                     break;
//                                 }
//                                 const broadcastMessage = args || process.env.BROADCAST_MESSAGE || 'Message de broadcast par défaut.';
//                                 for (const number of numbers) {
//                                     const jid = number.trim() + '@s.whatsapp.net';
//                                     await safeSendMessage(sock, jid, { text: broadcastMessage }, 2000); // Delay between broadcasts
//                                 }
//                                 await safeSendMessage(sock, sender, { text: 'Broadcast envoyé !' }, 500);
//                             }
//                             await reactToMessage(sock, sender, messageId, '🔒');
//                             break;
//                         default:
//                             await reactToMessage(sock, sender, messageId, '❓');
//                             await safeSendMessage(sock, sender, { text: `Commande inconnue. Tapez *${PREFIX}help* pour voir les commandes.` }, 500);
//                     }
//                 });
//                 return;
//             }

//             if (text) {
//                 const geminiReply = await askGemini(text, sender);
//                 await safeSendMessage(sock, sender, { text: `@${participant.split('@')[0]} ${geminiReply}`, mentions: [participant] }, 500);
//             }
//         } catch (globalErr) {
//             console.error('Erreur globale dans messages.upsert:', globalErr.message);
//             // Ne pas crasher le bot, juste logger
//         }
//     });

//     sock.ev.on('group-participants.update', async ({ id, participants, action }) => {
//         try {
//             console.log(`Événement group-participants.update: group=${id}, action=${action}, participants=${JSON.stringify(participants)}`);
//             const welcomeEnabled = await getGroupSetting(id, 'welcome');
//             if (!welcomeEnabled) return;
//             const metadata = await retryOperation(() => sock.groupMetadata(id));
//             const totalMembers = metadata.participants.length;
//             const totalAdmins = metadata.participants.filter(p => p.admin).length;
//             for (const participant of participants) {
//                 let imageOptions = {};
//                 try {
//                     const profilePicUrl = await sock.profilePictureUrl(participant, 'image');
//                     const response = await axios.get(profilePicUrl, { responseType: 'arraybuffer', headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } });
//                     imageOptions = { image: Buffer.from(response.data) };
//                 } catch (err) {
//                     console.error(`Erreur lors de la récupération de la photo de profil pour ${participant}:`, err.message);
//                     imageOptions = { image: { url: DEFAULT_PROFILE_IMAGE } };
//                 }
//                 if (action === 'add') {
//                     await safeSendMessage(sock, id, {
//                         ...imageOptions,
//                         caption: `🎉 Bienvenue @${participant.split('@')[0]} dans le groupe ! 😎\n` +
//                                  `Amuse-toi et tape .help pour découvrir mes commandes !\n` +
//                                  `📊 Nombre total de membres : ${totalMembers}\n` +
//                                  `👑 Nombre d'admins : ${totalAdmins}`,
//                         mentions: [participant]
//                     }, 1000);
//                     console.log(`Message de bienvenue envoyé à ${participant} dans le groupe ${id}`);
//                 } else if (action === 'remove') {
//                     await safeSendMessage(sock, id, {
//                         ...imageOptions,
//                         caption: `👋 @${participant.split('@')[0]} a quitté le groupe. À bientôt peut-être ! 😢\n` +
//                                  `📊 Nombre total de membres : ${totalMembers}\n` +
//                                  `👑 Nombre d'admins : ${totalAdmins}`,
//                         mentions: [participant]
//                     }, 1000);
//                     console.log(`Message d'au revoir envoyé pour ${participant} dans le groupe ${id}`);
//                 }
//             }
//         } catch (err) {
//             console.error(`Erreur lors de l'envoi du message ${action === 'add' ? 'de bienvenue' : 'd\'au revoir'}:`, err.message);
//         }
//     });

//     sock.ev.on('connection.update', ({ connection, lastDisconnect, qr }) => {
//         if (qr) {
//             console.log('QR code généré. Scannez avec WhatsApp :');
//             QRCode.toString(qr, { type: 'terminal' }, (err, url) => err ? console.error(err) : console.log(url));
//         }
//         if (connection === 'close') {
//             const reason = lastDisconnect?.error?.output?.statusCode || 'unknown';
//             console.log('Déconnecté:', reason);
//             if (reason !== DisconnectReason.loggedOut) setTimeout(startBot, 5000);
//             else console.log('Déconnecté (logged out). Supprimez auth_info et relancez.');
//         } else if (connection === 'open') {
//             console.log('Connecté à WhatsApp!');
//             sock.sendMessage(CREATOR_CONTACT, { text: 'Mon créateur, je suis en ligne 🙂‍↔️🥺🥹🥺' });
//             setInterval(async () => {
//                 try {
//                     await sock.sendMessage(CREATOR_CONTACT, { text: 'Bot status: Online et opérationnel !' });
//                 } catch (err) {
//                     console.error('Erreur message périodique:', err.message);
//                 }
//             }, 600000);
//         }
//     });

//     return sock;
// }

// exportstartBot;











































// const { default: makeWASocket, useMultiFileAuthState } = require('baileys');
// const fs = require('fs').promises;

// async function testImage() {
//   const { state, saveCreds } = await useMultiFileAuthState('./auth_info');
//   const sock = makeWASocket({
//     auth: state,
//     logger: require('pino')({ level: 'debug' })
//   });

//   sock.ev.on('creds.update', saveCreds);
//   sock.ev.on('connection.update', async ({ connection }) => {
//     if (connection === 'open') {
//       console.log('Connecté à WhatsApp!');
//       console.log(`Compte utilisé: ${JSON.stringify(sock.user)}`);
//       try {
//         const imageBuffer = await fs.readFile('./images/status3.jpg');
//         console.log(`Image lue, taille: ${imageBuffer.length} octets`);
//         const result = await sock.sendMessage('24106813542@s.whatsapp.net', { image: imageBuffer, caption: 'Test image normale' });
//         console.log(`Image envoyée: ${JSON.stringify(result, null, 2)}`);
//         console.log(`Vérifiez le message dans WhatsApp pour 24106813542@s.whatsapp.net`);
//         process.exit(0);
//       } catch (err) {
//         console.error('Erreur envoi image:', err.message);
//         console.error('Détails erreur:', JSON.stringify(err, null, 2));
//         process.exit(1);
//       }
//     }
//   });
// }

// testImage();
















