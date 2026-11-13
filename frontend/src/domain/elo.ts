import type { Match, SkillLevel, TournamentRegistration } from './types';

export const ELO_K_FACTOR = 24;
export const ELO_START_RATING: Record<SkillLevel, number> = {
  'Mới bắt đầu': 1300,
  'Cơ bản': 1400,
  'Trung cấp': 1500,
  'Nâng cao': 1600,
};

const DEFAULT_RATING = 1400;

export interface EloEntry {
  registrationId: string;
  rating: number;
  played: number;
  wins: number;
  losses: number;
}

export type PredictionConfidence = 'thấp' | 'trung bình' | 'cao';

export interface MatchPrediction {
  matchId: string;
  winA: number;
  winB: number;
  ratingA: number;
  ratingB: number;
  favoriteRegistrationId: string;
  underdogRegistrationId: string;
  confidence: PredictionConfidence;
  confidenceScore: number;
  reason: string;
}

function startRating(registration: TournamentRegistration | undefined) {
  return registration?.skillLevel ? ELO_START_RATING[registration.skillLevel] : DEFAULT_RATING;
}

function expectedScore(ratingA: number, ratingB: number) {
  return 1 / (1 + 10 ** ((ratingB - ratingA) / 400));
}

function completedMatches(matches: Match[], excludeMatchId?: string) {
  return matches
    .filter(
      (match) =>
        match.id !== excludeMatchId &&
        !match.isBye &&
        match.winnerRegistrationId != null &&
        match.participantARegistrationId != null &&
        match.participantBRegistrationId != null &&
        match.scoreA != null &&
        match.scoreB != null,
    )
    .sort(
      (left, right) =>
        left.roundIndex - right.roundIndex ||
        (left.scheduledTime ?? '').localeCompare(right.scheduledTime ?? '') ||
        left.matchIndex - right.matchIndex,
    );
}

/** Tính Elo hiện tại của từng lượt đăng ký, dựa trên các trận đã có tỷ số. */
export function buildRatings(
  registrations: TournamentRegistration[],
  matches: Match[],
  excludeMatchId?: string,
): Map<string, EloEntry> {
  const registrationById = new Map(registrations.map((registration) => [registration.id, registration]));
  const ratings = new Map<string, EloEntry>();

  const entryFor = (registrationId: string): EloEntry => {
    const existing = ratings.get(registrationId);
    if (existing) return existing;
    const created: EloEntry = {
      registrationId,
      rating: startRating(registrationById.get(registrationId)),
      played: 0,
      wins: 0,
      losses: 0,
    };
    ratings.set(registrationId, created);
    return created;
  };

  registrations.forEach((registration) => entryFor(registration.id));

  completedMatches(matches, excludeMatchId).forEach((match) => {
    const entryA = entryFor(match.participantARegistrationId!);
    const entryB = entryFor(match.participantBRegistrationId!);
    const expectedA = expectedScore(entryA.rating, entryB.rating);
    const scoreA = match.winnerRegistrationId === entryA.registrationId ? 1 : 0;
    const delta = ELO_K_FACTOR * (scoreA - expectedA);

    entryA.rating = Math.round(entryA.rating + delta);
    entryB.rating = Math.round(entryB.rating - delta);
    entryA.played += 1;
    entryB.played += 1;
    if (scoreA === 1) {
      entryA.wins += 1;
      entryB.losses += 1;
    } else {
      entryB.wins += 1;
      entryA.losses += 1;
    }
  });

  return ratings;
}

function confidenceFor(ratingA: number, ratingB: number, played: number) {
  const gap = Math.abs(ratingA - ratingB);
  const gapScore = Math.min(1, gap / 300);
  const experienceScore = Math.min(1, played / 8);
  return Math.min(0.95, 0.35 + gapScore * 0.4 + experienceScore * 0.25);
}

function confidenceLabel(score: number): PredictionConfidence {
  if (score >= 0.72) return 'cao';
  if (score >= 0.52) return 'trung bình';
  return 'thấp';
}

/**
 * Dự đoán trận đang chờ bằng Elo, bỏ qua kết quả của chính trận đó
 * để dự đoán luôn phản ánh đúng thời điểm trước khi bóng lăn.
 */
export function predictMatch(
  match: Match,
  registrations: TournamentRegistration[],
  matches: Match[],
): MatchPrediction | null {
  const registrationAId = match.participantARegistrationId;
  const registrationBId = match.participantBRegistrationId;
  if (!registrationAId || !registrationBId || match.isBye) return null;

  const ratings = buildRatings(registrations, matches, match.id);
  const entryA = ratings.get(registrationAId);
  const entryB = ratings.get(registrationBId);
  if (!entryA || !entryB) return null;

  const expectedA = expectedScore(entryA.rating, entryB.rating);
  const winA = Math.round(expectedA * 100);
  const winB = 100 - winA;
  const favorite = winA >= winB ? entryA : entryB;
  const underdog = favorite === entryA ? entryB : entryA;
  const played = entryA.played + entryB.played;
  const confidenceScore = confidenceFor(entryA.rating, entryB.rating, played);
  const gap = Math.abs(entryA.rating - entryB.rating);

  return {
    matchId: match.id,
    winA,
    winB,
    ratingA: entryA.rating,
    ratingB: entryB.rating,
    favoriteRegistrationId: favorite.registrationId,
    underdogRegistrationId: underdog.registrationId,
    confidence: confidenceLabel(confidenceScore),
    confidenceScore,
    reason: `Elo ${entryA.rating} vs ${entryB.rating} · chênh ${gap} điểm · ${played} trận đã có kết quả`,
  };
}

export function isUpset(
  match: Match,
  registrations: TournamentRegistration[],
  matches: Match[],
): boolean {
  if (!match.winnerRegistrationId || match.isBye) return false;
  const prediction = predictMatch(match, registrations, matches);
  if (!prediction) return false;
  return prediction.favoriteRegistrationId !== match.winnerRegistrationId;
}