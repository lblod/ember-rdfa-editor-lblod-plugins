---
'@lblod/ember-rdfa-editor-lblod-plugins': major
---

Rework pagination of `roadsign-regulation` plugin:
- Removal of `roadsign-regulation-plugin/roadsigns-pagination` components. 
  This component has been replaced by the more generic `pagination/pagination-view` component.
- Slightly rework the pagination of the `fetchMeasures` task:
  * It accepts an (optional) `pageNumber` instead of a `pageStart` argument
  * It accepts an (optional) `pageSize` argument (default: 10)
