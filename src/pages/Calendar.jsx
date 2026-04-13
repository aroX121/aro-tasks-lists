import { useState } from 'react';
import { useTasks } from '../context/TaskContext';
import { useGoals } from '../context/GoalContext';
import { useEvents } from '../context/EventContext';
import { ChevronLeft, ChevronRight, Plus, Edit2, X, Clock, Calendar as CalIcon } from 'lucide-react';

const COLORS = [
  { bg: 'bg-[#fef08a] dark:bg-yellow-500/20', text: 'text-[#854d0e] dark:text-yellow-400', border: 'border-[#fde047] dark:border-yellow-500/30' },
  { bg: 'bg-[#fed7aa] dark:bg-orange-500/20', text: 'text-[#9a3412] dark:text-orange-400', border: 'border-[#fdba74] dark:border-orange-500/30' },
  { bg: 'bg-[#bbf7d0] dark:bg-green-500/20', text: 'text-[#166534] dark:text-green-400', border: 'border-[#86efac] dark:border-green-500/30' },
  { bg: 'bg-[#bfdbfe] dark:bg-blue-500/20', text: 'text-[#1e40af] dark:text-blue-400', border: 'border-[#93c5fd] dark:border-blue-500/30' },
  { bg: 'bg-[#fbcfe8] dark:bg-pink-500/20', text: 'text-[#9d174d] dark:text-pink-400', border: 'border-[#f9a8d4] dark:border-pink-500/30' },
  { bg: 'bg-[#e5e7eb] dark:bg-slate-500/20', text: 'text-[#374151] dark:text-slate-300', border: 'border-[#d1d5db] dark:border-slate-500/30' },
];

