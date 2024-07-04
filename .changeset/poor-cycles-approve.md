---
"@lblod/ember-rdfa-editor-lblod-plugins": minor
---

Introduce some modifications to new `structure` node-spec:
- Drop `structureName` node-attribute. This attribute has been replaced by both the `structureType` and `displayStructureName` attributes.
- Introduction of a required `structureType` attribute. Examples of `structureType` values are:
  * `article`
  * `title`
  * `chapter`
  * `section`
  * `subsection`
  * `paragraph`
- Introduction of a `displayStructureName` attribute. This attribute controls whether the internationalizated (based on the document language) version of the structure name is displayed inside the header of the structure. The internationalized structure name is based on the `structureType` value and the entries included in the translation files. `displayStructureName` has a default value of `false`.

