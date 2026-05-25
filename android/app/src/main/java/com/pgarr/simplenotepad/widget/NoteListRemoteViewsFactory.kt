package com.pgarr.simplenotepad.widget

import android.content.Context
import android.content.Intent
import android.text.SpannableString
import android.text.Spanned
import android.text.style.StrikethroughSpan
import android.widget.RemoteViews
import android.widget.RemoteViewsService
import com.pgarr.simplenotepad.R

class NoteListRemoteViewsFactory(
    private val context: Context,
    private val widgetId: Int
) : RemoteViewsService.RemoteViewsFactory {

    private var items: List<WidgetListItem> = emptyList()
    private var listTitle: String = ""
    private var boundListId: Int = -1

    override fun onCreate() {}

    override fun onDataSetChanged() {
        val list = WidgetDbHelper.resolveList(context, widgetId)
        if (list == null) {
            items = emptyList()
            listTitle = ""
            boundListId = -1
            return
        }
        items = list.items.filter { !it.checked }
        listTitle = list.title
        boundListId = list.id
    }

    override fun onDestroy() {}

    override fun getCount(): Int = items.size

    override fun getViewAt(position: Int): RemoteViews {
        val item = items[position]
        val rv = RemoteViews(context.packageName, R.layout.widget_list_item)

        // Set text with strikethrough for checked items (matches app line-through style)
        if (item.checked) {
            val spannable = SpannableString(item.text)
            spannable.setSpan(StrikethroughSpan(), 0, item.text.length, Spanned.SPAN_EXCLUSIVE_EXCLUSIVE)
            rv.setTextViewText(R.id.item_text, spannable)
        } else {
            rv.setTextViewText(R.id.item_text, item.text)
        }

        // Swap checkbox icon based on checked state (custom lucide-style drawables)
        val checkboxDrawable = if (item.checked)
            R.drawable.widget_checkbox_on
        else
            R.drawable.widget_checkbox_off
        rv.setImageViewResource(R.id.item_checkbox, checkboxDrawable)

        // Dim checked item text to match app muted-foreground (text-muted-foreground)
        rv.setFloat(R.id.item_text, "setAlpha", if (item.checked) 0.5f else 1.0f)

        // Fill-in intent carries position and listId to the broadcast receiver
        val fillIntent = Intent().apply {
            putExtra("item_index", item.originalIndex)
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