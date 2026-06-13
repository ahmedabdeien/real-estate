import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import AnnouncementBar from './AnnouncementBar';
import AiChatWidget from '../AI/AiChatWidget';

const AppLayout = () => (
  <div className="flex h-screen overflow-hidden" style={{ backgroundColor: 'var(--color-background)' }}>
    <Sidebar />
    <div className="flex flex-col flex-1 overflow-hidden">
      <AnnouncementBar />
      <Navbar />
      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        <Outlet />
      </main>
    </div>
    <AiChatWidget />
  </div>
);

export default AppLayout;
