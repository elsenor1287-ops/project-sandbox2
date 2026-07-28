import { performance } from 'perf_hooks';

// Simulated Supabase upsert function
// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
const simulateUpsert = async (records: any[]) => {
  // Simulate a 20ms network latency per database call
  await new Promise(resolve => setTimeout(resolve, 20));
  return { error: null };
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function baseline(records: any[]) {
  const start = performance.now();
  for (const record of records) {
    await simulateUpsert([record]);
  }
  const end = performance.now();
  return end - start;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function optimized(records: any[]) {
  const start = performance.now();
  await simulateUpsert(records);
  const end = performance.now();
  return end - start;
}

async function run() {
  const records = Array.from({ length: 100 }, (_, i) => ({ id: i }));
  console.log('Running baseline (N+1)...');
  const baseTime = await baseline(records);
  console.log('Running optimized (Bulk)...');
  const optTime = await optimized(records);

  console.log(`Baseline (N+1 inserts): ${baseTime.toFixed(2)} ms`);
  console.log(`Optimized (Bulk insert): ${optTime.toFixed(2)} ms`);
}

run().catch(console.error);
