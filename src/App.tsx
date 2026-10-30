import { Navigate, Route, Routes } from 'react-router-dom';
import { DesignSystemShowcase } from './design-system/Showcase';
import { AppShell } from './layout/AppShell';
import { DemoRoleProvider } from './layout/DemoRoleProvider';
import { NotFoundPage, PlaceholderPage } from './layout/PlaceholderPage';
import { ToastProvider } from './design-system/components';
import { ROLE_NAVIGATION, type DemoRole } from './navigation/roleNavigation';
import { CourseDetailPage, CourseMarketplace } from './student/CourseMarketplace';
import { CourseCheckout, MyCoursesPage, MyTournamentsPage, PaymentHistoryPage, StudentProfilePage, TournamentDetailPage, TournamentMarketplace, TournamentRegistrationPage } from './student/StudentJourney';

export function App() {
  return <ToastProvider><DemoRoleProvider><Routes>
    <Route path="/design-system" element={<DesignSystemShowcase/>}/>
    <Route element={<AppShell/>}>
      <Route path="/" element={<Navigate to="/courses" replace/>}/>
      <Route path="/courses" element={<CourseMarketplace/>}/>
      <Route path="/courses/:courseId" element={<CourseDetailPage/>}/>
      <Route path="/courses/:courseId/checkout" element={<CourseCheckout/>}/>
      <Route path="/tournaments" element={<TournamentMarketplace/>}/>
      <Route path="/tournaments/:tournamentId" element={<TournamentDetailPage/>}/>
      <Route path="/tournaments/:tournamentId/register" element={<TournamentRegistrationPage/>}/>
      <Route path="/me/courses" element={<MyCoursesPage/>}/>
      <Route path="/me/tournaments" element={<MyTournamentsPage/>}/>
      <Route path="/me/payments" element={<PaymentHistoryPage/>}/>
      <Route path="/me/profile" element={<StudentProfilePage/>}/>
      {(Object.entries(ROLE_NAVIGATION) as [DemoRole, typeof ROLE_NAVIGATION[DemoRole]][]).flatMap(([, items]) =>
        items.map((item) => <Route key={item.to} path={item.to} element={<PlaceholderPage/>}/>),
      )}
    </Route>
    <Route path="*" element={<NotFoundPage/>}/>
  </Routes></DemoRoleProvider></ToastProvider>;
}
