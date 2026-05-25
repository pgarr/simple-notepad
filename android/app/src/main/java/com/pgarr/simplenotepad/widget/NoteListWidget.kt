package com.pgarr.simplenotepad.widget

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.widget.RemoteViews
import com.pgarr.simplenotepad.MainActivity
import com.pgarr.simplenotepad.R

class NoteListWidget : AppWidgetProvider() {

    override fun onUpdate(
            context: Context,
            appWidgetManager: AppWidgetManager,
            appWidgetIds: IntArray
        ) {
            for (widgetId in appWidgetIds) {
                updateWidget(context, appWidgetManager, widgetId)
            }
    }

    override fun onDeleted(context: Context, appWidgetIds: IntArray) {
        super.onDeleted(context, appWidgetIds)
        for (widgetId in appWidgetIds) {
            WidgetPrefs.clearSelectedListId(context, widgetId)
        }
    }

    companion object {
        fun refreshAllWidgets(context: Context) {
            val appWidgetManager = AppWidgetManager.getInstance(context)
            val component = ComponentName(context, NoteListWidget::class.java)
            val ids = appWidgetManager.getAppWidgetIds(component)
            for (widgetId in ids) {
                updateWidget(context, appWidgetManager, widgetId)
            }
            if (ids.isNotEmpty()) {
                appWidgetManager.notifyAppWidgetViewDataChanged(ids, R.id.widget_list_view)
            }
        }

        fun updateWidget(
            context: Context,
            appWidgetManager: AppWidgetManager,
            widgetId: Int
        ) {
            val displayList = WidgetDbHelper.resolveList(context, widgetId)

            val rv = RemoteViews(context.packageName, R.layout.widget_note_list)

            rv.setTextViewText(R.id.widget_title, displayList?.title ?: "No lists")

            val listDeepLink =
                if (displayList != null) {
                    Uri.parse("simple-notepad:///list/${displayList.id}")
                } else {
                    Uri.parse("simple-notepad:///")
                }
            val openListIntent =
                Intent(Intent.ACTION_VIEW, listDeepLink).apply {
                    setClass(context, MainActivity::class.java)
                    addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP)
                }
            val pendingIntentFlags =
                PendingIntent.FLAG_UPDATE_CURRENT or
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                        PendingIntent.FLAG_IMMUTABLE
                    } else {
                        0
                    }
            val openListPendingIntent =
                PendingIntent.getActivity(
                    context,
                    widgetId + 10_000,
                    openListIntent,
                    pendingIntentFlags
                )
            rv.setOnClickPendingIntent(R.id.widget_title, openListPendingIntent)

            val selectListIntent = Intent(context, WidgetListSelectActivity::class.java).apply {
                putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, widgetId)
                data = Uri.parse("widget://select/$widgetId")
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            val selectListPendingIntent = PendingIntent.getActivity(
                context,
                widgetId + 20_000,
                selectListIntent,
                pendingIntentFlags
            )
            rv.setOnClickPendingIntent(R.id.widget_dropdown_btn, selectListPendingIntent)

            val serviceIntent = Intent(context, NoteListWidgetService::class.java).apply {
                putExtra("widget_id", widgetId)
                data = android.net.Uri.parse("widget://list/$widgetId")
            }
            rv.setRemoteAdapter(R.id.widget_list_view, serviceIntent)
            rv.setEmptyView(R.id.widget_list_view, R.id.widget_list_empty)
    
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