import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import NotificationDrawer from './components/NotificationDrawer';

// Pages
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import FacilitiesPage from './pages/FacilitiesPage';
import MembershipPage from './pages/MembershipPage';
import CatalogPage from './pages/CatalogPage';
import BookDetailsPage from './pages/BookDetailsPage';
import CategoriesPage from './pages/CategoriesPage';
import AuthorsPage from './pages/AuthorsPage';
import StudyRoomsPage from './pages/StudyRoomsPage';
import SeatBookingPage from './pages/SeatBookingPage';
import RulesPage from './pages/RulesPage';
import EventsPage from './pages/EventsPage';
import AnnouncementsPage from './pages/AnnouncementsPage';
import GalleryPage from './pages/GalleryPage';
import FaqPage from './pages/FaqPage';
import ContactPage from './pages/ContactPage';
import StudentPortalPage from './pages/StudentPortalPage';
import { PrivacyPolicyPage, TermsPage, NotFoundPage } from './pages/TermsPrivacyPages';

export default function App() {
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  return (
    <AuthProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <div className="flex flex-col min-h-screen">
          <Navbar onOpenNotifications={() => setNotificationsOpen(true)} />
          
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/facilities" element={<FacilitiesPage />} />
              <Route path="/membership" element={<MembershipPage />} />
              <Route path="/books" element={<CatalogPage />} />
              <Route path="/books/:id" element={<BookDetailsPage />} />
              <Route path="/categories" element={<CategoriesPage />} />
              <Route path="/authors" element={<AuthorsPage />} />
              <Route path="/study-rooms" element={<StudyRoomsPage />} />
              <Route path="/seats" element={<SeatBookingPage />} />
              <Route path="/rules" element={<RulesPage />} />
              <Route path="/events" element={<EventsPage />} />
              <Route path="/announcements" element={<AnnouncementsPage />} />
              <Route path="/gallery" element={<GalleryPage />} />
              <Route path="/faq" element={<FaqPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/location" element={<ContactPage />} />
              <Route path="/student-portal" element={<StudentPortalPage />} />
              <Route path="/student-login" element={<StudentPortalPage />} />
              <Route path="/student portal" element={<Navigate to="/student-portal" replace />} />
              <Route path="/student%20portal" element={<Navigate to="/student-portal" replace />} />
              <Route path="/student" element={<Navigate to="/student-portal" replace />} />
              <Route path="/portal" element={<Navigate to="/student-portal" replace />} />
              <Route path="/login" element={<Navigate to="/student-portal" replace />} />
              <Route path="/register" element={<Navigate to="/student-portal" replace />} />
              <Route path="/forgot-password" element={<Navigate to="/student-portal" replace />} />
              <Route path="/dashboard" element={<Navigate to="/student-portal" replace />} />
              <Route path="/privacy" element={<PrivacyPolicyPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>

          <Footer />

          {/* Notifications Drawer */}
          <NotificationDrawer 
            isOpen={notificationsOpen} 
            onClose={() => setNotificationsOpen(false)} 
          />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
