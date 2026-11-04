import { spawn } from 'node:child_process';
import fs from 'node:fs';

const suites = [
  { name: 'Suite 1: Backend Security & Integrity', file: 'backend/test-backend.js', expected: 40 },
  { name: 'Suite 2: Staging Acceptance (Docker / Nginx)', file: 'backend/test-staging.js', expected: 49 },
  { name: 'Suite 3: Phase 3.0 E2E Integration', file: 'scratch/test-phase-3-0-e2e.mjs', expected: 34 },
  { name: 'Suite 4: Phase 3.1 Dynamic Catalog & PIN', file: 'scratch/test-phase-3-1-e2e.mjs', expected: 49 },
  { name: 'Suite 5: Phase 3.3 PDP Experience', file: 'scratch/test-phase-3-3-pdp.mjs', expected: 54 },
  { name: 'Suite 6: Phase 3.5 Release Readiness & Safety', file: 'scratch/test-phase-3-5-release-readiness.mjs', expected: 29 },
  { name: 'Suite 7: Phase 3.4 Policy, Footer & Newsletter (includes rate limit exhaustion)', file: 'scratch/test-phase-3-4-policy-newsletter.mjs', expected: 70 },
  { name: 'Suite 8: Step 3 Customer Trust Presentation', file: 'scratch/test-step-3-trust.mjs', expected: 24 },
];

async function runCommand(file) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [file], { cwd: process.cwd(), env: process.env });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (d) => { stdout += d.toString(); });
    child.stderr.on('data', (d) => { stderr += d.toString(); });
    child.on('close', (code) => {
      resolve({ code, stdout, stderr });
    });
  });
}

async function main() {
  console.log('===============================================================');
  console.log('   WAAK PHASE 3.5.1 — MASTER TEST EXECUTION & LOG CAPTURE      ');
  console.log('===============================================================\n');

  let totalPassed = 0;
  let totalFailed = 0;
  const rawLogs = [];

  for (const s of suites) {
    console.log(`Executing ${s.name} (${s.file})...`);
    const start = Date.now();
    const res = await runCommand(s.file);
    const duration = Date.now() - start;

    let suitePassed = 0;
    let suiteFailed = 0;

    // Count [PASS] or ✓
    const passMatches = (res.stdout.match(/(\[PASS\]|✓)/g) || []).length;
    const failMatches = (res.stdout.match(/(\[FAIL\]|❌|AssertionError)/g) || []).length;

    suitePassed = passMatches;
    suiteFailed = failMatches + (res.code !== 0 ? 1 : 0);

    totalPassed += suitePassed;
    totalFailed += suiteFailed;

    console.log(`  -> Finished in ${duration}ms: ${suitePassed} passed, ${suiteFailed} failed (exit code ${res.code})`);

    rawLogs.push({
      name: s.name,
      file: s.file,
      exitCode: res.code,
      durationMs: duration,
      passed: suitePassed,
      failed: suiteFailed,
      stdout: res.stdout,
      stderr: res.stderr,
    });
  }

  console.log('\n===============================================================');
  console.log(`   TOTAL ASSERTIONS: ${totalPassed} passed, ${totalFailed} failed across ${suites.length} suites`);
  console.log('===============================================================\n');

  fs.writeFileSync('scratch/master_test_results.json', JSON.stringify({ totalPassed, totalFailed, suites: rawLogs }, null, 2));
}

main();
