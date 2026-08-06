import { Users, Play, RotateCcw } from 'lucide-react';

export function VotingHeader({
  isSimulating,
  submissionsCount,
  onGenerateMockVotes,
  handleRunSimulation,
  onResetVoting,
}: {
  isSimulating: boolean;
  submissionsCount: number;
  onGenerateMockVotes: (count: number) => void;
  handleRunSimulation: () => void;
  onResetVoting: () => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-gradient">RCV Sandbox</h1>
        <p className="text-primary-400 mt-1">Month 2024-02 Instant Runoff Ballot</p>
      </div>
      <div className="flex gap-3">
        <button
          onClick={() => onGenerateMockVotes(5)}
          className="btn-secondary"
          disabled={isSimulating}
        >
          <Users className="w-4 h-4" />
          Add 5 Mock Votes
        </button>
        <button
          onClick={handleRunSimulation}
          className="btn-primary"
          disabled={submissionsCount === 0 || isSimulating}
        >
          <Play className="w-4 h-4" />
          {isSimulating ? 'Simulating...' : 'Run RCV Tally'}
        </button>
        <button onClick={onResetVoting} className="btn-ghost" disabled={isSimulating}>
          <RotateCcw className="w-4 h-4" />
          Reset
        </button>
      </div>
    </div>
  );
}