const Calendar = () => {
  const { tasks } = useTasks();
  const { goals } = useGoals();
  const { events, addEvent, updateEvent, deleteEvent } = useEvents();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('Week'); // Week, Today, Month

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selectedEvent, setSelectedEvent] = useState(null);

  const [formData, setFormData] = useState({
    title: '', date: '', startTime: '09:00', endTime: '10:00', type: 'Event', colorIdx: 0, description: ''
  });

  const startOfWeek = new Date(currentDate);
  const day = startOfWeek.getDay();
  const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
  startOfWeek.setDate(diff);

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(d.getDate() + i);
    return d;
  });

  const nextTimeFrame = () => {
    const d = new Date(currentDate);
    if (view === 'Month') d.setMonth(d.getMonth() + 1);
    else d.setDate(d.getDate() + 7);
    setCurrentDate(d);
  };

  const prevTimeFrame = () => {
    const d = new Date(currentDate);
    if (view === 'Month') d.setMonth(d.getMonth() - 1);
    else d.setDate(d.getDate() - 7);
    setCurrentDate(d);
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    return { daysInMonth, firstDayOfMonth };
  };

  const { daysInMonth, firstDayOfMonth } = getDaysInMonth(currentDate);
  const monthDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  const times = Array.from({ length: 15 }, (_, i) => {
    const hour = i + 7;
    return `${String(hour).padStart(2, '0')}:00`;
  });

  const allItems = [
    ...events.map(e => ({ ...e, itemType: 'event' })),
    ...tasks.map(t => ({
      id: `task-${t.id}`, title: t.name, date: t.dueDate, startTime: '08:00', endTime: '09:00', itemType: 'task', colorIdx: 3, description: t.description || 'Task deadline'
    })),
    ...goals.filter(g => g.deadline).map(g => ({
      id: `goal-${g.id}`, title: g.name, date: g.deadline, startTime: '10:00', endTime: '11:00', itemType: 'goal', colorIdx: 2, description: g.description || 'Goal deadline'
    }))
  ];

  const getItemsForDay = (dateObj) => {
    const dateStr = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
    return allItems.filter(item => item.date === dateStr);
  };

  const handleOpenAdd = () => {
    setFormData({ title: '', date: '', startTime: '09:00', endTime: '10:00', type: 'Event', colorIdx: 0, description: '' });
    setModalMode('add');
    setIsModalOpen(true);
  };

  const handleOpenView = (item) => {
    setSelectedEvent(item);
    setModalMode('view');
    setIsModalOpen(true);
  };

  const handleOpenEdit = () => {
    setFormData({
      title: selectedEvent.title || '',
      date: selectedEvent.date || '',
      startTime: selectedEvent.startTime || '09:00',
      endTime: selectedEvent.endTime || '10:00',
      type: selectedEvent.itemType || 'Event',
      colorIdx: selectedEvent.colorIdx || 0,
      description: selectedEvent.description || ''
    });
    setModalMode('edit');
  };

  const handleSave = () => {
    if (modalMode === 'add') {
      addEvent({
        title: formData.title, date: formData.date, startTime: formData.startTime, endTime: formData.endTime, colorIdx: formData.colorIdx, description: formData.description
      });
    } else if (modalMode === 'edit') {
      if (selectedEvent.itemType === 'event') {
        updateEvent(selectedEvent.id, {
          title: formData.title, date: formData.date, startTime: formData.startTime, endTime: formData.endTime, colorIdx: formData.colorIdx, description: formData.description
        });
      }
    }
    setIsModalOpen(false);
  };

  const handleDelete = () => {
    if (selectedEvent && selectedEvent.itemType === 'event') deleteEvent(selectedEvent.id);
    setIsModalOpen(false);
  };

  return (
    <div className="flex flex-col pt-4 px-2 sm:px-6 pb-6 bg-[#fdfbf9] dark:bg-slate-900 animate-in fade-in slide-in-from-bottom-4 duration-500 min-h-[calc(100vh-80px)]">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-[32px] font-bold text-[#1c1c1c] dark:text-white tracking-tight">Stay up to date</h2>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleOpenAdd} className="flex items-center gap-2 bg-[#1c1c1c] dark:bg-emerald-500 text-white px-4 py-2.5 rounded-xl font-medium hover:bg-black dark:hover:bg-emerald-600 transition-colors shadow-sm">
            <Plus className="w-4 h-4" />
            Add event
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center bg-[#1c1c1c] dark:bg-slate-800 text-white rounded-full px-4 py-2 gap-3 cursor-pointer select-none border border-transparent dark:border-slate-700">
          <span className="text-sm font-medium">
            {view === 'Month' 
              ? currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
              : `${startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekDays[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
            }
          </span>
          <div className="flex bg-white/20 dark:bg-slate-700 rounded-full">
            <button onClick={prevTimeFrame} className="p-1 hover:bg-white/20 dark:hover:bg-slate-600 rounded-full transition-colors"><ChevronLeft className="w-4 h-4" /></button>
            <button onClick={nextTimeFrame} className="p-1 hover:bg-white/20 dark:hover:bg-slate-600 rounded-full transition-colors"><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>

        <div className="flex bg-gray-100 dark:bg-slate-800 p-1 rounded-full gap-1 border border-transparent dark:border-slate-700/50">
          {['Today', 'Week', 'Month'].map(v => (
            <button
              key={v}
              onClick={() => { setView(v); if (v === 'Today') setCurrentDate(new Date()); }}
              className={`px-5 py-1.5 rounded-full text-[13px] font-medium transition-all ${view === v ? 'bg-[#1c1c1c] dark:bg-slate-700 text-white shadow' : 'text-gray-500 dark:text-slate-400 hover:text-black dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-700/50'}`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      <div className="flex bg-transparent rounded-3xl mt-2 relative w-full">
        {view === 'Month' ? (
          <div className="flex-1 bg-white dark:bg-slate-800 rounded-3xl border border-[#e8e4db] dark:border-slate-700 overflow-hidden shadow-sm">
            <div className="grid grid-cols-7 border-b border-[#e8e4db] dark:border-slate-700 bg-[#fdfbf9] dark:bg-slate-800/80">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="py-3 text-center text-[13px] font-medium text-[#6b6a68] dark:text-slate-400">
                  {day}
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 auto-rows-[120px]">
              {blanks.map(blank => (
                <div key={`blank-${blank}`} className="border-b border-r border-[#e8e4db] dark:border-slate-700 bg-[#fdfbf9]/50 dark:bg-slate-800/30 p-2" />
              ))}
              {monthDays.map(day => {
                const dateObj = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                const dayItems = getItemsForDay(dateObj);
                const isToday = new Date().toDateString() === dateObj.toDateString();
                
                return (
                  <div key={day} className="border-b border-r border-[#e8e4db] dark:border-slate-700 p-2 hover:bg-[#fdfbf9] dark:hover:bg-slate-700/30 transition-colors relative group">
                    <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-[13px] font-medium mb-1 ${isToday ? 'bg-[#1c1c1c] dark:bg-emerald-500 text-white' : 'text-[#6b6a68] dark:text-slate-300'}`}>
                      {day}
                    </span>
                    <div className="space-y-1 overflow-y-auto max-h-[70px] no-scrollbar">
                      {dayItems.map(item => {
                        const color = COLORS[item.colorIdx % COLORS.length];
                        return (
                          <div 
                            key={item.id} 
                            onClick={() => handleOpenView(item)}
                            className={`text-[11px] leading-tight px-1.5 py-1 ${color.bg} ${color.text} rounded border ${color.border} truncate cursor-pointer hover:opacity-80`} 
                            title={item.title}
                          >
                            {item.title}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <>
            <div className="w-[60px] flex-shrink-0 pt-[80px] bg-transparent">
              {times.map(time => (
                <div key={time} className="h-[80px] relative">
                  <span className="absolute -top-3 right-4 text-[12px] font-medium text-gray-400 dark:text-slate-500">
                    {time}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex-1 bg-white dark:bg-slate-800 rounded-t-3xl rounded-b-3xl border border-[#e8e4db] dark:border-slate-700 relative shadow-sm">
              <div className="flex sticky top-0 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm z-20 border-b border-[#e8e4db] dark:border-slate-700 rounded-t-3xl">
                {weekDays.map((d, i) => {
                  const isToday = new Date().toDateString() === d.toDateString();
                  return (
                    <div key={i} className="flex-1 min-w-[120px] py-4 flex flex-col items-center">
                      <span className={`text-[11px] font-bold uppercase tracking-wider mb-2 ${isToday ? 'text-black dark:text-emerald-400' : 'text-gray-400 dark:text-slate-500'}`}>
                        {d.toLocaleDateString('en-US', { weekday: 'short' })}
                      </span>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[15px] font-semibold ${isToday ? 'bg-[#1c1c1c] dark:bg-emerald-500 text-white' : 'text-[#1c1c1c] dark:text-slate-200'}`}>
                        {d.getDate()}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="relative" style={{ height: `${times.length * 80}px` }}>
                {times.map((_, i) => (
                  <div key={i} className="absolute left-0 right-0 border-t border-[#f3efea] dark:border-slate-700/50 border-dashed" style={{ top: `${i * 80}px` }} />
                ))}
                
                <div className="flex absolute inset-0">
                  {weekDays.map((d, colIdx) => {
                    const dayItems = getItemsForDay(d);
                    return (
                      <div key={colIdx} className="flex-1 h-full relative border-r border-[#f3efea] dark:border-slate-700/50 min-w-[120px] last:border-r-0">
                        {dayItems.map(item => {
                          const startHour = parseInt(item.startTime.split(':')[0]) - 7;
                          const startMin = parseInt(item.startTime.split(':')[1]) / 60;
                          const endHour = parseInt(item.endTime.split(':')[0]) - 7;
                          const endMin = parseInt(item.endTime.split(':')[1]) / 60;
                          
                          const top = (startHour + startMin) * 80;
                          const height = Math.max(40, ((endHour + endMin) - (startHour + startMin)) * 80);
                          const color = COLORS[item.colorIdx % COLORS.length];

                          return (
                            <div
                              key={item.id}
                              onClick={() => handleOpenView(item)}
                              className={`absolute left-2 right-2 rounded-2xl p-3 cursor-pointer hover:shadow-md transition-all group ${color.bg} ${color.text} ${color.border} border border-opacity-50 hover:border-opacity-100 z-10 hover:z-30 backdrop-blur-sm`}
                              style={{ top: `${top}px`, height: `${height}px` }}
                            >
                              <div className="font-bold text-[13px] leading-tight mb-1 truncate">{item.title}</div>
                              <div className="text-[11px] opacity-80">{item.startTime} - {item.endTime}</div>
                            </div>
                          )
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-200 border border-transparent dark:border-slate-800">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-[#1c1c1c] dark:text-white">
                {modalMode === 'add' ? 'New Event' : modalMode === 'edit' ? 'Edit Event' : 'Event Details'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                <X className="w-5 h-5 text-gray-500 dark:text-slate-400" />
              </button>
            </div>

            {modalMode === 'view' && selectedEvent ? (
              <div className="space-y-6">
                <div className={`p-4 rounded-2xl ${COLORS[selectedEvent.colorIdx % COLORS.length].bg} ${COLORS[selectedEvent.colorIdx % COLORS.length].text} border ${COLORS[selectedEvent.colorIdx % COLORS.length].border}`}>
                  <h4 className="text-xl font-bold mb-1">{selectedEvent.title}</h4>
                  <p className="text-sm opacity-80 capitalize">{selectedEvent.itemType}</p>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-gray-600 dark:text-slate-300">
                    <CalIcon className="w-5 h-5" />
                    <span>{selectedEvent.date}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600 dark:text-slate-300">
                    <Clock className="w-5 h-5" />
                    <span>{selectedEvent.startTime} - {selectedEvent.endTime}</span>
                  </div>
                  {selectedEvent.description && (
                    <div className="flex flex-col gap-2 text-gray-600 dark:text-slate-300">
                      <span className="font-medium text-gray-800 dark:text-slate-200">Description:</span>
                      <p className="text-sm leading-relaxed bg-gray-50 dark:bg-slate-800 p-3 rounded-xl border border-transparent dark:border-slate-700/50">{selectedEvent.description}</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-slate-800">
                  {selectedEvent.itemType === 'event' ? (
                    <>
                      <button onClick={handleOpenEdit} className="flex-1 bg-gray-100 dark:bg-slate-800 text-black dark:text-white py-3 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors">
                        Edit
                      </button>
                      <button onClick={handleDelete} className="flex-1 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 py-3 rounded-xl font-medium hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors">
                        Delete
                      </button>
                    </>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-slate-400 text-center w-full">Edit {selectedEvent.itemType}s in their respective tabs.</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                <div>
                  <label className="block text-[13px] font-medium text-gray-700 dark:text-slate-300 mb-1.5">Event Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-emerald-500 text-black dark:text-white transition-colors"
                    placeholder="E.g., Team meeting"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[13px] font-medium text-gray-700 dark:text-slate-300 mb-1.5">Date</label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-emerald-500 text-black dark:text-white transition-colors"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[13px] font-medium text-gray-700 dark:text-slate-300 mb-1.5">Start</label>
                      <input
                        type="time"
                        value={formData.startTime}
                        onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                        className="w-full px-2 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-emerald-500 text-black dark:text-white transition-colors text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-[13px] font-medium text-gray-700 dark:text-slate-300 mb-1.5">End</label>
                      <input
                        type="time"
                        value={formData.endTime}
                        onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                        className="w-full px-2 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-emerald-500 text-black dark:text-white transition-colors text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-gray-700 dark:text-slate-300 mb-1.5">Color Theme</label>
                  <div className="flex gap-3">
                    {COLORS.map((c, idx) => (
                      <button
                        key={idx}
                        onClick={() => setFormData({ ...formData, colorIdx: idx })}
                        className={`w-10 h-10 rounded-full ${c.bg} ${c.border} border-2 transition-transform ${formData.colorIdx === idx ? 'scale-110 ring-2 ring-offset-2 ring-emerald-500' : 'hover:scale-105'}`}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-gray-700 dark:text-slate-300 mb-1.5">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-emerald-500 text-black dark:text-white transition-colors h-24 resize-none"
                    placeholder="Add details, links, or notes..."
                  />
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleSave}
                    disabled={!formData.title || !formData.date}
                    className="w-full bg-black dark:bg-emerald-500 text-white font-medium py-3.5 rounded-xl hover:bg-gray-900 dark:hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {modalMode === 'add' ? 'Create Event' : 'Save Changes'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;
