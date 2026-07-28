import { Building2, Home } from 'lucide-react';

interface ScopeToggleProps {
  scope: 'city' | 'local';
  onChange: (scope: 'city' | 'local') => void;
}

export function ScopeToggle({ scope, onChange }: ScopeToggleProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-primary-900/40 border border-primary-800/80 rounded-xl p-4 shadow-lg">
      <div className="flex items-center gap-3">
        <span className="w-1.5 h-6 bg-accent-500 rounded-full" />
        <div>
          <h3 className="text-sm font-semibold text-primary-100">Jurisdictional Scope Filter</h3>
          <p className="text-xs text-primary-400">Displaying data matching chosen charter domain</p>
        </div>
      </div>

      <div className="inline-flex bg-primary-950/80 border border-primary-800 rounded-full p-1 self-start sm:self-auto shadow-inner relative">
        <button
          onClick={() => onChange('city')}
          className={`px-5 py-2 text-xs font-semibold rounded-full transition-all duration-300 flex items-center gap-2 select-none cursor-pointer ${
            scope === 'city'
              ? 'bg-primary-100 text-primary-950 font-bold shadow-md'
              : 'text-primary-400 hover:text-primary-200'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          Tampa City-Wide Mandates
        </button>
        <button
          onClick={() => onChange('local')}
          className={`px-5 py-2 text-xs font-semibold rounded-full transition-all duration-300 flex items-center gap-2 select-none cursor-pointer ${
            scope === 'local'
              ? 'bg-primary-100 text-primary-950 font-bold shadow-md'
              : 'text-primary-400 hover:text-primary-200'
          }`}
        >
          <Home className="w-3.5 h-3.5" />
          My Local Neighborhood
        </button>
      </div>
    </div>
  );
}
