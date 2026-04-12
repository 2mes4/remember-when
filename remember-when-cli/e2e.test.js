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

  it('should handle file archiving, inventory audit, and group info update', () => {
    const groupName = "WorkflowGroup";
    const tempFilePath = path.join(testDir, 'e2e-image.jpg');
    fs.writeFileSync(tempFilePath, 'fake-image-binary-data');

    // 1. Add entry with file
    const addCmd = `REMEMBER_WHEN_TEST_DIR=${testDir} node ${cliPath} add -g ${groupName} -t photo -s UserA -r "Event photo" -f ${tempFilePath}`;
    execSync(addCmd);

    // 2. Check inventory (should be missing group info)
    const invCmd1 = `REMEMBER_WHEN_TEST_DIR=${testDir} node ${cliPath} inventory`;
    const invOutput1 = execSync(invCmd1).toString();
    expect(invOutput1).toContain(`Group: ${groupName}`);
    expect(invOutput1).toContain('[!] MISSING: Group description');

    // 3. Add group info
    const setInfoCmd = `REMEMBER_WHEN_TEST_DIR=${testDir} node ${cliPath} set-group-info -g ${groupName} -d "A professional testing group" -p "UserA, UserB"`;
    execSync(setInfoCmd);

    // 4. Validate info is now present in inventory
    const invOutput2 = execSync(invCmd1).toString();
    expect(invOutput2).toContain('[ok] Group info present.');
    
    // 5. Verify physical file storage
    const timeline = JSON.parse(fs.readFileSync(path.join(testDir, 'timeline.json'), 'utf8'));
    const entry = timeline.entries.find(e => e.group === groupName);
    expect(entry.file).toBeDefined();
    expect(fs.existsSync(path.join(testDir, entry.file))).toBe(true);
  });
});
