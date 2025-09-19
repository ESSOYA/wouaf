
// const fs = require('fs');
// const CREATOR_CONTACT = 'https://wa.me/+24166813542';
// const GROUP_INVITE = 'https://chat.whatsapp.com/HJpP3DYiaSD1NCryGN0KO5?mode=ems_copy_t';
// const PREFIX = '.';
// const MENU_IMAGE_PATH = './images/menu.jpg';
// const MENU_VIDEO_PATH = './videos/itachi.mp4';
// const CREATOR_JID = '24166813542@s.whatsapp.net';

// function generateMenuText(isOwner = false) {
//   let menu = `
// ╭─── *🌌 AQUILA BOT 🌟* ───╮
// │ *Créé par* : Essongue Yann Chéri  
// │ *Alias* : Essoya le prince myènè  
// │ 
// ╰───────────────────╯

// *📞 Contact* : ${CREATOR_CONTACT}  
// *👥 Groupe officiel* : ${GROUP_INVITE}

// ╭─── *⚙️ Commandes Générales* ───╮
// │ *${PREFIX}help*     📜 Afficher ce menu
// │ *${PREFIX}menu*     🎥 Menu animé (GIF)
// │ *${PREFIX}info*     ℹ️ Infos sur le bot
// │ *${PREFIX}alive*    ✅ Vérifier le statut
// │ *${PREFIX}creator*  🧑‍💻 Contact du créateur
// ╰───────────────────╯

// ╭─── *🖼️ Multimédia* ───╮
// │ *${PREFIX}sticker*   🎨 Image/vidéo → sticker
// │ *${PREFIX}image*     🖼️ Sticker → image
// │ *${PREFIX}video*     🎞️ Sticker animé → vidéo
// │ *${PREFIX}download*  ⬇️ Télécharger un statut
// │ *${PREFIX}yt <url>*  📹 Télécharger vidéo YouTube
// │ *${PREFIX}gimage <req>* 🔎 Rechercher image Google
// │ *${PREFIX}reverse*   🔍 Recherche inversée d'image
// ╰───────────────────╯

// ╭─── *🔍 Recherche* ───╮
// │ *${PREFIX}find <req>* 🔎 Rechercher sur Google
// ╰───────────────────╯

// ╭─── *🛍️ Catalogue* ───╮
// │ *${PREFIX}catalogue*  🛒 Voir tous les produits
// │ *${PREFIX}produit1*   📚 Azeva
// │ *${PREFIX}produit2*   📝 Oreniga
// │ *${PREFIX}produit3*   ✍️ Alissa CV-Letters
// │ *${PREFIX}produit4*   🏫 Alissa School
// │ *${PREFIX}produit5*   🔐 Décodeur64
// ╰───────────────────╯

// ╭─── *😄 Réactions Fun* ───╮
// │ *${PREFIX}react <emoji>* 😊 Réagir (ex: .react 👍)
// │ *${PREFIX}laugh*    😂 Audio rire
// │ *${PREFIX}cry*      😢 Audio pleurs
// │ *${PREFIX}applaud*  👏 Audio applaudissements
// │ *${PREFIX}dorian*   👍 Sticker pouce
// │ *${PREFIX}gloglo*   😆 Sticker rire
// │ *${PREFIX}zi*       😔 Sticker triste
// ╰───────────────────╯

// ╭─── *👥 Gestion Groupe (Admins)* ───╮
// │ *${PREFIX}join <lien>*      🤝 Rejoindre un groupe
// │ *${PREFIX}promote @user*    ⬆️ Promouvoir membre
// │ *${PREFIX}demote @user*     ⬇️ Rétrograder admin
// │ *${PREFIX}kick @user*       🚪 Retirer membre
// │ *${PREFIX}add <numéro>*     ➕ Ajouter membre
// │ *${PREFIX}tagall [msg]*     🔔 Mentionner tous
// │ *${PREFIX}hidetag [msg]*    🔕 Mention discrète
// │ *${PREFIX}kickall*          🧹 Retirer non-admins
// │ *${PREFIX}on*         🛡️ Activer protections
// │ *${PREFIX}off*      🔓 Désactiver protections
// ╰───────────────────╯

