// hangkepzes.js — hogyan képezzük a magyar beszédhangokat: oldalról (röntgenszerű metszet) és szemből, lépésenként animálva.
//   Artic.key('Ly') → 'j'   (betű/kétjegyű → hangkulcs, vagy null)
//   const c = Artic.mount(el, 'l', {slow: false});  c.play(true);  c.stop();
// Önálló fájl, nincs külső függőség. A rajz koordinátái egy arcával balra néző fej metszetéhez tartoznak (1 egység ≈ 0,5 mm).
(() => {
'use strict';
const NS = 'http://www.w3.org/2000/svg';
const PX = 215, PY = 72;                      // az állkapocs forgáspontja (állkapocsízület)
const RAD = Math.PI / 180;
const rot = ([x, y], a) => { const c = Math.cos(a * RAD), s = Math.sin(a * RAD), dx = x - PX, dy = y - PY; return [PX + dx * c + dy * s, PY - dx * s + dy * c]; };
const lerp = (a, b, t) => a + (b - a) * t;
const ease = t => t <= 0 ? 0 : t >= 1 ? 1 : t < .5 ? 2 * t * t : 1 - (2 - 2 * t) ** 2 / 2;
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const r1 = n => Math.round(n * 10) / 10;

// Catmull–Rom görbe a pontokon át (zárt vagy nyitott), és ugyanennek mintavételezett pontjai
function crSegs(P, closed) {
  const n = P.length, g = i => closed ? P[(i + n) % n] : P[Math.max(0, Math.min(n - 1, i))], out = [];
  for (let i = 0; i < (closed ? n : n - 1); i++) {
    const p0 = g(i - 1), p1 = g(i), p2 = g(i + 1), p3 = g(i + 2);
    out.push([p1, [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6], [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6], p2]);
  }
  return out;
}
const cr = (P, closed) => crSegs(P, closed).reduce((d, [, a, b, c]) => d + `C${r1(a[0])} ${r1(a[1])} ${r1(b[0])} ${r1(b[1])} ${r1(c[0])} ${r1(c[1])}`, `M${r1(P[0][0])} ${r1(P[0][1])}`) + (closed ? 'Z' : '');
function crPts(P, closed, k = 6) {
  const out = [];
  for (const [p, a, b, c] of crSegs(P, closed)) for (let i = 0; i < k; i++) {
    const t = i / k, u = 1 - t;
    out.push([u * u * u * p[0] + 3 * u * u * t * a[0] + 3 * u * t * t * b[0] + t * t * t * c[0], u * u * u * p[1] + 3 * u * u * t * a[1] + 3 * u * t * t * b[1] + t * t * t * c[1]]);
  }
  return out;
}
// a zárt pontsor legfelső pontja egy függőleges egyenesen (a nyelv felszíne adott x-nél)
function topY(pts, x) {
  let best = null;
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i], b = pts[(i + 1) % pts.length];
    if ((a[0] - x) * (b[0] - x) <= 0 && a[0] !== b[0]) { const y = a[1] + (b[1] - a[1]) * (x - a[0]) / (b[0] - a[0]); if (best === null || y < best) best = y; }
  }
  return best;
}
const poly = P => 'M' + P.map(p => r1(p[0]) + ' ' + r1(p[1])).join('L') + 'Z';

// ---------- Rögzített anatómia ----------
// A szájpadlás alsó (szájüreg felőli) felszíne a felső metszőfog élétől a lágy szájpadig — ehhez méri a légút szűkületét.
const ROOF = [[68.5, 128.3], [71, 124], [73, 119], [76, 114], [78.5, 110], [81, 104.5], [85, 102.5], [89, 99], [96, 93.5], [118, 87.5], [145, 88.5], [161, 93.5], [176, 97], [186, 99]];
const roofY = x => { for (let i = 1; i < ROOF.length; i++) if (x <= ROOF[i][0]) { const a = ROOF[i - 1], b = ROOF[i]; return a[1] + (b[1] - a[1]) * (x - a[0]) / (b[0] - a[0]); } return ROOF[ROOF.length - 1][1]; };
// Arcél, nyak (3. szám: mennyire mozdul az állkapoccsal)
const HEAD = [[86, 20, 0], [74, 30, 0], [66, 42, 0], [60, 55, 0], [50, 67, 0], [41, 76, 0], [37.5, 82, 0], [39, 88, 0], [44, 91.5, 0], [51, 93.5, 0], [57.5, 97, 0],
  [66, 101, 0], [69, 113, 0], [68, 124, 0],
  [70, 135, 1], [69, 145, 1], [63, 147, 1], [58.5, 156, 1], [59, 168, 1], [64, 177, 1], [74, 182, 1], [90, 184.5, .9], [110, 187.5, .65], [124, 193, .4], [131, 206, .2], [135, 226, .05], [138, 252, 0], [139, 296, 0]];
const NASAL = [[45, 93], [62, 91.5], [90, 86], [120, 80], [150, 79.5], [170, 80], [186, 81], [195, 88], [192, 75], [180, 67], [150, 61], [115, 60], [88, 64], [68, 72], [53, 82]];
const PALATE = [[62, 93], [76, 90], [90, 86.5], [120, 80.5], [150, 80], [161, 81.5], [163.5, 87], [161, 93.5], [145, 88.5], [118, 87.5], [96, 93.5], [89, 99], [85, 102.5], [81, 104.5], [75, 103.5], [69, 103], [65.5, 99]];
const WALL = [[191, 79], [196, 92], [198, 125], [198, 165], [196.5, 205], [194.5, 232], [193.5, 296]];
const VEL_UP = [[161, 81.5], [176, 79.5], [189, 83.5], [196.5, 91], [192, 97.5], [186, 99.5], [176, 97], [161, 93.5]];
const VEL_DOWN = [[161, 81.5], [173, 88], [181, 102], [185.5, 117], [182.5, 125.5], [177, 119], [170, 105], [161, 93.5]];
const UP_TOOTH = 'M65.5 128C66 119 67.5 110 69.5 103C70.8 98 72 94 73.5 91C75.5 87.5 77.5 85.5 79.5 85C82 87.5 83.5 90 83 94C82.5 98 81.8 101 81 104.5C80.3 107 79.6 108.5 78.5 110C76.5 113 74.5 116 73 119C71 123 69.6 126 68.5 128.3Z';
const LO_TOOTH = 'M71.5 124L74 123.7C75.5 126 76.5 128.5 77.5 131.5C79 135 80.2 138 81 141C82 143 82.8 145 83.2 147C84.5 154 85 161 83.5 168C82.8 171 81.5 172.5 80.5 172C78 166 76 158 73.6 148.5C72.5 141 71.8 133 71.5 124Z';
const MANDIBLE = [[73.5, 147.5], [76, 157], [74, 166], [68.5, 173], [71, 180.5], [82, 184.5], [95, 183], [94, 172], [89.5, 162], [85.5, 152], [82.5, 146]];
const NAS_FLOW = [[183, 270], [184, 242], [189, 212], [190.5, 176], [191.5, 140], [192.5, 113], [190.5, 93], [184, 80], [165, 73], [135, 69], [105, 70], [80, 77], [60, 86], [47, 92], [33, 99]];
const SKIN = '#f4d9c6', SKIN_LINE = '#bf927c', BONE = '#efe6d5', BONE_LINE = '#c4b08e', MUCOSA = '#e5a39c', TONGUE = '#e0606c', TONGUE_LINE = '#a83745';
const LIP = '#d27571', LIP_LINE = '#a8615a', AIR = '#2f86d6', VOICE = '#6a45d8', HOT = '#ffb627', HOT_LINE = '#e8590c', INK = '#171a2e';

