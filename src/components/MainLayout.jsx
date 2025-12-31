// src/components/MainLayout.jsx
import React from 'react';
import Sidebar from './sidebar';
import { Outlet } from 'react-router-dom';

const MainLayout = () => {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-100 dark:bg-black">
      <Sidebar />

      {/* Main scrollable content area */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
