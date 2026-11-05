'use strict';
const RAD = 180 / Math.PI;
const EPS = 1e-8;
const trunc = n => { const r = Math.trunc(n); return isNaN(r) ? 0 : r; };
const frac = n => { const r = n % 1; return isNaN(r) ? 0 : r; };
const zero360 = deg => { const r = deg - trunc(deg / 360) * 360; return r < 0 ? r + 360 : r; };

const MASA = [
  { en: 'Chingam', ml: '\u0D1A\u0D3F\u0D19\u0D4D\u0D19\u0D02' },
  { en: 'Kanni', ml: '\u0D15\u0D28\u0D4D\u0D28\u0D3F' },
  { en: 'Thulam', ml: '\u0D24\u0D41\u0D32\u0D3E\u0D02' },
  { en: 'Vrischikam', ml: '\u0D35\u0D43\u0D36\u0D4D\u0D1A\u0D3F\u0D15\u0D02' },
  { en: 'Dhanu', ml: '\u0D27\u0D28\u0D41' },
  { en: 'Makaram', ml: '\u0D2E\u0D15\u0D30\u0D02' },
  { en: 'Kumbham', ml: '\u0D15\u0D41\u0D02\u0D2D\u0D02' },
  { en: 'Meenam', ml: '\u0D2E\u0D40\u0D28\u0D02' },
  { en: 'Medam', ml: '\u0D2E\u0D47\u0D1F\u0D02' },
  { en: 'Idavam', ml: '\u0D07\u0D1F\u0D35\u0D02' },
  { en: 'Mithunam', ml: '\u0D2E\u0D3F\u0D25\u0D41\u0D28\u0D02' },
  { en: 'Karkitakam', ml: '\u0D15\u0D7C\u0D15\u0D4D\u0D15\u0D1F\u0D15\u0D02' }
];

const NAKSHATRA = [
  { en: 'Ashwathi', ml: '\u0D05\u0D36\u0D4D\u0D35\u0D24\u0D3F' },
  { en: 'Bharani', ml: '\u0D2D\u0D30\u0D23\u0D3F' },
  { en: 'Karthika', ml: '\u0D15\u0D3E\u0D7C\u0D24\u0D4D\u0D24\u0D3F\u0D15' },
  { en: 'Rohini', ml: '\u0D30\u0D4B\u0D39\u0D3F\u0D23\u0D3F' },
  { en: 'Makiryam', ml: '\u0D2E\u0D15\u0D2F\u0D3F\u0D30\u0D02' },
  { en: 'Thiruvathira', ml: '\u0D24\u0D3F\u0D30\u0D41\u0D35\u0D3E\u0D24\u0D3F\u0D30' },
  { en: 'Punartham', ml: '\u0D2A\u0D41\u0D23\u0D7C\u0D24\u0D02' },
  { en: 'Pooyam', ml: '\u0D2A\u0D42\u0D2F\u0D02' },
  { en: 'Aayilyam', ml: '\u0D06\u0D2F\u0D3F\u0D32\u0D4D\u0D2F\u0D02' },
  { en: 'Makam', ml: '\u0D2E\u0D15\u0D02' },
  { en: 'Pooram', ml: '\u0D2A\u0D42\u0D30\u0D02' },
  { en: 'Uthram', ml: '\u0D09\u0D24\u0D4D\u0D30\u0D02' },
  { en: 'Atham', ml: '\u0D05\u0D24\u0D4D\u0D24\u0D02' },
  { en: 'Chithra', ml: '\u0D1A\u0D3F\u0D24\u0D4D\u0D30' },
  { en: 'Chothi', ml: '\u0D1A\u0D4B\u0D24\u0D3F' },
  { en: 'Vishakham', ml: '\u0D35\u0D3F\u0D36\u0D3E\u0D16\u0D02' },
  { en: 'Anizham', ml: '\u0D05\u0D28\u0D3F\u0D34\u0D02' },
  { en: 'Thrikketta', ml: '\u0D24\u0D43\u0D15\u0D4D\u0D15\u0D47\u0D1F\u0D4D\u0D1F' },
  { en: 'Moolam', ml: '\u0D2E\u0D42\u0D32\u0D02' },
  { en: 'Pooradam', ml: '\u0D2A\u0D42\u0D30\u0D3E\u0D1F\u0D02' },
  { en: 'Uthradam', ml: '\u0D09\u0D24\u0D4D\u0D30\u0D3E\u0D1F\u0D02' },
  { en: 'Thiruvonam', ml: '\u0D24\u0D3F\u0D30\u0D41\u0D35\u0D4B\u0D23\u0D02' },
  { en: 'Avittam', ml: '\u0D05\u0D35\u0D3F\u0D1F\u0D4D\u0D1F\u0D02' },
  { en: 'Chathayam', ml: '\u0D1A\u0D24\u0D2F\u0D02' },
  { en: 'Poororuttathi', ml: '\u0D2A\u0D42\u0D30\u0D41\u0D30\u0D41\u0D1F\u0D4D\u0D1F\u0D3E\u0D24\u0D3F' },
  { en: 'Uthrattathi', ml: '\u0D09\u0D24\u0D4D\u0D30\u0D1F\u0D4D\u0D1F\u0D3E\u0D24\u0D3F' },
  { en: 'Revathi', ml: '\u0D30\u0D47\u0D35\u0D24\u0D3F' }
];

