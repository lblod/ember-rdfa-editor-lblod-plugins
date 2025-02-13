---
'@lblod/ember-rdfa-editor-lblod-plugins': major
---

`roadsign-regulation` plugin: adjustments to `roadsign-regulation-plugin/expanded-measure` component
- converted to the `gts` format
- component signature has changed to: 
  ```ts
    type Signature = {
      Args: {
        concept: MobilityMeasureConcept;
        selectRow: (uri: string) => void;
        insert: InsertMobilityMeasureTask;
        endpoint: string;
      };
    };
  ```
