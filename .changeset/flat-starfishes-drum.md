---
'@lblod/ember-rdfa-editor-lblod-plugins': major
---

`variables` plugin: follow new data model defined at https://data.test-vlaanderen.be/doc/applicatieprofiel/besluit-mobiliteit/#Variabele
Variable types/node-specs included are:
- `text_variable`
- `number`
- `date`
- `autofilled`
- `codelist`
- `location`

Additionally, some internal improvements are added to make maintainability of variables easier.
Older variable formats are automatically converted to the new format.
