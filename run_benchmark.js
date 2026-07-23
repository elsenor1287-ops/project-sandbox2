import { performance } from 'perf_hooks';

function runBenchmark() {
  const ballotOptions = Array.from({ length: 4 }, (_, i) => ({
    id: `opt-${i}`,
    title: `Option ${i}`,
  }));

  const ballotSubmissions = Array.from({ length: 1000 }, (_, i) => ({
    rankings: [
      { optionId: `opt-${Math.floor(Math.random() * 4)}`, rank: 1 },
      { optionId: `opt-${Math.floor(Math.random() * 4)}`, rank: 2 },
    ]
  }));

  const ITERATIONS = 10000;

  // Baseline approach (filtering inside loop)
  const startBaseline = performance.now();
  for (let i = 0; i < ITERATIONS; i++) {
    ballotOptions.slice(0, 4).map(option => {
      const voteCount = ballotSubmissions.filter(sub =>
        sub.rankings.some(r => r.optionId === option.id && r.rank === 1)
      ).length;
      return voteCount;
    });
  }
  const endBaseline = performance.now();

  // Optimized approach (pre-calculating counts)
  const startOptimized = performance.now();
  for (let i = 0; i < ITERATIONS; i++) {
    const firstChoiceCounts = new Map();
    ballotSubmissions.forEach(sub => {
      const firstChoice = sub.rankings.find(r => r.rank === 1);
      if (firstChoice) {
        firstChoiceCounts.set(
          firstChoice.optionId,
          (firstChoiceCounts.get(firstChoice.optionId) || 0) + 1
        );
      }
    });

    ballotOptions.slice(0, 4).map(option => {
      const voteCount = firstChoiceCounts.get(option.id) || 0;
      return voteCount;
    });
  }
  const endOptimized = performance.now();

  console.log(`Baseline: ${(endBaseline - startBaseline).toFixed(2)} ms`);
  console.log(`Optimized: ${(endOptimized - startOptimized).toFixed(2)} ms`);
  console.log(`Improvement: ${(((endBaseline - startBaseline) - (endOptimized - startOptimized)) / (endBaseline - startBaseline) * 100).toFixed(2)}% faster`);
}

runBenchmark();
