package com.pgarr.simplenotepad.widget

import android.content.Context
import android.content.Intent
import android.widget.RemoteViews
import android.widget.RemoteViewsService
import com.pgarr.simplenotepad.R

class NoteListRemoteViewsFactory(
    private val context: Context,
    @Suppress("UNUSED_PARAMETER") private val listId: Int
) : RemoteViewsService.RemoteViewsFactory {

    private var items: List<WidgetListItem> = emptyList()
    private var listTitle: String = ""
    /** Id of the list rows are from — always aligned with [onDataSetChanged] (latest list). */
    private var boundListId: Int = -1

    override fun onCreate() {}

    override fun onDataSetChanged() {
        val list = WidgetDbHelper.getLatestList(context)
        if (list == null) {
            items = emptyList()
            listTitle = ""
            boundListId = -1
            return
        }
        items = list.items
        listTitle = list.title
        boundListId = list.id
    }

    override fun onDestroy() {}

    override fun getCount(): Int = items.size

    override fun getViewAt(position: Int): RemoteViews {
        val item = items[position]
        val rv = RemoteViews(context.packageName, R.layout.widget_list_item)

        // Set text, with strikethrough if checked
        rv.setTextViewText(R.id.item_text, item.text)

        // Swap checkbox icon based on checked state
        val checkboxDrawable = if (item.checked)
            android.R.drawable.checkbox_on_background
        else
            android.R.drawable.checkbox_off_background
        rv.setImageViewResource(R.id.item_checkbox, checkboxDrawable)

        // Dim completed items
        rv.setFloat(R.id.item_text, "setAlpha", if (item.checked) 0.4f else 1.0f)

        // Fill-in intent carries position and listId to the broadcast receiver
        val fillIntent = Intent().apply {
            putExtra("item_index", position)
            putExtra("list_id", boundListId)
        }
        rv.setOnClickFillInIntent(R.id.item_checkbox, fillIntent)
        rv.setOnClickFillInIntent(R.id.item_text, fillIntent)

        return rv
    }

    override fun getLoadingView(): RemoteViews? = null
    override fun getViewTypeCount(): Int = 1
    override fun getItemId(position: Int): Long = position.toLong()
    override fun hasStableIds(): Boolean = false
}