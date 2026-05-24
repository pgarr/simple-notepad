package com.pgarr.simplenotepad.widget

import android.content.Context
import android.database.sqlite.SQLiteDatabase
import org.json.JSONArray
import java.io.File

// Mirrors your expo-sqlite DB schema exactly
data class WidgetListItem(val text: String, val checked: Boolean)
data class WidgetList(val id: Int, val title: String, val items: List<WidgetListItem>)

object WidgetDbHelper {

    // Must match the name you pass to openDatabaseAsync() in your JS code
    private const val DB_NAME = "notes.db"
    private const val LIST_TYPE = 1

    /** Same file expo-sqlite uses (`defaultDatabaseDirectory` + name), resolved canonically. */
    private fun getDbPath(context: Context): String {
        val file = File(File(context.filesDir, "SQLite"), DB_NAME)
        return try {
            file.canonicalPath
        } catch (_: Exception) {
            file.absolutePath
        }
    }

    private fun openDbWritable(context: Context): SQLiteDatabase {
        val path = getDbPath(context)
        return SQLiteDatabase.openDatabase(path, null, SQLiteDatabase.OPEN_READWRITE)
    }

    /**
     * Returns the most recently inserted list (highest id), or null if none exist.
     * Opens and closes the DB on every call — safe for widget use.
     */
    fun getLatestList(context: Context): WidgetList? {
        val path = getDbPath(context)
        return try {
            val db = SQLiteDatabase.openDatabase(path, null, SQLiteDatabase.OPEN_READONLY)
            db.use {
                val cursor =
                    it.rawQuery(
                        "SELECT id, title, note FROM content WHERE type = ? ORDER BY id DESC LIMIT 1",
                        arrayOf(LIST_TYPE.toString())
                    )
                cursor.use { c ->
                    if (!c.moveToFirst()) return@use null
                    val rowId = c.getInt(c.getColumnIndexOrThrow("id"))
                    val title = c.getString(c.getColumnIndexOrThrow("title"))
                    val note = c.getString(c.getColumnIndexOrThrow("note"))
                    WidgetList(rowId, title, parseItems(note))
                }
            }
        } catch (_: Exception) {
            null
        }
    }

    /** Returns all lists ordered by id descending (newest first), or empty list on error. */
    fun getAllLists(context: Context): List<WidgetList> {
        val path = getDbPath(context)
        return try {
            val db = SQLiteDatabase.openDatabase(path, null, SQLiteDatabase.OPEN_READONLY)
            db.use {
                val cursor = it.rawQuery(
                    "SELECT id, title, note FROM content WHERE type = ? ORDER BY id DESC",
                    arrayOf(LIST_TYPE.toString())
                )
                cursor.use { c ->
                    val result = mutableListOf<WidgetList>()
                    while (c.moveToNext()) {
                        val rowId = c.getInt(c.getColumnIndexOrThrow("id"))
                        val title = c.getString(c.getColumnIndexOrThrow("title"))
                        val note = c.getString(c.getColumnIndexOrThrow("note"))
                        result.add(WidgetList(rowId, title, parseItems(note)))
                    }
                    result
                }
            }
        } catch (_: Exception) {
            emptyList()
        }
    }

    /** Returns the list with the given id, or null if not found or deleted. */
    fun getListById(context: Context, id: Int): WidgetList? {
        val path = getDbPath(context)
        return try {
            val db = SQLiteDatabase.openDatabase(path, null, SQLiteDatabase.OPEN_READONLY)
            db.use {
                val cursor = it.rawQuery(
                    "SELECT id, title, note FROM content WHERE id = ? AND type = ?",
                    arrayOf(id.toString(), LIST_TYPE.toString())
                )
                cursor.use { c ->
                    if (!c.moveToFirst()) return@use null
                    val rowId = c.getInt(c.getColumnIndexOrThrow("id"))
                    val title = c.getString(c.getColumnIndexOrThrow("title"))
                    val note = c.getString(c.getColumnIndexOrThrow("note"))
                    WidgetList(rowId, title, parseItems(note))
                }
            }
        } catch (_: Exception) {
            null
        }
    }

    /**
     * Resolves which list to display for a given widget instance.
     * Uses the saved selection from SharedPreferences; falls back to the latest list
     * if no selection is saved or if the saved list has been deleted.
     */
    fun resolveList(context: Context, widgetId: Int): WidgetList? {
        val savedId = WidgetPrefs.getSelectedListId(context, widgetId)
        if (savedId != -1) {
            val list = getListById(context, savedId)
            if (list != null) return list
            // Saved list was deleted — clear stale pref and fall back to latest
            WidgetPrefs.clearSelectedListId(context, widgetId)
        }
        return getLatestList(context)
    }

    /**
     * Toggles the checked state of a single item at [itemIndex] within
     * the list identified by [listId], then persists the updated JSON.
     */
    fun toggleItem(context: Context, listId: Int, itemIndex: Int) {
        try {
            openDbWritable(context).use { db ->
                val currentNote =
                    db.rawQuery(
                        "SELECT note FROM content WHERE id = ? AND type = ?",
                        arrayOf(listId.toString(), LIST_TYPE.toString())
                    ).use { c ->
                        if (!c.moveToFirst()) return
                        c.getString(c.getColumnIndexOrThrow("note"))
                    }

                val items = parseItems(currentNote).toMutableList()
                if (itemIndex < 0 || itemIndex >= items.size) return
                items[itemIndex] = items[itemIndex].copy(checked = !items[itemIndex].checked)

                val newNote = stringifyItems(items)
                val stmt = db.compileStatement("UPDATE content SET note = ? WHERE id = ? AND type = ?")
                stmt.bindString(1, newNote)
                stmt.bindLong(2, listId.toLong())
                stmt.bindLong(3, LIST_TYPE.toLong())
                stmt.executeUpdateDelete()
                stmt.close()
            }
        } catch (_: Exception) {}
    }

    // Mirrors parseListItems() from your db.ts
    fun parseItems(raw: String): List<WidgetListItem> {
        return try {
            val arr = JSONArray(raw)
            (0 until arr.length()).mapNotNull { i ->
                val obj = arr.optJSONObject(i) ?: return@mapNotNull null
                val text = obj.optString("text", "")
                val checked = obj.optBoolean("checked", false)
                WidgetListItem(text = text, checked = checked)
            }
        } catch (_: Exception) {
            emptyList()
        }
    }

    // Mirrors stringifyListItems() from your db.ts
    private fun stringifyItems(items: List<WidgetListItem>): String {
        val arr = JSONArray()
        items.forEach { item ->
            val obj = org.json.JSONObject()
            obj.put("checked", item.checked)
            obj.put("text", item.text.trim())
            arr.put(obj)
        }
        return arr.toString()
    }
}