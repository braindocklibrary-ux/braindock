import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AdminAuthProvider, useAdminAuth } from './context/AdminAuthContext';
import AdminSidebar from './components/AdminSidebar';
import AdminHeader from './components/AdminHeader';

// Pages
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboard from './pages/AdminDashboard';
import BooksManagement from './pages/BooksManagement';
import CirculationManagement from './pages/CirculationManagement';
import MembersManagement from './pages/MembersManagement';
import StaffManagement from './pages/StaffManagement';
import FacilitiesManagement from './pages/FacilitiesManagement';
import FinancialManagement from './pages/FinancialManagement';
import EventsAnnouncements from './pages/EventsAnnouncements';
import ContentManagement from './pages/ContentManagement';
import ReportsPage from './pages/ReportsPage';
import AuditLogsPage from './pages/AuditLogsPage';
import AdminSettings from './pages/AdminSettings';
import OwnerPortal from './pages/OwnerPortal';

// Redirect legacy /student-lms directly to Official Student Portal on Port 5173
function RedirectToOfficialStudentPortal() {
  React.useEffect(() => {
    window.location.replace('http://localhost:5173/student-portal');
  }, []);
  return null;
}

// Protected Route Guard for Super Admin
function SuperAdminGuard({ children }) {
  const { isAuthenticated } = useAdminAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

// Public Route Guard (Redirects to Admin Dashboard if already logged in)
function LoginRouteGuard() {
  const { isAuthenticated } = useAdminAuth();
  if (isAuthenticated) {
    return <Navigate to="/owner-portal" replace />;
  }
  return <AdminLoginPage />;
}

export default function App() {
  return (
    <AdminAuthProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          {/* Public Super Admin Login Screen */}
          <Route path="/login" element={<LoginRouteGuard />} />

          {/* Redirect /student-lms directly to Official Student Portal on Port 5173 */}
          <Route path="/student-lms" element={<RedirectToOfficialStudentPortal />} />

          {/* Strictly Protected Super Admin & Owner ERP Portal */}
          <Route path="/*" element={
            <SuperAdminGuard>
              <div className="flex min-h-screen bg-[#F8FAFC] text-slate-800">
                <AdminSidebar />
                
                <div className="flex-1 flex flex-col min-w-0">
                  <AdminHeader />
                  <main className="flex-1 overflow-y-auto bg-[#F8FAFC]">
                    <Routes>
                      <Route path="/" element={<OwnerPortal />} />
                      <Route path="/dashboard" element={<AdminDashboard />} />
                      <Route path="/owner-portal" element={<OwnerPortal />} />
                      <Route path="/books" element={<BooksManagement />} />
                      <Route path="/circulation" element={<CirculationManagement />} />
                      <Route path="/reservations" element={<CirculationManagement />} />
                      <Route path="/members" element={<MembersManagement />} />
                      <Route path="/staff" element={<StaffManagement />} />
                      <Route path="/facilities" element={<FacilitiesManagement />} />
                      <Route path="/financials" element={<FinancialManagement />} />
                      <Route path="/events" element={<EventsAnnouncements />} />
                      <Route path="/content" element={<ContentManagement />} />
                      <Route path="/reports" element={<ReportsPage />} />
                      <Route path="/audit-logs" element={<AuditLogsPage />} />
                      <Route path="/settings" element={<AdminSettings />} />
                      {/* Redirect old roles page to settings */}
                      <Route path="/roles" element={<Navigate to="/settings" replace />} />
                      <Route path="*" element={<Navigate to="/owner-portal" replace />} />
                    </Routes>
                  </main>
                </div>
              </div>
            </SuperAdminGuard>
          } />
        </Routes>
      </BrowserRouter>
    </AdminAuthProvider>
  );
}
