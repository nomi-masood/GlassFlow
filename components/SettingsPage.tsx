import React, { useState, useRef } from 'react';
import { User } from '../types';
import { GlassCard, GlassButton, GlassInput, GlassToggle, Badge } from './GlassComponents';
import { User as UserIcon, Camera, Save, Bell, Shield, Smartphone, Mail, Moon, Sun, Info, LogOut } from 'lucide-react';

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
  
  // Simulated Notification Settings (Local State)
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    digest: true
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

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      <div>
        <h1 className="text-3xl font-thin text-slate-900 dark:text-white mb-1">Settings</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm font-thin">Manage your account preferences and profile</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Profile */}
        <div className="lg:col-span-2 space-y-6">
          <GlassCard className="p-8">
            <h2 className="text-xl font-medium text-slate-800 dark:text-white mb-6 flex items-center gap-2">
              <UserIcon size={20} className="text-indigo-500" /> Public Profile
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex items-start gap-6">
                <div className="relative group cursor-pointer shrink-0" onClick={() => fileInputRef.current?.click()}>
                   <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-slate-100 dark:border-white/5 bg-slate-100 dark:bg-white/5 shadow-inner">
                      <img src={formData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                   </div>
                   <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
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
                
                <div className="flex-1 space-y-4">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 ml-1 uppercase tracking-wide">Full Name</label>
                        <GlassInput 
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 ml-1 uppercase tracking-wide">Email</label>
                        <GlassInput 
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                        />
                      </div>
                   </div>
                   <div>
                      <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-2 ml-1 uppercase tracking-wide">Role</label>
                      <Badge color={currentUser.role === 'admin' ? 'bg-rose-500' : currentUser.role === 'manager' ? 'bg-blue-500' : 'bg-slate-500'}>
                         {currentUser.role}
                      </Badge>
                   </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <GlassButton type="submit" className="bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20">
                  <Save size={18} /> Save Changes
                </GlassButton>
              </div>
            </form>
          </GlassCard>

          <GlassCard className="p-8">
             <h2 className="text-xl font-medium text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                <Bell size={20} className="text-indigo-500" /> Notifications
             </h2>
             <div className="space-y-2 divide-y divide-slate-100 dark:divide-white/5">
                <GlassToggle 
                   label="Email Notifications" 
                   description="Receive updates about your tasks and leads via email."
                   checked={notifications.email} 
                   onChange={(v) => setNotifications({...notifications, email: v})} 
                />
                <GlassToggle 
                   label="Push Notifications" 
                   description="Get real-time alerts on your desktop or mobile device."
                   checked={notifications.push} 
                   onChange={(v) => setNotifications({...notifications, push: v})} 
                />
                <GlassToggle 
                   label="Weekly Digest" 
                   description="A summary of your team's performance sent every Monday."
                   checked={notifications.digest} 
                   onChange={(v) => setNotifications({...notifications, digest: v})} 
                />
             </div>
          </GlassCard>
        </div>

        {/* Right Column: Preferences & System */}
        <div className="space-y-6">
           <GlassCard className="p-6">
              <h2 className="text-lg font-medium text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                 <Smartphone size={18} className="text-indigo-500" /> Appearance
              </h2>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                 <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-white/10 flex items-center justify-center text-slate-600 dark:text-slate-300">
                       {isDark ? <Moon size={16} /> : <Sun size={16} />}
                    </div>
                    <div>
                       <div className="text-sm font-medium text-slate-800 dark:text-white">Dark Mode</div>
                       <div className="text-xs text-slate-500 dark:text-slate-400">{isDark ? 'On' : 'Off'}</div>
                    </div>
                 </div>
                 <GlassToggle checked={isDark} onChange={toggleTheme} />
              </div>
           </GlassCard>

           <GlassCard className="p-6">
               <h2 className="text-lg font-medium text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                  <Info size={18} className="text-indigo-500" /> System Info
               </h2>
               <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                     <span className="text-slate-500 dark:text-slate-400">Version</span>
                     <span className="font-mono text-slate-700 dark:text-slate-300">v1.2.0 (Prototype)</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                     <span className="text-slate-500 dark:text-slate-400">User ID</span>
                     <span className="font-mono text-xs text-slate-400">{currentUser.id}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                     <span className="text-slate-500 dark:text-slate-400">Branch</span>
                     <span className="font-medium text-slate-700 dark:text-slate-300">{currentUser.branchId || 'Headquarters'}</span>
                  </div>
               </div>
               
               <div className="mt-6 pt-6 border-t border-slate-100 dark:border-white/5">
                  <GlassButton variant="danger" onClick={onLogout} className="w-full justify-center">
                     <LogOut size={16} /> Sign Out
                  </GlassButton>
               </div>
           </GlassCard>
        </div>

      </div>
    </div>
  );
};

export default SettingsPage;