import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Search, 
  FileEdit, 
  Presentation, 
  Monitor, 
  Box,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Link2
} from 'lucide-react';
import { useAppStore } from '@/stores';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard', color: 'text-cyan-400' },
  { path: '/pdf-docx', icon: FileText, label: 'PDF & DOCX', color: 'text-red-400' },
  { path: '/researcher', icon: Search, label: 'Researcher', color: 'text-blue-400' },
  { path: '/report-writer', icon: FileEdit, label: 'Report Writer', color: 'text-green-400' },
  { path: '/slide-maker', icon: Presentation, label: 'Slide Maker', color: 'text-purple-400' },
  { path: '/computer-expert', icon: Monitor, label: 'Computer Expert', color: 'text-orange-400' },
  { path: '/model-hub', icon: Box, label: 'Model Hub', color: 'text-yellow-400' },
  { path: '/plugins', icon: Link2, label: 'Plugins', color: 'text-cyan-400' },
  { path: '/settings', icon: Settings, label: 'Settings', color: 'text-gray-400' },
];

const Sidebar: React.FC = () => {
  const { sidebarOpen, toggleSidebar } = useAppStore();

  return (
    <aside 
      className={`fixed left-0 top-0 h-screen bg-slate-900/80 backdrop-blur-xl border-r border-slate-700/50 
                  flex flex-col transition-all duration-300 z-50 ${sidebarOpen ? 'w-64' : 'w-20'}`}
    >
      {/* Logo */}
      <div className="h-20 flex items-center justify-center border-b border-slate-700/50 px-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          {sidebarOpen && (
            <div className="animate-fade-in">
              <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                AI Desktop
              </h1>
              <p className="text-xs text-slate-400">Powered by MiniMax</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative
              ${isActive 
                ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-white shadow-lg' 
                : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className={`w-5 h-5 ${item.color} ${isActive ? 'drop-shadow-lg' : ''}`} />
                {sidebarOpen && (
                  <span className="font-medium">{item.label}</span>
                )}
                {!sidebarOpen && (
                  <div className="absolute left-full ml-2 px-3 py-1 bg-slate-800 text-white text-sm rounded-lg 
                                  opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50
                                  shadow-xl border border-slate-700 pointer-events-none">
                    {item.label}
                  </div>
                )}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-cyan-500 to-purple-500 rounded-r-full" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="h-14 flex items-center justify-center border-t border-slate-700/50 text-slate-400 
                   hover:text-white hover:bg-slate-800/50 transition-all duration-200"
      >
        {sidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
      </button>
    </aside>
  );
};

export default Sidebar;
