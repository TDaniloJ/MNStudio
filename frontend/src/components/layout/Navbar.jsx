import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  BookOpen, Menu, X, User, LogOut, Settings,
  Heart, History, Search, Crown, Bell,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { getImageUrl } from '../../utils/formatters';
import Button from '../common/Button';
import ThemeToggle from '../common/ThemeToggle';
import NotificationCenter from '../common/NotificationCenter';
import CoinNavbarBadge from '../common/CoinNavbarBadge';

/* ── Links de navegação principal ─────────────────────────────── */
const NAV_LINKS = [
  { to: '/mangas',      label: 'Mangás'     },
  { to: '/novels',      label: 'Novels'     },
  { to: '/rankings',    label: 'Rankings'   },
  { to: '/subscription',label: 'Assinatura' },
];

const USER_MENU_LINKS = [
  { to: '/profile',      label: 'Perfil',     icon: User    },
  { to: '/favorites',    label: 'Favoritos',  icon: Heart   },
  { to: '/history',      label: 'Histórico',  icon: History },
  { to: '/subscription', label: 'Assinatura', icon: Crown   },
];

/* ── Componente principal ─────────────────────────────────────── */

const Navbar = () => {
  const [mobileOpen,   setMobileOpen]   = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchQuery,  setSearchQuery]  = useState('');
  const [searchFocus,  setSearchFocus]  = useState(false);
  const [scrolled,     setScrolled]     = useState(false);

  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate  = useNavigate();
  const location  = useLocation();
  const menuRef   = useRef(null);

  // Sombra ao rolar
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Fechar menu ao mudar de rota
  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  // Fechar menu de usuário ao clicar fora
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => { logout(); navigate('/'); };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const isActive = (to) => location.pathname === to;

  return (
    <>
      <nav className={`sticky top-0 z-40 w-full bg-white/95 dark:bg-gray-950/95 backdrop-blur-md border-b border-gray-100 dark:border-gray-800/60 transition-all duration-200 ${scrolled ? 'shadow-sm shadow-black/5' : ''}`}>
        <div className="container-custom">
          <div className="flex items-center h-14 gap-3">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 flex-shrink-0 group">
              <div className="p-1.5 bg-primary-600 dark:bg-primary-500 rounded-lg group-hover:bg-primary-700 dark:group-hover:bg-primary-600 transition-colors">
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              <span className="text-base font-black text-gray-900 dark:text-white hidden sm:block tracking-tight">
                MN Studio
              </span>
            </Link>

            {/* Nav links desktop */}
            <div className="hidden md:flex items-center gap-0.5 ml-2">
              {NAV_LINKS.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive(l.to)
                      ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800/60'
                  }`}
                >
                  {l.label}
                </Link>
              ))}
            </div>

            {/* Barra de pesquisa desktop */}
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-sm mx-auto">
              <div className={`relative w-full transition-all duration-200 ${searchFocus ? 'scale-[1.01]' : ''}`}>
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchFocus(true)}
                  onBlur={() => setSearchFocus(false)}
                  placeholder="Buscar obras..."
                  className="w-full pl-8 pr-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-800/80 border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-400/50 focus:bg-white dark:focus:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 transition-all"
                />
              </div>
            </form>

            {/* Ações à direita */}
            <div className="flex items-center gap-1 ml-auto">
              {/* Pesquisa mobile */}
              <Link
                to="/search"
                className="md:hidden p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <Search className="w-4 h-4" />
              </Link>

              {isAuthenticated && (
                <>
                  <NotificationCenter />
                  <CoinNavbarBadge />
                </>
              )}

              <ThemeToggle />

              {isAuthenticated ? (
                /* ── Menu de usuário ─────────────────────────── */
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setUserMenuOpen((v) => !v)}
                    className={`flex items-center gap-2 pl-1.5 pr-2 py-1 rounded-xl transition-all ${
                      userMenuOpen ? 'bg-gray-100 dark:bg-gray-800' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    {/* Avatar */}
                    <div className="w-7 h-7 rounded-lg bg-primary-600 dark:bg-primary-500 flex items-center justify-center text-white text-xs font-bold overflow-hidden flex-shrink-0">
                      {user?.avatar_url ? (
                        <img src={getImageUrl(user.avatar_url)} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        user?.username?.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="hidden sm:block text-left">
                      <p className="text-xs font-semibold text-gray-900 dark:text-white leading-none">
                        {user?.username}
                      </p>
                      <p className="text-[10px] text-gray-400 dark:text-gray-500 capitalize leading-none mt-0.5">
                        {user?.role}
                      </p>
                    </div>
                  </button>

                  {/* Dropdown */}
                  {userMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-gray-900 rounded-2xl shadow-xl shadow-black/10 dark:shadow-black/40 border border-gray-100 dark:border-gray-800 overflow-hidden z-50">
                      {/* Header */}
                      <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800/60 border-b border-gray-100 dark:border-gray-800">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{user?.username}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                      </div>

                      {/* Links */}
                      <div className="py-1.5">
                        {USER_MENU_LINKS.map(({ to, label, icon: Icon }) => (
                          <Link
                            key={to}
                            to={to}
                            className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/60 hover:text-gray-900 dark:hover:text-white transition-colors"
                          >
                            <Icon className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
                            {label}
                          </Link>
                        ))}
                        {(user?.role === 'admin' || user?.role === 'uploader') && (
                          <Link
                            to="/admin"
                            className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/60 hover:text-gray-900 dark:hover:text-white transition-colors"
                          >
                            <Settings className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
                            Administração
                          </Link>
                        )}
                      </div>

                      {/* Logout */}
                      <div className="border-t border-gray-100 dark:border-gray-800 py-1.5">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-2.5 w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          Sair
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* ── Botões de auth ───────────────────────────── */
                <div className="flex items-center gap-1.5 ml-1">
                  <button
                    onClick={() => navigate('/login')}
                    className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    Entrar
                  </button>
                  <button
                    onClick={() => navigate('/register')}
                    className="px-3 py-1.5 text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 rounded-lg transition-colors"
                  >
                    Cadastrar
                  </button>
                </div>
              )}

              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileOpen((v) => !v)}
                className="md:hidden p-2 ml-1 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* ── Menu mobile ─────────────────────────────────────── */}
        {mobileOpen && (
          <div className="md:hidden border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950">
            {/* Busca mobile */}
            <form onSubmit={handleSearch} className="px-4 pt-3 pb-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar obras..."
                  className="w-full pl-8 pr-3 py-2 text-sm bg-gray-100 dark:bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/40 text-gray-900 dark:text-white placeholder-gray-400"
                />
              </div>
            </form>

            {/* Nav links */}
            <div className="px-3 pb-2 space-y-0.5">
              {NAV_LINKS.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive(l.to)
                      ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/60'
                  }`}
                >
                  {l.label}
                </Link>
              ))}
            </div>

            {isAuthenticated ? (
              <div className="border-t border-gray-100 dark:border-gray-800 px-3 py-2 space-y-0.5">
                {USER_MENU_LINKS.map(({ to, label, icon: Icon }) => (
                  <Link
                    key={to}
                    to={to}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors"
                  >
                    <Icon className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                    {label}
                  </Link>
                ))}
                {(user?.role === 'admin' || user?.role === 'uploader') && (
                  <Link to="/admin" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors">
                    <Settings className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                    Administração
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sair
                </button>
              </div>
            ) : (
              <div className="border-t border-gray-100 dark:border-gray-800 px-4 py-3 flex gap-2">
                <button onClick={() => navigate('/login')} className="flex-1 py-2 text-sm font-medium border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  Entrar
                </button>
                <button onClick={() => navigate('/register')} className="flex-1 py-2 text-sm font-bold bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors">
                  Cadastrar
                </button>
              </div>
            )}
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;
