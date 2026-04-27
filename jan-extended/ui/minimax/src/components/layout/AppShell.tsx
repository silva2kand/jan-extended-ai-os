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
    <div className="flex h-screen bg-[#0f172a] relative overflow-hidden">
      {/* Neural background pulses */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/5 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/5 rounded-full blur-[120px] animate-pulse" />
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
