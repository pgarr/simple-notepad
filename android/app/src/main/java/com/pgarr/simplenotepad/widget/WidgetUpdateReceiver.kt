package com.pgarr.simplenotepad.widget

import android.appwidget.AppWidgetManager
import android.content.BroadcastReceiver
import android.content.ComponentName
import android.content.Context
import android.content.Intent

class WidgetUpdateReceiver : BroadcastReceiver() {

    companion object {
        const val ACTION_TOGGLE_ITEM = "com.pgarr.simplenotepad.TOGGLE_ITEM"
    }

    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action != ACTION_TOGGLE_ITEM) return

        val itemIndex = intent.getIntExtra("item_index", -1)
        val listId = intent.getIntExtra("list_id", -1)
        if (itemIndex < 0 || listId < 0) return

        // Write the toggle to SQLite
        WidgetDbHelper.toggleItem(context, listId, itemIndex)

        // Notify all widget instances to re-render
        val manager = AppWidgetManager.getInstance(context)
        val ids = manager.getAppWidgetIds(
            ComponentName(context, NoteListWidget::class.java)
        )
        manager.notifyAppWidgetViewDataChanged(ids, com.pgarr.simplenotepad.R.id.widget_list_view)
    }
}