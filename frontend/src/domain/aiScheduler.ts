import type {
  Court,
  Match,
  Referee,
  SkillLevel,
  Tournament,
  TournamentBracket,
  TournamentRegistration,
} from './types';
import {
  formatTime,
  isRegistrationApproved,
  nextPowerOfTwo,
  propagateWinners,
  type GeneratedBracket,
} from './tournaments';

export const AI_START_TIME_MINUTES = 8 * 60;
export const AI_MATCH_MINUTES = 40;

const SKILL_SCORE: Record<SkillLevel, number> = {
  'Mới bắt đầu': 1,
  'Cơ bản': 2,
  'Trung cấp': 3,
  'Nâng cao': 4,
};

const DEFAULT_SKILL_SCORE = 2;

export interface AiScheduleOptions {
  startTimeMinutes?: number;
  matchMinutes?: number;
}

export interface AiSeedEntry {
  registrationId: string;
  participantName: string;
  partnerName: string;
  skillLevel: SkillLevel | null;
  club: string | null;
  seed: number;
}

export interface AiClubConflict {
  matchId: string;
  club: string;
  names: [string, string];
}

export interface AiPlanSummary {
  bracketSize: number;
  participantCount: number;
  byeCount: number;
  seeds: AiSeedEntry[];
  clubConflicts: AiClubConflict[];
  firstMatchTime: string | null;
  lastMatchTime: string | null;
  courtCount: number;
}

function skillScore(registration: TournamentRegistration) {
  return registration.skillLevel ? SKILL_SCORE[registration.skillLevel] ?? DEFAULT_SKILL_SCORE : DEFAULT_SKILL_SCORE;
}

function clubKey(registration: TournamentRegistration) {
  return (registration.club ?? '').trim().toLocaleLowerCase('vi');
}

function rankRegistrations(registrations: TournamentRegistration[]) {
  return registrations
    .map((registration) => ({ registration, score: skillScore(registration) }))
    .sort(
      (left, right) =>
        right.score - left.score ||
        left.registration.createdAt.localeCompare(right.registration.createdAt) ||
        left.registration.id.localeCompare(right.registration.id),
    )
    .map((entry) => entry.registration);
}

/** Thứ tự hạt giống chuẩn của bracket: 1 gặp hạt yếu nhất, 2 gặp hạt yếu nhì, ... */
function seedSlots(size: number) {
  let order = [1];
  while (order.length < size) {
    const pairSum = order.length * 2 + 1;
    const next: number[] = [];
    order.forEach((seed) => {
      next.push(seed, pairSum - seed);
    });
    order = next;
  }
  return order;
}

function countFirstRoundConflicts(slots: (TournamentRegistration | null)[]) {
  let conflicts = 0;
  for (let index = 0; index < slots.length; index += 2) {
    const participantA = slots[index];
    const participantB = slots[index + 1];
    if (participantA && participantB && clubKey(participantA) && clubKey(participantA) === clubKey(participantB)) {
      conflicts += 1;
    }
  }
  return conflicts;
}

/** Đổi chỗ trong cùng nhánh để tránh hai VĐV cùng CLB gặp nhau ngay vòng 1 khi còn cách xếp khác. */
function avoidSameClubFirstRound(slots: (TournamentRegistration | null)[]) {
  let conflicts = countFirstRoundConflicts(slots);
  let rounds = 0;

  while (conflicts > 0 && rounds < slots.length) {
    rounds += 1;
    let improved = false;

    for (let pairIndex = 0; pairIndex < slots.length / 2 && !improved; pairIndex += 1) {
      const participantA = slots[pairIndex * 2];
      const participantB = slots[pairIndex * 2 + 1];
      if (!participantA || !participantB || !clubKey(participantA) || clubKey(participantA) !== clubKey(participantB)) {
        continue;
      }

      for (let otherPair = 0; otherPair < slots.length / 2 && !improved; otherPair += 1) {
        if (otherPair === pairIndex) continue;

        for (const offset of [1, 0]) {
          const target = otherPair * 2 + offset;
          const swapIndex = pairIndex * 2 + 1;
          [slots[swapIndex], slots[target]] = [slots[target], slots[swapIndex]];
          const nextConflicts = countFirstRoundConflicts(slots);

          if (nextConflicts < conflicts) {
            conflicts = nextConflicts;
            improved = true;
            break;
          }

          [slots[swapIndex], slots[target]] = [slots[target], slots[swapIndex]];
        }
      }
    }

    if (!improved) break;
  }
}

function courtPool(tournament: Tournament, courts: Court[]) {
  return courts.filter((court) => court.venue === tournament.venue).slice(0, tournament.courtCount);
}

function scheduleMatches(
  bracket: TournamentBracket,
  matches: Match[],
  availableCourts: Court[],
  referees: Referee[],
  options: AiScheduleOptions,
) {
  const startTimeMinutes = options.startTimeMinutes ?? AI_START_TIME_MINUTES;
  const matchMinutes = options.matchMinutes ?? AI_MATCH_MINUTES;
  const byId = new Map(matches.map((match) => [match.id, match]));
  const refereesByWave = new Map<number, Set<string>>();
  let cursor = startTimeMinutes;

  bracket.roundMatchIds.forEach((round) => {
    const playable = round
      .map((matchId) => byId.get(matchId))
      .filter((match): match is Match => Boolean(match) && !match!.isBye);

    playable.forEach((match, index) => {
      const waveIndex = Math.floor(index / availableCourts.length);
      const waveReferees = refereesByWave.get(waveIndex) ?? new Set<string>();
      const court = availableCourts[index % availableCourts.length];
      const referee =
        referees.find((candidate) => !waveReferees.has(candidate.id)) ??
        referees[index % referees.length];

      waveReferees.add(referee.id);
      refereesByWave.set(waveIndex, waveReferees);

      match.courtId = court.id;
      match.refereeId = referee.id;
      match.scheduledTime = formatTime(cursor + waveIndex * matchMinutes);
    });

    cursor += Math.ceil(playable.length / availableCourts.length) * matchMinutes;
  });
}

