---
'@lblod/ember-rdfa-editor-lblod-plugins': major
---

Introduce new `codelist` variable which stores either a single or multiple `codelist_option` nodes.
Each `codelist_option` node is a resource node which represents a selected codelist-option, and a variable instance.
The `codelist` variable node itself is more of a container node and does not store any RDFa.
The old `codelist` variable node is renamed to `legacy_codelist`, and can still be used with the existing `codelist-edit` widget.
`legacy_codelist` nodes will not be automatically converted to new `codelist` nodes, as we lack the necessary information to do so (codelist-option URIs).
