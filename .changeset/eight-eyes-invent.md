---
"@lblod/ember-rdfa-editor-lblod-plugins": patch
---

Fix template node lookup

The template card could not determine it was already in a decision node, due to the attribute comparison function being passed the node instead of the node's attrs
