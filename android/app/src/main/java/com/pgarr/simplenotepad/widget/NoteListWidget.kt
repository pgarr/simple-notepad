package com.pgarr.simplenotepad.widget

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.content.Intent
import android.widget.RemoteViews
import com.pgarr.simplenotepad.R

class NoteListWidget : AppWidgetProvider() {

    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray
    ) {
        val list = WidgetDbHelper.getLatestList(context)

        for (widgetId in appWidgetIds) {
            updateWidget(context, appWidgetManager, widgetId, list)
        }
    }

    companion object {
        fun updateWidget(
            context: Context,
            appWidgetManager: AppWidgetManager,
            widgetId: Int,
            list: WidgetListItem? = null  // unused directly; data flows via factory
        ) {
            val latestList = WidgetDbHelper.getLatestList(context)

            val rv = RemoteViews(context.packageName, R.layout.widget_note_list)

            // Set title
            rv.setTextViewText(R.id.widget_title, latestList?.title ?: "No lists")

            // Wire up the ListView to the RemoteViewsService
            val serviceIntent = Intent(context, NoteListWidgetService::class.java).apply {
                putExtra("list_id", latestList?.id ?: -1)
                // Must be unique per widget instance for Android to distinguish adapters
                data = android.net.Uri.parse("widget://list/$widgetId")
            }
            rv.setRemoteAdapter(R.id.widget_list_view, serviceIntent)
            rv.setEmptyView(R.id.widget_list_view, R.id.widget_title)

            // PendingIntent template for row taps — filled in by setOnClickFillInIntent
            val toggleIntent = Intent(context, WidgetUpdateReceiver::class.java).apply {
                action = WidgetUpdateReceiver.ACTION_TOGGLE_ITEM
            }
            val pendingIntent = PendingIntent.getBroadcast(
                context,
                widgetId,
                toggleIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_MUTABLE
            )
            rv.setPendingIntentTemplate(R.id.widget_list_view, pendingIntent)

            appWidgetManager.updateAppWidget(widgetId, rv)
        }
    }
}