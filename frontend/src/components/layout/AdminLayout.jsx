import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  Tag,
  Users,
  Menu,
  X,
  LogOut,
  Home,
  ChevronRight,
  Mail,
  Bell,
  Search,
  Moon,
  Sun,
  User,
  Settings,
  HelpCircle,
  Coins
} from 'lucide-react';
import { Settings as SettingsIcon } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { getImageUrl } from '../../utils/formatters';
import ThemeToggle from '../common/ThemeToggle';
import NotificationCenter from '../common/NotificationCenter';
import HelpCenter from '../common/HelpeCenter';

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuthStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  

  const menuItems = [
    { path: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
    { path: '/admin/mangas', icon: BookOpen, label: 'Mangás' },
    { path: '/admin/novels', icon: FileText, label: 'Novels' },
    { path: '/admin/genres', icon: Tag, label: 'Gêneros' },
    { path: '/admin/users', icon: Users, label: 'Usuários', adminOnly: true },
    { path: '/admin/notifications', icon: Mail, label: 'Notificações', adminOnly: true },
    { path: '/admin/transactions', icon: Coins, label: 'Transações', adminOnly: true },
    { path: '/admin/settings', icon: SettingsIcon, label: 'Configurações', adminOnly: true },
  ];

  // Mock notifications
  const notifications = [
    { id: 1, text: 'Novo capítulo publicado', time: '5 min atrás', unread: true },
    { id: 2, text: 'Comentário pendente', time: '1 hora atrás', unread: true },
    { id: 3, text: 'Novel atualizada', time: '2 horas atrás', unread: false }
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Implementar busca
      console.log('Buscando:', searchQuery);
    }
  };

  const isActive = (path, exact = false) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  const getBreadcrumbs = () => {
    const paths = location.pathname.split('/').filter(Boolean);
    const breadcrumbs = [{ label: 'Admin', path: '/admin' }];

    if (paths[1]) {
      const labels = {
        mangas: 'Mangás',
        novels: 'Novels',
        genres: 'Gêneros',
        users: 'Usuários',
        notifications: 'Notificações',
        settings: 'Configurações'
      };

      breadcrumbs.push({
        label: labels[paths[1]] || paths[1],
        path: `/admin/${paths[1]}`
      });
    }

    return breadcrumbs;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">

      {/* Top Navbar */}
      <nav className="fixed top-0 left-0 right-0 h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-50">
        <div className="h-full px-4 flex items-center justify-between">
          {/* Left Section */}
          <div className="flex items-center gap-4">
            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
            >
              <Menu className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>

            {/* Desktop Sidebar Toggle */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="hidden lg:block p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
            >
              <Menu className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>

            {/* Logo */}
            <Link to="/admin" className="flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-primary-600" />
              <span className="text-lg font-bold text-gray-900 dark:text-white hidden sm:block">
                MN Studio
              </span>
            </Link>
          </div>

          {/* Center Section - Search */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar mangás, novels, capítulos..."
                className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white placeholder-gray-500"
              />
            </div>
          </form>

          {/* Right Section */}
          <div className="flex items-center gap-2">
            
            {/* Dark Mode Toggle */}
            <ThemeToggle showLabel={isSidebarOpen} />

            {/* Help */}
            <HelpCenter />

            {/* Notifications */}
            {isAuthenticated && <NotificationCenter />}

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
              >
                <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white font-semibold text-sm overflow-hidden">
                  {user?.avatar_url ? (
                    <img
                      src={getImageUrl(user.avatar_url)}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    user?.username?.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {user?.username}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                    {user?.role}
                  </p>
                </div>
              </button>

              {/* User Dropdown */}
              {showUserMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setShowUserMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20">
                    <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {user?.username}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {user?.email}
                      </p>
                    </div>
                    <div className="py-2">
                      <Link
                        to="/profile"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <User className="w-4 h-4" />
                        Meu Perfil
                      </Link>
                      <Link
                        to="/admin"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Settings className="w-4 h-4" />
                        Configurações
                      </Link>
                      <Link
                        to="/"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Home className="w-4 h-4" />
                        Voltar ao Site
                      </Link>
                    </div>
                    <div className="border-t border-gray-200 dark:border-gray-700 py-2">
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          handleLogout();
                        }}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition w-full"
                      >
                        <LogOut className="w-4 h-4" />
                        Sair
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white  dark:bg-gray-800 border-b dark:border-gray-700">
        <div className="flex items-center justify-between p-4 hover:bg-gray-100 dark:hover:bg-gray-700">
          <button onClick={() => setIsMobileSidebarOpen(true)}>
            <Menu />
          </button>
          <span className="font-bold">Admin Panel</span>
          <ThemeToggle />
        </div>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full z-50 bg-white dark:bg-gray-800 border-r dark:border-gray-700
        transition-all duration-300
        ${isSidebarOpen ? 'w-64' : 'w-20'}
        ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0`}
      >
        {/* === SIDEBAR GRID === */}
        <div className="flex flex-col h-full">

          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
            {isSidebarOpen && (
              <Link to="/" className="flex items-center gap-2 font-bold">
                <BookOpen className="text-primary-600" />
                MN Studio
              </Link>
            )}
            <button
              className="hidden lg:block"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              {isSidebarOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>

          {/* User */}
          <div className="p-4 border-b dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-600 text-white flex items-center justify-center">
                {user?.username?.charAt(0).toUpperCase()}
                
              </div>
              {isSidebarOpen && (
                <div>
                  <p className="font-medium">{user?.username}</p>
                  <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                </div>
              )}
            </div>
          </div>

          {/* 🔥 MENU SCROLLÁVEL */}
          <nav className="flex-1 overflow-y-auto p-3 space-y-1 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700">
            {menuItems.map(item => {
              if (item.adminOnly && user?.role !== 'admin') return null;
              const Icon = item.icon;
              const active = isActive(item.path, item.exact);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  title={!isSidebarOpen ? item.label : ''}
                  className={`relative flex items-center gap-3 px-4 py-3 rounded-lg transition
                    ${!isSidebarOpen ? 'justify-center' : ''}
                    ${
                      active
                        ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:bg-primary-600'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                >
                  <Icon size={18} />
                  {isSidebarOpen && <span>{item.label}</span>}
                </Link>
              );
            })}
          </nav>

        </div>
      </aside>

      {/* Overlay */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Content */}
      <main className={`transition-all ${isSidebarOpen ? 'lg:ml-64' : 'lg:ml-20'} pt-20 lg:pt-0`}>
        <div className="p-6 lg:p-8">
          <nav className="mb-6 flex items-center gap-2 text-sm text-gray-500">
            {getBreadcrumbs().map((c, i) => (
              <React.Fragment key={i}>
                {i > 0 && <ChevronRight size={14} />}
                <Link to={c.path} className="hover:text-primary-600">
                  {c.label}
                </Link>
              </React.Fragment>
            ))}
          </nav>

          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
