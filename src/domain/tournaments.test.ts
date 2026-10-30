import { describe, expect, it } from 'vitest';
import { createSeedState } from '../data/seed';
import {
  generateTournamentBracket,
  getRoundName,
  recordMatchResult,
} from './tournaments';

describe('tournament preservation rules', () => {
  it('creates the next-power-of-two bracket and auto-advances byes', () => {
    const state = createSeedState();
    const tournament = state.tournaments[0];
    const registrations = state.tournamentRegistrations
      .filter((registration) => registration.tournamentId === tournament.id)
      .slice(0, 5);
    const generated = generateTournamentBracket(
      tournament,
      registrations,
      state.courts,
      state.referees,
    );

    expect(generated.bracket.size).toBe(8);
    expect(generated.bracket.roundMatchIds.map((round) => round.length)).toEqual([4, 2, 1]);
    expect(generated.matches.filter((match) => match.isBye)).toHaveLength(3);
    expect(generated.matches.filter((match) => match.isBye).every((match) => match.winnerRegistrationId)).toBe(
      true,
    );
  });

  it('assigns courts, 40-minute waves, and referees in the original traversal order', () => {
    const state = createSeedState();
    const tournament = { ...state.tournaments[0], courtCount: 2 };
    const registrations = state.tournamentRegistrations
      .filter((registration) => registration.tournamentId === tournament.id)
      .slice(0, 4);
    const generated = generateTournamentBracket(
      tournament,
      registrations,
      state.courts,
      state.referees,
    );

    expect(
      generated.matches.map((match) => [match.courtId, match.scheduledTime, match.refereeId]),
    ).toEqual([
      ['court-q7-1', '08:00', 'ref-1'],
      ['court-q7-2', '08:00', 'ref-2'],
      ['court-q7-1', '08:40', 'ref-3'],
    ]);
  });

  it('progresses winners through the bracket and identifies the champion', () => {
    const state = createSeedState();
    const tournament = state.tournaments[0];
    const registrations = state.tournamentRegistrations
      .filter((registration) => registration.tournamentId === tournament.id)
      .slice(0, 4);
    const { bracket, matches } = generateTournamentBracket(
      tournament,
      registrations,
      state.courts,
      state.referees,
    );
    const [semifinalA, semifinalB] = bracket.roundMatchIds[0];
    const finalId = bracket.roundMatchIds[1][0];

    recordMatchResult(bracket, matches, semifinalA, 21, 14);
    recordMatchResult(bracket, matches, semifinalB, 18, 21);
    const final = matches.find((match) => match.id === finalId)!;

    expect(final.participantARegistrationId).not.toBeNull();
    expect(final.participantBRegistrationId).not.toBeNull();

    const result = recordMatchResult(bracket, matches, finalId, 22, 20);
    expect(result.championRegistrationId).toBe(final.participantARegistrationId);
  });

  it('rejects tied results without inventing badminton set validation', () => {
    const state = createSeedState();
    const tournament = state.tournaments[0];
    const registrations = state.tournamentRegistrations
      .filter((registration) => registration.tournamentId === tournament.id)
      .slice(0, 4);
    const { bracket, matches } = generateTournamentBracket(
      tournament,
      registrations,
      state.courts,
      state.referees,
    );

    expect(() => recordMatchResult(bracket, matches, bracket.roundMatchIds[0][0], 21, 21)).toThrow(
      'Tỷ số phải hợp lệ và không được hòa.',
    );
  });

  it('preserves round naming', () => {
    expect([0, 1, 2].map((index) => getRoundName(3, index))).toEqual([
      'Tứ kết',
      'Bán kết',
      'Chung kết',
    ]);
  });
});
