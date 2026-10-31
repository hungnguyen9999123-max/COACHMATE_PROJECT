import type {
  Coach,
  Course,
  DemoState,
  Enrollment,
  FinancialRecord,
  Payment,
  Student,
  TournamentRegistration,
} from '../domain/types';

export const PARTICIPANT_NAMES = [
  'Phạm Gia Huy',
  'Võ Thanh Trúc',
  'Đặng Minh Quân',
  'Bùi Ngọc Anh',
  'Hoàng Đức Long',
  'Ngô Khánh Linh',
  'Lý Anh Tuấn',
  'Đỗ Hải Yến',
  'Trịnh Bảo Châu',
  'Vũ Quang Vinh',
  'Mai Phương Thảo',
  'Huỳnh Tấn Phát',
  'Phan Thu Trang',
  'Dương Quốc Khánh',
  'Lâm Gia Bảo',
  'Tạ Thùy Dương',
  'Cao Nhật Minh',
  'Đinh Hồng Nhung',
  'Châu Việt Hùng',
  'Kim Ngân',
  'Tô Hoài Nam',
  'Lương Bích Ngọc',
  'Ông Gia Khiêm',
  'Quách Mỹ Linh',
  'Thái Đình Phong',
  'Diệp Khánh Vy',
  'Hà Tuấn Kiệt',
  'Âu Thanh Hằng',
  'Từ Minh Triết',
  'La Bảo Anh',
] as const;

export const CURRENT_STUDENT: Student = {
  id: 'student-demo',
  name: 'Nguyễn An Nhiên',
  phone: '090 328 1186',
  email: 'annhien@coachmate.vn',
  area: 'Quận 7',
  level: 'Cơ bản',
};

export const DEMO_PROFILES = {
  student: { name: 'Nguyễn An Nhiên', meta: 'Học viên · Quận 7' },
  coach: { name: 'Nguyễn Minh Khang', meta: 'HLV · Quận 7' },
  admin: { name: 'Mai Anh', meta: 'Quản trị hệ thống' },
  organizer: { name: 'Ban tổ chức CoachMate', meta: 'Vận hành giải đấu' },
} as const;

export const SYSTEM_DEMO_ACCOUNTS = [
  { id: 'demo-admin', name: DEMO_PROFILES.admin.name, email: 'admin@coachmate.vn', role: 'admin' as const },
  { id: 'demo-organizer', name: DEMO_PROFILES.organizer.name, email: 'organizer@coachmate.vn', role: 'organizer' as const },
] as const;

export const SAMPLE_NOTIFICATIONS = [
  { title: 'Lớp học sắp bắt đầu', detail: 'Cầu lông nền tảng · 19:00 hôm nay', tone: 'green' },
  { title: 'Có học viên mới', detail: 'Lê Hoàng Nam vừa đăng ký', tone: 'lime' },
  { title: 'Giải đấu mới', detail: 'Mini Cup #1 · 06 tháng 12', tone: 'blue' },
] as const;

export function profileForRole(role: keyof typeof DEMO_PROFILES) {
  return DEMO_PROFILES[role];
}

function createStudents(): Student[] {
  const levels: Student['level'][] = ['Mới bắt đầu', 'Cơ bản', 'Trung cấp', 'Nâng cao'];
  const areas = ['Quận 7', 'Bình Thạnh', 'Thủ Đức', 'Tân Bình', 'Quận 1'];

  return [
    CURRENT_STUDENT,
    ...PARTICIPANT_NAMES.map((name, index) => ({
      id: `student-${index + 1}`,
      name,
      phone: `09${String(10000000 + index * 1739).slice(-8)}`,
      email: `hocvien${String(index + 1).padStart(2, '0')}@coachmate.vn`,
      area: areas[index % areas.length],
      level: levels[index % levels.length],
    })),
  ];
}

