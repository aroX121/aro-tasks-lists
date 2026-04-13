import { createContext, useState, useEffect, useContext } from 'react';
import { useAuth } from './AuthContext';

const GoalContext = createContext();

export const useGoals = () => useContext(GoalContext);

export const GoalProvider = ({ children }) => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setGoals([]);
      setLoading(false);
      return;
    }
    const savedGoals = localStorage.getItem(`producter-goals-${user.id}`);
    if (savedGoals) {
      setGoals(JSON.parse(savedGoals));
    } else {
      setGoals([]);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (!loading && user) {
      localStorage.setItem(`producter-goals-${user.id}`, JSON.stringify(goals));
    }
  }, [goals, loading, user]);

  const addGoal = (goalInput) => {
    const newGoal = {
      id: Date.now().toString(),
      name: goalInput.name,
      description: goalInput.description || '',
      deadline: goalInput.deadline || null,
      status: 'active',
      linkedTaskIds: goalInput.linkedTaskIds || [],
      linkedHabitIds: goalInput.linkedHabitIds || [],
      created_at: new Date().toISOString(),
    };
    setGoals(prev => [newGoal, ...prev]);
  };

  const updateGoal = (id, updatedFields) => {
    setGoals(prev => prev.map(goal => 
      goal.id === id ? { ...goal, ...updatedFields } : goal
    ));
  };

  const deleteGoal = (id) => {
    setGoals(prev => prev.filter(g => g.id !== id));
  };

  const linkTaskToGoal = (goalId, taskId) => {
    setGoals(prev => prev.map(goal => 
      goal.id === goalId 
        ? { ...goal, linkedTaskIds: [...new Set([...(goal.linkedTaskIds || []), taskId])] }
        : goal
    ));
  };

  const unlinkTaskFromGoal = (goalId, taskId) => {
    setGoals(prev => prev.map(goal => 
      goal.id === goalId 
        ? { ...goal, linkedTaskIds: (goal.linkedTaskIds || []).filter(id => id !== taskId) }
        : goal
    ));
  };

  const linkHabitToGoal = (goalId, habitId) => {
    setGoals(prev => prev.map(goal => 
      goal.id === goalId 
        ? { ...goal, linkedHabitIds: [...new Set([...(goal.linkedHabitIds || []), habitId])] }
        : goal
    ));
  };

  const unlinkHabitFromGoal = (goalId, habitId) => {
    setGoals(prev => prev.map(goal => 
      goal.id === goalId 
        ? { ...goal, linkedHabitIds: (goal.linkedHabitIds || []).filter(id => id !== habitId) }
        : goal
    ));
  };

  return (
    <GoalContext.Provider value={{ 
      goals, 
      addGoal, 
      updateGoal, 
      deleteGoal, 
      linkTaskToGoal, 
      unlinkTaskFromGoal, 
      linkHabitToGoal, 
      unlinkHabitFromGoal,
      loading 
    }}>
      {children}
    </GoalContext.Provider>
  );
};
