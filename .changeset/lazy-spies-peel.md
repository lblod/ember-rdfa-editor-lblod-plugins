---
'@lblod/ember-rdfa-editor-lblod-plugins': patch
---

Remove obsolete `fetch-sparql-endpoint` dependency. This dependency requires node.js polyfills, which we are no longer providing with this package. This caused an issue in some applications using the `besluit-type` plugin.