// ---------- Pózok ----------
// tg: a nyelv felső kontúrja hegytől gyökérig (T0–T6), utolsó elem a nyelv alja a hegy mögött.
// J(x, y): az állkapoccsal együtt mozgó pont (pl. nyelvhegy az alsó fogak mögött).
const J = (x, y) => [x, y, 1];
const TG = {
  rest: [J(77, 131), J(86, 124), [102, 114], [127, 107], [151, 111], [169, 127], [176, 157], J(83, 141)],
  i:   [J(77, 130), J(84, 120), [93, 101], [115, 94], [142, 99], [163, 119], [173, 155], J(83, 141)],
  ee:  [J(77, 130), J(84, 121), [95, 104], [118, 98.5], [145, 104], [165, 123], [174, 156], J(83, 141)],
  e:   [J(77, 130), J(85, 123), [98, 111], [121, 107], [147, 112], [166, 127], [175, 158], J(83, 141)],
  aa:  [J(77, 131), J(87, 127), [112, 139], [135, 129], [157, 127], [170, 139], [175, 163], J(84, 142)],
  a:   [J(77, 131), J(87, 127), [110, 134], [133, 124], [155, 117], [173, 128], [179, 152], J(84, 142)],
  o:   [J(77, 131), J(86, 124), [101, 119], [127, 110], [151, 102], [168, 116], [176, 150], J(83, 141)],
  u:   [J(77, 131), J(86, 124), [100, 119], [126, 107], [153, 96.5], [170, 108], [176, 146], J(83, 141)],
  t:   [[73.5, 119], [80.5, 105], [93, 99.5], [120, 102.5], [148, 110], [167, 127], [176, 157], [81, 128]],
  l:   [[80, 107], [89, 104.5], [101, 108], [125, 111], [149, 115], [167, 129], [176, 158], [86, 122]],
  r:   [[84, 105], [93, 107], [104, 109], [127, 109], [150, 113], [168, 128], [176, 158], [89, 121]],
  sz:  [J(77, 129.5), [80, 114.5], [88, 104], [112, 97.5], [143, 104], [166, 124], [175, 157], J(83, 140)],
  c:   [J(77, 129.5), [77.5, 110], [87, 100.5], [110, 97.5], [143, 104], [166, 124], [175, 157], J(83, 140)],
  s:   [[86, 106.5], [97, 98], [110, 96.5], [130, 100.5], [151, 108], [168, 126], [176, 157], [88, 124]],
  cs:  [[84, 104], [95.5, 95], [110, 95.5], [130, 100.5], [151, 108], [168, 126], [176, 157], [87, 122]],
  j:   [J(77, 130), J(84, 119), [92, 99.5], [114, 92], [140, 97], [162, 118], [173, 155], J(83, 141)],
  ty:  [J(77, 130), J(84, 118), [93, 96], [115, 88.5], [140, 94], [162, 117], [173, 155], J(83, 141)],
  k:   [J(77, 131), J(86, 124), [101, 114], [130, 104], [155, 93.5], [170, 97], [176, 140], J(83, 141)],
  h:   [J(77, 130), J(85, 123), [99, 112], [123, 108], [148, 113], [167, 128], [175, 158], J(83, 141)],
};
// p: ajak előrecsücsörítése, s: széthúzása (mosoly), g: ajaknyílás (ha nincs megadva: amennyit az állkapocs nyit), ld: alsó ajak a felső fog alatt
const P = (jaw, lips, tg, vel = 0) => ({jaw, g: lips.g, p: lips.p || 0, s: lips.s || 0, ld: lips.ld || 0, vel, tg: TG[tg]});
const REST = P(1.5, {g: 0}, 'rest', 1);

// m: v magánhangzó, stop zárhang, fric réshang, aff zár-rés hang, nas orrhang, lat oldalsó (l), tril pergetett (r), h
// v: zöngés; hi/lab: a kiemelt hely és a mutató felirata; front: a szemből nézet kiigazítása
const SOUNDS = {};
const def = (keys, o) => { for (const k of keys.split(' ')) SOUNDS[k] = o; };
const vowel = (pose, steps) => ({m: 'v', v: 1, pose, steps});
const LONG = {í: 'i', ó: 'o', ő: 'ö', ú: 'u', ű: 'ü', á: null};
def('a', vowel(P(8, {p: 2.5}, 'a'), ['Nyisd ki a szád, ajkad kicsit kerek.', 'A nyelved lent, kicsit hátrahúzva.', 'Hangot adsz: aaa.']));
def('á', vowel(P(10, {s: .25}, 'aa'), ['Nyisd nagyra a szád.', 'A nyelved laposan, lent fekszik.', 'Hosszan: ááá.']));
def('e', vowel(P(7, {s: .6}, 'e'), ['Nyisd ki a szád, húzd szélesre.', 'A nyelved elöl, lent.', 'Hangot adsz: eee.']));
def('é', vowel(P(4.5, {s: .9, g: 7}, 'ee'), ['Félig nyitott száj, mosolyogj.', 'A nyelved elöl, kicsit feljebb.', 'Hosszan: ééé.']));
def('i', vowel(P(3, {s: 1, g: 7}, 'i'), ['Mosolyogj, csak kis rés maradjon.', 'A nyelved elöl, magasan.', 'Hangot adsz: iii.']));
def('o', vowel(P(5, {p: 5.5, g: 9}, 'o'), ['Kerekítsd az ajkad, mint egy karika.', 'A nyelved hátul, középen.', 'Hangot adsz: ooo.']));
def('ö', vowel(P(4.5, {p: 5.5, g: 7}, 'ee'), ['Kerek ajkak, mint az o-nál.', 'A nyelved elöl, mint az é-nél.', 'Mondj é-t kerek szájjal: ööö.']));
def('u', vowel(P(3, {p: 7.5, g: 4.5}, 'u'), ['Csücsöríts, kicsi kerek nyílás.', 'A nyelved hátul, magasan.', 'Hangot adsz: uuu.']));
def('ü', vowel(P(3, {p: 7.5, g: 4.5}, 'i'), ['Csücsöríts, mint az u-nál.', 'A nyelved elöl, mint az i-nél.', 'Mondj i-t csücsörítve: üüü.']));
for (const [l, s] of Object.entries(LONG)) if (s) SOUNDS[l] = {...SOUNDS[s], steps: [...SOUNDS[s].steps.slice(0, 2), `Hosszan: ${l}${l}${l}.`]};

