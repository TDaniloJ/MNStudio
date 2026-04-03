import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import { ThemeProvider } from './contexts/ThemeContext';
import { socket } from './services/socket';

// Layout
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import AdminLayout from './components/layout/AdminLayout';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Forgot from './pages/Forgot';
import ResetPassword from './pages/ResetPassword';
import MangaList from './pages/MangaList';
import MangaDetail from './pages/MangaDetail';
import MangaReader from './pages/MangaReader';
import NovelList from './pages/NovelList';
import NovelDetail from './pages/NovelDetail';
import NovelReader from './pages/NovelReader';
import Profile from './pages/Profile';
import Subscription from './pages/Subscription';
import VerifyEmail from './pages/VerifyEmail';
import Favorites from './pages/Favorites';
import History from './pages/History';
import Search from './pages/Search';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import FAQ from './pages/FAQ';
import Contact from './pages/Contact';
import Rankings from './pages/Rankings';
import CoinsPage from './pages/CoinsPage';
import Support from './pages/Support';
import NotificationsPage from './pages/Notifications';

// Admin Pages
import Dashboard from './pages/admin/Dashboard';
import MangaManagement from './pages/admin/MangaManagement';
import MangaForm from './pages/admin/MangaForm';
import NovelManagement from './pages/admin/NovelManagement';
import NovelForm from './pages/admin/NovelForm';
import ChapterManagement from './pages/admin/ChapterManagement';
import GenreManagement from './pages/admin/GenreManagement';
import UserManagement from './pages/admin/UserManagement';
import MangaChapterManager from './pages/admin/MangaChapterManager';
import NovelChapterManager from './pages/admin/NovelChapterManager';
import ErrorBoundary from './components/common/ErrorBoundary';
import Settings from './pages/admin/Settings';
import Notifications from './pages/admin/Notifications';
import NovelWorldbuildingManager from './pages/admin/NovelWorldbuildingManager';
import Transactions from './pages/admin/Transactions';

// Error Pages
import ServerError from './pages/errors/ServerError';
import Forbidden from './pages/errors/Forbidden';
import Unauthorized from './pages/errors/Unauthorized';
import NotFound from './pages/errors/NotFound';

// Context
import { useSettingsStore } from './store/settingsStore';
import { CoinProvider } from './contexts/CoinContext';
import { NotificationProvider } from './contexts/NotificationProvider';
import { useFeatures } from './hooks/useFeatures';


// Protected Route Component
const ProtectedRoute = ({ children, adminOnly = false, uploaderOnly = false }) => {
  const { isAuthenticated, user } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  if (uploaderOnly && user?.role !== 'admin' && user?.role !== 'uploader') {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Layout Component
const Layout = ({ children }) => (
  <div className="flex flex-col min-h-screen">
    <Navbar />
    <main className="flex-1">
      {children}
    </main>
    <Footer />
  </div>
);

function App() {

  const { loadPublicSettings } = useSettingsStore();
  const { isAuthenticated, user } = useAuthStore();
  const { enableCoins } = useFeatures();

  useEffect(() => {
    loadPublicSettings();
  }, []); 

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      socket.connect();

      // entra na sala do usuário
      socket.emit('join:user', user.id);

      // se for admin entra na sala de admins
      if (user.role === 'admin') {
        socket.emit('join:admin');
      }
    }

    // quando deslogar ou fechar, desconecta
    return () => {
      socket.disconnect();
    };
  }, [isAuthenticated, user?.id, user?.role]);

  return (
    <ThemeProvider>
      <Router>
        <CoinProvider>
          <NotificationProvider>
        
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 4000,
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />

          <Routes>
            {/* Public Routes with Layout */}
            <Route path="/" element={<Layout><Home /></Layout>} />
            <Route path="/mangas" element={<Layout><MangaList /></Layout>} />
            <Route path="/manga/:id" element={<Layout><MangaDetail /></Layout>} />
            <Route path="/novels" element={<Layout><NovelList /></Layout>} />
            <Route path="/novel/:id" element={<Layout><NovelDetail /></Layout>} />
            <Route path="/terms" element={<Layout><Terms /></Layout>} />
            <Route path="/privacy" element={<Layout><Privacy /></Layout>} />
            <Route path="/faq" element={<Layout><FAQ /></Layout>} />
            <Route path="/contact" element={<Layout><Contact /></Layout>} />
            <Route path="/rankings" element={<Layout><Rankings /></Layout>} />
            {enableCoins && <Route path="/coins" element={<ProtectedRoute><Layout><CoinsPage /></Layout></ProtectedRoute>}/>}
            <Route path="/support" element={<Layout><Support /></Layout>} />
            <Route path="/notifications" element={<ProtectedRoute><Layout><NotificationsPage /></Layout></ProtectedRoute>}/>

            {/* Auth Routes without Layout */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<Forgot />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/verify-email" element={<VerifyEmail />} />

            {/* Reader Routes without Layout */}
            <Route path="/manga/:mangaId/chapter/:chapterId" element={<MangaReader />} />
            <Route path="/novel/:novelId/chapter/:chapterId" element={<NovelReader />} />

            {/* Protected Routes with Layout */}
            <Route path="/profile" element={<ProtectedRoute><Layout><Profile /></Layout></ProtectedRoute>}/>
            <Route path="/subscription" element={<ProtectedRoute><Layout><Subscription /></Layout></ProtectedRoute>}/>
            <Route path="/favorites" element={<ProtectedRoute><Layout><Favorites /></Layout></ProtectedRoute>}/>
            <Route path="/history" element={<ProtectedRoute><Layout><History /></Layout></ProtectedRoute>}/>
            <Route path="/search" element={<Layout><Search /></Layout>} />
            <Route path="/manga/:mangaId/chapter/:chapterId" element={<ErrorBoundary><MangaReader /></ErrorBoundary>} />

            {/* Admin Routes */}
            <Route path="/admin" element={<ProtectedRoute uploaderOnly><AdminLayout /></ProtectedRoute>}>
              <Route index element={<Dashboard />} />
              <Route path="mangas" element={<MangaManagement />} />
              <Route path="mangas/new" element={<MangaForm />} />
              <Route path="mangas/:id/edit" element={<MangaForm />} />
              <Route path="mangas/:id/chapters" element={<MangaChapterManager />} />
              <Route path="novels" element={<NovelManagement />} />
              <Route path="novels/new" element={<NovelForm />} />
              <Route path="novels/:id/edit" element={<NovelForm />} />
              <Route path="novels/:id/chapters" element={<NovelChapterManager />} />
              <Route path="genres" element={<GenreManagement />} />
              <Route path="settings" element={<Settings />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="users" element={<ProtectedRoute adminOnly><UserManagement /></ProtectedRoute>}/>
              <Route path="novels/:id/worldbuilding" element={<NovelWorldbuildingManager />} />
              <Route path="transactions" element={<ProtectedRoute adminOnly><Transactions /></ProtectedRoute>}/>
            </Route>

            {/* 404 Route */}
            <Route path="*" element={<Layout><NotFound /></Layout>} />

          </Routes>
          
          </NotificationProvider>
        </CoinProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;