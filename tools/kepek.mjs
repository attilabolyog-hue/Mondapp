// Képek a words.js szavaihoz 3×3-as rácsokból. A rácsot egy képgenerátor készíti (pl. Claude Cowork + Higgsfield,
// vagy kézzel a Gemini app), ez a szkript megmondja, mit kell generálni, és szétvágja a kész rácsokat.
// Csak a még kép nélküli szavakkal foglalkozik — új szavak után egyszerűen újra kell futtatni.
//
//   node tools/kepek.mjs          kiírja a tervet, és megírja a feladatlistát: ../kepek-lapok.json (fájlnév + kérés rácsonként)
//   node tools/kepek.mjs --vag    a ../kepek-nyers/ mappába tett kész rácsokat szétvágja img/<szó>.webp fájlokra
//   --kat "Gyümölcs"              csak egy kategória (mindkét módban)
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, '..');                 // a nyers rácsok és a feladatlista a repón kívül maradnak
const RAW = join(OUT, 'kepek-nyers');
const N = 3;          // N×N-es rács
const SIZE = 320;     // a kivágott kép oldala képpontban
const MARGIN = 0.03;  // ennyit vág le minden cella széléből (a szomszéd kép belógása ellen)
const SKIP = ['Fontos szavak'];   // elvont szavak (most, miért, én…): ezekhez a kép félrevezető lenne, marad az emoji

const args = process.argv.slice(2), flag = n => args.includes(n), opt = n => args[args.indexOf(n) + 1];
const only = flag('--kat') && opt('--kat');
const slug = t => encodeURIComponent(t.toLowerCase()).replace(/%/g, '');   // ugyanaz, mint az index.html-ben
const file = w => join(ROOT, 'img', slug(w.t) + '.webp');

const GROUPS = new Function(readFileSync(join(ROOT, 'words.js'), 'utf8') + ';return GROUPS')();
const words = GROUPS.flatMap(g => g.cats).filter(c => c.kind === 'word' && !SKIP.includes(c.name) && (!only || c.name === only)).flatMap(c => c.items);
const todo = words.filter(w => w.en && !existsSync(file(w)));

const prompt = ws => `A ${N}x${N} grid of ${N * N} equal square cells on a pure white background, with wide white gaps between the cells. ` +
  'Each cell contains exactly one picture, centred, filling most of its cell: a clear, realistic, friendly photo-style illustration that an adult recognises at a glance. ' +
  'No text, no letters, no numbers, no labels, no borders and no frames anywhere. The cells in reading order (left to right, top to bottom):\n' +
  Array.from({length: N * N}, (_, i) => `${i + 1}. ${ws[i] ? ws[i].en : 'empty white cell'}`).join('\n');

// A fájlnévben a szólista lenyomata van: ha a rácsok összetétele megváltozik, a régi nyers kép nem illik semmire, így nem vág rosszul.
const sheets = [];
for (let i = 0; i < todo.length; i += N * N) {
  const ws = todo.slice(i, i + N * N), hash = createHash('sha1').update(ws.map(w => w.t).join('|')).digest('hex').slice(0, 6);
  sheets.push({file: `lap-${slug(ws[0].t)}-${hash}.png`, words: ws.map(w => w.t), prompt: prompt(ws), ws});
}

function cut(sheet, ws) {
  mkdirSync(join(ROOT, 'img'), {recursive: true});
  const side = (1 / N - 2 * MARGIN).toFixed(4);
  ws.forEach((w, i) => {
    const x = (i % N / N + MARGIN).toFixed(4), y = (Math.floor(i / N) / N + MARGIN).toFixed(4);
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', sheet, '-vf', `crop=iw*${side}:ih*${side}:iw*${x}:ih*${y},scale=${SIZE}:${SIZE}`,
      '-frames:v', '1', '-c:v', 'libwebp', '-q:v', '80', file(w)]);
  });
}

console.log(`${words.length} szóból ${todo.length} képe hiányzik: ${sheets.length} rács kell.`);
if (flag('--vag')) {
  const ready = sheets.filter(s => existsSync(join(RAW, s.file)));
  for (const s of ready) { cut(join(RAW, s.file), s.ws); console.log(`szétvágva: ${s.words.join(', ')}`); }
  console.log(`${ready.length} rács szétvágva, ${sheets.length - ready.length} rács még hiányzik a ${RAW} mappából.`);
} else if (sheets.length) {
  mkdirSync(RAW, {recursive: true});
  const list = join(OUT, 'kepek-lapok.json');
  writeFileSync(list, JSON.stringify(sheets.map(({file, words, prompt}) => ({file, words, prompt})), null, 1));
  console.log(`Feladatlista: ${list}\nA kész rácsok helye: ${RAW}`);
}