export const coaches: Coach[] = [
  {
    id: 'c1',
    name: 'Nguyễn Minh Khang',
    bio: 'HLV cấp 1, 8 năm dạy cầu lông phong trào và sinh viên.',
    area: 'Quận 7',
    ratingSum: 58,
    ratingCount: 12,
    specialties: ['Nền tảng', 'Chiến thuật thi đấu', 'Lớp nhóm'],
  },
  {
    id: 'c2',
    name: 'Trần Thu Hà',
    bio: '5 năm dạy lớp nhóm nhỏ, mạnh về di chuyển và phòng thủ.',
    area: 'Bình Thạnh',
    ratingSum: 37,
    ratingCount: 8,
    specialties: ['Footwork', 'Phòng thủ', 'Phản xạ'],
  },
  {
    id: 'c3',
    name: 'Lê Quốc Bảo',
    bio: 'Cựu vận động viên cấp thành phố, 10 năm huấn luyện.',
    area: 'Thủ Đức',
    ratingSum: 92,
    ratingCount: 19,
    specialties: ['Smash', 'Đánh đôi', 'Huấn luyện nâng cao'],
  },
];

export const courses: Course[] = [
  {
    id: 'k1',
    coachId: 'c1',
    title: 'Cầu lông cho người mới: 8 buổi nền tảng',
    type: 'beginner',
    level: 'Mới bắt đầu',
    area: 'Quận 7',
    venue: 'Sân CL Phú Mỹ Hưng',
    startDate: '2026-11-10',
    sessions: 8,
    minutesPerSession: 90,
    days: 'Thứ 3 - Thứ 5',
    time: '19:00-20:30',
    scheduleType: 'Tối trong tuần',
    maxStudents: 8,
    minStudents: 4,
    price: 1_200_000,
    goal: 'Cầm vợt đúng, đánh được cầu cơ bản và hiểu luật chơi.',
    curriculum: ['Cách cầm vợt', 'Footwork cơ bản', 'Serve, clear, drop', 'Luật chơi cơ bản'],
    requirement: 'Không yêu cầu',
    status: 'published',
    coverImageUrl: 'https://i.pinimg.com/736x/06/01/eb/0601eb8c56d7299258f1137e9f5630ae.jpg',
  },
  {
    id: 'k2',
    coachId: 'c3',
    title: 'Smash Clinic: 4 buổi',
    type: 'clinic',
    level: 'Trung cấp',
    area: 'Thủ Đức',
    venue: 'CLB Cầu lông Linh Trung',
    startDate: '2026-11-14',
    sessions: 4,
    minutesPerSession: 90,
    days: 'Thứ 7',
    time: '08:00-09:30',
    scheduleType: 'Cuối tuần',
    maxStudents: 6,
    minStudents: 3,
    price: 800_000,
    goal: 'Tăng lực và độ chính xác của cú smash.',
    curriculum: ['Tư thế và phát lực', 'Smash thuận tay', 'Smash sau nhảy', 'Phối hợp smash và bồi cầu'],
    requirement: 'Đã đánh được clear hết sân',
    status: 'published',
    coverImageUrl: 'https://i.pinimg.com/736x/90/06/ed/9006ed4743956f3ff533ace503e111b9.jpg',
  },
  {
    id: 'k3',
    coachId: 'c2',
    title: 'Footwork và phòng thủ nhóm nhỏ',
    type: 'group',
    level: 'Cơ bản',
    area: 'Bình Thạnh',
    venue: 'Sân CL Bạch Đằng',
    startDate: '2026-11-12',
    sessions: 10,
    minutesPerSession: 90,
    days: 'Thứ 2 - Thứ 4',
    time: '18:30-20:00',
    scheduleType: 'Tối trong tuần',
    maxStudents: 8,
    minStudents: 4,
    price: 1_500_000,
    goal: 'Di chuyển gọn hơn và đỡ được cầu khó.',
    curriculum: ['Bước chân 6 điểm', 'Đỡ cầu smash', 'Phòng thủ đôi', 'Bài tập phản xạ'],
    requirement: 'Biết luật và đánh được cầu cơ bản',
    status: 'published',
    coverImageUrl: 'https://i.pinimg.com/736x/42/dd/ba/42ddbae22f232ead84f6e34cc3f7c26b.jpg',
  },
  {
    id: 'k4',
    coachId: 'c3',
    title: 'Kèm 1-1 chiến thuật đánh đôi',
    type: 'individual',
    level: 'Trung cấp',
    area: 'Thủ Đức',
    venue: 'CLB Cầu lông Linh Trung',
    startDate: '2026-11-16',
    sessions: 6,
    minutesPerSession: 60,
    days: 'Linh hoạt',
    time: 'Theo lịch hẹn',
    scheduleType: 'Cuối tuần',
    maxStudents: 1,
    minStudents: 1,
    price: 3_000_000,
    goal: 'Xoay vòng vị trí và phối hợp với bạn đánh đôi.',
    curriculum: ['Xoay vòng công thủ', 'Giao tiếp với đồng đội', 'Phân tích video trận đấu'],
    requirement: 'Đã chơi đôi ít nhất 3 tháng',
    status: 'published',
    coverImageUrl: 'https://i.pinimg.com/1200x/65/b7/5d/65b75d963fbced252e06aa4142700886.jpg',
  },
  {
    id: 'k5',
    coachId: 'c1',
    title: 'Luyện thi đấu nâng cao',
    type: 'advanced',
    level: 'Nâng cao',
    area: 'Quận 7',
    venue: 'Sân CL Phú Mỹ Hưng',
    startDate: '2026-11-18',
    sessions: 12,
    minutesPerSession: 120,
    days: 'Thứ 4 - Thứ 6',
    time: '19:00-21:00',
    scheduleType: 'Tối trong tuần',
    maxStudents: 8,
    minStudents: 5,
    price: 2_400_000,
    goal: 'Chuẩn bị thể lực và chiến thuật cho giải phong trào.',
    curriculum: ['Thể lực chuyên biệt', 'Chiến thuật đơn', 'Tập trận có điều kiện', 'Quản lý áp lực'],
    requirement: 'Đã tham gia ít nhất một giải phong trào',
    status: 'published',
    coverImageUrl: 'https://i.pinimg.com/736x/ff/ef/49/ffef49aad3e26541e699d5dc1a31f1fc.jpg',
  },
  {
    id: 'k6',
    coachId: 'c1',
    title: 'Chiến thuật đánh đơn nâng cao',
    type: 'advanced',
    level: 'Nâng cao',
    area: 'Quận 7',
    venue: 'Sân CL Phú Mỹ Hưng',
    startDate: '2026-11-22',
    sessions: 8,
    minutesPerSession: 90,
    days: 'Thứ 7 - Chủ Nhật',
    time: '17:00-18:30',
    scheduleType: 'Cuối tuần',
    maxStudents: 6,
    minStudents: 3,
    price: 2_000_000,
    goal: 'Khai thác điểm yếu đối thủ và kiểm soát nhịp độ trận đấu.',
    curriculum: ['Đọc bài đối thủ', 'Điều cầu 4 góc', 'Kỹ thuật bỏ nhỏ sát lưới', 'Tâm lý thi đấu đơn'],
    requirement: 'Có trình độ trung cấp trở lên',
    status: 'published',
    coverImageUrl: 'https://i.pinimg.com/736x/53/ae/b5/53aeb52f27066bb401e5f2308425d5e1.jpg',
  },
  {
    id: 'k7',
    coachId: 'c2',
    title: 'Kỹ thuật giao cầu và phản tạt',
    type: 'clinic',
    level: 'Cơ bản',
    area: 'Bình Thạnh',
    venue: 'Sân CL Bạch Đằng',
    startDate: '2026-11-25',
    sessions: 4,
    minutesPerSession: 90,
    days: 'Thứ 3',
    time: '18:00-19:30',
    scheduleType: 'Tối trong tuần',
    maxStudents: 8,
    minStudents: 4,
    price: 900_000,
    goal: 'Làm chủ cú giao cầu ngắn/dài và cướp công ngay từ quả phản tạt.',
    curriculum: ['Giao cầu nhỏ sát lưới', 'Giao cầu sâu cuối sân', 'Phản tạt cầu nhanh', 'Bắt bài quả giao cầu'],
    requirement: 'Đã biết chơi cầu cơ bản',
    status: 'published',
    coverImageUrl: 'https://i.pinimg.com/1200x/37/a5/ea/37a5ea11b1441f1003934768c6a1982f.jpg',
  },
  {
    id: 'k8',
    coachId: 'c2',
    title: 'Cầu lông thiếu nhi & thanh thiếu niên',
    type: 'beginner',
    level: 'Mới bắt đầu',
    area: 'Bình Thạnh',
    venue: 'Sân CL Bạch Đằng',
    startDate: '2026-11-28',
    sessions: 10,
    minutesPerSession: 90,
    days: 'Thứ 7 - Chủ Nhật',
    time: '08:30-10:00',
    scheduleType: 'Cuối tuần',
    maxStudents: 10,
    minStudents: 5,
    price: 1_300_000,
    goal: 'Phát triển thể chất, tư duy phản xạ và niềm yêu thích môn cầu lông.',
    curriculum: ['Khởi động và dẻo dai', 'Kỹ thuật cầm vợt chuẩn', 'Footwork vui nhộn', 'Trò chơi phản xạ'],
    requirement: 'Dành cho độ tuổi từ 8-16',
    status: 'published',
    coverImageUrl: 'https://i.pinimg.com/736x/c5/47/43/c5474345a4ab4e3f1129624779a25439.jpg',
  },
  {
    id: 'k9',
    coachId: 'c3',
    title: 'Rèn luyện thể lực và tốc độ di chuyển',
    type: 'group',
    level: 'Trung cấp',
    area: 'Thủ Đức',
    venue: 'CLB Cầu lông Linh Trung',
    startDate: '2026-12-01',
    sessions: 8,
    minutesPerSession: 90,
    days: 'Thứ 2 - Thứ 6',
    time: '20:00-21:30',
    scheduleType: 'Tối trong tuần',
    maxStudents: 8,
    minStudents: 4,
    price: 1_600_000,
    goal: 'Tăng sức bền, tốc độ bứt tốc và khả năng phục hồi giữa các pha cầu dài.',
    curriculum: ['Bài tập Agility Ladder', 'Bứt tốc sân đấu', 'Tăng sức bền tim mạch', 'Phục hồi và chống chấn thương'],
    requirement: 'Không bị chấn thương khớp gối hoặc tim mạch',
    status: 'published',
    coverImageUrl: 'https://i.pinimg.com/1200x/73/6b/b5/736bb54fc1c23207673ae0c426cf7a3a.jpg',
  },
];

