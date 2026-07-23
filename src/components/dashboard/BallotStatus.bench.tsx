import { bench, describe } from 'vitest';
import { renderToString } from 'react-dom/server';
import { BallotStatus } from './BallotStatus';
import React from 'react';

// Generate mock data
const ballotOptions = Array.from({ length: 10 }, (_, i) => ({
  id: `opt_${i}`,
  title: `Option ${i}`,
  description: 'Desc',
  budget: 100,
  category: 'other' as const,
  voteCount: 0,
  isWriteIn: false,
}));

const ballotSubmissions = Array.from({ length: 10000 }, (_, i) => ({
  voterId: `voter_${i}`,
  rankings: Array.from({ length: 5 }, (_, j) => ({
    optionId: `opt_${Math.floor(Math.random() * 10)}`,
    rank: j + 1,
  })),
  submittedAt: new Date(),
}));

describe('BallotStatus rendering', () => {
  bench('render with 10k submissions', () => {
    renderToString(
      <BallotStatus
        rcvResult={null}
        ballotOptions={ballotOptions}
        ballotSubmissions={ballotSubmissions}
        onNavigate={() => {}}
      />
    );
  });
});
