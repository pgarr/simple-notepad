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

    companion object {
        fun refreshAllWidgets(context: Context) {
            val appWidgetManager = AppWidgetManager.getInstance(context)
            val component = ComponentName(context, NoteListWidget::class.java)
            val ids = appWidgetManager.getAppWidgetIds(component)
            for (widgetId in ids) {
                updateWidget(context, appWidgetManager, widgetId)
            }
        }

        fun updateWidget(
            context: Context,
            appWidgetManager: AppWidgetManager,
            widgetId: Int
        ) {
            val latestList = WidgetDbHelper.getLatestList(context)
    
            val rv = RemoteViews(context.packageName, R.layout.widget_note_list)
    
            rv.setTextViewText(R.id.widget_title, latestList?.title ?: "No lists")

            val listDeepLink =
                if (latestList != null) {
                    Uri.parse("simple-notepad:///list/${latestList.id}")
                } else {
                    Uri.parse("simple-notepad:///")
                }
            val openListIntent =
                Intent(Intent.ACTION_VIEW, listDeepLink).apply {
                    setClass(context, MainActivity::class.java)
                    addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP)
                }
            val openListFlags =
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
                    openListFlags
                )
            rv.setOnClickPendingIntent(R.id.widget_title, openListPendingIntent)
    
            val serviceIntent = Intent(context, NoteListWidgetService::class.java).apply {
                putExtra("list_id", latestList?.id ?: -1)
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