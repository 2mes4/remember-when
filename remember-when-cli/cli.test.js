import fs from 'fs';
import path from 'path';
import os from 'os';

// Setup test dir before importing index.js logic
const testDir = path.join(os.tmpdir(), `remember-when-test-${Date.now()}`);
process.env.REMEMBER_WHEN_TEST_DIR = testDir;

import { 
  addEntry, 
  setGroupInfo, 
  setDailySummary, 
  loadTimeline
} from './index.js';

describe('Remember When CLI - Logic Tests', () => {

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

  beforeEach(() => {
    // Clear timeline before each test
    const timelinePath = path.join(testDir, 'timeline.json');
    if (fs.existsSync(timelinePath)) {
      fs.unlinkSync(timelinePath);
    }
  });

  it('should add a text entry correctly', () => {
    const options = {
      group: 'TestGroup',
      type: 'text',
      sender: 'Jest',
      summary: 'Unit test entry',
      date: new Date().toISOString()
    };

    const entry = addEntry(options);
    const timeline = loadTimeline();

    expect(Array.isArray(timeline.entries)).toBe(true);
    expect(timeline.entries).toHaveLength(1);
    expect(timeline.entries[0].group).toBe('TestGroup');
    expect(timeline.entries[0].summary).toBe('Unit test entry');
    expect(entry.id).toBeDefined();
  });

  it('should set group info correctly', () => {
    const options = {
      group: 'TestGroup',
      desc: 'A group for testing',
      participants: 'User1, User2'
    };

    setGroupInfo(options);
    const timeline = loadTimeline();

    expect(timeline.groups['TestGroup']).toBeDefined();
    expect(timeline.groups['TestGroup'].info.description).toBe('A group for testing');
    expect(timeline.groups['TestGroup'].info.participants).toEqual(['User1', 'User2']);
  });

  it('should set daily summary correctly', () => {
    const options = {
      group: 'TestGroup',
      date: '2026-04-10',
      summary: 'Today nothing happened'
    };

    setDailySummary(options);
    const timeline = loadTimeline();

    expect(timeline.groups['TestGroup'].daily_summaries['2026-04-10']).toBe('Today nothing happened');
  });

  it('should copy file when provided in add', () => {
    const tempFilePath = path.join(testDir, 'test-file.txt');
    fs.writeFileSync(tempFilePath, 'hello world');

    const options = {
      group: 'FileGroup',
      type: 'file',
      sender: 'Jest',
      summary: 'File test',
      date: '2026-04-10T10:00:00.000Z',
      file: tempFilePath
    };

    const entry = addEntry(options);
    
    // Check if file exists in the day folder
    const dayFolder = '2026-04-10';
    const storedPath = path.join(testDir, entry.file);
    
    expect(fs.existsSync(storedPath)).toBe(true);
    expect(fs.readFileSync(storedPath, 'utf8')).toBe('hello world');
  });
});