const LIPS = {hi: [52, 124.5], hr: [7, 5], lab: 'az ajkak összezárva', place: 'lips'};
def('p', {m: 'stop', v: 0, pose: P(1.5, {g: 0, p: .5}, 'rest'), ...LIPS, steps: ['Zárd össze az ajkad.', 'Gyűjts levegőt az ajkad mögé.', 'Pattintsd szét: p!']});
def('b', {m: 'stop', v: 1, pose: P(1.5, {g: 0, p: .5}, 'rest'), ...LIPS, steps: ['Zárd össze az ajkad.', 'A torkod rezeg: tedd rá a kezed.', 'Nyisd szét hanggal: b.']});
def('m', {m: 'nas', v: 1, pose: P(1.5, {g: 0}, 'rest', 1), ...LIPS, steps: ['Zárd össze az ajkad.', 'A hang az orrodon jön ki.', 'Zümmögj: mmm.']});
const LD = {hi: [64.5, 127], hr: [6, 5], lab: 'felső fog az alsó ajkon', place: 'lips'};
def('f', {m: 'fric', v: 0, pose: P(1.5, {ld: 1}, 'rest'), ...LD, steps: ['Felső fogad az alsó ajkadra.', 'A nyelved lent pihen.', 'Fújj: fff.']});
def('v w', {m: 'fric', v: 1, pose: P(1.5, {ld: 1}, 'rest'), ...LD, steps: ['Felső fogad az alsó ajkadra.', 'A torkod rezeg: tedd rá a kezed.', 'Zümmögj: vvv.']});
const TT = {pose: P(2.5, {g: 8, s: .2}, 't'), hi: [77, 113], hr: [5, 8], lab: 'ide ér a nyelved hegye'};
const T2 = ['Kicsit nyisd ki a szád.', 'Nyelved hegye a felső fogak mögé.'];
def('t', {m: 'stop', v: 0, ...TT, steps: [...T2, 'Pattintsd le: t!']});
def('d', {m: 'stop', v: 1, ...TT, steps: [...T2, 'Engedd le hanggal: d.']});
def('n', {m: 'nas', v: 1, ...TT, pose: P(2.5, {g: 8, s: .2}, 't', 1), steps: [...T2, 'A hang az orrodon jön: nnn.']});
def('l', {m: 'lat', v: 1, pose: P(5.5, {g: 16}, 'l'), hi: [80.5, 106], hr: [6, 5], lab: 'ide ér a nyelved hegye', front: {tg: 'up'},
  steps: ['Kicsit nyisd ki a szád.', 'Nyelved hegye fent, a fogak mögött.', 'A hang kétoldalt jön ki: lll.']});
def('r', {m: 'tril', v: 1, pose: P(5.5, {g: 16}, 'r'), hi: [85, 103.5], hr: [6, 5], lab: 'itt pereg a nyelved hegye', front: {tg: 'up'},
  steps: ['Kicsit nyisd ki a szád.', 'Nyelved hegye fent, a fogak mögött.', 'Pergesd a nyelved: rrr.']});
const SZ = {pose: P(1.2, {g: 9, s: 1}, 'sz'), hi: [85, 104], hr: [6, 5], lab: 'itt szűk a rés', front: {ut: 1, lt: 1, tg: 'none'}};
const SZ2 = ['Fogaid majdnem összeérnek, mosolyogj.', 'Nyelved hegye az alsó fogak mögött.'];
def('sz', {m: 'fric', v: 0, ...SZ, steps: [...SZ2, 'Sziszegj, mint a kígyó: sz-sz.']});
def('z', {m: 'fric', v: 1, ...SZ, steps: [...SZ2, 'Zümmögj: zzz. A torkod rezeg.']});
const C = {m: 'aff', pose: P(1.2, {g: 9, s: 1}, 'c'), pose2: SZ.pose, hi: [82, 106], hr: [6, 6], lab: 'ide ér a nyelved', hi2: SZ.hi, lab2: SZ.lab, front: SZ.front};
def('c', {...C, v: 0, steps: ['Fogaid majdnem összeérnek, mosolyogj.', 'Nyelved a felső fogak mögé tapad.', 'Sziszegve engedd el: c.']});
def('dz', {...C, v: 1, steps: ['Fogaid majdnem összeérnek, mosolyogj.', 'Nyelved a felső fogak mögé tapad.', 'Zümmögve engedd el: dz.']});
const S = {pose: P(2, {g: 9, p: 6}, 's'), hi: [94, 96], hr: [6, 5], lab: 'itt szűk a rés', front: {ut: 1, lt: 1, tg: 'none'}};
const S2 = ['Csücsöríts előre, fogaid közel.', 'Nyelved hegye fel, kicsit hátra.'];
def('s', {m: 'fric', v: 0, ...S, steps: [...S2, 'Csitíts: sss.']});
def('zs', {m: 'fric', v: 1, ...S, steps: [...S2, 'Zümmögj: zzs. A torkod rezeg.']});
const CS = {m: 'aff', pose: P(2, {g: 9, p: 6}, 'cs'), pose2: S.pose, hi: [90, 97.5], hr: [7, 5], lab: 'ide ér a nyelved', hi2: S.hi, lab2: S.lab, front: S.front};
def('cs', {...CS, v: 0, steps: ['Csücsöríts előre, fogaid közel.', 'Nyelved fent a szájpadlásra tapad.', 'Sistergve engedd el: cs.']});
def('dzs', {...CS, v: 1, steps: ['Csücsöríts előre, fogaid közel.', 'Nyelved fent a szájpadlásra tapad.', 'Zümmögve engedd el: dzs.']});
def('j', {m: 'fric', v: 1, pose: P(2.5, {g: 4.5, s: .8}, 'j'), hi: [114, 90.5], hr: [9, 4], lab: 'itt szűk a rés',
  steps: ['Mosolyogj, kis rés maradjon.', 'Nyelved közepe fel, a szájpadlás felé.', 'Zümmögj: jjj.']});
const TY = {pose: P(2.5, {g: 8}, 'ty'), hi: [104, 91.5], hr: [13, 5], lab: 'ide ér a nyelved közepe'};
const TY2 = ['Kicsit nyisd ki a szád.', 'Nyelved közepe a szájpadlásra tapad.'];
def('ty', {m: 'stop', v: 0, ...TY, steps: [...TY2, 'Pattintsd le: ty!']});
def('gy', {m: 'stop', v: 1, ...TY, steps: [...TY2, 'Engedd le hanggal: gy.']});
def('ny', {m: 'nas', v: 1, ...TY, pose: P(2.5, {g: 8}, 'ty', 1), steps: [...TY2, 'A hang az orrodon jön: nny.']});
const K = {pose: P(2.5, {g: 8}, 'k'), hi: [163, 94.5], hr: [9, 5], lab: 'ide ér a nyelved hátulja'};
const K2 = ['Kicsit nyisd ki a szád.', 'Nyelved hegye lent, hátulja fent.'];
def('k q', {m: 'stop', v: 0, ...K, steps: [...K2, 'Pattintsd le, mint egy köhintés: k!']});
def('g', {m: 'stop', v: 1, ...K, steps: [...K2, 'Engedd le hanggal: g.']});
def('x', {m: 'aff', v: 0, ...K, pose2: SZ.pose, hi2: SZ.hi, lab2: SZ.lab, front: SZ.front, steps: ['Kicsit nyisd ki a szád.', 'Előbb k: nyelved hátulja fent.', 'Aztán sziszegj, együtt: ksz.']});
def('h', {m: 'h', v: 0, pose: P(5, {g: 9}, 'h'), hi: [182, 243], hr: [9, 5], lab: 'innen jön a levegő', lp: [222, 290, 'end'], place: 'throat',
  steps: ['Nyisd ki a szád.', 'A nyelved lazán, lent.', 'Lehelj, mint a tükörre: hhh.']});

