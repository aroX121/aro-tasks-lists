import { useState, useMemo, useEffect } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Plus, ArrowUpRight, ArrowDownRight, X, Settings2, Edit2, Trash2, Calendar } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#14b8a6', '#6366f1', '#ec4899', '#f97316', '#06b6d4'];

export default function Finance() {
  const { transactions, addTransaction, deleteTransaction, categories, addCategory, editCategory, deleteCategory } = useFinance();
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [filterType, setFilterType] = useState('all'); // 'all', 'income', 'expense'
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateRange, setDateRange] = useState(() => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    return {
      start: firstDay.toISOString().split('T')[0],
      end: today.toISOString().split('T')[0]
    };
  });

  const [formData, setFormData] = useState({
    amount: '',
    type: 'expense',
    category: '',
    date: new Date().toISOString().split('T')[0],
  });

  const [catInput, setCatInput] = useState('');
  const [editingCat, setEditingCat] = useState(null);
  const [editInput, setEditInput] = useState('');

  // Calculations
  const totalBalance = useMemo(() => {
    return transactions.reduce((acc, t) => acc + (t.type === 'income' ? t.amount : -t.amount), 0);
  }, [transactions]);

  const periodTransactions = useMemo(() => {
    return transactions.filter(t => {
      const tDateStr = t.date.split('T')[0];
      return tDateStr >= dateRange.start && tDateStr <= dateRange.end;
    });
  }, [transactions, dateRange]);

  const { incomeInPeriod, expensesInPeriod } = useMemo(() => {
    let inc = 0;
    let exp = 0;
    periodTransactions.forEach(t => {
      if (t.type === 'income') inc += t.amount;
      else exp += t.amount;
    });
    return { incomeInPeriod: inc, expensesInPeriod: exp };
  }, [periodTransactions]);

  useEffect(() => {
    // Set default category when type changes if current category is empty or invalid for the type
    if (!formData.category || !categories[formData.type].includes(formData.category)) {
      setFormData(prev => ({ ...prev, category: categories[formData.type][0] || '' }));
    }
  }, [formData.type, categories]);

  const handleAdd = (e) => {
    e.preventDefault();
    if (!formData.amount || isNaN(parseFloat(formData.amount))) return;
    
    addTransaction({
      ...formData,
      category: formData.category || categories[formData.type][0]
    });
    setShowAddModal(false);
    setFormData({
      amount: '',
      type: 'expense',
      category: categories['expense'][0],
      date: new Date().toISOString().split('T')[0]
    });
  };

  const chartData = useMemo(() => {
    const expenses = periodTransactions.filter(t => t.type === 'expense');
    const grouped = expenses.reduce((acc, current) => {
      acc[current.category] = (acc[current.category] || 0) + current.amount;
      return acc;
    }, {});
    
    return Object.entries(grouped)
      .map(([name, value]) => ({ name, value }))
      .filter(d => d.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [periodTransactions]);

  const filteredTransactions = useMemo(() => {
    if (filterType === 'all') return periodTransactions;
    return periodTransactions.filter(t => t.type === filterType);
  }, [periodTransactions, filterType]);

  const handleCategoryAction = (e) => {
    e.preventDefault();
    if (editingCat) {
      if (editInput.trim() && editInput.trim() !== editingCat) {
        editCategory(formData.type, editingCat, editInput.trim());
      }
      setEditingCat(null);
      setEditInput('');
    } else if (catInput.trim()) {
      addCategory(formData.type, catInput.trim());
      setCatInput('');
    }
  };



  return (
    <div className="flex flex-col gap-6 relative p-2">
      {/* Header and Add Button */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
            Finance
            <button 
              onClick={() => setShowDatePicker(true)} 
              className="p-1.5 bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-emerald-500 dark:hover:text-emerald-400 rounded-lg transition-colors shadow-sm"
              title="Filter by Date"
            >
              <Calendar className="w-[18px] h-[18px]" strokeWidth={2.5} />
            </button>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Where your money goes</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-gradient-to-r from-[#10b981] to-emerald-500 hover:from-emerald-500 hover:to-emerald-600 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-500/20 flex items-center gap-2 font-medium transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Transaction</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>



      {/* Top Section - Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Balance */}
        <div className="bg-slate-900 dark:bg-emerald-500/10 p-6 rounded-2xl border border-slate-800 dark:border-emerald-500/20 text-white flex flex-col gap-1 relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-32 h-32 bg-emerald-500/20 blur-2xl rounded-full"></div>
          <span className="text-slate-400 font-medium text-sm z-10 text-slate-300">Total Balance (All Time)</span>
          <div className="flex items-center gap-1 z-10">
            <h2 className="text-3xl font-bold">₹{totalBalance.toLocaleString()}</h2>
          </div>
        </div>
        
        {/* Income & Expense */}
        <div className="col-span-1 md:col-span-2 grid grid-cols-2 gap-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-2xl flex flex-col gap-2 justify-center">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm font-medium">
              <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <ArrowUpRight className="w-4 h-4" />
              </div>
              Earned (Period)
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white ml-[40px]">₹{incomeInPeriod.toLocaleString()}</h3>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-2xl flex flex-col gap-2 justify-center">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm font-medium">
              <div className="w-8 h-8 rounded-full bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center text-rose-500">
                <ArrowDownRight className="w-4 h-4" />
              </div>
              Spent (Period)
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white ml-[40px]">₹{expensesInPeriod.toLocaleString()}</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Section - Transaction List */}
        <div className="md:col-span-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">Transactions</h2>
            
            {/* Filter Tabs */}
            <div className="flex bg-slate-100 dark:bg-slate-800/50 p-1 rounded-lg self-start">
              <button 
                onClick={() => setFilterType('all')} 
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${filterType === 'all' ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm' : 'text-slate-500'}`}
              >
                All
              </button>
              <button 
                onClick={() => setFilterType('income')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${filterType === 'income' ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-500'}`}
              >
                Earned
              </button>
              <button 
                onClick={() => setFilterType('expense')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${filterType === 'expense' ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-sm' : 'text-slate-500'}`}
              >
                Spent
              </button>
            </div>
          </div>
          
          <div className="space-y-3">
            {filteredTransactions.length === 0 ? (
              <div className="text-center py-10 text-slate-500 dark:text-slate-400">
                No transactions found for this period.
              </div>
            ) : (
              filteredTransactions.map(t => (
                <div key={t.id} className="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-800 group">
                  <div className="flex items-center gap-4">
                     <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      t.type === 'income' ? 'bg-emerald-50 text-emerald-500 dark:bg-emerald-500/10' : 'bg-rose-50 text-rose-500 dark:bg-rose-500/10'
                    }`}>
                      {t.type === 'income' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-white">{t.category}</p>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span>{new Date(t.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                     <span className={`font-semibold ${t.type === 'income' ? 'text-emerald-500' : 'text-slate-800 dark:text-white'}`}>
                      {t.type === 'income' ? '+' : '-'}₹{t.amount.toLocaleString()}
                    </span>
                    <button 
                      onClick={() => deleteTransaction(t.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-500 transition-all"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Sidebar - Chart & Goals */}
        <div className="flex flex-col gap-6">
          {/* Spend Chart */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 flex flex-col h-[300px] shrink-0">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Expenses by Category</h2>
            {chartData.length > 0 ? (
              <div className="flex-1 min-h-0 relative -ml-4">
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
                {/* Custom Legend */}
                <div className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col gap-2">
                  {chartData.slice(0, 5).map((entry, index) => (
                     <div key={entry.name} className="flex items-center gap-2 text-xs">
                       <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                       <span className="text-slate-600 dark:text-slate-300 truncate max-w-[60px]" title={entry.name}>{entry.name}</span>
                     </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
                No expenses in selected period.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Transaction Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800/80 w-full max-w-md rounded-[24px] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-slate-200/50 dark:border-white/10">
            <div className="px-6 py-4 flex justify-between items-center border-b border-slate-100 dark:border-slate-800">
              <h2 className="font-bold text-lg text-slate-800 dark:text-white">
                {showCategoryManager ? `Manage ${formData.type === 'income' ? 'Income' : 'Expense'} Categories` : 'Add Transaction'}
              </h2>
              <button onClick={() => { setShowAddModal(false); setShowCategoryManager(false); }} className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {showCategoryManager ? (
               <div className="p-6 space-y-4">
                 {/* Category Manager */}
                 <div className="flex items-center gap-2 mb-4 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                   <button onClick={() => setFormData(p => ({...p, type: 'expense'}))} className={`flex-1 py-1.5 text-sm font-medium rounded-lg transition-colors ${formData.type === 'expense' ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm' : 'text-slate-500'}`}>Expense</button>
                   <button onClick={() => setFormData(p => ({...p, type: 'income'}))} className={`flex-1 py-1.5 text-sm font-medium rounded-lg transition-colors ${formData.type === 'income' ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm' : 'text-slate-500'}`}>Income</button>
                 </div>

                 <ul className="max-h-48 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                   {categories[formData.type].map(cat => (
                     <li key={cat} className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg border border-slate-100 dark:border-slate-700/50">
                       {editingCat === cat ? (
                         <form onSubmit={handleCategoryAction} className="flex-1 flex items-center gap-2">
                           <input autoFocus type="text" value={editInput} onChange={e => setEditInput(e.target.value)} className="flex-1 bg-white dark:bg-slate-700 px-2 py-1 rounded outline-none border border-emerald-500 text-sm" />
                           <button type="submit" className="text-emerald-500 text-xs font-semibold">Save</button>
                           <button type="button" onClick={() => setEditingCat(null)} className="text-slate-400"><X className="w-4 h-4"/></button>
                         </form>
                       ) : (
                         <>
                           <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{cat}</span>
                           <div className="flex items-center gap-1">
                             <button onClick={() => { setEditingCat(cat); setEditInput(cat); }} className="p-1.5 text-slate-400 hover:text-emerald-500 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-colors"><Edit2 className="w-3.5 h-3.5"/></button>
                             <button onClick={() => deleteCategory(formData.type, cat)} className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-colors"><Trash2 className="w-3.5 h-3.5"/></button>
                           </div>
                         </>
                       )}
                     </li>
                   ))}
                 </ul>
                 
                 {!editingCat && (
                   <form onSubmit={handleCategoryAction} className="flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                     <input type="text" placeholder="New category..." value={catInput} onChange={e => setCatInput(e.target.value)} required className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 outline-none focus:border-emerald-500 text-sm py-2" />
                     <button type="submit" className="bg-emerald-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors">Add</button>
                   </form>
                 )}

                 <button onClick={() => setShowCategoryManager(false)} className="w-full mt-4 text-center text-sm font-medium text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors">
                   Back to Transaction
                 </button>
               </div>
            ) : (
              <form onSubmit={handleAdd} className="p-6 space-y-5">
                <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
                  <button type="button" onClick={() => setFormData({...formData, type: 'expense'})} className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${formData.type === 'expense' ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>Expense</button>
                  <button type="button" onClick={() => setFormData({...formData, type: 'income'})} className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${formData.type === 'income' ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>Income</button>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 block">Amount(₹)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₹</span>
                    <input 
                      type="number" 
                      autoFocus
                      required
                      value={formData.amount} 
                      onChange={e => setFormData({...formData, amount: e.target.value})}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl pl-8 pr-4 py-3 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-800 dark:text-white transition-all shadow-sm"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Category</label>
                    <button type="button" onClick={() => setShowCategoryManager(true)} className="text-xs text-emerald-500 font-medium flex items-center gap-1 hover:text-emerald-600 transition-colors">
                      <Settings2 className="w-3.5 h-3.5"/> Edit Categories
                    </button>
                  </div>
                  <select 
                    value={formData.category} 
                    onChange={e => setFormData({...formData, category: e.target.value})}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-800 dark:text-white transition-all shadow-sm appearance-none"
                    style={{ backgroundPosition: 'right 1rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em', backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")` }}
                  >
                    {categories[formData.type].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                
                <div>
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 block">Date</label>
                  <input 
                    type="date" 
                    value={formData.date} 
                    onChange={e => setFormData({...formData, date: e.target.value})}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-800 dark:text-white transition-all shadow-sm"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full bg-gradient-to-r from-[#10b981] to-emerald-500 hover:from-emerald-500 hover:to-emerald-600 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-emerald-500/30 mt-4 active:scale-95"
                >
                  Add Transaction
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Date Picker Modal */}
      {showDatePicker && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800/80 w-full max-w-sm rounded-[24px] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-slate-200/50 dark:border-white/10">
            <div className="px-6 py-4 flex justify-between items-center border-b border-slate-100 dark:border-slate-800">
              <h2 className="font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-500" />
                Select Period
              </h2>
              <button onClick={() => setShowDatePicker(false)} className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 block">Start Date</label>
                <input 
                  type="date" 
                  value={dateRange.start} 
                  max={new Date().toISOString().split('T')[0]}
                  onChange={e => setDateRange(prev => ({...prev, start: e.target.value}))}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-800 dark:text-white transition-all shadow-sm"
                />
              </div>
              <div className="text-center text-slate-400 text-xs font-medium uppercase">To</div>
              <div>
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 block">End Date</label>
                <input 
                  type="date" 
                  value={dateRange.end} 
                  max={new Date().toISOString().split('T')[0]}
                  onChange={e => setDateRange(prev => ({...prev, end: e.target.value}))}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-800 dark:text-white transition-all shadow-sm"
                />
              </div>
              <button 
                onClick={() => setShowDatePicker(false)} 
                className="w-full bg-slate-800 dark:bg-white text-white dark:text-slate-900 font-semibold py-3 rounded-xl transition-all hover:bg-slate-700 dark:hover:bg-slate-100 mt-4 active:scale-95"
              >
                Apply Range
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
