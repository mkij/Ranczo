export interface FanRank {
  points: number;
  title: string;
  emoji: string;
}

export const FAN_RANKS: FanRank[] = [
  { points: 0,    title: 'Turysta w Wilkowyjach',    emoji: '🧳' },
  { points: 100,  title: 'Gość u Lucy',              emoji: '🚶' },
  { points: 250,  title: 'Bywalec u Japycza',        emoji: '🍺' },
  { points: 500,  title: 'Stały bywalec ławeczki',   emoji: '🪑' },
  { points: 900,  title: 'Mieszkaniec Wilkowyj',     emoji: '🏡' },
  { points: 1400, title: 'Pracownik urzędu gminy',   emoji: '📋' },
  { points: 2000, title: 'Stażysta u wójta',         emoji: '🖊️' },
  { points: 2700, title: 'Sekretarz gminy',          emoji: '📑' },
  { points: 3500, title: 'Zastępca wójta',           emoji: '🤝' },
  { points: 4500, title: 'Radny gminy',              emoji: '🏛️' },
  { points: 6000, title: 'Prawa ręka wójta',         emoji: '⭐' },
  { points: 8000, title: 'Wójt Wilkowyj',            emoji: '👑' },
];

export function getCurrentRank(totalPoints: number): FanRank {
  let current = FAN_RANKS[0];
  for (const rank of FAN_RANKS) {
    if (totalPoints >= rank.points) {
      current = rank;
    } else {
      break;
    }
  }
  return current;
}

export function getNextRank(totalPoints: number): FanRank | null {
  for (const rank of FAN_RANKS) {
    if (totalPoints < rank.points) {
      return rank;
    }
  }
  return null;
}

export function getPointsToNext(totalPoints: number): number {
  const next = getNextRank(totalPoints);
  if (!next) return 0;
  return next.points - totalPoints;
}

export function getProgressPercent(totalPoints: number): number {
  const current = getCurrentRank(totalPoints);
  const next = getNextRank(totalPoints);
  if (!next) return 100;
  const range = next.points - current.points;
  const progress = totalPoints - current.points;
  return Math.round((progress / range) * 100);
}

export const DAILY_BONUS = 5;