const ALIAS = {ly: 'j', y: 'i', w: 'v', q: 'k'};
const key = u => { const k = String(u || '').toLowerCase().trim(); const s = ALIAS[k] || k; return SOUNDS[s] ? s : null; };

// ---------- Pózok kiszámítása ----------
const ur = jaw => jaw * .3;                                           // nyitáskor a felső ajak is kicsit emelkedik
const natGap = (jaw, p) => rot([58 - p * .6, 124], jaw)[1] - (124 - ur(jaw));
function norm(o) { return {...o, g: o.g ?? natGap(o.jaw, o.p)}; }
for (const s of Object.values(SOUNDS)) { s.pose = norm(s.pose); if (s.pose2) s.pose2 = norm(s.pose2); }
const REST_N = norm(REST);

// felpattanás: a zár kinyílik (ajkaknál vagy a nyelvnél)
function released(s) {
  const p = s.pose;
  if (s.place === 'lips') return {...p, g: p.g + 6};
  const [hx, hy] = s.hi;
  return {...p, g: p.g + 2, tg: p.tg.map(q => { if (q[2]) return q; const d = Math.hypot(q[0] - hx, q[1] - hy); return d < 34 ? [q[0], q[1] + 8 * (1 - d / 40)] : q; })};
}
for (const s of Object.values(SOUNDS)) if (s.m === 'stop') s.rel = released(s);

function mixMouth(a, b, t) { return {jaw: lerp(a.jaw, b.jaw, t), g: lerp(a.g, b.g, t), p: lerp(a.p, b.p, t), s: lerp(a.s, b.s, t), ld: lerp(a.ld, b.ld, t)}; }
function mixTongue(a, b, t) {
  return {vel: lerp(a.vel, b.vel, t), tg: a.tg.map((pa, i) => {
    const pb = b.tg[i];
    if (pa[2] && pb[2]) return [lerp(pa[0], pb[0], t), lerp(pa[1], pb[1], t), 1];
    const A = pa[2] ? rot(pa, a.jaw) : pa, B = pb[2] ? rot(pb, b.jaw) : pb;
    return [lerp(A[0], B[0], t), lerp(A[1], B[1], t)];
  })};
}

// Idővonal (mp): 0–.35 nyugalom · A: ajak/állkapocs · B: nyelv/lágy szájpad · C: tartás hanggal/levegővel (zárhangnál felpattanás)
const TL = {a0: .35, a1: .95, b1: 1.55, end: 3.35, rel: 2.45, aff: 2.15};
function frame(s, t) {
  const st = {phase: t < TL.a1 ? 0 : t < TL.b1 ? 1 : t < TL.end ? 2 : 3, hold: t >= TL.b1};
  let mouth, tongue;
  if (t < TL.a1) { const u = ease((t - TL.a0) / (TL.a1 - TL.a0)); mouth = mixMouth(REST_N, s.pose, u); tongue = mixTongue(REST_N, REST_N, 0); }
  else if (t < TL.b1) { const u = ease((t - TL.a1) / (TL.b1 - TL.a1)); mouth = s.pose; tongue = mixTongue(REST_N, s.pose, u); }
  else if (s.m === 'stop') {
    let u = 0;
    if (t >= TL.rel && t < TL.end) u = t < TL.rel + .25 ? ease((t - TL.rel) / .25) : t < 2.95 ? 1 : 1 - ease((t - 2.95) / .4);
    mouth = mixMouth(s.pose, s.rel, u); tongue = mixTongue(s.pose, s.rel, u);
    st.burst = t >= TL.rel && t < TL.rel + .55 ? 1 - (t - TL.rel) / .55 : 0;
    st.closed = u < .3;
  } else if (s.m === 'aff') {
    const u = t < TL.aff ? 0 : ease((t - TL.aff) / .3);
    mouth = mixMouth(s.pose, s.pose2, u); tongue = mixTongue(s.pose, s.pose2, u);
    st.second = u > .5; st.closed = u < .5;
  } else { mouth = s.pose; tongue = mixTongue(s.pose, s.pose, 0); }
  st.mouth = mouth; st.tongue = tongue;
  return st;
}

// ---------- Rajz ----------
const STYLE = `
.artic{display:flex;flex-direction:column;gap:10px;width:100%}
.artic svg.artic-fig{display:block;width:100%;height:auto;max-height:var(--artic-h,42dvh);margin:0 auto;fill:none;flex:none}
.artic-steps{list-style:none;padding:0;margin:0;display:grid;gap:6px;text-align:left}
.artic-steps li{display:flex;gap:10px;align-items:center;padding:7px 10px;border-radius:14px;font-size:1.02rem;font-weight:600;line-height:1.25;color:${INK};background:#f2f3f7;transition:background .25s}
.artic-steps li b{flex:none;width:30px;height:30px;border-radius:50%;display:grid;place-content:center;background:${INK};color:#fff;font-size:.95rem}
.artic-steps li.on{background:#ffe5a3}
.artic-steps li.on b{background:${HOT_LINE}}
@media (prefers-reduced-motion:reduce){.artic-steps li{transition:none}}`;
let uid = 0;
const el = (tag, attrs = {}, parent) => { const e = document.createElementNS(NS, tag); for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v); parent?.append(e); return e; };

