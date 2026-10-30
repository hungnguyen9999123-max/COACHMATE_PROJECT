import { describe, expect, it } from 'vitest';
import { createSeedState } from '../data/seed';
import { createDemoRepository, type StorageLike } from '../data/repository';
import {
  createCourseEnrollment,
  createTournamentRegistration,
  getStudentCourses,
  getStudentPayments,
  getStudentTournaments,
  updateStudentProfile,
  validateCheckout,
} from './studentFlows';

const valid = { name: 'Nguyễn An Nhiên', phone: '0903281186', email: 'annhien@coachmate.demo', method: 'Ví MoMo' as const };

describe('student demo flows', () => {
  it('validates required checkout fields and phone number', () => {
    expect(validateCheckout({ ...valid, name: ' ' })).toBe('Vui lòng nhập họ tên.');
    expect(validateCheckout({ ...valid, phone: '123' })).toBe('Số điện thoại chưa hợp lệ.');
    expect(validateCheckout(valid)).toBeNull();
  });

  it('creates a simulated course enrollment and matching payment once', () => {
    const seed = createSeedState();
    const result = createCourseEnrollment(seed, 'k1', valid, '2026-10-30T10:00:00+07:00');
    const enrollment = result.state.enrollments.find((item) => item.id === result.recordId)!;
    const payment = result.state.payments.find((item) => item.id === enrollment.paymentId)!;
    expect(enrollment).toMatchObject({ courseId: 'k1', studentId: seed.currentStudentId, price: 1_200_000, commission: 120_000, paymentFee: 24_000, isCurrentStudent: true });
    expect(payment).toMatchObject({ kind: 'course', amount: 1_200_000, simulated: true, status: 'completed', method: 'Ví MoMo' });
    expect(() => createCourseEnrollment(result.state, 'k1', valid)).toThrow('Bạn đã đăng ký khóa học này rồi.');
    expect(() => createCourseEnrollment(seed, 'k2', valid)).toThrow('Khóa học đã đủ số lượng.');
  });

  it('creates a singles tournament registration and simulated payment', () => {
    const result = createTournamentRegistration(createSeedState(), 't1', valid, '2026-10-30T10:00:00+07:00');
    expect(result.state.tournamentRegistrations.at(-1)).toMatchObject({ tournamentId: 't1', participantName: valid.name, partnerName: '', isCurrentStudent: true, fee: 250_000 });
    expect(result.state.payments.at(-1)).toMatchObject({ kind: 'tournament', amount: 250_000, paymentFee: 5_000, simulated: true });
    expect(() => createTournamentRegistration(result.state, 't1', valid)).toThrow('Bạn đã đăng ký giải đấu này rồi.');
  });

  it('validates doubles partner and rejects closed or full tournaments', () => {
    const state = createSeedState();
    expect(() => createTournamentRegistration(state, 't2', valid)).toThrow('Vui lòng nhập tên đồng đội.');
    expect(() => createTournamentRegistration(state, 't2', { ...valid, partnerName: 'Bạn đánh đôi' })).not.toThrow();
    expect(() => createTournamentRegistration({ ...state, tournaments: state.tournaments.map((item) => item.id === 't1' ? { ...item, status: 'closed' } : item) }, 't1', valid)).toThrow('Giải đấu đã đóng đăng ký.');
    const full = { ...state, tournamentRegistrations: [...state.tournamentRegistrations, ...Array.from({length: 23},(_,i)=>({id:`full-${i}`,tournamentId:'t1',participantName:`Đăng ký ${i}`,partnerName:'',isCurrentStudent:false,fee:250000,paymentFee:5000,createdAt:'2026-10-01',paymentId:`pay-${i}`}))] };
    expect(() => createTournamentRegistration(full, 't1', valid)).toThrow('Giải đấu đã đủ số lượng.');
  });

  it('returns only current-student activity and related payments', () => {
    let state = createSeedState();
    state = createCourseEnrollment(state, 'k1', valid, '2026-10-30T10:00:00+07:00').state;
    state = createTournamentRegistration(state, 't1', valid, '2026-10-30T10:00:00+07:00').state;
    expect(getStudentCourses(state).map((item) => item.id)).toEqual(['k1']);
    expect(getStudentTournaments(state).map((item) => item.id)).toEqual(['t1']);
    expect(getStudentPayments(state).map((item) => item.kind)).toEqual(['course', 'tournament']);
  });

  it('validates and persists editable profile fields through repository state', () => {
    const state = createSeedState();
    expect(() => updateStudentProfile(state, { name: '', phone: '0903281186', email: '', area: 'Quận 7', level: 'Cơ bản' })).toThrow('Vui lòng nhập họ tên.');
    expect(() => updateStudentProfile(state, { name: 'Demo', phone: '0903281186', email: 'bad', area: 'Quận 7', level: 'Cơ bản' })).toThrow('Email chưa hợp lệ.');
    const updated = updateStudentProfile(state, { name: 'Nguyễn An Nhiên mới', phone: '0912345678', email: 'new@demo.vn', area: 'Thủ Đức', level: 'Trung cấp' });
    expect(updated.students.find((item) => item.id === updated.currentStudentId)).toMatchObject({ name: 'Nguyễn An Nhiên mới', phone: '0912345678', area: 'Thủ Đức', level: 'Trung cấp' });
    const values = new Map<string, string>();
    const storage: StorageLike = { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => { values.set(key, value); }, removeItem: (key) => { values.delete(key); } };
    const repository = createDemoRepository(storage);
    repository.save(updated);
    expect(repository.load().students.find((item) => item.id === updated.currentStudentId)?.email).toBe('new@demo.vn');
  });
});
