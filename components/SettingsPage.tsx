
import React, { useState, useRef } from 'react';
import { User } from '../types';
import { GlassCard, GlassButton, GlassInput, Badge } from './GlassComponents';
import { User as UserIcon, Camera, Save, Shield, Smartphone, Moon, Sun, Info, LogOut, Wifi } from 'lucide-react';

interface SettingsPageProps {
  currentUser: User;
  onUpdateProfile: (updatedData: Partial<User>) => void;
  isDark: boolean;
  toggleTheme: () => void;
  onLogout: () => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ currentUser, onUpdateProfile, isDark, toggleTheme, onLogout }) => {
  const [formData, setFormData] = useState({
    name: currentUser.name,
    email: currentUser.email,
    avatarUrl: currentUser.avatarUrl
  });
  
  // Password State
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, avatarUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(formData);
  };

  const handlePasswordUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      alert("New passwords do not match");
      return;
    }
    // Mock success
    setPasswords({ current: '', new: '', confirm: '' });
    alert("Password updated successfully");
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      <div>
        <h1 className="text-3xl font-thin text-slate-900 dark:text-white mb-1">Settings</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm font-thin">Manage your account preferences and system capabilities</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Profile & Security */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Public Profile Card - Redesigned */}
          <GlassCard className="p-0 overflow-hidden">
            {/* Decorative Cover Banner */}
            <div className="h-32 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-blue-500/20 border-b border-white/5 relative overflow-hidden">
               <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            </div>

            <div className="px-8 pb-8">
              <div className="flex flex-col md:flex-row gap-8 items-start -mt-12">
                
                {/* Identity Column */}
                <div className="flex flex-col items-center gap-3 shrink-0 mx-auto md:mx-0">
                  <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                     <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white dark:border-[#15152a] bg-slate-100 dark:bg-white/5 shadow-xl">
                        <img src={formData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                     </div>
                     <div className="absolute inset-0 rounded-full border-4 border-transparent bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Camera className="text-white" size={24} />
                     </div>
                     <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                  </div>
                  <div className="text-center">
                    <Badge color={currentUser.role === 'admin' ? 'bg-rose-500' : currentUser.role === 'manager' ? 'bg-blue-500' : 'bg-slate-500'}>
                       {currentUser.role}
                    </Badge>
                    <p className="text-xs text-slate-400 mt-2">Click photo to update</p>
                  </div>
                </div>

                {/* Form Column */}
                <form onSubmit={handleSubmit} className="flex-1 w-full pt-4 md:pt-14 space-y-5">
                   <div>
                      <h2 className="text-lg font-medium text-slate-800 dark:text-white flex items-center gap-2 mb-4">
                        <UserIcon size={18} className="text-indigo-500" /> Public Profile
                      </h2>
                      <div className="grid grid-cols-1 gap-5">
                        <div>
                          <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 ml-1 uppercase tracking-wide">Display Name</label>
                          <GlassInput 
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 ml-1 uppercase tracking-wide">Email Address</label>
                          <GlassInput 
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                          />
                        </div>
                      </div>
                   </div>

                   <div className="pt-2 flex justify-end border-t border-slate-100 dark:border-white/5">
                      <GlassButton type="submit" className="bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 px-6">
                        <Save size={18} /> Save Profile
                      </GlassButton>
                   </div>
                </form>

              </div>
            </div>
          </GlassCard>

          {/* Security Section */}
          <GlassCard className="p-8">
            <h2 className="text-xl font-medium text-slate-800 dark:text-white mb-6 flex items-center gap-2">
              <Shield size={20} className="text-emerald-500" /> Security
            </h2>
            
            <form onSubmit={handlePasswordUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 ml-1 uppercase tracking-wide">Current Password</label>
                <GlassInput 
                  type="password"
                  value={passwords.current}
                  onChange={(e) => setPasswords({...passwords, current: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 ml-1 uppercase tracking-wide">New Password</label>
                  <GlassInput 
                    type="password"
                    value={passwords.new}
                    onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 ml-1 uppercase tracking-wide">Confirm Password</label>
                  <GlassInput 
                    type="password"
                    value={passwords.confirm}
                    onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                  />
                </div>
              </div>
              <div className="pt-2 flex justify-end">
                <GlassButton variant="ghost" className="text-slate-500 hover:text-emerald-500">
                  Update Password
                </GlassButton>
              </div>
            </form>
          </GlassCard>
        </div>

        {/* Right Column: Preferences */}
        <div className="space-y-6">
          {/* Preferences */}
          <GlassCard className="p-6">
            <h2 className="text-lg font-medium text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <Smartphone size={18} className="text-purple-500" /> Appearance
            </h2>
            <div className="space-y-2">
              <div className="flex items-center justify-between py-3">
                <div>
                  <div className="text-sm font-medium text-slate-700 dark:text-slate-200">Theme Mode</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Toggle light/dark interface</div>
                </div>
                <button
                  onClick={toggleTheme}
                  className={`w-14 h-8 rounded-full transition-all flex items-center px-1 ${isDark ? 'bg-slate-700' : 'bg-indigo-100'}`}
                >
                  <div className={`w-6 h-6 rounded-full shadow-sm flex items-center justify-center transition-transform duration-300 ${isDark ? 'bg-slate-900 translate-x-6' : 'bg-white translate-x-0'}`}>
                    {isDark ? <Moon size={14} className="text-indigo-400" /> : <Sun size={14} className="text-amber-500" />}
                  </div>
                </button>
              </div>
            </div>
          </GlassCard>

          {/* System Info */}
          <GlassCard className="p-6">
             <h2 className="text-lg font-medium text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <Info size={18} className="text-blue-500" /> System Status
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">Version</span>
                <span className="font-mono text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded">v1.2.0 (Beta)</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">Environment</span>
                <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-medium text-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Production
                </span>
              </div>

               <div className="flex justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">Last Synced</span>
                <span className="text-slate-700 dark:text-slate-300 text-xs font-medium flex items-center gap-1">
                   <Wifi size={10} className="text-emerald-500" /> Just now
                </span>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">User ID</span>
                <span className="font-mono text-xs text-slate-500 dark:text-slate-400">{currentUser.id}</span>
              </div>
            </div>
          </GlassCard>
          
          <div className="pt-2">
             <button 
                onClick={onLogout}
                className="w-full py-3 rounded-xl border border-slate-200 dark:border-white/10 text-slate-500 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all flex items-center justify-center gap-2 text-sm font-medium"
             >
                <LogOut size={16} /> Sign Out
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