function build(host) {
  const id = 'ar' + (++uid);
  const svg = el('svg', {class: 'artic-fig', viewBox: '2 26 226 268', role: 'img'});
  svg.innerHTML = `
<defs>
  <clipPath id="${id}c"><rect x="2" y="26" width="226" height="268" rx="16"/></clipPath>
  <clipPath id="${id}fc"><rect x="0" y="0" width="100" height="74" rx="9"/></clipPath>
  <clipPath id="${id}mo"><path class="mo-clip"/></clipPath>
  <clipPath id="${id}ldc"><rect class="ld-clip" x="0" y="0" width="100" height="0"/></clipPath>
  <radialGradient id="${id}glow"><stop offset="0" stop-color="${HOT}" stop-opacity=".95"/><stop offset=".55" stop-color="${HOT}" stop-opacity=".55"/><stop offset="1" stop-color="${HOT}" stop-opacity="0"/></radialGradient>
  <linearGradient id="${id}tg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ee8088"/><stop offset=".5" stop-color="#da5a67"/><stop offset=".8" stop-color="#e3998f"/><stop offset="1" stop-color="${SKIN}"/></linearGradient>
  <linearGradient id="${id}lu" x1="0" y1="0" x2="0" y2="1"><stop offset=".45" stop-color="#efc6b0"/><stop offset=".62" stop-color="${LIP}"/></linearGradient>
  <linearGradient id="${id}ll" x1="0" y1="0" x2="0" y2="1"><stop offset=".5" stop-color="${LIP}"/><stop offset=".68" stop-color="#efc6b0"/></linearGradient>
  <marker id="${id}ar" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4.2" markerHeight="4.2" orient="auto-start-reverse"><path d="M0 0L10 5L0 10Z" fill="${AIR}"/></marker>
</defs>
<g clip-path="url(#${id}c)">
  <rect x="2" y="26" width="226" height="268" fill="#eef2f7"/>
  <path class="head" fill="${SKIN}" stroke="${SKIN_LINE}" stroke-width="1.3" stroke-linejoin="round"/>
  <g fill="${BONE}" stroke="${BONE_LINE}" stroke-width=".9">${[100, 128, 156, 184, 212, 240, 268].map(y => `<rect x="204" y="${y}" width="30" height="24" rx="5"/>`).join('')}</g>
  <path d="${cr(NASAL, true)}" fill="#fff" stroke="#d9aea4" stroke-width=".9"/>
  <path class="airway" fill="#fff"/>
  <path d="${cr(WALL, false)}" stroke="#d29c92" stroke-width="1.1"/>
  <path d="M158 222L167.5 220L170.5 236L169.5 256L160 258.5L155.5 240Z" fill="#e4e8ee" stroke="#a9b2bd" stroke-width=".9"/>
  <g stroke="#b9c1cb" stroke-width="1.6" stroke-linecap="round">${[266, 274, 282, 290].map(y => `<path d="M170.5 ${y}h3M190 ${y}h3"/>`).join('')}</g>
  <path d="M175 210C176 200 180 191 186 184C186.5 190 183 200 180 211Z" fill="#eaaea5" stroke="#b9776f" stroke-width=".8"/>
  <path class="tongue" fill="url(#${id}tg)"/>
  <path class="tongue-top" stroke="${TONGUE_LINE}" stroke-width="1.3" stroke-linejoin="round" stroke-linecap="round"/>
  <path d="${cr(PALATE, true)}" fill="${BONE}" stroke="${BONE_LINE}" stroke-width=".9"/>
  <path d="${cr(ROOF.slice(5, 12), false)}" stroke="${MUCOSA}" stroke-width="2.4" stroke-linecap="round"/>
  <path class="velum" fill="#e39b98" stroke="#b46f6d" stroke-width="1"/>
  <path d="${UP_TOOTH}" fill="#fff" stroke="#8e98a3" stroke-width=".9"/>
  <g class="jaw">
    <path d="${cr(MANDIBLE, true)}" fill="${BONE}" stroke="${BONE_LINE}" stroke-width=".9"/>
    <path d="${LO_TOOTH}" fill="#fff" stroke="#8e98a3" stroke-width=".9"/>
  </g>
  <path class="ulip" fill="url(#${id}lu)"/>
  <path class="llip" fill="url(#${id}ll)"/>
  <path class="lipline" stroke="${SKIN_LINE}" stroke-width="1.2" stroke-linejoin="round" stroke-linecap="round"/>
  <g class="glottis" fill="#c9b2f3" stroke="${VOICE}" stroke-width=".8"><path class="vf1"/><path class="vf2"/></g>
  <g class="varc" stroke="${VOICE}" stroke-width="1.6" stroke-linecap="round" opacity="0">
    <path d="M147 233q4 7 0 14"/><path d="M152.5 229q6.5 11 0 22"/><path d="M158 225q9 15 0 30"/>
  </g>
  <path class="flow" stroke="${AIR}" stroke-width="2.3" stroke-linecap="round" stroke-dasharray="5 6" marker-end="url(#${id}ar)" opacity="0"/>
  <path class="nflow" d="${cr(NAS_FLOW, false)}" stroke="${AIR}" stroke-width="2.3" stroke-linecap="round" stroke-dasharray="5 6" marker-end="url(#${id}ar)" opacity="0"/>
  <g class="burst" stroke="${HOT_LINE}" stroke-width="1.8" stroke-linecap="round" opacity="0"><path d="M44 0l-9 -6M43 0h-11M44 0l-9 6"/><text x="13" y="-9" fill="${HOT_LINE}" stroke="none" font-size="10" font-weight="800">pukk!</text></g>
  <ellipse class="hot" fill="url(#${id}glow)" opacity="0"/>
  <ellipse class="hotring" stroke="${HOT_LINE}" stroke-width="1.4" opacity="0"/>
  <line class="lead" stroke="${INK}" stroke-width=".8" stroke-dasharray="2 1.6" opacity="0"/>
  <text class="lab" font-size="9.5" font-weight="700" fill="${INK}" stroke="#fff" stroke-width="3" paint-order="stroke" stroke-linejoin="round" opacity="0"></text>
  <text x="222" y="37" text-anchor="end" font-size="8.5" font-weight="700" fill="#5b6070" stroke="#eef2f7" stroke-width="2.5" paint-order="stroke">Oldalról</text>
  <g class="front" transform="translate(3 193.4) scale(1.36)">
    <rect width="100" height="74" rx="9" fill="${SKIN}" stroke="${SKIN_LINE}" stroke-width="1"/>
    <g clip-path="url(#${id}fc)"><g transform="translate(50 2) scale(1.25) translate(-50 -2)">   <!-- a szájra nagyítva -->
      <path d="M36 3.5q6 4.5 14 2q8 2.5 14 -2" stroke="#c49580" stroke-width="1"/>
      <ellipse cx="44" cy="3" rx="3.4" ry="1.8" fill="#9a6656"/><ellipse cx="56" cy="3" rx="3.4" ry="1.8" fill="#9a6656"/>
      <path class="philtrum" stroke="#e2bca9" stroke-width=".7"/>
      <path d="M33 63q17 9 34 0" stroke="#d2a891" stroke-width="1"/>
      <path class="fmouth" fill="#4b1d24"/>
      <g clip-path="url(#${id}mo)">
        <path class="ftongue" fill="${TONGUE}" stroke="${TONGUE_LINE}" stroke-width=".6"/>
        <path class="fltooth" fill="#fbfbf7" stroke="#b9b9b0" stroke-width=".5"/>
        <path class="futooth" fill="#fbfbf7" stroke="#b9b9b0" stroke-width=".5"/>
      </g>
      <path class="fllip" fill="${LIP}" stroke="${LIP_LINE}" stroke-width=".8"/>
      <path class="futooth2" fill="#fbfbf7" stroke="#b9b9b0" stroke-width=".5" clip-path="url(#${id}ldc)"/>
      <path class="fulip" fill="${LIP}" stroke="${LIP_LINE}" stroke-width=".8"/>
      <path class="fpucker" stroke="${LIP_LINE}" stroke-width=".6" stroke-linecap="round"/>
      <g class="fair" stroke="${AIR}" stroke-width="1.6" stroke-linecap="round" marker-end="url(#${id}ar)" opacity="0"><path class="fa1"/><path class="fa2"/></g>
      <g class="fburst" stroke="${HOT_LINE}" stroke-width="1.3" stroke-linecap="round" opacity="0"></g>
    </g></g>
    <text x="5" y="70" font-size="6.6" font-weight="700" fill="#5b6070" stroke="${SKIN}" stroke-width="2" paint-order="stroke">Szemből</text>
  </g>
</g>`;
  const steps = document.createElement('ol'); steps.className = 'artic-steps';
  const wrap = document.createElement('div'); wrap.className = 'artic'; wrap.append(svg, steps);
  host.replaceChildren(wrap);
  const q = c => svg.querySelector('.' + c);
  return {svg, steps, wrap, q, id};
}

