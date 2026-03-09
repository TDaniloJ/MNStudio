import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Menu, X, User, LogOut, Settings, Heart, History, Search } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { getImageUrl } from '../../utils/formatters';
import Button from '../common/Button';
import ThemeToggle from '../common/ThemeToggle';
import NotificationCenter from '../common/NotificationCenter';
import CoinNavbarBadge from '../common/CoinNavbarBadge';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md dark:shadow-gray-900/50 sticky top-0 z-40 transition-colors duration-200">
      <div className="container-custom">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <BookOpen className="w-8 h-8 text-primary-600 dark:text-primary-400" />
            <span className="text-xl font-bold text-gray-900 dark:text-white hidden sm:block">MN Studio</span>
          </Link>

          {/* Search Bar - Desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl">
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Pesquisar mangás, novels..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
            </div>
          </form>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/rankings" className="text-gray-700 hover:text-primary-600 font-medium transition dark:text-gray-300 dark:hover:text-primary-400">
              Rankings
            </Link>
            <Link to="/subscription" className="text-gray-700 hover:text-primary-600 font-medium transition dark:text-gray-300 dark:hover:text-primary-400">
              Assinatura
            </Link>
            <Link 
              to="/search" 
              className="relative p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
            >
              <Search className="w-5 h-5" />
            </Link>

            {/* Notification Center */}
            {isAuthenticated && <NotificationCenter />}

            {/* Coins */}
            {isAuthenticated && <CoinNavbarBadge />}

            {/* Theme Toggle */}
            <ThemeToggle />

            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                >
                  <div className="w-8 h-8 bg-primary-600 dark:bg-primary-500 rounded-full flex items-center justify-center text-white font-semibold overflow-hidden">
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
                  <span className="font-medium dark:text-white">{user?.username}</span>
                </button>

                {isUserMenuOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setIsUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-gray-900/50 py-2 z-20 border border-gray-200 dark:border-gray-700">
                      <Link
                        to="/profile"
                        className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition text-gray-700 dark:text-gray-200"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <User className="w-4 h-4" />
                        Perfil
                      </Link>
                      <Link
                        to="/favorites"
                        className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition text-gray-700 dark:text-gray-200"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Heart className="w-4 h-4" />
                        Favoritos
                      </Link>
                      <Link
                        to="/subscription"
                        className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition text-gray-700 dark:text-gray-200"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <BookOpen className="w-4 h-4" />
                        Assinatura
                      </Link>
                      <Link
                        to="/history"
                        className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition text-gray-700 dark:text-gray-200"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <History className="w-4 h-4" />
                        Histórico
                      </Link>
                      {(user?.role === 'admin' || user?.role === 'uploader') && (
                        <Link
                          to="/admin"
                          className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition text-gray-700 dark:text-gray-200"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <Settings className="w-4 h-4" />
                          Administração
                        </Link>
                      )}
                      <hr className="my-2 border-gray-200 dark:border-gray-700" />
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          handleLogout();
                        }}
                        className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition w-full text-left text-red-600 dark:text-red-400"
                      >
                        <LogOut className="w-4 h-4" />
                        Sair
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => navigate('/login')}>
                  Entrar
                </Button>
                <Button size="sm" onClick={() => navigate('/register')}>
                  Cadastrar
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <button
              className="p-2 text-gray-700 dark:text-gray-300"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        <form onSubmit={handleSearch} className="md:hidden pb-4">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Pesquisar..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
          </div>
        </form>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden pb-4 border-t border-gray-200 dark:border-gray-700 mt-2 pt-4">
            <Link
              to="/mangas"
              className="block py-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition"
              onClick={() => setIsMenuOpen(false)}
            >
              Mangás
            </Link>
            <Link
              to="/novels"
              className="block py-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition"
              onClick={() => setIsMenuOpen(false)}
            >
              Novels
            </Link>
            <Link
              to="/search"
              className="block py-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition"
              onClick={() => setIsMenuOpen(false)}
            >
              Pesquisa Avançada
            </Link>
                <Link
                  to="/subscription"
                  className="block py-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Assinatura
                </Link>
            
            {isAuthenticated ? (
              <>
                <hr className="my-2 border-gray-200 dark:border-gray-700" />
                <Link
                  to="/profile"
                  className="block py-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Perfil
                </Link>
                <Link
                  to="/favorites"
                  className="block py-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Favoritos
                </Link>
                <Link
                  to="/history"
                  className="block py-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Histórico
                </Link>
                {(user?.role === 'admin' || user?.role === 'uploader') && (
                  <Link
                    to="/admin"
                    className="block py-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Administração
                  </Link>
                )}
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    handleLogout();
                  }}
                  className="block py-2 text-red-600 dark:text-red-400 w-full text-left hover:text-red-700 dark:hover:text-red-300 transition"
                >
                  Sair
                </button>
              </>
            ) : (
              <>
                <hr className="my-2 border-gray-200 dark:border-gray-700" />
                <Button
                  variant="outline"
                  className="w-full mb-2 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
                  onClick={() => {
                    setIsMenuOpen(false);
                    navigate('/login');
                  }}
                >
                  Entrar
                </Button>
                <Button
                  className="w-full"
                  onClick={() => {
                    setIsMenuOpen(false);
                    navigate('/register');
                  }}
                >
                  Cadastrar
                </Button>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;