const UJJAIN_LONGITUDE = 75.8;

const FESTIVALS = [
  { month: 0, day: 1, en: 'Kollavarsham New Year', ml: '\u0D15\u0D4A\u0D32\u0D4D\u0D32\u0D35\u0D7C\u0D37\u0D02 \u0D2A\u0D3F\u0D31\u0D35\u0D3F' },
  { month: 0, nakshatram: 'Atham', maxDay: 20, en: 'Onam begins (Atham)', ml: '\u0D13\u0D23\u0D02 \u0D06\u0D30\u0D02\u0D2D\u0D02 (\u0D05\u0D24\u0D4D\u0D24\u0D02)' },
  { month: 0, nakshatram: 'Thiruvonam', maxDay: 25, en: 'Onam (Thiruvonam)', ml: '\u0D13\u0D23\u0D02 (\u0D24\u0D3F\u0D30\u0D41\u0D35\u0D4B\u0D23\u0D02)' },
  { month: 8, day: 1, en: 'Vishu', ml: '\u0D35\u0D3F\u0D37\u0D41' },
  { month: 4, nakshatram: 'Thiruvathira', en: 'Thiruvathira', ml: '\u0D24\u0D3F\u0D30\u0D41\u0D35\u0D3E\u0D24\u0D3F\u0D30' },
  { month: 11, day: 1, en: 'Karkidaka Vavu month begins (Ramayana Masam)', ml: '\u0D30\u0D3E\u0D2E\u0D3E\u0D2F\u0D23 \u0D2E\u0D3E\u0D38\u0D02 \u0D06\u0D30\u0D02\u0D2D\u0D02' }
];

function getFestival(monthIndex, day, nakshatramEn) {
  return FESTIVALS.find(f =>
    f.month === monthIndex &&
    (f.maxDay === undefined || day <= f.maxDay) &&
    (f.day !== undefined ? f.day === day : f.nakshatram === nakshatramEn)
  ) || null;
}

function planetConstants(system) {
  const surya = system !== 'InPancasiddhantika';
  const sun = { YugaRotation: 4320000, Apogee: 77 + 17 / 60, MandaCircumference: 13 + 50 / 60 };
  const moon = { YugaRotation: 57753336, MandaCircumference: 31 + 50 / 60 };
  const starRotation = surya ? 1582237800 : 1582237828;
  const candrocca = { YugaRotation: surya ? 488219 : 488203 };
  const civilDays = starRotation - sun.YugaRotation;
  const synodicMonth = moon.YugaRotation - sun.YugaRotation;
  return { sun, moon, candrocca, yuga: { CivilDays: civilDays, SynodicMonth: synodicMonth } };
}

