import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DatabaseStatusModal } from './DatabaseStatusModal';
import { supabase } from '../lib/supabase';
import * as supabaseLib from '../lib/supabase';

// Mock supabase client and configuration
vi.mock('../lib/supabase', () => ({
  isSupabaseConfigured: true,
  supabase: {
    from: vi.fn(),
  },
  dbFetchProposals: vi.fn(),
  dbInsertProposals: vi.fn(),
  dbInsertProposal: vi.fn(),
  dbFetchBallotSubmissions: vi.fn(),
  dbInsertBallotSubmissions: vi.fn(),
  dbInsertBallotSubmission: vi.fn(),
  dbResetVotingSubmissions: vi.fn(),
}));

describe('DatabaseStatusModal', () => {
  const onCloseMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // Assign navigator clipboard mock
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn(),
      },
    });
  });

  it('renders nothing if isOpen is false', () => {
    const { container } = render(<DatabaseStatusModal isOpen={false} onClose={onCloseMock} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders Setup Needed when not configured', () => {
    // Override read-only property for testing
    Object.defineProperty(supabaseLib, 'isSupabaseConfigured', { value: false });

    render(<DatabaseStatusModal isOpen={true} onClose={onCloseMock} />);

    expect(screen.getByText('Setup Needed')).toBeInTheDocument();
    expect(screen.getByText(/Supabase client is loaded in fallback mode/)).toBeInTheDocument();
  });

  it('tests connection and shows verified connected', async () => {
    Object.defineProperty(supabaseLib, 'isSupabaseConfigured', { value: true });

    const mockSelect = vi.fn().mockResolvedValue({
      count: 5,
      error: null
    });
    const mockFrom = vi.fn().mockReturnValue({ select: mockSelect });
    supabase.from = mockFrom as unknown as typeof supabase.from;

    render(<DatabaseStatusModal isOpen={true} onClose={onCloseMock} />);

    expect(screen.getByText('Configured')).toBeInTheDocument();

    // It should perform 2 selects (proposals and ballot_submissions)
    await waitFor(() => {
      expect(mockFrom).toHaveBeenCalledTimes(2);
      expect(mockFrom).toHaveBeenCalledWith('proposals');
      expect(mockFrom).toHaveBeenCalledWith('ballot_submissions');
    });

    await waitFor(() => {
      expect(screen.getByText('Verified Connected')).toBeInTheDocument();
    });

    expect(screen.getByText('Connection successful! Tables verified successfully.')).toBeInTheDocument();
    expect(screen.getByText('Proposals in DB: 5')).toBeInTheDocument();
    expect(screen.getByText('Submissions in DB: 5')).toBeInTheDocument();
  });

  it('tests connection and shows error for missing tables', async () => {
    Object.defineProperty(supabaseLib, 'isSupabaseConfigured', { value: true });

    const mockSelect = vi.fn().mockResolvedValue({
      count: 0,
      error: { message: 'relation "public.proposals" does not exist' }
    });
    const mockFrom = vi.fn().mockReturnValue({ select: mockSelect });
    supabase.from = mockFrom as unknown as typeof supabase.from;

    render(<DatabaseStatusModal isOpen={true} onClose={onCloseMock} />);

    await waitFor(() => {
      expect(screen.getByText('Verification Issue')).toBeInTheDocument();
    });

    expect(screen.getByText(/Database connected, but the required tables do not exist yet/)).toBeInTheDocument();
  });

  it('tests connection and shows general error', async () => {
    Object.defineProperty(supabaseLib, 'isSupabaseConfigured', { value: true });

    const mockSelect = vi.fn().mockResolvedValue({
      count: 0,
      error: { message: 'Some general database error' }
    });
    const mockFrom = vi.fn().mockReturnValue({ select: mockSelect });
    supabase.from = mockFrom as unknown as typeof supabase.from;

    render(<DatabaseStatusModal isOpen={true} onClose={onCloseMock} />);

    await waitFor(() => {
      expect(screen.getByText('Verification Issue')).toBeInTheDocument();
    });

    expect(screen.getByText(/Connection failed: Some general database error/)).toBeInTheDocument();
  });

  it('calls navigator.clipboard.writeText on copy', async () => {
    Object.defineProperty(supabaseLib, 'isSupabaseConfigured', { value: false });

    render(<DatabaseStatusModal isOpen={true} onClose={onCloseMock} />);

    const copyButton = screen.getByRole('button', { name: /Copy SQL/i });
    await userEvent.click(copyButton);

    expect(navigator.clipboard.writeText).toHaveBeenCalledTimes(1);
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(expect.stringContaining('CREATE TABLE IF NOT EXISTS proposals'));

    // Check that button text changes
    expect(screen.getByText('Copied!')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', async () => {
    render(<DatabaseStatusModal isOpen={true} onClose={onCloseMock} />);

    // The "Close Manager" button is typically the last one or by text
    const closeManagerButton = screen.getByRole('button', { name: /Close Manager/i });
    await userEvent.click(closeManagerButton);

    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });
});
