import { useState, useEffect } from 'react';
import { X, Flag, Settings2 } from 'lucide-react';
import { useTasks } from '../context/TaskContext';
import { useHabits } from '../context/HabitContext';
import { useGoals } from '../context/GoalContext';
import { useFinance } from '../context/FinanceContext';
import CustomSelect from './CustomSelect';
import { Target, Briefcase, BookOpen, Coffee, Monitor, ShoppingBag, Palette, Code, PenTool, Music, Video, Heart, Star, Zap, Award, Activity, CheckCircle, MessageSquare, Phone, Mail } from 'lucide-react';

const ICON_MAP = {
  Briefcase, BookOpen, Coffee, Target, Monitor, ShoppingBag, 
  Palette, Code, PenTool, Music, Video, Heart, Star, 
  Zap, Award, Activity, CheckCircle, MessageSquare, Phone, Mail
};
const iconOptions = Object.keys(ICON_MAP);
const statusOptions = ['Not Started', 'Ongoing', 'Completed'];
const priorityOptions = ['High', 'Medium', 'Low'];

const getPriorityStyle = (priority) => {
    const config = {
      High: { border: 'border-red-100', text: 'text-red-600', fill: 'bg-red-50' },
      Medium: { border: 'border-orange-100', text: 'text-orange-600', fill: 'bg-orange-50' },
      Low: { border: 'border-emerald-100', text: 'text-emerald-600', fill: 'bg-emerald-50' }
    };
    return config[priority] || config['Medium'];
};

const renderIcon = (iconName) => {
    const IconCmp = ICON_MAP[iconName] || Target;
    return <IconCmp className="w-5 h-5" />;
};

