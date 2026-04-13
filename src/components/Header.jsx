import { useState, useEffect, useRef } from 'react';
import { Search, Bell, Plus, Moon, Sun, User, LogOut, Settings, Menu, Clock, Tag } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import GlobalAddModal from './GlobalAddModal';
import ProfileModal from './ProfileModal';
import { useTasks } from '../context/TaskContext';
import { useHabits } from '../context/HabitContext';
import { useGoals } from '../context/GoalContext';
import { useFinance } from '../context/FinanceContext';
import { useAuth } from '../context/AuthContext';

const Header = ({ onMenuClick }) => {
  const [isDark, setIsDark] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isAddNewOpen, setIsAddNewOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedModalType, setSelectedModalType] = useState(null);
  
  const [lastReadActivityTime, setLastReadActivityTime] = useState(() => {
    return parseInt(localStorage.getItem('producter-last-read')) || 0;
  });
  
  const profileRef = useRef(null);
  const addNewRef = useRef(null);
  const notifRef = useRef(null);
  const searchRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  const isCalendar = location.pathname === '/calendar';

  const { tasks } = useTasks();
  const { habits } = useHabits();
  const { goals } = useGoals();
  const { transactions } = useFinance();
  const { user, logout } = useAuth();

  const userDisplayName = user?.user_metadata?.first_name 
    ? `${user.user_metadata.first_name} ${user.user_metadata.last_name || ''}`.trim()
    : user?.email?.split('@')[0];

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/auth');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const openModal = (type) => {
    setSelectedModalType(type);
    setIsAddNewOpen(false);
  };

  useEffect(() => {
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
      setIsDark(true);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) setIsProfileOpen(false);
      if (addNewRef.current && !addNewRef.current.contains(event.target)) setIsAddNewOpen(false);
      if (notifRef.current && !notifRef.current.contains(event.target)) setIsNotificationsOpen(false);
      if (searchRef.current && !searchRef.current.contains(event.target)) setIsSearchOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Compute Notifications (Recent Activities)
  const recentActivities = [];
  const addSafeDate = (item, type, title) => {
    let d = item.created_at;
    if (!d && item.id && !isNaN(parseInt(item.id))) {
       d = new Date(parseInt(item.id)).toISOString();
    }
    recentActivities.push({ id: type.toLowerCase() + item.id, type, title, date: d || new Date().toISOString() });
  };

  tasks.forEach(t => addSafeDate(t, 'Task', `Added task: ${t.name}`));
  habits.forEach(h => addSafeDate(h, 'Habit', `Added habit: ${h.name}`));
  goals.forEach(g => addSafeDate(g, 'Goal', `Created goal: ${g.name}`));
  transactions.forEach(tx => addSafeDate(tx, 'Finance', `Logged ${tx.type}: ₹${tx.amount} (${tx.category})`));

  const sortedActivities = recentActivities.sort((a,b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
  
  const hasUnread = sortedActivities.some(a => new Date(a.date).getTime() > lastReadActivityTime);

  const handleMarkAsRead = () => {
    const now = Date.now();
    setLastReadActivityTime(now);
    localStorage.setItem('producter-last-read', now.toString());
  };

  // Compute Search Results
  const searchResults = [];
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    tasks.forEach(t => t.name.toLowerCase().includes(q) && searchResults.push({ id: 't'+t.id, type: 'Task', title: t.name }));
    habits.forEach(h => h.name.toLowerCase().includes(q) && searchResults.push({ id: 'h'+h.id, type: 'Habit', title: h.name }));
    goals.forEach(g => g.name.toLowerCase().includes(q) && searchResults.push({ id: 'g'+g.id, type: 'Goal', title: g.name }));
    transactions.forEach(tx => (tx.category.toLowerCase().includes(q) || tx.amount.toString().includes(q)) && searchResults.push({ id: 'tx'+tx.id, type: 'Finance', title: `${tx.category} (₹${tx.amount})` }));
  }

  const typeColors = {
    Task: 'text-blue-500 bg-blue-50 dark:bg-blue-500/10 dark:text-blue-400 border-blue-200 dark:border-blue-500/20',
    Habit: 'text-purple-500 bg-purple-50 dark:bg-purple-500/10 dark:text-purple-400 border-purple-200 dark:border-purple-500/20',
    Goal: 'text-orange-500 bg-orange-50 dark:bg-orange-500/10 dark:text-orange-400 border-orange-200 dark:border-orange-500/20',
    Finance: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20'
  };

  return (
    <>
    <header className="px-4 py-3 md:px-6 md:py-4 flex items-center justify-between w-full transition-colors duration-300 relative z-20">
      
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger */}
        <button 
          onClick={onMenuClick}
          className="md:hidden p-2 -ml-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        {!isCalendar && (
          <div className="hidden sm:block">
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Dashboard
            </h1>
            <p className="text-[13px] font-medium text-slate-500 dark:text-slate-400 mt-1 hidden lg:block">
              One Degree More In Every Single Day.. <span className="text-orange-500">🔥</span>
            </p>
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-2 md:gap-4 ml-auto relative">
        {/* Search */}
        <div className="relative hidden lg:block" ref={searchRef}>
          <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-full px-3 py-2 w-64 bg-slate-50 dark:bg-slate-800 transition-colors duration-300">
            <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
            <input 
              type="text" 
              placeholder="Search tasks, habits..." 
              value={searchQuery}
              onChange={(e) => {
                 setSearchQuery(e.target.value);
                 setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              className="bg-transparent border-none outline-none text-[13px] w-full text-slate-600 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500" 
            />
          </div>
          {isSearchOpen && searchQuery.trim() !== '' && (
            <div className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700 py-2 z-50 max-h-80 overflow-y-auto">
               <div className="px-4 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-700/50 mb-2">Search Results</div>
               {searchResults.length === 0 ? (
                 <div className="px-4 py-3 text-[13px] text-slate-500">No results found.</div>
               ) : (
                 searchResults.map(res => (
                   <div 
                     key={res.id} 
                     onClick={() => {
                        setIsSearchOpen(false);
                        if (res.type === 'Task') navigate('/tasks');
                        else if (res.type === 'Habit') navigate('/habits');
                        else if (res.type === 'Goal') navigate('/goals');
                        else if (res.type === 'Finance') navigate('/finance');
                     }} 
                     className="px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer flex flex-col gap-1 transition-colors"
                   >
                      <span className="text-[14px] font-medium text-slate-800 dark:text-slate-200">{res.title}</span>
                      <span className={`text-[10px] uppercase tracking-wider font-bold w-fit px-1.5 py-0.5 rounded border ${typeColors[res.type]}`}>{res.type}</span>
                   </div>
                 ))
               )}
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <button 
          onClick={toggleTheme}
          className="flex items-center justify-center w-9 h-9 md:w-10 md:h-10 rounded-full border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors bg-white dark:bg-slate-900"
        >
          {isDark ? <Sun className="w-[16px] h-[16px] md:w-[18px] md:h-[18px]" strokeWidth={1.5} /> : <Moon className="w-[16px] h-[16px] md:w-[18px] md:h-[18px]" strokeWidth={1.5} />}
        </button>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className={`flex items-center justify-center w-9 h-9 md:w-10 md:h-10 rounded-full border transition-colors ${
              isNotificationsOpen 
                ? 'border-emerald-500 text-emerald-500' 
                : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
            } bg-white dark:bg-slate-900`}
          >
            <Bell className="w-[16px] h-[16px] md:w-[18px] md:h-[18px]" strokeWidth={1.5} />
            {hasUnread && (
               <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 border-2 border-white dark:border-slate-900 rounded-full"></div>
            )}
          </button>
          
          {isNotificationsOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700 py-2 z-50">
               <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700/50 flex items-center justify-between">
                 <h4 className="text-[14px] font-bold text-slate-800 dark:text-white">Recent Activities</h4>
                 {hasUnread && <span className="text-[11px] bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 px-2 py-0.5 rounded-full font-bold">New</span>}
               </div>
               <div className="max-h-80 overflow-y-auto">
                 {sortedActivities.length === 0 ? (
                   <div className="px-4 py-6 text-center text-[13px] text-slate-500">No recent activities.</div>
                 ) : (
                   sortedActivities.map(act => {
                     const isUnread = new Date(act.date).getTime() > lastReadActivityTime;
                     return (
                       <div key={act.id} className={`px-4 py-3 border-b border-slate-50 dark:border-slate-700/30 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors flex gap-3 ${isUnread ? 'bg-slate-50 dark:bg-slate-800/80' : ''}`}>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${typeColors[act.type]}`}>
                            <Tag className="w-4 h-4" />
                          </div>
                          <div className="flex flex-col gap-0.5 relative">
                            {isUnread && <div className="absolute -left-12 top-2 w-1.5 h-1.5 rounded-full bg-emerald-500"></div>}
                            <p className={`text-[13px] leading-tight ${isUnread ? 'font-bold text-slate-800 dark:text-white' : 'font-medium text-slate-700 dark:text-slate-300'}`}>{act.title}</p>
                            <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
                               <Clock className="w-3 h-3" />
                               {new Date(act.date).toLocaleDateString()} at {new Date(act.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </div>
                          </div>
                       </div>
                     );
                   })
                 )}
               </div>
               <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-700/50 text-center">
                 <button onClick={handleMarkAsRead} disabled={!hasUnread} className={`text-[12px] font-bold ${hasUnread ? 'text-emerald-500 hover:text-emerald-600' : 'text-slate-400 cursor-not-allowed'}`}>Mark all as read</button>
               </div>
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className={`flex items-center gap-2 px-2 md:px-3 h-9 md:h-10 rounded-full border transition-colors ${
              isProfileOpen 
                ? 'border-emerald-500 text-emerald-500' 
                : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
            } bg-white dark:bg-slate-900`}
          >
            <div className="w-6 h-6 md:w-7 md:h-7 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-500">
               <User className="w-[14px] h-[14px] md:w-[16px] md:h-[16px]" strokeWidth={2} />
            </div>
            <span className="text-[13px] font-semibold hidden sm:inline max-w-[100px] truncate">
              {userDisplayName}
            </span>
          </button>
          
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700 py-1 z-50">
              <div className="px-4 py-2 border-b border-slate-50 dark:border-slate-700/50 sm:hidden">
                <p className="text-[12px] font-bold text-slate-900 dark:text-white truncate">{userDisplayName}</p>
                <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
              </div>
              <button 
                onClick={() => {
                  setIsProfileOpen(false);
                  setIsProfileModalOpen(true);
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                <Settings className="w-4 h-4" />
                Update Profile
              </button>
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium text-red-500 hover:bg-red-50 dark:hover:bg-slate-700 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          )}
        </div>
        
        {/* Add New Button Dropdown */}
        <div className="relative" ref={addNewRef}>
          <button 
            onClick={() => setIsAddNewOpen(!isAddNewOpen)}
            className="flex items-center gap-2 bg-[#10b981] hover:bg-emerald-600 dark:hover:bg-emerald-500 text-white px-3 py-2 md:px-5 md:py-2.5 rounded-full md:rounded-full rounded-xl text-[14px] font-medium transition-colors shadow-sm shadow-emerald-200 dark:shadow-none ml-1"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add New</span>
          </button>
          
          {isAddNewOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700 py-1 z-50">
              <button onClick={() => openModal('Task')} className="w-full text-left px-4 py-2.5 text-[13px] font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                Add Task
              </button>
              <button onClick={() => openModal('Habit')} className="w-full text-left px-4 py-2.5 text-[13px] font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                Add Habit
              </button>
              <button onClick={() => openModal('Goal')} className="w-full text-left px-4 py-2.5 text-[13px] font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                Add Goal
              </button>
              <button onClick={() => openModal('Finance')} className="w-full text-left px-4 py-2.5 text-[13px] font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                Add Finance
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
    <GlobalAddModal 
      isOpen={selectedModalType !== null} 
      type={selectedModalType} 
      onClose={() => setSelectedModalType(null)} 
    />
    <ProfileModal 
      isOpen={isProfileModalOpen}
      onClose={() => setIsProfileModalOpen(false)}
    />
    </>
  );
};

export default Header;
