package com.pgarr.simplenotepad.widget

import android.os.Handler
import android.os.Looper
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class WidgetRefreshModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "WidgetRefresh"

    @ReactMethod
    fun refreshNoteListWidgets() {
        val context = reactApplicationContext.applicationContext
        val refresh = Runnable { NoteListWidget.refreshAllWidgets(context) }
        val activity = reactApplicationContext.currentActivity
        if (activity != null) {
            activity.runOnUiThread(refresh)
        } else {
            Handler(Looper.getMainLooper()).post(refresh)
        }
    }
}
