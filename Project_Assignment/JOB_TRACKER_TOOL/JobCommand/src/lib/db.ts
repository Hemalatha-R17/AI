import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { Job, UserProfile, ResumeEntry, Bookmark } from '../types';

interface AppDB extends DBSchema {
  jobs:      { key: string; value: Job };
  profiles:  { key: string; value: UserProfile };
  settings:  { key: string; value: { id: string; data: string } };
  resumes:   { key: string; value: ResumeEntry };
  bookmarks: { key: string; value: Bookmark };
}

let _db: IDBPDatabase<AppDB> | null = null;

async function getDb(): Promise<IDBPDatabase<AppDB>> {
  if (_db) return _db;
  _db = await openDB<AppDB>('jobcommand-v1', 3, {
    upgrade(db, oldVersion) {
      if (oldVersion < 1) {
        db.createObjectStore('jobs',     { keyPath: 'id' });
        db.createObjectStore('profiles', { keyPath: 'id' });
        db.createObjectStore('settings', { keyPath: 'id' });
      }
      if (oldVersion < 2) {
        db.createObjectStore('resumes', { keyPath: 'id' });
      }
      if (oldVersion < 3) {
        db.createObjectStore('bookmarks', { keyPath: 'id' });
      }
    },
  });
  return _db;
}

export async function dbGetJobs(): Promise<Job[]> {
  const db = await getDb();
  return db.getAll('jobs');
}

export async function dbSaveJob(job: Job): Promise<void> {
  const db = await getDb();
  await db.put('jobs', job);
}

export async function dbDeleteJob(id: string): Promise<void> {
  const db = await getDb();
  await db.delete('jobs', id);
}

export async function dbGetProfiles(): Promise<UserProfile[]> {
  const db = await getDb();
  return db.getAll('profiles');
}

export async function dbSaveProfile(profile: UserProfile): Promise<void> {
  const db = await getDb();
  await db.put('profiles', profile);
}

export async function dbGetSetting(id: string): Promise<string | null> {
  const db = await getDb();
  const row = await db.get('settings', id);
  return row ? row.data : null;
}

export async function dbSetSetting(id: string, data: string): Promise<void> {
  const db = await getDb();
  await db.put('settings', { id, data });
}

export async function dbGetResumes(): Promise<ResumeEntry[]> {
  const db = await getDb();
  return db.getAll('resumes');
}

export async function dbSaveResume(r: ResumeEntry): Promise<void> {
  const db = await getDb();
  await db.put('resumes', r);
}

export async function dbDeleteResume(id: string): Promise<void> {
  const db = await getDb();
  await db.delete('resumes', id);
}

export async function dbClear(): Promise<void> {
  const db = await getDb();
  await db.clear('jobs');
}

export async function dbGetBookmarks(): Promise<Bookmark[]> {
  const db = await getDb();
  return db.getAll('bookmarks');
}

export async function dbSaveBookmark(b: Bookmark): Promise<void> {
  const db = await getDb();
  await db.put('bookmarks', b);
}

export async function dbDeleteBookmark(id: string): Promise<void> {
  const db = await getDb();
  await db.delete('bookmarks', id);
}

export async function dbExport(): Promise<{ jobs: Job[]; profiles: UserProfile[] }> {
  const [jobs, profiles] = await Promise.all([dbGetJobs(), dbGetProfiles()]);
  return { jobs, profiles };
}
