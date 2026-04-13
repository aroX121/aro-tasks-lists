import { NavLink } from 'react-router-dom';
import { LayoutDashboard, CheckSquare, Calendar, Activity, Target, Wallet } from 'lucide-react';

const Sidebar = ({ onClose }) => {
  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Tasks', path: '/tasks', icon: CheckSquare },
    { name: 'Calendar', path: '/calendar', icon: Calendar },
    { name: 'Habits', path: '/habits', icon: Activity },
    { name: 'Goals', path: '/goals', icon: Target },
    { name: 'Finance', path: '/finance', icon: Wallet },
  ];

  return (
    <aside className="w-[240px] h-full bg-white dark:bg-slate-900 flex flex-col py-6 transition-colors duration-300">
      {/* Brand */}
      <div className="px-6 flex items-center gap-3 mb-10">
        <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 relative flex items-center justify-center text-emerald-500 border border-emerald-100 dark:border-emerald-500/20">
           {/* Zap icon approximation */}
           <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
        </div>
        <div>
          <h2 className="font-bold text-slate-800 dark:text-white text-[15px] leading-tight text-left">Producter</h2>
          <p className="text-[12px] text-slate-500 dark:text-slate-400 leading-tight">Track your life</p>
        </div>
      </div>

      {/* Main Nav */}
      <nav className="px-4 space-y-2 flex-1">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 text-[14px] font-medium ${
                isActive
                  ? 'bg-[#10b981] text-white shadow-sm shadow-emerald-200 dark:shadow-none'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-white'
              }`
            }
          >
            <item.icon className="w-[18px] h-[18px] stroke-[2px]" />
            {item.name}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
