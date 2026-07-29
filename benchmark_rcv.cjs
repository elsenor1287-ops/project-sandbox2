const { performance } = require('perf_hooks');

const ballotOptions = Array.from({ length: 100 }, (_, i) => ({
  id: `opt-${i}`,
  title: `Option ${i}`,
  description: `Description ${i}`,
  budget: 1000,
  category: 'Test'
}));

const submissions = Array.from({ length: 1000 }, (_, i) => {
  const rankings = [];
  const optionsCopy = [...ballotOptions];
  for (let j = optionsCopy.length - 1; j > 0; j--) {
    const k = Math.floor(Math.random() * (j + 1));
    [optionsCopy[j], optionsCopy[k]] = [optionsCopy[k], optionsCopy[j]];
  }
  for (let j = 0; j < 50; j++) {
    rankings.push({
      optionId: optionsCopy[j].id,
      rank: j + 1
    });
  }
  return {
    voterId: `acc-${i}`,
    rankings,
    writeIn: null,
    submittedAt: new Date()
  };
});

function baselineCalculateRCVResult(
  options,
  submissions
) {
  const rounds = [];
  let currentOptions = [...options];
  let currentRankings = submissions.map(sub => [...sub.rankings].sort((a, b) => a.rank - b.rank));

  const totalVotes = submissions.length;
  const threshold = totalVotes / 2;

  let roundNumber = 0;
  let winner = undefined;

  while (!winner && currentOptions.length > 1 && roundNumber < 10) {
    roundNumber++;

    const voteDistribution = {};
    currentOptions.forEach(opt => voteDistribution[opt.id] = 0);

    currentRankings.forEach(rankings => {
      const firstChoice = rankings[0];
      if (firstChoice && Object.prototype.hasOwnProperty.call(voteDistribution, firstChoice.optionId)) {
        voteDistribution[firstChoice.optionId]++;
      }
    });

    const maxVotes = Math.max(...Object.values(voteDistribution));
    if (maxVotes > threshold) {
      const winnerId = Object.keys(voteDistribution).find(id => voteDistribution[id] === maxVotes);
      winner = currentOptions.find(opt => opt.id === winnerId);
      rounds.push({ roundNumber, voteDistribution, threshold, winner: winnerId, totalVotes });
      break;
    }

    const minVotes = Math.min(...Object.values(voteDistribution));
    const loserId = Object.keys(voteDistribution).find(id => voteDistribution[id] === minVotes);

    currentOptions = currentOptions.filter(opt => opt.id !== loserId);
    currentRankings = currentRankings.map(rankings =>
      rankings.filter(r => currentOptions.some(opt => opt.id === r.optionId))
    );

    rounds.push({ roundNumber, eliminatedOptionId: loserId, voteDistribution, threshold, totalVotes });
  }

  if (!winner) winner = currentOptions[0];

  return { rounds, winner: winner, totalVotes, completedAt: new Date() };
}

function optimizedCalculateRCVResult(
  options,
  submissions
) {
  const rounds = [];
  let currentOptions = [...options];
  let currentRankings = submissions.map(sub => [...sub.rankings].sort((a, b) => a.rank - b.rank));

  const totalVotes = submissions.length;
  const threshold = totalVotes / 2;

  let roundNumber = 0;
  let winner = undefined;

  while (!winner && currentOptions.length > 1 && roundNumber < 10) {
    roundNumber++;

    const voteDistribution = {};
    currentOptions.forEach(opt => voteDistribution[opt.id] = 0);

    currentRankings.forEach(rankings => {
      const firstChoice = rankings[0];
      if (firstChoice && Object.prototype.hasOwnProperty.call(voteDistribution, firstChoice.optionId)) {
        voteDistribution[firstChoice.optionId]++;
      }
    });

    const maxVotes = Math.max(...Object.values(voteDistribution));
    if (maxVotes > threshold) {
      const winnerId = Object.keys(voteDistribution).find(id => voteDistribution[id] === maxVotes);
      winner = currentOptions.find(opt => opt.id === winnerId);
      rounds.push({ roundNumber, voteDistribution, threshold, winner: winnerId, totalVotes });
      break;
    }

    const minVotes = Math.min(...Object.values(voteDistribution));
    const loserId = Object.keys(voteDistribution).find(id => voteDistribution[id] === minVotes);

    currentOptions = currentOptions.filter(opt => opt.id !== loserId);

    // THE FIX:
    const validIds = new Set(currentOptions.map(opt => opt.id));
    currentRankings = currentRankings.map(rankings =>
      rankings.filter(r => validIds.has(r.optionId))
    );

    rounds.push({ roundNumber, eliminatedOptionId: loserId, voteDistribution, threshold, totalVotes });
  }

  if (!winner) winner = currentOptions[0];

  return { rounds, winner: winner, totalVotes, completedAt: new Date() };
}

function runBenchmark() {
  // Warm up
  for (let i = 0; i < 10; i++) {
    baselineCalculateRCVResult(ballotOptions, submissions);
    optimizedCalculateRCVResult(ballotOptions, submissions);
  }

  const startBaseline = performance.now();
  for (let iter = 0; iter < 100; iter++) {
    baselineCalculateRCVResult(ballotOptions, submissions);
  }
  const endBaseline = performance.now();

  const startOptimized = performance.now();
  for (let iter = 0; iter < 100; iter++) {
    optimizedCalculateRCVResult(ballotOptions, submissions);
  }
  const endOptimized = performance.now();

  console.log('Baseline:', (endBaseline - startBaseline).toFixed(2), 'ms');
  console.log('Optimized:', (endOptimized - startOptimized).toFixed(2), 'ms');
}

runBenchmark();
