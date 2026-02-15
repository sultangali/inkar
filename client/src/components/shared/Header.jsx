import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { Menu, X, User, LogOut, LayoutDashboard, Globe, Search, ChevronDown } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { workspaceService } from '../../services/api';

export const Header = () => {
  const { t, i18n } = useTranslation();
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const searchRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchOpen(false);
      }
      if (!e.target.closest('.lang-menu')) {
        setLangMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchQuery.length >= 2) {
      const timer = setTimeout(async () => {
        try {
          const res = await workspaceService.getAll({ isActive: true });
          const q = searchQuery.toLowerCase();
          setSearchResults(
            (res.workspaces || []).filter(w =>
              w.name.toLowerCase().includes(q) || (w.description || '').toLowerCase().includes(q)
            ).slice(0, 5)
          );
        } catch { setSearchResults([]); }
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setLangMenuOpen(false);
  };

  const languages = [
    { code: 'kz', name: 'Қазақша', flag: '🇰🇿' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
    { code: 'en', name: 'English', flag: '🇬🇧' }
  ];

  return (
    <header className={`sticky top-0 z-40 transition-all duration-300 ${
      scrolled
        ? 'bg-white/80 backdrop-blur-xl shadow-lg shadow-gray-200/50'
        : 'bg-white shadow-sm'
    }`}>
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center shadow-md shadow-primary-200/50 group-hover:shadow-lg transition-shadow">
              <span className="text-white font-bold text-xl">I</span>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-primary-500 to-primary-700 bg-clip-text text-transparent">Inkar</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {[
              { to: '/', label: t('nav.home') },
              { to: '/workspaces', label: t('nav.workspaces') },
              { to: '/about', label: t('nav.about') },
              { to: '/contact', label: t('nav.contact') }
            ].map(link => (
              <Link
                key={link.to}
                to={link.to}
                className="px-4 py-2 text-gray-600 hover:text-primary-600 rounded-lg hover:bg-primary-50 transition-all duration-200 font-medium text-sm"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Search */}
            <div ref={searchRef} className="relative">
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
              >
                <Search size={20} />
              </button>
              {searchOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50">
                  <div className="flex items-center px-4 py-3 border-b border-gray-100">
                    <Search size={18} className="text-gray-400 mr-3" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={t('common.search') + '...'}
                      className="flex-1 outline-none text-sm"
                      autoFocus
                    />
                    {searchQuery && (
                      <button onClick={() => setSearchQuery('')} className="text-gray-400 hover:text-gray-600">
                        <X size={16} />
                      </button>
                    )}
                  </div>
                  {searchResults.length > 0 && (
                    <div className="max-h-60 overflow-y-auto">
                      {searchResults.map(ws => (
                        <Link
                          key={ws._id}
                          to={`/booking?workspace=${ws._id}`}
                          onClick={() => { setSearchOpen(false); setSearchQuery(''); }}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                        >
                          <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0">
                            <span className="text-primary-600 font-bold text-xs">{ws.name.charAt(0)}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{ws.name}</p>
                            <p className="text-xs text-gray-500">{t(`workspace.types.${ws.type}`)} -- ₸{ws.pricePerHour}/{t('workspace.perHour')}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                  {searchQuery.length >= 2 && searchResults.length === 0 && (
                    <div className="px-4 py-6 text-center text-sm text-gray-500">{t('common.noResults')}</div>
                  )}
                </div>
              )}
            </div>

            {/* Language Selector */}
            <div className="relative lang-menu">
              <button
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className="flex items-center gap-1.5 px-3 py-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors text-sm font-medium"
              >
                <Globe size={18} />
                <span className="uppercase">{i18n.language}</span>
                <ChevronDown size={14} className={`transition-transform ${langMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {langMenuOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-2xl border border-gray-100 py-1 z-50 overflow-hidden">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => changeLanguage(lang.code)}
                      className={`flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors ${
                        i18n.language === lang.code ? 'text-primary-600 font-medium bg-primary-50' : 'text-gray-700'
                      }`}
                    >
                      <span>{lang.flag}</span>
                      <span>{lang.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {isAuthenticated ? (
              <div className="flex items-center space-x-2">
                <Link
                  to="/profile"
                  className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors text-sm font-medium"
                >
                  <div className="w-7 h-7 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center">
                    <User size={14} className="text-white" />
                  </div>
                  <span className="hidden lg:inline">{user?.name}</span>
                </Link>
                
                {user?.role && ['admin', 'moderator', 'employee'].includes(user.role) && (
                  <Link
                    to="/dashboard"
                    className="flex items-center gap-1.5 px-3 py-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors text-sm font-medium"
                  >
                    <LayoutDashboard size={18} />
                    <span className="hidden lg:inline">{t('nav.dashboard')}</span>
                  </Link>
                )}
                
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title={t('nav.logout')}
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/auth"
                  className="px-4 py-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors text-sm font-medium"
                >
                  {t('nav.login')}
                </Link>
                <Link
                  to="/auth?mode=register"
                  className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-sm font-medium shadow-md shadow-primary-200/50"
                >
                  {t('nav.register')}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100 animate-fade-in">
            <div className="flex flex-col space-y-1">
              {[
                { to: '/', label: t('nav.home') },
                { to: '/workspaces', label: t('nav.workspaces') },
                { to: '/about', label: t('nav.about') },
                { to: '/contact', label: t('nav.contact') }
              ].map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors font-medium"
                >
                  {link.label}
                </Link>
              ))}
              
              <div className="pt-3 mt-3 border-t border-gray-100">
                {isAuthenticated ? (
                  <>
                    <Link to="/profile" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-primary-50 rounded-lg">
                      <User size={18} /> {t('nav.profile')}
                    </Link>
                    {user?.role && ['admin', 'moderator', 'employee'].includes(user.role) && (
                      <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-primary-600 hover:bg-primary-50 rounded-lg">
                        <LayoutDashboard size={18} /> {t('nav.dashboard')}
                      </Link>
                    )}
                    <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg w-full text-left">
                      <LogOut size={18} /> {t('nav.logout')}
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/auth" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 text-gray-700 hover:bg-primary-50 rounded-lg">{t('nav.login')}</Link>
                    <Link to="/auth?mode=register" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 text-primary-600 font-medium hover:bg-primary-50 rounded-lg">{t('nav.register')}</Link>
                  </>
                )}
              </div>

              <div className="pt-3 mt-3 border-t border-gray-100">
                <div className="flex gap-2 px-4">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => changeLanguage(lang.code)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        i18n.language === lang.code
                          ? 'bg-primary-500 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {lang.flag} {lang.code.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};
