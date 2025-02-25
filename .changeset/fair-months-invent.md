---
'@lblod/ember-rdfa-editor-lblod-plugins': minor
---

Location plugin: add support for configuring the location types to show.
The location types may be configured through the `@locationTypes` argument of the `location-plugin/insert` component.

The `@locationTypes` argument expects an array of `LocationType` values.
Supported `LocationType` values are:
- 'address'
- 'place'
- 'area'

By default the value of `@locationTypes` is `['address', 'place', 'area']`
