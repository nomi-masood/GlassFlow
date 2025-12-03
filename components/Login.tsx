
import React, { useState } from 'react';
import { GlassCard, GlassButton, GlassInput } from './GlassComponents';
import { Zap, Lock, Mail, ArrowRight } from 'lucide-react';
import { User, Role } from '../types';
import { MOCK_USERS } from '../constants';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Simulate network delay
    setTimeout(() => {
      const user = MOCK_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
      
      if (user) {
        onLogin(user);
      } else {
        setError('Invalid credentials. Try admin@glassflow.com');
        setLoading(false);
      }
    }, 800);
  };

  const fillCredentials = (roleEmail: string) => {
    setEmail(roleEmail);
    setPassword('password');
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-50 dark:bg-[#0F0F23] transition-colors duration-500">
      {/* Background Ambience */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-500/10 blur-[150px] animate-pulse" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-purple-500/10 blur-[150px] animate-pulse" style={{ animationDelay: '2s' }} />

      <div className="w-full max-w-md p-6 z-10 animate-fade-in-up">
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 mx-auto mb-4">
            <Zap size={32} className="text-white fill-white" />
          </div>
          <h1 className="text-4xl font-thin text-slate-900 dark:text-white mb-2">GlassFlow</h1>
          <p className="text-slate-500 dark:text-slate-400 font-thin">Sign in to your workspace</p>
        </div>

        <GlassCard className="p-8 backdrop-blur-xl bg-white/60 dark:bg-white/5 border-white/20 shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <GlassInput 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com" 
                  className="pl-12"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <GlassInput 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="pl-12"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="text-rose-500 text-sm font-medium text-center bg-rose-500/10 py-2 rounded-lg border border-rose-500/20">
                {error}
              </div>
            )}

            <GlassButton className="w-full bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-500 dark:hover:bg-indigo-400 text-white justify-center py-3 text-base shadow-lg shadow-indigo-500/20">
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Sign In <ArrowRight size={18} /></>
              )}
            </GlassButton>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-white/10">
            <p className="text-xs text-center font-medium text-slate-400 dark:text-slate-500 mb-4">Demo Accounts (Click to fill)</p>
            <div className="grid grid-cols-3 gap-2">
              <button 
                onClick={() => fillCredentials('admin@glassflow.com')}
                className="px-2 py-2 rounded-lg bg-indigo-500/5 hover:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-medium transition-colors border border-indigo-500/10"
              >
                Admin
              </button>
              <button 
                onClick={() => fillCredentials('manager@glassflow.com')}
                className="px-2 py-2 rounded-lg bg-purple-500/5 hover:bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-medium transition-colors border border-purple-500/10"
              >
                Manager
              </button>
              <button 
                onClick={() => fillCredentials('user@glassflow.com')}
                className="px-2 py-2 rounded-lg bg-pink-500/5 hover:bg-pink-500/10 text-pink-600 dark:text-pink-400 text-xs font-medium transition-colors border border-pink-500/10"
              >
                User
              </button>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default Login;
