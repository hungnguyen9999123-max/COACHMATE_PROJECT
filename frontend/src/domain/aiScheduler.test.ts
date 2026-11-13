import { describe, expect, it } from 'vitest';
import { createSeedState } from '../data/seed';
import { describeAiPlan, generateAiScheduleBracket } from './aiScheduler';
import type { TournamentRegistration } from './types';

const baseState = createSeedState();
const tournament = baseState.tournaments[0];
const courts = baseState.courts;
const referees = baseState.referees;

function makeRegistration(
  index: number,
  overrides: Partial<TournamentRegistration> = {},
): TournamentRegistration {
  return {
    id: `ai-r${index}`,
    tournamentId: tournament.id,
    participantName: `VĐV ${index}`,
    partnerName: '',
    isCurrentStudent: false,
    fee: 100_000,
    paymentFee: 2_000,
    createdAt: `2026-11-${String(index).padStart(2, '0')}T10:00:00+07:00`,
    paymentId: `ai-pay-${index}`,
    reviewStatus: 'approved',
    ...overrides,
  };
}

describe('AI tournament scheduling', () => {
  it('seeds the bracket by skill level so the strongest meets the weakest first', () => {
    const registrations = [
      makeRegistration(1, { skillLevel: 'Nâng cao' }),
      makeRegistration(2, { skillLevel: 'Trung cấp' }),
      makeRegistration(3, { skillLevel: 'Cơ bản' }),
      makeRegistration(4, { skillLevel: 'Mới bắt đầu' }),
    ];

    const { bracket, matches } = generateAiScheduleBracket(tournament, registrations, courts, referees);
    const firstRound = matches.filter((match) => match.roundIndex === 0);

    expect(bracket.size).toBe(4);
    expect(bracket.mode).toBe('ai');
    expect(firstRound[0].participantARegistrationId).toBe('ai-r1');
    expect(firstRound[0].participantBRegistrationId).toBe('ai-r4');
    expect(firstRound[1].participantARegistrationId).toBe('ai-r2');
    expect(firstRound[1].participantBRegistrationId).toBe('ai-r3');
  });

  it('gives byes to the top seeds when the field does not fill the bracket', () => {
    const registrations = [
      makeRegistration(1, { skillLevel: 'Nâng cao' }),
      makeRegistration(2, { skillLevel: 'Nâng cao' }),
      makeRegistration(3, { skillLevel: 'Trung cấp' }),
      makeRegistration(4, { skillLevel: 'Cơ bản' }),
      makeRegistration(5, { skillLevel: 'Mới bắt đầu' }),
    ];

    const { bracket, matches } = generateAiScheduleBracket(tournament, registrations, courts, referees);
    const byes = matches.filter((match) => match.isBye);

    expect(bracket.size).toBe(8);
    expect(byes).toHaveLength(3);
    expect(byes.every((match) => match.winnerRegistrationId != null)).toBe(true);
    expect(byes.map((match) => match.winnerRegistrationId)).toEqual(
      expect.arrayContaining(['ai-r1', 'ai-r2', 'ai-r3']),
    );
  });

  it('avoids pairing two players from the same club in the first round when possible', () => {
    const registrations = [
      makeRegistration(1, { skillLevel: 'Nâng cao', club: 'CLB Bình Minh' }),
      makeRegistration(2, { skillLevel: 'Trung cấp', club: 'CLB Sao Mai' }),
      makeRegistration(3, { skillLevel: 'Cơ bản', club: 'CLB Phú Nhuận' }),
      makeRegistration(4, { skillLevel: 'Mới bắt đầu', club: 'CLB Bình Minh' }),
    ];

    const { matches } = generateAiScheduleBracket(tournament, registrations, courts, referees);
    const registrationById = new Map(registrations.map((registration) => [registration.id, registration]));
    const sameClubPairs = matches
      .filter((match) => match.roundIndex === 0)
      .filter((match) => {
        const participantA = match.participantARegistrationId ? registrationById.get(match.participantARegistrationId) : undefined;
        const participantB = match.participantBRegistrationId ? registrationById.get(match.participantBRegistrationId) : undefined;
        return Boolean(participantA?.club && participantA.club === participantB?.club);
      });

    expect(sameClubPairs).toHaveLength(0);
  });

  it('reports an unavoidable same-club first-round pairing in the plan summary', () => {
    const registrations = [
      makeRegistration(1, { skillLevel: 'Nâng cao', club: 'CLB Bình Minh' }),
      makeRegistration(2, { skillLevel: 'Cơ bản', club: 'CLB Bình Minh' }),
    ];

    const { bracket, matches } = generateAiScheduleBracket(tournament, registrations, courts, referees);
    const summary = describeAiPlan(tournament, registrations, bracket, matches, courts);

    expect(summary.clubConflicts).toHaveLength(1);
    expect(summary.clubConflicts[0].club).toBe('CLB Bình Minh');
    expect(summary.seeds.map((entry) => entry.registrationId)).toEqual(['ai-r1', 'ai-r2']);
  });

  it('schedules rounds in waves so players never overlap and courts are balanced', () => {
    const registrations = Array.from({ length: 8 }, (_, index) => makeRegistration(index + 1));

    const { bracket, matches } = generateAiScheduleBracket(tournament, registrations, courts, referees);
    const firstRound = matches.filter((match) => match.roundIndex === 0);
    const finalMatch = matches.find((match) => match.roundIndex === bracket.roundMatchIds.length - 1)!;
    const playable = matches.filter((match) => !match.isBye);

    expect(firstRound.map((match) => match.scheduledTime)).toEqual(['08:00', '08:00', '08:00', '08:00']);
    expect(new Set(firstRound.map((match) => match.courtId)).size).toBe(4);
    expect(finalMatch.scheduledTime).toBe('09:20');
    expect(playable.every((match) => match.courtId && match.refereeId && match.scheduledTime)).toBe(true);
  });

  it('summarizes seeds, byes and the playable time range', () => {
    const registrations = [
      makeRegistration(1, { skillLevel: 'Nâng cao' }),
      makeRegistration(2, { skillLevel: 'Trung cấp' }),
      makeRegistration(3, { skillLevel: 'Cơ bản' }),
      makeRegistration(4, { skillLevel: 'Mới bắt đầu' }),
      makeRegistration(5, { skillLevel: 'Mới bắt đầu' }),
    ];

    const { bracket, matches } = generateAiScheduleBracket(tournament, registrations, courts, referees);
    const summary = describeAiPlan(tournament, registrations, bracket, matches, courts);

    expect(summary.bracketSize).toBe(8);
    expect(summary.participantCount).toBe(5);
    expect(summary.byeCount).toBe(3);
    expect(summary.courtCount).toBe(4);
    expect(summary.seeds[0]).toMatchObject({ participantName: 'VĐV 1', seed: 1, skillLevel: 'Nâng cao' });
    expect(summary.firstMatchTime).toBe('08:00');
    expect(summary.lastMatchTime).toBe('09:20');
  });
});
