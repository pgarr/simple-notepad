package com.pgarr.simplenotepad.widget

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class WidgetDbHelperTest {

    @Test
    fun `parseItems returns empty list for invalid JSON`() {
        val result = WidgetDbHelper.parseItems("not json at all")
        assertTrue(result.isEmpty())
    }

    @Test
    fun `parseItems returns empty list for empty JSON array`() {
        val result = WidgetDbHelper.parseItems("[]")
        assertTrue(result.isEmpty())
    }

    @Test
    fun `parseItems returns empty list for JSON object instead of array`() {
        val result = WidgetDbHelper.parseItems("""{"checked":false,"text":"x"}""")
        assertTrue(result.isEmpty())
    }

    @Test
    fun `parseItems parses a single valid item`() {
        val result = WidgetDbHelper.parseItems("""[{"checked":false,"text":"buy milk"}]""")
        assertEquals(1, result.size)
        assertEquals("buy milk", result[0].text)
        assertFalse(result[0].checked)
    }

    @Test
    fun `parseItems parses checked true correctly`() {
        val result = WidgetDbHelper.parseItems("""[{"checked":true,"text":"done"}]""")
        assertTrue(result[0].checked)
    }

    @Test
    fun `parseItems defaults checked to false when field is missing`() {
        val result = WidgetDbHelper.parseItems("""[{"text":"no checked field"}]""")
        assertEquals(1, result.size)
        assertFalse(result[0].checked)
    }

    @Test
    fun `parseItems defaults text to empty string when field is missing`() {
        val result = WidgetDbHelper.parseItems("""[{"checked":false}]""")
        assertEquals(1, result.size)
        assertEquals("", result[0].text)
    }

    @Test
    fun `parseItems sets originalIndex matching position in source array`() {
        val json = """[
            {"checked":false,"text":"a"},
            {"checked":true,"text":"b"},
            {"checked":false,"text":"c"}
        ]"""
        val result = WidgetDbHelper.parseItems(json)
        assertEquals(3, result.size)
        assertEquals(0, result[0].originalIndex)
        assertEquals(1, result[1].originalIndex)
        assertEquals(2, result[2].originalIndex)
    }

    @Test
    fun `parseItems skips null entries in the array`() {
        // JSON array with a null entry between two valid objects
        val json = """[{"checked":false,"text":"first"},null,{"checked":true,"text":"third"}]"""
        val result = WidgetDbHelper.parseItems(json)
        assertEquals(2, result.size)
        assertEquals("first", result[0].text)
        assertEquals("third", result[1].text)
        // originalIndex reflects position in original array, skipping nulls
        assertEquals(0, result[0].originalIndex)
        assertEquals(2, result[1].originalIndex)
    }

    @Test
    fun `parseItems round-trips multiple items preserving all fields`() {
        val json = """[
            {"checked":false,"text":"walk the dog"},
            {"checked":true,"text":"buy groceries"}
        ]"""
        val result = WidgetDbHelper.parseItems(json)
        assertEquals(2, result.size)
        assertEquals(WidgetListItem(text = "walk the dog", checked = false, originalIndex = 0), result[0])
        assertEquals(WidgetListItem(text = "buy groceries", checked = true, originalIndex = 1), result[1])
    }
}
