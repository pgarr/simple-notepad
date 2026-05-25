package com.pgarr.simplenotepad.widget

import android.appwidget.AppWidgetManager
import android.os.Bundle
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import com.pgarr.simplenotepad.R

class WidgetListSelectActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val widgetId = intent.getIntExtra(
            AppWidgetManager.EXTRA_APPWIDGET_ID,
            AppWidgetManager.INVALID_APPWIDGET_ID
        )
        if (widgetId == AppWidgetManager.INVALID_APPWIDGET_ID) {
            finish()
            return
        }

        val lists = WidgetDbHelper.getAllLists(this)
        if (lists.isEmpty()) {
            finish()
            return
        }

        val titles = lists.map { it.title }.toTypedArray()

        AlertDialog.Builder(this)
            .setTitle(R.string.widget_select_list_title)
            .setItems(titles) { _, index ->
                val selected = lists[index]
                WidgetPrefs.setSelectedListId(this, widgetId, selected.id)
                val manager = AppWidgetManager.getInstance(this)
                NoteListWidget.updateWidget(this, manager, widgetId)
                manager.notifyAppWidgetViewDataChanged(
                    intArrayOf(widgetId),
                    R.id.widget_list_view
                )
                finish()
            }
            .setOnCancelListener { finish() }
            .show()
    }
}
