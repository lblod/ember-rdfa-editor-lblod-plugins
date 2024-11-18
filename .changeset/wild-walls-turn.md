---
'@lblod/ember-rdfa-editor-lblod-plugins': major
---

Adjustments to `person` variable:
- Removal of unused `content` attribute
- Removal of `mandatee` attribute. Replaced by `value` attribute which contains an object of type `Person`.
  ```ts
  type Person = {
    uri: string;
    firstName: string;
    lastName: string;
  };
  ```
- Adjust parsing rules of `person_variable` nodespec to work with old and new serializations
- Is now more generic, instead of relying on `Mandatee` instances

