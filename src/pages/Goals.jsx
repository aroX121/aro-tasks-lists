import { useState } from 'react';
import { Target, Plus, ChevronDown, ChevronUp, Link as LinkIcon, CheckCircle2, Circle, Clock, Check, X, Calendar as CalendarIcon, Activity, Edit2, Trash2 } from 'lucide-react';
import { useGoals } from '../context/GoalContext';
import { useTasks } from '../context/TaskContext';
import { useHabits } from '../context/HabitContext';

// Helper for days left
const getDaysLeft = (deadlineStr) => {
  if (!deadlineStr) return null;
  const deadline = new Date(deadlineStr);
  const now = new Date();
  const diffTime = deadline - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

// Helper for habit progress
const getLocalDateStr = (d = new Date()) => {
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
};

const Goals = () => {
  const { goals, addGoal, linkTaskToGoal, unlinkTaskFromGoal, linkHabitToGoal, unlinkHabitFromGoal, updateGoal, deleteGoal } = useGoals();
  const { tasks } = useTasks();
  const { habits } = useHabits();

  const [isAdding, setIsAdding] = useState(false);
  const [expandedGoalId, setExpandedGoalId] = useState(null);
  const [editingGoalId, setEditingGoalId] = useState(null);
  const [activeTab, setActiveTab] = useState('All');
  
  // New/Edit goal form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [selectedHabits, setSelectedHabits] = useState([]);

  const activeGoalsCount = goals.filter(g => g.status === 'active').length;

  const tabs = ['All', 'Active', 'Completed'];

  const filteredGoals = goals.filter(goal => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Active') return goal.status === 'active';
    if (activeTab === 'Completed') return goal.status === 'completed';
    return true;
  });

  const startEditing = (goal) => {
    setEditingGoalId(goal.id);
    setName(goal.name);
    setDescription(goal.description || '');
    setDeadline(goal.deadline || '');
    setIsAdding(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const startAdding = () => {
    setEditingGoalId(null);
    setName('');
    setDescription('');
    setDeadline('');
    setSelectedTasks([]);
    setSelectedHabits([]);
    setIsAdding(true);
  };

  const resetForm = () => {
    setIsAdding(false);
    setEditingGoalId(null);
    setName('');
    setDescription('');
    setDeadline('');
    setSelectedTasks([]);
    setSelectedHabits([]);
  };

  const handleSaveGoal = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    if (editingGoalId) {
      updateGoal(editingGoalId, {
        name: name.trim(),
        description: description.trim(),
        deadline: deadline || null,
      });
    } else {
      addGoal({
        name: name.trim(),
        description: description.trim(),
        deadline: deadline || null,
        linkedTaskIds: selectedTasks,
        linkedHabitIds: selectedHabits,
      });
    }
    resetForm();
  };

  const toggleTaskSelection = (taskId) => {
    setSelectedTasks(prev => 
      prev.includes(taskId) ? prev.filter(id => id !== taskId) : [...prev, taskId]
    );
  };

  const toggleHabitSelection = (habitId) => {
    setSelectedHabits(prev => 
      prev.includes(habitId) ? prev.filter(id => id !== habitId) : [...prev, habitId]
    );
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this goal?")) {
      deleteGoal(id);
      if (expandedGoalId === id) setExpandedGoalId(null);
    }
  };

  const calculateProgress = (goal) => {
    let totalItems = 0;
    let completedItems = 0;

    // Tasks progress
    if (goal.linkedTaskIds && goal.linkedTaskIds.length > 0) {
      const linkedTasks = tasks.filter(t => goal.linkedTaskIds.includes(t.id));
      totalItems += linkedTasks.length;
      completedItems += linkedTasks.filter(t => t.completed).length;
    }

    // Habits progress (consistency over last 7 days)
    if (goal.linkedHabitIds && goal.linkedHabitIds.length > 0) {
      const linkedHabits = habits.filter(h => goal.linkedHabitIds.includes(h.id));
      const todayStr = getLocalDateStr();
      linkedHabits.forEach(h => {
        totalItems += 1;
        if (h.completions.includes(todayStr)) {
          completedItems += 1;
        }
      });
    }

    if (totalItems === 0) return 0;
    return Math.round((completedItems / totalItems) * 100);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-[28px] font-bold text-[#1c1c1c] dark:text-white flex items-center gap-3">
            Goals
            <span className="text-[14px] font-medium bg-[#1c1c1c] dark:bg-emerald-500 text-white px-2 py-0.5 rounded-full">
              {activeGoalsCount} Active
            </span>
          </h2>
          <p className="text-[14px] text-[#6b6a68] dark:text-slate-400 mt-1">
            Track progress & connect your daily actions
          </p>
        </div>
        {!isAdding && (
          <button 
            onClick={startAdding}
            className="bg-[#1c1c1c] hover:bg-black dark:bg-slate-800 dark:hover:bg-slate-700 dark:border dark:border-slate-700 text-white px-5 py-2.5 rounded-lg text-[14px] font-medium transition-colors flex items-center gap-2 self-start sm:self-auto shadow-sm"
          >
            <Plus size={16} /> New Goal
          </button>
        )}
      </div>

      {/* Tabs */}
      {!isAdding && goals.length > 0 && (
        <div className="mb-6">
          <div className="inline-flex bg-slate-100 dark:bg-slate-800/60 p-1.5 rounded-2xl gap-1">
            {tabs.map(tab => {
              const activeClasses = tab === 'All' ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-400' :
                                    tab === 'Active' ? 'bg-white dark:bg-slate-700 shadow-sm text-orange-600 dark:text-orange-400' :
                                    'bg-white dark:bg-slate-700 shadow-sm text-emerald-600 dark:text-emerald-400';
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-5 py-2 rounded-xl text-[13px] font-semibold transition-all duration-200 ${
                    isActive ? activeClasses : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-700/50'
                  }`}
                >
                  {tab}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* New/Edit Goal Form */}
      {isAdding && (
        <div className="mb-8 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-[#1c1c1c] dark:border-slate-600 shadow-md animate-in slide-in-from-top-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[18px] font-semibold text-[#1c1c1c] dark:text-white">
              {editingGoalId ? 'Edit Goal' : 'Create Goal'}
            </h3>
            <button onClick={resetForm} className="text-[#a1a1aa] hover:text-[#1c1c1c] dark:hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>
          <form onSubmit={handleSaveGoal} className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
               <label className="text-[13px] font-medium text-[#6b6a68] dark:text-slate-400">Goal Name</label>
               <input type="text" placeholder="e.g. Lose 5kg" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-[#faf9f7] dark:bg-slate-900 border border-[#e8e4db] dark:border-slate-700 rounded-lg px-4 py-2.5 text-[15px] focus:outline-none focus:border-[#1c1c1c] dark:focus:border-emerald-500 dark:text-white transition-colors" required autoFocus />
            </div>
            
            <div className="space-y-1.5">
               <label className="text-[13px] font-medium text-[#6b6a68] dark:text-slate-400">Deadline (Optional)</label>
               <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className="w-full bg-[#faf9f7] dark:bg-slate-900 border border-[#e8e4db] dark:border-slate-700 rounded-lg px-4 py-2.5 text-[15px] focus:outline-none focus:border-[#1c1c1c] dark:focus:border-emerald-500 dark:text-white transition-colors" />
            </div>

            <div className="sm:col-span-2 space-y-1.5">
               <label className="text-[13px] font-medium text-[#6b6a68] dark:text-slate-400">Description (Optional)</label>
               <input type="text" placeholder="Why do you want to achieve this?" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full bg-[#faf9f7] dark:bg-slate-900 border border-[#e8e4db] dark:border-slate-700 rounded-lg px-4 py-2.5 text-[15px] focus:outline-none focus:border-[#1c1c1c] dark:focus:border-emerald-500 dark:text-white transition-colors" />
            </div>

            {/* Only show task/habit linking in create mode, as edit mode has it in breakdown */}
            {!editingGoalId && (
              <>
                <div className="sm:col-span-2 space-y-1.5 mt-2">
                   <label className="text-[13px] font-medium text-[#6b6a68] dark:text-slate-400">Link Tasks (Optional)</label>
                   <div className="flex flex-wrap gap-2">
                     {tasks.filter(t => !t.completed).map(t => (
                       <button
                         key={t.id}
                         type="button"
                         onClick={() => toggleTaskSelection(t.id)}
                         className={`px-3 py-1.5 rounded-full text-[12px] font-medium transition-colors border ${selectedTasks.includes(t.id) ? 'bg-[#1c1c1c] text-white border-[#1c1c1c] dark:bg-emerald-500 dark:border-emerald-500' : 'bg-[#faf9f7] text-[#6b6a68] border-[#e8e4db] dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 hover:border-[#1c1c1c] dark:hover:border-slate-500'}`}
                       >
                         {t.name}
                       </button>
                     ))}
                     {tasks.filter(t => !t.completed).length === 0 && <span className="text-[12px] text-slate-500">No active tasks available.</span>}
                   </div>
                </div>

                <div className="sm:col-span-2 space-y-1.5 mt-2 mb-2">
                   <label className="text-[13px] font-medium text-[#6b6a68] dark:text-slate-400">Link Habits (Optional)</label>
                   <div className="flex flex-wrap gap-2">
                     {habits.map(h => (
                       <button
                         key={h.id}
                         type="button"
                         onClick={() => toggleHabitSelection(h.id)}
                         className={`px-3 py-1.5 rounded-full text-[12px] font-medium transition-colors border ${selectedHabits.includes(h.id) ? 'bg-[#1c1c1c] text-white border-[#1c1c1c] dark:bg-emerald-500 dark:border-emerald-500' : 'bg-[#faf9f7] text-[#6b6a68] border-[#e8e4db] dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 hover:border-[#1c1c1c] dark:hover:border-slate-500'}`}
                       >
                         {h.name}
                       </button>
                     ))}
                     {habits.length === 0 && <span className="text-[12px] text-slate-500">No habits available.</span>}
                   </div>
                </div>
              </>
            )}

            <div className="sm:col-span-2 flex justify-end gap-3 mt-2">
              <button type="button" onClick={resetForm} className="px-4 py-2 text-[14px] font-medium text-[#6b6a68] dark:text-slate-400 hover:bg-[#f3efea] dark:hover:bg-slate-700 rounded-lg transition-colors">
                 Cancel
              </button>
              <button type="submit" disabled={!name.trim()} className="bg-[#1c1c1c] dark:bg-emerald-500 text-white px-5 py-2 rounded-lg text-[14px] font-medium disabled:opacity-50 transition-colors shadow-sm">
                 {editingGoalId ? 'Save Changes' : 'Create Goal'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Goal List */}
      {filteredGoals.length === 0 && !isAdding ? (
        <div className="bg-white dark:bg-slate-800/60 rounded-2xl border border-[#e8e4db] dark:border-slate-700 p-10 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-[#f3efea] dark:bg-slate-900/50 flex items-center justify-center rounded-2xl mb-4">
             <Target className="w-8 h-8 text-[#6b6a68] dark:text-slate-500" />
          </div>
          <h3 className="text-[18px] font-semibold text-[#1c1c1c] dark:text-white mb-2">No goals found</h3>
          <p className="text-[15px] text-[#6b6a68] dark:text-slate-400 max-w-[300px] mb-6">
            {activeTab === 'Completed' ? 'You have not completed any goals yet.' : 'Create your first goal to start connecting your daily tasks and habits to the bigger picture.'}
          </p>
          {activeTab !== 'Completed' && (
            <button 
              onClick={startAdding}
              className="text-[#1c1c1c] dark:text-white font-medium border border-[#e8e4db] dark:border-slate-700 px-5 py-2.5 rounded-lg hover:bg-[#f3efea] dark:hover:bg-slate-800 transition-colors"
            >
               Set a Goal
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredGoals.map(goal => {
            const progress = calculateProgress(goal);
            const isExpanded = expandedGoalId === goal.id;
            const daysLeft = getDaysLeft(goal.deadline);
            
            // Available items to link
            const unlinkedTasks = tasks.filter(t => !(goal.linkedTaskIds || []).includes(t.id) && !t.completed);
            const unlinkedHabits = habits.filter(h => !(goal.linkedHabitIds || []).includes(h.id));

            return (
              <div 
                key={goal.id} 
                className={`group bg-white dark:bg-slate-800 rounded-2xl border transition-all ${
                  goal.status === 'completed' 
                    ? 'border-[#e8e4db] opacity-70 dark:border-slate-700/50' 
                    : 'border-[#e8e4db] dark:border-slate-700 hover:border-[#cfcbc5] dark:hover:border-slate-600 shadow-sm'
                }`}
              >
                {/* Goal Card Header */}
                <div 
                  className="p-5 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  onClick={() => setExpandedGoalId(isExpanded ? null : goal.id)}
                >
                  <div className="flex-1">
                     <div className="flex items-center justify-between mb-2">
                       <div className="flex items-center gap-3">
                         <button 
                           onClick={(e) => {
                             e.stopPropagation();
                             updateGoal(goal.id, { status: goal.status === 'active' ? 'completed' : 'active' });
                           }}
                           className={`w-6 h-6 rounded-md border flex items-center justify-center transition-colors
                             ${goal.status === 'completed' 
                               ? 'bg-[#1c1c1c] border-[#1c1c1c] dark:bg-emerald-500 dark:border-emerald-500' 
                               : 'bg-[#faf9f7] dark:bg-slate-700 border-[#cfcbc5] dark:border-slate-600 hover:border-[#1c1c1c] dark:hover:border-slate-400'}`}
                         >
                           {goal.status === 'completed' && <Check size={14} className="text-white" />}
                         </button>
                         <h3 className={`text-[18px] font-bold ${goal.status === 'completed' ? 'text-[#a1a1aa] line-through dark:text-slate-500' : 'text-[#1c1c1c] dark:text-white'}`}>
                           {goal.name}
                         </h3>
                       </div>
                       
                       {/* Quick actions wrapper (visible on hover) */}
                       <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                         <button onClick={() => startEditing(goal)} className="p-1.5 text-[#a1a1aa] hover:text-[#1c1c1c] dark:text-slate-500 dark:hover:text-white rounded-md hover:bg-[#faf9f7] dark:hover:bg-slate-700 transition" title="Edit Goal">
                           <Edit2 size={16} />
                         </button>
                         <button onClick={() => handleDelete(goal.id)} className="p-1.5 text-[#a1a1aa] hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400 rounded-md hover:bg-red-50 dark:hover:bg-red-500/10 transition" title="Delete Goal">
                           <Trash2 size={16} />
                         </button>
                       </div>
                     </div>
                     
                     <div className="w-full flex items-center gap-4">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[12px] font-medium text-[#6b6a68] dark:text-slate-400">Progress</span>
                            <span className="text-[12px] font-bold text-[#1c1c1c] dark:text-white">
                              {goal.status === 'completed' ? 'Completed' : `${progress}%`}
                            </span>
                          </div>
                          <div className="w-full bg-[#f3efea] dark:bg-slate-700/50 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-700 ease-out ${goal.status === 'completed' || progress === 100 ? 'bg-[#1c1c1c] dark:bg-emerald-500' : 'bg-[#1c1c1c] dark:bg-emerald-500/80'}`}
                              style={{ width: goal.status === 'completed' ? '100%' : `${progress}%` }}
                            ></div>
                          </div>
                        </div>

                        {daysLeft !== null && (
                          <div className={`flex items-center gap-1.5 text-[13px] font-medium shrink-0 pt-3 ${
                            daysLeft < 0 ? 'text-red-500' : daysLeft <= 3 ? 'text-orange-500' : 'text-[#6b6a68] dark:text-slate-400'
                          }`}>
                            <Clock size={14} />
                            <span>
                              {daysLeft < 0 ? `Overdue by ${Math.abs(daysLeft)}d` : `${daysLeft} days left`}
                            </span>
                          </div>
                        )}
                     </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto text-[#a1a1aa] dark:text-slate-500 pl-9 sm:pl-0">
                    <span className="text-[13px] font-medium">Breakdown</span>
                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </div>
                </div>

                {/* Expanded Breakdown */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-2 border-t border-[#e8e4db] dark:border-slate-700/80 animate-in slide-in-from-top-2">
                    {goal.description && (
                      <p className="text-[14px] text-[#6b6a68] dark:text-slate-400 mb-5">{goal.description}</p>
                    )}

                    <div className="grid sm:grid-cols-2 gap-6">
                      {/* Linked Tasks */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-[14px] font-semibold text-[#1c1c1c] dark:text-gray-200 flex items-center gap-2">
                            <CheckCircle2 size={16} className="text-[#a1a1aa]" />
                            Linked Tasks
                          </h4>
                          
                          {unlinkedTasks.length > 0 && (
                            <div className="relative group/link">
                              <button className="text-[12px] font-medium text-[#1c1c1c] dark:text-emerald-400 hover:underline flex items-center gap-1 bg-[#1c1c1c]/5 dark:bg-emerald-500/10 px-2 py-1 rounded">
                                <LinkIcon size={12} /> Link Task
                              </button>
                              <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-slate-800 rounded-xl border border-[#e8e4db] dark:border-slate-600 shadow-xl opacity-0 invisible group-hover/link:opacity-100 group-hover/link:visible transition-all z-10 py-1">
                                {unlinkedTasks.slice(0, 5).map(t => (
                                  <button 
                                    key={t.id}
                                    onClick={() => linkTaskToGoal(goal.id, t.id)}
                                    className="w-full text-left px-3 py-2 text-[13px] text-[#1c1c1c] dark:text-slate-300 hover:bg-[#faf9f7] dark:hover:bg-slate-700 truncate"
                                  >
                                    {t.name}
                                  </button>
                                ))}
                                {unlinkedTasks.length === 0 && <div className="px-3 py-2 text-[12px] text-slate-500">No active tasks to link.</div>}
                              </div>
                            </div>
                          )}
                        </div>

                        <ul className="space-y-2">
                          {(goal.linkedTaskIds || []).length === 0 ? (
                             <li className="text-[13px] text-[#a1a1aa] dark:text-slate-500 italic">No tasks linked.</li>
                          ) : (
                             (goal.linkedTaskIds || []).map(taskId => {
                               const t = tasks.find(x => x.id === taskId);
                               if (!t) return null;
                               return (
                                 <li key={taskId} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-lg bg-[#faf9f7] dark:bg-slate-700/50 border border-[#e8e4db] dark:border-slate-700/80 group">
                                   <div className="flex items-center gap-2.5 overflow-hidden">
                                      <div className={`w-4 h-4 rounded-sm border flex items-center justify-center shrink-0 ${t.completed ? 'bg-[#1c1c1c] border-[#1c1c1c] dark:bg-emerald-500 dark:border-emerald-500' : 'border-[#cfcbc5] dark:border-slate-500'}`}>
                                        {t.completed && <Check size={10} className="text-white" />}
                                      </div>
                                      <span className={`text-[13px] truncate ${t.completed ? 'line-through text-[#a1a1aa] dark:text-slate-500' : 'text-[#1c1c1c] dark:text-slate-300'}`}>
                                        {t.name}
                                      </span>
                                   </div>
                                   <button 
                                     onClick={() => unlinkTaskFromGoal(goal.id, taskId)}
                                     className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-50 dark:hover:bg-red-500/10 rounded"
                                     title="Unlink"
                                   >
                                     <X size={14} />
                                   </button>
                                 </li>
                               );
                             })
                          )}
                        </ul>
                      </div>

                      {/* Linked Habits */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-[14px] font-semibold text-[#1c1c1c] dark:text-gray-200 flex items-center gap-2">
                            <Activity size={16} className="text-[#a1a1aa]" />
                            Linked Habits
                          </h4>
                          
                          {unlinkedHabits.length > 0 && (
                            <div className="relative group/link">
                              <button className="text-[12px] font-medium text-[#1c1c1c] dark:text-emerald-400 hover:underline flex items-center gap-1 bg-[#1c1c1c]/5 dark:bg-emerald-500/10 px-2 py-1 rounded">
                                <LinkIcon size={12} /> Link Habit
                              </button>
                              <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-slate-800 rounded-xl border border-[#e8e4db] dark:border-slate-600 shadow-xl opacity-0 invisible group-hover/link:opacity-100 group-hover/link:visible transition-all z-10 py-1">
                                {unlinkedHabits.map(h => (
                                  <button 
                                    key={h.id}
                                    onClick={() => linkHabitToGoal(goal.id, h.id)}
                                    className="w-full text-left px-3 py-2 text-[13px] text-[#1c1c1c] dark:text-slate-300 hover:bg-[#faf9f7] dark:hover:bg-slate-700 truncate"
                                  >
                                    {h.name}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        <ul className="space-y-2">
                          {(goal.linkedHabitIds || []).length === 0 ? (
                             <li className="text-[13px] text-[#a1a1aa] dark:text-slate-500 italic">No habits linked.</li>
                          ) : (
                             (goal.linkedHabitIds || []).map(habitId => {
                               const h = habits.find(x => x.id === habitId);
                               if (!h) return null;
                               const isDoneToday = h.completions.includes(getLocalDateStr());
                               
                               return (
                                 <li key={habitId} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-lg bg-[#faf9f7] dark:bg-slate-700/50 border border-[#e8e4db] dark:border-slate-700/80 group">
                                   <div className="flex items-center gap-2.5 overflow-hidden">
                                      <div className={`w-4 h-4 rounded-sm border flex items-center justify-center shrink-0 ${isDoneToday ? 'bg-[#1c1c1c] border-[#1c1c1c] dark:bg-emerald-500 dark:border-emerald-500' : 'border-[#cfcbc5] dark:border-slate-500'}`}>
                                        {isDoneToday && <Check size={10} className="text-white" />}
                                      </div>
                                      <span className={`text-[13px] truncate ${isDoneToday ? 'text-[#a1a1aa] dark:text-slate-500 line-through' : 'text-[#1c1c1c] dark:text-slate-300'}`}>
                                        {h.name}
                                      </span>
                                   </div>
                                   <button 
                                     onClick={() => unlinkHabitFromGoal(goal.id, habitId)}
                                     className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-50 dark:hover:bg-red-500/10 rounded"
                                     title="Unlink"
                                   >
                                     <X size={14} />
                                   </button>
                                 </li>
                               );
                             })
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Goals;
