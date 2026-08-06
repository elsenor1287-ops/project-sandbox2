import { useState, useCallback, useEffect } from 'react';
import {
  dbFetchBallotSubmissions,
  dbInsertBallotSubmission,
  dbInsertBallotSubmissions,
  dbResetVotingSubmissions,
  isSupabaseConfigured
} from '../lib/supabase';
import type {
  BallotOption,
  BallotSubmission,
  TestAccount,
  RCVResult,
  RCVRound,
} from '../types';
import {
  INITIAL_BALLOT_OPTIONS,
  MOCK_TEST_ACCOUNTS,
} from '../data/mockData';

const SEED_SUBMISSIONS: BallotSubmission[] = [
  {
    voterId: 'test-1',
    rankings: [
      { optionId: 'opt-1', rank: 1 },
      { optionId: 'opt-2', rank: 2 },
      { optionId: 'opt-3', rank: 3 }
    ],
    submittedAt: new Date('2024-02-14T08:00:00Z')
  },
  {
    voterId: 'test-2',
    rankings: [
      { optionId: 'opt-2', rank: 1 },
      { optionId: 'opt-1', rank: 2 },
      { optionId: 'opt-5', rank: 3 }
    ],
    submittedAt: new Date('2024-02-14T09:12:00Z')
  },
  {
    voterId: 'test-3',
    rankings: [
      { optionId: 'opt-3', rank: 1 },
      { optionId: 'opt-6', rank: 2 },
      { optionId: 'opt-2', rank: 3 }
    ],
    submittedAt: new Date('2024-02-14T11:45:00Z')
  }
];

export function useBallotState() {
  const [ballotOptions, setBallotOptions] = useState<BallotOption[]>(INITIAL_BALLOT_OPTIONS);
  const [ballotSubmissions, setBallotSubmissions] = useState<BallotSubmission[]>([]);
  const [testAccounts, setTestAccounts] = useState<TestAccount[]>(MOCK_TEST_ACCOUNTS);
  const [rcvResult, setRcvResult] = useState<RCVResult | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    const loadData = async () => {
      try {
        let fetchedSubmissions = await dbFetchBallotSubmissions();
        if (fetchedSubmissions !== null) {
          if (fetchedSubmissions.length === 0) {
            await dbInsertBallotSubmissions(SEED_SUBMISSIONS);
            fetchedSubmissions = SEED_SUBMISSIONS;
          }

          const votedUserIds = new Set(fetchedSubmissions.map(s => s.voterId));
          setBallotSubmissions(fetchedSubmissions!);
          setTestAccounts(prev => prev.map(acc => {
            if (votedUserIds.has(acc.id)) {
              return { ...acc, hasVoted: true };
            }
            return acc;
          }));
        }
      } catch (err) {
        console.error('Error loading data from Supabase:', err);
      }
    };

    loadData();
  }, []);

  const submitBallot = useCallback((submission: Omit<BallotSubmission, 'submittedAt'>) => {
    const newSubmission: BallotSubmission = {
      ...submission,
      submittedAt: new Date(),
    };

    if (isSupabaseConfigured) {
      dbInsertBallotSubmission(newSubmission).catch(err => {
        console.error('Failed to sync submission to Supabase:', err);
      });
    }

    setBallotSubmissions(prev => [...prev, newSubmission]);

    setBallotOptions(prev => {
      const newBallotOptions = [...prev];

      // Handle write-in
      if (submission.writeIn) {
        const existingWriteIn = newBallotOptions.find(
          opt => opt.isWriteIn && opt.title.toLowerCase() === submission.writeIn!.toLowerCase()
        );

        if (existingWriteIn) {
          existingWriteIn.writeInCount = (existingWriteIn.writeInCount || 0) + 1;
        } else {
          // Create new write-in option
          const newWriteInOption: BallotOption = {
            id: `writein-${Date.now()}`,
            title: submission.writeIn,
            description: 'Write-in candidate submitted by voters',
            budget: 0,
            category: 'other',
            voteCount: 0,
            isWriteIn: true,
            writeInCount: 1,
          };
          newBallotOptions.push(newWriteInOption);
        }
      }

      return newBallotOptions;
    });
  }, []);

  const runRCVSimulation = useCallback(() => {
    const result = calculateRCVResult(ballotOptions, ballotSubmissions);
    setRcvResult(result);
  }, [ballotOptions, ballotSubmissions]);

  const generateMockVotes = useCallback((count: number) => {
    const newSubmissions: BallotSubmission[] = [];
    let updatedAccounts: TestAccount[] = [];

    setTestAccounts(prevAccounts => {
      const accounts = [...prevAccounts];

      const getSecureRandom = () => crypto.getRandomValues(new Uint32Array(1))[0] / 4294967296;
      for (let i = 0; i < Math.min(count, accounts.length); i++) {
        const account = accounts[i];
        if (!account.hasVoted) {
          // Generate random rankings
          const shuffled = [...ballotOptions].sort(() => getSecureRandom() - 0.5);
          const rankings = shuffled.slice(0, Math.floor(getSecureRandom() * 4) + 1).map((opt, idx) => ({
            optionId: opt.id,
            rank: idx + 1,
          }));

          // Randomly add a write-in (10% chance)
          const writeIn = getSecureRandom() < 0.1 ? `Citizen Initiative #${Math.floor(getSecureRandom() * 100)}` : undefined;

          account.hasVoted = true;
          if (writeIn) account.writeIns.push(writeIn);

          const sub: BallotSubmission = {
            voterId: account.id,
            rankings,
            writeIn,
            submittedAt: new Date(),
          };
          newSubmissions.push(sub);
        }
      }
      updatedAccounts = accounts;
      return accounts;
    });

    if (newSubmissions.length > 0) {
      setBallotSubmissions(prev => [...prev, ...newSubmissions]);

      // Sync to Supabase asynchronously
      if (isSupabaseConfigured) {
        dbInsertBallotSubmissions(newSubmissions).catch(err => {
          console.error('Failed to sync generated mock submissions to Supabase:', err);
        });
      }

      // Update ballot options with write-ins
      setBallotOptions(prev => {
        const newBallotOptions = [...prev];
        const writeInCounts: Record<string, number> = {};

        newSubmissions.forEach(sub => {
          if (sub.writeIn) {
            writeInCounts[sub.writeIn] = (writeInCounts[sub.writeIn] || 0) + 1;
          }
        });

        const existingWriteIns = new Map<string, BallotOption>();
        for (const opt of newBallotOptions) {
          if (opt.isWriteIn) {
            existingWriteIns.set(opt.title.toLowerCase(), opt);
          }
        }

        Object.entries(writeInCounts).forEach(([writeIn, count]) => {
          const normalized = writeIn.toLowerCase();
          const existing = existingWriteIns.get(normalized);

          if (existing) {
            existing.writeInCount = (existing.writeInCount || 0) + count;
          } else {
            const newWriteInOption: BallotOption = {
              id: `writein-${Date.now()}-${crypto.randomUUID()}`,
              title: writeIn,
              description: 'Write-in candidate submitted by voters',
              budget: 0,
              category: 'other',
              voteCount: 0,
              isWriteIn: true,
              writeInCount: count,
            };
            newBallotOptions.push(newWriteInOption);
            existingWriteIns.set(normalized, newWriteInOption);
          }
        });

        return newBallotOptions;
      });
    }
  }, [ballotOptions]);

  const resetVoting = useCallback(() => {
    if (isSupabaseConfigured) {
      dbResetVotingSubmissions().catch(err => {
        console.error('Failed to reset submissions on Supabase:', err);
      });
    }

    setBallotOptions(INITIAL_BALLOT_OPTIONS);
    setBallotSubmissions([]);
    setRcvResult(null);
    setTestAccounts(MOCK_TEST_ACCOUNTS.map(acc => ({ ...acc, hasVoted: false, writeIns: [] })));
  }, []);

  return {
    ballotOptions,
    setBallotOptions,
    ballotSubmissions,
    setBallotSubmissions,
    testAccounts,
    setTestAccounts,
    rcvResult,
    setRcvResult,
    submitBallot,
    runRCVSimulation,
    generateMockVotes,
    resetVoting,
  };
}

