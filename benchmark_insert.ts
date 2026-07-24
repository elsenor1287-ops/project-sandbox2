import { performance } from 'perf_hooks';

const MOCK_LATENCY_MS = 50;

async function mockInsertOne() {
  await new Promise(resolve => setTimeout(resolve, MOCK_LATENCY_MS));
}

async function mockInsertMany(count: number) {
  // A bulk insert takes roughly the same network round-trip time, maybe slightly longer for payload size
  await new Promise(resolve => setTimeout(resolve, MOCK_LATENCY_MS + count * 0.1));
}

async function runBenchmark() {
  const numSubmissions = 50; // Generating 50 mock votes

  console.log(`Benchmarking insertion of ${numSubmissions} submissions...`);

  // Baseline: N+1
  const startN1 = performance.now();
  for (let i = 0; i < numSubmissions; i++) {
    await mockInsertOne();
  }
  const endN1 = performance.now();
  const timeN1 = endN1 - startN1;

  // Optimized: Bulk Insert
  const startBulk = performance.now();
  await mockInsertMany(numSubmissions);
  const endBulk = performance.now();
  const timeBulk = endBulk - startBulk;

  console.log(`N+1 Query approach: ${timeN1.toFixed(2)} ms`);
  console.log(`Bulk Insert approach: ${timeBulk.toFixed(2)} ms`);
  console.log(`Improvement: ${((timeN1 - timeBulk) / timeN1 * 100).toFixed(2)}% faster`);
}

runBenchmark().catch(console.error);
