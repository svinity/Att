import React, { useState } from 'react';
import { HardHat, Lock, User, Eye, EyeOff } from 'lucide-react';
import { AppUser } from '../types';

interface LoginScreenProps {
  users: AppUser[];
  onLoginSuccess: () => void;
}

export default function LoginScreen({ users, onLoginSuccess }: LoginScreenProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!username.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);

    // Simulate standard security check with minor delay
    setTimeout(() => {
      // Fallback admin credentials in case the users list hasn't loaded yet (e.g. first run / offline)
      const isFallbackAdmin = users.length === 0 && username.trim() === 'Sahil' && password === 'Log@in123';
      const matchedUser = users.find(u => u.username === username.trim() && u.password === password);

      if (matchedUser || isFallbackAdmin) {
        localStorage.setItem('prefab_is_logged_in', 'true');
        onLoginSuccess();
      } else {
        setError('Invalid username or password');
        setIsLoading(false);
      }
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-4">
      <div id="login-card" className="w-full max-w-md bg-white rounded-3xl border border-gray-100 shadow-2xl p-8 space-y-8 animate-fadeIn">
        
        {/* Logo and Branding */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-[#1a56db] flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <HardHat className="w-8 h-8 stroke-[2]" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-[#1a56db] tracking-tight">Prefabshala</h1>
            <p className="text-xs font-bold text-[#047857] uppercase tracking-widest mt-1">Admin Portal Login</p>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 text-center">
          <p className="text-xs text-gray-500">
            Enter administrative credentials to manage workers, track attendance, and process site expenses.
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3.5 bg-red-50 border border-red-100 text-red-600 text-xs font-semibold rounded-xl text-center animate-shake">
              {error}
            </div>
          )}

          {/* Username Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Username</label>
            <div className="relative">
              <span className="absolute left-4 top-3.5 text-gray-400">
                <User className="w-5 h-5" />
              </span>
              <input
                id="login-username"
                type="text"
                placeholder="Enter Sahil"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
                className="w-full h-12 pl-12 pr-4 bg-gray-50/50 hover:bg-gray-50 focus:bg-white rounded-xl border border-gray-200 text-sm font-semibold text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#1a56db] focus:ring-1 focus:ring-[#1a56db] transition-all"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Password</label>
            <div className="relative">
              <span className="absolute left-4 top-3.5 text-gray-400">
                <Lock className="w-5 h-5" />
              </span>
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="w-full h-12 pl-12 pr-12 bg-gray-50/50 hover:bg-gray-50 focus:bg-white rounded-xl border border-gray-200 text-sm font-semibold text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#1a56db] focus:ring-1 focus:ring-[#1a56db] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
                className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Action Button */}
          <button
            id="login-btn"
            type="submit"
            disabled={isLoading}
            className="w-full h-12 bg-[#1a56db] hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 active:scale-95 disabled:opacity-50 disabled:scale-100 flex items-center justify-center cursor-pointer"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Verifying credentials...</span>
              </div>
            ) : (
              <span>Unlock Dashboard</span>
            )}
          </button>
        </form>

        <div className="text-center">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            Prefabshala Worker Manager • v1.0.3
          </span>
        </div>
      </div>
    </div>
  );
}
