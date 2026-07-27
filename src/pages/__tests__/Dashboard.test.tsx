import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { Dashboard } from '../Dashboard';
import type { AppState } from '../../types';

describe('Dashboard Component', () => {
  const mockNavigate = vi.fn();

  const getBaseState = (): AppState => ({
    currentPage: '/dashboard',
    identity: {
      citizenId: 'CIT-1234',
      status: 'active',
      verificationStep: 'complete',
      passportVerified: true,
      utilityVerified: true,
      vouchTokens: [],
      fraudStrikes: 0,
      isVouchingFor: [],
      createdAt: new Date('2024-01-01'),
    },
    proposals: [
      {
        id: 'prop-1',
        title: 'Proposal 1',
        content: 'Content 1',
        tier: 'law1_shield',
        submittedBy: 'CIT-1234',
        submittedAt: new Date(),
        status: 'draft'
      }
    ],
    ballotOptions: [
      { id: 'opt-1', title: 'Option 1', description: 'Desc 1', budget: 1000, category: 'infrastructure', voteCount: 0, isWriteIn: false },
      { id: 'opt-2', title: 'Option 2', description: 'Desc 2', budget: 1000, category: 'education', voteCount: 0, isWriteIn: false },
      { id: 'opt-3', title: 'Option 3', description: 'Desc 3', budget: 1000, category: 'safety', voteCount: 0, isWriteIn: false },
      { id: 'opt-5', title: 'Option 5', description: 'Desc 5', budget: 1000, category: 'environment', voteCount: 0, isWriteIn: false },
    ],
    ballotSubmissions: [
      {
        voterId: 'CIT-1234',
        rankings: [{ optionId: 'opt-1', rank: 1 }],
        submittedAt: new Date()
      }
    ],
    testAccounts: [
      { id: 'test-1', name: 'Test 1', isBot: false, hasVoted: false, writeIns: [] },
      { id: 'test-2', name: 'Test 2', isBot: false, hasVoted: true, writeIns: [] },
      { id: 'test-3', name: 'Test 3', isBot: false, hasVoted: false, writeIns: [] },
      { id: 'test-4', name: 'Test 4', isBot: false, hasVoted: true, writeIns: [] },
      { id: 'test-5', name: 'Test 5', isBot: false, hasVoted: false, writeIns: [] },
      { id: 'test-6', name: 'Test 6', isBot: false, hasVoted: true, writeIns: [] },
      { id: 'test-7', name: 'Test 7', isBot: false, hasVoted: false, writeIns: [] },
      { id: 'test-8', name: 'Test 8', isBot: false, hasVoted: true, writeIns: [] },
      { id: 'test-9', name: 'Test 9', isBot: false, hasVoted: false, writeIns: [] }
    ],
    rcvResult: null,
    calendarEvents: [
      { id: 'evt-1', title: 'February 2024 Budget Initiative', date: new Date(), type: 'voting' }
    ],
  });

  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('renders dashboard with current cycle name', () => {
    render(<Dashboard state={getBaseState()} onNavigate={mockNavigate} />);
    expect(screen.getAllByText('February 2024 Budget Initiative').length).toBeGreaterThan(0);
  });

  it('toggles jurisdictional scope filter', () => {
    render(<Dashboard state={getBaseState()} onNavigate={mockNavigate} />);

    const cityButton = screen.getByText('Tampa City-Wide Mandates');
    const localButton = screen.getByText('My Local Neighborhood');

    // Default is city
    expect(cityButton).toHaveClass('bg-primary-100');
    expect(localButton).toHaveClass('text-primary-400');

    // Click local
    fireEvent.click(localButton);
    expect(localButton).toHaveClass('bg-primary-100');
    expect(cityButton).toHaveClass('text-primary-400');
  });

  it('calculates participation rate correctly with submissions', () => {
    const state = getBaseState();
    render(<Dashboard state={state} onNavigate={mockNavigate} />);

    // Total accounts = 9 (testAccounts) + 1 (user) = 10
    // Total submissions = 1
    // Rate = (1 / 10) * 100 = 10.0%
    expect(screen.getByText('10.0% participation rate')).toBeInTheDocument();
  });

  it('calculates participation rate correctly with zero submissions', () => {
    const state = getBaseState();
    state.ballotSubmissions = []; // zero submissions
    render(<Dashboard state={state} onNavigate={mockNavigate} />);

    // Rate should be "0.0"
    expect(screen.getByText('0.0% participation rate')).toBeInTheDocument();
  });
});
