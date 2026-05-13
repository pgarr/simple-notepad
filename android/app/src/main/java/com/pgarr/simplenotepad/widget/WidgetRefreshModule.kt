package com.pgarr.simplenotepad.widget

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class WidgetRefreshModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "WidgetRefresh"

    @ReactMethod
    fun refreshNoteListWidgets() {
        NoteListWidget.refreshAllWidgets(reactApplicationContext.applicationContext)
    }
}
