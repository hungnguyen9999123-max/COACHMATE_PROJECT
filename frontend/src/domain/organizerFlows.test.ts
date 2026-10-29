import { describe, expect, it } from 'vitest';
import { createSeedState } from '../data/seed';
import {
  addCourtByOrganizer,
  addRefereeByOrganizer,
  approveTournamentRegistrationByOrganizer,
  createTournamentByOrganizer,
  deleteCourtByOrganizer,
  deleteRefereeByOrganizer,
  generateBracketByOrganizer,
  rejectTournamentRegistrationByOrganizer,
  submitMatchScoreByOrganizer,
  updateCourtByOrganizer,
  updateRefereeByOrganizer,
  updateAssumptionStatusByOrganizer,
  updateBusinessSettingsByOrganizer,
} from './organizerFlows';

describe('Organizer Flows Domain Logic', () => {
  it('creates a tournament with cost plan', () => {
    const state = createSeedState();
    const result = createTournamentByOrganizer(state, {
      name: 'Giải Cầu Lông Mở Rộng 2026',
      format: 'singles',
      level: 'Phong trào',
      date: '2026-12-25',
      registrationDeadline: '2026-12-15',
      venue: 'Nhà thi đấu Quận 7 (thuê theo sự kiện)',
      fee: 300000,
      minRegistrations: 10,
      maxRegistrations: 16,
      courtCount: 4,
      prize: 'Cúp và tiền thưởng',
      rules: 'Thi đấu loại trực tiếp',
      costPlan: {
        court: 2000000,
        staff: 500000,
        prize: 1500000,
        miscellaneous: 200000,
        refereePerMatch: 50000,
      },
    });

    expect(result.state.tournaments.length).toBe(state.tournaments.length + 1);
    expect(result.tournament.name).toBe('Giải Cầu Lông Mở Rộng 2026');
  });

  it('generates bracket and records match score', () => {
    const state = createSeedState();
    const bracketResult = generateBracketByOrganizer(state, 't1');

    expect(bracketResult.bracket!.size).toBe(16);
    expect(bracketResult.matches.length).toBe(15);

    const firstMatch = bracketResult.matches.find((m) => !m.isBye)!;
    const updatedState = submitMatchScoreByOrganizer(
      bracketResult.state,
      't1',
      firstMatch.id,
      21,
      19,
    );

    const updatedMatch = updatedState.matches.find((m) => m.id === firstMatch.id)!;
    expect(updatedMatch.scoreA).toBe(21);
    expect(updatedMatch.scoreB).toBe(19);
    expect(updatedMatch.winnerRegistrationId).toBe(firstMatch.participantARegistrationId);
  });

  it('requires pending registrations to be approved before bracket generation', () => {
    const state = createSeedState();
    const pendingState = {
      ...state,
      tournamentRegistrations: state.tournamentRegistrations.map((registration, index) =>
        index === 0 ? { ...registration, reviewStatus: 'pending' as const } : registration,
      ),
    };

    expect(() => generateBracketByOrganizer(pendingState, 't1')).toThrow(
      'Vui lòng duyệt tất cả đăng ký đang chờ trước khi chốt giải.',
    );
    const approvedState = approveTournamentRegistrationByOrganizer(pendingState, 't1', 'r1');
    expect(approvedState.tournamentRegistrations.find((registration) => registration.id === 'r1')?.reviewStatus).toBe('approved');
    expect(generateBracketByOrganizer(approvedState, 't1').matches).toHaveLength(15);
  });

  it('rejects a pending registration, refunds its demo payment, and releases capacity', () => {
    const state = createSeedState();
    const pendingState = {
      ...state,
      tournamentRegistrations: state.tournamentRegistrations.map((registration, index) =>
        index === 0 ? { ...registration, reviewStatus: 'pending' as const } : registration,
      ),
    };
    const rejected = rejectTournamentRegistrationByOrganizer(pendingState, 't1', 'r1');

    expect(rejected.tournamentRegistrations.find((registration) => registration.id === 'r1')?.reviewStatus).toBe('rejected');
    expect(rejected.payments.find((payment) => payment.id === 'pay-tournament-1')?.status).toBe('refunded');
    expect(() => rejectTournamentRegistrationByOrganizer(rejected, 't1', 'r1')).toThrow('Đăng ký này không còn chờ duyệt.');
    expect(generateBracketByOrganizer(rejected, 't1').matches).toHaveLength(7);
  });

  it('adds court and referee', () => {
    const state = createSeedState();
    const withCourt = addCourtByOrganizer(state, {
      name: 'Sân 5',
      venue: 'Nhà thi đấu Quận 7 (thuê theo sự kiện)',
      courtNumber: 5,
    });

    expect(withCourt.courts.length).toBe(state.courts.length + 1);

    const withRef = addRefereeByOrganizer(withCourt, {
      name: 'Trọng tài Hoàng',
      phone: '0901234567',
      certification: 'Cấp quốc gia',
    });

    expect(withRef.referees.length).toBe(state.referees.length + 1);
  });

  it('updates courts and referees and prevents deleting scheduled resources', () => {
    const state = createSeedState();
    const scheduled = generateBracketByOrganizer(state, 't1').state;
    expect(() => deleteCourtByOrganizer(scheduled, 'court-q7-1')).toThrow('Không thể xóa sân đang được lịch thi đấu sử dụng.');
    expect(() => deleteRefereeByOrganizer(scheduled, 'ref-1')).toThrow('Không thể xóa trọng tài đang được lịch thi đấu phân công.');

    const updatedCourt = updateCourtByOrganizer(state, 'court-q7-1', {
      name: 'Sân số 1',
      venue: 'Nhà thi đấu Quận 7',
      courtNumber: 1,
    });
    expect(updatedCourt.courts.find((court) => court.id === 'court-q7-1')?.name).toBe('Sân số 1');
    const updatedReferee = updateRefereeByOrganizer(state, 'ref-1', {
      name: 'Trọng tài mới',
      phone: '0912345678',
      certification: 'Cấp quốc gia',
    });
    expect(updatedReferee.referees.find((referee) => referee.id === 'ref-1')?.name).toBe('Trọng tài mới');
    expect(deleteCourtByOrganizer(state, 'court-q7-1').courts).toHaveLength(state.courts.length - 1);
    expect(deleteRefereeByOrganizer(state, 'ref-1').referees).toHaveLength(state.referees.length - 1);
  });
});
