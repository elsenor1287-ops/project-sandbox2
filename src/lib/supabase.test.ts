import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Proposal } from '../types';

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(),
  })),
}));

// We'll reset modules before each test to ensure env vars take effect
beforeEach(() => {
  vi.resetModules();
});

describe('dbInsertProposal', () => {
  const mockProposal: Proposal = {
    id: 'prop-1',
    title: 'Test Proposal',
    content: 'Test Content',
    tier: 'law2_sandbox',
    submittedBy: 'user-1',
    submittedAt: new Date('2024-01-01T00:00:00Z'),
    status: 'draft',
    vetoReason: undefined,
    triggeredKeywords: undefined,
  };

  it('successfully inserts a proposal', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', 'https://test.supabase.co');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'test-key');

    const { dbInsertProposal, supabase } = await import('./supabase');

    const mockInsert = vi.fn().mockResolvedValue({ error: null });
    vi.mocked(supabase.from).mockReturnValue({
      insert: mockInsert
    } as any);

    const result = await dbInsertProposal(mockProposal);

    expect(result).toBe(true);
    expect(supabase.from).toHaveBeenCalledWith('proposals');
    expect(mockInsert).toHaveBeenCalledWith([{
      id: mockProposal.id,
      title: mockProposal.title,
      content: mockProposal.content,
      tier: mockProposal.tier,
      submitted_by: mockProposal.submittedBy,
      submitted_at: mockProposal.submittedAt.toISOString(),
      status: mockProposal.status,
      veto_reason: null,
      triggered_keywords: null,
    }]);
  });

  it('handles insert error', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', 'https://test.supabase.co');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'test-key');
    const { dbInsertProposal, supabase } = await import('./supabase');

    const mockError = new Error('Insert failed');
    const mockInsert = vi.fn().mockResolvedValue({ error: mockError });
    vi.mocked(supabase.from).mockReturnValue({
      insert: mockInsert
    } as any);

    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const result = await dbInsertProposal(mockProposal);

    expect(result).toBe(false);
    expect(warnSpy).toHaveBeenCalledWith('Supabase insert proposal error:', mockError.message);
    warnSpy.mockRestore();
  });

  it('handles unexpected error', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', 'https://test.supabase.co');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'test-key');
    const { dbInsertProposal, supabase } = await import('./supabase');

    const mockError = new Error('Unexpected error');
    const mockInsert = vi.fn().mockRejectedValue(mockError);
    vi.mocked(supabase.from).mockReturnValue({
      insert: mockInsert
    } as any);

    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const result = await dbInsertProposal(mockProposal);

    expect(result).toBe(false);
    expect(errorSpy).toHaveBeenCalledWith('Failed to insert proposal:', mockError);
    errorSpy.mockRestore();
  });

  it('returns false when not configured', async () => {
    vi.unstubAllEnvs(); // Clear env vars
    const { dbInsertProposal } = await import('./supabase');

    const result = await dbInsertProposal(mockProposal);

    expect(result).toBe(false);
  });
});
