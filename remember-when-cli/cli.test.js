import fs from 'fs';
import path from 'path';
import os from 'os';

const testDir = path.join(os.tmpdir(), `remember-when-test-${Date.now()}`);
process.env.REMEMBER_WHEN_TEST_DIR = testDir;

import {
  doInstall,
  addEntry,
  setGroupInfo,
  setDailySummary,
  loadInventory,
  loadCollection,
  loadCollectionIndex,
  createCrossCollection,
  addToCrossCollection,
  listCrossCollections,
  showCrossCollection,
  setRule,
  listRules,
  getEnrichmentConfig,
  setDailyContext,
  enrichEntry,
  findEnrichedInterestPoint
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
    const invPath = path.join(testDir, 'inventory.json');
    if (fs.existsSync(invPath)) fs.unlinkSync(invPath);
    if (fs.existsSync(testDir)) {
      const entries = fs.readdirSync(testDir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isDirectory()) {
          fs.rmSync(path.join(testDir, entry.name), { recursive: true, force: true });
        }
      }
    }
  });

  describe('install', () => {
    it('should initialize storage with inventory.json', () => {
      const result = doInstall();
      expect(result.root).toBe(testDir);
      expect(fs.existsSync(path.join(testDir, 'inventory.json'))).toBe(true);
      const inv = loadInventory();
      expect(inv.version).toBe('2.0');
      expect(inv.groups).toEqual({});
    });
  });

  describe('addEntry', () => {
    it('should add a text entry and create group structure', () => {
      const entry = addEntry({
        group: 'TestGroup',
        type: 'text',
        sender: 'Jest',
        summary: 'Unit test entry',
        date: '2026-04-10T12:00:00.000Z'
      });

      expect(entry.id).toBeDefined();
      expect(entry.date).toBe('2026-04-10');
      expect(entry.type).toBe('text');

      const inv = loadInventory();
      expect(inv.groups['TestGroup']).toBeDefined();

      const col = loadCollection('TestGroup', '2026-04-10');
      expect(col.entries).toHaveLength(1);
      expect(col.entries[0].summary).toBe('Unit test entry');
    });

    it('should copy file to group/date folder', () => {
      const tempFile = path.join(testDir, 'test-img.jpg');
      fs.writeFileSync(tempFile, 'fake-image');

      const entry = addEntry({
        group: 'FileGroup',
        type: 'photo',
        sender: 'Jest',
        summary: 'Photo test',
        date: '2026-04-10T10:00:00.000Z',
        file: tempFile
      });

      expect(entry.file).toBeDefined();
      const storedPath = path.join(testDir, 'FileGroup', '2026-04-10', entry.file);
      expect(fs.existsSync(storedPath)).toBe(true);
      expect(fs.readFileSync(storedPath, 'utf8')).toBe('fake-image');
    });

    it('should update collection index after add', () => {
      addEntry({
        group: 'IdxGroup',
        type: 'text',
        sender: 'Jest',
        summary: 'Index test',
        date: '2026-04-11T12:00:00.000Z'
      });

      const index = loadCollectionIndex('IdxGroup');
      expect(index.collections['2026-04-11']).toBeDefined();
      expect(index.collections['2026-04-11'].entries).toBe(1);
    });
  });

  describe('setGroupInfo', () => {
    it('should set group description and participants', () => {
      setGroupInfo({
        group: 'MyGroup',
        desc: 'A test group',
        participants: 'Alice, Bob, Charlie'
      });

      const inv = loadInventory();
      expect(inv.groups['MyGroup'].description).toBe('A test group');
      expect(inv.groups['MyGroup'].participants).toEqual(['Alice', 'Bob', 'Charlie']);
    });

    it('should create group folder structure', () => {
      setGroupInfo({
        group: 'FolderGroup',
        desc: 'Folder test',
        participants: 'User1'
      });

      expect(fs.existsSync(path.join(testDir, 'FolderGroup'))).toBe(true);
      expect(fs.existsSync(path.join(testDir, 'FolderGroup', 'collection-index.json'))).toBe(true);
      expect(fs.existsSync(path.join(testDir, 'FolderGroup', 'rules.json'))).toBe(true);
      expect(fs.existsSync(path.join(testDir, 'FolderGroup', 'cross'))).toBe(true);
    });
  });

  describe('setDailySummary', () => {
    it('should set daily summary on collection', () => {
      setGroupInfo({ group: 'SumGroup', desc: 'Test', participants: 'A' });
      setDailySummary({
        group: 'SumGroup',
        date: '2026-04-10',
        summary: 'A great day'
      });

      const col = loadCollection('SumGroup', '2026-04-10');
      expect(col.dailySummary).toBe('A great day');
    });
  });

  describe('cross collections', () => {
    beforeEach(() => {
      setGroupInfo({ group: 'CrossGroup', desc: 'Cross test', participants: 'A, B' });
      addEntry({ group: 'CrossGroup', type: 'text', sender: 'A', summary: 'Entry 1', date: '2026-04-10T12:00:00.000Z' });
      addEntry({ group: 'CrossGroup', type: 'photo', sender: 'B', summary: 'Entry 2', date: '2026-04-11T12:00:00.000Z' });
    });

    it('should create a cross collection', () => {
      const cross = createCrossCollection({
        group: 'CrossGroup',
        name: 'viatge-paris',
        displayName: 'Viatge a Paris',
        desc: 'Tot el viatge'
      });

      expect(cross.name).toBe('viatge-paris');
      expect(cross.displayName).toBe('Viatge a Paris');
      expect(cross.references).toHaveLength(0);

      const index = loadCollectionIndex('CrossGroup');
      expect(index.crossCollections).toContain('viatge-paris');
    });

    it('should throw if cross collection already exists', () => {
      createCrossCollection({ group: 'CrossGroup', name: 'dup' });
      expect(() => createCrossCollection({ group: 'CrossGroup', name: 'dup' })).toThrow('already exists');
    });

    it('should add references to cross collection', () => {
      const col1 = loadCollection('CrossGroup', '2026-04-10');
      const col2 = loadCollection('CrossGroup', '2026-04-11');

      createCrossCollection({ group: 'CrossGroup', name: 'viatge' });
      addToCrossCollection({ group: 'CrossGroup', cross: 'viatge', date: '2026-04-10', entryId: col1.entries[0].id });
      addToCrossCollection({ group: 'CrossGroup', cross: 'viatge', date: '2026-04-11', entryId: col2.entries[0].id });

      const shown = showCrossCollection({ group: 'CrossGroup', cross: 'viatge' });
      expect(shown.resolvedEntries).toHaveLength(2);
      expect(shown.resolvedEntries[0].summary).toBe('Entry 1');
      expect(shown.resolvedEntries[1].summary).toBe('Entry 2');
    });

    it('should not add duplicate references', () => {
      const col = loadCollection('CrossGroup', '2026-04-10');
      createCrossCollection({ group: 'CrossGroup', name: 'nodup' });
      addToCrossCollection({ group: 'CrossGroup', cross: 'nodup', date: '2026-04-10', entryId: col.entries[0].id });
      addToCrossCollection({ group: 'CrossGroup', cross: 'nodup', date: '2026-04-10', entryId: col.entries[0].id });

      const shown = showCrossCollection({ group: 'CrossGroup', cross: 'nodup' });
      expect(shown.resolvedEntries).toHaveLength(1);
    });

    it('should list cross collections', () => {
      createCrossCollection({ group: 'CrossGroup', name: 'cc1', displayName: 'CC One' });
      createCrossCollection({ group: 'CrossGroup', name: 'cc2', displayName: 'CC Two' });

      const list = listCrossCollections('CrossGroup');
      expect(list).toHaveLength(2);
      expect(list[0].name).toBe('cc1');
      expect(list[1].name).toBe('cc2');
    });
  });

  describe('rules', () => {
    it('should add and list rules', () => {
      setGroupInfo({ group: 'RuleGroup', desc: 'Rule test', participants: 'A' });

      setRule({
        group: 'RuleGroup',
        trigger: 'keyword',
        pattern: 'viatge|viaje',
        action: 'suggest-cross',
        crossCollection: 'viatges'
      });

      setRule({
        group: 'RuleGroup',
        trigger: 'location',
        pattern: 'Paris',
        action: 'create-cross',
        crossCollection: 'viatge-paris'
      });

      const rules = listRules('RuleGroup');
      expect(rules).toHaveLength(2);
      expect(rules[0].trigger).toBe('keyword');
      expect(rules[0].pattern).toBe('viatge|viaje');
      expect(rules[1].crossCollection).toBe('viatge-paris');
    });

    it('should have default enrichment config', () => {
      setGroupInfo({ group: 'EnrichConfigGroup', desc: 'Test', participants: 'A' });
      const config = getEnrichmentConfig('EnrichConfigGroup');
      expect(config.dailyContext.enabled).toBe(true);
      expect(config.dailyContext.sources).toContain('weather');
      expect(config.interestPoints.enabled).toBe(true);
      expect(config.interestPoints.dedupByGroup).toBe(true);
    });
  });

  describe('contextual enrichment', () => {
    beforeEach(() => {
      setGroupInfo({ group: 'EnrichGroup', desc: 'Enrichment test', participants: 'A, B' });
    });

    it('should set daily context on a collection', () => {
      setDailyContext({
        group: 'EnrichGroup',
        date: '2026-04-10',
        weather: '22C, sunny, Barcelona',
        news: 'New park inaugurated',
        historicalEvents: '10 April: First subway line opened (1924)'
      });

      const col = loadCollection('EnrichGroup', '2026-04-10');
      expect(col.dailyContext.weather).toBe('22C, sunny, Barcelona');
      expect(col.dailyContext.news).toBe('New park inaugurated');
      expect(col.dailyContext.historicalEvents).toBe('10 April: First subway line opened (1924)');
    });

    it('should partially update daily context', () => {
      setDailyContext({ group: 'EnrichGroup', date: '2026-04-11', weather: '18C, cloudy' });
      setDailyContext({ group: 'EnrichGroup', date: '2026-04-11', news: 'Concert tonight' });

      const col = loadCollection('EnrichGroup', '2026-04-11');
      expect(col.dailyContext.weather).toBe('18C, cloudy');
      expect(col.dailyContext.news).toBe('Concert tonight');
    });

    it('should enrich an entry with history and location', () => {
      addEntry({ group: 'EnrichGroup', type: 'interest_point', sender: 'A', summary: 'Sagrada Familia', date: '2026-04-10T12:00:00.000Z' });
      const col = loadCollection('EnrichGroup', '2026-04-10');
      const entryId = col.entries[0].id;

      const entry = enrichEntry({
        group: 'EnrichGroup',
        date: '2026-04-10',
        entryId,
        history: 'Designed by Gaudi, started in 1882',
        enrichType: 'Basilica',
        location: 'Barcelona, Spain'
      });

      expect(entry.enrichment.history).toBe('Designed by Gaudi, started in 1882');
      expect(entry.enrichment.type).toBe('Basilica');
      expect(entry.enrichment.location).toBe('Barcelona, Spain');

      const reloaded = loadCollection('EnrichGroup', '2026-04-10');
      expect(reloaded.entries[0].enrichment.history).toBe('Designed by Gaudi, started in 1882');
    });

    it('should throw if entry not found for enrichment', () => {
      expect(() => enrichEntry({
        group: 'EnrichGroup',
        date: '2026-04-10',
        entryId: 'nonexistent',
        history: 'test'
      })).toThrow('not found');
    });

    it('should enrich with extra JSON data', () => {
      addEntry({ group: 'EnrichGroup', type: 'interest_point', sender: 'A', summary: 'Park Guell', date: '2026-04-11T12:00:00.000Z' });
      const col = loadCollection('EnrichGroup', '2026-04-11');
      const entryId = col.entries[0].id;

      const entry = enrichEntry({
        group: 'EnrichGroup',
        date: '2026-04-11',
        entryId,
        extra: '{"architect":"Gaudi","year":1914}'
      });

      expect(entry.enrichment.architect).toBe('Gaudi');
      expect(entry.enrichment.year).toBe(1914);
    });

    it('should find an already enriched interest point (dedup)', () => {
      addEntry({ group: 'EnrichGroup', type: 'interest_point', sender: 'A', summary: 'Colosseum', date: '2026-04-10T12:00:00.000Z' });
      const col = loadCollection('EnrichGroup', '2026-04-10');
      enrichEntry({
        group: 'EnrichGroup',
        date: '2026-04-10',
        entryId: col.entries[0].id,
        history: 'Built in 70-80 AD'
      });

      const found = findEnrichedInterestPoint('EnrichGroup', 'Colosseum');
      expect(found).not.toBeNull();
      expect(found.entry.enrichment.history).toBe('Built in 70-80 AD');
    });

    it('should return null if interest point not enriched', () => {
      addEntry({ group: 'EnrichGroup', type: 'interest_point', sender: 'A', summary: 'Taj Mahal', date: '2026-04-12T12:00:00.000Z' });
      const found = findEnrichedInterestPoint('EnrichGroup', 'Taj Mahal');
      expect(found).toBeNull();
    });
  });
});
