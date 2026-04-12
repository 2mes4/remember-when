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

export function getSymlinkPath() {
  const platform = os.platform();
  if (platform === 'win32') {
    return path.join(os.homedir(), 'Memories');
  }
  return path.join(os.homedir(), 'Memories');
}

export function getInventoryPath() {
  return path.join(getStorageRoot(), 'inventory.json');
}

export function getGroupPath(groupName) {
  return path.join(getStorageRoot(), groupName);
}

export function getCollectionPath(groupName, date) {
  return path.join(getStorageRoot(), groupName, date);
}

export function getCrossPath(groupName) {
  return path.join(getStorageRoot(), groupName, 'cross');
}

export function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export function readJson(filePath) {
  if (!fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (e) {
    return null;
  }
}

export function writeJson(filePath, data) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

export function loadInventory() {
  const invPath = getInventoryPath();
  const inv = readJson(invPath);
  if (!inv) {
    return { version: '2.0', groups: {} };
  }
  return inv;
}

export function saveInventory(inventory) {
  writeJson(getInventoryPath(), inventory);
}

export function ensureGroupExists(groupName) {
  const root = getStorageRoot();
  const groupPath = getGroupPath(groupName);
  ensureDir(groupPath);
  ensureDir(path.join(groupPath, 'cross'));

  const inventory = loadInventory();
  if (!inventory.groups[groupName]) {
    inventory.groups[groupName] = {
      description: '',
      participants: [],
      createdAt: new Date().toISOString()
    };
    saveInventory(inventory);
  }

  const indexPath = path.join(groupPath, 'collection-index.json');
  if (!fs.existsSync(indexPath)) {
    writeJson(indexPath, {
      group: groupName,
      collections: {},
      crossCollections: []
    });
  }

  const rulesPath = path.join(groupPath, 'rules.json');
  if (!fs.existsSync(rulesPath)) {
    writeJson(rulesPath, {
      rules: [],
      enrichment: {
        dailyContext: {
          enabled: true,
          sources: ['weather', 'news', 'historicalEvents']
        },
        interestPoints: {
          enabled: true,
          sources: ['history', 'type', 'location'],
          dedupByGroup: true
        }
      }
    });
  }
}

export function loadCollectionIndex(groupName) {
  const indexPath = path.join(getGroupPath(groupName), 'collection-index.json');
  return readJson(indexPath) || { group: groupName, collections: {}, crossCollections: [] };
}

export function saveCollectionIndex(groupName, index) {
  writeJson(path.join(getGroupPath(groupName), 'collection-index.json'), index);
}

export function loadCollection(groupName, date) {
  const colPath = path.join(getCollectionPath(groupName, date), 'collection.json');
  return readJson(colPath) || { date, dailySummary: '', entries: [] };
}

export function saveCollection(groupName, date, collection) {
  const colDir = getCollectionPath(groupName, date);
  ensureDir(colDir);
  writeJson(path.join(colDir, 'collection.json'), collection);
}

export function doInstall() {
  const root = getStorageRoot();
  const symlink = getSymlinkPath();

  ensureDir(root);

  const invPath = getInventoryPath();
  if (!fs.existsSync(invPath)) {
    writeJson(invPath, { version: '2.0', groups: {} });
  }

  let linked = false;
  if (!fs.existsSync(symlink)) {
    try {
      fs.symlinkSync(root, symlink, 'junction');
      linked = true;
    } catch (e) {
      // symlink may fail on some systems, non-fatal
    }
  }

  return { root, symlink, linked };
}

export function addEntry(options) {
  ensureGroupExists(options.group);

  const root = getStorageRoot();
  const date = new Date(options.date);
  const dayFolderName = date.toISOString().split('T')[0];

  let storedFileName = null;
  if (options.file && fs.existsSync(options.file)) {
    const colDir = getCollectionPath(options.group, dayFolderName);
    ensureDir(colDir);
    const safeName = `${Date.now()}-${path.basename(options.file)}`;
    fs.copyFileSync(options.file, path.join(colDir, safeName));
    storedFileName = safeName;
  }

  const entry = {
    id: Math.random().toString(36).substring(2, 11),
    timestamp: new Date().toISOString(),
    type: options.type,
    sender: options.sender,
    summary: options.summary,
    file: storedFileName
  };

  const collection = loadCollection(options.group, dayFolderName);
  collection.entries.push(entry);
  saveCollection(options.group, dayFolderName, collection);

  const index = loadCollectionIndex(options.group);
  index.collections[dayFolderName] = {
    entries: collection.entries.length,
    hasFiles: collection.entries.some(e => e.file !== null)
  };
  saveCollectionIndex(options.group, index);

  return { ...entry, date: dayFolderName };
}

export function setGroupInfo(options) {
  ensureGroupExists(options.group);

  const inventory = loadInventory();
  inventory.groups[options.group].description = options.desc;
  inventory.groups[options.group].participants = (options.participants || '').split(',').map(p => p.trim());
  saveInventory(inventory);
}

export function setDailySummary(options) {
  ensureGroupExists(options.group);

  const collection = loadCollection(options.group, options.date);
  collection.dailySummary = options.summary;
  saveCollection(options.group, options.date, collection);

  const index = loadCollectionIndex(options.group);
  if (!index.collections[options.date]) {
    index.collections[options.date] = { entries: 0, hasFiles: false };
  }
  saveCollectionIndex(options.group, index);
}

export function createCrossCollection(options) {
  ensureGroupExists(options.group);

  const crossDir = getCrossPath(options.group);
  const crossName = options.name;
  const crossFilePath = path.join(crossDir, `${crossName}.json`);

  if (fs.existsSync(crossFilePath)) {
    throw new Error(`Cross collection '${crossName}' already exists in group '${options.group}'`);
  }

  const crossData = {
    name: crossName,
    displayName: options.displayName || crossName,
    description: options.desc || '',
    createdAt: new Date().toISOString(),
    references: []
  };

  writeJson(crossFilePath, crossData);

  const index = loadCollectionIndex(options.group);
  if (!index.crossCollections.includes(crossName)) {
    index.crossCollections.push(crossName);
    saveCollectionIndex(options.group, index);
  }

  return crossData;
}

export function addToCrossCollection(options) {
  const crossDir = getCrossPath(options.group);
  const crossFilePath = path.join(crossDir, `${options.cross}.json`);
  const crossData = readJson(crossFilePath);

  if (!crossData) {
    throw new Error(`Cross collection '${options.cross}' not found in group '${options.group}'`);
  }

  const alreadyExists = crossData.references.some(
    ref => ref.date === options.date && ref.entryId === options.entryId
  );
  if (alreadyExists) {
    return crossData;
  }

  crossData.references.push({
    date: options.date,
    entryId: options.entryId
  });

  writeJson(crossFilePath, crossData);
  return crossData;
}

export function listCrossCollections(groupName) {
  const index = loadCollectionIndex(groupName);
  const crossDir = getCrossPath(groupName);
  const results = [];

  for (const name of index.crossCollections) {
    const crossData = readJson(path.join(crossDir, `${name}.json`));
    if (crossData) {
      results.push({
        name: crossData.name,
        displayName: crossData.displayName,
        description: crossData.description,
        referenceCount: crossData.references.length
      });
    }
  }

  return results;
}

export function showCrossCollection(options) {
  const crossFilePath = path.join(getCrossPath(options.group), `${options.cross}.json`);
  const crossData = readJson(crossFilePath);

  if (!crossData) {
    throw new Error(`Cross collection '${options.cross}' not found in group '${options.group}'`);
  }

  const resolvedEntries = [];
  for (const ref of crossData.references) {
    const collection = loadCollection(options.group, ref.date);
    const entry = collection.entries.find(e => e.id === ref.entryId);
    if (entry) {
      resolvedEntries.push({ ...entry, date: ref.date });
    }
  }

  return {
    ...crossData,
    resolvedEntries
  };
}

export function setRule(options) {
  ensureGroupExists(options.group);

  const rulesPath = path.join(getGroupPath(options.group), 'rules.json');
  const rulesData = readJson(rulesPath) || { rules: [] };

  rulesData.rules.push({
    trigger: options.trigger,
    pattern: options.pattern,
    action: options.action,
    crossCollection: options.crossCollection || null
  });

  writeJson(rulesPath, rulesData);
  return rulesData;
}

export function listRules(groupName) {
  const rulesPath = path.join(getGroupPath(groupName), 'rules.json');
  const rulesData = readJson(rulesPath);
  return rulesData ? rulesData.rules : [];
}

export function getEnrichmentConfig(groupName) {
  const rulesPath = path.join(getGroupPath(groupName), 'rules.json');
  const rulesData = readJson(rulesPath);
  if (!rulesData || !rulesData.enrichment) {
    return {
      dailyContext: { enabled: true, sources: ['weather', 'news', 'historicalEvents'] },
      interestPoints: { enabled: true, sources: ['history', 'type', 'location'], dedupByGroup: true }
    };
  }
  return rulesData.enrichment;
}

export function setDailyContext(options) {
  ensureGroupExists(options.group);

  const collection = loadCollection(options.group, options.date);
  if (!collection.dailyContext) {
    collection.dailyContext = {};
  }

  if (options.weather) collection.dailyContext.weather = options.weather;
  if (options.news) collection.dailyContext.news = options.news;
  if (options.historicalEvents) collection.dailyContext.historicalEvents = options.historicalEvents;

  saveCollection(options.group, options.date, collection);

  const index = loadCollectionIndex(options.group);
  if (!index.collections[options.date]) {
    index.collections[options.date] = { entries: 0, hasFiles: false };
  }
  saveCollectionIndex(options.group, index);

  return collection.dailyContext;
}

export function enrichEntry(options) {
  ensureGroupExists(options.group);

  const collection = loadCollection(options.group, options.date);
  const entry = collection.entries.find(e => e.id === options.entryId);

  if (!entry) {
    throw new Error(`Entry '${options.entryId}' not found in ${options.group}/${options.date}`);
  }

  if (!entry.enrichment) {
    entry.enrichment = {};
  }

  if (options.history) entry.enrichment.history = options.history;
  if (options.enrichType) entry.enrichment.type = options.enrichType;
  if (options.location) entry.enrichment.location = options.location;
  if (options.extra) {
    try {
      const extraData = JSON.parse(options.extra);
      entry.enrichment = { ...entry.enrichment, ...extraData };
    } catch (e) {
      // ignore invalid JSON
    }
  }

  saveCollection(options.group, options.date, collection);
  return entry;
}

export function findEnrichedInterestPoint(groupName, summary) {
  const index = loadCollectionIndex(groupName);
  const dates = Object.keys(index.collections);

  for (const date of dates) {
    const collection = loadCollection(groupName, date);
    for (const entry of collection.entries) {
      if (entry.type === 'interest_point' && entry.enrichment && entry.summary === summary) {
        return { date, entry };
      }
    }
  }
  return null;
}

// CLI definition
const isMain = import.meta.url === `file://${fs.realpathSync(process.argv[1])}` || process.argv[1].endsWith('remember-when');

if (isMain) {
  program
    .name('remember-when')
    .description('Local storage system for your digital memories')
    .version(pkg.version);

  program.command('install')
    .description('Initialize storage and create ~/Memories symlink')
    .action(() => {
      const result = doInstall();
      console.log(`[remember-when] Storage initialized at ${result.root}`);
      if (result.linked) {
        console.log(`[remember-when] Symlink created: ${result.symlink} -> ${result.root}`);
      } else {
        console.log(`[remember-when] Symlink already exists or could not be created.`);
      }
    });

  program.command('add')
    .description('Registers a new memory entry')
    .requiredOption('-g, --group <group>', 'Group identifier')
    .requiredOption('-t, --type <type>', 'Entry type (text, photo, interest_point, etc.)')
    .requiredOption('-s, --sender <sender>', 'Who sent it')
    .requiredOption('-r, --summary <summary>', 'Entry description')
    .option('-d, --date <date>', 'ISO Date', new Date().toISOString())
    .option('-f, --file <path>', 'Local file path')
    .action((options) => {
      try {
        const entry = addEntry(options);
        console.log(`[remember-when] Added entry to ${options.group}/${entry.date} | ID: ${entry.id}`);
      } catch (err) {
        console.error(`[remember-when] Error: ${err.message}`);
        process.exit(1);
      }
    });

  program.command('set-group-info')
    .description('Creates or updates a group with description and participants')
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
    .description('Shows groups, collections, and missing information')
    .action(() => {
      const inventory = loadInventory();
      console.log('\n--- REMEMBER-WHEN INVENTORY ---');
      console.log(`Version: ${inventory.version}\n`);

      const groupNames = Object.keys(inventory.groups);
      if (groupNames.length === 0) {
        console.log('No groups found yet. Use "set-group-info" to create one.');
        return;
      }

      groupNames.forEach(groupName => {
        const groupInfo = inventory.groups[groupName];
        console.log(`Group: ${groupName}`);
        console.log(`  Description: ${groupInfo.description || '[!] MISSING'}`);
        console.log(`  Participants: ${groupInfo.participants.length > 0 ? groupInfo.participants.join(', ') : '[!] MISSING'}`);

        const index = loadCollectionIndex(groupName);
        const dates = Object.keys(index.collections);
        console.log(`  Collections (${dates.length}):`);

        if (dates.length === 0) {
          console.log('    (no entries yet)');
        } else {
          dates.forEach(date => {
            const col = index.collections[date];
            const collection = loadCollection(groupName, date);
            const summaryStatus = collection.dailySummary ? 'summary' : '[!] no summary';
            console.log(`    ${date}: ${col.entries} entries, ${summaryStatus}`);
          });
        }

        if (index.crossCollections.length > 0) {
          console.log(`  Cross Collections: ${index.crossCollections.join(', ')}`);
        }

        const rules = listRules(groupName);
        if (rules.length > 0) {
          console.log(`  Rules: ${rules.length} active`);
        }

        console.log('');
      });
      console.log('');
    });

  program.command('create-cross')
    .description('Creates a cross collection within a group')
    .requiredOption('-g, --group <group>', 'Group identifier')
    .requiredOption('-n, --name <name>', 'Cross collection name (slug)')
    .option('--display-name <displayName>', 'Human-readable name')
    .option('-d, --desc <description>', 'Description')
    .action((options) => {
      try {
        const cross = createCrossCollection(options);
        console.log(`[remember-when] Cross collection '${cross.name}' created in ${options.group}`);
      } catch (err) {
        console.error(`[remember-when] Error: ${err.message}`);
        process.exit(1);
      }
    });

  program.command('add-to-cross')
    .description('Adds an entry reference to a cross collection')
    .requiredOption('-g, --group <group>', 'Group identifier')
    .requiredOption('-c, --cross <cross>', 'Cross collection name')
    .requiredOption('--date <date>', 'Date (YYYY-MM-DD) of the entry')
    .requiredOption('--entry-id <entryId>', 'Entry ID to reference')
    .action((options) => {
      try {
        addToCrossCollection(options);
        console.log(`[remember-when] Entry ${options.entryId} added to cross '${options.cross}' in ${options.group}`);
      } catch (err) {
        console.error(`[remember-when] Error: ${err.message}`);
        process.exit(1);
      }
    });

  program.command('list-cross')
    .description('Lists all cross collections in a group')
    .requiredOption('-g, --group <group>', 'Group identifier')
    .action((options) => {
      const crosses = listCrossCollections(options.group);
      if (crosses.length === 0) {
        console.log(`[remember-when] No cross collections in ${options.group}`);
        return;
      }
      console.log(`\nCross Collections in ${options.group}:`);
      crosses.forEach(c => {
        console.log(`  ${c.name} (${c.displayName}) - ${c.referenceCount} refs - ${c.description}`);
      });
      console.log('');
    });

  program.command('show-cross')
    .description('Shows the resolved entries of a cross collection')
    .requiredOption('-g, --group <group>', 'Group identifier')
    .requiredOption('-c, --cross <cross>', 'Cross collection name')
    .action((options) => {
      try {
        const result = showCrossCollection(options);
        console.log(`\nCross: ${result.displayName} (${result.name})`);
        console.log(`Description: ${result.description}`);
        console.log(`References: ${result.resolvedEntries.length}\n`);
        result.resolvedEntries.forEach(entry => {
          console.log(`  [${entry.date}] ${entry.type} from ${entry.sender}: ${entry.summary}${entry.file ? ` (file: ${entry.file})` : ''}`);
        });
        console.log('');
      } catch (err) {
        console.error(`[remember-when] Error: ${err.message}`);
        process.exit(1);
      }
    });

  program.command('set-rule')
    .description('Adds a rule to a group for automatic cross collection suggestions')
    .requiredOption('-g, --group <group>', 'Group identifier')
    .requiredOption('--trigger <trigger>', 'Trigger type (keyword, location)')
    .requiredOption('--pattern <pattern>', 'Pattern to match')
    .requiredOption('--action <action>', 'Action (suggest-cross, create-cross)')
    .option('--cross-collection <name>', 'Target cross collection name')
    .action((options) => {
      try {
        const rulesData = setRule(options);
        console.log(`[remember-when] Rule added to ${options.group}: ${options.trigger} "${options.pattern}" -> ${options.action}`);
      } catch (err) {
        console.error(`[remember-when] Error: ${err.message}`);
        process.exit(1);
      }
    });

  program.command('list-rules')
    .description('Lists all rules for a group')
    .requiredOption('-g, --group <group>', 'Group identifier')
    .action((options) => {
      const rules = listRules(options.group);
      if (rules.length === 0) {
        console.log(`[remember-when] No rules in ${options.group}`);
        return;
      }
      console.log(`\nRules for ${options.group}:`);
      rules.forEach((rule, i) => {
        console.log(`  ${i + 1}. ${rule.trigger} "${rule.pattern}" -> ${rule.action}${rule.crossCollection ? ` (${rule.crossCollection})` : ''}`);
      });
      console.log('');
    });

  program.command('set-daily-context')
    .description('Adds contextual information to a day (weather, news, historical events)')
    .requiredOption('-g, --group <group>', 'Group identifier')
    .requiredOption('-d, --date <date>', 'Date (YYYY-MM-DD)')
    .option('--weather <weather>', 'Weather description')
    .option('--news <news>', 'Relevant news')
    .option('--historical-events <events>', 'Historical events for this date')
    .action((options) => {
      try {
        const ctx = setDailyContext(options);
        console.log(`[remember-when] Daily context updated for ${options.group} on ${options.date}`);
        if (ctx.weather) console.log(`  Weather: ${ctx.weather}`);
        if (ctx.news) console.log(`  News: ${ctx.news}`);
        if (ctx.historicalEvents) console.log(`  Historical: ${ctx.historicalEvents}`);
      } catch (err) {
        console.error(`[remember-when] Error: ${err.message}`);
        process.exit(1);
      }
    });

  program.command('enrich-entry')
    .description('Adds enrichment data to a specific entry (history, location, etc.)')
    .requiredOption('-g, --group <group>', 'Group identifier')
    .requiredOption('--date <date>', 'Date (YYYY-MM-DD) of the entry')
    .requiredOption('--entry-id <entryId>', 'Entry ID to enrich')
    .option('--history <history>', 'Historical or background information')
    .option('--enrich-type <type>', 'Type classification of the place/subject')
    .option('--location <location>', 'Location description')
    .option('--extra <json>', 'Additional JSON data to merge into enrichment')
    .action((options) => {
      try {
        const entry = enrichEntry(options);
        console.log(`[remember-when] Entry ${options.entryId} enriched in ${options.group}/${options.date}`);
        if (entry.enrichment.history) console.log(`  History: ${entry.enrichment.history}`);
        if (entry.enrichment.type) console.log(`  Type: ${entry.enrichment.type}`);
        if (entry.enrichment.location) console.log(`  Location: ${entry.enrichment.location}`);
      } catch (err) {
        console.error(`[remember-when] Error: ${err.message}`);
        process.exit(1);
      }
    });

  program.parse();
}
