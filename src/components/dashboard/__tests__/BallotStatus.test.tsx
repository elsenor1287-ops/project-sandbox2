import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { BallotStatus } from '../BallotStatus';
import type { AppState, BallotOption, BallotSubmission } from '../../../types';

describe('BallotStatus Component', () => {
  const mockNavigate = vi.fn();

  const mockBallotOptions: BallotOption[] = [
    { id: 'opt-1', title: 'Infrastructure Upgrade', description: 'Desc 1', budget: 1000, category: 'infrastructure', voteCount: 0, isWriteIn: false },
    { id: 'opt-2', title: 'Education Grant', description: 'Desc 2', budget: 1000, category: 'education', voteCount: 0, isWriteIn: false },
    { id: 'opt-3', title: 'Safety Protocol', description: 'Desc 3', budget: 1000, category: 'safety', voteCount: 0, isWriteIn: false },
    { id: 'opt-4', title: 'Environmental Protection', description: 'Desc 4', budget: 1000, category: 'environment', voteCount: 0, isWriteIn: false },
    { id: 'opt-5', title: 'Extra Option', description: 'Desc 5', budget: 1000, category: 'other', voteCount: 0, isWriteIn: false },
  ];

  const mockBallotSubmissions: BallotSubmission[] = [
    {
      voterId: 'voter-1',
      rankings: [{ optionId: 'opt-1', rank: 1 }, { optionId: 'opt-2', rank: 2 }],
      submittedAt: new Date()
    },
    {
      voterId: 'voter-2',
      rankings: [{ optionId: 'opt-1', rank: 1 }, { optionId: 'opt-3', rank: 2 }],
      submittedAt: new Date()
    },
    {
      voterId: 'voter-3',
      rankings: [{ optionId: 'opt-2', rank: 1 }],
      submittedAt: new Date()
    },
    {
      voterId: 'voter-4',
      rankings: [{ optionId: 'opt-3', rank: 1 }],
      submittedAt: new Date()
    }
  ];

  const mockRcvResult: AppState['rcvResult'] = {
    rounds: [],
    winner: mockBallotOptions[0],
    totalVotes: 4,
    completedAt: new Date()
  };

  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('renders the title and the View Ballot button correctly', () => {
    render(
      <BallotStatus
        rcvResult={null}
        ballotOptions={mockBallotOptions}
        ballotSubmissions={[]}
        onNavigate={mockNavigate}
      />
    );

    expect(screen.getByText('Current RCV Ballot Status')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /view ballot/i })).toBeInTheDocument();
  });

  it('handles clicking on View Ballot and triggers onNavigate', () => {
    render(
      <BallotStatus
        rcvResult={null}
        ballotOptions={mockBallotOptions}
        ballotSubmissions={[]}
        onNavigate={mockNavigate}
      />
    );

    const button = screen.getByRole('button', { name: /view ballot/i });
    fireEvent.click(button);

    expect(mockNavigate).toHaveBeenCalledWith('/vote');
    expect(mockNavigate).toHaveBeenCalledTimes(1);
  });

  it('renders No RCV tally run yet when rcvResult is null', () => {
    render(
      <BallotStatus
        rcvResult={null}
        ballotOptions={mockBallotOptions}
        ballotSubmissions={[]}
        onNavigate={mockNavigate}
      />
    );

    expect(screen.getByText('No RCV tally run yet')).toBeInTheDocument();
    expect(screen.getByText('Submit votes and run the simulation')).toBeInTheDocument();
  });

  it('renders the current leader when rcvResult is provided', () => {
    render(
      <BallotStatus
        rcvResult={mockRcvResult}
        ballotOptions={mockBallotOptions}
        ballotSubmissions={mockBallotSubmissions}
        onNavigate={mockNavigate}
      />
    );

    expect(screen.getByText('Current Leader')).toBeInTheDocument();
    // It will be present twice: once in the leader card, once in the options list.
    expect(screen.getAllByText('Infrastructure Upgrade').length).toBeGreaterThan(0);
    expect(screen.queryByText('No RCV tally run yet')).not.toBeInTheDocument();
  });

  it('renders the first 4 ballot options and their vote percentages based on firstChoiceCounts', () => {
    render(
      <BallotStatus
        rcvResult={null}
        ballotOptions={mockBallotOptions}
        ballotSubmissions={mockBallotSubmissions}
        onNavigate={mockNavigate}
      />
    );

    // opt-1: 2 votes -> 50%
    expect(screen.getByText('Infrastructure Upgrade')).toBeInTheDocument();
    expect(screen.getByText('50%')).toBeInTheDocument();
    expect(screen.getByText('2 first-choice votes')).toBeInTheDocument();

    // opt-2: 1 vote -> 25%
    expect(screen.getByText('Education Grant')).toBeInTheDocument();
    // Since opt-3 also has 1 vote (25%), there are two "25%" and two "1 first-choice votes".
    expect(screen.getAllByText('25%')).toHaveLength(2);
    expect(screen.getAllByText('1 first-choice votes')).toHaveLength(2);

    // opt-3: 1 vote -> 25%
    expect(screen.getByText('Safety Protocol')).toBeInTheDocument();

    // opt-4: 0 votes -> 0%
    expect(screen.getByText('Environmental Protection')).toBeInTheDocument();
    expect(screen.getByText('0%')).toBeInTheDocument();
    expect(screen.getByText('0 first-choice votes')).toBeInTheDocument();

    // opt-5 should not be rendered (only first 4)
    expect(screen.queryByText('Extra Option')).not.toBeInTheDocument();
  });

  it('handles zero ballotSubmissions gracefully (0% for options)', () => {
    render(
      <BallotStatus
        rcvResult={null}
        ballotOptions={mockBallotOptions}
        ballotSubmissions={[]}
        onNavigate={mockNavigate}
      />
    );

    // opt-1
    expect(screen.getByText('Infrastructure Upgrade')).toBeInTheDocument();
    expect(screen.getAllByText('0%')).toHaveLength(4);
    expect(screen.getAllByText('0 first-choice votes')).toHaveLength(4);
  });
});
