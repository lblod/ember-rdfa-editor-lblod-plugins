---
"@lblod/ember-rdfa-editor-lblod-plugins": major
---

### RDFa aware editing

This release adapts plugins
to [RDFa (RDF in Attributes)](https://github.com/lblod/ember-rdfa-editor/blob/9c32a9dea0da13df4092c39d9a092ba0803a3f42/README.md#experimental-a-new-approach-to-handle-rdfa-in-documents)
aware editing, based on the changes in `ember-rdfa-editor`
version [9.6.0](https://github.com/lblod/ember-rdfa-editor/releases/tag/v9.6.0)

#### N.B. This release is not compatible with `ember-rdfa-editor` configurations that don't use ` rdfaAware` features, see [editor documentation](https://github.com/lblod/ember-rdfa-editor/blob/9c32a9dea0da13df4092c39d9a092ba0803a3f42/README.md#experimental-a-new-approach-to-handle-rdfa-in-documents) for more. 

#### Changes

* Plugins now use RDFa aware specs when rendering to HTML, and they also expect RDFa aware specs when parsing from HTML. 
* Introduces RDFa aware version of `snippet-plugin`, that allows to record allowed snippet list IDs on a resource node level in the document.
