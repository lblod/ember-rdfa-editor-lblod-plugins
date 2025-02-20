---
'@lblod/ember-rdfa-editor-lblod-plugins': major
---

`roadsign-regulation` plugin: adjustments to `roadsign-regulation-plugin/roadsigns-table` component
- converted to `gts` format
- component signature changed to:
  ```ts
    type Signature = {
      Args: {
        options: RoadsignRegulationPluginOptions;
        content?: MobilityMeasureConcept[];
        isLoading?: boolean;
        insert: InsertMobilityMeasureTask;
      };
    };
  ```
