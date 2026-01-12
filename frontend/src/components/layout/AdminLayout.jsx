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
  Mail
} from 'lucide-react';
import { Settings as SettingsIcon } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import ThemeToggle from '../common/ThemeToggle';

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const menuItems = [
    { path: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
    { path: '/admin/mangas', icon: BookOpen, label: 'Mangás' },
    { path: '/admin/novels', icon: FileText, label: 'Novels' },
    { path: '/admin/genres', icon: Tag, label: 'Gêneros' },
    { path: '/admin/users', icon: Users, label: 'Usuários', adminOnly: true },
    { path: '/admin/notifications', icon: Mail, label: 'Notificações', adminOnly: true },
    { path: '/admin/settings', icon: SettingsIcon, label: 'Configurações', adminOnly: true },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
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

          {/* Preferences */}
          <div className="p-3 border-t dark:border-gray-700">
            <ThemeToggle showLabel={isSidebarOpen} />
          </div>

          {/* Bottom */}
          <div className="p-3 border-t dark:border-gray-700 space-y-2">
            <Link to="/" className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
              <Home size={18} />
              {isSidebarOpen && 'Voltar ao site'}
            </Link>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <LogOut size={18} />
              {isSidebarOpen && 'Sair'}
            </button>
          </div>
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
