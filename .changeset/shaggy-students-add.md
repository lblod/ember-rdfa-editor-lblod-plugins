---
'@lblod/ember-rdfa-editor-lblod-plugins': major
---

`roadsign-regulation` plugin: reworked data-fetching logic
- removal of obsolete `roadsign-registry` ember service
- introduction of seperate SPARQL queries to fetch necessary resources/data
- introduction of [zod](https://zod.dev/) schemas to replace previously used `model` definitions
- follows new datamodel defined at https://data.test-vlaanderen.be/doc/applicatieprofiel/besluit-mobiliteit/

