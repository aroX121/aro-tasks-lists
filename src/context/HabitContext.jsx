import { createContext, useState, useEffect, useContext } from 'react';
import { useAuth } from './AuthContext';

const HabitContext = createContext();

export const useHabits = () => useContext(HabitContext);

export const HabitProvider = ({ children }) => {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setHabits([]);
      setLoading(false);
      return;
    }
    const savedHabits = localStorage.getItem(`producter-habits-${user.id}`);
    if (savedHabits) {
      setHabits(JSON.parse(savedHabits));
    } else {
      setHabits([]);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (!loading && user) {
      localStorage.setItem(`producter-habits-${user.id}`, JSON.stringify(habits));
    }
  }, [habits, loading, user]);

  const addHabit = (habitInput) => {
    const newHabit = {
      id: Date.now().toString(),
      name: habitInput.name,
      frequency: habitInput.frequency || 'daily',
      created_at: new Date().toISOString(),
      completions: [],
    };
    setHabits(prev => [newHabit, ...prev]);
  };

  const deleteHabit = (id) => {
    setHabits(prev => prev.filter(h => h.id !== id));
  };

  const toggleHabitDate = (id, dateStr) => {
    setHabits(prev => prev.map(habit => {
      if (habit.id === id) {
        const isCompleted = habit.completions.includes(dateStr);
        let newCompletions;
        if (isCompleted) {
          newCompletions = habit.completions.filter(d => d !== dateStr);
        } else {
          newCompletions = [...habit.completions, dateStr].sort(); // keep sorted
        }
        return { ...habit, completions: newCompletions };
      }
      return habit;
    }));
  };

  return (
    <HabitContext.Provider value={{ habits, addHabit, deleteHabit, toggleHabitDate, loading }}>
      {children}
    </HabitContext.Provider>
  );
};
