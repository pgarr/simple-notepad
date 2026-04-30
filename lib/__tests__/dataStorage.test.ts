import {
  LIST_TYPE,
  NOTE_TYPE,
  addList,
  addNote,
  deletePosition,
  getAllNotes,
  getListItemsById,
  getNoteById,
  migrateDbIfNeeded,
  updateList,
  updateListItems,
  updateNote,
} from '@/lib/dataStorage';

type MockDb = {
  getFirstAsync: jest.Mock;
  getAllAsync: jest.Mock;
  execAsync: jest.Mock;
  runAsync: jest.Mock;
};

const makeDb = (): MockDb =>
  ({
    getFirstAsync: jest.fn(),
    getAllAsync: jest.fn(),
    execAsync: jest.fn(),
    runAsync: jest.fn(),
  }) as unknown as MockDb;

describe('lib/dataStorage', () => {
  describe('migrateDbIfNeeded', () => {
    it('early-returns when PRAGMA user_version >= DATABASE_VERSION', async () => {
      const db = makeDb();
      db.getFirstAsync.mockResolvedValue({ user_version: 2 });

      await migrateDbIfNeeded(db as any);

      expect(db.getFirstAsync).toHaveBeenCalledWith('PRAGMA user_version');
      expect(db.execAsync).not.toHaveBeenCalled();
      expect(db.getAllAsync).not.toHaveBeenCalled();
      expect(db.runAsync).not.toHaveBeenCalled();
    });

    it('creates base table and adds type column when meta is missing and type is absent', async () => {
      const db = makeDb();
      db.getFirstAsync.mockResolvedValue(null);
      db.getAllAsync.mockResolvedValue([{ name: 'id' }, { name: 'title' }, { name: 'note' }]);
      db.execAsync.mockResolvedValue(undefined);
      db.runAsync.mockResolvedValue(undefined);

      await migrateDbIfNeeded(db as any);

      expect(db.execAsync).toHaveBeenCalledWith(expect.stringContaining('CREATE TABLE content'));
      expect(db.getAllAsync).toHaveBeenCalledWith('PRAGMA table_info(content)');
      expect(db.execAsync).toHaveBeenCalledWith(
        expect.stringContaining('ALTER TABLE content ADD COLUMN type INTEGER')
      );
      expect(db.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE content SET type =')
      );
      expect(db.execAsync).toHaveBeenCalledWith('PRAGMA user_version = 2');
    });

    it('when user_version is old and type column exists, it skips ALTER TABLE but sets default types', async () => {
      const db = makeDb();
      db.getFirstAsync.mockResolvedValue({ user_version: 1 });
      db.getAllAsync.mockResolvedValue([
        { name: 'id' },
        { name: 'title' },
        { name: 'note' },
        { name: 'type' },
      ]);
      db.execAsync.mockResolvedValue(undefined);
      db.runAsync.mockResolvedValue(undefined);

      await migrateDbIfNeeded(db as any);

      expect(db.execAsync).not.toHaveBeenCalledWith(expect.stringContaining('ALTER TABLE content'));
      expect(db.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE content SET type =')
      );
      expect(db.execAsync).toHaveBeenCalledWith('PRAGMA user_version = 2');
    });
  });

  describe('CRUD helpers', () => {
    it('getAllNotes queries the right table', async () => {
      const db = makeDb();
      db.getAllAsync.mockResolvedValue([{ id: 1, title: 't', note: 'n', type: NOTE_TYPE }]);

      const res = await getAllNotes(db as any);
      expect(db.getAllAsync).toHaveBeenCalledWith('SELECT * FROM content');
      expect(res[0].type).toBe(NOTE_TYPE);
    });

    it('getNoteById selects by id', async () => {
      const db = makeDb();
      db.getFirstAsync.mockResolvedValue({ id: 5, title: 't', note: 'n', type: NOTE_TYPE });

      const res = await getNoteById(db as any, 5);
      expect(db.getFirstAsync).toHaveBeenCalledWith('SELECT * FROM content WHERE id = ?', [5]);
      expect(res?.id).toBe(5);
    });

    it('addNote inserts NOTE_TYPE', async () => {
      const db = makeDb();
      db.runAsync.mockResolvedValue({ changes: 1 });

      await addNote(db as any, { title: 'Hello', note: 'World' });

      const [sql, params] = db.runAsync.mock.calls[0];
      expect(sql).toBe('INSERT INTO content (title, note, type) VALUES (?, ?, ?)');
      expect(params).toEqual(['Hello', 'World', NOTE_TYPE]);
    });

    it('updateNote sets type and updates by id', async () => {
      const db = makeDb();
      db.runAsync.mockResolvedValue({ changes: 1 });

      await updateNote(db as any, 10, { title: 'A', note: 'B' });

      const [sql, params] = db.runAsync.mock.calls[0];
      expect(sql).toBe('UPDATE content SET title = ?, note = ?, type = ? WHERE id = ?');
      expect(params).toEqual(['A', 'B', NOTE_TYPE, 10]);
    });

    it('deleteNote deletes by id', async () => {
      const db = makeDb();
      db.runAsync.mockResolvedValue({ changes: 1 });

      await deletePosition(db as any, 7);

      const [sql, params] = db.runAsync.mock.calls[0];
      expect(sql).toBe('DELETE FROM content WHERE id = ?');
      expect(params).toEqual([7]);
    });
  });

  describe('List serialization helpers', () => {
    it('getListItemsById returns null when record is not a list', async () => {
      const db = makeDb();
      db.getFirstAsync.mockResolvedValue({ note: '[]', type: NOTE_TYPE });

      const res = await getListItemsById(db as any, 1);
      expect(db.getFirstAsync).toHaveBeenCalledWith(
        'SELECT note, type FROM content WHERE id = ?',
        [1]
      );
      expect(res).toBeNull();
    });

    it('getListItemsById returns parsed/filtered items for LIST_TYPE', async () => {
      const db = makeDb();
      db.getFirstAsync.mockResolvedValue({
        note: JSON.stringify([
          { checked: true, text: 'a' },
          { checked: 'not-boolean', text: 'b' },
          { checked: false, text: '  x  ' },
          { checked: true, text: 123 },
        ]),
        type: LIST_TYPE,
      });

      const res = await getListItemsById(db as any, 2);

      expect(res).toEqual([
        { checked: true, text: 'a' },
        { checked: false, text: '  x  ' },
      ]);
    });

    it('getListItemsById returns [] for invalid JSON', async () => {
      const db = makeDb();
      db.getFirstAsync.mockResolvedValue({
        note: 'not-json',
        type: LIST_TYPE,
      });

      const res = await getListItemsById(db as any, 1);
      expect(res).toEqual([]);
    });

    it('getListItemsById returns [] for non-array JSON', async () => {
      const db = makeDb();
      db.getFirstAsync.mockResolvedValue({
        note: JSON.stringify({ checked: true, text: 'a' }),
        type: LIST_TYPE,
      });

      const res = await getListItemsById(db as any, 1);
      expect(res).toEqual([]);
    });

    it('addList stores items as JSON with trimmed text', async () => {
      const db = makeDb();
      db.runAsync.mockResolvedValue({ changes: 1 });

      await addList(db as any, {
        title: 'List',
        items: [
          { checked: false, text: '  one  ' },
          { checked: true, text: ' two' },
        ],
      });

      const [, params] = db.runAsync.mock.calls[0];
      const json = params[1] as string;
      expect(params[2]).toBe(LIST_TYPE);
      expect(JSON.parse(json)).toEqual([
        { checked: false, text: 'one' },
        { checked: true, text: 'two' },
      ]);
    });

    it('addList coerces checked to boolean and trims text', async () => {
      const db = makeDb();
      db.runAsync.mockResolvedValue({ changes: 1 });

      await addList(db as any, {
        title: 'List',
        items: [
          { checked: 1 as any, text: '  one  ' },
          { checked: 0 as any, text: 'two' },
        ],
      });

      const [, params] = db.runAsync.mock.calls[0];
      const json = params[1] as string;

      expect(JSON.parse(json)).toEqual([
        { checked: true, text: 'one' },
        { checked: false, text: 'two' },
      ]);
    });

    it('updateListItems updates note JSON for LIST_TYPE only', async () => {
      const db = makeDb();
      db.runAsync.mockResolvedValue({ changes: 1 });

      await updateListItems(db as any, 3, [
        { checked: true, text: ' x ' },
        { checked: false, text: 'y' },
      ]);

      const [sql, params] = db.runAsync.mock.calls[0];
      expect(sql).toBe('UPDATE content SET note = ? WHERE id = ? AND type = ?');
      expect(params[0]).toBe(
        JSON.stringify([
          { checked: true, text: 'x' },
          { checked: false, text: 'y' },
        ])
      );
      expect(params[1]).toBe(3);
      expect(params[2]).toBe(LIST_TYPE);
    });

    it('updateList updates by id with title, JSON, and LIST_TYPE', async () => {
      const db = makeDb();
      db.runAsync.mockResolvedValue({ changes: 1 });

      await updateList(db as any, 4, {
        title: 'T',
        items: [{ checked: false, text: ' a ' }],
      });

      const [sql, params] = db.runAsync.mock.calls[0];
      expect(sql).toBe('UPDATE content SET title = ?, note = ?, type = ? WHERE id = ?');
      expect(params).toEqual(['T', JSON.stringify([{ checked: false, text: 'a' }]), LIST_TYPE, 4]);
    });
  });
});
