import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabase';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signup = async (email, password, metadata) => {
    return supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    });
  };

  const login = async (email, password) => {
    return supabase.auth.signInWithPassword({
      email,
      password
    });
  };

  const logout = async () => {
    return supabase.auth.signOut();
  };

  const updateProfile = async (metadata) => {
    return supabase.auth.updateUser({
      data: metadata
    });
  };

  return (
    <AuthContext.Provider value={{ user, signup, login, logout, updateProfile, loading }}>
        {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
