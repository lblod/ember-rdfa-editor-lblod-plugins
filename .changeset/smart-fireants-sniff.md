---
'@lblod/ember-rdfa-editor-lblod-plugins': minor
---

For article-structure plugin

- The `StructureSpec`'s `constructor` now also contains the optional argument `state` (an EditorState)
- The existing structures' placeholders are translated using the document language
  - This is only the case if emberApplication plugin is configured.
    **Recommended change**: activate emberApplication plugin
  - Will fallback to translating based on browser locale (=old logic) if emberApplication plugin is not configured
