#!/usr/bin/env node
import { program } from 'commander';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const pkg = require('./package.json');

export function getStorageRoot() {
  return process.env.REMEMBER_WHEN_TEST_DIR 
    ? process.env.REMEMBER_WHEN_TEST_DIR 
    : path.join(os.homedir(), '.remember-when');
}

export function getTimelinePath() {
  return path.join(getStorageRoot(), 'timeline.json');
}

export function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export function loadTimeline() {
  const root = getStorageRoot();
  const timelinePath = getTimelinePath();
  ensureDir(root);
  if (!fs.existsSync(timelinePath)) {
    return { groups: {}, entries: [] };
  }
  try {
    const data = fs.readFileSync(timelinePath, 'utf8');
    const parsed = JSON.parse(data || '{}');
    return {
      groups: parsed.groups || {},
      entries: Array.isArray(parsed.entries) ? parsed.entries : []
    };
  } catch (e) {
    return { groups: {}, entries: [] };
  }
}

export function saveTimeline(timeline) {
  const root = getStorageRoot();
  const timelinePath = getTimelinePath();
  ensureDir(root);
  fs.writeFileSync(timelinePath, JSON.stringify(timeline, null, 2), 'utf8');
}

export function addEntry(options) {
  const root = getStorageRoot();
  const timeline = loadTimeline();
  const date = new Date(options.date);
  const dayFolderName = date.toISOString().split('T')[0];
  let storedFilePath = null;

  if (options.file && fs.existsSync(options.file)) {
    const dayFolderPath = path.join(root, dayFolderName);
    ensureDir(dayFolderPath);
    const safeName = `${Date.now()}-${path.basename(options.file)}`;
    storedFilePath = path.join(dayFolderName, safeName);
    fs.copyFileSync(options.file, path.join(root, storedFilePath));
  }

  const entry = {
    id: Math.random().toString(36).substring(2, 11),
    timestamp: new Date().toISOString(),
    originalDate: options.date,
    group: options.group,
    type: options.type,
    sender: options.sender,
    summary: options.summary,
    file: storedFilePath
  };

  timeline.entries.push(entry);
  saveTimeline(timeline);
  return entry;
}

export function setGroupInfo(options) {
  const timeline = loadTimeline();
  if (!timeline.groups[options.group]) timeline.groups[options.group] = { info: {}, daily_summaries: {} };
  
  timeline.groups[options.group].info = {
    description: options.desc,
    participants: (options.participants || '').split(',').map(p => p.trim())
  };
  
  saveTimeline(timeline);
}

export function setDailySummary(options) {
  const timeline = loadTimeline();
  if (!timeline.groups[options.group]) timeline.groups[options.group] = { info: {}, daily_summaries: {} };
  
  timeline.groups[options.group].daily_summaries[options.date] = options.summary;
  
  saveTimeline(timeline);
}

// CLI definition
const isMain = import.meta.url === `file://${fs.realpathSync(process.argv[1])}` || process.argv[1].endsWith('remember-when');

if (isMain) {
  program
    .name('remember-when')
    .description('Local storage system for your digital memories')
    .version(pkg.version);

  program.command('add')
    .description('Registers a new memory entry')
    .requiredOption('-g, --group <group>', 'Group identifier')
    .requiredOption('-t, --type <type>', 'Entry type (text, photo, etc.)')
    .requiredOption('-s, --sender <sender>', 'Who sent it')
    .requiredOption('-r, --summary <summary>', 'Entry description')
    .option('-d, --date <date>', 'ISO Date', new Date().toISOString())
    .option('-f, --file <path>', 'Local file path')
    .action((options) => {
      try {
        const entry = addEntry(options);
        console.log(`[remember-when] Added entry to ${options.group} | ID: ${entry.id}`);
      } catch (err) {
        console.error(`[remember-when] Error: ${err.message}`);
        process.exit(1);
      }
    });

  program.command('set-group-info')
    .description('Updates context information for a group')
    .requiredOption('-g, --group <group>', 'Group identifier')
    .requiredOption('-d, --desc <description>', 'What is this group about?')
    .requiredOption('-p, --participants <participants>', 'List of members (comma separated)')
    .action((options) => {
      setGroupInfo(options);
      console.log(`[remember-when] Group info updated for: ${options.group}`);
    });

  program.command('set-daily-summary')
    .description('Sets a brief summary for a specific day')
    .requiredOption('-g, --group <group>', 'Group identifier')
    .requiredOption('-s, --summary <summary>', 'What happened today?')
    .option('-d, --date <date>', 'Date (YYYY-MM-DD)', new Date().toISOString().split('T')[0])
    .action((options) => {
      setDailySummary(options);
      console.log(`[remember-when] Daily summary updated for ${options.group} on ${options.date}`);
    });

  program.command('inventory')
    .description('Shows missing information (context or summaries)')
    .action(() => {
      const timeline = loadTimeline();
      console.log('\n--- REMEMBER-WHEN INVENTORY ---');
      
      if (timeline.entries.length === 0) {
        console.log('No entries found yet. Use "add" to begin.');
        return;
      }

      const allGroups = [...new Set(timeline.entries.map(e => e.group))];
      
      allGroups.forEach(groupName => {
        console.log(`\nGroup: ${groupName}`);
        const group = timeline.groups[groupName];
        
        if (!group || !group.info || !group.info.description) {
          console.log(' [!] MISSING: Group description and participants. Use set-group-info.');
        } else {
          console.log(' [ok] Group info present.');
        }
        
        const daysWithEntries = [...new Set(timeline.entries
          .filter(e => e.group === groupName)
          .map(e => e.originalDate.split('T')[0]))];
        
        const missingDays = daysWithEntries.filter(day => !group || !group.daily_summaries[day]);
        
        if (missingDays.length > 0) {
          console.log(` [!] MISSING: Daily summaries for: ${missingDays.join(', ')}`);
        } else {
          console.log(' [ok] All active days have summaries.');
        }
      });
      console.log('\n');
    });

  program.parse();
}
