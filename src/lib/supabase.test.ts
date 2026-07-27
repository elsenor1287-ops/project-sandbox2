import { describe, it, expect, vi, beforeEach } from 'vitest';

// Create mock functions for the chained Supabase calls
const mockNeq = vi.fn();
const mockDelete = vi.fn(() => ({ neq: mockNeq }));
const mockFrom = vi.fn(() => ({ delete: mockDelete }));

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: mockFrom,
  })),
}));

describe('dbResetVotingSubmissions', () => {
  let dbResetVotingSubmissions: typeof import("./supabase").dbResetVotingSubmissions;

  beforeEach(async () => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  const setupSupabaseEnv = (configured: boolean) => {
    if (configured) {
      vi.stubEnv('VITE_SUPABASE_URL', 'http://localhost');
      vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'valid-key');
    } else {
      vi.stubEnv('VITE_SUPABASE_URL', '');
      vi.stubEnv('VITE_SUPABASE_ANON_KEY', '');
    }
  };

  it('should return false if Supabase is not configured', async () => {
    setupSupabaseEnv(false);
    const mod = await import('./supabase');
    dbResetVotingSubmissions = mod.dbResetVotingSubmissions;

    const result = await dbResetVotingSubmissions();

    expect(result).toBe(false);
    expect(mockFrom).not.toHaveBeenCalled();
  });

  it('should return true and call supabase methods correctly on success', async () => {
    setupSupabaseEnv(true);
    const mod = await import('./supabase');
    dbResetVotingSubmissions = mod.dbResetVotingSubmissions;

    mockNeq.mockResolvedValueOnce({ error: null });

    const result = await dbResetVotingSubmissions();

    expect(result).toBe(true);
    expect(mockFrom).toHaveBeenCalledWith('ballot_submissions');
    expect(mockDelete).toHaveBeenCalled();
    expect(mockNeq).toHaveBeenCalledWith('voter_id', '');
  });

  it('should return false and warn if Supabase returns an error', async () => {
    setupSupabaseEnv(true);
    const mod = await import('./supabase');
    dbResetVotingSubmissions = mod.dbResetVotingSubmissions;

    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const errorMessage = 'Something went wrong';
    mockNeq.mockResolvedValueOnce({ error: { message: errorMessage } });

    const result = await dbResetVotingSubmissions();

    expect(result).toBe(false);
    expect(consoleWarnSpy).toHaveBeenCalledWith('Supabase reset submissions error:', errorMessage);

    consoleWarnSpy.mockRestore();
  });

  it('should return false and log error if an exception is thrown', async () => {
    setupSupabaseEnv(true);
    const mod = await import('./supabase');
    dbResetVotingSubmissions = mod.dbResetVotingSubmissions;

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const error = new Error('Network failure');
    mockNeq.mockRejectedValueOnce(error);

    const result = await dbResetVotingSubmissions();

    expect(result).toBe(false);
    expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to reset submissions:', error);

    consoleErrorSpy.mockRestore();
  });
});
