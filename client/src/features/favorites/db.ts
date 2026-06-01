/**
 * IndexedDB helpers via the `idb` wrapper.
 *
 * Full Meal objects are stored so favorites are readable offline without
 * any network access. The store is keyed by idMeal (a string).
 */

import { openDB, type IDBPDatabase } from 'idb';
import type { Meal } from '@/lib/api';

const DB_NAME    = 'recipebox-db';
const STORE_NAME = 'favorites';
const DB_VERSION = 1;

let _db: Promise<IDBPDatabase> | null = null;

function getDb(): Promise<IDBPDatabase> {
  if (!_db) {
    _db = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'idMeal' });
        }
      },
    });
  }
  return _db;
}

export async function saveFavorite(meal: Meal): Promise<void> {
  const db = await getDb();
  await db.put(STORE_NAME, meal);
}

export async function removeFavorite(id: string): Promise<void> {
  const db = await getDb();
  await db.delete(STORE_NAME, id);
}

export async function getFavorite(id: string): Promise<Meal | undefined> {
  const db = await getDb();
  return db.get(STORE_NAME, id) as Promise<Meal | undefined>;
}

export async function getAllFavorites(): Promise<Meal[]> {
  const db = await getDb();
  return db.getAll(STORE_NAME) as Promise<Meal[]>;
}

export async function isFavorite(id: string): Promise<boolean> {
  const db = await getDb();
  const count = await db.count(STORE_NAME, id);
  return count > 0;
}