// ---------- Egy képkocka kirajzolása ----------
function draw(R, s, st, time, live) {
  const {jaw, g, p, s: spread, ld} = st.mouth, {tg, vel} = st.tongue, q = R.q;
  const round = clamp(p / 7.5);
  const lift = ur(jaw);
  // felső ajak (oldalról)
  const U = [[57.5, 97], [55, 104], [51 - p * .7 + spread, 111 - lift * .5], [49 - p + spread * 1.2, 116 - lift], [52 - p * .9 + spread * 1.5, 121.5 - lift],
    [58 - p * .6 + spread * 1.6, 124 - lift], [66.5 - p * .5, 121.5 - lift * .5], [69.6, 109], [67.6, 100]];
  const U6 = U[5];
  // alsó ajak (oldalról): az állkapoccsal forog, a felső élét a kívánt nyílásra igazítjuk
  let L = [[58 - p * .6 + spread * 1.6, 124], [52 - p * .9 + spread * 1.5, 126.5], [50 - p + spread * 1.2, 132], [53 - p * .6, 139.5], [63, 145.5], [72.5, 146.5], [71.5 - p * .4, 135], [68.5 - p * .5, 126.5]].map(x => rot(x, jaw));
  const W = [1, 1, .6, .3, 0, 0, .5, 1], dy = U6[1] + g - L[0][1];
  L = L.map((x, i) => [x[0], x[1] + dy * W[i]]);
  if (ld > 0) {   // f, v: az alsó ajak a felső fog éle alá kerül
    const TGT = {0: [61.5, 125.8], 1: [55, 127.2], 2: [51, 132.5], 7: [67.5, 128.6], 6: [71, 136]};
    L = L.map((x, i) => TGT[i] ? [lerp(x[0], TGT[i][0], ld), lerp(x[1], TGT[i][1], ld)] : x);
  }
  q('ulip').setAttribute('d', cr(U, true));
  q('llip').setAttribute('d', cr(L, true));
  q('lipline').setAttribute('d', cr(U.slice(0, 6), false) + cr(L.slice(0, 5), false).replace('M', 'M'));
  q('jaw').setAttribute('transform', `rotate(${r1(-jaw * 10) / 10} ${PX} ${PY})`);
  const jw = ([x, y, w]) => w ? rot([x, y], jaw * w) : [x, y];
  q('head').setAttribute('d', cr(HEAD.map(jw), false) + 'L266 296L266 18L86 18Z');
  // nyelv
  const res = x => x[2] ? rot(x, jaw) : x;
  const T = tg.map(res);
  if (s.m === 'tril' && st.hold && live) { const w = Math.sin(time * 2 * Math.PI * 7); T[0] = [T[0][0] + 1.5 * w, T[0][1] + 3.6 * (w + 1)]; T[1] = [T[1][0], T[1][1] + 1.2 * (w + 1)]; }
  const F = [[176, 198, 0], [162, 200, .4], [135, 190, .7], [106, 180, .9], [90, 165, 1]].map(jw);   // nyelvgyök és szájfenék
  const loop = [...T.slice(0, 7), ...F, T[7]];
  q('tongue').setAttribute('d', cr(loop, true));
  q('tongue-top').setAttribute('d', cr([T[7], ...T.slice(0, 7), F[0]], false));   // csak a felszín körvonala: alul a nyelv a szájfenékbe olvad
  const tPts = crPts(loop, true, 7);
  // légút (szájüreg, garat, gége)
  const loTip = rot([71.5, 124], jaw), loIn = rot([74, 123.7], jaw), loFloor = rot([83, 147], jaw);
  q('airway').setAttribute('d', poly([U[4], U6, [65.5, 128], [68.5, 128.3], [73, 119], [78.5, 110], [81, 104.5], [85, 102.5], [89, 99], [96, 93.5], [118, 87.5], [145, 88.5], [161, 93.5], [161, 83], [186, 81], [191, 79], [196, 92], [198, 125], [198, 165], [196.5, 205], [194.5, 232], [193.5, 296], [171, 296], [170, 250], [169, 236], [171, 220], [175, 205], F[1], F[2], F[3], F[4], T[7], loIn, loTip, L[7], L[0], L[1]]));
  // lágy szájpad
  q('velum').setAttribute('d', cr(VEL_UP.map((a, i) => [lerp(a[0], VEL_DOWN[i][0], vel), lerp(a[1], VEL_DOWN[i][1], vel)]), true));

  // ---- jelzések ----
  const hold = st.hold, done = st.phase === 3;
  const voiced = s.v && hold;
  const wob = voiced && live ? Math.sin(time * 2 * Math.PI * 9) : 0;
  const open = !voiced ? 3.2 : 1 + .8 * wob;
  q('vf1').setAttribute('d', `M169.5 240.5L${r1(181.5 - open)} 243L169.5 245.5Z`);
  q('vf2').setAttribute('d', `M194 240.5L${r1(182.5 + open)} 243L194 245.5Z`);
  q('varc').setAttribute('opacity', voiced ? (live ? .55 + .45 * Math.abs(wob) : .9) : 0);
  q('glottis').setAttribute('fill', voiced ? '#b39af0' : '#ddd3f7');

  // levegő
  let showOral = false, showNasal = false;
  if (hold) {
    if (s.m === 'nas') showNasal = true;
    else if (s.m === 'aff') showOral = !st.closed;
    else if (s.m === 'stop') showOral = false;
    else if (s.m !== 'lat') showOral = true;
  }
  const flow = q('flow'), nflow = q('nflow'), dash = live ? r1(-(time * 26) % 11) : 0;
  if (showOral) {
    const path = [[183, 270], [184, 242], [188.5, 214], [190, 178], [189, 146]];
    let blocked = false;
    for (const x of [178, 170, 160, 148, 136, 124, 112, 101, 92, 85, 79]) {
      const ry = roofY(x), ty = topY(tPts, x);
      if (ty === null) continue;
      if (ty - ry < 1.2 && !(s.m === 'tril' && x < 95)) { blocked = true; break; }
      path.push([x, ry + (ty - ry) * (x < 100 ? .5 : .45)]);
    }
    if (!blocked) {
      const ty = (128.3 + loTip[1]) / 2, gap = L[0][1] - U6[1];
      path.push([71, Math.max(ty, roofY(72) + 2)]);
      if (ld > .5) path.push([63, 126.6], [38, 127]);
      else if (gap > .8) { const y = (U6[1] + L[0][1]) / 2; path.push([57, y], [34, y]); }
    }
    flow.setAttribute('d', cr(path, false)); flow.setAttribute('opacity', s.m === 'v' ? .7 : 1); flow.setAttribute('stroke-dashoffset', dash);
  } else flow.setAttribute('opacity', 0);
  nflow.setAttribute('opacity', showNasal ? 1 : 0); nflow.setAttribute('stroke-dashoffset', dash);

  // pukk
  const lipY = s.place === 'lips' ? U6[1] + 2 : (U6[1] + L[0][1]) / 2;
  q('burst').setAttribute('transform', `translate(${r1(Math.min(U[3][0], L[2][0]) - 2)} ${r1(lipY)})`);
  q('burst').setAttribute('opacity', st.burst ? r1(st.burst * 10) / 10 : 0);

  // kiemelt hely + mutató
  const hiOn = s.place === 'lips' ? st.phase >= 1 : hold;
  const [hx, hy] = st.second && s.hi2 ? s.hi2 : s.hi || [0, 0], [rx, ry] = s.hr || [6, 5];
  const pulse = hold && !done && live ? 1 + .18 * Math.sin(time * 2 * Math.PI * 1.6) : 1;
  const hot = q('hot'), ring = q('hotring');
  for (const e of [hot, ring]) { e.setAttribute('cx', hx); e.setAttribute('cy', hy); }
  hot.setAttribute('rx', r1(rx * 1.9 * pulse)); hot.setAttribute('ry', r1(ry * 1.9 * pulse)); ring.setAttribute('rx', rx); ring.setAttribute('ry', ry);
  const on = s.hi && hiOn ? 1 : 0;
  hot.setAttribute('opacity', on * .95); ring.setAttribute('opacity', on);
  const lab = q('lab'), lead = q('lead');
  if (on) {
    const text = st.second && s.lab2 ? s.lab2 : s.lab, half = text.length * 2.25, [lx, ly, anchor] = s.lp || [r1(clamp(hx + 18, 8 + half, 180 - half)), 38, 'middle'];  // ne érjen bele az „Oldalról” feliratba
    if (lab.textContent !== text) lab.textContent = text;
    lab.setAttribute('x', lx); lab.setAttribute('y', ly); lab.setAttribute('text-anchor', anchor);
    const ty = ly > 200 ? ly - 9 : ly + 3, ang = Math.atan2(hy - ty, hx - lx), endX = hx - Math.cos(ang) * (rx + 2), endY = hy - Math.sin(ang) * (ry + 2);
    lead.setAttribute('x1', ly > 200 ? hx : lx); lead.setAttribute('y1', ty); lead.setAttribute('x2', r1(endX)); lead.setAttribute('y2', r1(endY));
  }
  lab.setAttribute('opacity', on); lead.setAttribute('opacity', on * .8);

  drawFront(R, s, st, {round, spread, ld, g, jaw, T, U6, L0: L[0], time, live, showOral, showNasal});

  // lépések
  const act = st.phase === 3 ? -1 : st.phase;
  R.steps.querySelectorAll('li').forEach((li, i) => li.classList.toggle('on', i === act));
}

