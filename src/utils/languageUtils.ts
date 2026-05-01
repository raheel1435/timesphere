// ─────────────────────────────────────────────────────────────────────────────
// src/utils/languageUtils.ts
//
// Provides:
//   1. A list of all supported language/country options with flags and TTS codes
//   2. A function that converts a time into a spoken phrase for any language
//   3. A function that uses the browser's Web Speech API to say text aloud
//
// WEB SPEECH API (text-to-speech):
//   Built into all modern browsers — no external service needed, completely free.
//   speechSynthesis.speak(utterance) says the text out loud.
//   We set utterance.lang to tell the browser WHICH language accent to use.
// ─────────────────────────────────────────────────────────────────────────────

import type { LanguageOption } from "../types"; // import our language option shape
import { getEnglishPhrase, getSweTime } from "./timeUtils";

// ─── Supported languages ──────────────────────────────────────────────────────
// Each entry: code = BCP-47 language tag, country, language name, emoji flag, IANA timezone
export const LANGUAGES: LanguageOption[] = [
  { code: "sv-SE", country: "Sweden",       language: "Swedish",         flag: "🇸🇪", tz: "Europe/Stockholm"   },
  { code: "en-GB", country: "UK",           language: "British English",  flag: "🇬🇧", tz: "Europe/London"      },
  { code: "en-US", country: "USA",          language: "American English", flag: "🇺🇸", tz: "America/New_York"   },
  { code: "ar-SA", country: "Saudi Arabia", language: "Arabic",           flag: "🇸🇦", tz: "Asia/Riyadh"        },
  { code: "ur-PK", country: "Pakistan",     language: "Urdu",             flag: "🇵🇰", tz: "Asia/Karachi"       },
  { code: "da-DK", country: "Denmark",      language: "Danish",           flag: "🇩🇰", tz: "Europe/Copenhagen"  },
  { code: "de-DE", country: "Germany",      language: "German",           flag: "🇩🇪", tz: "Europe/Berlin"      },
  { code: "fr-FR", country: "France",       language: "French",           flag: "🇫🇷", tz: "Europe/Paris"       },
  { code: "es-ES", country: "Spain",        language: "Spanish",          flag: "🇪🇸", tz: "Europe/Madrid"      },
  { code: "tr-TR", country: "Turkey",       language: "Turkish",          flag: "🇹🇷", tz: "Europe/Istanbul"    },
  { code: "hi-IN", country: "India",        language: "Hindi",            flag: "🇮🇳", tz: "Asia/Kolkata"       },
  { code: "zh-CN", country: "China",        language: "Chinese",          flag: "🇨🇳", tz: "Asia/Shanghai"      },
  { code: "ja-JP", country: "Japan",        language: "Japanese",         flag: "🇯🇵", tz: "Asia/Tokyo"         },
  { code: "ko-KR", country: "Korea",        language: "Korean",           flag: "🇰🇷", tz: "Asia/Seoul"         },
  { code: "ru-RU", country: "Russia",       language: "Russian",          flag: "🇷🇺", tz: "Europe/Moscow"      },
  { code: "pt-BR", country: "Brazil",       language: "Portuguese",       flag: "🇧🇷", tz: "America/Sao_Paulo"  },
  { code: "nl-NL", country: "Netherlands",  language: "Dutch",            flag: "🇳🇱", tz: "Europe/Amsterdam"   },
  { code: "fi-FI", country: "Finland",      language: "Finnish",          flag: "🇫🇮", tz: "Europe/Helsinki"    },
  { code: "no-NO", country: "Norway",       language: "Norwegian",        flag: "🇳🇴", tz: "Europe/Oslo"        },
  { code: "pl-PL", country: "Poland",       language: "Polish",           flag: "🇵🇱", tz: "Europe/Warsaw"      },
];