export function calculateRCVResult(
  options: BallotOption[],
  submissions: BallotSubmission[]
): RCVResult {
  const rounds: RCVRound[] = [];
  let currentOptions = [...options];
  const optionsMap = new Map(options.map(opt => [opt.id, opt]));
  let currentRankings = submissions.map(sub => [...sub.rankings].sort((a, b) => a.rank - b.rank));

  const totalVotes = submissions.length;
  const threshold = totalVotes / 2;

  let roundNumber = 0;
  let winner: BallotOption | undefined;

  while (!winner && currentOptions.length > 1 && roundNumber < 10) {
    roundNumber++;

    // Count first-choice votes
    const voteDistribution: Record<string, number> = {};
    currentOptions.forEach(opt => {
      voteDistribution[opt.id] = 0;
    });

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

    // Check for winner
    if (maxVotes > threshold) {
      winner = winnerId ? optionsMap.get(winnerId) : undefined;

      rounds.push({
        roundNumber,
        voteDistribution,
        threshold,
        winner: winnerId,
        totalVotes,
      });
      break;
    }

    // Eliminate loser
    currentOptions = currentOptions.filter(opt => opt.id !== loserId);

    // Optimization: Create a Set of current option IDs for O(1) lookup
    const currentOptionIds = new Set(currentOptions.map(opt => opt.id));

    // Redistribute votes
    currentRankings = currentRankings.map(rankings =>
      rankings.filter(r => currentOptionIds.has(r.optionId))
    );

    rounds.push({
      roundNumber,
      eliminatedOptionId: loserId,
      voteDistribution,
      threshold,
      totalVotes,
    });
  }

  if (!winner) {
    winner = currentOptions[0];
  }

  return {
    rounds,
    winner: winner!,
    totalVotes,
    completedAt: new Date(),
  };
}
