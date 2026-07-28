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

describe('supabase client configuration security', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
  });

  it('should configure correctly with a standard anon key', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', 'https://mock.supabase.co');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxMjM0NTY3ODkwLCJleHAiOjEyMzQ1Njc4OTB9.xxx');

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { isSupabaseConfigured } = await import('./supabase');

    expect(isSupabaseConfigured).toBe(true);
    expect(consoleErrorSpy).not.toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });

  it('should disable client and log error when a service_role key is used', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', 'https://mock.supabase.co');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic2VydmljZV9yb2xlIiwiaXNzIjoic3VwYWJhc2UiLCJpYXQiOjEyMzQ1Njc4OTAsImV4cCI6MTIzNDU2Nzg5MH0.xxx');

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { isSupabaseConfigured } = await import('./supabase');

    expect(isSupabaseConfigured).toBe(false);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'CRITICAL SECURITY ERROR: VITE_SUPABASE_ANON_KEY is a service_role key. This is a severe security risk and will expose your entire database. The Supabase client has been disabled.'
    );

    consoleErrorSpy.mockRestore();
  });
});
