import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const isCalendar = location.pathname === '/calendar';

  return (
    <div className="flex h-screen bg-[#f3f4fb] dark:bg-slate-950 p-2 md:p-4 gap-2 md:gap-4 text-slate-800 dark:text-slate-100 font-sans tracking-tight transition-colors duration-300 overflow-hidden relative">
      
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Panel */}
      <div 
        className={`fixed md:static inset-y-2 left-2 z-50 transform transition-transform duration-300 ease-in-out md:transform-none bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden flex-shrink-0 flex flex-col ${
          isMobileMenuOpen ? 'translate-x-0 w-[240px]' : '-translate-x-[120%] w-[240px] md:translate-x-0'
        }`}
      >
        <Sidebar onClose={() => setIsMobileMenuOpen(false)} />
      </div>

      <div className="flex-1 flex flex-col gap-2 md:gap-4 overflow-hidden w-full h-full relative">
        {/* Header Panel */}
        <div className={`bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex-shrink-0 transition-colors duration-300 z-30 ${isCalendar ? 'md:hidden' : ''}`}>
          <Header onMenuClick={() => setIsMobileMenuOpen(true)} />
        </div>

        {/* Main Content Panel */}
        <main className="flex-1 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-y-auto overflow-x-hidden w-full p-4 md:p-6 transition-colors duration-300 custom-scrollbar relative">
          <div className="max-w-[1200px] mx-auto pb-10 h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;

