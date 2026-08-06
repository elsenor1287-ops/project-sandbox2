import type { BallotOption, BallotSubmission, RCVResult } from '../../types';

// RCV Calculation function for simulation
export function calculateRCVResult(
  options: BallotOption[],
  submissions: BallotSubmission[]
): RCVResult {
  const rounds: { roundNumber: number; eliminatedOptionId?: string; voteDistribution: Record<string, number>; threshold: number; winner?: string; totalVotes: number }[] = [];
  let currentOptions = [...options];
  const optionsMap = new Map(options.map(opt => [opt.id, opt]));
  let currentRankings = submissions.map(sub => [...sub.rankings].sort((a, b) => a.rank - b.rank));

  const totalVotes = submissions.length;
  const threshold = totalVotes / 2;

  let roundNumber = 0;
  let winner: BallotOption | undefined;

  while (!winner && currentOptions.length > 1 && roundNumber < 10) {
    roundNumber++;

    const voteDistribution: Record<string, number> = {};
    currentOptions.forEach(opt => voteDistribution[opt.id] = 0);

    currentRankings.forEach(rankings => {
      const firstChoice = rankings[0];
      if (firstChoice && Object.prototype.hasOwnProperty.call(voteDistribution, firstChoice.optionId)) {
        voteDistribution[firstChoice.optionId]++;
      }
    });

    let maxVotes = -Infinity;
    let minVotes = Infinity;
    let winnerId: string | undefined;
    let loserId: string | undefined;

    for (const id in voteDistribution) {
      const votes = voteDistribution[id];
      if (votes > maxVotes) {
        maxVotes = votes;
        winnerId = id;
      }
      if (votes < minVotes) {
        minVotes = votes;
        loserId = id;
      }
    }

    if (maxVotes > threshold) {
      winner = winnerId ? optionsMap.get(winnerId) : undefined;
      rounds.push({ roundNumber, voteDistribution, threshold, winner: winnerId, totalVotes });
      break;
    }

    currentOptions = currentOptions.filter(opt => opt.id !== loserId);
    const currentOptionIds = new Set(currentOptions.map(opt => opt.id));
    currentRankings = currentRankings.map(rankings =>
      rankings.filter(r => currentOptionIds.has(r.optionId))
    );

    rounds.push({ roundNumber, eliminatedOptionId: loserId, voteDistribution, threshold, totalVotes });
  }

  if (!winner) winner = currentOptions[0];

  return { rounds, winner: winner!, totalVotes, completedAt: new Date() };
}