function createEnrollments(students: Student[]): Enrollment[] {
  const seedCounts: Record<string, number> = {
    k1: 5, k2: 6, k3: 2, k4: 0, k5: 3,
    k6: 0, k7: 0, k8: 0, k9: 0,
  };
  const enrollments: Enrollment[] = [];
  let sequence = 0;

  courses.forEach((course) => {
    for (let index = 0; index < seedCounts[course.id]; index += 1) {
      sequence += 1;
      const name = PARTICIPANT_NAMES[(sequence * 3) % PARTICIPANT_NAMES.length];
      const student = students.find((candidate) => candidate.name === name)!;
      enrollments.push({
        id: `e${sequence}`,
        courseId: course.id,
        studentId: student.id,
        studentName: student.name,
        price: course.price,
        commission: Math.round(course.price * 0.1),
        paymentFee: Math.round(course.price * 0.02),
        isCurrentStudent: false,
        completed: false,
        reviewed: false,
        createdAt: `2026-10-${String(2 + sequence).padStart(2, '0')}T10:00:00+07:00`,
        paymentId: `pay-course-${sequence}`,
        isSeed: true,
      });
    }
  });

  return enrollments;
}

function createTournamentRegistrations(students: Student[]): TournamentRegistration[] {
  const registrations: TournamentRegistration[] = [];

  for (let index = 0; index < 9; index += 1) {
    const name = PARTICIPANT_NAMES[(index * 2 + 1) % PARTICIPANT_NAMES.length];
    registrations.push({
      id: `r${index + 1}`,
      tournamentId: 't1',
      studentId: students.find((student) => student.name === name)?.id,
      participantName: name,
      partnerName: '',
      isCurrentStudent: false,
      fee: 250_000,
      paymentFee: 5_000,
      createdAt: `2026-10-${String(11 + index).padStart(2, '0')}T14:00:00+07:00`,
      paymentId: `pay-tournament-${index + 1}`,
    });
  }

  for (let index = 0; index < 3; index += 1) {
    const name = PARTICIPANT_NAMES[index + 10];
    registrations.push({
      id: `r${index + 20}`,
      tournamentId: 't2',
      studentId: students.find((student) => student.name === name)?.id,
      participantName: name,
      partnerName: PARTICIPANT_NAMES[index + 16],
      isCurrentStudent: false,
      fee: 400_000,
      paymentFee: 8_000,
      createdAt: `2026-10-${String(20 + index).padStart(2, '0')}T16:30:00+07:00`,
      paymentId: `pay-tournament-${index + 20}`,
    });
  }

  return registrations;
}

