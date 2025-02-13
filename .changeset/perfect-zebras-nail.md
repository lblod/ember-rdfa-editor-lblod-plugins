---
'@lblod/ember-rdfa-editor-lblod-plugins': major
---

`roadsign-regulation` plugin: adjustments to `roadsign-regulation-plugin/measure-template` component
- converted to `gts` format
- renamed to `roadsign-regulation-plugin/measure-preview`
- component signature has changed to:
  ```ts
    type Args = {
      concept: MobilityMeasureConcept;
      limitText?: boolean;
    };
  ```
