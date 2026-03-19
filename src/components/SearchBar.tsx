import React from 'react';
import { Crosshair, Search, Activity } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  loading: boolean;
  placeholder: string;
  disabled?: boolean;
  ariaLabel?: string;
  maxLength?: number;
  className?: string;
}

export function SearchBar({
  value,
  onChange,
  onSearch,
  loading,
  placeholder,
  disabled,
  ariaLabel = "Search input",
  maxLength,
  className = "",
}: SearchBarProps) {
  return (
    <div className={`bg-slate-900/60 border border-cyan-500/20 p-2 rounded-2xl backdrop-blur-md shadow-[0_0_20px_rgba(6,182,212,0.05)] focus-within:shadow-[0_0_30px_rgba(6,182,212,0.15)] transition-all ${className}`}>
      <div className="relative flex items-center">
        <Crosshair className="absolute left-4 w-5 h-5 text-cyan-500/50" aria-hidden="true" />
        <input
          type="text"
          aria-label={ariaLabel}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSearch()}
          placeholder={placeholder}
          maxLength={maxLength}
          className="w-full bg-transparent pl-12 pr-16 py-4 text-xl font-mono text-cyan-400 focus:outline-none placeholder:text-slate-600 tracking-wider"
        />
        <button
          onClick={onSearch}
          aria-label="Execute Search"
          disabled={loading || disabled}
          className="absolute right-2 p-3 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-xl hover:bg-cyan-500 hover:text-white transition-all disabled:opacity-50"
        >
          {loading ? <Activity className="w-6 h-6 animate-spin" aria-hidden="true" /> : <Search className="w-6 h-6" aria-hidden="true" />}
        </button>
      </div>
    </div>
  );
}
