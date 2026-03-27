#!/usr/bin/env node
/**
 * Load testing script for CodeRail Flow API.
 *
 * Tests API performance under concurrent load.
 */

const API_URL = process.env.API_URL || 'https://coderail-flow-api.broad-dew-49ad.workers.dev';
const CONCURRENT_USERS = parseInt(process.env.CONCURRENT_USERS || '100');
const REQUESTS_PER_USER = parseInt(process.env.REQUESTS_PER_USER || '10');
const RAMP_UP_TIME = parseInt(process.env.RAMP_UP_TIME || '5000'); // ms

interface LoadTestResult {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  minResponseTime: number;
  maxResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  requestsPerSecond: number;
}

async function makeRequest(id: number, requestId: number): Promise<{
  success: boolean;
  duration: number;
  status?: number;
}> {
  const start = Date.now();
  try {
    const response = await fetch(`${API_URL}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': `LoadTest-User-${id}-Request-${requestId}`,
      },
    });
    const duration = Date.now() - start;
    return {
      success: response.ok,
      duration,
      status: response.status,
    };
  } catch (error) {
    return {
      success: false,
      duration: Date.now() - start,
    };
  }
}

async function runLoadTest(): Promise<LoadTestResult> {
  console.log(`🚀 Starting Load Test`);
  console.log(`API URL: ${API_URL}`);
  console.log(`Concurrent Users: ${CONCURRENT_USERS}`);
  console.log(`Requests Per User: ${REQUESTS_PER_USER}`);
  console.log(`Total Requests: ${CONCURRENT_USERS * REQUESTS_PER_USER}`);
  console.log(`Ramp-up Time: ${RAMP_UP_TIME}ms`);
  console.log('');

  const results: Array<{ success: boolean; duration: number; status?: number }> = [];
  const startTime = Date.now();

  // Ramp up users gradually
  for (let user = 0; user < CONCURRENT_USERS; user++) {
    const userDelay = (RAMP_UP_TIME / CONCURRENT_USERS) * user;

    setTimeout(async () => {
      for (let req = 0; req < REQUESTS_PER_USER; req++) {
        const result = await makeRequest(user, req);
        results.push(result);

        const completed = results.length;
        const total = CONCURRENT_USERS * REQUESTS_PER_USER;
        if (completed % 50 === 0) {
          process.stdout.write(`\rProgress: ${completed}/${total} requests completed`);
        }
      }
    }, userDelay);
  }

  // Wait for all requests to complete
  await new Promise(resolve => setTimeout(resolve, RAMP_UP_TIME + 30000));

  const totalDuration = Date.now() - startTime;
  process.stdout.write(`\r\n`);

  // Calculate statistics
  const successfulRequests = results.filter(r => r.success);
  const failedRequests = results.filter(r => !r.success);
  const durations = results.map(r => r.duration);

  const sortedDurations = durations.sort((a, b) => a - b);
  const averageResponseTime = durations.reduce((a, b) => a + b, 0) / durations.length;
  const p95Index = Math.floor(durations.length * 0.95);
  const p99Index = Math.floor(durations.length * 0.99);

  const result: LoadTestResult = {
    totalRequests: results.length,
    successfulRequests: successfulRequests.length,
    failedRequests: failedRequests.length,
    averageResponseTime: Math.round(averageResponseTime),
    minResponseTime: sortedDurations[0],
    maxResponseTime: sortedDurations[sortedDurations.length - 1],
    p95ResponseTime: sortedDurations[p95Index],
    p99ResponseTime: sortedDurations[p99Index],
    requestsPerSecond: Math.round((results.length / totalDuration) * 1000),
  };

  return result;
}

// Run the load test
runLoadTest()
  .then((result) => {
    console.log(`\n📊 Load Test Results`);
    console.log('===================');
    console.log(`Total Requests: ${result.totalRequests}`);
    console.log(`Successful: ${result.successfulRequests} (${((result.successfulRequests / result.totalRequests) * 100).toFixed(1)}%)`);
    console.log(`Failed: ${result.failedRequests} (${((result.failedRequests / result.totalRequests) * 100).toFixed(1)}%)`);
    console.log(`\nResponse Times:`);
    console.log(`  Average: ${result.averageResponseTime}ms`);
    console.log(`  Min: ${result.minResponseTime}ms`);
    console.log(`  Max: ${result.maxResponseTime}ms`);
    console.log(`  P95: ${result.p95ResponseTime}ms`);
    console.log(`  P99: ${result.p99ResponseTime}ms`);
    console.log(`\nThroughput: ${result.requestsPerSecond} requests/second`);

    // Determine if test passed
    const successRate = result.successfulRequests / result.totalRequests;
    const avgResponseTimeAcceptable = result.averageResponseTime < 1000;
    const passed = successRate > 0.95 && avgResponseTimeAcceptable;

    console.log(`\n${passed ? '✅' : '❌'} Test ${passed ? 'PASSED' : 'FAILED'}`);
    console.log(`  Success Rate: ${(successRate * 100).toFixed(1)}% (target: >95%)`);
    console.log(`  Avg Response Time: ${result.averageResponseTime}ms (target: <1000ms)`);

    process.exit(passed ? 0 : 1);
  })
  .catch((error) => {
    console.error('❌ Load test failed:', error);
    process.exit(1);
  });
