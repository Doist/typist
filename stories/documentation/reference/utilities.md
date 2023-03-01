# Utilities

Utilities are public helper functions that can be used by custom extensions implemented in the consuming applications. The intent is to provide small reusable functions with the DRY principle in mind.

## `canInsertNodeAt`

This function is a shorthand to `editor.can().insertContentAt()`, and checks if a node of a specific type can be inserted at a specific position in the editor.

## `canInsertSuggestion`

This function checks if a suggestion – like a mention – can be inserted within the current editor selection, and the main purpose is to check for all possible edge cases and disallow suggestions from being inserted within inline code marks or code blocks.
