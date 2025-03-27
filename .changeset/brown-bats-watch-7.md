---
'@lblod/ember-rdfa-editor-lblod-plugins': major
---

Convert `person` variable to smart variable system

- Resource node
- Is not configured to be able to contain MOW-variable information (but this would not be hard to add, due to it's decoupled nature)
- If empty, contains a placeholder subject. Subject changes every time the person contained changes. Backlinks and external triples are kept when person contained changes, properties are not.
- Fully rdfa-aware
