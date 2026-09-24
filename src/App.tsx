import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';

import { PublicLayout } from './layouts/PublicLayout';
import { AuthLayout } from './layouts/AuthLayout';
import { StudentLayout } from './layouts/StudentLayout';
import { ModeratorLayout } from './layouts/ModeratorLayout';
import { AdminLayout } from './layouts/AdminLayout';

import { Home } from './pages/Home/Home';
import { Books } from './pages/Books/Books';
import { Categories } from './pages/Categories/Categories';
import { About } from './pages/About/About';
import { HowItWorks } from './pages/HowItWorks/HowItWorks';
import { Login } from './pages/Auth/Login';
import { Register } from './pages/Auth/Register';
import { ForgotPassword } from './pages/Auth/ForgotPassword';
import { ResetPassword } from './pages/Auth/ResetPassword';
import { VerifyEmail } from './pages/Auth/VerifyEmail';

import { StudentDashboard } from './pages/Student/StudentDashboard';
import { StudentBrowseBooks } from './pages/Student/StudentBrowseBooks';
import { BookDetail } from './pages/Student/BookDetail';
import { StudentSearch } from './pages/Student/StudentSearch';
import { MyLibrary } from './pages/Student/MyLibrary';
import { Reservations } from './pages/Student/Reservations';
import { BookRequests } from './pages/Student/BookRequests';
import { DigitalLibrary } from './pages/Student/DigitalLibrary';
import { EReader } from './pages/Student/EReader';
import { Wishlist } from './pages/Student/Wishlist';
import { Reviews } from './pages/Student/Reviews';
import { Notifications } from './pages/Student/Notifications';
import { Profile } from './pages/Student/Profile';
import { Settings } from './pages/Student/Settings';
import Showcase from './pages/Showcase/Showcase';

import { ModDashboard } from './pages/Moderator/ModDashboard';
import { ModBooks } from './pages/Moderator/ModBooks';
import { ModInventory } from './pages/Moderator/ModInventory';
import { ModStudents } from './pages/Moderator/ModStudents';
import { ModBorrowing } from './pages/Moderator/ModBorrowing';
import { ModReturns } from './pages/Moderator/ModReturns';
import { ModReservations } from './pages/Moderator/ModReservations';
import { ModRequests } from './pages/Moderator/ModRequests';
import { ModFines } from './pages/Moderator/ModFines';
import { ModDigitalLibrary } from './pages/Moderator/ModDigitalLibrary';
import { ModReports } from './pages/Moderator/ModReports';
import { ModActivity } from './pages/Moderator/ModActivity';

import { AdminDashboard } from './pages/Admin/AdminDashboard';
import { AdminUsers } from './pages/Admin/AdminUsers';
import { AdminModerators } from './pages/Admin/AdminModerators';
import { AdminRoles } from './pages/Admin/AdminRoles';
import { AdminPermissions } from './pages/Admin/AdminPermissions';
import { AdminBooks } from './pages/Admin/AdminBooks';
import { AdminInventory } from './pages/Admin/AdminInventory';
import { AdminBorrowing } from './pages/Admin/AdminBorrowing';
import { AdminReturns } from './pages/Admin/AdminReturns';
import { AdminReservations } from './pages/Admin/AdminReservations';
import { AdminRequests } from './pages/Admin/AdminRequests';
import { AdminFines } from './pages/Admin/AdminFines';
import { AdminDigitalLibrary } from './pages/Admin/AdminDigitalLibrary';
import { AdminAcquisition } from './pages/Admin/AdminAcquisition';
import { AdminReports } from './pages/Admin/AdminReports';
import { AdminAnalytics } from './pages/Admin/AdminAnalytics';
import { AdminNotifications } from './pages/Admin/AdminNotifications';
import { AdminAuditLogs } from './pages/Admin/AdminAuditLogs';
import { AdminSecurity } from './pages/Admin/AdminSecurity';
import { AdminSettings } from './pages/Admin/AdminSettings';
import { AdminBackup } from './pages/Admin/AdminBackup';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<PublicLayout />}>
            <Route index element={<Home />} />
            <Route path="books" element={<Books />} />
            <Route path="categories" element={<Categories />} />
            <Route path="about" element={<About />} />
            <Route path="how-it-works" element={<HowItWorks />} />
          </Route>

          {/* Auth Routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
          </Route>

          {/* STUDENT PORTAL (Strictly STUDENT role only) */}
          <Route element={<ProtectedRoute allowedRole="STUDENT" />}>
            <Route path="/student" element={<StudentLayout />}>
              <Route index element={<StudentDashboard />} />
              <Route path="books" element={<StudentBrowseBooks />} />
              <Route path="books/:id" element={<BookDetail />} />
              <Route path="search" element={<StudentSearch />} />
              <Route path="library" element={<MyLibrary />} />
              <Route path="reservations" element={<Reservations />} />
              <Route path="requests" element={<BookRequests />} />
              <Route path="digital-library" element={<DigitalLibrary />} />
              <Route path="wishlist" element={<Wishlist />} />
              <Route path="reviews" element={<Reviews />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="profile" element={<Profile />} />
              <Route path="settings" element={<Settings />} />
            </Route>
            <Route path="/student/reader/:id" element={<EReader />} />
          </Route>
          
          {/* MODERATOR PORTAL (Strictly MODERATOR role only) */}
          <Route element={<ProtectedRoute allowedRole="MODERATOR" />}>
            <Route path="/moderator" element={<ModeratorLayout />}>
              <Route index element={<ModDashboard />} />
              <Route path="books" element={<ModBooks />} />
              <Route path="inventory" element={<ModInventory />} />
              <Route path="students" element={<ModStudents />} />
              <Route path="borrowing" element={<ModBorrowing />} />
              <Route path="returns" element={<ModReturns />} />
              <Route path="reservations" element={<ModReservations />} />
              <Route path="requests" element={<ModRequests />} />
              <Route path="fines" element={<ModFines />} />
              <Route path="digital-library" element={<ModDigitalLibrary />} />
              <Route path="reports" element={<ModReports />} />
              <Route path="activity" element={<ModActivity />} />
            </Route>
          </Route>

          {/* ADMIN PORTAL (Strictly ADMINISTRATOR role only) */}
          <Route element={<ProtectedRoute allowedRole="ADMINISTRATOR" />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="moderators" element={<AdminModerators />} />
              <Route path="roles" element={<AdminRoles />} />
              <Route path="permissions" element={<AdminPermissions />} />
              <Route path="books" element={<AdminBooks />} />
              <Route path="inventory" element={<AdminInventory />} />
              <Route path="borrowing" element={<AdminBorrowing />} />
              <Route path="returns" element={<AdminReturns />} />
              <Route path="reservations" element={<AdminReservations />} />
              <Route path="requests" element={<AdminRequests />} />
              <Route path="fines" element={<AdminFines />} />
              <Route path="digital-library" element={<AdminDigitalLibrary />} />
              <Route path="acquisition" element={<AdminAcquisition />} />
              <Route path="reports" element={<AdminReports />} />
              <Route path="analytics" element={<AdminAnalytics />} />
              <Route path="notifications" element={<AdminNotifications />} />
              <Route path="audit-logs" element={<AdminAuditLogs />} />
              <Route path="security" element={<AdminSecurity />} />
              <Route path="settings" element={<AdminSettings />} />
              <Route path="backup" element={<AdminBackup />} />
            </Route>
          </Route>

          <Route path="/reader/:id" element={<EReader />} />
          <Route path="/showcase" element={<Showcase />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
