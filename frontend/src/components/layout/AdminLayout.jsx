import React, { useState, useEffect, useRef } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, BookOpen, FileText, Tag, Users,
  Menu, X, LogOut, Home, ChevronRight, Mail, Bell,
  Search, User, Settings, HelpCircle, Coins, Trophy,
  ChevronLeft,
} from 'lucide-react';
import { Settings as SettingsIcon } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { getImageUrl } from '../../utils/formatters';
import ThemeToggle from '../common/ThemeToggle';
import NotificationCenter from '../common/NotificationCenter';
import HelpCenter from '../common/HelpeCenter';

/* ── Config de menu ──────────────────────────────────────────────── */

const MENU_ITEMS = [
  { path: '/admin',                label: 'Dashboard',     icon: LayoutDashboard, exact: true },
  { path: '/admin/mangas',         label: 'Mangás',        icon: BookOpen  },
  { path: '/admin/novels',         label: 'Novels',        icon: FileText  },
  { path: '/admin/genres',         label: 'Gêneros',       icon: Tag       },
  { path: '/admin/users',          label: 'Usuários',      icon: Users,        adminOnly: true },
  { path: '/admin/notifications',  label: 'Notificações',  icon: Mail,         adminOnly: true },
  { path: '/admin/transactions',   label: 'Transações',    icon: Coins,        adminOnly: true },
  { path: '/admin/support',        label: 'Suporte',       icon: HelpCircle,   adminOnly: true },
  { path: '/admin/badges',         label: 'Conquistas',    icon: Trophy,       adminOnly: true },
  { path: '/admin/plans',          label: 'Planos',          icon: Coins,     adminOnly: true },
  { path: '/admin/settings',       label: 'Configurações', icon: SettingsIcon, adminOnly: true },
];

const ROUTE_LABELS = {
  mangas: 'Mangás', novels: 'Novels', genres: 'Gêneros', users: 'Usuários',
  notifications: 'Notificações', settings: 'Configurações',
  transactions: 'Transações', support: 'Suporte', badges: 'Conquistas',
};

/* ── Componente principal ────────────────────────────────────────── */

