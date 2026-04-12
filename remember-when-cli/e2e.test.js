import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';

describe('Remember When CLI - E2E Tests', () => {
  const testDir = path.join(os.tmpdir(), `remember-when-e2e-${Date.now()}`);
  const cliPath = path.resolve('./index.js');
  const run = (cmd) => `REMEMBER_WHEN_TEST_DIR=${testDir} node ${cliPath} ${cmd}`;

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

  it('should run "install" and create inventory.json', () => {
    const output = execSync(run('install')).toString();
    expect(output).toContain('[remember-when] Storage initialized');
    expect(fs.existsSync(path.join(testDir, 'inventory.json'))).toBe(true);
  });

  it('should run "add" and create group/date structure', () => {
    execSync(run('install'));
    const output = execSync(run('add -g E2EGroup -t text -s Tester -r "E2E Test Summary"')).toString();
    expect(output).toContain('[remember-when] Added entry to E2EGroup');

    const colPath = path.join(testDir, 'E2EGroup');
    expect(fs.existsSync(colPath)).toBe(true);

    const days = fs.readdirSync(colPath).filter(f => f.match(/^\d{4}-\d{2}-\d{2}$/));
    expect(days.length).toBeGreaterThan(0);

    const today = new Date().toISOString().split('T')[0];
    const colFile = path.join(colPath, today, 'collection.json');
    expect(fs.existsSync(colFile)).toBe(true);
    const col = JSON.parse(fs.readFileSync(colFile, 'utf8'));
    expect(col.entries[0].group).toBeUndefined(); // group is in folder, not in entry
    expect(col.entries[0].summary).toBe('E2E Test Summary');
  });

  it('should run "inventory" and show group status', () => {
    execSync(run('install'));
    execSync(run('add -g InvGroup -t text -s Tester -r "Inv test"'));

    const output = execSync(run('inventory')).toString();
    expect(output).toContain('InvGroup');
    expect(output).toContain('[!] MISSING');
  });

  it('should run "set-group-info" and update inventory', () => {
    execSync(run('install'));
    execSync(run('set-group-info -g InfoGroup -d "Info test group" -p "Alice, Bob"'));

    const inv = JSON.parse(fs.readFileSync(path.join(testDir, 'inventory.json'), 'utf8'));
    expect(inv.groups['InfoGroup'].description).toBe('Info test group');
    expect(inv.groups['InfoGroup'].participants).toEqual(['Alice', 'Bob']);
  });

  it('should run "set-daily-summary" and update collection', () => {
    execSync(run('install'));
    execSync(run('set-group-info -g SumGroup -d "Sum" -p "A"'));
    execSync(run('set-daily-summary -g SumGroup -s "Great day" -d 2026-04-10'));

    const col = JSON.parse(fs.readFileSync(path.join(testDir, 'SumGroup', '2026-04-10', 'collection.json'), 'utf8'));
    expect(col.dailySummary).toBe('Great day');
  });

  it('should run full cross collection workflow', () => {
    const groupName = 'CrossE2E';
    execSync(run('install'));
    execSync(run(`set-group-info -g ${groupName} -d "Cross E2E" -p "A, B"`));
    execSync(run(`add -g ${groupName} -t text -s A -r "Day 1 entry" -d 2026-04-10T12:00:00.000Z`));
    execSync(run(`add -g ${groupName} -t photo -s B -r "Day 2 photo" -d 2026-04-11T12:00:00.000Z`));

    execSync(run(`create-cross -g ${groupName} -n viatge --display-name "Viatge" -d "Test viatge"`));

    const today = new Date().toISOString().split('T')[0];
    const col1 = JSON.parse(fs.readFileSync(path.join(testDir, groupName, '2026-04-10', 'collection.json'), 'utf8'));
    const col2 = JSON.parse(fs.readFileSync(path.join(testDir, groupName, '2026-04-11', 'collection.json'), 'utf8'));

    execSync(run(`add-to-cross -g ${groupName} -c viatge --date 2026-04-10 --entry-id ${col1.entries[0].id}`));
    execSync(run(`add-to-cross -g ${groupName} -c viatge --date 2026-04-11 --entry-id ${col2.entries[0].id}`));

    const listOut = execSync(run(`list-cross -g ${groupName}`)).toString();
    expect(listOut).toContain('viatge');
    expect(listOut).toContain('2 refs');

    const showOut = execSync(run(`show-cross -g ${groupName} -c viatge`)).toString();
    expect(showOut).toContain('Day 1 entry');
    expect(showOut).toContain('Day 2 photo');
  });

  it('should run rules workflow', () => {
    const groupName = 'RuleE2E';
    execSync(run('install'));
    execSync(run(`set-group-info -g ${groupName} -d "Rule E2E" -p "A"`));

    execSync(run(`set-rule -g ${groupName} --trigger keyword --pattern "viatge" --action suggest-cross --cross-collection viatges`));

    const listOut = execSync(run(`list-rules -g ${groupName}`)).toString();
    expect(listOut).toContain('keyword');
    expect(listOut).toContain('viatge');
    expect(listOut).toContain('suggest-cross');
  });

  it('should handle file archiving end-to-end', () => {
    const groupName = 'FileE2E';
    const tempFile = path.join(testDir, 'e2e-photo.jpg');
    fs.writeFileSync(tempFile, 'fake-binary');

    execSync(run('install'));
    execSync(run(`set-group-info -g ${groupName} -d "File test" -p "UserA"`));
    execSync(run(`add -g ${groupName} -t photo -s UserA -r "Event photo" -f ${tempFile} -d 2026-04-10T10:00:00.000Z`));

    const col = JSON.parse(fs.readFileSync(path.join(testDir, groupName, '2026-04-10', 'collection.json'), 'utf8'));
    const entry = col.entries[0];
    expect(entry.file).toBeDefined();

    const storedFile = path.join(testDir, groupName, '2026-04-10', entry.file);
    expect(fs.existsSync(storedFile)).toBe(true);
    expect(fs.readFileSync(storedFile, 'utf8')).toBe('fake-binary');

    const invOut = execSync(run('inventory')).toString();
    expect(invOut).toContain(groupName);
    expect(invOut).toContain('1 entries');
  });

  it('should run set-daily-context and enrich-entry workflow', () => {
    const groupName = 'EnrichE2E';
    execSync(run('install'));
    execSync(run(`set-group-info -g ${groupName} -d "Enrichment E2E" -p "Alice"`));

    execSync(run(`add -g ${groupName} -t interest_point -s Alice -r "Sagrada Familia" -d 2026-04-10T12:00:00.000Z`));

    const col = JSON.parse(fs.readFileSync(path.join(testDir, groupName, '2026-04-10', 'collection.json'), 'utf8'));
    const entryId = col.entries[0].id;

    const enrichOut = execSync(run(`enrich-entry -g ${groupName} --date 2026-04-10 --entry-id ${entryId} --history "Designed by Gaudi, started 1882" --enrich-type "Basilica" --location "Barcelona"`)).toString();
    expect(enrichOut).toContain('enriched');

    const ctxOut = execSync(run(`set-daily-context -g ${groupName} -d 2026-04-10 --weather "22C sunny" --news "Festival starts today" --historical-events "Gaudi born 1852"`)).toString();
    expect(ctxOut).toContain('Daily context updated');

    const reloaded = JSON.parse(fs.readFileSync(path.join(testDir, groupName, '2026-04-10', 'collection.json'), 'utf8'));
    expect(reloaded.entries[0].enrichment.history).toBe('Designed by Gaudi, started 1882');
    expect(reloaded.entries[0].enrichment.type).toBe('Basilica');
    expect(reloaded.entries[0].enrichment.location).toBe('Barcelona');
    expect(reloaded.dailyContext.weather).toBe('22C sunny');
    expect(reloaded.dailyContext.news).toBe('Festival starts today');
    expect(reloaded.dailyContext.historicalEvents).toBe('Gaudi born 1852');
  });
});
