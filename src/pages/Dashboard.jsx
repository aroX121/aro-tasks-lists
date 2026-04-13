import { useState, useMemo } from 'react';
import { useTasks } from '../context/TaskContext';
import { useHabits } from '../context/HabitContext';
import { useFinance } from '../context/FinanceContext';
import { useGoals } from '../context/GoalContext';
import { useEvents } from '../context/EventContext';
import { Check, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#14b8a6', '#6366f1', '#ec4899', '#f97316', '#06b6d4'];

const CAL_COLORS = [
  { bg: 'bg-[#fef08a]', text: 'text-[#854d0e]', border: 'border-[#fde047]' }, // Yellow
  { bg: 'bg-[#fed7aa]', text: 'text-[#9a3412]', border: 'border-[#fdba74]' }, // Orange
  { bg: 'bg-[#bbf7d0]', text: 'text-[#166534]', border: 'border-[#86efac]' }, // Green
  { bg: 'bg-[#bfdbfe]', text: 'text-[#1e40af]', border: 'border-[#93c5fd]' }, // Blue
  { bg: 'bg-[#fbcfe8]', text: 'text-[#9d174d]', border: 'border-[#f9a8d4]' }, // Pink
  { bg: 'bg-[#e5e7eb]', text: 'text-[#374151]', border: 'border-[#d1d5db]' }, // Gray
];

const getLocalDateStr = (d = new Date()) => {
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
};

const Dashboard = () => {
  // Contexts
  const { tasks } = useTasks();
  const { habits, toggleHabitDate } = useHabits();
  const { transactions } = useFinance();
  const { goals } = useGoals();
  const { events } = useEvents();
  
  const [calendarView, setCalendarView] = useState('Today'); // 'Today' or 'Week'
  
  // Finance Chart Data
  const chartData = useMemo(() => {
    const expenses = transactions.filter(t => t.type === 'expense');
    const grouped = expenses.reduce((acc, current) => {
      acc[current.category] = (acc[current.category] || 0) + current.amount;
      return acc;
    }, {});
    
    return Object.entries(grouped)
      .map(([name, value]) => ({ name, value }))
      .filter(d => d.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  // Habit Dates
  const todayStr = getLocalDateStr();
  const last7Days = useMemo(() => {
    return Array.from({length: 7}).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return {
        date: d,
        dateStr: getLocalDateStr(d),
        dayName: d.toLocaleDateString('en-US', { weekday: 'short' })
      };
    });
  }, []);

  // Calendar Items
  const allItems = useMemo(() => [
    ...events.map(e => ({ ...e, itemType: 'event' })),
    ...tasks.map(t => ({
      id: `task-${t.id}`,
      title: t.name,
      date: t.dueDate,
      startTime: '08:00',
      endTime: '09:00',
      itemType: 'task',
      colorIdx: 3,
    })),
    ...goals.filter(g => g.deadline).map(g => ({
      id: `goal-${g.id}`,
      title: g.name,
      date: g.deadline,
      startTime: '10:00',
      endTime: '11:00',
      itemType: 'goal',
      colorIdx: 2,
    }))
  ], [events, tasks, goals]);

  const times = Array.from({ length: 15 }, (_, i) => {
    const hour = i + 7;
    return `${String(hour).padStart(2, '0')}:00`;
  });

  const getDayItems = (dateStr) => {
    return allItems.filter(item => item.date === dateStr);
  };

  const currentDateObj = new Date();
  const startOfWeek = new Date(currentDateObj);
  const day = startOfWeek.getDay();
  const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
  startOfWeek.setDate(diff);
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(d.getDate() + i);
    return d;
  });

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 w-full h-full flex flex-col gap-6">
      
      {/* Quick Habits */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
        <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Quick Habits</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {habits.slice(0, 3).map(habit => {
            const isDoneToday = habit.completions.includes(todayStr);
            return (
              <div key={habit.id} className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 border border-slate-100 dark:border-slate-600 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div 
                    onClick={() => toggleHabitDate(habit.id, todayStr)}
                    className={`w-5 h-5 rounded border flex items-center justify-center cursor-pointer transition-colors
                      ${isDoneToday ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white border-slate-300 dark:bg-slate-800 dark:border-slate-500'}`}
                  >
                    {isDoneToday && <Check size={12} />}
                  </div>
                  <span className={`text-[14px] font-semibold ${isDoneToday ? 'line-through text-slate-400' : 'text-slate-800 dark:text-white'}`}>
                    {habit.name}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  {last7Days.map(day => {
                    const isCompleted = habit.completions.includes(day.dateStr);
                    const isToday = day.dateStr === todayStr;
                    return (
                      <div 
                        key={day.dateStr} 
                        className={`flex flex-col items-center gap-1 ${isToday ? 'cursor-pointer' : 'cursor-default'}`} 
                        onClick={() => {
                          if (isToday) toggleHabitDate(habit.id, day.dateStr);
                        }}
                      >
                        <span className={`text-[10px] font-medium ${isToday ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400 dark:text-slate-500'}`}>
                          {day.dayName.charAt(0)}
                        </span>
                        <div className={`w-4 h-4 rounded-sm flex items-center justify-center transition-all ${isCompleted ? 'bg-emerald-500/20 text-emerald-500' : 'bg-slate-200 dark:bg-slate-600/50'} ${!isToday && !isCompleted ? 'opacity-50' : ''}`}>
                          {isCompleted && <Check size={10} />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
          {habits.length === 0 && (
             <p className="text-[13px] text-slate-500">No habits added yet.</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch flex-1">
        
        {/* Left Column: Finance Chart */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-6 flex flex-col shadow-sm transition-colors">
          <div className="flex items-center justify-between mb-2">
             <h2 className="text-lg font-bold text-slate-800 dark:text-white">Expenses by Category</h2>
          </div>
          
          <div className="flex-1 flex flex-col justify-start py-4">
             {chartData.length > 0 ? (
                <div className="flex-1 w-full relative -ml-4 min-h-[250px] max-h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => `₹${value.toLocaleString()}`}
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Legend underneath */}
                  <div className="w-full flex flex-wrap justify-center gap-3 pt-4 pl-4">
                    {chartData.slice(0, 4).map((entry, index) => (
                       <div key={entry.name} className="flex items-center gap-2 text-xs">
                         <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                         <span className="text-slate-600 dark:text-slate-300 truncate max-w-[80px]" title={entry.name}>{entry.name}</span>
                       </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
                  No total expenses recorded yet.
                </div>
              )}
          </div>
        </div>

        {/* Right Column: Calendar */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-6 flex flex-col shadow-sm relative transition-colors">
           <div className="flex items-center justify-between mb-6 z-10">
             <h2 className="text-lg font-bold text-slate-800 dark:text-white">Calendar</h2>
             <div className="flex bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
               <button 
                 onClick={() => setCalendarView('Today')}
                 className={`px-3 py-1.5 text-[12px] font-medium rounded-md transition-colors ${calendarView === 'Today' ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
               >
                 Today
               </button>
               <button 
                 onClick={() => setCalendarView('Week')}
                 className={`px-3 py-1.5 text-[12px] font-medium rounded-md transition-colors ${calendarView === 'Week' ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
               >
                 Week
               </button>
             </div>
           </div>
           
           <div className="flex-1 w-full relative">
              {calendarView === 'Today' ? (
                <div className="w-full">
                  <div className="absolute left-[50px] top-0 bottom-0 w-px bg-slate-100 dark:bg-slate-700"></div>
                  {times.map((timeStr, i) => {
                     const hour = parseInt(timeStr.split(':')[0]);
                     const isAm = hour < 12;
                     const displayHour = hour === 12 ? 12 : hour % 12;
                     const formattedTime = `${displayHour} ${isAm ? 'AM' : 'PM'}`;
                     
                     const dayItems = getDayItems(todayStr);
                     const itemsForHour = dayItems.filter(item => {
                       const iStartStr = item.startTime;
                       return iStartStr >= timeStr && iStartStr < times[i+1 < times.length ? i+1 : 14];
                     });
                     
                     return (
                       <div key={hour} className="flex min-h-[60px] relative">
                         <div className="w-[50px] text-[11px] font-medium text-slate-400 pt-2 shrink-0">{formattedTime}</div>
                         <div className="flex-1 relative pt-2 pb-4 pl-4">
                            <div className="absolute top-4 -left-[3px] w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600 z-10 mt-0.5"></div>
                            {itemsForHour.map(item => {
                               const color = CAL_COLORS[item.colorIdx % CAL_COLORS.length];
                               return (
                                  <div key={item.id} className={`mt-1 p-2 rounded-lg border-l-2 bg-opacity-20 ${color.bg} ${color.border} ${color.text}`}>
                                     <span className="text-[13px] font-semibold">{item.title}</span>
                                     <p className="text-[11px] opacity-80 mt-0.5">{item.startTime} - {item.endTime} ({item.itemType})</p>
                                  </div>
                               );
                            })}
                         </div>
                       </div>
                     );
                  })}
                </div>
              ) : (
                <div className="flex-1 bg-white dark:bg-slate-800 rounded-xl relative mr-2">
                 <div className="flex border-b border-slate-100 dark:border-slate-700 pb-2 mb-2">
                   {weekDays.map((d, i) => {
                     const isToday = new Date().toDateString() === d.toDateString();
                     return (
                       <div key={i} className="flex-1 min-w-[50px] flex flex-col items-center">
                         <span className={`text-[10px] uppercase font-bold ${isToday ? 'text-emerald-500' : 'text-slate-400'}`}>{d.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                         <span className={`text-[12px] font-bold ${isToday ? 'bg-emerald-500 text-white w-6 h-6 flex items-center justify-center rounded-full mt-1' : 'text-slate-600 dark:text-slate-300 mt-1'}`}>{d.getDate()}</span>
                       </div>
                     );
                   })}
                 </div>
                 <div className="flex h-[350px]">
                   {weekDays.map((d, colIdx) => {
                     const dayItems = getDayItems(getLocalDateStr(d));
                     return (
                       <div key={colIdx} className="flex-1 h-full relative border-r border-slate-100 dark:border-slate-700/50 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors group p-1 flex flex-col gap-1 overflow-y-auto custom-scrollbar">
                         {dayItems.map(item => {
                           const color = CAL_COLORS[item.colorIdx % CAL_COLORS.length];
                           return (
                             <div key={item.id} className={`p-1.5 rounded-lg border ${color.bg} ${color.border} ${color.text} text-[10px] w-full truncate leading-tight opacity-90 hover:opacity-100`} title={item.title}>
                               <span className="font-bold">{item.title}</span>
                             </div>
                           );
                         })}
                       </div>
                     );
                   })}
                 </div>
                </div>
              )}
           </div>
        </div>

      </div>

    </div>
  );
};

export default Dashboard;
