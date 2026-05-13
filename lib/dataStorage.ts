import { type SQLiteDatabase } from 'expo-sqlite';

export const SQLITE_DATABASE_NAME = 'notes.db';

const DATABASE_VERSION = 2;

export const NOTE_TYPE = 0 as const;
export const LIST_TYPE = 1 as const;
export type ContentType = typeof NOTE_TYPE | typeof LIST_TYPE;

export type ListItem = {
  checked: boolean;
  text: string;
};

export type Note = {
  id: number;
  title: string;
  note: string;
  type: ContentType;
};

/** Use when creating a note; id and type are assigned by the database. */
export type NewNote = Pick<Note, 'title' | 'note'>;

type NewList = {
  title: string;
  items: ListItem[];
};

const parseListItems = (rawContent: string): ListItem[] => {
  try {
    const parsed = JSON.parse(rawContent);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (item): item is { checked: boolean; text: string } =>
          typeof item?.checked === 'boolean' && typeof item?.text === 'string'
      )
      .map((item) => ({ checked: item.checked, text: item.text }));
  } catch {
    return [];
  }
};

const stringifyListItems = (items: ListItem[]) =>
  JSON.stringify(items.map((item) => ({ checked: !!item.checked, text: item.text.trim() })));

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
  if (!meta || meta.user_version < 2) {
    const columns = await db.getAllAsync<{ name: string }>('PRAGMA table_info(content)');
    const hasTypeColumn = columns.some((column) => column.name === 'type');
    if (!hasTypeColumn) {
      await db.execAsync(
        `ALTER TABLE content ADD COLUMN type INTEGER NOT NULL DEFAULT ${NOTE_TYPE};`
      );
    }
    await db.runAsync(`UPDATE content SET type = ${NOTE_TYPE} WHERE type IS NULL`);
  }
  await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
};

export const getAllNotes = async (db: SQLiteDatabase): Promise<Note[]> => {
  return await db.getAllAsync<Note>('SELECT * FROM content');
};

export const getNoteById = async (db: SQLiteDatabase, id: number): Promise<Note | null> => {
  const row = await db.getFirstAsync<Note>('SELECT * FROM content WHERE id = ?', [id]);
  return row ?? null;
};

export const addNote = async (db: SQLiteDatabase, note: NewNote) => {
  return await db.runAsync('INSERT INTO content (title, note, type) VALUES (?, ?, ?)', [
    note.title,
    note.note,
    NOTE_TYPE,
  ]);
};

export const updateNote = async (db: SQLiteDatabase, id: number, note: NewNote) => {
  return await db.runAsync('UPDATE content SET title = ?, note = ?, type = ? WHERE id = ?', [
    note.title,
    note.note,
    NOTE_TYPE,
    id,
  ]);
};

export const deletePosition = async (db: SQLiteDatabase, id: number) => {
  return await db.runAsync('DELETE FROM content WHERE id = ?', [id]);
};

export const addList = async (db: SQLiteDatabase, list: NewList) => {
  return await db.runAsync('INSERT INTO content (title, note, type) VALUES (?, ?, ?)', [
    list.title,
    stringifyListItems(list.items),
    LIST_TYPE,
  ]);
};

export const updateList = async (db: SQLiteDatabase, id: number, list: NewList) => {
  return await db.runAsync('UPDATE content SET title = ?, note = ?, type = ? WHERE id = ?', [
    list.title,
    stringifyListItems(list.items),
    LIST_TYPE,
    id,
  ]);
};

export const getListItemsById = async (
  db: SQLiteDatabase,
  id: number
): Promise<ListItem[] | null> => {
  const list = await db.getFirstAsync<Pick<Note, 'note' | 'type'>>(
    'SELECT note, type FROM content WHERE id = ?',
    [id]
  );
  if (!list || list.type !== LIST_TYPE) return null;
  return parseListItems(list.note);
};

export const updateListItems = async (db: SQLiteDatabase, id: number, items: ListItem[]) => {
  return await db.runAsync('UPDATE content SET note = ? WHERE id = ? AND type = ?', [
    stringifyListItems(items),
    id,
    LIST_TYPE,
  ]);
};