function createPayments(
  enrollments: Enrollment[],
  registrations: TournamentRegistration[],
): Payment[] {
  return [
    ...enrollments.map<Payment>((enrollment) => ({
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
    ...registrations.map<Payment>((registration) => ({
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
    {
      id: 'pay-subscription-1',
      kind: 'subscription',
      referenceId: 's1',
      payerName: 'Nguyễn Minh Khang',
      amount: 99_000,
      paymentFee: 0,
      method: 'Thẻ ATM / Visa',
      status: 'completed',
      simulated: true,
      createdAt: '2026-10-01T09:00:00+07:00',
    },
  ];
}

function createFinancialRecords(
  enrollments: Enrollment[],
  registrations: TournamentRegistration[],
): FinancialRecord[] {
  const commissionRecords = enrollments.map<FinancialRecord>((enrollment) => ({
    id: `fin-commission-${enrollment.id}`,
    type: 'course_commission',
    referenceId: enrollment.id,
    amount: enrollment.commission,
    occurredAt: enrollment.createdAt,
    note: `Hoa hồng khóa học từ ${enrollment.studentName}`,
  }));
  const feeRecords = enrollments.map<FinancialRecord>((enrollment) => ({
    id: `fin-fee-${enrollment.id}`,
    type: 'payment_fee',
    referenceId: enrollment.id,
    amount: -enrollment.paymentFee,
    occurredAt: enrollment.createdAt,
    note: 'Phí thanh toán mô phỏng cho đăng ký khóa học',
  }));
  const tournamentHoldRecords = registrations.map<FinancialRecord>((registration) => ({
    id: `fin-hold-${registration.id}`,
    type: 'tournament_hold',
    referenceId: registration.id,
    amount: registration.fee,
    occurredAt: registration.createdAt,
    note: 'Lệ phí giải đang tạm giữ',
  }));

  return [
    ...commissionRecords,
    ...feeRecords,
    ...tournamentHoldRecords,
    {
      id: 'fin-subscription-s1',
      type: 'subscription_revenue',
      referenceId: 's1',
      amount: 99_000,
      occurredAt: '2026-10-01T09:00:00+07:00',
      note: 'Coach Pro tháng 10/2026',
    },
  ];
}

export function createSeedState(): DemoState {
  const students = createStudents();
  const enrollments = createEnrollments(students);
  const tournamentRegistrations = createTournamentRegistrations(students);

  return {
    version: 2,
    currentStudentId: CURRENT_STUDENT.id,
    settings: {
      commissionPercent: 10,
      paymentFeePercent: 2,
      coachProMonthlyPrice: 99_000,
    },
    students,
    coaches,
    courses,
    enrollments,
    tournaments: [
      {
        id: 't1',
        name: 'CoachMate Mini Cup #1',
        format: 'singles',
        level: 'Phong trào',
        date: '2026-12-06',
        venue: 'Nhà thi đấu Quận 7 (thuê theo sự kiện)',
        fee: 250_000,
        registrationDeadline: '2026-11-25',
        maxRegistrations: 32,
        minRegistrations: 20,
        courtCount: 4,
        prize: 'Cúp, huy chương và 1.500.000đ tiền thưởng',
        rules: 'Đơn nam/nữ phong trào, thi đấu loại trực tiếp, 21 điểm, 3 set.',
        coverImageUrl: 'https://i.pinimg.com/736x/06/01/eb/0601eb8c56d7299258f1137e9f5630ae.jpg',
        costPlan: {
          court: 2_000_000,
          staff: 600_000,
          prize: 1_500_000,
          miscellaneous: 300_000,
          refereePerMatch: 60_000,
        },
        status: 'open',
        bracket: null,
        championRegistrationId: null,
      },
      {
        id: 't2',
        name: 'Đôi Nam Nữ Cuối Năm',
        format: 'doubles',
        level: 'Phong trào',
        date: '2026-12-20',
        venue: 'Nhà thi đấu Bình Thạnh (thuê theo sự kiện)',
        fee: 400_000,
        registrationDeadline: '2026-12-10',
        maxRegistrations: 16,
        minRegistrations: 10,
        courtCount: 3,
        prize: 'Cúp và 2.000.000đ tiền thưởng',
        rules: 'Đôi nam nữ phong trào, loại trực tiếp, 21 điểm, 3 set.',
        coverImageUrl: 'https://i.pinimg.com/736x/90/06/ed/9006ed4743956f3ff533ace503e111b9.jpg',
        costPlan: {
          court: 1_800_000,
          staff: 500_000,
          prize: 2_000_000,
          miscellaneous: 300_000,
          refereePerMatch: 60_000,
        },
        status: 'open',
        bracket: null,
        championRegistrationId: null,
      },
      {
        id: 't3',
        name: 'Giải Vô Địch Đơn Nam/Nữ Mở Rộng 2026',
        format: 'singles',
        level: 'Bán chuyên',
        date: '2026-12-28',
        venue: 'Nhà thi đấu Thủ Đức (thuê theo sự kiện)',
        fee: 300_000,
        registrationDeadline: '2026-12-18',
        maxRegistrations: 32,
        minRegistrations: 16,
        courtCount: 4,
        prize: 'Cúp, huy chương vàng và 3.000.000đ tiền thưởng',
        rules: 'Thi đấu đơn nam/nữ bán chuyên, loại trực tiếp 3 set 21 điểm.',
        coverImageUrl: 'https://i.pinimg.com/1200x/65/b7/5d/65b75d963fbced252e06aa4142700886.jpg',
        costPlan: {
          court: 2_500_000,
          staff: 800_000,
          prize: 3_000_000,
          miscellaneous: 400_000,
          refereePerMatch: 60_000,
        },
        status: 'open',
        bracket: null,
        championRegistrationId: null,
      },
      {
        id: 't4',
        name: 'CoachMate Doubles Championship 2026',
        format: 'doubles',
        level: 'Phong trào',
        date: '2027-01-10',
        venue: 'Nhà thi đấu Quận 1 (thuê theo sự kiện)',
        fee: 500_000,
        registrationDeadline: '2026-12-30',
        maxRegistrations: 16,
        minRegistrations: 8,
        courtCount: 4,
        prize: 'Cúp vô địch + 4.000.000đ tiền thưởng',
        rules: 'Đôi nam/nữ phong trào mở rộng, loại trực tiếp.',
        coverImageUrl: 'https://i.pinimg.com/736x/ff/ef/49/ffef49aad3e26541e699d5dc1a31f1fc.jpg',
        costPlan: {
          court: 2_200_000,
          staff: 700_000,
          prize: 4_000_000,
          miscellaneous: 500_000,
          refereePerMatch: 60_000,
        },
        status: 'open',
        bracket: null,
        championRegistrationId: null,
      },
      {
        id: 't5',
        name: 'Giải Cầu Lông Mùa Xuân - Spring Cup 2027',
        format: 'singles',
        level: 'Phong trào',
        date: '2027-01-22',
        venue: 'Nhà thi đấu Tân Bình (thuê theo sự kiện)',
        fee: 200_000,
        registrationDeadline: '2027-01-12',
        maxRegistrations: 32,
        minRegistrations: 16,
        courtCount: 3,
        prize: 'Huy chương và 2.500.000đ tiền thưởng',
        rules: 'Thi đấu đơn phong trào nam/nữ, loại trực tiếp.',
        coverImageUrl: 'https://i.pinimg.com/736x/53/ae/b5/53aeb52f27066bb401e5f2308425d5e1.jpg',
        costPlan: {
          court: 1_800_000,
          staff: 600_000,
          prize: 2_500_000,
          miscellaneous: 300_000,
          refereePerMatch: 60_000,
        },
        status: 'open',
        bracket: null,
        championRegistrationId: null,
      },
    ],
    tournamentRegistrations,
    matches: [],
    courts: [
      ...Array.from({ length: 4 }, (_, index) => ({
        id: `court-q7-${index + 1}`,
        name: `Sân ${index + 1}`,
        venue: 'Nhà thi đấu Quận 7 (thuê theo sự kiện)',
        courtNumber: index + 1,
      })),
      ...Array.from({ length: 3 }, (_, index) => ({
        id: `court-bt-${index + 1}`,
        name: `Sân ${index + 1}`,
        venue: 'Nhà thi đấu Bình Thạnh (thuê theo sự kiện)',
        courtNumber: index + 1,
      })),
    ],
    referees: [
      { id: 'ref-1', name: 'Trọng tài Hải', phone: '090 411 2388', certification: 'Cấp thành phố' },
      { id: 'ref-2', name: 'Trọng tài Lan', phone: '093 662 7401', certification: 'Cấp thành phố' },
      { id: 'ref-3', name: 'Trọng tài Đạt', phone: '098 214 9057', certification: 'Cấp quận' },
    ],
    payments: createPayments(enrollments, tournamentRegistrations),
    subscriptions: [
      {
        id: 's1',
        coachId: 'c1',
        amount: 99_000,
        months: 1,
        startDate: '2026-10-01',
        active: true,
        paymentId: 'pay-subscription-1',
      },
    ],
    financialRecords: createFinancialRecords(enrollments, tournamentRegistrations),
    activityLogs: [
      {
        id: 'activity-1',
        occurredAt: '2026-10-22T16:30:00+07:00',
        actorName: 'Mai Phương Thảo',
        action: 'đăng ký giải Đôi Nam Nữ Cuối Năm (thanh toán mô phỏng)',
      },
      {
        id: 'activity-2',
        occurredAt: '2026-10-18T14:00:00+07:00',
        actorName: 'Đỗ Hải Yến',
        action: 'đăng ký CoachMate Mini Cup #1 (thanh toán mô phỏng)',
      },
      {
        id: 'activity-3',
        occurredAt: '2026-10-12T10:00:00+07:00',
        actorName: 'Trần Thu Hà',
        action: 'cập nhật kế hoạch khóa Footwork và phòng thủ nhóm nhỏ',
      },
    ],
    funnel: {
      courseDetailViews: 58,
      checkoutStarts: 24,
      paymentsCompleted: 16,
    },
    assumptionStatuses: {},
  };
}
