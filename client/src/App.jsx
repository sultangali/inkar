import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './components/ui/Toast';
import './lib/i18n';

// Pages
import { HomePage } from './pages/Home/HomePage';
import { AuthPage } from './pages/Auth/AuthPage';
import { WorkspacesPage } from './pages/Workspaces/WorkspacesPage';
import { BookingPage } from './pages/Booking/BookingPage';
import { ProfilePage } from './pages/Profile/ProfilePage';
import { AboutPage } from './pages/About/AboutPage';
import { ContactPage } from './pages/Contact/ContactPage';
import { DashboardOverview } from './pages/Dashboard/DashboardOverview';
import { DashboardBookings } from './pages/Dashboard/DashboardBookings';
import { DashboardWorkspaces } from './pages/Dashboard/DashboardWorkspaces';
import { DashboardUsers } from './pages/Dashboard/DashboardUsers';
import { DashboardAnalytics } from './pages/Dashboard/DashboardAnalytics';
import { DashboardMessages } from './pages/Dashboard/DashboardMessages';

function App() {
  return (
    <Router>
      <AuthProvider>
        <ToastProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/workspaces" element={<WorkspacesPage />} />
          <Route path="/booking" element={<BookingPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          
          {/* Dashboard Routes */}
          <Route path="/dashboard" element={<DashboardOverview />} />
          <Route path="/dashboard/bookings" element={<DashboardBookings />} />
          <Route path="/dashboard/workspaces" element={<DashboardWorkspaces />} />
          <Route path="/dashboard/messages" element={<DashboardMessages />} />
          <Route path="/dashboard/users" element={<DashboardUsers />} />
          <Route path="/dashboard/analytics" element={<DashboardAnalytics />} />
          
          {/* About and Contact pages */}
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
        </Routes>
        </ToastProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;

