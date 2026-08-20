import { useState, useCallback } from 'react';
import type { AppState, PageRoute } from '../types';
import { MOCK_CALENDAR_EVENTS } from '../data/mockData';
import { useIdentity } from './useIdentity';
import { useProposals } from './useProposals';
import { useBallotState, calculateRCVResult } from './useBallotState';

export function useAppState() {
  const [currentPage, setCurrentPage] = useState<PageRoute>('/dashboard');

  const {
    identity,
    completeVerificationStep,
    addVouchToken,
    triggerFraudStrike,
    freezeAccount,
    resetIdentity
  } = useIdentity();

  const {
    proposals,
    checkLaw1Violations,
    submitProposal
  } = useProposals();

  const {
    ballotOptions,
    ballotSubmissions,
    testAccounts,
    rcvResult,
    submitBallot,
    runRCVSimulation,
    generateMockVotes,
    resetVoting
  } = useBallotState();

  const state: AppState = {
    currentPage,
    identity,
    proposals,
    ballotOptions,
    ballotSubmissions,
    testAccounts,
    rcvResult,
    calendarEvents: MOCK_CALENDAR_EVENTS,
  };

  const handleSetCurrentPage = useCallback((page: PageRoute) => {
    setCurrentPage(page);
  }, []);

  return {
    state,
    setCurrentPage: handleSetCurrentPage,
    completeVerificationStep,
    addVouchToken,
    triggerFraudStrike,
    freezeAccount,
    resetIdentity,
    checkLaw1Violations,
    submitProposal,
    submitBallot,
    runRCVSimulation,
    generateMockVotes,
    resetVoting,
  };
}

export { calculateRCVResult };
