import { Navigate, Route, Routes, useParams } from 'react-router-dom';
import { DesignSystemShowcase } from './design-system/Showcase';
import { AppShell } from './layout/AppShell';
import { DemoRoleProvider } from './layout/DemoRoleProvider';
import { NotFoundPage } from './layout/PlaceholderPage';
import { AccountProfilePage } from './layout/AccountProfilePage';
import { ToastProvider } from './design-system/components';
import { CourseDetailPage, CourseMarketplace } from './student/CourseMarketplace';
import { RegistrationConfirmation } from './student/RegistrationConfirmation';
import {
  CourseCheckout, MyCoursesPage, MyTournamentsPage,
  PaymentHistoryPage, StudentProfilePage, TournamentDetailPage,
  TournamentMarketplace, TournamentRegistrationPage,
} from './student/StudentJourney';
import {
  CoachCourseListPage, CoachCreateCoursePage, CoachDashboardPage, CoachEditCoursePage,
  CoachProPage, CoachProfilePage, CoachRevenuePage,
  CoachSchedulePage, CoachStudentListPage,
} from './coach/CoachJourney';
import { AdminActivityLogPage, AdminAssumptionsPage, AdminFinancePage } from './admin/AdminJourney';
import {
  AdminAccountsPage, AdminCoachesPage, AdminCoursesPage,
  AdminStudentsPage, AdminSystemDashboardPage, AdminTransactionsPage,
} from './admin/SystemAdminJourney';
import {
  OrganizerCreateTournamentPage, OrganizerDashboardPage, OrganizerOperationsPage,
  OrganizerResultsPage, OrganizerSchedulePage, OrganizerTournamentDetailPage,
  OrganizerTournamentListPage,
} from './organizer/OrganizerJourney';

function LegacyTournamentRedirect() {
  const { tournamentId } = useParams();
  return <Navigate to={`/organizer/tournaments/${tournamentId ?? ''}`} replace/>;
}

export function App() {
  return (
    <ToastProvider>
      <DemoRoleProvider>
        <Routes>
          <Route path="/design-system" element={<DesignSystemShowcase />} />
          <Route element={<AppShell />}>
            <Route path="/" element={<Navigate to="/courses" replace />} />

            {/* Student Routes */}
            <Route path="/courses" element={<CourseMarketplace />} />
            <Route path="/courses/:courseId" element={<CourseDetailPage />} />
            <Route path="/courses/:courseId/checkout" element={<CourseCheckout />} />
            <Route path="/tournaments" element={<TournamentMarketplace />} />
            <Route path="/tournaments/:tournamentId" element={<TournamentDetailPage />} />
            <Route path="/tournaments/:tournamentId/register" element={<TournamentRegistrationPage />} />
            <Route path="/me/courses" element={<MyCoursesPage />} />
            <Route path="/me/tournaments" element={<MyTournamentsPage />} />
            <Route path="/me/payments" element={<PaymentHistoryPage />} />
            <Route path="/me/profile" element={<StudentProfilePage />} />
            <Route path="/me/confirmation/:kind/:recordId" element={<RegistrationConfirmation />} />

            {/* Coach Routes */}
            <Route path="/coach" element={<Navigate to="/coach/dashboard" replace />} />
            <Route path="/coach/dashboard" element={<CoachDashboardPage />} />
            <Route path="/coach/courses" element={<CoachCourseListPage />} />
            <Route path="/coach/courses/new" element={<CoachCreateCoursePage />} />
            <Route path="/coach/courses/:courseId/edit" element={<CoachEditCoursePage />} />
            <Route path="/coach/students" element={<CoachStudentListPage />} />
            <Route path="/coach/schedule" element={<CoachSchedulePage />} />
            <Route path="/coach/revenue" element={<CoachRevenuePage />} />
            <Route path="/coach/pro" element={<CoachProPage />} />
            <Route path="/coach/profile" element={<CoachProfilePage />} />

            {/* System Admin Routes */}
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/admin/dashboard" element={<AdminSystemDashboardPage />} />
            <Route path="/admin/accounts" element={<AdminAccountsPage />} />
            <Route path="/admin/coaches" element={<AdminCoachesPage />} />
            <Route path="/admin/students" element={<AdminStudentsPage />} />
            <Route path="/admin/courses" element={<AdminCoursesPage />} />
            <Route path="/admin/transactions" element={<AdminTransactionsPage />} />
            <Route path="/admin/reports" element={<AdminFinancePage />} />
            <Route path="/admin/finance" element={<Navigate to="/admin/reports" replace />} />
            <Route path="/admin/settings" element={<AdminAssumptionsPage />} />
            <Route path="/admin/assumptions" element={<Navigate to="/admin/settings" replace />} />
            <Route path="/admin/activity" element={<AdminActivityLogPage />} />
            <Route path="/admin/profile" element={<AccountProfilePage role="admin" />} />

            {/* Organizer Routes */}
            <Route path="/organizer" element={<Navigate to="/organizer/dashboard" replace />} />
            <Route path="/organizer/dashboard" element={<OrganizerDashboardPage />} />
            <Route path="/organizer/tournaments" element={<OrganizerTournamentListPage />} />
            <Route path="/organizer/tournaments/new" element={<OrganizerCreateTournamentPage />} />
            <Route path="/organizer/tournaments/:tournamentId" element={<OrganizerTournamentDetailPage />} />
            <Route path="/organizer/operations" element={<OrganizerOperationsPage />} />
            <Route path="/organizer/schedule" element={<OrganizerSchedulePage />} />
            <Route path="/organizer/results" element={<OrganizerResultsPage />} />
            <Route path="/organizer/profile" element={<AccountProfilePage role="organizer" />} />

            {/* Preserve deep links from the former combined Admin/Organizer menu */}
            <Route path="/admin/tournaments" element={<Navigate to="/organizer/tournaments" replace />} />
            <Route path="/admin/tournaments/new" element={<Navigate to="/organizer/tournaments/new" replace />} />
            <Route path="/admin/tournaments/:tournamentId" element={<LegacyTournamentRedirect />} />
            <Route path="/admin/schedule" element={<Navigate to="/organizer/schedule" replace />} />
            <Route path="/admin/results" element={<Navigate to="/organizer/results" replace />} />
            <Route path="/admin/operations" element={<Navigate to="/organizer/operations" replace />} />
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </DemoRoleProvider>
    </ToastProvider>
  );
}
