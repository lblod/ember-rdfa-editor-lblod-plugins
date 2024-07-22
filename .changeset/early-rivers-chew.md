---
'@lblod/ember-rdfa-editor-lblod-plugins': minor
---

Addition of a mandatee table plugin
- Addition of a `mandatee_table` node-spec and `mandateeTableView` node-view
  * `mandatee_table` nodes support two attributes: `tag` and `title` which can be configured by a template-creator
- Addition of two components used to insert and configure mandatee tables
  * `MandateeTablePlugin::Insert` allows a user/template-creator to insert empty `mandatee_table` nodes
  * `MandateeTablePlugin::Configure` allows a user/template-creator to configure the title/tag of a `mandatee_table` node
- Addition of a `syncDocument` function.
  * Synchronizes the `mandatee_table` nodes in a document based on a supplied configuration
  * Can work in a headless way (does not require a prosemirror view). It accepts and outputs a `ProseMirrorState` object.