// ─── Get time phrase for a specific language ──────────────────────────────────
// Returns the time as a spoken phrase in the selected language.
// For most languages we fall back to the English phrase but spoken in that accent.
// For Swedish we use the full Swedish phrase system.
// HH:MM in 24h — used as the sub line for every language
function fmt24(h: number, m: number): string {
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function getTimePhrase(
  hours24:  number,        // current hour in 24h format
  minutes:  number,        // current minutes
  langCode: string         // BCP-47 code e.g. "sv-SE", "ar-SA"
): { main: string; sub: string } {
  const base = langCode.split("-")[0];
  const sub  = fmt24(hours24, minutes); // always 24h digital e.g. "15:30"

  switch (base) {
    case "sv": return { main: getSweTime(hours24, minutes),          sub };
    case "da": return { main: getDanishPhrase(hours24, minutes),     sub };
    case "de": return { main: getGermanPhrase(hours24, minutes),     sub };
    case "fr": return { main: getFrenchPhrase(hours24, minutes),     sub };
    case "ar": return { main: getArabicPhrase(hours24, minutes),     sub };
    case "es": return { main: getSpanishPhrase(hours24, minutes),    sub };
    case "pt": return { main: getPortuguesePhrase(hours24, minutes), sub };
    case "nl": return { main: getDutchPhrase(hours24, minutes),      sub };
    case "ru": return { main: getRussianPhrase(hours24, minutes),    sub };
    case "fi": return { main: getFinnishPhrase(hours24, minutes),    sub };
    case "no": return { main: getNorwegianPhrase(hours24, minutes),  sub };
    case "pl": return { main: getPolishPhrase(hours24, minutes),     sub };
    case "tr": return { main: getTurkishPhrase(hours24, minutes),    sub };
    case "hi": return { main: getHindiPhrase(hours24, minutes),      sub };
    case "ur": return { main: getUrduPhrase(hours24, minutes),       sub };
    case "zh": return { main: getChinesePhrase(hours24, minutes),    sub };
    case "ja": return { main: getJapanesePhrase(hours24, minutes),   sub };
    case "ko": return { main: getKoreanPhrase(hours24, minutes),     sub };
    default:   return { main: getEnglishPhrase(hours24, minutes),    sub };
  }
}

// ─── Danish time phrase ───────────────────────────────────────────────────────
function getDanishPhrase(h24: number, m: number): string {
  const da24 = ["nul","et","to","tre","fire","fem","seks","syv","otte","ni","ti","elleve","tolv",
                "tretten","fjorten","femten","seksten","sytten","atten","nitten","tyve","enogtyve","toogtyve","treogtyve"];
  const cur = da24[h24], next = da24[(h24 + 1) % 24];
  if (m === 0)  return `Klokken er ${cur}`;
  if (m === 15) return `Kvart over ${cur}`;
  if (m === 30) return `Halv ${next}`;
  if (m === 45) return `Kvart i ${next}`;
  if (m < 30)   return `${m} minutter over ${cur}`;
  return               `${60-m} minutter i ${next}`;
}

// ─── German time phrase ───────────────────────────────────────────────────────
function getGermanPhrase(h24: number, m: number): string {
  const de24 = ["null","ein","zwei","drei","vier","fünf","sechs","sieben","acht","neun","zehn","elf","zwölf",
                "dreizehn","vierzehn","fünfzehn","sechzehn","siebzehn","achtzehn","neunzehn","zwanzig","einundzwanzig","zweiundzwanzig","dreiundzwanzig"];
  const cur = de24[h24], next = de24[(h24 + 1) % 24];
  if (m === 0)  return `Es ist ${cur} Uhr`;
  if (m === 15) return `Viertel nach ${cur}`;
  if (m === 30) return `Halb ${next}`;
  if (m === 45) return `Viertel vor ${next}`;
  if (m < 30)   return `${m} nach ${cur}`;
  return               `${60-m} vor ${next}`;
}

// ─── French time phrase ───────────────────────────────────────────────────────
function getFrenchPhrase(h24: number, m: number): string {
  const fr24 = ["zéro","une","deux","trois","quatre","cinq","six","sept","huit","neuf","dix","onze","douze",
                "treize","quatorze","quinze","seize","dix-sept","dix-huit","dix-neuf","vingt","vingt et une","vingt-deux","vingt-trois"];
  const nh   = (h24 + 1) % 24;
  const cur  = fr24[h24], next = fr24[nh];
  const s    = (n: number) => n !== 1 ? "s" : "";
  if (m === 0)  return `Il est ${cur} heure${s(h24)}`;
  if (m === 15) return `Il est ${cur} heure${s(h24)} et quart`;
  if (m === 30) return `Il est ${cur} heure${s(h24)} et demie`;
  if (m === 45) return `Il est ${next} heure${s(nh)} moins le quart`;
  if (m < 30)   return `Il est ${cur} heure${s(h24)} ${m}`;
  return               `Il est ${next} heure${s(nh)} moins ${60-m}`;
}

// ─── Arabic time phrase ───────────────────────────────────────────────────────
function getArabicPhrase(h24: number, m: number): string {
  const ar24 = ["منتصف الليل","الواحدة","الثانية","الثالثة","الرابعة","الخامسة","السادسة","السابعة","الثامنة","التاسعة","العاشرة","الحادية عشرة","الثانية عشرة",
                "الثالثة عشرة","الرابعة عشرة","الخامسة عشرة","السادسة عشرة","السابعة عشرة","الثامنة عشرة","التاسعة عشرة","العشرون","الحادية والعشرون","الثانية والعشرون","الثالثة والعشرون"];
  const cur  = ar24[h24];
  const next = ar24[(h24 + 1) % 24];
  if (m === 0)  return `الساعة ${cur}`;
  if (m === 15) return `${cur} والربع`;
  if (m === 30) return `${cur} والنصف`;
  if (m === 45) return `${next} إلا ربعاً`;
  if (m < 30)   return `${cur} و${m} دقيقة`;
  return               `${next} إلا ${60-m} دقيقة`;
}

// ─── Spanish time phrase ─────────────────────────────────────────────────────
function getSpanishPhrase(h24: number, m: number): string {
  const sp24 = ["medianoche","una","dos","tres","cuatro","cinco","seis","siete","ocho","nueve","diez","once","doce",
                "trece","catorce","quince","dieciséis","diecisiete","dieciocho","diecinueve","veinte","veintiuna","veintidós","veintitrés"];
  const nh   = (h24 + 1) % 24;
  const cur  = sp24[h24];
  const next = sp24[nh];
  const es   = h24 === 1 ? "Es la"  : "Son las";
  const esN  = nh  === 1 ? "Es la"  : "Son las";
  if (m === 0 && h24 === 0) return `Es medianoche`;
  if (m === 0)  return `${es} ${cur}`;
  if (m === 15) return `${es} ${cur} y cuarto`;
  if (m === 30) return `${es} ${cur} y media`;
  if (m === 45) return `${esN} ${next} menos cuarto`;
  if (m < 30)   return `${es} ${cur} y ${m}`;
  return               `${esN} ${next} menos ${60 - m}`;
}

// ─── Portuguese (Brazilian) time phrase ──────────────────────────────────────
function getPortuguesePhrase(h24: number, m: number): string {
  const pt24 = ["meia-noite","uma","duas","três","quatro","cinco","seis","sete","oito","nove","dez","onze","doze",
                "treze","quatorze","quinze","dezesseis","dezessete","dezoito","dezenove","vinte","vinte e uma","vinte e duas","vinte e três"];
  const nh   = (h24 + 1) % 24;
  const cur  = pt24[h24];
  const next = pt24[nh];
  const e    = h24 === 1 ? "É"   : "São";
  const eN   = nh  === 1 ? "É"   : "São";
  if (m === 0 && h24 === 0) return `É meia-noite`;
  if (m === 0)  return `${e} ${cur} hora${h24 !== 1 ? "s" : ""}`;
  if (m === 15) return `${cur} e um quarto`;
  if (m === 30) return `${cur} e meia`;
  if (m === 45) return `${eN} ${next} menos um quarto`;
  if (m < 30)   return `${cur} e ${m} minutos`;
  return               `${eN} ${next} menos ${60 - m}`;
}

// ─── Dutch time phrase ────────────────────────────────────────────────────────
function getDutchPhrase(h24: number, m: number): string {
  const nl24 = ["nul","één","twee","drie","vier","vijf","zes","zeven","acht","negen","tien","elf","twaalf",
                "dertien","veertien","vijftien","zestien","zeventien","achttien","negentien","twintig","eenentwintig","tweeëntwintig","drieëntwintig"];
  const nh   = (h24 + 1) % 24;
  const cur  = nl24[h24];
  const next = nl24[nh];
  if (m === 0)  return `Het is ${cur} uur`;
  if (m === 15) return `Kwart over ${cur}`;
  if (m === 30) return `Half ${next}`;
  if (m === 45) return `Kwart voor ${next}`;
  if (m < 30)   return `${m} minuten over ${cur}`;
  return               `${60 - m} minuten voor ${next}`;
}

// ─── Russian time phrase ──────────────────────────────────────────────────────
function getRussianPhrase(h24: number, m: number): string {
  const ru24 = ["ноль","один","два","три","четыре","пять","шесть","семь","восемь","девять","десять","одиннадцать","двенадцать",
                "тринадцать","четырнадцать","пятнадцать","шестнадцать","семнадцать","восемнадцать","девятнадцать","двадцать","двадцать один","двадцать два","двадцать три"];
  const ruGen = ["нулевого","первого","второго","третьего","четвёртого","пятого","шестого","седьмого","восьмого","девятого","десятого","одиннадцатого","двенадцатого",
                 "тринадцатого","четырнадцатого","пятнадцатого","шестнадцатого","семнадцатого","восемнадцатого","девятнадцатого","двадцатого","двадцать первого","двадцать второго","двадцать третьего"];
  const nh   = (h24 + 1) % 24;
  const min  = m === 1 ? "минута" : m < 5 ? "минуты" : "минут";
  if (m === 0)  return `Сейчас ${ru24[h24]} часов`;
  if (m === 15) return `Четверть ${ruGen[nh]}`;
  if (m === 30) return `Половина ${ruGen[nh]}`;
  if (m === 45) return `Без четверти ${ru24[nh]}`;
  if (m < 30)   return `${ru24[h24]} ${m} ${min}`;
  return               `Без ${60 - m} ${min} ${ru24[nh]}`;
}

// ─── Finnish time phrase ──────────────────────────────────────────────────────
function getFinnishPhrase(h24: number, m: number): string {
  const fi24 = ["nolla","yksi","kaksi","kolme","neljä","viisi","kuusi","seitsemän","kahdeksan","yhdeksän","kymmenen","yksitoista","kaksitoista",
                "kolmetoista","neljätoista","viisitoista","kuusitoista","seitsemäntoista","kahdeksantoista","yhdeksäntoista","kaksikymmentä","kaksikymmentäyksi","kaksikymmentäkaksi","kaksikymmentäkolme"];
  const nh   = (h24 + 1) % 24;
  const cur  = fi24[h24];
  const next = fi24[nh];
  if (m === 0)  return `Kello on ${cur}`;
  if (m === 15) return `Vartti yli ${cur}`;
  if (m === 30) return `Puoli ${next}`;
  if (m === 45) return `Vartti vaille ${next}`;
  if (m < 30)   return `${m} minuuttia yli ${cur}`;
  return               `${60 - m} minuuttia vaille ${next}`;
}

// ─── Norwegian time phrase ────────────────────────────────────────────────────
function getNorwegianPhrase(h24: number, m: number): string {
  const no24 = ["null","ett","to","tre","fire","fem","seks","syv","åtte","ni","ti","elleve","tolv",
                "tretten","fjorten","femten","seksten","sytten","atten","nitten","tjue","tjueen","tjueto","tjuetre"];
  const nh   = (h24 + 1) % 24;
  const cur  = no24[h24];
  const next = no24[nh];
  if (m === 0)  return `Klokken er ${cur}`;
  if (m === 15) return `Kvart over ${cur}`;
  if (m === 30) return `Halv ${next}`;
  if (m === 45) return `Kvart på ${next}`;
  if (m < 30)   return `${m} minutter over ${cur}`;
  return               `${60 - m} minutter på ${next}`;
}

// ─── Polish time phrase ───────────────────────────────────────────────────────
function getPolishPhrase(h24: number, m: number): string {
  const plOrd = ["zero","pierwsza","druga","trzecia","czwarta","piąta","szósta","siódma","ósma","dziewiąta","dziesiąta","jedenasta","dwunasta",
                 "trzynasta","czternasta","piętnasta","szesnasta","siedemnasta","osiemnasta","dziewiętnasta","dwudziesta","dwudziesta pierwsza","dwudziesta druga","dwudziesta trzecia"];
  const plGen = ["zerowej","pierwszej","drugiej","trzeciej","czwartej","piątej","szóstej","siódmej","ósmej","dziewiątej","dziesiątej","jedenastej","dwunastej",
                 "trzynastej","czternastej","piętnastej","szesnastej","siedemnastej","osiemnastej","dziewiętnastej","dwudziestej","dwudziestej pierwszej","dwudziestej drugiej","dwudziestej trzeciej"];
  const nh    = (h24 + 1) % 24;
  if (m === 0)  return `Godzina ${plOrd[h24]}`;
  if (m === 15) return `Kwadrans po ${plGen[h24]}`;
  if (m === 30) return `Wpół do ${plGen[nh]}`;
  if (m === 45) return `Za kwadrans ${plOrd[nh]}`;
  if (m < 30)   return `${m} minut po ${plGen[h24]}`;
  return               `Za ${60 - m} minut ${plOrd[nh]}`;
}

// ─── Turkish time phrase ──────────────────────────────────────────────────────
function getTurkishPhrase(h24: number, m: number): string {
  const tr24 = ["sıfır","bir","iki","üç","dört","beş","altı","yedi","sekiz","dokuz","on","on bir","on iki",
                "on üç","on dört","on beş","on altı","on yedi","on sekiz","on dokuz","yirmi","yirmi bir","yirmi iki","yirmi üç"];
  const trAcc = ["sıfırı","biri","ikiyi","üçü","dördü","beşi","altıyı","yediyi","sekizi","dokuzu","onu","on biri","on ikiyi",
                 "on üçü","on dördü","on beşi","on altıyı","on yediyi","on sekizi","on dokuzu","yirmiyi","yirmi biri","yirmi ikiyi","yirmi üçü"];
  const trDat = ["sıfıra","bire","ikiye","üçe","dörde","beşe","altıya","yediye","sekize","dokuza","ona","on bire","on ikiye",
                 "on üçe","on dörde","on beşe","on altıya","on yediye","on sekize","on dokuza","yirmiye","yirmi bire","yirmi ikiye","yirmi üçe"];
  const nh   = (h24 + 1) % 24;
  if (m === 0)  return `Saat ${tr24[h24]}`;
  if (m === 15) return `${trAcc[h24]} çeyrek geçiyor`;
  if (m === 30) return `${trAcc[h24]} otuz geçiyor`;
  if (m === 45) return `${trDat[nh]} çeyrek var`;
  if (m < 30)   return `${trAcc[h24]} ${m} geçiyor`;
  return               `${trDat[nh]} ${60 - m} var`;
}

// ─── Hindi time phrase ────────────────────────────────────────────────────────
function getHindiPhrase(h24: number, m: number): string {
  const hi24 = ["शून्य","एक","दो","तीन","चार","पाँच","छह","सात","आठ","नौ","दस","ग्यारह","बारह",
                "तेरह","चौदह","पंद्रह","सोलह","सत्रह","अठारह","उन्नीस","बीस","इक्कीस","बाईस","तेईस"];
  const nh   = (h24 + 1) % 24;
  const cur  = hi24[h24];
  const next = hi24[nh];
  if (m === 0)  return `${cur} बजे`;
  if (m === 15) return `सवा ${cur}`;
  if (m === 30) return `साढ़े ${cur}`;
  if (m === 45) return `पौने ${next}`;
  if (m < 30)   return `${cur} बजकर ${m} मिनट`;
  return               `${next} बजने में ${60 - m} मिनट`;
}

// ─── Urdu time phrase ─────────────────────────────────────────────────────────
function getUrduPhrase(h24: number, m: number): string {
  const ur24 = ["صفر","ایک","دو","تین","چار","پانچ","چھ","سات","آٹھ","نو","دس","گیارہ","بارہ",
                "تیرہ","چودہ","پندرہ","سولہ","سترہ","اٹھارہ","انیس","بیس","اکیس","بائیس","تئیس"];
  const nh   = (h24 + 1) % 24;
  const cur  = ur24[h24];
  const next = ur24[nh];
  if (m === 0)  return `${cur} بجے`;
  if (m === 15) return `سوا ${cur}`;
  if (m === 30) return `ساڑھے ${cur}`;
  if (m === 45) return `پونے ${next}`;
  if (m < 30)   return `${cur} بج کر ${m} منٹ`;
  return               `${next} بجنے میں ${60 - m} منٹ`;
}

// ─── Chinese time phrase ──────────────────────────────────────────────────────
function getChinesePhrase(h24: number, m: number): string {
  const zh = ["零","一","二","三","四","五","六","七","八","九","十","十一","十二",
              "十三","十四","十五","十六","十七","十八","十九","二十","二十一","二十二","二十三"];
  const zm = (n: number) => n < 10 ? `零${zh[n]}` : `${zh[Math.floor(n/10) === 1 ? 10 : Math.floor(n/10)]}${n%10 ? zh[n%10] : ""}`;
  if (m === 0)  return `现在是${zh[h24]}点整`;
  if (m === 30) return `${zh[h24]}点半`;
  return `${zh[h24]}点${zm(m)}分`;
}

// ─── Japanese time phrase ─────────────────────────────────────────────────────
function getJapanesePhrase(h24: number, m: number): string {
  const ja = ["零","一","二","三","四","五","六","七","八","九","十","十一","十二",
              "十三","十四","十五","十六","十七","十八","十九","二十","二十一","二十二","二十三"];
  function minJa(n: number): string {
    if (n === 0)  return "";
    if (n < 10)   return `零${ja[n]}分`;
    if (n === 10) return "十分";
    if (n < 20)   return `十${ja[n % 10]}分`;
    if (n === 20) return "二十分";
    if (n < 30)   return `二十${ja[n % 10]}分`;
    if (n === 30) return "三十分";
    if (n < 40)   return `三十${ja[n % 10]}分`;
    if (n === 40) return "四十分";
    if (n < 50)   return `四十${ja[n % 10]}分`;
    if (n === 50) return "五十分";
    return `五十${ja[n % 10]}分`;
  }
  if (m === 0)  return `${ja[h24]}時です`;
  if (m === 30) return `${ja[h24]}時半です`;
  return `${ja[h24]}時${minJa(m)}です`;
}

// ─── Korean time phrase ───────────────────────────────────────────────────────
function getKoreanPhrase(h24: number, m: number): string {
  // Native Korean for hours 1–12
  const koH12 = ["","한","두","세","네","다섯","여섯","일곱","여덟","아홉","열","열한","열두"];
  // Sino-Korean for hours 13–23
  const koH24 = ["영","일","이","삼","사","오","육","칠","팔","구","십","십일","십이",
                 "십삼","십사","십오","십육","십칠","십팔","십구","이십","이십일","이십이","이십삼"];
  // Sino-Korean for minutes
  const koM   = ["","일","이","삼","사","오","육","칠","팔","구","십","십일","십이","십삼","십사","십오",
                 "십육","십칠","십팔","십구","이십","이십일","이십이","이십삼","이십사","이십오",
                 "이십육","이십칠","이십팔","이십구","삼십","삼십일","삼십이","삼십삼","삼십사","삼십오",
                 "삼십육","삼십칠","삼십팔","삼십구","사십","사십일","사십이","사십삼","사십사","사십오",
                 "사십육","사십칠","사십팔","사십구","오십","오십일","오십이","오십삼","오십사","오십오",
                 "오십육","오십칠","오십팔","오십구"];
  const hWord = h24 <= 12 ? koH12[h24] : koH24[h24];
  if (m === 0) return `${hWord} 시입니다`;
  return `${hWord} 시 ${koM[m]} 분입니다`;
}

// ─── Text-to-speech ───────────────────────────────────────────────────────────
// Picks the best available voice for the language (prefers Google/neural voices),
// then speaks the text. Voices load asynchronously on some browsers, so we wait
// for the voiceschanged event if the list is empty on the first call.
export function speakText(text: string, langCode: string): void {
  if (!("speechSynthesis" in window)) return;

  window.speechSynthesis.cancel();

  function bestVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
    const base = langCode.split("-")[0];
    const matches = voices.filter(v => v.lang.startsWith(base));
    if (matches.length === 0) return null;
    // Prefer higher-quality voices by name keywords
    return (
      matches.find(v => /google|neural|enhanced|premium|natural/i.test(v.name)) ??
      matches.find(v => !v.localService) ?? // online voices tend to be better
      matches[0]
    );
  }

  function speak(voices: SpeechSynthesisVoice[]) {
    const utt  = new SpeechSynthesisUtterance(text);
    utt.lang   = langCode;
    utt.rate   = 0.88;
    utt.pitch  = 1.0;
    utt.volume = 1.0;
    const voice = bestVoice(voices);
    if (voice) utt.voice = voice;
    window.speechSynthesis.speak(utt);
  }

  const voices = window.speechSynthesis.getVoices();
  if (voices.length > 0) {
    speak(voices);
  } else {
    // Voices not yet loaded — wait for the event then speak once
    window.speechSynthesis.onvoiceschanged = () => {
      window.speechSynthesis.onvoiceschanged = null;
      speak(window.speechSynthesis.getVoices());
    };
  }
}
