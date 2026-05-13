package com.pgarr.simplenotepad.widget

import android.content.Intent
import android.widget.RemoteViewsService

class NoteListWidgetService : RemoteViewsService() {
    override fun onGetViewFactory(intent: Intent): RemoteViewsFactory {
        val listId = intent.getIntExtra("list_id", -1)
        return NoteListRemoteViewsFactory(applicationContext, listId)
    }
}