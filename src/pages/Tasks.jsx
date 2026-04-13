import { useState } from 'react';
import { 
  Calendar as CalendarIcon, X, Edit2, Trash2, Flag, 
  Briefcase, BookOpen, Coffee, Target, Monitor, ShoppingBag, 
  Palette, Code, PenTool, Music, Video, Heart, Star, 
  Zap, Award, Activity, CheckCircle, MessageSquare, Phone, Mail
} from 'lucide-react';
import { useTasks } from '../context/TaskContext';
import CustomSelect from '../components/CustomSelect';

const ICON_MAP = {
  Briefcase, BookOpen, Coffee, Target, Monitor, ShoppingBag, 
  Palette, Code, PenTool, Music, Video, Heart, Star, 
  Zap, Award, Activity, CheckCircle, MessageSquare, Phone, Mail
};

const Tasks = () => {
  const { tasks, addTask, editTask, deleteTask } = useTasks();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [activeTab, setActiveTab] = useState('All');
  
  const [taskForm, setTaskForm] = useState({ name: '', dueDate: '', priority: 'Medium', icon: 'Target', status: 'Not Started' });

  const tabs = ['All', 'Ongoing', 'Completed'];

  const normalizedTasks = tasks.map(t => ({
    ...t,
    status: t.status || (t.completed ? 'Completed' : 'Not Started'),
    icon: t.icon || 'Target'
  }));

  const filteredTasks = normalizedTasks.filter(task => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Ongoing') return task.status !== 'Completed';
    if (activeTab === 'Completed') return task.status === 'Completed';
    return true;
  });

  const openAppModal = (task = null) => {
    if (task) {
      setEditingTaskId(task.id);
      setTaskForm({ name: task.name, dueDate: task.dueDate, priority: task.priority || 'Medium', icon: task.icon || 'Target', status: task.status || 'Not Started' });
    } else {
      setEditingTaskId(null);
      setTaskForm({ name: '', dueDate: '', priority: 'Medium', icon: 'Target', status: 'Not Started' });
    }
    setIsModalOpen(true);
  };

  const handleSaveTask = (e) => {
    e.preventDefault();
    if (taskForm.name.trim() && taskForm.dueDate) {
      if (editingTaskId) {
        editTask(editingTaskId, { ...taskForm, completed: taskForm.status === 'Completed' });
      } else {
        addTask({ ...taskForm, completed: taskForm.status === 'Completed' });
      }
      setIsModalOpen(false);
    }
  };

  const updateTaskStatus = (task, newStatus) => {
    editTask(task.id, { status: newStatus, completed: newStatus === 'Completed' });
  };

  const getPriorityStyle = (priority, type = 'card') => {
    const config = {
      High: { 
        bg: 'from-white to-red-50/50 dark:from-slate-800 dark:to-red-900/10 hover:border-red-200/60', 
        border: 'border-red-100 dark:border-red-500/20', 
        text: 'text-red-600 dark:text-red-400 group-hover:text-red-600', 
        fill: 'bg-red-50 dark:bg-red-500/10', 
        solid: 'bg-red-500' 
      },
      Medium: { 
        bg: 'from-white to-orange-50/50 dark:from-slate-800 dark:to-orange-900/10 hover:border-orange-200/60', 
        border: 'border-orange-100 dark:border-orange-500/20', 
        text: 'text-orange-600 dark:text-orange-400 group-hover:text-orange-600', 
        fill: 'bg-orange-50 dark:bg-orange-500/10', 
        solid: 'bg-orange-500' 
      },
      Low: { 
        bg: 'from-white to-emerald-50/50 dark:from-slate-800 dark:to-emerald-900/10 hover:border-emerald-200/60', 
        border: 'border-emerald-100 dark:border-emerald-500/20', 
        text: 'text-emerald-600 dark:text-emerald-400 group-hover:text-emerald-600', 
        fill: 'bg-emerald-50 dark:bg-emerald-500/10', 
        solid: 'bg-emerald-500' 
      }
    };
    return config[priority] || config['Medium'];
  };

  const renderIcon = (iconName) => {
    const IconCmp = ICON_MAP[iconName] || Target;
    return <IconCmp className="w-5 h-5" />;
  };

  // Generic renderers for CustomSelect
  const statusOptions = ['Not Started', 'Ongoing', 'Completed'];
  const priorityOptions = ['High', 'Medium', 'Low'];
  const iconOptions = Object.keys(ICON_MAP);

  const StatusOption = ({ opt, isSelected }) => {
    const dots = { 'Not Started': 'bg-slate-400', 'Ongoing': 'bg-orange-500', 'Completed': 'bg-emerald-500' }[opt];
    return (
      <div className={`px-3 py-2 rounded-xl text-[13px] font-bold flex items-center gap-2 mb-1 transition-all ${isSelected ? 'bg-slate-100/80 dark:bg-slate-700 text-slate-800 dark:text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 w-full'}`}>
        <div className={`w-2.5 h-2.5 rounded border border-white shadow-sm flex-shrink-0 ${dots}`} />
        {opt}
      </div>
    );
  };

  const PriorityOption = ({ opt, isSelected }) => {
    const s = getPriorityStyle(opt);
    return (
      <div className={`px-3 py-2.5 rounded-xl text-[13px] font-bold flex items-center gap-2.5 mb-1 transition-all ${s.fill} ${s.text} ${isSelected ? 'shadow-sm ring-1 ring-black/5 dark:ring-white/10' : 'hover:opacity-90 w-full'}`}>
        <Flag className="w-4 h-4" /> {opt}
      </div>
    );
  };

  const renderStatusSelectedInline = (opt) => {
    const dots = { 'Not Started': 'bg-slate-400', 'Ongoing': 'bg-orange-500', 'Completed': 'bg-emerald-500' }[opt];
    return (
      <div className="flex items-center gap-2 bg-slate-50/50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-lg transition-colors">
        <div className={`w-2 h-2 rounded flex-shrink-0 ${dots}`} />
        <span className="text-[12px] font-bold text-slate-700 dark:text-slate-200">{opt}</span>
      </div>
    );
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 relative flex flex-col h-full w-full gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[28px] font-bold text-[#1c1c1c] dark:text-white">Tasks</h2>
          <p className="text-[14px] text-[#6b6a68] dark:text-slate-400 mt-1">Manage your pending work here</p>
        </div>
        <button 
          onClick={() => openAppModal()}
          className="bg-emerald-500 hover:bg-emerald-600 hover:shadow-emerald-200/50 dark:hover:shadow-none hover:-translate-y-0.5 transform text-white px-5 py-2.5 rounded-xl text-[14px] font-medium shadow-sm transition-all"
        >
          + Add Task
        </button>
      </div>

      {/* Tabs */}
      <div>
        <div className="inline-flex bg-slate-100 dark:bg-slate-800/60 p-1.5 rounded-2xl gap-1">
          {tabs.map(tab => {
            const activeClasses = tab === 'All' ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-400' :
                                  tab === 'Ongoing' ? 'bg-white dark:bg-slate-700 shadow-sm text-orange-600 dark:text-orange-400' :
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

      <div className="flex-1 bg-transparent pt-2">
        {filteredTasks.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-[#e8e4db] dark:border-slate-700 p-8 h-[400px] flex flex-col items-center justify-center text-[#a1a1aa] gap-4 shadow-sm transition-colors">
            <div className="w-20 h-20 bg-[#f3efea] dark:bg-slate-900 flex items-center justify-center rounded-3xl text-emerald-400">
              <Target className="w-10 h-10" />
            </div>
            <p className="text-[15px] font-medium text-slate-500 dark:text-slate-400">No {activeTab.toLowerCase()} tasks found. Time to relax or create a new one!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTasks.map(task => {
              const pStyle = getPriorityStyle(task.priority);
              const isDone = task.status === 'Completed';
              return (
                <div key={task.id} className={`p-4 rounded-2xl bg-gradient-to-br transition-all duration-300 ease-out flex flex-col cursor-pointer border relative group transform ${
                  isDone 
                    ? 'from-slate-50 to-slate-100/30 dark:from-slate-800/40 dark:to-slate-900/40 border-slate-200 dark:border-slate-700/40 opacity-75' 
                    : `${pStyle.bg} border-slate-100 dark:border-slate-700/50 shadow-sm hover:shadow-md hover:-translate-y-1.5 dark:hover:shadow-slate-900/60`
                }`}>
                  {/* Header: Icon & Actions */}
                  <div className="flex items-start justify-between mb-3">
                    {/* Icon */}
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors shadow-sm ${isDone ? 'bg-white dark:bg-slate-700 text-slate-400 border border-slate-200 dark:border-slate-600' : `${pStyle.fill} ${pStyle.text} border border-white/50 dark:border-white/5`}`}>
                      {renderIcon(task.icon)}
                    </div>
                    {/* Action Buttons */}
                    <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center gap-0.5 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-full p-0.5 shadow-sm border border-slate-100 dark:border-slate-700">
                      <button onClick={(e) => { e.stopPropagation(); openAppModal(task); }} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-700 rounded-full transition-colors">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); deleteTask(task.id); }} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-slate-700 rounded-full transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Body: Title and Description */}
                  <div className="mb-4 flex-1">
                    <h3 className={`text-[14.5px] font-bold leading-tight mb-1 line-clamp-1 transition-colors ${isDone ? 'text-slate-400 dark:text-slate-500 line-through group-hover:text-slate-400' : `text-slate-800 dark:text-white ${pStyle.text}`}`}>
                      {task.name}
                    </h3>
                    <p className={`text-[11.5px] leading-relaxed line-clamp-2 ${isDone ? 'text-slate-300 dark:text-slate-600' : 'text-slate-400 dark:text-slate-400'}`}>
                      {task.status === 'Completed' ? 'Successfully completed.' : 'Needs your careful attention and execution.'}
                    </p>
                  </div>

                  {/* Footer: Micro Pills */}
                  <div className="flex items-center gap-1.5 flex-wrap mt-auto">
                    {/* Date Pill */}
                    <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${isDone ? 'bg-slate-50 border-slate-200 text-slate-300 dark:bg-slate-800/50 dark:border-slate-700' : 'bg-white border-slate-100 dark:bg-slate-800 dark:border-slate-700 text-slate-500 shadow-sm'}`}>
                      {new Date(task.dueDate).toLocaleDateString()}
                    </div>
                    {/* Status Pill */}
                    <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${isDone ? 'bg-slate-50 border-slate-200 text-slate-300 dark:bg-slate-800/50 dark:border-slate-700' : 'bg-white border-blue-100 dark:bg-blue-500/10 dark:border-blue-500/20 text-blue-600 shadow-sm'}`}>
                      {task.status}
                    </div>
                    {/* Priority Pill */}
                    <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold border shadow-sm ${isDone ? 'bg-slate-50 border-slate-200 text-slate-300 dark:bg-slate-800/50 dark:border-slate-700' : `${pStyle.fill} ${pStyle.text} ${pStyle.border}`}`}>
                      {task.priority || 'Medium'}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Modern Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-[500px] p-7 animate-in zoom-in-95 duration-200 relative z-10 border border-slate-100">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-[22px] font-extrabold text-slate-800 tracking-tight">{editingTaskId ? 'Edit Task' : 'Create New Task'}</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 p-2 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSaveTask} className="space-y-5">
              {/* Task Name */}
              <div className="space-y-2">
                <label className="block text-[13px] font-bold text-slate-700 ml-1">Task Name</label>
                <input 
                  type="text" 
                  autoFocus
                  required
                  placeholder="What needs to get done?"
                  value={taskForm.name}
                  onChange={(e) => setTaskForm({ ...taskForm, name: e.target.value })}
                  className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 text-[15px] font-medium text-slate-800 placeholder-slate-400 transition-all bg-slate-50/50 hover:bg-white"
                />
              </div>

              {/* Status and Icon */}
              <div className="grid grid-cols-2 gap-5 z-[60] relative">
                <div className="space-y-2 relative z-50">
                  <label className="block text-[13px] font-bold text-slate-700 ml-1">Current Status</label>
                  <CustomSelect 
                    value={taskForm.status}
                    options={statusOptions}
                    onChange={(val) => setTaskForm({ ...taskForm, status: val })}
                    className="w-full"
                    renderSelected={(opt) => (
                      <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white text-[14px] font-bold text-slate-700 transition-all">
                        <div className={`w-2.5 h-2.5 rounded border shadow-sm ${{'Not Started': 'bg-slate-400', 'Ongoing': 'bg-orange-500', 'Completed': 'bg-emerald-500'}[opt]}`} />
                        {opt}
                      </div>
                    )}
                    renderOption={(opt, isSel) => <StatusOption opt={opt} isSelected={isSel} />}
                  />
                </div>
                <div className="space-y-2 relative z-50">
                  <label className="block text-[13px] font-bold text-slate-700 ml-1">Task Icon</label>
                  <CustomSelect 
                    value={taskForm.icon}
                    options={iconOptions}
                    onChange={(val) => setTaskForm({ ...taskForm, icon: val })}
                    className="w-full"
                    dropdownClass="w-full"
                    renderSelected={(opt) => (
                      <div className="flex items-center gap-3 px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white text-[14px] font-bold text-slate-700 transition-all">
                        {renderIcon(opt)}
                        {opt}
                      </div>
                    )}
                    renderOption={(opt, isSel) => (
                       <div className={`px-3 py-2.5 rounded-xl text-[13px] font-semibold flex items-center gap-3 mb-1 transition-all ${isSel ? 'bg-emerald-50 text-emerald-600 shadow-sm' : 'text-slate-600 hover:bg-slate-50 w-full'}`}>
                         {renderIcon(opt)} {opt}
                       </div>
                    )}
                  />
                </div>
              </div>
              
              {/* Date and Priority */}
              <div className="grid grid-cols-2 gap-5 relative z-[40]">
                <div className="space-y-2">
                  <label className="block text-[13px] font-bold text-slate-700 ml-1">Due Date</label>
                  <input 
                    type="date" 
                    required
                    value={taskForm.dueDate}
                    onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 text-[14px] font-bold transition-all text-slate-700 bg-slate-50/50 hover:bg-white"
                  />
                </div>
                <div className="space-y-2 relative z-50">
                  <label className="block text-[13px] font-bold text-slate-700 ml-1">Priority</label>
                  <CustomSelect 
                    value={taskForm.priority}
                    options={priorityOptions}
                    onChange={(val) => setTaskForm({ ...taskForm, priority: val })}
                    className="w-full"
                    renderSelected={(opt) => {
                      const s = getPriorityStyle(opt);
                      return (
                        <div className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl border shadow-sm text-[14px] font-bold transition-all ${s.fill} ${s.text} ${s.border}`}>
                          <Flag className="w-4 h-4" /> {opt}
                        </div>
                      )
                    }}
                    renderOption={(opt, isSel) => <PriorityOption opt={opt} isSelected={isSel} />}
                  />
                </div>
              </div>

              <div className="pt-6 flex flex-col sm:flex-row justify-end gap-3 border-t border-slate-100">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-3 rounded-2xl text-[14px] font-bold text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 transition-all w-full sm:w-auto"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-8 py-3 rounded-2xl text-[14px] font-bold bg-emerald-500 hover:bg-emerald-600 hover:shadow-lg hover:shadow-emerald-200/50 text-white transition-all transform hover:-translate-y-0.5 w-full sm:w-auto"
                >
                  {editingTaskId ? 'Save Changes' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;
