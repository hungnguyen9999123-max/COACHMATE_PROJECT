import type { CourseType, ScheduleType, SkillLevel, ValidationStatus } from './types';

export const AREAS = ['Quận 1', 'Quận 7', 'Bình Thạnh', 'Tân Bình', 'Thủ Đức'] as const;

export const LEVELS: SkillLevel[] = ['Mới bắt đầu', 'Cơ bản', 'Trung cấp', 'Nâng cao'];

export const SCHEDULE_TYPES: ScheduleType[] = ['Tối trong tuần', 'Cuối tuần'];

export const COURSE_TYPE_LABELS: Record<CourseType, string> = {
  beginner: 'Beginner Course',
  clinic: 'Skill Clinic',
  group: 'Group Course',
  individual: 'Individual Course',
  advanced: 'Advanced Training',
};

export const BUSINESS_ASSUMPTIONS = [
  'Người chơi muốn tìm khóa học cầu lông qua một nền tảng mới',
  'HLV sẵn sàng tạo khóa học trên CoachMate',
  'HLV chấp nhận mức hoa hồng',
  'Người học sẵn sàng thanh toán online',
  'Lớp nhóm đủ người đăng ký',
  'Người chơi sẵn sàng tham gia giải do CoachMate tổ chức',
  'Mức lệ phí giải phù hợp',
  'Chi phí sân và trọng tài cho phép giải có lãi',
  'Người chơi quay lại đăng ký khóa học hoặc giải tiếp theo',
] as const;

export const VALIDATION_STATUSES: ValidationStatus[] = [
  'Chưa kiểm chứng',
  'Đang kiểm chứng',
  'Đã xác nhận',
  'Bị bác bỏ',
];
