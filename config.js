// require('dotenv').config();

// export{
//     SESSION_DIR: process.env.SESSION_DIR || './auth_info',
//     CREATOR_CONTACT: 'https://wa.me/+24166813542',
//     PREFIX: '.',
//     MENU_IMAGE_PATH: './images/menu.jpg',
//     MENU_VIDEO_PATH: './videos/menu.mp4',
//     CACHE_TIMEOUT: 10000,
//     forbiddenWords: ['insulte', 'offensive', 'inapproprié']
// };





import dotenv from 'dotenv';
dotenv.config();

export const SESSION_DIR = process.env.SESSION_DIR || './auth_info';
export const CREATOR_CONTACT = 'https://wa.me/+24166813542';
export const PREFIX = '.';
export const MENU_IMAGE_PATH = './images/menu.jpg';
export const MENU_VIDEO_PATH = './videos/menu.mp4';
export const CACHE_TIMEOUT = 10000;
export const forbiddenWords = ['insulte', 'offensive', 'inapproprié'];
