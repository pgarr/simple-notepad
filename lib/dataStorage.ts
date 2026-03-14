import { type SQLiteDatabase } from 'expo-sqlite';

const DATABASE_VERSION = 1;

export type Note = {
  id: number;
  title: string;
  note: string;
};

/** Use when creating a note; id is assigned by the database. */
export type NewNote = Omit<Note, 'id'>;

export const migrateDbIfNeeded = async (db: SQLiteDatabase) => {
  const meta = await db.getFirstAsync<{
    user_version: number;
  }>('PRAGMA user_version');
  if (meta && meta.user_version >= DATABASE_VERSION) {
    return;
  }
  if (!meta || meta.user_version === 0) {
    await db.execAsync(`
  PRAGMA journal_mode = 'wal';
  CREATE TABLE content (id INTEGER PRIMARY KEY NOT NULL, title TEXT NOT NULL, note TEXT NOT NULL);
  `);
  }
  await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
};

export const getAllNotes = async (db: SQLiteDatabase): Promise<Note[]> => {
  return await db.getAllAsync<Note>('SELECT * FROM content');
};

export const addNote = async (db: SQLiteDatabase, note: NewNote) => {
  return await db.runAsync('INSERT INTO content (title, note) VALUES (?, ?)', [
    note.title,
    note.note,
  ]);
};