// ---------- Szemből ----------
function drawFront(R, s, st, o) {
  const q = R.q, cx = 50, cy = 33.5, {round, spread, ld, g} = o;
  const op = clamp(g, 0, 40) * .62;                                        // ajaknyílás (szemből)
  const hw = 23 + 5 * spread - 11 * round;                                // a száj félszélessége
  const thU = 6.5 + 2.2 * round - 1.4 * spread, thL = 8.5 + 2.2 * round - 1.6 * spread;
  let yu = cy - op * .4, yl = cy + op * .6;
  yu = lerp(yu, cy - 4, ld); yl = lerp(yl, cy - .5, ld);
  const k1u = round * .55 * (cy - yu), k1l = round * .55 * (yl - cy), k2 = .55 + (1 - round) * .25;
  const Lc = [cx - hw, cy], Rc = [cx + hw, cy];
  const upperIn = `C${r1(cx + hw)} ${r1(cy - k1u)} ${r1(cx + hw * k2)} ${r1(yu)} ${cx} ${r1(yu)}C${r1(cx - hw * k2)} ${r1(yu)} ${r1(cx - hw)} ${r1(cy - k1u)} ${r1(Lc[0])} ${cy}`;
  // a száj nyílása: bal sarok → felső belső él → jobb sarok → alsó belső él vissza
  const mouthD = `M${r1(Lc[0])} ${cy}C${r1(cx - hw)} ${r1(cy - k1u)} ${r1(cx - hw * k2)} ${r1(yu)} ${cx} ${r1(yu)}C${r1(cx + hw * k2)} ${r1(yu)} ${r1(cx + hw)} ${r1(cy - k1u)} ${r1(Rc[0])} ${cy}C${r1(cx + hw)} ${r1(cy + k1l)} ${r1(cx + hw * k2)} ${r1(yl)} ${cx} ${r1(yl)}C${r1(cx - hw * k2)} ${r1(yl)} ${r1(cx - hw)} ${r1(cy + k1l)} ${r1(Lc[0])} ${cy}Z`;
  q('fmouth').setAttribute('d', mouthD); q('mo-clip').setAttribute('d', mouthD);
  const ow = hw + 1.6 + round * 1.2, ut = yu - thU, lb = yl + thL;
  q('fulip').setAttribute('d', `M${r1(cx - ow)} ${cy}C${r1(cx - hw * .9)} ${r1(yu - thU * .55)} ${r1(cx - hw * .55)} ${r1(ut - .4)} ${r1(cx - 5)} ${r1(ut - .8)}Q${cx - 2.2} ${r1(ut - 1.4)} ${cx} ${r1(ut + .7)}Q${cx + 2.2} ${r1(ut - 1.4)} ${cx + 5} ${r1(ut - .8)}C${r1(cx + hw * .55)} ${r1(ut - .4)} ${r1(cx + hw * .9)} ${r1(yu - thU * .55)} ${r1(cx + ow)} ${cy}L${r1(Rc[0])} ${cy}${upperIn}Z`);
  q('fllip').setAttribute('d', `M${r1(cx - ow)} ${cy}C${r1(cx - hw * .85)} ${r1(yl + thL * .95)} ${r1(cx - hw * .4)} ${r1(lb + .6)} ${cx} ${r1(lb + .6)}C${r1(cx + hw * .4)} ${r1(lb + .6)} ${r1(cx + hw * .85)} ${r1(yl + thL * .95)} ${r1(cx + ow)} ${cy}L${r1(Rc[0])} ${cy}C${r1(cx + hw)} ${r1(cy + k1l)} ${r1(cx + hw * k2)} ${r1(yl)} ${cx} ${r1(yl)}C${r1(cx - hw * k2)} ${r1(yl)} ${r1(cx - hw)} ${r1(cy + k1l)} ${r1(Lc[0])} ${cy}Z`);
  q('philtrum').setAttribute('d', `M46.5 5L${r1(cx - 3.2)} ${r1(ut - .8)}M53.5 5L${r1(cx + 3.2)} ${r1(ut - .8)}`);
  // csücsörítés ráncai
  let pk = '';
  if (round > .45) for (const a of [-.62, -.3, 0, .3, .62]) {
    const x = cx + a * hw * 1.25;
    pk += `M${r1(x)} ${r1(ut + 1.6)}l${r1(a * 1.5)} ${r1(thU * .45)}M${r1(x)} ${r1(lb - 1.6)}l${r1(a * 1.5)} ${r1(-thL * .45)}`;
  }
  q('fpucker').setAttribute('d', pk); q('fpucker').setAttribute('opacity', clamp((round - .45) * 2.5));
  // fogak
  const F = s.front || {}, tipUp = o.T[0][1] < 117;
  const teeth = (yEdge, h, up) => {
    const xs = [-21, -15, -8.3, 0, 8.3, 15, 21]; let d = '';
    for (let i = 0; i < 6; i++) {
      const a = cx + xs[i] * (hw / 23) * .95, b = cx + xs[i + 1] * (hw / 23) * .95, e = up ? yEdge + h : yEdge - h, base = up ? yEdge - 8 : yEdge + 8, rr = Math.min(1.6, Math.abs(h) * .5);
      d += up ? `M${r1(a)} ${r1(base)}V${r1(e - rr)}Q${r1(a)} ${r1(e)} ${r1(a + rr)} ${r1(e)}H${r1(b - rr)}Q${r1(b)} ${r1(e)} ${r1(b)} ${r1(e - rr)}V${r1(base)}Z`
              : `M${r1(a)} ${r1(base)}V${r1(e + rr)}Q${r1(a)} ${r1(e)} ${r1(a + rr)} ${r1(e)}H${r1(b - rr)}Q${r1(b)} ${r1(e)} ${r1(b)} ${r1(e + rr)}V${r1(base)}Z`;
    }
    return d;
  };
  // látszó fogmagasság: alapból a felső fog 2–4 mm-e látszik; réshangoknál (sz, s) a két fogsor éle majdnem összeér
  const close = F.ut && F.lt, uth = ld > .5 ? 5.2 : close ? Math.max(0, op / 2 - .5) : clamp(op * .6, 0, 4), lth = close ? Math.max(0, op / 2 - .5) : clamp((op - 5) * .45, 0, 3.5);
  q('futooth').setAttribute('d', uth > .3 ? teeth(yu, uth, true) : '');
  q('fltooth').setAttribute('d', lth > .3 ? teeth(yl, lth, false) : '');
  q('futooth2').setAttribute('d', ld > .05 ? teeth(yu, 5.2, true) : '');
  const ldc = q('ld-clip'); ldc.setAttribute('y', r1(yu - 1)); ldc.setAttribute('height', ld > .05 ? 6.5 : 0);
  // nyelv
  const mode = F.tg || (tipUp ? 'up' : 'low');
  let td = '';
  if (mode === 'low' && op > 2) { const tyy = yl - Math.min(op * .3, 7); td = `M${r1(cx - hw * .7)} ${r1(yl + 2)}Q${r1(cx - hw * .55)} ${r1(tyy)} ${cx} ${r1(tyy)}Q${r1(cx + hw * .55)} ${r1(tyy)} ${r1(cx + hw * .7)} ${r1(yl + 2)}Z`; }
  if (mode === 'up' && op > 1.5) { const top = yu + uth - .5; td = `M${cx - 6.5} ${r1(top + 1.5)}Q${cx} ${r1(top - 2)} ${cx + 6.5} ${r1(top + 1.5)}L${cx + 11} ${r1(yl + 3)}L${cx - 11} ${r1(yl + 3)}Z`; }
  q('ftongue').setAttribute('d', td);
  // levegő szemből: középen ki, l-nél kétoldalt, orrhangnál az orrból
  const fa = q('fair'), live = o.live, ph = live ? (o.time * 1.6) % 1 : .6;
  let a1 = '', a2 = '';
  if (o.showNasal) { a1 = `M44 ${r1(5 + ph * 3)}l-2 6`; a2 = `M56 ${r1(5 + ph * 3)}l2 6`; }
  else if (s.m === 'lat' && st.hold) { a1 = `M${cx - 8} ${r1(yu + 5)}l${r1(-7 - ph * 3)} ${r1(4 + ph * 2)}`; a2 = `M${cx + 8} ${r1(yu + 5)}l${r1(7 + ph * 3)} ${r1(4 + ph * 2)}`; }
  fa.querySelector('.fa1').setAttribute('d', a1); fa.querySelector('.fa2').setAttribute('d', a2);
  fa.setAttribute('opacity', a1 ? 1 : 0);
  const fb = q('fburst');
  if (st.burst) { fb.innerHTML = `<path d="M${cx - hw - 3} ${cy}l-6 0M${cx + hw + 3} ${cy}l6 0M${cx} ${r1(lb + 2)}l0 5M${cx - 14} ${r1(lb + 1)}l-4 4M${cx + 14} ${r1(lb + 1)}l4 4"/>`; fb.setAttribute('opacity', r1(st.burst * 10) / 10); }
  else fb.setAttribute('opacity', 0);
}

