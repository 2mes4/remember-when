import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';

describe('Remember When CLI - E2E Tests', () => {
  const testDir = path.join(os.tmpdir(), `remember-when-e2e-${Date.now()}`);
  const cliPath = path.resolve('./index.js');

  beforeAll(() => {
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
  });

  afterAll(() => {
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  it('should run "add" command successfully', () => {
    const cmd = `REMEMBER_WHEN_TEST_DIR=${testDir} node ${cliPath} add -g E2EGroup -t text -s Tester -r "E2E Test Summary"`;
    const output = execSync(cmd).toString();
    
    expect(output).toContain('[remember-when] Added entry to E2EGroup');
    
    const timelinePath = path.join(testDir, 'timeline.json');
    expect(fs.existsSync(timelinePath)).toBe(true);
    
    const timeline = JSON.parse(fs.readFileSync(timelinePath, 'utf8'));
    expect(timeline.entries[0].group).toBe('E2EGroup');
  });

  it('should run "inventory" command successfully', () => {
    const cmd = `REMEMBER_WHEN_TEST_DIR=${testDir} node ${cliPath} inventory`;
    const output = execSync(cmd).toString();
    
    expect(output).toContain('--- REMEMBER-WHEN INVENTORY ---');
    expect(output).toContain('Group: E2EGroup');
    expect(output).toContain('[!] MISSING: Group description');
  });
});
