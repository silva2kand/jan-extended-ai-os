import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  Search, 
  Bell, 
  User, 
  Moon, 
  Sun, 
  Menu,
  LogOut,
  Settings,
  ChevronDown
} from 'lucide-react';
import { useAppStore, useUserStore } from '@/stores';

const routeTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/pdf-docx': 'PDF & DOCX Processor',
  '/researcher': 'Researcher',
  '/report-writer': 'Report Writer',
  '/slide-maker': 'Slide Maker',
  '/computer-expert': 'Computer Expert',
  '/settings': 'Settings',
};

const Header: React.FC = () => {
  const location = useLocation();
  const { toggleSidebar } = useAppStore();
  const { user } = useUserStore();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const title = routeTitles[location.pathname] || 'AI Desktop';

  return (
    <header className="h-20 bg-slate-900/50 backdrop-blur-xl border-b border-slate-700/50 px-6 flex items-center justify-between">
      {/* Left Section */}
      <div className="flex items-center gap-6">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-slate-800/50 transition-colors lg:hidden"
        >
          <Menu className="w-5 h-5 text-slate-400" />
        </button>

        <div>
          <h1 className="text-2xl font-bold text-white">{title}</h1>
          <p className="text-sm text-slate-400">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
      </div>

      {/* Center Section - Search */}
      <div className="hidden md:flex flex-1 max-w-2xl mx-8">
        <div className="relative w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search documents, projects, and more..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl 
                       text-white placeholder-slate-400 focus:outline-none focus:ring-2 
                       focus:ring-cyan-500/50 focus:border-transparent transition-all"
          />
          <kbd className="absolute right-4 top-1/2 -translate-y-1/2 px-2 py-1 text-xs bg-slate-700 
                         text-slate-400 rounded border border-slate-600">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button className="relative p-2 rounded-lg hover:bg-slate-800/50 transition-colors group">
          <Bell className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
        </button>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-800/50 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 
                          flex items-center justify-center text-white font-semibold">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-white">{user?.name || 'User'}</p>
              <p className="text-xs text-slate-400">{user?.email || 'user@example.com'}</p>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 hidden md:block" />
          </button>

          {showUserMenu && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setShowUserMenu(false)}
              />
              <div className="absolute right-0 mt-2 w-64 bg-slate-800/95 backdrop-blur-xl border border-slate-700/50 
                            rounded-xl shadow-2xl z-50 overflow-hidden animate-fade-in">
                <div className="p-4 border-b border-slate-700/50">
                  <p className="text-sm font-medium text-white">{user?.name || 'User'}</p>
                  <p className="text-xs text-slate-400">{user?.email || 'user@example.com'}</p>
                </div>
                <div className="p-2">
                  <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-slate-700/50 
                                   hover:text-white rounded-lg transition-colors">
                    <User className="w-4 h-4" />
                    <span className="text-sm">Profile</span>
                  </button>
                  <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-slate-700/50 
                                   hover:text-white rounded-lg transition-colors">
                    <Settings className="w-4 h-4" />
                    <span className="text-sm">Settings</span>
                  </button>
                  <div className="border-t border-slate-700/50 my-2" />
                  <button className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10
                                   rounded-lg transition-colors">
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm">Sign Out</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
