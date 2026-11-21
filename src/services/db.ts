import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type {
  AppSettings,
  AttemptLog,
  ChildProfile,
  ConfusionPair,
  DailyMission,
  ExportBundle,
  SkillMastery,
} from '../types';

interface MundoPalavrasDB extends DBSchema {
  settings: {
    key: string;
    value: AppSettings;
  };
  profiles: {
    key: string;
    value: ChildProfile;
  };
  masteries: {
    key: string;
    value: SkillMastery;
    indexes: { 'by-child': string };
  };
  confusions: {
    key: string;
    value: ConfusionPair;
    indexes: { 'by-child': string };
  };
  attempts: {
    key: string;
    value: AttemptLog;
    indexes: { 'by-child': string };
  };
  missions: {
    key: string;
    value: DailyMission;
    indexes: { 'by-child': string };
  };
}

const DB_NAME = 'mundo-das-palavras-db';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<MundoPalavrasDB>> | null = null;

export function getDB(): Promise<IDBPDatabase<MundoPalavrasDB>> {
  if (!dbPromise) {
    dbPromise = openDB<MundoPalavrasDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('profiles')) {
          db.createObjectStore('profiles', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('masteries')) {
          const store = db.createObjectStore('masteries', { keyPath: 'id' });
          store.createIndex('by-child', 'childId');
        }
        if (!db.objectStoreNames.contains('confusions')) {
          const store = db.createObjectStore('confusions', { keyPath: 'id' });
          store.createIndex('by-child', 'childId');
        }
        if (!db.objectStoreNames.contains('attempts')) {
          const store = db.createObjectStore('attempts', { keyPath: 'id' });
          store.createIndex('by-child', 'childId');
        }
        if (!db.objectStoreNames.contains('missions')) {
          const store = db.createObjectStore('missions', { keyPath: 'id' });
          store.createIndex('by-child', 'childId');
        }
      },
    });
  }
  return dbPromise;
}

export function resetDBConnectionForTests(): void {
  dbPromise = null;
}

export async function getSettings(): Promise<AppSettings> {
  const db = await getDB();
  const existing = await db.get('settings', 'global');
  if (existing) return existing;
  const initial: AppSettings = {
    id: 'global',
    parentPin: '1234',
    activeChildId: null,
  };
  await db.put('settings', initial);
  return initial;
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  const db = await getDB();
  await db.put('settings', settings);
}

export async function getAllProfiles(): Promise<ChildProfile[]> {
  const db = await getDB();
  return db.getAll('profiles');
}

export async function getProfile(id: string): Promise<ChildProfile | undefined> {
  const db = await getDB();
  return db.get('profiles', id);
}

export async function saveProfile(profile: ChildProfile): Promise<void> {
  const db = await getDB();
  await db.put('profiles', profile);
}

export async function getMasteriesByChild(childId: string): Promise<SkillMastery[]> {
  const db = await getDB();
  return db.getAllFromIndex('masteries', 'by-child', childId);
}

export async function saveMastery(mastery: SkillMastery): Promise<void> {
  const db = await getDB();
  await db.put('masteries', mastery);
}

export async function getConfusionsByChild(childId: string): Promise<ConfusionPair[]> {
  const db = await getDB();
  return db.getAllFromIndex('confusions', 'by-child', childId);
}

export async function saveConfusion(confusion: ConfusionPair): Promise<void> {
  const db = await getDB();
  await db.put('confusions', confusion);
}

export async function getAttemptsByChild(childId: string): Promise<AttemptLog[]> {
  const db = await getDB();
  const list = await db.getAllFromIndex('attempts', 'by-child', childId);
  return list.sort((a, b) => b.timestamp - a.timestamp);
}

export async function saveAttempt(attempt: AttemptLog): Promise<void> {
  const db = await getDB();
  await db.put('attempts', attempt);
}

export async function getMission(childId: string, date: string): Promise<DailyMission | undefined> {
  const db = await getDB();
  return db.get('missions', `${childId}:${date}`);
}

export async function getMissionsByChild(childId: string): Promise<DailyMission[]> {
  const db = await getDB();
  return db.getAllFromIndex('missions', 'by-child', childId);
}

export async function saveMission(mission: DailyMission): Promise<void> {
  const db = await getDB();
  await db.put('missions', mission);
}

export async function exportChildBundle(childId: string): Promise<ExportBundle | null> {
  const profile = await getProfile(childId);
  if (!profile) return null;
  const [masteries, confusions, attempts, missions] = await Promise.all([
    getMasteriesByChild(childId),
    getConfusionsByChild(childId),
    getAttemptsByChild(childId),
    getMissionsByChild(childId),
  ]);
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    profile,
    masteries,
    confusions,
    attempts,
    missions,
  };
}

export async function importChildBundle(bundle: ExportBundle): Promise<ChildProfile> {
  const db = await getDB();
  const tx = db.transaction(
    ['profiles', 'masteries', 'confusions', 'attempts', 'missions'],
    'readwrite'
  );
  await tx.objectStore('profiles').put(bundle.profile);
  for (const m of bundle.masteries) {
    await tx.objectStore('masteries').put(m);
  }
  for (const c of bundle.confusions) {
    await tx.objectStore('confusions').put(c);
  }
  for (const a of bundle.attempts) {
    await tx.objectStore('attempts').put(a);
  }
  for (const mi of bundle.missions) {
    await tx.objectStore('missions').put(mi);
  }
  await tx.done;
  return bundle.profile;
}

async function clearChildStoreRecords(
  childId: string,
  storeName: 'masteries' | 'confusions' | 'attempts' | 'missions'
): Promise<void> {
  const db = await getDB();
  const keys = await db.getAllKeysFromIndex(storeName, 'by-child', childId);
  const tx = db.transaction(storeName, 'readwrite');
  for (const key of keys) {
    await tx.store.delete(key);
  }
  await tx.done;
}

export async function resetChildProgress(childId: string): Promise<ChildProfile | null> {
  const profile = await getProfile(childId);
  if (!profile) return null;

  await Promise.all([
    clearChildStoreRecords(childId, 'masteries'),
    clearChildStoreRecords(childId, 'confusions'),
    clearChildStoreRecords(childId, 'attempts'),
    clearChildStoreRecords(childId, 'missions'),
  ]);

  const resetProfile: ChildProfile = {
    ...profile,
    diagnosticCompleted: false,
    currentLevel: 1,
    stars: 0,
    streakDays: 0,
    unlockedWorlds: [1],
    badges: [],
    collectibles: [],
  };
  await saveProfile(resetProfile);
  return resetProfile;
}

export async function deleteChildProfile(childId: string): Promise<void> {
  const db = await getDB();
  await Promise.all([
    clearChildStoreRecords(childId, 'masteries'),
    clearChildStoreRecords(childId, 'confusions'),
    clearChildStoreRecords(childId, 'attempts'),
    clearChildStoreRecords(childId, 'missions'),
    db.delete('profiles', childId),
  ]);
  const settings = await getSettings();
  if (settings.activeChildId === childId) {
    const remaining = await getAllProfiles();
    await saveSettings({
      ...settings,
      activeChildId: remaining[0]?.id ?? null,
    });
  }
}
