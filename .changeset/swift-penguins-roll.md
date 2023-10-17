---
'@lblod/ember-rdfa-editor-lblod-plugins': minor
---

For decision-plugin and standard-template-plugin

Make use of `state` argument to translate placeholders based on document language instead of browser locale
Depending on the place where placeholders are defined either of the following logic happens:

- will always use document language
- will use document language if emberApplication plugin is active. If not, defaults to browser locale (like before)
