import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('supabase dbFetchProposals error handling', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
  });

  it('should return null and log error when dbFetchProposals throws an exception', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', 'https://mock.supabase.co');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'mock_key');

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { dbFetchProposals, supabase, isSupabaseConfigured } = await import('./supabase');

    expect(isSupabaseConfigured).toBe(true);

    // Mock supabase.from to throw an error
    vi.spyOn(supabase, 'from').mockImplementation(() => {
      throw new Error('Forced Supabase Exception');
    });

    const result = await dbFetchProposals();

    expect(result).toBeNull();
    expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to fetch proposals:', expect.any(Error));
    expect(consoleErrorSpy.mock.calls[0][1].message).toBe('Forced Supabase Exception');

    consoleErrorSpy.mockRestore();
  });
});
