import { createContext, useState, useEffect, useContext } from 'react';
import { useAuth } from './AuthContext';

const FinanceContext = createContext();

export const useFinance = () => useContext(FinanceContext);

export const FinanceProvider = ({ children }) => {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState({
    income: ['Salary', 'Freelance', 'Investments', 'Other'],
    expense: ['Food', 'Rent', 'Travel', 'Bills', 'Shopping', 'Other']
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setTransactions([]);
      setLoading(false);
      return;
    }
    const savedTransactions = localStorage.getItem(`producter-finance-transactions-${user.id}`);
    if (savedTransactions) {
      setTransactions(JSON.parse(savedTransactions));
    } else {
      setTransactions([]);
    }

    const savedCategories = localStorage.getItem(`producter-finance-categories-${user.id}`);
    if (savedCategories) {
      setCategories(JSON.parse(savedCategories));
    } else {
      setCategories({
        income: ['Salary', 'Freelance', 'Investments', 'Other'],
        expense: ['Food', 'Rent', 'Travel', 'Bills', 'Shopping', 'Other']
      });
    }

    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (!loading && user) {
      localStorage.setItem(`producter-finance-transactions-${user.id}`, JSON.stringify(transactions));
      localStorage.setItem(`producter-finance-categories-${user.id}`, JSON.stringify(categories));
    }
  }, [transactions, categories, loading, user]);

  const addTransaction = (transactionInput) => {
    const newTransaction = {
      id: Date.now().toString(),
      amount: parseFloat(transactionInput.amount),
      type: transactionInput.type, // 'income' or 'expense'
      category: transactionInput.category,
      date: transactionInput.date || new Date().toISOString(),
      linkedGoalId: transactionInput.linkedGoalId || null,
      created_at: new Date().toISOString(),
    };
    setTransactions(prev => [newTransaction, ...prev]);
  };

  const deleteTransaction = (id) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };
  
  const getOverview = (monthDate = new Date()) => {
    const currentMonth = monthDate.getMonth();
    const currentYear = monthDate.getFullYear();
    
    let totalBalance = 0;
    let incomeThisMonth = 0;
    let expensesThisMonth = 0;
    
    transactions.forEach(t => {
      const isIncome = t.type === 'income';
      
      if (isIncome) totalBalance += t.amount;
      else totalBalance -= t.amount;
      
      const tDate = new Date(t.date);
      if (tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear) {
        if (isIncome) incomeThisMonth += t.amount;
        else expensesThisMonth += t.amount;
      }
    });

    return { totalBalance, incomeThisMonth, expensesThisMonth, netBalanceThisMonth: incomeThisMonth - expensesThisMonth };
  };

  const addCategory = (type, category) => {
    setCategories(prev => ({
      ...prev,
      [type]: [...new Set([...prev[type], category])]
    }));
  };

  const editCategory = (type, oldCategory, newCategory) => {
    setCategories(prev => ({
      ...prev,
      [type]: prev[type].map(c => c === oldCategory ? newCategory : c)
    }));
    // Also update existing transactions
    setTransactions(prev => prev.map(t => 
      t.type === type && t.category === oldCategory 
        ? { ...t, category: newCategory }
        : t
    ));
  };

  const deleteCategory = (type, category) => {
    setCategories(prev => ({
      ...prev,
      [type]: prev[type].filter(c => c !== category)
    }));
    // Note: Can't easily delete transactions if category deleted, maybe revert to 'Other'
    setTransactions(prev => prev.map(t => 
      t.type === type && t.category === category 
        ? { ...t, category: 'Other' }
        : t
    ));
  };

  return (
    <FinanceContext.Provider value={{
      transactions,
      addTransaction,
      deleteTransaction,
      getOverview,
      categories,
      addCategory,
      editCategory,
      deleteCategory,
      loading
    }}>
      {children}
    </FinanceContext.Provider>
  );
};
