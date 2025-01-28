---
'@lblod/ember-rdfa-editor-lblod-plugins': patch
---

Fix in codelist and location edit components: only show power-select when underlying data promise is resolved. This prevents a (dev-mode) error thrown related to 'write-after-read' issues
