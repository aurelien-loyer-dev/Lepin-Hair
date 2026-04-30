// data.js — Lepin'Hair static data + slot helpers

export const SERVICES = [
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

export const HOURS = { start: 14, end: 18 };
export const WORKING_DAYS = [1, 2, 3, 4, 5];

export const DAY_NAMES = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
export const DAY_NAMES_LONG = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
export const MONTH_NAMES = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
export const MONTH_SHORT = ['Janv','Févr','Mars','Avr','Mai','Juin','Juil','Août','Sept','Oct','Nov','Déc'];

export function startOfWeek(d) {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  const dow = date.getDay();
  const diff = (dow === 0 ? -6 : 1 - dow);
  date.setDate(date.getDate() + diff);
  return date;
}
export function addDays(d, n) {
  const date = new Date(d);
  date.setDate(date.getDate() + n);
  return date;
}
export function sameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
export function isPast(date, hour) {
  const now = new Date();
  const d = new Date(date);
  d.setHours(hour, 0, 0, 0);
  return d <= now;
}
export function fmtDate(d) {
  return `${DAY_NAMES_LONG[d.getDay()]} ${d.getDate()} ${MONTH_NAMES[d.getMonth()]}`;
}
export function fmtDateShort(d) {
  return `${d.getDate()} ${MONTH_SHORT[d.getMonth()]}`;
}
export function dateKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

export function hoursForDay() {
  const slots = [];
  for (let h = HOURS.start; h < HOURS.end; h++) slots.push(h);
  return slots;
}

export function isPreBooked(date, hour) {
  const key = dateKey(date);
  let h = 0;
  const s = key + ':' + hour;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h) % 7 < 2;
}
