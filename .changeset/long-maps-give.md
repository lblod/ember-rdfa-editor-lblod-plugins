---
"@lblod/ember-rdfa-editor-lblod-plugins": patch
---

Fix peerdeps to avoid broken combo

Version 9.8.0 of the editor removes a helper that's used in the number variable nodeview. We restrict the peerdep here so we avoid a broken combination of plugins + editor