function meanLongitude(ahargana, rotation, civilDays) {
  return 360 * frac(rotation * ahargana / civilDays);
}

function mandaEquation(argument, circumference) {
  return Math.asin(circumference / 360 * Math.sin(argument / RAD)) * RAD;
}

function trueSolarLongitude(ahargana, p) {
  const mean = meanLongitude(ahargana, p.sun.YugaRotation, p.yuga.CivilDays);
  return zero360(mean - mandaEquation(mean - p.sun.Apogee, p.sun.MandaCircumference));
}

function trueLunarLongitude(ahargana, p) {
  const mean = meanLongitude(ahargana, p.moon.YugaRotation, p.yuga.CivilDays);
  const apogee = zero360(meanLongitude(ahargana, p.candrocca.YugaRotation, p.yuga.CivilDays) + 90);
  return zero360(mean - mandaEquation(mean - apogee, p.moon.MandaCircumference));
}

function eclipticLongitude(ahargana, p) {
  const d = Math.abs(trueLunarLongitude(ahargana, p) - trueSolarLongitude(ahargana, p));
  return d >= 180 ? 360 - d : d;
}

function threeRelation(l, c, r) {
  if (l < c && c < r) return 1;
  if (r < c && c < l) return -1;
  return 0;
}

function findConjunction(p, leftX, leftY, rightX, rightY) {
  const width = (rightX - leftX) / 2;
  const centreX = (rightX + leftX) / 2;
  if (width < EPS) return trueSolarLongitude(centreX, p);
  const centreY = eclipticLongitude(centreX, p);
  const rel = threeRelation(leftY, centreY, rightY);
  if (rel < 0) return findConjunction(p, centreX, centreY, rightX + width, eclipticLongitude(rightX + width, p));
  if (rel > 0) return findConjunction(p, leftX - width, eclipticLongitude(leftX - width, p), centreX, centreY);
  const l2 = leftX + width / 2, r2 = rightX - width / 2;
  return findConjunction(p, l2, eclipticLongitude(l2, p), r2, eclipticLongitude(r2, p));
}

function lastConjunctionLongitude(ahargana, tithi, p) {
  const synodic = p.yuga.CivilDays / p.yuga.SynodicMonth;
  const x = ahargana - tithi * (synodic / 30);
  return findConjunction(p, x - 2, eclipticLongitude(x - 2, p), x + 2, eclipticLongitude(x + 2, p));
}

function getMasaNum(trueSolarLong, lastConjLong) {
  let m = trunc(trueSolarLong / 30) % 12;
  if (m === trunc(lastConjLong / 30) % 12) m += 1;
  return (m + 12) % 12;
}

function getNaksatra(trueLunarLong) {
  return NAKSHATRA[trunc(trueLunarLong * 27 / 360)];
}

function getTithi(trueSolarLong, trueLunarLong) {
  return zero360(trueLunarLong - trueSolarLong) / 12;
}

function getDaylightEquation(year, latitude, ahargana, p) {
  const meanSolar = meanLongitude(ahargana, p.sun.YugaRotation, p.yuga.CivilDays);
  const sayanaMeanSolar = meanSolar + (54 / 3600) * (year - 499);
  const decl = Math.asin(Math.sin(sayanaMeanSolar / RAD) * Math.sin(24 / RAD)) * RAD;
  const x = Math.tan(latitude / RAD) * Math.tan(decl / RAD);
  return 0.5 * Math.asin(x) / Math.PI;
}

