package com.pgarr.simplenotepad.widget

import android.content.Context
import android.database.sqlite.SQLiteDatabase
import org.json.JSONArray

// Mirrors your expo-sqlite DB schema exactly
data class WidgetListItem(val text: String, val checked: Boolean)
data class WidgetList(val id: Int, val title: String, val items: List<WidgetListItem>)

object WidgetDbHelper {

    // Must match the name you pass to openDatabaseAsync() in your JS code
    private const val DB_NAME = "notes.db"
    private const val LIST_TYPE = 1

    private fun getDbPath(context: Context): String {
        // expo-sqlite stores DBs here on Android
        return context.getDatabasePath(DB_NAME).absolutePath
    }

    /**
     * Returns the most recently inserted list (highest id), or null if none exist.
     * Opens and closes the DB on every call — safe for widget use.
     */
    fun getLatestList(context: Context): WidgetList? {
        val path = getDbPath(context)
        return try {
            val db = SQLiteDatabase.openDatabase(
                path,
                null,
                SQLiteDatabase.OPEN_READONLY
            )
            db.use {
                val cursor = it.rawQuery(
                    "SELECT id, title, note FROM content WHERE type = ? ORDER BY id DESC LIMIT 1",
                    arrayOf(LIST_TYPE.toString())
                )
                cursor.use { c ->
                    if (!c.moveToFirst()) return null
                    val id = c.getInt(c.getColumnIndexOrThrow("id"))
                    val title = c.getString(c.getColumnIndexOrThrow("title"))
                    val note = c.getString(c.getColumnIndexOrThrow("note"))
                    WidgetList(id, title, parseItems(note))
                }
            }
        } catch (e: Exception) {
            null
        }
    }

    /**
     * Toggles the checked state of a single item at [itemIndex] within
     * the list identified by [listId], then persists the updated JSON.
     */
    fun toggleItem(context: Context, listId: Int, itemIndex: Int) {
        val path = getDbPath(context)
        try {
            val db = SQLiteDatabase.openDatabase(
                path,
                null,
                SQLiteDatabase.OPEN_READWRITE
            )
            db.use {
                // 1. Read current items
                val cursor = it.rawQuery(
                    "SELECT note FROM content WHERE id = ? AND type = ?",
                    arrayOf(listId.toString(), LIST_TYPE.toString())
                )
                val currentNote = cursor.use { c ->
                    if (!c.moveToFirst()) return
                    c.getString(c.getColumnIndexOrThrow("note"))
                }

                // 2. Toggle the target item
                val items = parseItems(currentNote).toMutableList()
                if (itemIndex < 0 || itemIndex >= items.size) return
                items[itemIndex] = items[itemIndex].copy(checked = !items[itemIndex].checked)

                // 3. Write back — matches your stringifyListItems() format exactly
                val newNote = stringifyItems(items)
                it.execSQL(
                    "UPDATE content SET note = ? WHERE id = ? AND type = ?",
                    arrayOf(newNote, listId.toString(), LIST_TYPE.toString())
                )
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