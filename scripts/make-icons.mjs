/** Erzeugt aus public/favicon.svg favicon.ico (32×32, PNG-in-ICO) und apple-touch-icon.png (180×180) mit sharp. */
import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'node:fs';
const svg = readFileSync('public/favicon.svg');
const png32 = await sharp(svg, { density: 300 }).resize(32, 32).png().toBuffer();
const ico = Buffer.alloc(22);
ico.writeUInt16LE(0, 0); ico.writeUInt16LE(1, 2); ico.writeUInt16LE(1, 4);
ico.writeUInt8(32, 6); ico.writeUInt8(32, 7); ico.writeUInt8(0, 8); ico.writeUInt8(0, 9);
ico.writeUInt16LE(1, 10); ico.writeUInt16LE(32, 12);
ico.writeUInt32LE(png32.length, 14); ico.writeUInt32LE(22, 18);
writeFileSync('public/favicon.ico', Buffer.concat([ico, png32]));
await sharp(svg, { density: 600 }).resize(180, 180).flatten({ background: process.env.ICON_BG || '#1c1a17' }).png().toFile('public/apple-touch-icon.png');
console.log('Icons erzeugt');
