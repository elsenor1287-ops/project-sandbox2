import { render, screen, act, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { LandingPage } from './LandingPage';

describe('LandingPage', () => {
  const mockOnEnterDashboard = vi.fn();

  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('renders initial state with the verification button', () => {
    render(<LandingPage onEnterDashboard={mockOnEnterDashboard} />);

    expect(screen.getByText('Civic Authentication Portal')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Verify Sovereign Identity/i })
    ).toBeInTheDocument();
  });

  it('progresses through verification steps and shows welcome panel', () => {
    render(<LandingPage onEnterDashboard={mockOnEnterDashboard} />);

    const verifyButton = screen.getByRole('button', { name: /Verify Sovereign Identity/i });

    act(() => {
      fireEvent.click(verifyButton);
    });

    // Initial scanning state
    expect(screen.getByText('Awaiting Hardware Biometric Scan...')).toBeInTheDocument();

    // Advance to 1.5s
    act(() => {
      vi.advanceTimersByTime(1500);
    });
    expect(screen.getByText('Hardware Verified')).toBeInTheDocument();
    expect(screen.getByText('Verifying Local Jurisdiction Credential...')).toBeInTheDocument();

    // Advance to 3s
    act(() => {
      vi.advanceTimersByTime(1500);
    });
    expect(screen.getByText('Jurisdiction Confirmed')).toBeInTheDocument();
    expect(screen.getByText('Syncing Peer-Vouch Network...')).toBeInTheDocument();

    // Advance to 4.5s
    act(() => {
      vi.advanceTimersByTime(1500);
    });
    expect(screen.getByText('Network Synced')).toBeInTheDocument();

    // Advance to 5.2s + 500ms
    act(() => {
      vi.advanceTimersByTime(1200);
    });

    expect(screen.getByText('Identity Verified.')).toBeInTheDocument();
    expect(screen.getByText('Welcome to the Sandbox.')).toBeInTheDocument();

    // Click Enter Dashboard
    const enterButton = screen.getByRole('button', { name: /Enter Voting Dashboard/i });
    act(() => {
      fireEvent.click(enterButton);
    });

    expect(mockOnEnterDashboard).toHaveBeenCalledTimes(1);
  });
});
