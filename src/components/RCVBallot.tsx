import { useState, useMemo } from 'react';
import type { BallotOption, BallotSubmission, RCVResult, TestAccount } from '../types';
import { calculateRCVResult } from '../lib/rcvCalculation';

interface VotingPageProps {
  ballotOptions: BallotOption[];
  submissions: BallotSubmission[];
  testAccounts: TestAccount[];
  rcvResult: RCVResult | null;
  onSubmitBallot: (submission: Omit<BallotSubmission, 'submittedAt'>) => void;
  onRunSimulation: () => void;
  onGenerateMockVotes: (count: number) => void;
  onResetVoting: () => void;
}

export function VotingPage({
  ballotOptions,
  submissions,
  testAccounts,
  rcvResult,
  onSubmitBallot,
  onRunSimulation,
  onGenerateMockVotes,
  onResetVoting,
}: VotingPageProps) {
  const [rankings, setRankings] = useState<RankedItem[]>([]);
  const BUDGET_CAP = 5000000;

  const cumulativeCost = useMemo(() => {
    return rankings.reduce((sum, item) => {
      const option = ballotOptions.find(o => o.id === item.optionId);
      return sum + (option?.budget || 0);
    }, 0);
  }, [rankings, ballotOptions]);

  const percentage = (cumulativeCost / BUDGET_CAP) * 100;
  const barWidth = Math.min(percentage, 100);

  const [writeIn, setWriteIn] = useState('');
  const [showWriteInInput, setShowWriteInInput] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationRound, setSimulationRound] = useState(0);

  const testAccountsMap = useMemo(() => {
    const map = new Map<string, TestAccount>();
    for (const acc of testAccounts) {
      map.set(acc.id, acc);
    }
    return map;
  }, [testAccounts]);

  const ballotOptionsMap = useMemo(() => {
    const map = new Map<string, BallotOption>();
    for (const opt of ballotOptions) {
      map.set(opt.id, opt);
    }
    return map;
  }, [ballotOptions]);

  const handleSubmit = () => {
    onSubmitBallot({
      voterId: 'CITIZEN-2024-01337',
      rankings: rankings.map(r => ({ optionId: r.optionId, rank: r.rank })),
      writeIn: writeIn || undefined,
    });
    setRankings([]);
    setWriteIn('');
    setShowWriteInInput(false);
  };

  const handleRank = (optionId: string, newRank: number) => {
    setRankings(prev => {
      const existing = prev.find(r => r.optionId === optionId);
      if (existing) {
        if (newRank === 0) {
          return prev.filter(r => r.optionId !== optionId);
        }
        // Shift others down
        const others = prev.filter(r => r.optionId !== optionId);
        const shifted = others.map(r => ({
          ...r,
          rank: r.rank >= newRank ? r.rank + 1 : r.rank,
        }));
        return [...shifted, { optionId, rank: newRank }].sort((a, b) => a.rank - b.rank);
      }
      return [...prev, { optionId, rank: newRank }].sort((a, b) => a.rank - b.rank);
    });
  };

  const getRank = (optionId: string) => rankings.find(r => r.optionId === optionId)?.rank || 0;

  const handleRunSimulation = async () => {
    setIsSimulating(true);
    setSimulationRound(0);
    onRunSimulation();

    // Animate through rounds
    const result = calculateRCVResult(ballotOptions, submissions);
    for (let i = 0; i < result.rounds.length; i++) {
      await new Promise(r => setTimeout(r, 1000));
      setSimulationRound(i + 1);
    }
    setIsSimulating(false);
  };

  const votedCount = submissions.length;
  const totalVoters = testAccounts.length + 1;
  const participationRate = (votedCount / totalVoters) * 100;

  const optionsMap = useMemo(
    () => new Map(ballotOptions.map(o => [o.id, o])),
    [ballotOptions]
  );
  const accountsMap = useMemo(
    () => new Map(testAccounts.map(a => [a.id, a])),
    [testAccounts]
  );

  return (
    <div className="p-8 space-y-8">
      <BudgetAllocationBar
        cumulativeCost={cumulativeCost}
        percentage={percentage}
        barWidth={barWidth}
        BUDGET_CAP={BUDGET_CAP}
      />

      {/* Header */}
      <VotingHeader
        isSimulating={isSimulating}
        submissionsCount={submissions.length}
        onGenerateMockVotes={onGenerateMockVotes}
        handleRunSimulation={handleRunSimulation}
        onResetVoting={onResetVoting}
      />

      {/* Stats */}
      <VotingStats
        votedCount={votedCount}
        totalVoters={totalVoters}
        participationRate={participationRate}
        activeOptionsCount={ballotOptions.length}
      />

      {/* Ballot Interface */}
      <div className="grid grid-cols-2 gap-6">
        {/* Ballot */}
        <BallotCard
          ballotOptions={ballotOptions}
          rankings={rankings}
          handleRank={handleRank}
          writeIn={writeIn}
          showWriteInInput={showWriteInInput}
          setWriteIn={setWriteIn}
          setShowWriteInInput={setShowWriteInInput}
          handleSubmit={handleSubmit}
          getRank={getRank}
        />

        {/* RCV Results / Simulation */}
        <RunoffTally
          rcvResult={rcvResult}
          simulationRound={simulationRound}
          optionsMap={optionsMap}
        />
      </div>

      {/* Recent Submissions */}
      <RecentSubmissionsTable
        submissions={submissions}
        testAccountsMap={testAccountsMap}
        accountsMap={accountsMap}
        ballotOptionsMap={ballotOptionsMap}
        optionsMap={optionsMap}
      />
    </div>
  );
}
