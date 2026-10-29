import { prependActivity } from './activity';
import { DEFAULT_COURSE_COVER_IMAGE } from './constants';
import { generateTournamentBracket, recordMatchResult } from './tournaments';
import type { Court, DemoState, Referee, Tournament } from './types';

export function createTournamentByOrganizer(
  state: DemoState,
  input: {
    name: string;
    format: Tournament['format'];
    level: string;
    date: string;
    registrationDeadline: string;
    venue: string;
    fee: number;
    maxRegistrations: number;
    minRegistrations: number;
    courtCount: number;
    prize: string;
    rules: string;
    coverImageUrl?: string;
    costPlan: Tournament['costPlan'];
  },
): { state: DemoState; tournament: Tournament } {
  if (!input.name.trim()) throw new Error('Vui lòng nhập tên giải đấu.');
  if (input.fee < 0) throw new Error('Lệ phí đăng ký không hợp lệ.');
  if (input.minRegistrations < 2 || input.maxRegistrations < input.minRegistrations) {
    throw new Error('Số lượng đăng ký tối thiểu và tối đa không hợp lệ.');
  }

  const tournamentId = `tournament-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const tournament: Tournament = {
    id: tournamentId,
    name: input.name.trim(),
    format: input.format,
    level: input.level.trim() || 'Phong trào',
    date: input.date,
    registrationDeadline: input.registrationDeadline,
    venue: input.venue.trim(),
    fee: input.fee,
    maxRegistrations: input.maxRegistrations,
    minRegistrations: input.minRegistrations,
    courtCount: input.courtCount || 2,
    prize: input.prize.trim() || 'Cúp và phần thưởng',
    rules: input.rules.trim() || 'Thi đấu theo luật cầu lông hiện hành.',
    costPlan: input.costPlan,
    status: 'open',
    bracket: null,
    championRegistrationId: null,
    coverImageUrl: input.coverImageUrl?.trim() || DEFAULT_COURSE_COVER_IMAGE,
  };

  const updatedState: DemoState = {
    ...state,
    tournaments: [tournament, ...state.tournaments],
    activityLogs: prependActivity(state.activityLogs, {
      id: `activity-${Date.now()}`,
      occurredAt: new Date().toISOString(),
      actorName: 'Ban tổ chức',
      action: `đã tạo giải đấu mới: ${tournament.name}`,
    }),
  };

  return { state: updatedState, tournament };
}

export function generateBracketByOrganizer(
  state: DemoState,
  tournamentId: string,
): { state: DemoState; bracket: Tournament['bracket']; matches: DemoState['matches'] } {
  const tournament = state.tournaments.find((t) => t.id === tournamentId);
  if (!tournament) throw new Error('Không tìm thấy giải đấu.');
  if (tournament.status !== 'open') throw new Error('Giải đấu không còn mở đăng ký.');
  const registrations = state.tournamentRegistrations.filter((registration) => registration.tournamentId === tournamentId);
  if (registrations.some((registration) => registration.reviewStatus === 'pending')) {
    throw new Error('Vui lòng duyệt tất cả đăng ký đang chờ trước khi chốt giải.');
  }

  const generated = generateTournamentBracket(
    tournament,
    registrations,
    state.courts,
    state.referees,
  );

  const updatedTournaments = state.tournaments.map((t) =>
    t.id === tournamentId ? { ...t, status: 'closed' as const, bracket: generated.bracket } : t,
  );

  const otherMatches = state.matches.filter((m) => m.tournamentId !== tournamentId);
  const updatedMatches = [...otherMatches, ...generated.matches];

  const updatedState: DemoState = {
    ...state,
    tournaments: updatedTournaments,
    matches: updatedMatches,
    activityLogs: prependActivity(state.activityLogs, {
      id: `activity-${Date.now()}`,
      occurredAt: new Date().toISOString(),
      actorName: 'Ban tổ chức',
      action: `đã chốt đăng ký và sinh sơ đồ nhánh đấu cho ${tournament.name}`,
    }),
  };

  return { state: updatedState, bracket: generated.bracket, matches: generated.matches };
}

export function approveTournamentRegistrationByOrganizer(
  state: DemoState,
  tournamentId: string,
  registrationId: string,
): DemoState {
  const tournament = state.tournaments.find((item) => item.id === tournamentId);
  if (!tournament) throw new Error('Không tìm thấy giải đấu.');
  if (tournament.status !== 'open') throw new Error('Giải đấu không còn mở đăng ký.');

  const registration = state.tournamentRegistrations.find(
    (item) => item.id === registrationId && item.tournamentId === tournamentId,
  );
  if (!registration) throw new Error('Không tìm thấy đăng ký vận động viên.');
  if (registration.reviewStatus !== 'pending') throw new Error('Đăng ký này không còn chờ duyệt.');

  return {
    ...state,
    tournamentRegistrations: state.tournamentRegistrations.map((item) =>
      item.id === registrationId ? { ...item, reviewStatus: 'approved' } : item,
    ),
    activityLogs: prependActivity(state.activityLogs, {
      id: `activity-${Date.now()}`,
      occurredAt: new Date().toISOString(),
      actorName: 'Ban tổ chức',
      action: `đã duyệt đăng ký của ${registration.participantName} cho ${tournament.name}`,
    }),
  };
}

export function rejectTournamentRegistrationByOrganizer(
  state: DemoState,
  tournamentId: string,
  registrationId: string,
): DemoState {
  const tournament = state.tournaments.find((item) => item.id === tournamentId);
  if (!tournament) throw new Error('Không tìm thấy giải đấu.');
  if (tournament.status !== 'open') throw new Error('Giải đấu không còn mở đăng ký.');

  const registration = state.tournamentRegistrations.find(
    (item) => item.id === registrationId && item.tournamentId === tournamentId,
  );
  if (!registration || registration.reviewStatus !== 'pending') {
    throw new Error('Đăng ký này không còn chờ duyệt.');
  }
  const payment = state.payments.find(
    (item) => item.id === registration.paymentId && item.kind === 'tournament' && item.referenceId === registrationId,
  );
  if (!payment || payment.status !== 'completed') {
    throw new Error('Không tìm thấy giao dịch demo hợp lệ để hoàn tiền.');
  }

  return {
    ...state,
    tournamentRegistrations: state.tournamentRegistrations.map((item) =>
      item.id === registrationId ? { ...item, reviewStatus: 'rejected' } : item,
    ),
    payments: state.payments.map((item) =>
      item.id === payment.id ? { ...item, status: 'refunded' } : item,
    ),
    activityLogs: prependActivity(state.activityLogs, {
      id: `activity-${Date.now()}`,
      occurredAt: new Date().toISOString(),
      actorName: 'Ban tổ chức',
      action: `đã từ chối đăng ký của ${registration.participantName} và hoàn tiền demo cho giải ${tournament.name}`,
    }),
  };
}

export function submitMatchScoreByOrganizer(
  state: DemoState,
  tournamentId: string,
  matchId: string,
  scoreA: number,
  scoreB: number,
): DemoState {
  const tournament = state.tournaments.find((t) => t.id === tournamentId);
  if (!tournament || !tournament.bracket) throw new Error('Giải đấu chưa có sơ đồ nhánh đấu.');

  const tournamentMatches = state.matches.filter((m) => m.tournamentId === tournamentId);
  const result = recordMatchResult(tournament.bracket, tournamentMatches, matchId, scoreA, scoreB);

  const otherMatches = state.matches.filter((m) => m.tournamentId !== tournamentId);
  const updatedTournamentMatches = tournamentMatches.map((m) => {
    if (m.id === matchId) {
      return {
        ...m,
        scoreA,
        scoreB,
        winnerRegistrationId: result.winnerRegistrationId,
      };
    }
    return m;
  });

  let championRegistrationId = tournament.championRegistrationId;
  let status = tournament.status;

  if (result.championRegistrationId) {
    championRegistrationId = result.championRegistrationId;
    status = 'finished';
  }

  const updatedTournaments = state.tournaments.map((t) =>
    t.id === tournamentId ? { ...t, championRegistrationId, status } : t,
  );

  return {
    ...state,
    tournaments: updatedTournaments,
    matches: [...otherMatches, ...updatedTournamentMatches],
    activityLogs: prependActivity(state.activityLogs, {
      id: `activity-${Date.now()}`,
      occurredAt: new Date().toISOString(),
      actorName: 'Ban tổ chức',
      action: result.championRegistrationId
        ? `đã cập nhật trận chung kết và xác định Nhà vô địch giải ${tournament.name}!`
        : `đã cập nhật kết quả trận đấu trong giải ${tournament.name}`,
    }),
  };
}

export function addCourtByOrganizer(
  state: DemoState,
  input: { name: string; venue: string; courtNumber: number },
): DemoState {
  validateCourtInput(state, input);
  const court: Court = {
    id: `court-${Date.now()}`,
    name: input.name.trim(),
    venue: input.venue.trim(),
    courtNumber: input.courtNumber,
  };

  return {
    ...state,
    courts: [...state.courts, court],
    activityLogs: prependActivity(state.activityLogs, {
      id: `activity-${Date.now()}`,
      occurredAt: new Date().toISOString(),
      actorName: 'Ban tổ chức',
      action: `đã thêm sân đấu mới: ${court.name} (${court.venue})`,
    }),
  };
}

export function updateCourtByOrganizer(
  state: DemoState,
  courtId: string,
  input: { name: string; venue: string; courtNumber: number },
): DemoState {
  if (!state.courts.some((court) => court.id === courtId)) throw new Error('Không tìm thấy sân đấu.');
  validateCourtInput(state, input, courtId);
  const updatedCourt = { id: courtId, name: input.name.trim(), venue: input.venue.trim(), courtNumber: input.courtNumber };
  return {
    ...state,
    courts: state.courts.map((court) => court.id === courtId ? updatedCourt : court),
    activityLogs: prependActivity(state.activityLogs, {
      id: `activity-${Date.now()}`,
      occurredAt: new Date().toISOString(),
      actorName: 'Ban tổ chức',
      action: `đã cập nhật sân đấu: ${updatedCourt.name} (${updatedCourt.venue})`,
    }),
  };
}

export function deleteCourtByOrganizer(state: DemoState, courtId: string): DemoState {
  const court = state.courts.find((item) => item.id === courtId);
  if (!court) throw new Error('Không tìm thấy sân đấu.');
  if (state.matches.some((match) => match.courtId === courtId)) {
    throw new Error('Không thể xóa sân đang được lịch thi đấu sử dụng.');
  }
  return {
    ...state,
    courts: state.courts.filter((item) => item.id !== courtId),
    activityLogs: prependActivity(state.activityLogs, {
      id: `activity-${Date.now()}`,
      occurredAt: new Date().toISOString(),
      actorName: 'Ban tổ chức',
      action: `đã xóa sân đấu: ${court.name} (${court.venue})`,
    }),
  };
}

export function addRefereeByOrganizer(
  state: DemoState,
  input: { name: string; phone: string; certification: string },
): DemoState {
  validateRefereeInput(input);
  const referee: Referee = {
    id: `ref-${Date.now()}`,
    name: input.name.trim(),
    phone: input.phone.trim(),
    certification: input.certification.trim(),
  };

  return {
    ...state,
    referees: [...state.referees, referee],
    activityLogs: prependActivity(state.activityLogs, {
      id: `activity-${Date.now()}`,
      occurredAt: new Date().toISOString(),
      actorName: 'Ban tổ chức',
      action: `đã thêm trọng tài mới: ${referee.name}`,
    }),
  };
}

export function updateRefereeByOrganizer(
  state: DemoState,
  refereeId: string,
  input: { name: string; phone: string; certification: string },
): DemoState {
  if (!state.referees.some((referee) => referee.id === refereeId)) throw new Error('Không tìm thấy trọng tài.');
  validateRefereeInput(input);
  const updatedReferee = { id: refereeId, name: input.name.trim(), phone: input.phone.trim(), certification: input.certification.trim() };
  return {
    ...state,
    referees: state.referees.map((referee) => referee.id === refereeId ? updatedReferee : referee),
    activityLogs: prependActivity(state.activityLogs, {
      id: `activity-${Date.now()}`,
      occurredAt: new Date().toISOString(),
      actorName: 'Ban tổ chức',
      action: `đã cập nhật thông tin trọng tài: ${updatedReferee.name}`,
    }),
  };
}

export function deleteRefereeByOrganizer(state: DemoState, refereeId: string): DemoState {
  const referee = state.referees.find((item) => item.id === refereeId);
  if (!referee) throw new Error('Không tìm thấy trọng tài.');
  if (state.matches.some((match) => match.refereeId === refereeId)) {
    throw new Error('Không thể xóa trọng tài đang được lịch thi đấu phân công.');
  }
  return {
    ...state,
    referees: state.referees.filter((item) => item.id !== refereeId),
    activityLogs: prependActivity(state.activityLogs, {
      id: `activity-${Date.now()}`,
      occurredAt: new Date().toISOString(),
      actorName: 'Ban tổ chức',
      action: `đã xóa trọng tài: ${referee.name}`,
    }),
  };
}

function validateCourtInput(
  state: DemoState,
  input: { name: string; venue: string; courtNumber: number },
  currentId?: string,
) {
  if (!input.name.trim() || !input.venue.trim()) throw new Error('Vui lòng nhập tên sân và địa điểm.');
  if (!Number.isInteger(input.courtNumber) || input.courtNumber < 1) throw new Error('Số thứ tự sân phải là số nguyên dương.');
  if (state.courts.some((court) =>
    court.id !== currentId && court.venue.toLocaleLowerCase() === input.venue.trim().toLocaleLowerCase() && court.courtNumber === input.courtNumber
  )) {
    throw new Error('Số thứ tự sân này đã được sử dụng tại địa điểm.');
  }
}

function validateRefereeInput(input: { name: string; phone: string; certification: string }) {
  if (!input.name.trim() || !input.certification.trim()) throw new Error('Vui lòng nhập họ tên và chứng chỉ trọng tài.');
  if (input.phone.replace(/\D/g, '').length < 9) throw new Error('Số điện thoại trọng tài chưa hợp lệ.');
}
