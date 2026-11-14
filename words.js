// Monddapp tananyag. Új szó = egy új sor a megfelelő kategóriában:
//   magyar|emoji|angol        (az emoji üresen hagyható; az angol a későbbi képgeneráláshoz kell)
// Betűknél: betű|emoji|példaszó.  Ugyanaz a szó csak egyszer szerepelhet (index.html#test ellenőrzi).

const rows = (kind, text) => text.trim().split('\n').map(l => {
  const [t, e, x] = l.split('|');
  if (kind === 'letter') return {id: 'b:' + t, t, e, cap: x, show: t[0].toUpperCase() + t.slice(1) + ' ' + t};
  return {id: (kind === 'syll' ? 's:' : '') + t, t, e, en: x};
});
// hue: a kategória színe (OKLCH színszög, 0–360)
const cat = (name, icon, hue, kind, text) => ({name, icon, hue, kind, items: rows(kind, text)});

const GROUPS = [
  {title: 'Betűk és hangok', cats: [
    cat('Ábécé', '🔤', 265, 'letter', `
a|🍎|alma
á|🛏️|ágy
b|👶|baba
c|🐱|cica
cs|🐌|csiga
d|🌰|dió
dz|🏋️|edző
dzs|🍓|dzsem
e|🍓|eper
é|🌌|ég
f|🌳|fa
g|🍄|gomba
gy|🕯️|gyertya
h|🐟|hal
i|👔|ing
í|🏹|íj
j|🧊|jég
k|🐶|kutya
l|🐴|ló
ly|🕳️|lyuk
m|🐱|macska
n|☀️|nap
ny|🐰|nyúl
o|✂️|olló
ó|⏰|óra
ö||öv
ő|🦌|őz
p|🕷️|pók
q||
r|🥕|répa
s|🧣|sál
sz|❤️|szív
t|🥚|tojás
ty|🐔|tyúk
u|🥒|uborka
ú|🛣️|út
ü|🍾|üveg
ű|🚀|űrhajó
v|🌸|virág
w|🚽|WC
x||xilofon
y||
z|🧦|zokni
zs|🦒|zsiráf`),
    cat('Szótagok', '🗣️', 305, 'syll', `
ma
mi
mu
pa
pi
po
ba
be
bu
ta
te
da
do
na
ne
la
le
li
lu
ka
ko
ku
ga
go
ha
he
fi
va
vi
sza
szi
sa
so`),
  ]},

  {title: 'Szavak', cats: [
    cat('Fontos szavak', '💬', 40, 'word', `
igen|✅|yes
nem|❌|no
kérek|🙏|I would like, please
köszönöm|💐|thank you
szia|👋|hi
viszlát|👋|goodbye
bocsánat||sorry
tessék||here you are
fáj|🤕|it hurts
segíts|🆘|help me
még|➕|more
elég|✋|enough
most||now
később||later
itt|📍|here
ott|👉|there
én||I, me
te||you
mi||we
ki|❓|who
mit||what
hol||where
mikor||when
miért||why
jól|👍|well
rosszul|👎|unwell`),
    cat('Család, emberek', '👪', 320, 'word', `
anya|👩|mother
apa|👨|father
mama|👵|grandma
papa|👴|grandpa
nagymama|👵|grandmother
nagypapa|👴|grandfather
fiú|👦|boy
lány|👧|girl
baba|👶|baby
gyerek|🧒|child
testvér||siblings
férj|🤵|husband
feleség|👰|wife
unoka|🧒|grandchild
néni|👩‍🦳|elderly lady
bácsi|👨‍🦳|elderly man
barát|🤝|friend
család|👪|family
ember|🧑|person
nő|👩|woman
férfi|👨|man
szomszéd|🏘️|neighbour
vendég||guest
orvos|🧑‍⚕️|doctor
nővér|👩‍⚕️|nurse
tanár|🧑‍🏫|teacher
rendőr|👮|police officer
pap|⛪|priest
szakács|🧑‍🍳|cook
postás|📮|postman
sofőr|🚕|driver
fodrász|💇|hairdresser
katona|💂|soldier
tűzoltó|🧑‍🚒|firefighter
pincér||waiter
kertész|🧑‍🌾|gardener`),
    cat('Test', '🧍', 190, 'word', `
fej|🙂|head
haj||hair
arc|😊|face
szem|👁️|eye
fül|👂|ear
orr|👃|nose
száj|👄|mouth
fog|🦷|tooth
nyelv|👅|tongue
nyak||neck
váll||shoulder
kar|💪|arm
kéz|✋|hand
ujj|☝️|finger
köröm|💅|fingernail
has||belly
hát||back of the body
láb|🦵|leg
térd||knee
talp|🦶|sole of the foot
bőr||skin
szív|❤️|heart
csont|🦴|bone
könyök||elbow
homlok||forehead
torok||throat
derék||waist
comb||thigh
sarok||heel
szakáll|🧔|beard
bajusz||moustache
ajak|👄|lips
tüdő||lungs
agy|🧠|brain
vér||blood
izom|💪|muscle
könny|😢|teardrop`),
    cat('Étel', '🍞', 60, 'word', `
kenyér|🍞|bread
kifli|🥐|crescent roll
zsemle||bread roll
vaj|🧈|butter
sajt|🧀|cheese
tojás|🥚|egg
hús|🥩|meat
csirke|🍗|roast chicken
sonka||ham
kolbász||sausage
szalonna|🥓|bacon
leves|🍲|soup
gulyás|🍲|goulash soup
pörkölt||meat stew
rizs|🍚|rice
tészta|🍝|pasta
krumpli|🥔|potato
főzelék||vegetable pottage
só|🧂|salt
cukor|🍬|sugar
méz|🍯|honey
lekvár||jam
liszt||flour
olaj||cooking oil
bors||black pepper
ecet||vinegar
torta|🎂|cake
süti|🍪|pastry, cookie
keksz|🍪|biscuit
csoki|🍫|chocolate
fagyi|🍦|ice cream
palacsinta|🥞|crepe pancake
pizza|🍕|pizza
szendvics|🥪|sandwich
pogácsa||savoury scone
túró||curd cheese
tejföl||sour cream
joghurt||yoghurt
rántotta|🍳|scrambled eggs
virsli|🌭|frankfurter sausage
fánk|🍩|doughnut
lángos||langos fried flatbread
kalács||braided sweet bread
rétes||strudel
puding|🍮|pudding
reggeli|🍳|breakfast
ebéd|🍽️|lunch
vacsora|🍽️|dinner`),
    cat('Ital', '☕', 240, 'word', `
víz|💧|glass of water
tej|🥛|milk
tea|🍵|tea
kávé|☕|coffee
kakaó|☕|hot cocoa
üdítő|🥤|soft drink
szörp|🧃|fruit syrup drink
limonádé|🍋|lemonade
bor|🍷|wine
sör|🍺|beer
pálinka|🥃|fruit brandy
pezsgő|🍾|champagne`),
    cat('Gyümölcs', '🍎', 10, 'word', `
alma|🍎|apple
körte|🍐|pear
szilva||plum
barack|🍑|peach
cseresznye|🍒|cherries
meggy|🍒|sour cherries
szőlő|🍇|grapes
eper|🍓|strawberry
málna||raspberry
dinnye|🍉|watermelon
banán|🍌|banana
narancs|🍊|orange fruit
citrom|🍋|lemon
dió|🌰|walnut
mogyoró|🥜|hazelnut
mák||poppy seeds
ananász|🍍|pineapple
kivi|🥝|kiwi fruit
füge||fig
gesztenye|🌰|chestnut`),
    cat('Zöldség', '🥕', 145, 'word', `
répa|🥕|carrot
hagyma|🧅|onion
fokhagyma|🧄|garlic
paprika|🌶️|pepper vegetable
paradicsom|🍅|tomato
uborka|🥒|cucumber
káposzta|🥬|cabbage
saláta|🥗|lettuce
bab||beans
borsó||green peas
kukorica|🌽|corn
tök|🎃|pumpkin
retek||radish
gomba|🍄|mushroom
spenót|🥬|spinach
karfiol||cauliflower
zeller||celery
cékla||beetroot
lencse||lentils
petrezselyem|🌿|parsley`),
    cat('Állatok', '🐾', 100, 'word', `
kutya|🐶|dog
macska|🐱|cat
ló|🐴|horse
tehén|🐮|cow
disznó|🐖|pig
malac|🐷|piglet
birka|🐑|sheep
bárány|🐑|lamb
kecske|🐐|goat
tyúk|🐔|hen
kakas|🐓|rooster
csibe|🐥|chick
kacsa|🦆|duck
liba||goose
pulyka|🦃|turkey
nyúl|🐰|rabbit
egér|🐭|mouse
madár|🐦|bird
galamb|🕊️|pigeon
veréb|🐦|sparrow
fecske||swallow bird
gólya||stork
bagoly|🦉|owl
sas|🦅|eagle
hal|🐟|fish
béka|🐸|frog
kígyó|🐍|snake
gyík|🦎|lizard
teknős|🐢|turtle
róka|🦊|fox
farkas|🐺|wolf
medve|🐻|bear
szarvas|🦌|stag deer
őz|🦌|roe deer
sün|🦔|hedgehog
mókus|🐿️|squirrel
oroszlán|🦁|lion
tigris|🐯|tiger
elefánt|🐘|elephant
majom|🐵|monkey
zsiráf|🦒|giraffe
zebra|🦓|zebra
teve|🐫|camel
pók|🕷️|spider
légy||housefly
szúnyog|🦟|mosquito
méh|🐝|bee
darázs||wasp
lepke|🦋|butterfly
hangya|🐜|ant
csiga|🐌|snail
kukac||earthworm
katica|🐞|ladybird
szamár||donkey
bika|🐂|bull
hattyú|🦢|swan
papagáj|🦜|parrot
delfin|🐬|dolphin
cápa|🦈|shark
rák|🦀|crab`),
    cat('Otthon', '🏠', 255, 'word', `
ház|🏠|house
lakás|🏢|apartment
szoba|🛋️|living room
konyha|🍳|kitchen
fürdő|🛁|bathroom
vécé|🚽|toilet
ajtó|🚪|door
ablak||window
fal|🧱|wall
padló||floor
lépcső||stairs
tető||roof
kert|🏡|garden
kapu||gate
kulcs|🔑|key
ágy|🛏️|bed
párna||pillow
takaró||blanket
szék|🪑|chair
asztal||table
szekrény||wardrobe
polc||shelf
fiók||drawer
kanapé|🛋️|sofa
fotel||armchair
szőnyeg||carpet
függöny||curtain
lámpa|💡|lamp
tükör||mirror
kép|🖼️|framed picture
óra|⏰|clock
kályha||tile stove
kémény||chimney
erkély||balcony
pince||cellar
garázs||garage
kerítés||fence
csengő|🔔|doorbell
kád|🛁|bathtub
zuhany|🚿|shower`),
    cat('Konyha', '🍽️', 75, 'word', `
tányér|🍽️|plate
pohár|🥛|drinking glass
bögre|☕|mug
csésze|🍵|cup
kanál|🥄|spoon
villa|🍴|fork
kés|🔪|knife
lábas||saucepan
fazék|🍲|cooking pot
serpenyő|🍳|frying pan
fedő||pot lid
tál|🥣|bowl
kancsó||jug
üveg|🍾|bottle
hűtő||refrigerator
sütő||oven
tűzhely||kitchen stove
mosogató||kitchen sink
csap|🚰|water tap
szemetes|🗑️|rubbish bin
szalvéta||napkin
terítő||tablecloth
tálca||tray
dugó||cork
konzerv|🥫|tin can of food
doboz|📦|box
zacskó|🛍️|bag
kosár|🧺|basket
vödör||bucket
szivacs|🧽|sponge`),
    cat('Ruha', '👕', 300, 'word', `
ruha|👗|dress
ing|👔|shirt
póló|👕|t-shirt
pulóver||sweater
kabát|🧥|coat
nadrág|👖|trousers
szoknya||skirt
zokni|🧦|socks
cipő|👞|shoe
csizma|👢|boot
papucs||slippers
sapka|🧢|cap
kalap|👒|hat
sál|🧣|scarf
kesztyű|🧤|gloves
öv||belt
zseb||pocket
gomb||clothing button
cipzár||zipper
pizsama||pyjamas
köntös||bathrobe
harisnya||tights
táska|👜|handbag
esernyő|☂️|umbrella
szemüveg|👓|eyeglasses
gyűrű|💍|ring
lánc|📿|necklace
kendő||headscarf
mellény||waistcoat
zakó||suit jacket
nyakkendő|👔|necktie`),
    cat('Tárgyak', '📱', 215, 'word', `
telefon|📱|mobile phone
tévé|📺|television
rádió|📻|radio
újság|📰|newspaper
könyv|📖|book
füzet|📓|notebook
toll|🖊️|pen
ceruza|✏️|pencil
papír|📄|sheet of paper
levél|✉️|letter in envelope
olló|✂️|scissors
ragasztó||glue
pénz|💵|money
tárca|👛|wallet
kártya|💳|bank card
gyógyszer|💊|medicine pills
bot||walking stick
zsebkendő||handkerchief
fésű||comb
kefe||brush
fogkefe||toothbrush
fogkrém||toothpaste
szappan|🧼|soap
sampon|🧴|shampoo
törölköző||towel
borotva||razor
krém|🧴|skin cream
gyertya|🕯️|candle
gyufa||matches
elem|🔋|battery
tű||sewing needle
cérna|🧵|thread
vasaló||clothes iron
porszívó||vacuum cleaner
seprű|🧹|broom
mosógép||washing machine
naptár|📅|calendar
bélyeg||postage stamp
ajándék|🎁|gift
labda|⚽|ball
játék|🧸|toy
kalapács|🔨|hammer
szög||nail
csavar|🔩|screw
létra||ladder
zseblámpa|🔦|torch
fénykép|📷|photograph`),
    cat('Színek', '🎨', 340, 'word', `
piros|🟥|red
kék|🟦|blue
zöld|🟩|green
sárga|🟨|yellow
fehér|⬜|white
fekete|⬛|black
barna|🟫|brown
szürke||grey
lila|🟪|purple
rózsaszín|🌸|pink
narancssárga|🟧|orange colour
arany|🥇|gold
ezüst|🥈|silver`),
    cat('Számok', '🔢', 180, 'word', `
nulla|0|zero
egy|1|one
kettő|2|two
három|3|three
négy|4|four
öt|5|five
hat|6|six
hét|7|seven
nyolc|8|eight
kilenc|9|nine
tíz|10|ten
húsz|20|twenty
száz|100|hundred
ezer|1000|thousand`),
    cat('Természet', '🌳', 150, 'word', `
nap|☀️|sun
hold|🌙|moon
csillag|⭐|star
ég|🌌|sky
felhő|☁️|cloud
eső|🌧️|rain
hó|❄️|snow
szél|💨|wind
vihar|⛈️|storm
villám|⚡|lightning
köd|🌫️|fog
jég|🧊|ice
szivárvány|🌈|rainbow
fa|🌳|tree
virág|🌸|flower
fű|🌱|grass
bokor||bush
erdő|🌲|forest
mező||meadow
hegy|⛰️|mountain
domb||hill
folyó||river
tó|🏞️|lake
tenger|🌊|sea
patak||stream
kő||stone
homok|🏖️|sand
föld|🌍|soil, earth
sár||mud
tűz|🔥|fire
rózsa|🌹|rose
tulipán|🌷|tulip
napraforgó|🌻|sunflower
gyökér||tree root
ág||tree branch`),
    cat('Város, utazás', '🚌', 225, 'word', `
utca||street
út|🛣️|road
híd|🌉|bridge
bolt|🏪|shop
piac||market
patika||pharmacy
kórház|🏥|hospital
iskola|🏫|school
templom|⛪|church
posta|🏤|post office
bank|🏦|bank building
étterem|🍴|restaurant
park|🏞️|park
állomás|🚉|railway station
megálló|🚏|bus stop
autó|🚗|car
busz|🚌|bus
vonat|🚆|train
villamos|🚋|tram
bicikli|🚲|bicycle
motor|🏍️|motorcycle
repülő|✈️|aeroplane
hajó|🚢|ship
csónak|🛶|rowing boat
taxi|🚕|taxi
mentő|🚑|ambulance
kamion|🚛|lorry
traktor|🚜|tractor
kerék||wheel
benzin|⛽|petrol station
jegy|🎫|ticket
térkép|🗺️|map
falu||village
város|🏙️|city`),
    cat('Idő, ünnepek', '📅', 280, 'word', `
ma|📅|today
holnap||tomorrow
tegnap||yesterday
reggel|🌅|morning
dél|🕛|noon
este|🌆|evening
éjjel|🌃|night
hétfő||Monday
kedd||Tuesday
szerda||Wednesday
csütörtök||Thursday
péntek||Friday
szombat||Saturday
vasárnap||Sunday
tavasz|🌷|spring season
nyár|☀️|summer
ősz|🍂|autumn
tél|⛄|winter
perc|⏱️|minute
év||year
hónap|🗓️|month
születésnap|🎂|birthday
karácsony|🎄|Christmas
húsvét|🐣|Easter
ünnep|🎉|celebration`),
    cat('Mit csinál?', '🏃', 30, 'word', `
eszik|🍽️|eating
iszik|🥤|drinking
alszik|😴|sleeping
ül|🪑|sitting
áll|🧍|standing
megy|🚶|walking
jön||coming closer
fut|🏃|running
sétál|🚶|strolling
néz|👀|looking
hall|👂|hearing
beszél|🗣️|speaking
olvas|📖|reading
ír|✍️|writing
főz|🧑‍🍳|cooking
mos|🧼|washing
fürdik|🛁|bathing
öltözik||getting dressed
nevet|😄|laughing
sír|😢|crying
ad|🤲|giving
kér|🙏|asking for something
vesz|🛒|buying
hoz||bringing
visz||carrying away
nyit|🔓|opening
zár|🔒|locking
fekszik|🛌|lying down
dolgozik|💼|working
pihen|😌|resting
játszik|🎲|playing
énekel|🎤|singing
táncol|💃|dancing
vár|⏳|waiting
segít|🤝|helping
szeret|❤️|loving
ölel|🤗|hugging
telefonál|📞|talking on the phone
vásárol|🛒|shopping
takarít|🧹|cleaning
vezet|🚗|driving a car
úszik|🏊|swimming
repül|✈️|flying
ugrik||jumping
mosolyog|🙂|smiling`),
    cat('Milyen?', '✨', 90, 'word', `
nagy||big
kicsi||small
jó|👍|good
rossz|👎|bad
szép|🌺|beautiful
csúnya||ugly
meleg|🌡️|warm
hideg|🥶|cold
forró|♨️|hot
új|✨|new
régi||old object
öreg|🧓|old person
fiatal||young
gyors|⚡|fast
lassú|🐢|slow
erős|💪|strong
gyenge||weak
nehéz|🏋️|heavy
könnyű||light weight
tele||full
üres||empty
tiszta|✨|clean
piszkos||dirty
édes|🍭|sweet
sós|🧂|salty
savanyú|🍋|sour
keserű||bitter
finom|😋|tasty
hosszú|📏|long
rövid||short length
magas||tall
alacsony||short height
boldog|😊|happy
szomorú|😢|sad
fáradt|😴|tired
beteg|🤒|ill
éhes|🍽️|hungry
szomjas|🥤|thirsty
vidám|😄|cheerful
mérges|😠|angry
csendes|🤫|quiet
hangos|📢|loud`),
  ]},

  {title: 'Mondatok', cats: [
    cat('Rövid mondatok', '📝', 350, 'sent', `
Jó reggelt!|🌅
Jó napot!|☀️
Jó estét!|🌆
Jó éjszakát!|🌙
Kérek vizet.|💧
Kérek kávét.|☕
Kérek kenyeret.|🍞
Igen, kérek.|✅
Nem kérek.|❌
Éhes vagyok.|🍽️
Szomjas vagyok.|🥤
Fáradt vagyok.|😴
Fáj a fejem.|🤕
Hideg van.|🥶
Meleg van.|🌡️
Köszönöm szépen.|💐
Hogy vagy?|🙂
Jól vagyok.|👍
Szeretlek.|❤️
Segíts, kérlek!|🆘
Vécére megyek.|🚽
Aludni megyek.|🛏️
Hol van a telefon?|📱
Finom volt.|😋
Szép az idő.|🌤️`),
  ]},
];