// ╭─── *🤖 Mode IA* ───╮
// │ Posez une question ou envoyez une note vocale pour une réponse intelligente ! 💬
// ╰───────────────────╯
// `;

//   if (isOwner) {
//     menu += `
// ╭─── *🔒 Commandes Propriétaire* ───╮
// │ *${PREFIX}restart*    🔄 Redémarrer le bot
// │ *${PREFIX}update*     📡 Mettre à jour
// │ *${PREFIX}broadcast*  📢 Message à tous
// ╰───────────────────╯
// `;
//   }

//   menu += `
// ╭───────────────────╮
// │ *🚀 Amusez-vous avec Aquila Bot !* 😎
// ╰───────────────────╯
//   `;
//   return menu;
// }

// async function showMenuImage(sock, sender) {
//   const isOwner = sender === CREATOR_JID;
//   const menuText = generateMenuText(isOwner);
//   try {
//     const imageBuffer = fs.readFileSync(MENU_IMAGE_PATH);
//     await sock.sendMessage(sender, { image: imageBuffer, caption: menuText });
//   } catch (err) {
//     console.error('Erreur chargement image menu :', err.message);
//     await sock.sendMessage(sender, { text: `${menuText}\n⚠️ Image du menu non chargée.` });
//   }
// }

// async function showMenuVideo(sock, sender) {
//   const isOwner = sender === CREATOR_JID;
//   const menuText = generateMenuText(isOwner);
//   try {
//     const videoBuffer = fs.readFileSync(MENU_VIDEO_PATH);
//     await sock.sendMessage(sender, { video: videoBuffer, gifPlayback: true, caption: menuText });
//   } catch (err) {
//     console.error('Erreur chargement GIF menu :', err.message);
//     await sock.sendMessage(sender, { text: `${menuText}\n⚠️ GIF du menu non chargé.` });
//   }
// }

// export{ showMenuImage, showMenuVideo };







import fs from 'fs';

export const CREATOR_CONTACT = 'https://wa.me/+24166813542';
export const GROUP_INVITE = 'https://chat.whatsapp.com/HJpP3DYiaSD1NCryGN0KO5?mode=ems_copy_t';
export const PREFIX = '/';
export const MENU_IMAGE_PATH = './images/menu.jpg';
export const MENU_VIDEO_PATH = './videos/senku1.mp4';
export const CREATOR_JID = '24166813542@s.whatsapp.net';

