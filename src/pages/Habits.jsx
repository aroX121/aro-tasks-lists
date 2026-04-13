import { useState } from 'react';
import { Activity, Plus, Check, Flame, X } from 'lucide-react';
import { useHabits } from '../context/HabitContext';

// Helper to get local date string YYYY-MM-DD
const getLocalDateStr = (d = new Date()) => {
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
};

const calculateStreak = (completions = []) => {
  if (!completions.length) return 0;
  let streak = 0;
  let currentDate = new Date();
  const todayStr = getLocalDateStr(currentDate);
  
  if (completions.includes(todayStr)) {
    streak++;
    currentDate.setDate(currentDate.getDate() - 1);
  } else {
    currentDate.setDate(currentDate.getDate() - 1);
    const yesterdayStr = getLocalDateStr(currentDate);
    if (!completions.includes(yesterdayStr)) return 0;
  }

  while (true) {
    const dStr = getLocalDateStr(currentDate);
    if (completions.includes(dStr)) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }
  return Math.max(streak, 0); // ensure positive
};

const Habits = () => {
  const { habits, addHabit, toggleHabitDate } = useHabits();
  const [isAdding, setIsAdding] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');

  const todayStr = getLocalDateStr();
  const todayCompletions = habits.filter(h => h.completions.includes(todayStr)).length;
  const progressPercent = habits.length > 0 ? Math.round((todayCompletions / habits.length) * 100) : 0;

  const last7Days = Array.from({length: 7}).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return {
      date: d,
      dateStr: getLocalDateStr(d),
      dayName: d.toLocaleDateString('en-US', { weekday: 'short' })
    };
  });

  const handleAdd = (e) => {
    e.preventDefault();
    if (newHabitName.trim()) {
      addHabit({ name: newHabitName.trim(), frequency: 'daily' });
      setNewHabitName('');
      setIsAdding(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-[28px] font-bold text-[#1c1c1c] dark:text-white">Daily Habits</h2>
          <p className="text-[14px] text-[#6b6a68] dark:text-slate-400 mt-1">
            {habits.length > 0 ? `${todayCompletions}/${habits.length} habits completed today` : 'Start building better habits daily'}
          </p>
        </div>
        {!isAdding && (
          <button 
            onClick={() => setIsAdding(true)}
            className="bg-[#1c1c1c] hover:bg-black dark:bg-slate-800 dark:hover:bg-slate-700 dark:border dark:border-slate-700 text-white px-5 py-2.5 rounded-lg text-[14px] font-medium transition-colors flex items-center gap-2 self-start sm:self-auto shadow-sm"
          >
            <Plus size={16} /> New Habit
          </button>
        )}
      </div>

      {habits.length > 0 && (
        <div className="mb-8 bg-white dark:bg-slate-800/80 p-4 rounded-2xl border border-[#e8e4db] dark:border-slate-700 shadow-sm">
           <div className="flex items-center justify-between mb-2">
             <span className="text-[14px] font-medium text-[#1c1c1c] dark:text-slate-200">Today's Progress</span>
             <span className="text-[14px] font-bold text-[#1c1c1c] dark:text-white">{progressPercent}%</span>
           </div>
           <div className="w-full bg-[#f3efea] dark:bg-slate-700/50 rounded-full h-2.5">
             <div 
               className="bg-[#1c1c1c] dark:bg-emerald-500 h-2.5 rounded-full transition-all duration-1000 ease-out" 
               style={{ width: `${progressPercent}%` }}
             ></div>
           </div>
        </div>
      )}

      {isAdding && (
         <div className="mb-6 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-[#1c1c1c] dark:border-slate-600 shadow-md animate-in slide-in-from-top-2">
            <form onSubmit={handleAdd} className="flex gap-3">
               <input
                 type="text"
                 placeholder="E.g., Read for 20 minutes"
                 value={newHabitName}
                 onChange={(e) => setNewHabitName(e.target.value)}
                 className="flex-1 bg-transparent text-[15px] text-[#1c1c1c] dark:text-white placeholder:text-[#a1a1aa] dark:placeholder:text-slate-500 outline-none"
                 autoFocus
               />
               <button type="button" onClick={() => setIsAdding(false)} className="px-3 py-2 text-[#6b6a68] dark:text-slate-400 hover:bg-[#f3efea] dark:hover:bg-slate-700 rounded-lg transition-colors">
                 Cancel
               </button>
               <button type="submit" disabled={!newHabitName.trim()} className="bg-[#1c1c1c] dark:bg-emerald-500 text-white px-4 py-2 rounded-lg text-[14px] font-medium disabled:opacity-50 transition-colors">
                 Add
               </button>
            </form>
         </div>
      )}

      {habits.length === 0 && !isAdding ? (
        <div className="bg-white dark:bg-slate-800/60 rounded-2xl border border-[#e8e4db] dark:border-slate-700 p-8 mt-4">
          <div className="flex flex-col items-center justify-center text-[#a1a1aa] dark:text-slate-400 gap-4 py-8">
            <div className="w-16 h-16 bg-[#f3efea] dark:bg-slate-900/50 flex items-center justify-center rounded-2xl">
              <Activity className="w-8 h-8 text-[#6b6a68] dark:text-slate-500" />
            </div>
            <p className="text-[15px]">You haven't set up any habits yet.</p>
            <button 
              onClick={() => setIsAdding(true)}
              className="mt-2 text-[#1c1c1c] dark:text-white font-medium border border-[#e8e4db] dark:border-slate-700 px-4 py-2 rounded-lg hover:bg-[#f3efea] dark:hover:bg-slate-800 transition-colors"
            >
              Add your first habit
            </button>
          </div>
        </div>
      ) : (
        <div className="grid gap-3">
          {habits.map((habit) => {
            const isDoneToday = habit.completions.includes(todayStr);
            const streak = calculateStreak(habit.completions);
            
            return (
              <div 
                key={habit.id}
                onClick={() => toggleHabitDate(habit.id, todayStr)}
                className={`group bg-white dark:bg-slate-800 rounded-2xl border transition-all duration-300 cursor-pointer p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none bg-gradient-to-br
                  ${isDoneToday 
                    ? 'border-[#1c1c1c] dark:border-emerald-500/50 shadow-sm from-[#faf9f7] to-[#f3efea] dark:from-slate-800/80 dark:to-emerald-900/10' 
                    : 'border-[#e8e4db] dark:border-slate-700/80 hover:border-[#cfcbc5] dark:hover:border-slate-600 hover:shadow-sm from-white to-[#faf9f7] dark:from-slate-800 dark:to-slate-800/50 dark:hover:to-slate-700/30'}`}
              >
                {/* Left side: Checkbox & Info */}
                <div className="flex items-center gap-4">
                  <div className={`w-6 h-6 rounded-md border flex items-center justify-center transition-colors shrink-0
                    ${isDoneToday 
                      ? 'bg-[#1c1c1c] border-[#1c1c1c] dark:bg-emerald-500 dark:border-emerald-500' 
                      : 'bg-white dark:bg-slate-700/50 border-[#cfcbc5] dark:border-slate-600 group-hover:border-[#1c1c1c] dark:group-hover:border-slate-400'}`}
                  >
                    {isDoneToday && <Check size={14} className="text-white" />}
                  </div>
                  
                  <div>
                     <h3 className={`text-[16px] font-semibold transition-colors ${
                       isDoneToday 
                         ? 'text-[#1c1c1c] dark:text-slate-400 line-through decoration-[#a1a1aa] dark:decoration-slate-500' 
                         : 'text-[#1c1c1c] dark:text-white'
                     }`}>
                      {habit.name}
                    </h3>
                    {streak > 0 && (
                       <div className={`flex items-center gap-1 mt-1 text-[13px] font-medium w-fit px-2 py-0.5 rounded-full transition-colors ${
                         isDoneToday 
                           ? 'text-orange-600/80 bg-orange-50/80 dark:text-orange-400/80 dark:bg-orange-500/10' 
                           : 'text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-500/10'
                       }`}>
                         <Flame size={12} className={isDoneToday ? "fill-current opacity-80" : "fill-current"} />
                         <span>{streak} day streak</span>
                       </div>
                    )}
                  </div>
                </div>

                {/* Right side: Weekly View Mini */}
                <div className="flex items-center gap-2 self-start sm:self-auto pl-10 sm:pl-0">
                  {last7Days.map((day, idx) => {
                    const isCompleted = habit.completions.includes(day.dateStr);
                    const isToday = day.dateStr === todayStr;
                    return (
                      <div key={day.dateStr} className="flex flex-col items-center gap-1.5" title={day.dateStr}>
                        <span className={`text-[10px] font-medium ${
                          isToday 
                            ? 'text-[#1c1c1c] dark:text-slate-300' 
                            : 'text-[#a1a1aa] dark:text-slate-500'
                        }`}>
                          {day.dayName.charAt(0)}
                        </span>
                        <div className={`w-5 h-5 rounded flex items-center justify-center transition-all
                          ${isCompleted 
                            ? 'bg-[#1c1c1c] dark:bg-emerald-500/20 text-white dark:text-emerald-400' 
                            : 'bg-[#f3efea] dark:bg-slate-700/30 text-transparent'}`}
                        >
                           {isCompleted 
                             ? <Check size={10} /> 
                             : <X size={10} className="opacity-0 group-hover:opacity-20 dark:group-hover:opacity-40" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Habits;