const AdminLayout = () => {
  const location  = useLocation();
  const navigate  = useNavigate();
  const menuRef   = useRef(null);
  const { isAuthenticated, user, logout } = useAuthStore();

  const [sidebarOpen,       setSidebarOpen]       = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [userMenuOpen,      setUserMenuOpen]       = useState(false);
  const [searchQuery,       setSearchQuery]        = useState('');

  // Fecha menus ao mudar rota
  useEffect(() => {
    setMobileSidebarOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  // Fecha user menu ao clicar fora
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const isActive = (path, exact = false) =>
    exact ? location.pathname === path : location.pathname.startsWith(path);

  const breadcrumbs = (() => {
    const parts = location.pathname.split('/').filter(Boolean);
    const crumbs = [{ label: 'Admin', path: '/admin' }];
    if (parts[1]) crumbs.push({ label: ROUTE_LABELS[parts[1]] ?? parts[1], path: `/admin/${parts[1]}` });
    return crumbs;
  })();

  const handleLogout = () => { logout(); navigate('/'); };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) console.log('Buscando:', searchQuery);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex">

      {/* ── Sidebar ─────────────────────────────────────────────── */}
      <aside className={`fixed top-0 left-0 h-full z-50 flex flex-col bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 transition-all duration-300
        ${sidebarOpen ? 'w-60' : 'w-[72px]'}
        ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>

        {/* Logo */}
        <div className={`flex items-center h-14 px-4 border-b border-gray-100 dark:border-gray-800 flex-shrink-0 ${sidebarOpen ? 'gap-2 justify-between' : 'justify-center'}`}>
          {sidebarOpen && (
            <Link to="/" className="flex items-center gap-2 group">
              <div className="p-1.5 bg-primary-600 rounded-lg group-hover:bg-primary-700 transition-colors">
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              <span className="text-base font-black text-gray-900 dark:text-white tracking-tight">MN Studio</span>
            </Link>
          )}
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            className="hidden lg:flex p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
          {!sidebarOpen && (
            <div className="p-1.5 bg-primary-600 rounded-lg">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5" style={{ scrollbarWidth: 'none' }}>
          {MENU_ITEMS.map((item) => {
            if (item.adminOnly && user?.role !== 'admin') return null;
            const Icon   = item.icon;
            const active = isActive(item.path, item.exact);

            return (
              <Link
                key={item.path}
                to={item.path}
                title={!sidebarOpen ? item.label : undefined}
                className={`relative flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all group ${
                  sidebarOpen ? '' : 'justify-center'
                } ${
                  active
                    ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary-600 rounded-full" />
                )}
                <Icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-primary-600 dark:text-primary-400' : ''}`} />
                {sidebarOpen && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User mini */}
        {sidebarOpen && (
          <div className="flex-shrink-0 p-3 border-t border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <div className="w-7 h-7 rounded-lg bg-primary-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 overflow-hidden">
                {user?.avatar_url
                  ? <img src={getImageUrl(user.avatar_url)} alt="" className="w-full h-full object-cover" />
                  : user?.username?.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-gray-900 dark:text-white truncate leading-none">{user?.username}</p>
                <p className="text-[10px] text-gray-400 capitalize leading-none mt-0.5">{user?.role}</p>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Overlay mobile */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMobileSidebarOpen(false)} />
      )}

      {/* ── Conteúdo principal ──────────────────────────────────── */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${sidebarOpen ? 'lg:ml-60' : 'lg:ml-[72px]'}`}>

        {/* Topbar */}
        <header className="sticky top-0 z-30 h-14 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 flex items-center px-4 gap-4">

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="lg:hidden p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Busca */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-sm">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar conteúdo..."
                className="w-full pl-8 pr-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-800 border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-400/50 focus:bg-white dark:focus:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 transition-all"
              />
            </div>
          </form>

          <div className="flex items-center gap-1 ml-auto">
            <ThemeToggle />
            <HelpCenter />
            {isAuthenticated && <NotificationCenter />}

            {/* User menu */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setUserMenuOpen((v) => !v)}
                className={`flex items-center gap-2 pl-2 pr-2.5 py-1 rounded-xl transition-colors ${userMenuOpen ? 'bg-gray-100 dark:bg-gray-800' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
              >
                <div className="w-7 h-7 rounded-lg bg-primary-600 flex items-center justify-center text-white text-xs font-bold overflow-hidden flex-shrink-0">
                  {user?.avatar_url
                    ? <img src={getImageUrl(user.avatar_url)} alt="" className="w-full h-full object-cover" />
                    : user?.username?.charAt(0).toUpperCase()}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-semibold text-gray-900 dark:text-white leading-none">{user?.username}</p>
                  <p className="text-[10px] text-gray-400 capitalize leading-none mt-0.5">{user?.role}</p>
                </div>
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-gray-900 rounded-2xl shadow-xl shadow-black/10 dark:shadow-black/40 border border-gray-100 dark:border-gray-800 overflow-hidden z-50">
                  <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800/60 border-b border-gray-100 dark:border-gray-800">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{user?.username}</p>
                    <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                  </div>
                  <div className="py-1.5">
                    {[
                      { to: '/profile', icon: User,     label: 'Meu Perfil'     },
                      { to: '/',        icon: Home,      label: 'Voltar ao Site' },
                      { to: '/admin/settings', icon: SettingsIcon, label: 'Configurações', adminOnly: true },
                    ].map(({ to, icon: Icon, label, adminOnly }) => {
                      if (adminOnly && user?.role !== 'admin') return null;
                      return (
                        <Link key={to} to={to}
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                          <Icon className="w-3.5 h-3.5 text-gray-400" />
                          {label}
                        </Link>
                      );
                    })}
                  </div>
                  <div className="border-t border-gray-100 dark:border-gray-800 py-1.5">
                    <button onClick={handleLogout}
                      className="flex items-center gap-2.5 w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                      <LogOut className="w-3.5 h-3.5" />
                      Sair
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Conteúdo */}
        <main className="flex-1 p-6">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500 mb-6">
            {breadcrumbs.map((c, i) => (
              <React.Fragment key={i}>
                {i > 0 && <ChevronRight className="w-3 h-3" />}
                <Link to={c.path} className="hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
                  {c.label}
                </Link>
              </React.Fragment>
            ))}
          </nav>

          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;