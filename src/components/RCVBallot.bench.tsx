import { bench, describe } from 'vitest';
import { renderToString } from 'react-dom/server';
import { VotingPage } from './RCVBallot';

describe('VotingPage getRank Performance', () => {
  // Let's create a pure implementation of what's going on to benchmark it
  const rankings = Array.from({ length: 50 }, (_, i) => ({ optionId: `opt_${i}`, rank: i + 1 }));
  const getRankOld = (optionId: string) => rankings.find(r => r.optionId === optionId)?.rank || 0;

  // New approach: using Map
  const rankingsMap = new Map(rankings.map(r => [r.optionId, r.rank]));
  const getRankNewMap = (optionId: string) => rankingsMap.get(optionId) || 0;

  // New approach: using Record/Object
  const rankingsRecord = rankings.reduce((acc, r) => { acc[r.optionId] = r.rank; return acc; }, {} as Record<string, number>);
  const getRankNewRecord = (optionId: string) => rankingsRecord[optionId] || 0;

  bench('getRankOld', () => {
    for (let i = 0; i < 100; i++) {
      getRankOld(`opt_${i % 50}`);
    }
  });

  bench('getRankNewMap', () => {
    for (let i = 0; i < 100; i++) {
      getRankNewMap(`opt_${i % 50}`);
    }
  });

  bench('getRankNewRecord', () => {
    for (let i = 0; i < 100; i++) {
      getRankNewRecord(`opt_${i % 50}`);
    }
  });
});
