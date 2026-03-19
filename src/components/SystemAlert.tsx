import React from 'react';
import { ShieldAlert } from 'lucide-react';

type AlertType = 'error' | 'warning' | 'info';

interface SystemAlertProps {
  type: AlertType;
  title?: string;
  message: string | React.ReactNode;
  subMessage?: string;
  className?: string;
}

const config = {
  error: {
    wrapper: 'bg-red-500/10 border-red-500/50 p-6 flex items-start gap-4',
    icon: <ShieldAlert className="w-6 h-6 text-red-500 shrink-0 mt-1" aria-hidden="true" />,
    title: 'text-red-500',
    message: 'text-slate-300 text-sm'
  },
  warning: {
    wrapper: 'bg-yellow-500/10 border-yellow-500/50 p-6 flex items-start gap-4',
    icon: <ShieldAlert className="w-6 h-6 text-yellow-500 shrink-0 mt-1" aria-hidden="true" />,
    title: 'text-yellow-500',
    message: 'text-slate-300 text-sm'
  },
  info: {
    wrapper: 'bg-blue-500/5 border-blue-500/20 p-4 flex items-center justify-center gap-3',
    icon: <ShieldAlert className="w-5 h-5 text-blue-500/50 shrink-0" aria-hidden="true" />,
    title: '',
    message: 'text-[10px] text-blue-400/60 uppercase tracking-widest text-center'
  }
};

export function SystemAlert({ type, title, message, subMessage, className = '' }: SystemAlertProps) {
  const style = config[type];

  if (type === 'info') {
    return (
      <div className={`border rounded-2xl animate-in fade-in ${style.wrapper} ${className}`}>
        {style.icon}
        <p className={`font-mono ${style.message}`}>{message}</p>
      </div>
    );
  }

  return (
    <div className={`border rounded-2xl animate-in fade-in ${style.wrapper} ${className}`}>
      {style.icon}
      <div>
        {title && <h3 className={`font-bold tracking-widest uppercase mb-1 ${style.title}`}>{title}</h3>}
        <p className={`font-mono ${style.message}`}>{message}</p>
        {subMessage && <p className="text-slate-500 font-mono text-xs mt-2">{subMessage}</p>}
      </div>
    </div>
  );
}