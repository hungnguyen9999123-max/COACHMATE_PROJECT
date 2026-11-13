import { describe, expect, it } from 'vitest';
import { buildRatings, isUpset, predictMatch } from './elo';
import type { Match, TournamentRegistration } from './types';

function registration(id: string, skillLevel: TournamentRegistration['skillLevel']): TournamentRegistration {
  return {
    id,
    tournamentId: 't1',
    participantName: id,
    partnerName: '',
    isCurrentStudent: false,
    fee: 100_000,
    paymentFee: 2_000,
    createdAt: '2026-11-01T10:00:00+07:00',
    paymentId: `pay-${id}`,
    reviewStatus: 'approved',
    skillLevel,
  };
}

function match(
  id: string,
  participantA: string,
  participantB: string,
  winner: string | null,
  scoreA: number | null = 21,
  scoreB: number | null = 15,
): Match {
  return {
    id,
    tournamentId: 't1',
    roundIndex: 0,
    matchIndex: 0,
    participantARegistrationId: participantA,
    participantBRegistrationId: participantB,
    scoreA,
    scoreB,
    winnerRegistrationId: winner,
    isBye: false,
    courtId: null,
    refereeId: null,
    scheduledTime: null,
  };
}

const registrations = [registration('a', 'Nâng cao'), registration('b', 'Mới bắt đầu')];

describe('Elo match prediction', () => {
  it('starts ratings from the declared skill level', () => {
    const ratings = buildRatings(registrations, []);
    expect(ratings.get('a')?.rating).toBe(1600);
    expect(ratings.get('b')?.rating).toBe(1300);
  });

  it('moves both ratings by K times the result versus expectation', () => {
    const ratings = buildRatings(registrations, [match('m1', 'a', 'b', 'a')]);
    const entryA = ratings.get('a')!;
    const entryB = ratings.get('b')!;

    expect(entryA.rating).toBeGreaterThan(1600);
    expect(entryB.rating).toBeLessThan(1300);
    expect(entryA.wins).toBe(1);
    expect(entryB.losses).toBe(1);
    expect(entryA.played + entryB.played).toBe(2);
  });

  it('favours the higher-rated participant before the match is played', () => {
    const pending = match('m1', 'a', 'b', null, null, null);
    const prediction = predictMatch(pending, registrations, [pending])!;

    expect(prediction.favoriteRegistrationId).toBe('a');
    expect(prediction.winA).toBeGreaterThan(prediction.winB);
    expect(prediction.winA + prediction.winB).toBe(100);
    expect(prediction.reason).toContain('Elo 1600 vs 1300');
  });

  it('computes the prediction without leaking the result of the same match', () => {
    const played = match('m1', 'a', 'b', 'a');
    const prediction = predictMatch(played, registrations, [played])!;
    expect(prediction.ratingA).toBe(1600);
    expect(prediction.ratingB).toBe(1300);
  });

  it('flags an upset when the underdog wins', () => {
    const upset = match('m1', 'a', 'b', 'b');
    expect(isUpset(upset, registrations, [upset])).toBe(true);
    expect(isUpset(match('m2', 'a', 'b', 'a'), registrations, [])).toBe(false);
  });
});