export function generateAiScheduleBracket(
  tournament: Tournament,
  registrations: TournamentRegistration[],
  courts: Court[],
  referees: Referee[],
  options: AiScheduleOptions = {},
): GeneratedBracket {
  const tournamentRegistrations = registrations.filter(
    (registration) => registration.tournamentId === tournament.id && isRegistrationApproved(registration),
  );

  if (tournamentRegistrations.length < 2) {
    throw new Error('Cần ít nhất 2 lượt đăng ký để tạo bảng đấu.');
  }

  const availableCourts = courtPool(tournament, courts);
  if (availableCourts.length === 0 || referees.length === 0) {
    throw new Error('Cần có sân và trọng tài để xếp lịch thi đấu.');
  }

  const ranked = rankRegistrations(tournamentRegistrations);
  const size = nextPowerOfTwo(ranked.length);
  const slots = seedSlots(size).map((seed) => ranked[seed - 1] ?? null);
  avoidSameClubFirstRound(slots);

  const roundMatchIds: string[][] = [];
  const matches: Match[] = [];

  for (let roundIndex = 0, matchCount = size / 2; matchCount >= 1; roundIndex += 1) {
    const ids: string[] = [];
    for (let matchIndex = 0; matchIndex < matchCount; matchIndex += 1) {
      const id = `${tournament.id}-r${roundIndex + 1}-m${matchIndex + 1}`;
      ids.push(id);
      matches.push({
        id,
        tournamentId: tournament.id,
        roundIndex,
        matchIndex,
        participantARegistrationId: null,
        participantBRegistrationId: null,
        scoreA: null,
        scoreB: null,
        winnerRegistrationId: null,
        isBye: false,
        courtId: null,
        refereeId: null,
        scheduledTime: null,
      });
    }
    roundMatchIds.push(ids);
    matchCount /= 2;
  }

  const byId = new Map(matches.map((match) => [match.id, match]));
  const firstRound = roundMatchIds[0].map((matchId) => byId.get(matchId)!);

  firstRound.forEach((match, index) => {
    match.participantARegistrationId = slots[index * 2]?.id ?? null;
    match.participantBRegistrationId = slots[index * 2 + 1]?.id ?? null;

    if (match.participantARegistrationId && !match.participantBRegistrationId) {
      match.winnerRegistrationId = match.participantARegistrationId;
      match.isBye = true;
    } else if (match.participantBRegistrationId && !match.participantARegistrationId) {
      match.winnerRegistrationId = match.participantBRegistrationId;
      match.isBye = true;
    }
  });

  const bracket: TournamentBracket = { size, roundMatchIds, mode: 'ai' };
  propagateWinners(bracket, matches);
  scheduleMatches(bracket, matches, availableCourts, referees, options);

  return { bracket, matches };
}

export function describeAiPlan(
  tournament: Tournament,
  registrations: TournamentRegistration[],
  bracket: TournamentBracket,
  matches: Match[],
  courts: Court[],
): AiPlanSummary {
  const eligible = registrations.filter(
    (registration) => registration.tournamentId === tournament.id && isRegistrationApproved(registration),
  );
  const ranked = rankRegistrations(eligible);
  const registrationById = new Map(eligible.map((registration) => [registration.id, registration]));
  const tournamentMatches = matches.filter((match) => match.tournamentId === tournament.id);
  const firstRound = bracket.roundMatchIds[0] ?? [];

  const clubConflicts: AiClubConflict[] = [];
  firstRound.forEach((matchId) => {
    const match = tournamentMatches.find((candidate) => candidate.id === matchId);
    const participantA = match?.participantARegistrationId ? registrationById.get(match.participantARegistrationId) : undefined;
    const participantB = match?.participantBRegistrationId ? registrationById.get(match.participantBRegistrationId) : undefined;
    if (!match || !participantA || !participantB) return;
    if (!clubKey(participantA) || clubKey(participantA) !== clubKey(participantB)) return;

    clubConflicts.push({
      matchId,
      club: participantA.club!.trim(),
      names: [participantA.participantName, participantB.participantName],
    });
  });

  const playableTimes = tournamentMatches
    .filter((match) => !match.isBye && match.scheduledTime)
    .map((match) => match.scheduledTime!)
    .sort((left, right) => left.localeCompare(right));

  return {
    bracketSize: bracket.size,
    participantCount: eligible.length,
    byeCount: tournamentMatches.filter((match) => match.isBye).length,
    seeds: ranked.map((registration, index) => ({
      registrationId: registration.id,
      participantName: registration.participantName,
      partnerName: registration.partnerName,
      skillLevel: registration.skillLevel ?? null,
      club: registration.club?.trim() || null,
      seed: index + 1,
    })),
    clubConflicts,
    firstMatchTime: playableTimes.at(0) ?? null,
    lastMatchTime: playableTimes.at(-1) ?? null,
    courtCount: courtPool(tournament, courts).length,
  };
}