function generateMenuText(isOwner = false) {
  let menu = `
╭─── *🌌 AQUILA BOT 🌟* ───╮
│ *Créé par* : Essongue Yann Chéri  
│ *Alias* : Essoya le prince myènè  
│ 
╰───────────────────╯

*📞 Contact* : ${CREATOR_CONTACT}  
*👥 Groupe officiel* : ${GROUP_INVITE}

╭─── *⚙️ Commandes Générales* ───╮
│ *${PREFIX}help*     📜 Afficher ce menu
│ *${PREFIX}menu*     🎥 Menu animé (GIF)
│ *${PREFIX}info*     ℹ️ Infos sur le bot
│ *${PREFIX}alive*    ✅ Vérifier le statut
│ *${PREFIX}creator*  🧑‍💻 Contact du créateur
╰───────────────────╯

╭─── *🖼️ Multimédia* ───╮
│ *${PREFIX}sticker*   🎨 Image/vidéo → sticker
│ *${PREFIX}image*     🖼️ Sticker → image
│ *${PREFIX}video*     🎞️ Sticker animé → vidéo
│ *${PREFIX}download*  ⬇️ Télécharger un statut
│ *${PREFIX}yt <url>*  📹 Télécharger vidéo YouTube
│ *${PREFIX}gimage <req>* 🔎 Rechercher image Google
│ *${PREFIX}reverse*   🔍 Recherche inversée d'image
╰───────────────────╯

╭─── *🔍 Recherche* ───╮
│ *${PREFIX}find <req>* 🔎 Rechercher sur Google
╰───────────────────╯

╭─── *🛍️ Catalogue* ───╮
│ *${PREFIX}catalogue*  🛒 Voir tous les produits
│ *${PREFIX}produit1*   📚 Azeva
│ *${PREFIX}produit2*   📝 Oreniga
│ *${PREFIX}produit3*   ✍️ Alissa CV-Letters
│ *${PREFIX}produit4*   🏫 Alissa School
│ *${PREFIX}produit5*   🔐 Décodeur64
╰───────────────────╯

╭─── *😄 Réactions Fun* ───╮
│ *${PREFIX}react <emoji>* 😊 Réagir (ex: .react 👍)
│ *${PREFIX}laugh*    😂 Audio rire
│ *${PREFIX}cry*      😢 Audio pleurs
│ *${PREFIX}applaud*  👏 Audio applaudissements
│ *${PREFIX}dorian*   👍 Sticker pouce
│ *${PREFIX}gloglo*   😆 Sticker rire
│ *${PREFIX}zi*       😔 Sticker triste
╰───────────────────╯

╭─── *👥 Gestion Groupe (Admins)* ───╮
│ *${PREFIX}join <lien>*      🤝 Rejoindre un groupe
│ *${PREFIX}promote @user*    ⬆️ Promouvoir membre
│ *${PREFIX}demote @user*     ⬇️ Rétrograder admin
│ *${PREFIX}kick @user*       🚪 Retirer membre
│ *${PREFIX}add <numéro>*     ➕ Ajouter membre
│ *${PREFIX}tagall [msg]*     🔔 Mentionner tous
│ *${PREFIX}hidetag [msg]*    🔕 Mention discrète
│ *${PREFIX}kickall*          🧹 Retirer non-admins
│ *${PREFIX}on*         🛡️ Activer protections
│ *${PREFIX}off*      🔓 Désactiver protections
╰───────────────────╯

╭─── *🤖 Mode IA* ───╮
│ Posez une question ou envoyez une note vocale pour une réponse intelligente ! 💬
╰───────────────────╯
`;

  if (isOwner) {
    menu += `
╭─── *🔒 Commandes Propriétaire* ───╮
│ *${PREFIX}restart*    🔄 Redémarrer le bot
│ *${PREFIX}update*     📡 Mettre à jour
│ *${PREFIX}broadcast*  📢 Message à tous
╰───────────────────╯
`;
  }

  menu += `
╭───────────────────╮
│ *🚀 Amusez-vous avec Aquila Bot !* 😎
╰───────────────────╯
  `;
  return menu;
}

async function showMenuImage(sock, sender) {
  const isOwner = sender === CREATOR_JID;
  const menuText = generateMenuText(isOwner);
  try {
    const imageBuffer = fs.readFileSync(MENU_IMAGE_PATH);
    await sock.sendMessage(sender, { image: imageBuffer, caption: menuText });
  } catch (err) {
    console.error('Erreur chargement image menu :', err.message);
    await sock.sendMessage(sender, { text: `${menuText}\n⚠️ Image du menu non chargée.` });
  }
}

async function showMenuVideo(sock, sender) {
  const isOwner = sender === CREATOR_JID;
  const menuText = generateMenuText(isOwner);
  try {
    const videoBuffer = fs.readFileSync(MENU_VIDEO_PATH);
    await sock.sendMessage(sender, { video: videoBuffer, gifPlayback: true, caption: menuText });
  } catch (err) {
    console.error('Erreur chargement GIF menu :', err.message);
    await sock.sendMessage(sender, { text: `${menuText}\n⚠️ GIF du menu non chargé.` });
  }
}

export{ showMenuImage, showMenuVideo };