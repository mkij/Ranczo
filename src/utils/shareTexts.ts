type ShareTextPool = {
  withPercent: string[];
  challenge: string[];
  selfIronic: string[];
  noPercent: string[];
  storyline: string[];
};

const TEXTS: Record<string, ShareTextPool> = {
  tourist: {
    withPercent: [
      'Ranczo Quiz mnie pokonał... {percent}% 😄',
      'No cóż, {percent}%... muszę nadrobić odcinki 😄',
    ],
    challenge: [
      '{percent}% - ale na pewno nie jestem ostatni! Kto spróbuje?',
      'Tylko {percent}%... kto udowodni że jest lepszy?',
    ],
    selfIronic: [
      'Chyba oglądałem inne Ranczo 😄',
      'Wilkowyje? A gdzie to jest? 😄',
    ],
    noPercent: [
      'Turysta w Wilkowyjach 🗺️ A Ty który masz poziom?',
    ],
    storyline: [
      'Dopiero przyjechałem do Wilkowyj... i chyba się zgubiłem 😄',
    ],
  },
  newInTown: {
    withPercent: [
      'Dopiero się wdrażam w życie Wilkowyj - {percent}% 😄',
      '{percent}% w Quizie z Rancza - jeszcze się odegramy!',
    ],
    challenge: [
      '{percent}% - świeżak w gminie! Kto mnie przebije?',
      'Nowy w gminie z {percent}%... kto pokaże jak się gra?',
    ],
    selfIronic: [
      'Podobno znam Ranczo... quiz mówi co innego 😄',
      'Moja wiedza o Wilkowyjach wymaga remontu 😄',
    ],
    noPercent: [
      'Nowy w gminie 🚗 A Ty który masz poziom?',
    ],
    storyline: [
      'Właśnie się wprowadziłem do Wilkowyj... sąsiedzi patrzą podejrzliwie 😄',
    ],
  },
  resident: {
    withPercent: [
      'Mieszkaniec Wilkowyj - {percent}% w Quizie z Rancza!',
      'Znam Ranczo lepiej niż myślałem 😄 {percent}%!',
    ],
    challenge: [
      '{percent}% 😄 Który mieszkaniec gminy zrobi lepiej?',
      'Mieszkaniec z {percent}% - kto podważy mój wynik?',
    ],
    selfIronic: [
      'Niby oglądam od lat, a i tak {percent}%... 😄',
    ],
    noPercent: [
      'Mieszkaniec Wilkowyj 🏡 A Ty który masz poziom?',
    ],
    storyline: [
      'Meldunek w Wilkowyjach potwierdzony - {percent}% 😄',
    ],
  },
  benchRegular: {
    withPercent: [
      'Stały bywalec ławeczki 🪑 {percent}% w Quizie z Rancza!',
      'Ławeczka jest moja - {percent}% poprawnych! A Ty?',
    ],
    challenge: [
      '{percent}% 😄 Kto z ławeczki zrobi więcej?',
      'Siedzę na ławeczce z {percent}%... jest odważny?',
    ],
    selfIronic: [
      'Na ławeczce jeszcze nikt mnie nie przegonił 😄',
    ],
    noPercent: [
      'Stały bywalec ławeczki 🪑 A Ty który masz poziom?',
    ],
    storyline: [
      'Ławeczka zajęta - zasiadam z wynikiem {percent}% 😄',
    ],
  },
  councilMember: {
    withPercent: [
      'Radny gminy - {percent}% w Quizie z Rancza! Kto da więcej?',
      'Prawie wszystko wiem o Wilkowyjach 😄 {percent}%!',
    ],
    challenge: [
      '{percent}% - kto z rady gminy zrobi lepiej? 😄',
      'Radny z {percent}%... jest pretendent do fotela wójta?',
    ],
    selfIronic: [
      'Zasiadam w radzie ale do wójta jeszcze daleko 😄',
    ],
    noPercent: [
      'Radny gminy 🏛️ A Ty który masz poziom?',
    ],
    storyline: [
      'Zasiadam w radzie gminy z wynikiem {percent}% 😄',
    ],
  },
  mayor: {
    withPercent: [
      'Wójt Wilkowyj - {percent}%! Wilkowyje to mój drugi dom 😎',
      'Quiz z Rancza zaliczony na {percent}% 😎 Ktoś mnie podważy?',
    ],
    challenge: [
      '{percent}% - sprawdzam kto jest prawdziwym Wójtem Wilkowyj 😎',
      '{percent}%... fotel wójta jest mój! Kto się odważy? 😎',
    ],
    selfIronic: [
      'Wójt musi wiedzieć wszystko... i chyba wie 😎',
    ],
    noPercent: [
      'Wójt Wilkowyj 👑 A Ty który masz poziom?',
    ],
    storyline: [
      'Urząd gminy ogarnięty na {percent}% 😎',
    ],
  },
};

const DAILY_TEXTS = [
  'Dzisiejszy Quiz Dnia z Rancza: {percent}% ✅ Jutro znowu gram!',
  'Quiz Dnia zaliczony 😄 Gram codziennie - kto dołącza?',
  'Quiz Dnia: {percent}% - codziennie bliżej fotela wójta 😄',
];

const SUFFIX = '\n\nSprawdź się w Quizie Ranczo!';

function getLevelKey(percent: number): string {
  if (percent >= 95) return 'mayor';
  if (percent >= 80) return 'councilMember';
  if (percent >= 65) return 'benchRegular';
  if (percent >= 45) return 'resident';
  if (percent >= 25) return 'newInTown';
  return 'tourist';
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function getShareText(percent: number, isDaily: boolean): string {
  if (isDaily) {
    const text = pickRandom(DAILY_TEXTS).replace('{percent}', String(percent));
    return text + SUFFIX;
  }

  const levelKey = getLevelKey(percent);
  const pool = TEXTS[levelKey];

  // Combine all text types into one pool and pick random
  const allTexts = [
    ...pool.withPercent,
    ...pool.challenge,
    ...pool.selfIronic,
    ...pool.noPercent,
    ...pool.storyline,
  ];

  const text = pickRandom(allTexts).replace('{percent}', String(percent));
  return text + SUFFIX;
}