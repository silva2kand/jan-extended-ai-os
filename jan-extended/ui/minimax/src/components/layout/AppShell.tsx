import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import Notifications from '../common/Notifications';
import { useAppStore } from '@/stores';

interface AppShellProps {
  children: React.ReactNode;
}

import ChatWindow from '../common/ChatWindow';

const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const { sidebarOpen } = useAppStore();

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        {/* Header */}
        <Header />

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6">
          <div className="animate-fade-in">
            {children}
          </div>
        </main>
      </div>

      {/* Persistent Chat */}
      <ChatWindow />

      {/* Notifications */}
      <Notifications />
    </div>
  );
};

export default AppShell;
