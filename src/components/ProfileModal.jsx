import { useState, useEffect } from 'react';
import { X, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ProfileModal({ isOpen, onClose }) {
  const { user, updateProfile } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user?.user_metadata) {
      setFirstName(user.user_metadata.first_name || '');
      setLastName(user.user_metadata.last_name || '');
    }
  }, [user, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const { error } = await updateProfile({ first_name: firstName, last_name: lastName });
      if (error) throw error;
      setSuccess('Profile updated successfully!');
      setTimeout(() => {
        onClose();
        setSuccess('');
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="relative bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-500">
              <User className="w-4 h-4" />
            </div>
            <h2 className="text-[16px] font-bold text-slate-800 dark:text-white">Update Profile</h2>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
          {error && (
            <div className="bg-red-50 text-red-500 p-3 rounded-xl text-sm border border-red-100">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-emerald-50 text-emerald-500 p-3 rounded-xl text-sm border border-emerald-100">
              {success}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label className="text-[13px] font-semibold text-slate-700 dark:text-slate-300">Email (Read Only)</label>
            <input 
              type="email" 
              value={user?.email || ''}
              disabled
              className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 rounded-xl px-4 py-2.5 text-[14px] text-slate-500 cursor-not-allowed"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[13px] font-semibold text-slate-700 dark:text-slate-300">First Name</label>
            <input 
              type="text" 
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl px-4 py-2.5 text-[14px] text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500 transition-colors"
              placeholder="First Name"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[13px] font-semibold text-slate-700 dark:text-slate-300">Last Name</label>
            <input 
              type="text" 
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl px-4 py-2.5 text-[14px] text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500 transition-colors"
              placeholder="Last Name"
            />
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <button 
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-[14px] font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl text-[14px] font-medium bg-blue-500 hover:bg-blue-600 text-white transition-colors"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
