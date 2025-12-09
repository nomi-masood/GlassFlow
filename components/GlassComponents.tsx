import React from 'react';

export const GlassCard: React.FC<{ children: React.ReactNode; className?: string; onClick?: () => void }> = ({ children, className = "", onClick }) => (
  <div 
    onClick={onClick}
    className={`glass-card rounded-2xl p-6 transition-all duration-300 ${className}`}
  >
    {children}
  </div>
);

export const GlassButton: React.FC<{ 
  children: React.ReactNode; 
  onClick?: () => void; 
  className?: string; 
  variant?: 'primary' | 'ghost' | 'danger';
  type?: 'button' | 'submit' | 'reset';
}> = ({ children, onClick, className = "", variant = 'primary', type }) => {
  const base = "glass-button px-5 py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 cursor-pointer select-none";
  let variantStyles = "";
  
  if (variant === 'primary') {
    variantStyles = "text-white hover:border-indigo-400/50 hover:bg-indigo-500/20";
  } else if (variant === 'danger') {
    variantStyles = "text-rose-600 dark:text-rose-200 hover:border-rose-400/50 hover:bg-rose-500/20";
  } else {
    variantStyles = "bg-transparent border-transparent hover:bg-black/5 dark:hover:bg-white/5 text-slate-500 dark:text-slate-300";
  }

  return (
    <button type={type} onClick={onClick} className={`${base} ${variantStyles} ${className}`}>
      {children}
    </button>
  );
};

export const GlassInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <input
    {...props}
    className={`glass-input-base rounded-xl px-4 py-2 font-medium text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/30 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-all w-full ${props.className || ''}`}
  />
);

export const Badge: React.FC<{ children: React.ReactNode; color?: string }> = ({ children, color = "bg-indigo-500" }) => (
  <span className={`text-[10px] uppercase tracking-wider font-medium px-2 py-0.5 rounded-full bg-opacity-10 dark:bg-opacity-20 text-opacity-90 dark:text-opacity-90 ${color.replace('bg-', 'text-')} ${color.replace('bg-', 'bg-')} border border-black/5 dark:border-white/5`}>
    {children}
  </span>
);

export const GlassToggle: React.FC<{ checked: boolean; onChange: (checked: boolean) => void; label?: string; description?: string }> = ({ checked, onChange, label, description }) => (
  <div className="flex items-center justify-between py-3">
    <div>
      {label && <div className="text-sm font-medium text-slate-700 dark:text-slate-200">{label}</div>}
      {description && <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{description}</div>}
    </div>
    <button
      onClick={() => onChange(!checked)}
      className={`w-11 h-6 rounded-full transition-colors relative shrink-0 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${checked ? 'bg-indigo-500' : 'bg-slate-300 dark:bg-white/10'}`}
    >
      <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  </div>
);