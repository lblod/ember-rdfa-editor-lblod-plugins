---
"@lblod/ember-rdfa-editor-lblod-plugins": patch
---

Use the selectNode argument instead of the helper

The select-on-click helper was removed in 9.8.0 of the editor, and was arguably never really public API.

This uses the replacement, a selectNode argument all ember-nodes receive.
