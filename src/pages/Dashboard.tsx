import { useState, useMemo } from 'react';
import type { AppState } from '../types';
import { ScopeToggle } from '../components/dashboard/ScopeToggle';
import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { DashboardStats } from '../components/dashboard/DashboardStats';
import { CycleTimeline } from '../components/dashboard/CycleTimeline';
import { BallotStatus } from '../components/dashboard/BallotStatus';
import { IdentityQuickView } from '../components/dashboard/IdentityQuickView';
import { ProposalActivity } from '../components/dashboard/ProposalActivity';
import { NetworkStats } from '../components/dashboard/NetworkStats';

interface DashboardProps {
  state: AppState;
  onNavigate: (page: AppState['currentPage']) => void;
}

function getFilteredBallotOptions(ballotOptions: AppState['ballotOptions'], scope: 'city' | 'local') {
  if (scope === 'city') {
    return ballotOptions.filter(o => o.id === 'opt-1' || o.id === 'opt-2' || o.id === 'opt-5');
  } else {
    return ballotOptions.filter(o => o.id === 'opt-3' || o.id === 'opt-4' || o.id === 'opt-6' || o.isWriteIn);
  }
}

function getCurrentCycle(state: AppState) {
  const currentCycleName = state.calendarEvents.find(e => e.type === 'voting')?.title || 'No Active Cycle';
  return {
    name: currentCycleName,
    startDate: new Date('2024-02-01'),
    endDate: new Date('2024-02-28'),
    ballotStatus: state.ballotSubmissions.length > 0 ? 'active' : 'pending',
    proposals: state.proposals.length,
    votes: state.ballotSubmissions.length,
  };
}

function getDaysRemaining(endDate: Date) {
  return Math.max(
    0,
    Math.ceil((endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  );
}

function getParticipationRate(submissionsCount: number, testAccountsCount: number) {
  return submissionsCount > 0
    ? ((submissionsCount / (testAccountsCount + 1)) * 100).toFixed(1)
    : '0.0';
}

export function Dashboard({ state, onNavigate }: DashboardProps) {
  const { identity, ballotOptions, ballotSubmissions, proposals, calendarEvents, rcvResult } = state;
  const [scope, setScope] = useState<'city' | 'local'>('city');

  const filteredBallotOptions = useMemo(() => getFilteredBallotOptions(ballotOptions, scope), [ballotOptions, scope]);

  const currentCycle = getCurrentCycle(state);
  const daysRemaining = getDaysRemaining(currentCycle.endDate);
  const participationRate = getParticipationRate(ballotSubmissions.length, state.testAccounts.length);

  return (
    <div className="p-8 space-y-8">
      <DashboardHeader currentCycleName={currentCycle.name} />

      <ScopeToggle scope={scope} onChange={setScope} />

      <DashboardStats
        identity={identity}
        ballotSubmissions={ballotSubmissions}
        proposals={proposals}
        ballotOptions={filteredBallotOptions}
        daysRemaining={daysRemaining}
        participationRate={participationRate}
        onNavigate={onNavigate}
      />

      {/* Main Content Grid */}
      <div className="grid grid-cols-3 gap-6">
        <CycleTimeline calendarEvents={calendarEvents} />

        <BallotStatus
          rcvResult={rcvResult}
          ballotOptions={filteredBallotOptions}
          ballotSubmissions={ballotSubmissions}
          onNavigate={onNavigate}
        />
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-3 gap-6">
        <IdentityQuickView identity={identity} onNavigate={onNavigate} />

        <ProposalActivity proposals={proposals} onNavigate={onNavigate} />

        <NetworkStats />
      </div>
    </div>
  );
}