// ---------- Tanácsok hangonként: hova kerül a nyelv, az ajak ----------
const TIP = {
  a: 'Nyisd ki a szád, az ajkad legyen kicsit kerek.',
  á: 'Nyisd nagyra a szád.',
  e: 'Nyitott, széles száj.',
  é: 'Mosolyogj, a szád félig nyitva.',
  i: 'Széles mosoly, kicsi rés.',
  o: 'Kerekítsd az ajkad, mint egy karika.',
  ö: 'Kerek ajkak, a nyelved elöl.',
  u: 'Csücsöríts, kicsi kerek nyílás.',
  ü: 'Csücsöríts, a nyelved elöl.',
  m: 'Zárd össze az ajkad, és zümmögj: mmm.',
  p: 'Zárd össze az ajkad, aztán pattintsd szét.',
  b: 'Zárd össze az ajkad, aztán nyisd szét hanggal.',
  f: 'A felső fogad az alsó ajkadon. Fújj!',
  v: 'A felső fogad az alsó ajkadon. Zümmögj!',
  t: 'A nyelved hegye fent, a felső fogak mögött. Pattintsd le!',
  d: 'A nyelved hegye fent, a felső fogak mögött. Hanggal engedd le!',
  n: 'A nyelved hegye fent marad. A hang az orrodon jön: nnn.',
  l: 'A nyelved hegye fent, a felső fogak mögött. A hang kétoldalt jön ki: lll.',
  r: 'A nyelved hegye fent, pergesd: rrr.',
  k: 'A nyelved hegye lent, a hátulja fent. Mint egy kis köhintés: k.',
  g: 'A nyelved hegye lent, a hátulja fent. Hanggal: g.',
  h: 'Nyitott száj. Lehelj, mint a tükörre: hhh.',
  sz: 'Fogak összezárva, mosolyogj, sziszegj: ssz.',
  z: 'Fogak összezárva, mosolyogj, zümmögj: zzz.',
  c: 'Fogak összezárva. Gyors t, aztán sz: c.',
  s: 'Csücsöríts, fogak közel. Csitíts: sss.',
  zs: 'Csücsöríts, fogak közel. Zümmögj: zzs.',
  cs: 'Csücsöríts. Gyors t, aztán s: cs.',
  j: 'Mosolygó száj, a nyelved közepe fent: jjj.',
  ny: 'A nyelved közepe a szájpadláson. A hang az orrodon jön: nny.',
  gy: 'A nyelved közepe a szájpadlásra tapad, aztán elenged: gy.',
  ty: 'A nyelved közepe a szájpadlásra tapad, aztán elpattan: ty.',
};
const ALIAS = {í:'i', ó:'o', ő:'ö', ú:'u', ű:'ü', ly:'j', dz:'c', dzs:'cs', w:'v', q:'k', x:'k', y:'i'};
