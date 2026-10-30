import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { CapturedPhoto, Creation, PhotoSession } from '../types';

interface SnapboothDB extends DBSchema {
  photos: {
    key: string;
    value: CapturedPhoto;
    indexes: { 'by-date': Date };
  };
  sessions: {
    key: string;
    value: PhotoSession;
    indexes: { 'by-date': Date };
  };
  creations: {
    key: string;
    value: Creation;
    indexes: { 'by-date': Date };
  };
}

let db: IDBPDatabase<SnapboothDB> | null = null;

async function getDB(): Promise<IDBPDatabase<SnapboothDB>> {
  if (db) return db;
  db = await openDB<SnapboothDB>('snapbooth-db', 2, {
    upgrade(database, oldVersion) {
      if (oldVersion < 1) {
        const photoStore = database.createObjectStore('photos', { keyPath: 'id' });
        photoStore.createIndex('by-date', 'capturedAt');

        const sessionStore = database.createObjectStore('sessions', { keyPath: 'id' });
        sessionStore.createIndex('by-date', 'createdAt');
      }
      if (oldVersion < 2) {
        const creationStore = database.createObjectStore('creations', { keyPath: 'id' });
        creationStore.createIndex('by-date', 'uploadedAt');
      }
    },
  });
  return db;
}

// Photos
export async function savePhoto(photo: CapturedPhoto): Promise<void> {
  const database = await getDB();
  await database.put('photos', photo);
}

export async function getPhotos(): Promise<CapturedPhoto[]> {
  const database = await getDB();
  return database.getAllFromIndex('photos', 'by-date');
}

export async function deletePhoto(id: string): Promise<void> {
  const database = await getDB();
  await database.delete('photos', id);
}

// Sessions
export async function saveSession(session: PhotoSession): Promise<void> {
  const database = await getDB();
  await database.put('sessions', session);
}

export async function getSessions(): Promise<PhotoSession[]> {
  const database = await getDB();
  return database.getAllFromIndex('sessions', 'by-date');
}

export async function getSession(id: string): Promise<PhotoSession | undefined> {
  const database = await getDB();
  return database.get('sessions', id);
}

// Creations (Cloudinary uploads)
export async function saveCreation(creation: Creation): Promise<void> {
  const database = await getDB();
  await database.put('creations', creation);
}

export async function getCreations(): Promise<Creation[]> {
  const database = await getDB();
  const all = await database.getAllFromIndex('creations', 'by-date');
  return all.reverse();
}

export async function getCreation(id: string): Promise<Creation | undefined> {
  const database = await getDB();
  return database.get('creations', id);
}

export async function deleteCreation(id: string): Promise<void> {
  const database = await getDB();
  await database.delete('creations', id);
}

export async function updateCreation(creation: Creation): Promise<void> {
  const database = await getDB();
  await database.put('creations', creation);
}
