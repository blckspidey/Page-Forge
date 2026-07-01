import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  FileText, Layers, Scissors, Grid, Edit3, Repeat, ShieldAlert,
  Menu, X, LogIn, LogOut, Clock, ChevronDown, Sparkles, MessageSquare, User
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { path: '/merge',    name: 'Merge',    icon: Layers },
  { path: '/split',    name: 'Split',    icon: Scissors },
  { path: '/organize', name: 'Organize', icon: Grid },
  { path: '/edit',     name: 'Edit',     icon: Edit3 },
  { path: '/convert',  name: 'Convert',  icon: Repeat },
  { path: '/secure',   name: 'Secure',   icon: ShieldAlert },
];

const aiItems = [
  { path: '/chat-pdf',  name: 'Chat with PDF', icon: MessageSquare },
  { path: '/summarize', name: 'AI Summary',     icon: Sparkles },
];

export default function Navbar() {
  const location              = useLocation();
  const navigate              = useNavigate();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [aiMenuOpen, setAiMenuOpen]     = useState(false);
  const userMenuRef = useRef(null);
  const aiMenuRef   = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserMenuOpen(false);
      if (aiMenuRef.current   && !aiMenuRef.current.contains(e.target))   setAiMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => {
    await logout();
    setUserMenuOpen(false);
    navigate('/');
  };

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <nav className="sticky top-0 z-50 border-b border-white/5 bg-slate-950/80 backdrop-blur-md shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2.5 group flex-shrink-0" onClick={() => setMobileOpen(false)}>
            <FileText className="w-7 h-7 text-brand-400 group-hover:text-brand-300 transition-colors drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
            <span className="text-lg font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white via-brand-100 to-brand-400 group-hover:to-brand-300 transition-all duration-300 uppercase">
              Page Forge
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-brand-500/20 text-brand-300 border border-brand-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}

            {/* AI Dropdown */}
            <div className="relative" ref={aiMenuRef}>
              <button
                onClick={() => setAiMenuOpen(v => !v)}
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 border ${
                  aiItems.some(i => i.path === location.pathname)
                    ? 'bg-brand-500/20 text-brand-300 border-brand-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-white/5 border-transparent'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Tools</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${aiMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              {aiMenuOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 glass-panel rounded-xl border border-white/10 shadow-xl py-1 z-50">
                  {aiItems.map(item => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setAiMenuOpen(false)}
                        className="flex items-center space-x-2.5 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-all"
                      >
                        <Icon className="w-4 h-4 text-brand-400" />
                        <span>{item.name}</span>
                        {!user && <span className="ml-auto text-xs text-brand-400">🔒</span>}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right: Auth */}
          <div className="hidden md:flex items-center space-x-2">
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  id="user-menu-btn"
                  onClick={() => setUserMenuOpen(v => !v)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-xl border border-white/10 hover:border-brand-500/30 bg-white/5 hover:bg-white/8 transition-all duration-200"
                >
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-6 h-6 rounded-full object-cover" />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-brand-600 flex items-center justify-center text-xs font-bold text-white">
                      {initials}
                    </div>
                  )}
                  <span className="text-sm text-slate-200 font-medium max-w-[100px] truncate">{user.name || user.email}</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {userMenuOpen && (
                  <div className="absolute top-full right-0 mt-2 w-52 glass-panel rounded-xl border border-white/10 shadow-xl py-1 z-50">
                    <div className="px-4 py-2.5 border-b border-white/5">
                      <p className="text-xs font-medium text-white truncate">{user.name}</p>
                      <p className="text-xs text-slate-500 truncate">{user.email}</p>
                    </div>
                    <Link
                      to="/history"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center space-x-2.5 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-all"
                    >
                      <Clock className="w-4 h-4 text-slate-400" />
                      <span>PDF History</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-2.5 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/5 transition-all"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  id="navbar-login-btn"
                  className="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10 transition-all"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  id="navbar-register-btn"
                  className="px-4 py-2 rounded-lg text-sm font-semibold bg-brand-600 hover:bg-brand-500 text-white transition-all shadow-lg shadow-brand-900/40 glow-brand"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(prev => !prev)}
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/5 bg-slate-950/95 backdrop-blur-md">
          <div className="px-4 py-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-brand-500/20 text-brand-300 border border-brand-500/20'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}

            <div className="border-t border-white/5 pt-2 mt-2">
              <p className="text-xs text-slate-600 uppercase tracking-wider px-4 py-1">AI Tools</p>
              {aiItems.map(item => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all"
                  >
                    <Icon className="w-4 h-4 text-brand-400" />
                    <span>{item.name}</span>
                    {!user && <span className="ml-auto text-xs text-brand-400">Login required</span>}
                  </Link>
                );
              })}
            </div>

            {/* Mobile Auth */}
            <div className="border-t border-white/5 pt-2 mt-2">
              {user ? (
                <>
                  <div className="flex items-center space-x-3 px-4 py-3">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-sm font-bold text-white">
                        {initials}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-white">{user.name}</p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                    </div>
                  </div>
                  <Link
                    to="/history"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center space-x-3 px-4 py-3 rounded-xl text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-all"
                  >
                    <Clock className="w-4 h-4" />
                    <span>PDF History</span>
                  </Link>
                  <button
                    onClick={() => { handleLogout(); setMobileOpen(false); }}
                    className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm text-red-400 hover:bg-red-500/5 transition-all"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </>
              ) : (
                <div className="space-y-2 px-1 pb-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="block w-full text-center px-4 py-2.5 rounded-xl text-sm font-medium border border-white/10 text-slate-300 hover:text-white hover:bg-white/5 transition-all"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileOpen(false)}
                    className="block w-full text-center px-4 py-2.5 rounded-xl text-sm font-semibold bg-brand-600 hover:bg-brand-500 text-white transition-all"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
