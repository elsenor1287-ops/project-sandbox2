import re

content = open('src/components/DatabaseStatusModal.tsx').read()
# We will just remove the entire merged block that's messed up
# Let's inspect the lines that are causing errors.
content = content.replace('''<<<<<<< HEAD
        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {/* Status Panel */}
          <div className={`card p-5 border ${isSupabaseConfigured ? 'border-success-500/20 bg-success-950/5' : 'border-warning-500/20 bg-warning-950/5'} space-y-4`}>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-sm font-semibold text-primary-100">Integration Configuration</h3>
                <p className="text-xs text-primary-400 mt-0.5">
                  Connected endpoint: <code className="text-primary-300 font-mono text-xs break-all">{import.meta.env.VITE_SUPABASE_URL || 'Not configured'}</code>
                </p>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-primary-950 border border-primary-700">
                <span className={`w-2 h-2 rounded-full ${isSupabaseConfigured ? 'bg-success-400 animate-pulse' : 'bg-warning-400'}`} />
                <span className={isSupabaseConfigured ? 'text-success-400' : 'text-warning-400'}>
                  {isSupabaseConfigured ? 'Configured' : 'Setup Needed'}
                </span>
              </div>
            </div>

  const handleCopy = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SETUP);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
=======
        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {/* Status Panel */}
          <div className={`card p-5 border ${isSupabaseConfigured ? 'border-success-500/20 bg-success-950/5' : 'border-warning-500/20 bg-warning-950/5'} space-y-4`}>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-sm font-semibold text-primary-100">Integration Configuration</h3>
                <p className="text-xs text-primary-400 mt-0.5">
                  Connected endpoint: <code className="text-primary-300 font-mono text-xs break-all">{import.meta.env.VITE_SUPABASE_URL || 'Not configured'}</code>
                </p>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-primary-950 border border-primary-700">
                <span className={`w-2 h-2 rounded-full ${isSupabaseConfigured ? 'bg-success-400 animate-pulse' : 'bg-warning-400'}`} />
                <span className={isSupabaseConfigured ? 'text-success-400' : 'text-warning-400'}>
                  {isSupabaseConfigured ? 'Configured' : 'Setup Needed'}
                </span>
              </div>
            </div>

  const handleCopy = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SETUP);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
>>>>>>>''', '')
with open('src/components/DatabaseStatusModal.tsx', 'w') as f:
    f.write(content)
