// data.jsx — Lepin'Hair static data + slot helpers

const SERVICES = [
  {
    id: 'coupe',
    name: 'Coupe Homme',
    duration: 1,
    price: 28,
    desc: 'Shampoing, coupe ciseaux ou tondeuse, finitions et coiffage.',
    tag: 'Classique',
  },
  {
    id: 'barbe',
    name: 'Taille de Barbe',
    duration: 1,
    price: 22,
    desc: 'Tracé au rasoir, soin chaud, équilibrage et baume hydratant.',
    tag: 'Soin',
  },
  {
    id: 'combo',
    name: 'Coupe + Barbe',
    duration: 2,
    price: 45,
    desc: 'L\'expérience complète. Prenez votre temps.',
    tag: 'Signature',
  },
  {
    id: 'rasage',
    name: 'Rasage Traditionnel',
    duration: 2,
    price: 38,
    desc: 'Rasage au coupe-chou, serviettes chaudes, pierre d\'alun.',
    tag: 'Traditionnel',
  },
];

const HOURS = { start: 14, end: 18 }; // 14h → 18h
const WORKING_DAYS = [1, 2, 3, 4, 5]; // Lun-Ven

const DAY_NAMES = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
const DAY_NAMES_LONG = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
const MONTH_NAMES = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
const MONTH_SHORT = ['Janv','Févr','Mars','Avr','Mai','Juin','Juil','Août','Sept','Oct','Nov','Déc'];

// Helpers
function startOfWeek(d) {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  const dow = date.getDay();
  const diff = (dow === 0 ? -6 : 1 - dow);
  date.setDate(date.getDate() + diff);
  return date;
}
function addDays(d, n) {
  const date = new Date(d);
  date.setDate(date.getDate() + n);
  return date;
}
function sameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
function isPast(date, hour) {
  const now = new Date();
  const d = new Date(date);
  d.setHours(hour, 0, 0, 0);
  return d <= now;
}
function fmtDate(d) {
  return `${DAY_NAMES_LONG[d.getDay()]} ${d.getDate()} ${MONTH_NAMES[d.getMonth()]}`;
}
function fmtDateShort(d) {
  return `${d.getDate()} ${MONTH_SHORT[d.getMonth()]}`;
}
function dateKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

// Generate hour slots for a day
function hoursForDay() {
  const slots = [];
  for (let h = HOURS.start; h < HOURS.end; h++) slots.push(h);
  return slots;
}

// Some "already booked" slots (deterministic-ish based on date) for realism
function isPreBooked(date, hour) {
  const key = dateKey(date);
  // hash on key + hour
  let h = 0;
  const s = key + ':' + hour;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  // ~25% chance booked
  return Math.abs(h) % 7 < 2;
}

Object.assign(window, {
  SERVICES, HOURS, WORKING_DAYS,
  DAY_NAMES, DAY_NAMES_LONG, MONTH_NAMES, MONTH_SHORT,
  startOfWeek, addDays, sameDay, isPast, fmtDate, fmtDateShort, dateKey,
  hoursForDay, isPreBooked,
});
