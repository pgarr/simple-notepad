package com.pgarr.simplenotepad.widget

import android.appwidget.AppWidgetManager
import android.content.Intent
import android.widget.RemoteViewsService

class NoteListWidgetService : RemoteViewsService() {
    override fun onGetViewFactory(intent: Intent): RemoteViewsFactory {
        val widgetId = intent.getIntExtra("widget_id", AppWidgetManager.INVALID_APPWIDGET_ID)
        return NoteListRemoteViewsFactory(applicationContext, widgetId)
    }
}