// ---------- Beépítés ----------
function mount(host, k, opt = {}) {
  if (!document.getElementById('artic-style')) { const st = document.createElement('style'); st.id = 'artic-style'; st.textContent = STYLE; document.head.append(st); }
  host.__artic?.stop();
  const s = SOUNDS[key(k)];
  if (!s) { host.replaceChildren(); return {play() {}, stop() {}}; }
  const R = build(host);
  R.svg.setAttribute('aria-label', 'Hogyan képezd: ' + s.steps.join(' '));
  R.steps.innerHTML = s.steps.map((t, i) => `<li><b>${i + 1}</b><span>${t}</span></li>`).join('');
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let raf = 0, t0 = 0, slow = 1, timer = 0;
  const finalT = s.m === 'aff' ? TL.aff - .01 : TL.end + .01;   // zár-rés hangnál a zár marad a végén látható (ez különbözteti meg a réshangtól)
  const stop = () => { cancelAnimationFrame(raf); clearInterval(timer); raf = timer = 0; };
  const idle = () => {   // a végén a célhelyzet marad látható; a levegő és a rezgés lassan tovább "él"
    stop(); const st = frame(s, finalT); st.phase = 3; st.hold = true;
    const t1 = performance.now();
    draw(R, s, st, 0, false);
    if (!still) timer = setInterval(() => { if (!host.isConnected) return stop(); draw(R, s, st, (performance.now() - t1) / 1000, true); }, 50);
  };
  const tick = now => {
    if (!host.isConnected) return stop();
    const t = (now - t0) / 1000 / slow;
    if (t >= TL.end) return idle();
    draw(R, s, frame(s, t), t, true);
    raf = requestAnimationFrame(tick);
  };
  const ctl = {
    play(sl = false) { stop(); slow = sl ? 2 : 1; if (still) return idle(); t0 = performance.now(); raf = requestAnimationFrame(tick); },
    stop,
  };
  host.__artic = ctl;
  draw(R, s, frame(s, 0), 0, false);
  ctl.play(!!opt.slow);
  return ctl;
}

window.Artic = {key, mount, sounds: Object.keys(SOUNDS)};
})();
