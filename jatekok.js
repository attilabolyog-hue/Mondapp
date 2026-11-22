// Játékok: gondolkodtató feladatok. A jó választ meg kell találni (koppintással vagy kimondva), aztán ki is kell mondani.
// Sor: kérdés|helyes válasz|rossz1,rossz2[,rossz3]|emoji (nem kötelező)
//   "…" a kérdésben: ide illik a válasz (Fejezd be!).  "_": hiányzó betű — ilyenkor az egész szót kell kimondani, és a szó képe látszik.
//   Üres kérdés: a játék utasítása lesz a kérdés (Kakukktojás).
// A válaszlehetőségeknél a words.js képe/emojija jelenik meg, ezért ott szereplő szavakat érdemes használni.
{
  const EMOJI = new Map(GROUPS.flatMap(g => g.cats).filter(c => c.kind === 'word').flatMap(c => c.items).map(i => [i.t, i.e]));
  const shuffle = a => a.map(x => [Math.random(), x]).sort((p, q) => p[0] - q[0]).map(x => x[1]);
  const game = (name, icon, hue, hint, text) => ({name, icon, hue, hint, kind: 'game', items: text.trim().split('\n').map(l => {
    const [q0, a, wrong, e = ''] = l.split('|'), q = q0 || hint, t = q.includes('_') ? q.replace('_', a) : a, o = [a, ...wrong.split(',')];
    // igen/nem mindig ugyanott: igen balra, nem jobbra
    return {id: `j:${name}:${q}:${a}`, q, a, t, e: e || (q.includes('_') ? EMOJI.get(t) || '' : ''), opts: o.includes('igen') ? ['igen', 'nem'] : shuffle(o)};
  })});

  GROUPS.splice(1, 0, {title: 'Játékok', cats: [   // a betűk után, hogy ne kelljen sokat görgetni
    game('Fejezd be!', '🧩', 20, 'Fejezd be!', `
egy, kettő, három, …|négy|hat,tíz
öt, hat, hét, …|nyolc|kettő,egy
tíz, kilenc, nyolc, …|hét|egy,húsz
hétfő, kedd, …|szerda|vasárnap,péntek
szombat, …|vasárnap|kedd,szerda
reggel, dél, …|este|tavasz,hétfő
tavasz, nyár, …|ősz|reggel,kedd
január, február, …|március|május,október
piros, fehér, …|zöld|lila,barna
kés, villa és …|kanál|cipő,autó
só és …|bors|tej,kalap
tű és …|cérna|kanál,labda
fogkefe és …|fogkrém|zokni,toll
Boldog …!|születésnapot|reggelt,hetet
Boldog új …!|évet|napot,házat
Isten éltessen …!|sokáig|holnap,lassan
Megyek aludni. Jó …!|éjszakát|reggelt,étvágyat
Szomjas vagyok. Kérek egy pohár …|vizet|kenyeret,cipőt
Fáj a fejem. Kérek egy …|gyógyszert|cipőt,labdát
Aki korán kel, …|aranyat lel|cipőt vesz,vizet iszik
Lassan járj, tovább …|érsz|alszol,eszel
Kicsi a bors, de …|erős|piros,olcsó
Addig üsd a vasat, amíg …|meleg|hideg,olcsó
Ajándék lónak ne nézd a …|fogát|lábát,fülét
Egy fecske nem csinál …|nyarat|telet,esőt
Sok kicsi sokra …|megy|fut,ül
Néma gyereknek anyja sem …|érti|látja,hallja
Nem mind arany, ami …|fénylik|piros,meleg`),

    game('Ellentétek', '↔️', 115, 'Mi az ellentéte?', `
nagy|kicsi|szép,régi
meleg|hideg|piros,lassú
reggel|este|dél,kedd
fent|lent|bent,itt
új|régi|szép,nagy
fiatal|öreg|kicsi,szép
gyors|lassú|erős,tiszta
erős|gyenge|nagy,édes
nehéz|könnyű|piros,hideg
tele|üres|nagy,szép
hosszú|rövid|magas,új
magas|alacsony|hosszú,szép
boldog|szomorú|fáradt,éhes
jó|rossz|szép,nagy
szép|csúnya|jó,régi
igen|nem|jól,most
nyitva|zárva|tele,meleg
bal|jobb|fent,kint
kint|bent|fent,itt
fekete|fehér|piros,kék
sötét|világos|fekete,hideg
drága|olcsó|szép,nagy
beteg|egészséges|fáradt,éhes
ül|áll|fut,eszik
jön|megy|fut,ül
nevet|sír|énekel,alszik
ad|kap|fut,ül
korán|későn|gyorsan,most
sok|kevés|nagy,szép
kemény|puha|nehéz,régi`),

    game('Igaz vagy hamis?', '👍', 165, 'Igaz ez?', `
A hó fehér.|igen|nem|❄️
A fű kék.|nem|igen|🌿
A hal tud úszni.|igen|nem|🐟
A kutya repül.|nem|igen|🐶
A citrom savanyú.|igen|nem|🍋
A cukor sós.|nem|igen|🍬
Télen hideg van.|igen|nem|⛄
Nyáron esik a hó.|nem|igen|☀️
Éjjel alszunk.|igen|nem|🌙
Kanállal eszünk levest.|igen|nem|🥄
Késsel iszunk.|nem|igen|🔪
A tej fehér.|igen|nem|🥛
A banán kék.|nem|igen|🍌
A tehén tejet ad.|igen|nem|🐄
A macska ugat.|nem|igen|🐱
A kutya ugat.|igen|nem|🐕
Egy héten hét nap van.|igen|nem|📅
A tűz hideg.|nem|igen|🔥
Az ágyban alszunk.|igen|nem|🛏️
A cipőt a fejünkre vesszük.|nem|igen|👞
Ha esik, esernyő kell.|igen|nem|☂️
A paradicsom piros.|igen|nem|🍅
Az elefánt nagy.|igen|nem|🐘
A madár tud repülni.|igen|nem|🐦
A kő puha.|nem|igen|🪨
A kávét isszuk.|igen|nem|☕
A kenyeret isszuk.|nem|igen|🍞
A karácsony télen van.|igen|nem|🎄
A szemünkkel hallunk.|nem|igen|👀
A fülünkkel hallunk.|igen|nem|👂`),

    game('Kérdés–válasz', '❓', 205, 'Válaszolj!', `
Mivel vágjuk a kenyeret?|kés|kanál,fésű
Mivel eszünk levest?|kanál|kés,olló
Miből iszunk?|pohár|tányér,cipő
Mivel írunk?|toll|kanál,olló
Hol alszunk?|ágy|kád,asztal
Mit iszunk reggel?|kávé|leves,sör
Mit veszünk a lábunkra?|cipő|sapka,kesztyű
Mit veszünk a fejünkre?|sapka|cipő,zokni
Mi kell, ha esik az eső?|esernyő|szemüveg,labda
Kit hívunk, ha beteg vagyunk?|orvos|postás,szakács
Kit hívunk, ha ég a ház?|tűzoltó|fodrász,tanár
Mivel mosunk fogat?|fogkefe|fésű,kanál
Mivel mosunk kezet?|szappan|só,olaj
Mit eszik a nyúl?|répa|hal,kolbász
Melyik állat ad tejet?|tehén|kutya,macska
Melyik állat tojik?|tyúk|tehén,ló
Mivel vágjuk a papírt?|olló|kanál,toll
Miben főzzük a levest?|fazék|pohár,cipő
Mit olvasunk?|könyv|kanál,szék
Milyen színű a vér?|piros|kék,zöld
Milyen színű a fű?|zöld|piros,fehér
Milyen színű a hó?|fehér|fekete,sárga
Mit veszünk be, ha fáj a fejünk?|gyógyszer|kenyér,vaj
Hol veszünk kenyeret?|bolt|templom,posta
Hol veszünk gyógyszert?|patika|posta,bank
Mivel nyitjuk az ajtót?|kulcs|kanál,fésű
Mi világít éjjel az égen?|hold|nap,felhő
Miből készül a hóember?|hó|homok,kenyér
Mivel telefonálunk?|telefon|tévé,könyv
Mivel söprünk?|seprű|kanál,toll`),

    game('Kakukktojás', '🥚', 270, 'Melyik nem illik?', `
|autó|alma,körte,banán
|kutya|kés,villa,kanál
|cipő|tej,víz,kávé
|asztal|piros,kék,zöld
|macska|répa,hagyma,paprika
|kenyér|kutya,ló,tehén
|hal|ing,nadrág,kabát
|banán|busz,vonat,autó
|virág|anya,apa,nagymama
|labda|szem,fül,orr
|szék|egy,kettő,három
|tej|zokni,cipő,csizma
|eper|szék,ágy,kanapé
|kés|nap,hold,csillag
|telefon|orvos,tanár,rendőr
|ló|tányér,pohár,bögre
|tehén|méh,lepke,hangya
|rózsa|toll,ceruza,füzet
|sajt|eső,hó,szél
|hajó|tavasz,nyár,tél
|zsiráf|tyúk,kacsa,kakas
|szappan|torta,süti,csoki
|fésű|reggel,dél,este
|kígyó|kórház,iskola,posta
|citrom|hétfő,kedd,szerda
|bicikli|tigris,oroszlán,medve
|kanál|telefon,tévé,rádió
|hold|kenyér,kifli,kalács`),

    // A sorban mindig k, t, l: ezek a hangok a legnehezebbek. Csak olyan szó, ahol a rossz betűvel nem jön ki másik valódi szó.
    game('Hiányzó betű', '🔡', 325, 'Melyik betű hiányzik?', `
_utya|k|t,l
_ojás|t|k,l
_alap|k|t,l
_ávé|k|t,l
_ámpa|l|k,t
_evél|l|k,t
_ulcs|k|t,l
_ifli|k|t,l
_éz|k|t,l
_ányér|t|k,l
_észta|t|k,l
_oll|t|k,l
_ehén|t|k,l
_ecske|k|t,l
_akas|k|t,l
_abda|l|k,t
_ány|l|k,t
_epke|l|k,t
_űz|t|k,l
_ukorica|k|t,l
_áposzta|k|t,l
_és|k|t,l
_anál|k|t,l
cu_or|k|t,l
a_ma|l|k,t
ci_rom|t|k,l
cso_i|k|t,l
ma_ac|l|k,t
sa_áta|l|k,t
bo_t|l|k,t
ho_d|l|k,t`),
  ]});
}