export default function GlobalAddModal({ isOpen, type, onClose }) {
  const { tasks, addTask } = useTasks();
  const { addHabit } = useHabits();
  const { addGoal } = useGoals();
  const { addTransaction, categories } = useFinance();

  // Task State
  const [taskForm, setTaskForm] = useState({ name: '', dueDate: '', priority: 'Medium', icon: 'Target', status: 'Not Started' });
  // Habit State
  const [habitName, setHabitName] = useState('');
  // Goal State
  const [goalForm, setGoalForm] = useState({ name: '', description: '', deadline: '' });
  // Finance State
  const [financeForm, setFinanceForm] = useState({ amount: '', type: 'expense', category: '', date: new Date().toISOString().split('T')[0] });

  // Reset flows internally when type opens
  useEffect(() => {
    if (isOpen) {
      setTaskForm({ name: '', dueDate: '', priority: 'Medium', icon: 'Target', status: 'Not Started' });
      setHabitName('');
      setGoalForm({ name: '', description: '', deadline: '' });
      setFinanceForm(prev => ({ ...prev, category: categories['expense'][0] || '', amount: '', type: 'expense' }));
    }
  }, [isOpen, type, categories]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (type === 'Task' && taskForm.name && taskForm.dueDate) {
      addTask({ ...taskForm, completed: taskForm.status === 'Completed' });
    } else if (type === 'Habit' && habitName) {
      addHabit({ name: habitName, frequency: 'daily' });
    } else if (type === 'Goal' && goalForm.name) {
      addGoal({ name: goalForm.name, description: goalForm.description, deadline: goalForm.deadline || null, linkedTaskIds: [], linkedHabitIds: [] });
    } else if (type === 'Finance' && financeForm.amount) {
      addTransaction({ ...financeForm, category: financeForm.category || categories[financeForm.type][0] });
    }
    onClose();
  };

  const renderTaskForm = () => (
    <div className="space-y-5">
      <div className="space-y-2">
        <label className="block text-[13px] font-bold text-slate-700 dark:text-slate-300 ml-1">Task Name</label>
        <input type="text" autoFocus required placeholder="What needs to get done?" value={taskForm.name} onChange={(e) => setTaskForm({ ...taskForm, name: e.target.value })} className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 dark:focus:ring-emerald-500/10 text-[15px] font-medium text-slate-800 dark:text-white placeholder-slate-400 bg-slate-50/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 transition-all"/>
      </div>
      <div className="grid grid-cols-2 gap-5 z-[60] relative">
        <div className="space-y-2 relative z-50">
          <label className="block text-[13px] font-bold text-slate-700 dark:text-slate-300 ml-1">Current Status</label>
          <CustomSelect value={taskForm.status} options={statusOptions} onChange={(val) => setTaskForm({ ...taskForm, status: val })} className="w-full"
            renderSelected={(opt) => (
              <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 text-[14px] font-bold text-slate-700 dark:text-slate-200 transition-all">
                <div className={`w-2.5 h-2.5 rounded border shadow-sm ${{'Not Started': 'bg-slate-400', 'Ongoing': 'bg-orange-500', 'Completed': 'bg-emerald-500'}[opt]}`} />
                {opt}
              </div>
            )}
            renderOption={(opt, isSel) => (
               <div className={`px-3 py-2 rounded-xl text-[13px] font-bold flex items-center gap-2 mb-1 transition-all ${isSel ? 'bg-slate-100/80 dark:bg-slate-700 text-slate-800 dark:text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 w-full'}`}>
                 <div className={`w-2.5 h-2.5 rounded border shadow-sm flex-shrink-0 ${{'Not Started': 'bg-slate-400', 'Ongoing': 'bg-orange-500', 'Completed': 'bg-emerald-500'}[opt]}`} />
                 {opt}
               </div>
            )}
          />
        </div>
        <div className="space-y-2 relative z-50">
          <label className="block text-[13px] font-bold text-slate-700 dark:text-slate-300 ml-1">Task Icon</label>
          <CustomSelect value={taskForm.icon} options={iconOptions} onChange={(val) => setTaskForm({ ...taskForm, icon: val })} className="w-full" dropdownClass="w-full"
            renderSelected={(opt) => (
              <div className="flex items-center gap-3 px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 text-[14px] font-bold text-slate-700 dark:text-slate-200 transition-all">
                {renderIcon(opt)} {opt}
              </div>
            )}
            renderOption={(opt, isSel) => (
               <div className={`px-3 py-2.5 rounded-xl text-[13px] font-semibold flex items-center gap-3 mb-1 transition-all ${isSel ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 w-full'}`}>
                 {renderIcon(opt)} {opt}
               </div>
            )}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-5 relative z-[40]">
        <div className="space-y-2">
          <label className="block text-[13px] font-bold text-slate-700 dark:text-slate-300 ml-1">Due Date</label>
          <input required type="date" value={taskForm.dueDate} onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })} className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-emerald-500 text-[14px] font-bold text-slate-700 dark:text-white bg-slate-50/50 dark:bg-slate-800/50" />
        </div>
        <div className="space-y-2 relative z-50">
          <label className="block text-[13px] font-bold text-slate-700 dark:text-slate-300 ml-1">Priority</label>
          <CustomSelect value={taskForm.priority} options={priorityOptions} onChange={(val) => setTaskForm({ ...taskForm, priority: val })} className="w-full"
            renderSelected={(opt) => {
              const s = getPriorityStyle(opt);
              return <div className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl border shadow-sm text-[14px] font-bold ${s.fill} ${s.text} ${s.border}`}><Flag className="w-4 h-4" /> {opt}</div>;
            }}
            renderOption={(opt, isSel) => {
              const s = getPriorityStyle(opt);
              return <div className={`px-3 py-2.5 rounded-xl text-[13px] font-bold flex items-center gap-2.5 mb-1 transition-all ${s.fill} ${s.text} ${isSel ? 'shadow-sm ring-1 ring-black/5 w-full' : 'hover:opacity-90 w-full'}`}><Flag className="w-4 h-4" /> {opt}</div>;
            }}
          />
        </div>
      </div>
    </div>
  );

  const renderHabitForm = () => (
    <div className="space-y-5">
      <div className="space-y-1.5">
         <label className="text-[13px] font-medium text-slate-600 dark:text-slate-400">Habit Name</label>
         <input type="text" placeholder="E.g., Read for 20 minutes" value={habitName} onChange={(e) => setHabitName(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-[15px] focus:outline-none focus:border-emerald-500 dark:text-white transition-colors" required autoFocus />
      </div>
    </div>
  );

  const renderGoalForm = () => (
    <div className="space-y-5">
      <div className="space-y-1.5">
         <label className="text-[13px] font-medium text-slate-600 dark:text-slate-400">Goal Name</label>
         <input type="text" placeholder="e.g. Lose 5kg" value={goalForm.name} onChange={(e) => setGoalForm({...goalForm, name: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-[15px] focus:outline-none focus:border-emerald-500 dark:text-white transition-colors" required autoFocus />
      </div>
      <div className="space-y-1.5">
         <label className="text-[13px] font-medium text-slate-600 dark:text-slate-400">Deadline (Optional)</label>
         <input type="date" value={goalForm.deadline} onChange={(e) => setGoalForm({...goalForm, deadline: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-[15px] focus:outline-none focus:border-emerald-500 dark:text-white transition-colors" />
      </div>
      <div className="space-y-1.5">
         <label className="text-[13px] font-medium text-slate-600 dark:text-slate-400">Description (Optional)</label>
         <input type="text" placeholder="Why do you want to achieve this?" value={goalForm.description} onChange={(e) => setGoalForm({...goalForm, description: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-[15px] focus:outline-none focus:border-emerald-500 dark:text-white transition-colors" />
      </div>
    </div>
  );

  const renderFinanceForm = () => (
    <div className="space-y-5">
      <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
        <button type="button" onClick={() => setFinanceForm({...financeForm, type: 'expense'})} className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${financeForm.type === 'expense' ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Expense</button>
        <button type="button" onClick={() => setFinanceForm({...financeForm, type: 'income'})} className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${financeForm.type === 'income' ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Income</button>
      </div>
      <div>
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Amount(₹)</label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₹</span>
          <input type="number" required autoFocus value={financeForm.amount} onChange={e => setFinanceForm({...financeForm, amount: e.target.value})} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl pl-8 pr-4 py-3 outline-none focus:border-emerald-500 text-slate-800 dark:text-white transition-all shadow-sm" placeholder="0.00" />
        </div>
      </div>
      <div>
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Category</label>
        <select value={financeForm.category} onChange={e => setFinanceForm({...financeForm, category: e.target.value})} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-emerald-500 text-slate-800 dark:text-white transition-all shadow-sm">
          {categories[financeForm.type].map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div>
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Date</label>
        <input type="date" value={financeForm.date} onChange={e => setFinanceForm({...financeForm, date: e.target.value})} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-emerald-500 text-slate-800 dark:text-white transition-all shadow-sm" />
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="bg-white dark:bg-slate-900 rounded-[24px] shadow-2xl w-full max-w-[500px] p-7 animate-in zoom-in-95 duration-200 relative z-10 border border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-[22px] font-extrabold text-slate-800 dark:text-white tracking-tight">Create New {type}</h3>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-800 dark:hover:text-white bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 p-2 rounded-xl transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          {type === 'Task' && renderTaskForm()}
          {type === 'Habit' && renderHabitForm()}
          {type === 'Goal' && renderGoalForm()}
          {type === 'Finance' && renderFinanceForm()}
          
          <div className="pt-6 flex flex-col sm:flex-row justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
            <button type="button" onClick={onClose} className="px-6 py-3 rounded-2xl text-[14px] font-bold text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all w-full sm:w-auto">
              Cancel
            </button>
            <button type="submit" className="px-8 py-3 rounded-2xl text-[14px] font-bold bg-emerald-500 hover:bg-emerald-600 text-white transition-all transform hover:-translate-y-0.5 w-full sm:w-auto">
              Create {type}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