function getSauraMasaAndSauraDivasa(ahargana, desantara, p) {
  ahargana = trunc(ahargana);
  const tsToday = zero360(trueSolarLongitude(ahargana - desantara, p));
  const tsTomorrow = zero360(trueSolarLongitude(ahargana - desantara + 1, p));
  const today = tsToday - trunc(tsToday / 30) * 30;
  const tomorrow = tsTomorrow - trunc(tsTomorrow / 30) * 30;
  if (today > 25 && tomorrow < 5) {
    const tsTomorrowFull = trueSolarLongitude(ahargana + 1, p);
    const month = ((trunc(tsTomorrowFull / 30) % 12) + 12) % 12;
    return { sauraMasa: month, sauraDivasa: 1 };
  }
  const prev = getSauraMasaAndSauraDivasa(ahargana - 1, desantara, p);
  return { sauraMasa: prev.sauraMasa, sauraDivasa: prev.sauraDivasa + 1 };
}

function aharganaToKali(ahargana, p) {
  return trunc(ahargana * p.sun.YugaRotation / p.yuga.CivilDays);
}

function gregorianDateToJulianDay(date) {
  let year = date.getFullYear();
  let month = date.getMonth() + 1;
  const day = date.getDate();
  if (month < 3) { year -= 1; month += 12; }
  let jd = trunc(365.25 * year) + trunc(30.59 * (month - 2)) + day + 1721086.5;
  if (year < 0) {
    jd -= 1;
    if (year % 4 === 0 && month > 3) jd += 1;
  }
  if (jd >= 2299160) jd += trunc(year / 400) - trunc(year / 100) + 2;
  return jd;
}

function timeIntoFractionalDay(date) {
  return (date.getHours() * 60 + date.getMinutes()) / 1440;
}

function celestialPass(ahargana, year, longitude, latitude, p, timeFraction) {
  const desantara = (longitude - UJJAIN_LONGITUDE) / 360;
  let a = ahargana + timeFraction - desantara;
  a -= getDaylightEquation(year, latitude, a, p);

  const tsLong = trueSolarLongitude(a, p);
  const tlLong = trueLunarLongitude(a, p);
  const tithi = getTithi(tsLong, tlLong);
  const lastConjLong = lastConjunctionLongitude(a, tithi, p);
  const masaNum = getMasaNum(tsLong, lastConjLong);
  const kaliYear = aharganaToKali(a + (4 - masaNum) * 30, p);
  const { sauraMasa, sauraDivasa } = getSauraMasaAndSauraDivasa(a, desantara, p);

  return { sakaYear: kaliYear - 3179, masaNum, sauraMasa, sauraDivasa, naksatra: getNaksatra(tlLong) };
}

function fromGregorian(date, settings) {
  const p = planetConstants(settings.system);
  const year = date.getFullYear();
  const ahargana = gregorianDateToJulianDay(date) - 588465.5;

  const atDawn = celestialPass(ahargana, year, settings.longitude, settings.latitude, p, 0.25);
  const atTime = celestialPass(ahargana, year, settings.longitude, settings.latitude, p, timeIntoFractionalDay(date));

  const malayalaMasa = (atDawn.sauraMasa - 4 + 12) % 12;
  const malayalamYear = atDawn.sakaYear - 747 + trunc((atDawn.masaNum - malayalaMasa + 12) / 12);

  return { year: malayalamYear, month: malayalaMasa + 1, date: atDawn.sauraDivasa, naksatra: atTime.naksatra };
}

function getMalayalamDate(date = new Date(), options = {}) {
  const settings = {
    system: options.system || 'SuryaSiddhanta',
    latitude: options.latitude !== undefined ? options.latitude : 10.5276,
    longitude: options.longitude !== undefined ? options.longitude : 76.2144
  };

  const r = fromGregorian(date, settings);
  const masa = MASA[r.month - 1];
  const festival = getFestival(r.month - 1, r.date, r.naksatra.en);

  return {
    year: r.year,
    month: masa.ml,
    monthEn: masa.en,
    date: r.date,
    nakshatram: r.naksatra.ml,
    nakshatramEn: r.naksatra.en,
    festival: festival ? festival.ml : null,
    festivalEn: festival ? festival.en : null,
    formatted: `${r.date} ${masa.ml} ${r.year} (${r.naksatra.ml})` + (festival ? ` \u2013 ${festival.ml}` : '')
  };
}

module.exports = { getMalayalamDate };
