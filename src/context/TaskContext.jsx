import { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../supabase';
import { useAuth } from './AuthContext';

const TaskContext = createContext();

export const useTasks = () => useContext(TaskContext);

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // 1. Initial Fetch
  useEffect(() => {
    const fetchTasks = async () => {
      if (!user) {
        setTasks([]);
        setLoading(false);
        return;
      }
      try {
        const { data, error } = await supabase
          .from('tasks')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        if (data && data.length > 0) {
           setTasks(data);
        } else {
           // Fallback to local storage if DB is empty
           const savedTasks = localStorage.getItem(`producter-tasks-${user.id}`);
           if (savedTasks) setTasks(JSON.parse(savedTasks));
           else setTasks([]);
        }
      } catch (error) {
        console.error('Error fetching from Supabase, reverting to local storage.', error.message);
        const savedTasks = localStorage.getItem(`producter-tasks-${user.id}`);
        if (savedTasks) setTasks(JSON.parse(savedTasks));
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [user]);

  // Sync to local storage as an immediate backup mirror
  useEffect(() => {
    if (!loading && user) {
       localStorage.setItem(`producter-tasks-${user.id}`, JSON.stringify(tasks));
    }
  }, [tasks, loading, user]);

  const addTask = async (task) => {
    if (!user) return;
    // Temp ID for immediate UI update
    const tempId = Date.now().toString();
    const newTask = { ...task, id: tempId, created_at: new Date().toISOString(), user_id: user.id };
    
    // Optimistic Update
    setTasks(prev => [newTask, ...prev]);

    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert([{
           name: task.name,
           dueDate: task.dueDate,
           priority: task.priority,
           status: task.status,
           icon: task.icon,
           completed: task.completed,
           user_id: user.id
        }])
        .select()
        .single();

      if (error) throw error;

      // Swap out the temp ID with full Database UUID
      setTasks(prev => prev.map(t => t.id === tempId ? { ...data } : t));
    } catch (error) {
      console.error('Error saving task to Supabase:', error.message);
      // It stays in local storage via our sync effect
    }
  };

  const editTask = async (id, updatedTask) => {
    // Optimistic Update
    setTasks(prev => prev.map(task => (task.id === id ? { ...task, ...updatedTask } : task)));

    // Only attempt Supabase query if it exists in DB (UUID format check)
    if (typeof id === 'string' && id.length > 20) {
      try {
        const { error } = await supabase
          .from('tasks')
          .update(updatedTask)
          .eq('id', id);
          
        if (error) throw error;
      } catch (error) {
        console.error('Error updating task in Supabase:', error.message);
      }
    }
  };

  const deleteTask = async (id) => {
    // Optimistic Update
    setTasks(prev => prev.filter(task => task.id !== id));

    if (typeof id === 'string' && id.length > 20) {
      try {
        const { error } = await supabase
          .from('tasks')
          .delete()
          .eq('id', id);
          
        if (error) throw error;
      } catch (error) {
        console.error('Error deleting task from Supabase:', error.message);
      }
    }
  };

  return (
    <TaskContext.Provider value={{ tasks, addTask, editTask, deleteTask, loading }}>
      {children}
    </TaskContext.Provider>
  );
};


