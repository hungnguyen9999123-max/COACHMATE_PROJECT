import { createSeedState } from './seed';
import type {
  Coach,
  Course,
  DemoState,
  Enrollment,
  Match,
  Payment,
  Student,
  Tournament,
  TournamentRegistration,
} from '../domain/types';

export const DEMO_STORAGE_KEY = 'coachmate-demo-state-v2';
export const LEGACY_STORAGE_KEY = 'coachmate-cp3-mvp-v1';

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export interface DemoRepository {
  load(): DemoState;
  save(state: DemoState): void;
  reset(): DemoState;
}

function cloneState(state: DemoState): DemoState {
  return JSON.parse(JSON.stringify(state)) as DemoState;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isValidAccountOverrides(value: unknown) {
  if (value === undefined) return true;
  if (!isRecord(value)) return false;
  return Object.values(value).every((override) =>
    isRecord(override) &&
    ['student', 'coach', 'admin', 'organizer'].includes(String(override.role)) &&
    ['active', 'suspended'].includes(String(override.status)),
  );
}

function isDemoState(value: unknown): value is DemoState {
  return (
    isRecord(value) &&
    value.version === 2 &&
    Array.isArray(value.students) &&
    Array.isArray(value.coaches) &&
    Array.isArray(value.courses) &&
    Array.isArray(value.enrollments) &&
    Array.isArray(value.tournaments) &&
    Array.isArray(value.tournamentRegistrations) &&
    Array.isArray(value.matches) &&
    Array.isArray(value.payments) &&
    isValidAccountOverrides(value.accountOverrides)
  );
}

function numberOr(value: unknown, fallback: number) {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function stringOr(value: unknown, fallback: string) {
  return typeof value === 'string' ? value : fallback;
}

function booleanOr(value: unknown, fallback: boolean) {
  return typeof value === 'boolean' ? value : fallback;
}

function migrateLegacyState(value: unknown): DemoState | null {
  if (!isRecord(value) || value.v !== 1) return null;

  const migrated = createSeedState();
  const legacySettings = isRecord(value.settings) ? value.settings : {};
  migrated.settings = {
    commissionPercent: numberOr(legacySettings.commission, migrated.settings.commissionPercent),
    paymentFeePercent: numberOr(legacySettings.payFee, migrated.settings.paymentFeePercent),
    coachProMonthlyPrice: numberOr(legacySettings.proPrice, migrated.settings.coachProMonthlyPrice),
  };

  if (Array.isArray(value.coaches)) {
    migrated.coaches = value.coaches.filter(isRecord).map<Coach>((legacyCoach) => ({
      id: stringOr(legacyCoach.id, cryptoId('coach')),
      name: stringOr(legacyCoach.name, 'Huấn luyện viên'),
      bio: stringOr(legacyCoach.bio, ''),
      area: stringOr(legacyCoach.area, ''),
      ratingSum: numberOr(legacyCoach.rSum, 0),
      ratingCount: numberOr(legacyCoach.rCnt, 0),
      specialties: [],
    }));
  }

  if (Array.isArray(value.courses)) {
    migrated.courses = value.courses.filter(isRecord).map<Course>((legacyCourse) => ({
      id: stringOr(legacyCourse.id, cryptoId('course')),
      coachId: stringOr(legacyCourse.coachId, ''),
      title: stringOr(legacyCourse.title, 'Khóa học'),
      type: ['beginner', 'clinic', 'group', 'individual', 'advanced'].includes(
        stringOr(legacyCourse.type, ''),
      )
        ? (legacyCourse.type as Course['type'])
        : 'group',
      level: stringOr(legacyCourse.level, 'Cơ bản') as Course['level'],
      area: stringOr(legacyCourse.area, ''),
      venue: stringOr(legacyCourse.venue, ''),
      startDate: stringOr(legacyCourse.start, ''),
      sessions: numberOr(legacyCourse.sessions, 1),
      minutesPerSession: numberOr(legacyCourse.mins, 60),
      days: stringOr(legacyCourse.days, ''),
      time: stringOr(legacyCourse.time, ''),
      scheduleType: stringOr(legacyCourse.sched, 'Tối trong tuần') as Course['scheduleType'],
      maxStudents: numberOr(legacyCourse.max, 1),
      minStudents: numberOr(legacyCourse.min, 1),
      price: numberOr(legacyCourse.price, 0),
      goal: stringOr(legacyCourse.goal, ''),
      curriculum: Array.isArray(legacyCourse.content)
        ? legacyCourse.content.filter((item): item is string => typeof item === 'string')
        : [],
      requirement: stringOr(legacyCourse.req, ''),
      status: 'published',
    }));
  }

  const studentByName = new Map(migrated.students.map((student) => [student.name, student]));
  const ensureStudent = (name: string, isCurrentStudent: boolean) => {
    if (isCurrentStudent) return migrated.currentStudentId;
    const existing = studentByName.get(name);
    if (existing) return existing.id;
    const student: Student = {
      id: cryptoId('student'),
      name,
      phone: '',
      email: '',
      area: '',
      level: 'Cơ bản',
    };
    migrated.students.push(student);
    studentByName.set(name, student);
    return student.id;
  };

  if (Array.isArray(value.enrollments)) {
    migrated.enrollments = value.enrollments.filter(isRecord).map<Enrollment>((legacyEnrollment, index) => {
      const name = stringOr(legacyEnrollment.name, 'Học viên');
      const isCurrentStudent = booleanOr(legacyEnrollment.mine, false);
      return {
        id: stringOr(legacyEnrollment.id, cryptoId('enrollment')),
        courseId: stringOr(legacyEnrollment.courseId, ''),
        studentId: ensureStudent(name, isCurrentStudent),
        studentName: name,
        price: numberOr(legacyEnrollment.price, 0),
        commission: numberOr(legacyEnrollment.commission, 0),
        paymentFee: numberOr(legacyEnrollment.payFee, 0),
        isCurrentStudent,
        completed: booleanOr(legacyEnrollment.done, false),
        reviewed: booleanOr(legacyEnrollment.reviewed, false),
        createdAt: `2026-10-${String(Math.min(28, index + 2)).padStart(2, '0')}T10:00:00+07:00`,
        paymentId: `migrated-course-payment-${index + 1}`,
        isSeed: booleanOr(legacyEnrollment.sample, false),
      };
    });
  }

  if (Array.isArray(value.regs)) {
    migrated.tournamentRegistrations = value.regs
      .filter(isRecord)
      .map<TournamentRegistration>((legacyRegistration, index) => {
        const name = stringOr(legacyRegistration.name, 'Người chơi');
        const isCurrentStudent = booleanOr(legacyRegistration.mine, false);
        return {
          id: stringOr(legacyRegistration.id, cryptoId('registration')),
          tournamentId: stringOr(legacyRegistration.tid, ''),
          studentId: ensureStudent(name, isCurrentStudent),
          participantName: name,
          partnerName: stringOr(legacyRegistration.partner, ''),
          isCurrentStudent,
          fee: numberOr(legacyRegistration.fee, 0),
          paymentFee: numberOr(legacyRegistration.payFee, 0),
          createdAt: `2026-10-${String(Math.min(28, index + 11)).padStart(2, '0')}T14:00:00+07:00`,
          paymentId: `migrated-tournament-payment-${index + 1}`,
        };
      });
  }

  const migratedMatches: Match[] = [];
  if (Array.isArray(value.tournaments)) {
    migrated.tournaments = value.tournaments.filter(isRecord).map<Tournament>((legacyTournament) => {
      const tournamentId = stringOr(legacyTournament.id, cryptoId('tournament'));
      const legacyCost = isRecord(legacyTournament.cost) ? legacyTournament.cost : {};
      const tournament: Tournament = {
        id: tournamentId,
        name: stringOr(legacyTournament.name, 'Giải đấu'),
        format: legacyTournament.format === 'doubles' ? 'doubles' : 'singles',
        level: stringOr(legacyTournament.level, 'Phong trào'),
        date: stringOr(legacyTournament.date, ''),
        venue: stringOr(legacyTournament.venue, ''),
        fee: numberOr(legacyTournament.fee, 0),
        registrationDeadline: stringOr(legacyTournament.deadline, ''),
        maxRegistrations: numberOr(legacyTournament.max, 4),
        minRegistrations: numberOr(legacyTournament.min, 2),
        courtCount: numberOr(legacyTournament.courts, 1),
        prize: stringOr(legacyTournament.prize, ''),
        rules: stringOr(legacyTournament.rules, ''),
        costPlan: {
          court: numberOr(legacyCost.court, 0),
          staff: numberOr(legacyCost.staff, 0),
          prize: numberOr(legacyCost.prize, 0),
          miscellaneous: numberOr(legacyCost.misc, 0),
          refereePerMatch: numberOr(legacyCost.ref, 0),
        },
        status:
          legacyTournament.status === 'finished'
            ? 'finished'
            : legacyTournament.status === 'closed'
              ? 'closed'
              : 'open',
        bracket: null,
        championRegistrationId:
          typeof legacyTournament.champion === 'string' ? legacyTournament.champion : null,
      };

      if (isRecord(legacyTournament.bracket) && Array.isArray(legacyTournament.bracket.rounds)) {
        const roundMatchIds: string[][] = [];
        legacyTournament.bracket.rounds.forEach((roundValue, roundIndex) => {
          if (!Array.isArray(roundValue)) return;
          const matchIds: string[] = [];
          roundValue.filter(isRecord).forEach((legacyMatch, matchIndex) => {
            const id = `${tournamentId}-r${roundIndex + 1}-m${matchIndex + 1}`;
            matchIds.push(id);
            migratedMatches.push({
              id,
              tournamentId,
              roundIndex,
              matchIndex,
              participantARegistrationId: typeof legacyMatch.a === 'string' ? legacyMatch.a : null,
              participantBRegistrationId: typeof legacyMatch.b === 'string' ? legacyMatch.b : null,
              scoreA: typeof legacyMatch.sa === 'number' ? legacyMatch.sa : null,
              scoreB: typeof legacyMatch.sb === 'number' ? legacyMatch.sb : null,
              winnerRegistrationId: typeof legacyMatch.w === 'string' ? legacyMatch.w : null,
              isBye: legacyMatch.bye === true,
              courtId: typeof legacyMatch.court === 'number' ? `court-${legacyMatch.court}` : null,
              refereeId: null,
              scheduledTime: typeof legacyMatch.time === 'string' ? legacyMatch.time : null,
            });
          });
          roundMatchIds.push(matchIds);
        });
        tournament.bracket = {
          size: numberOr(legacyTournament.bracket.size, roundMatchIds[0]?.length * 2 || 2),
          roundMatchIds,
        };
      }

      return tournament;
    });
  }
  migrated.matches = migratedMatches;

  if (Array.isArray(value.subs)) {
    migrated.subscriptions = value.subs.filter(isRecord).map((legacySubscription, index) => ({
      id: stringOr(legacySubscription.id, cryptoId('subscription')),
      coachId: stringOr(legacySubscription.coachId, ''),
      amount: numberOr(legacySubscription.amount, 0),
      months: numberOr(legacySubscription.months, 1),
      startDate: stringOr(legacySubscription.date, ''),
      active: legacySubscription.active !== false,
      paymentId: `migrated-subscription-payment-${index + 1}`,
    }));
  }

  const legacyFunnel = isRecord(value.funnel) ? value.funnel : {};
  migrated.funnel = {
    courseDetailViews: numberOr(legacyFunnel.view, 0),
    checkoutStarts: numberOr(legacyFunnel.checkout, 0),
    paymentsCompleted: numberOr(legacyFunnel.paid, 0),
  };
  migrated.assumptionStatuses = isRecord(value.assume)
    ? (value.assume as DemoState['assumptionStatuses'])
    : {};
  migrated.activityLogs = Array.isArray(value.log)
    ? value.log.filter(isRecord).map((entry, index) => ({
        id: `migrated-activity-${index + 1}`,
        occurredAt: new Date(numberOr(entry.t, Date.now())).toISOString(),
        actorName: 'CoachMate Demo',
        action: stringOr(entry.text, ''),
      }))
    : [];

  migrated.payments = createMigratedPayments(migrated);
  migrated.financialRecords = [];
  return migrated;
}

function createMigratedPayments(state: DemoState): Payment[] {
  return [
    ...state.enrollments.map<Payment>((enrollment) => ({
      id: enrollment.paymentId,
      kind: 'course',
      referenceId: enrollment.id,
      payerName: enrollment.studentName,
      amount: enrollment.price,
      paymentFee: enrollment.paymentFee,
      method: 'Ví MoMo',
      status: 'completed',
      simulated: true,
      createdAt: enrollment.createdAt,
    })),
    ...state.tournamentRegistrations.map<Payment>((registration) => ({
      id: registration.paymentId,
      kind: 'tournament',
      referenceId: registration.id,
      payerName: registration.participantName,
      amount: registration.fee,
      paymentFee: registration.paymentFee,
      method: 'Chuyển khoản ngân hàng',
      status: 'completed',
      simulated: true,
      createdAt: registration.createdAt,
    })),
    ...state.subscriptions.map<Payment>((subscription) => ({
      id: subscription.paymentId,
      kind: 'subscription',
      referenceId: subscription.id,
      payerName:
        state.coaches.find((coach) => coach.id === subscription.coachId)?.name ?? 'Huấn luyện viên',
      amount: subscription.amount,
      paymentFee: 0,
      method: 'Thẻ ATM / Visa',
      status: 'completed',
      simulated: true,
      createdAt: `${subscription.startDate}T09:00:00+07:00`,
    })),
  ];
}

function cryptoId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

export function createDemoRepository(storage: StorageLike): DemoRepository {
  return {
    load() {
      try {
        const current = storage.getItem(DEMO_STORAGE_KEY);
        if (current) {
          const parsed: unknown = JSON.parse(current);
          if (isDemoState(parsed)) return cloneState(parsed);
        }

        const legacy = storage.getItem(LEGACY_STORAGE_KEY);
        if (legacy) {
          const migrated = migrateLegacyState(JSON.parse(legacy) as unknown);
          if (migrated) {
            storage.setItem(DEMO_STORAGE_KEY, JSON.stringify(migrated));
            return cloneState(migrated);
          }
        }
      } catch {
        // Invalid or unavailable browser storage falls back to safe seed data.
      }

      return createSeedState();
    },

    save(state) {
      storage.setItem(DEMO_STORAGE_KEY, JSON.stringify(state));
    },

    reset() {
      const seed = createSeedState();
      storage.removeItem(LEGACY_STORAGE_KEY);
      storage.setItem(DEMO_STORAGE_KEY, JSON.stringify(seed));
      return cloneState(seed);
    },
  };
}

export function createBrowserDemoRepository() {
  return createDemoRepository(window.localStorage);
}
