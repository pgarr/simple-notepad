package com.pgarr.simplenotepad.widget

import android.content.Context

object WidgetPrefs {
    private const val PREFS_NAME = "widget_prefs"
    private const val KEY_PREFIX = "selected_list_"

    fun getSelectedListId(context: Context, widgetId: Int): Int =
        context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            .getInt(KEY_PREFIX + widgetId, -1)

    fun setSelectedListId(context: Context, widgetId: Int, listId: Int) {
        context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE).edit()
            .putInt(KEY_PREFIX + widgetId, listId)
            .apply()
    }

    fun clearSelectedListId(context: Context, widgetId: Int) {
        context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE).edit()
            .remove(KEY_PREFIX + widgetId)
            .apply()
    }
}
