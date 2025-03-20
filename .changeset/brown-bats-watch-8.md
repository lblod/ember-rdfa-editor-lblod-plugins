---
'@lblod/ember-rdfa-editor-lblod-plugins': major
---

Convert `oslo_location` variable to smart variable system


- Resource node
- Is not configured to be able to contain MOW-variable information (but this would not be hard to add, due to it's decoupled nature)
- May not be empty
- Subject changes every time the person contained changes. Backlinks and external triples are kept when location contained changes, properties are not.
- Partially rdfa-aware: backlinks and external-triples, but properties are ignored (this variable uses it's own value attribute which overrides the properties)
