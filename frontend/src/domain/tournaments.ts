import type {
  Court,
  Match,
  Referee,
  Tournament,
  TournamentBracket,
  TournamentRegistration,
} from './types';

export interface GeneratedBracket {
  bracket: TournamentBracket;
  matches: Match[];
}

export interface TournamentStanding {
  registrationId: string;
  participantName: string;
  partnerName: string;
  rankLabel: string;
  state: 'ranked' | 'in-progress' | 'awaiting';
}

export function isRegistrationApproved(registration: TournamentRegistration) {
  return registration.reviewStatus !== 'pending' && registration.reviewStatus !== 'rejected';
}

function nextPowerOfTwo(value: number) {
  let size = 2;
  while (size < value) size *= 2;
  return size;
}

function formatTime(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

export function generateTournamentBracket(
  tournament: Tournament,
  registrations: TournamentRegistration[],
  courts: Court[],
  referees: Referee[],
): GeneratedBracket {
  const tournamentRegistrations = registrations.filter(
    (registration) => registration.tournamentId === tournament.id && isRegistrationApproved(registration),
  );

  if (tournamentRegistrations.length < 2) {
    throw new Error('Cần ít nhất 2 lượt đăng ký để tạo bảng đấu.');
  }

  const availableCourts = courts
    .filter((court) => court.venue === tournament.venue)
    .slice(0, tournament.courtCount);

  if (availableCourts.length === 0 || referees.length === 0) {
    throw new Error('Cần có sân và trọng tài để xếp lịch thi đấu.');
  }

  const registrationIds = tournamentRegistrations.map((registration) => registration.id);
  const size = nextPowerOfTwo(registrationIds.length);
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

  const firstRound = roundMatchIds[0].map((id) => matches.find((match) => match.id === id)!);
  firstRound.forEach((match, index) => {
    match.participantARegistrationId = registrationIds[index] ?? null;
    match.participantBRegistrationId = registrationIds[size - 1 - index] ?? null;

    if (match.participantARegistrationId && !match.participantBRegistrationId) {
      match.winnerRegistrationId = match.participantARegistrationId;
      match.isBye = true;
    } else if (match.participantBRegistrationId && !match.participantARegistrationId) {
      match.winnerRegistrationId = match.participantBRegistrationId;
      match.isBye = true;
    }
  });

  propagateWinners({ size, roundMatchIds }, matches);

  let scheduledMatchIndex = 0;
  roundMatchIds.forEach((round) => {
    round.forEach((matchId) => {
      const match = matches.find((candidate) => candidate.id === matchId)!;
      if (match.isBye) return;

      match.courtId = availableCourts[scheduledMatchIndex % availableCourts.length].id;
      match.refereeId = referees[scheduledMatchIndex % referees.length].id;
      match.scheduledTime = formatTime(
        8 * 60 + Math.floor(scheduledMatchIndex / availableCourts.length) * 40,
      );
      scheduledMatchIndex += 1;
    });
  });

  return { bracket: { size, roundMatchIds }, matches };
}

export function getTournamentStandings(
  tournament: Tournament,
  registrations: TournamentRegistration[],
  matches: Match[],
): TournamentStanding[] {
  const eligible = registrations.filter(
    (registration) => registration.tournamentId === tournament.id && isRegistrationApproved(registration),
  );
  if (!tournament.bracket) {
    return eligible.map((registration) => ({
      registrationId: registration.id,
      participantName: registration.participantName,
      partnerName: registration.partnerName,
      rankLabel: 'Chưa thi đấu',
      state: 'awaiting',
    }));
  }

  const tournamentMatches = matches
    .filter((match) => match.tournamentId === tournament.id)
    .sort((left, right) => right.roundIndex - left.roundIndex);
  const registrationById = new Map(eligible.map((registration) => [registration.id, registration]));
  const standings: TournamentStanding[] = [];
  const rankedIds = new Set<string>();
  const rounds = tournament.bracket.roundMatchIds.length;

  for (const match of tournamentMatches) {
    if (match.winnerRegistrationId == null || match.scoreA == null || match.scoreB == null) continue;
    const loserId = match.winnerRegistrationId === match.participantARegistrationId
      ? match.participantBRegistrationId
      : match.participantARegistrationId;
    const loser = loserId ? registrationById.get(loserId) : undefined;
    if (!loser || rankedIds.has(loser.id)) continue;

    const rankStart = 2 ** (rounds - match.roundIndex - 1) + 1;
    const rankEnd = 2 ** (rounds - match.roundIndex);
    standings.push({
      registrationId: loser.id,
      participantName: loser.participantName,
      partnerName: loser.partnerName,
      rankLabel: rankStart === rankEnd ? `Hạng ${rankStart}` : `Hạng ${rankStart}–${rankEnd}`,
      state: 'ranked',
    });
    rankedIds.add(loser.id);
  }

  const champion = tournament.championRegistrationId
    ? registrationById.get(tournament.championRegistrationId)
    : undefined;
  if (champion) {
    standings.unshift({
      registrationId: champion.id,
      participantName: champion.participantName,
      partnerName: champion.partnerName,
      rankLabel: 'Vô địch · Hạng 1',
      state: 'ranked',
    });
    rankedIds.add(champion.id);
  }

  eligible.forEach((registration) => {
    if (rankedIds.has(registration.id)) return;
    standings.push({
      registrationId: registration.id,
      participantName: registration.participantName,
      partnerName: registration.partnerName,
      rankLabel: tournament.status === 'finished' ? 'Chưa xếp hạng' : 'Đang thi đấu',
      state: tournament.status === 'finished' ? 'awaiting' : 'in-progress',
    });
  });

  return standings;
}

export function propagateWinners(bracket: TournamentBracket, matches: Match[]) {
  const byId = new Map(matches.map((match) => [match.id, match]));

  bracket.roundMatchIds.forEach((round, roundIndex) => {
    if (roundIndex === 0) return;

    round.forEach((matchId, matchIndex) => {
      const match = byId.get(matchId)!;
      const previousRound = bracket.roundMatchIds[roundIndex - 1];
      match.participantARegistrationId =
        byId.get(previousRound[matchIndex * 2])?.winnerRegistrationId ?? null;
      match.participantBRegistrationId =
        byId.get(previousRound[matchIndex * 2 + 1])?.winnerRegistrationId ?? null;
    });
  });
}

export function recordMatchResult(
  bracket: TournamentBracket,
  matches: Match[],
  matchId: string,
  scoreA: number,
  scoreB: number,
) {
  const match = matches.find((candidate) => candidate.id === matchId);

  if (!match?.participantARegistrationId || !match.participantBRegistrationId || match.isBye) {
    throw new Error('Trận đấu chưa có đủ hai bên.');
  }
  if (!Number.isFinite(scoreA) || !Number.isFinite(scoreB) || scoreA === scoreB) {
    throw new Error('Tỷ số phải hợp lệ và không được hòa.');
  }

  match.scoreA = scoreA;
  match.scoreB = scoreB;
  match.winnerRegistrationId =
    scoreA > scoreB ? match.participantARegistrationId : match.participantBRegistrationId;
  propagateWinners(bracket, matches);

  const finalMatchId = bracket.roundMatchIds.at(-1)?.[0];
  return {
    winnerRegistrationId: match.winnerRegistrationId,
    championRegistrationId:
      finalMatchId === match.id ? match.winnerRegistrationId : null,
  };
}

export function getRoundName(roundCount: number, roundIndex: number) {
  const roundsLeft = roundCount - roundIndex;
  if (roundsLeft === 1) return 'Chung kết';
  if (roundsLeft === 2) return 'Bán kết';
  if (roundsLeft === 3) return 'Tứ kết';
  return `Vòng ${roundIndex + 1}`;
}
