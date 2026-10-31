import type { DemoState, Payment, Student, TournamentRegistration } from './types';

export type PaymentMethod = Payment['method'];
export interface CheckoutInput { name: string; phone: string; email?: string; method: PaymentMethod; }
export interface RegistrationInput extends CheckoutInput { partnerName?: string; }
export interface FlowResult { state: DemoState; recordId: string; }

export function validateCheckout(input: CheckoutInput): string | null {
  if (!input.name.trim()) return 'Vui lòng nhập họ tên.';
  if (!input.phone.trim()) return 'Vui lòng nhập số điện thoại.';
  if (input.phone.replace(/\D/g, '').length < 9) return 'Số điện thoại chưa hợp lệ.';
  return null;
}

function nextId(prefix: string) {
  return `${prefix}-${globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`}`;
}

function paymentRecord(input: {
  id: string; kind: Payment['kind']; referenceId: string; payerName: string;
  amount: number; paymentFee: number; method: PaymentMethod; createdAt: string;
}): Payment {
  return { ...input, status: 'completed', simulated: true };
}

function profileForCheckout(state: DemoState, input: CheckoutInput): Student {
  const index = state.students.findIndex((student) => student.id === state.currentStudentId);
  const current = state.students[index];
  const next: Student = {
    ...current,
    name: input.name.trim(),
    phone: input.phone.trim(),
    email: input.email?.trim() || current.email,
  };
  state.students[index] = next;
  return next;
}

export function createCourseEnrollment(
  original: DemoState,
  courseId: string,
  input: CheckoutInput,
  now = new Date().toISOString(),
): FlowResult {
  const validationError = validateCheckout(input);
  if (validationError) throw new Error(validationError);
  const state = structuredClone(original);
  const course = state.courses.find((item) => item.id === courseId && item.status === 'published');
  if (!course) throw new Error('Không tìm thấy khóa học này.');
  if (state.enrollments.some((item) => item.courseId === courseId && item.studentId === state.currentStudentId)) {
    throw new Error('Bạn đã đăng ký khóa học này rồi.');
  }
  const enrolled = state.enrollments.filter((item) => item.courseId === courseId).length;
  if (enrolled >= course.maxStudents) throw new Error('Khóa học đã đủ số lượng.');

  const student = profileForCheckout(state, input);
  const enrollmentId = nextId('enrollment');
  const paymentId = nextId('payment');
  const paymentFee = Math.round(course.price * state.settings.paymentFeePercent / 100);
  state.enrollments.push({
    id: enrollmentId, courseId, studentId: student.id, studentName: student.name,
    price: course.price, commission: Math.round(course.price * state.settings.commissionPercent / 100),
    paymentFee, isCurrentStudent: true, completed: false, reviewed: false,
    createdAt: now, paymentId, isSeed: false,
  });
  state.payments.push(paymentRecord({
    id: paymentId, kind: 'course', referenceId: enrollmentId, payerName: student.name,
    amount: course.price, paymentFee, method: input.method, createdAt: now,
  }));
  state.funnel.paymentsCompleted += 1;
  state.activityLogs.unshift({
    id: nextId('activity'), occurredAt: now, actorName: student.name,
    action: `đăng ký khóa học “${course.title}” (thanh toán mô phỏng)`,
  });
  state.activityLogs = state.activityLogs.slice(0, 80);
  return { state, recordId: enrollmentId };
}

export function createTournamentRegistration(
  original: DemoState,
  tournamentId: string,
  input: RegistrationInput,
  now = new Date().toISOString(),
): FlowResult {
  const validationError = validateCheckout(input);
  if (validationError) throw new Error(validationError);
  const state = structuredClone(original);
  const tournament = state.tournaments.find((item) => item.id === tournamentId);
  if (!tournament) throw new Error('Không tìm thấy giải đấu này.');
  if (tournament.status !== 'open') throw new Error('Giải đấu đã đóng đăng ký.');
  if (state.tournamentRegistrations.some((item) =>
    item.tournamentId === tournamentId &&
    item.studentId === state.currentStudentId &&
    item.reviewStatus !== 'rejected'
  )) {
    throw new Error('Bạn đã đăng ký giải đấu này rồi.');
  }
  const count = state.tournamentRegistrations.filter(
    (item) => item.tournamentId === tournamentId && item.reviewStatus !== 'rejected',
  ).length;
  if (count >= tournament.maxRegistrations) throw new Error('Giải đấu đã đủ số lượng.');
  if (tournament.format === 'doubles' && !input.partnerName?.trim()) throw new Error('Vui lòng nhập tên đồng đội.');

  const student = profileForCheckout(state, input);
  const registrationId = nextId('registration');
  const paymentId = nextId('payment');
  const paymentFee = Math.round(tournament.fee * state.settings.paymentFeePercent / 100);
  const registration: TournamentRegistration = {
    id: registrationId, tournamentId, studentId: student.id, participantName: student.name,
    partnerName: tournament.format === 'doubles' ? input.partnerName!.trim() : '',
    isCurrentStudent: true, fee: tournament.fee, paymentFee, createdAt: now, paymentId,
    reviewStatus: 'pending',
  };
  state.tournamentRegistrations.push(registration);
  state.payments.push(paymentRecord({
    id: paymentId, kind: 'tournament', referenceId: registrationId, payerName: student.name,
    amount: tournament.fee, paymentFee, method: input.method, createdAt: now,
  }));
  state.activityLogs.unshift({
    id: nextId('activity'), occurredAt: now, actorName: student.name,
    action: `đăng ký giải đấu “${tournament.name}” (thanh toán mô phỏng)`,
  });
  state.activityLogs = state.activityLogs.slice(0, 80);
  return { state, recordId: registrationId };
}

export function getStudentCourses(state: DemoState) {
  const ids = new Set(state.enrollments.filter((item) => item.studentId === state.currentStudentId).map((item) => item.courseId));
  return state.courses.filter((course) => ids.has(course.id));
}

export function getStudentTournaments(state: DemoState) {
  const ids = new Set(
    state.tournamentRegistrations
      .filter((item) => item.studentId === state.currentStudentId)
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
      .map((item) => item.tournamentId),
  );
  return state.tournaments.filter((tournament) => ids.has(tournament.id));
}

export function getStudentPayments(state: DemoState) {
  const enrollmentIds = new Set(state.enrollments.filter((item) => item.studentId === state.currentStudentId).map((item) => item.id));
  const registrationIds = new Set(state.tournamentRegistrations.filter((item) => item.studentId === state.currentStudentId).map((item) => item.id));
  return state.payments
    .filter((payment) => payment.kind === 'course' ? enrollmentIds.has(payment.referenceId)
      : payment.kind === 'tournament' ? registrationIds.has(payment.referenceId) : false)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function updateStudentProfile(original: DemoState, values: Pick<Student, 'name' | 'phone' | 'email' | 'area' | 'level'>) {
  if (!values.name.trim()) throw new Error('Vui lòng nhập họ tên.');
  if (values.phone.replace(/\D/g, '').length < 9) throw new Error('Số điện thoại chưa hợp lệ.');
  if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) throw new Error('Email chưa hợp lệ.');
  const state = structuredClone(original);
  const index = state.students.findIndex((student) => student.id === state.currentStudentId);
  if (index < 0) throw new Error('Không tìm thấy hồ sơ học viên demo.');
  state.students[index] = { ...state.students[index], ...values, name: values.name.trim(), phone: values.phone.trim(), email: values.email.trim() };
  return state;
}
