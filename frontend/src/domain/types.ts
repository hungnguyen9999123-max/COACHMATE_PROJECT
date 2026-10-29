export type Id = string;

export type CourseType = 'beginner' | 'clinic' | 'group' | 'individual' | 'advanced';
export type SkillLevel = 'Mới bắt đầu' | 'Cơ bản' | 'Trung cấp' | 'Nâng cao';
export type ScheduleType = 'Tối trong tuần' | 'Cuối tuần';
export type TournamentFormat = 'singles' | 'doubles';
export type TournamentStatus = 'open' | 'closed' | 'finished';
export type ValidationStatus = 'Chưa kiểm chứng' | 'Đang kiểm chứng' | 'Đã xác nhận' | 'Bị bác bỏ';
export type PlatformRole = 'student' | 'coach' | 'admin' | 'organizer';
export type AccountAccessStatus = 'active' | 'suspended';

export interface AdminAccountOverride {
  role: PlatformRole;
  status: AccountAccessStatus;
}

export interface Student {
  id: Id;
  name: string;
  phone: string;
  email: string;
  area: string;
  level: SkillLevel;
  avatarUrl?: string;
}

export interface Coach {
  id: Id;
  name: string;
  bio: string;
  area: string;
  ratingSum: number;
  ratingCount: number;
  specialties: string[];
  avatarUrl?: string;
}

export interface Course {
  id: Id;
  coachId: Id;
  title: string;
  type: CourseType;
  level: SkillLevel;
  area: string;
  venue: string;
  startDate: string;
  sessions: number;
  minutesPerSession: number;
  days: string;
  time: string;
  scheduleType: ScheduleType;
  maxStudents: number;
  minStudents: number;
  price: number;
  goal: string;
  curriculum: string[];
  requirement: string;
  status: 'published' | 'draft' | 'archived';
  coverImageUrl?: string;
}

export interface Enrollment {
  id: Id;
  courseId: Id;
  studentId: Id;
  studentName: string;
  price: number;
  commission: number;
  paymentFee: number;
  isCurrentStudent: boolean;
  completed: boolean;
  reviewed: boolean;
  createdAt: string;
  paymentId: Id;
  isSeed: boolean;
}

export interface TournamentCostPlan {
  court: number;
  staff: number;
  prize: number;
  miscellaneous: number;
  refereePerMatch: number;
}

export interface TournamentBracket {
  size: number;
  roundMatchIds: Id[][];
}

export interface Tournament {
  id: Id;
  name: string;
  format: TournamentFormat;
  level: string;
  date: string;
  venue: string;
  fee: number;
  registrationDeadline: string;
  maxRegistrations: number;
  minRegistrations: number;
  courtCount: number;
  prize: string;
  rules: string;
  costPlan: TournamentCostPlan;
  status: TournamentStatus;
  bracket: TournamentBracket | null;
  championRegistrationId: Id | null;
  coverImageUrl?: string;
}

export interface TournamentRegistration {
  id: Id;
  tournamentId: Id;
  studentId?: Id;
  participantName: string;
  partnerName: string;
  isCurrentStudent: boolean;
  fee: number;
  paymentFee: number;
  createdAt: string;
  paymentId: Id;
  reviewStatus?: 'pending' | 'approved' | 'rejected';
}

export interface Court {
  id: Id;
  name: string;
  venue: string;
  courtNumber: number;
}

export interface Referee {
  id: Id;
  name: string;
  phone: string;
  certification: string;
}

export interface Match {
  id: Id;
  tournamentId: Id;
  roundIndex: number;
  matchIndex: number;
  participantARegistrationId: Id | null;
  participantBRegistrationId: Id | null;
  scoreA: number | null;
  scoreB: number | null;
  winnerRegistrationId: Id | null;
  isBye: boolean;
  courtId: Id | null;
  refereeId: Id | null;
  scheduledTime: string | null;
}

export type PaymentKind = 'course' | 'tournament' | 'subscription';

export interface Payment {
  id: Id;
  kind: PaymentKind;
  referenceId: Id;
  payerName: string;
  amount: number;
  paymentFee: number;
  method: 'Ví MoMo' | 'Chuyển khoản ngân hàng' | 'Thẻ ATM / Visa';
  status: 'completed' | 'refunded';
  simulated: true;
  createdAt: string;
}

export interface CoachProSubscription {
  id: Id;
  coachId: Id;
  amount: number;
  months: number;
  startDate: string;
  active: boolean;
  paymentId: Id;
}

export type Subscription = CoachProSubscription;

export interface FinancialRecord {
  id: Id;
  type: 'course_commission' | 'payment_fee' | 'subscription_revenue' | 'tournament_hold';
  referenceId: Id;
  amount: number;
  occurredAt: string;
  note: string;
}

export interface ActivityLogEntry {
  id: Id;
  occurredAt: string;
  actorName: string;
  action: string;
}

export interface Funnel {
  courseDetailViews: number;
  checkoutStarts: number;
  paymentsCompleted: number;
}

export interface BusinessSettings {
  commissionPercent: number;
  paymentFeePercent: number;
  coachProMonthlyPrice: number;
}

export interface DemoState {
  version: 2;
  currentStudentId: Id;
  settings: BusinessSettings;
  students: Student[];
  coaches: Coach[];
  courses: Course[];
  enrollments: Enrollment[];
  tournaments: Tournament[];
  tournamentRegistrations: TournamentRegistration[];
  matches: Match[];
  courts: Court[];
  referees: Referee[];
  payments: Payment[];
  subscriptions: CoachProSubscription[];
  financialRecords: FinancialRecord[];
  activityLogs: ActivityLogEntry[];
  funnel: Funnel;
  assumptionStatuses: Record<string, ValidationStatus>;
  accountOverrides?: Record<Id, AdminAccountOverride>;
}

export interface CourseFilters {
  query?: string;
  level?: SkillLevel | '';
  area?: string;
  scheduleType?: ScheduleType | '';
  maximumPrice?: number | null;
}
