# Validation Plugin

A plugin to validate the document state, with an interface inspired by the SHACL specification.

## usage

This plugin consists of a ProseMirror plugin as well as a `ValidationPlugin::ValidationCard` component 
which provides an easy way to render the validation errors. It is a keyed plugin, meaning only one instance can be 
active at any time.

```ts

import { validation } from "@lblod/ember-rdfa-editor-lblod-plugins/plugins/validation";

validationPlugin = validation((schema: Schema) => ({
  shapes: [
    {
      name: "exactly-one-title",
      focusNodeType: schema.nodes.besluit,
      path: ["title"],
      message: "Document must contain exactly one title block.",
      constraints: {
        minCount: 1,
        maxCount: 1
      }
    },
    {
      name: "exactly-one-description",
      focusNodeType: schema.nodes.besluit,
      path: ["description"],
      message: "Document must contain exactly one description block.",
      constraints: {
        minCount: 1,
        maxCount: 1
      }
    },
    {
      name: "max-one-motivation",
      focusNodeType: schema.nodes.besluit,
      path: ["motivering"],
      message: "Document may not contain more than one motivation block.",
      constraints: {
        maxCount: 1
      }
    }
  ]
}));
```

```handlebars

<ValidationPlugin::ValidationCard 
        @title={{t "dummy.validation-card.title"}} 
        @controller={{this.controller}} 
        @report={{this.report}}/>
```
In which the report can be extracted from the plugin state of the validation plugin.

## Validation algorithm

This high-level overview of the algorithm explains how the focusNode and path configurations define which 
"shapes" are validated:

- traverse the entire document depth-first
- on every node, keep track of the validation shapes that have a focusNodeType set to that node's type
- for any shapes that have been triggered already, check if this node's type is correct for the corresponding
position in the path
- every time we find a complete and exact match for a focusNode->path chain of nodes, we count it
- once we've seen the entire subtree of a particular focusNode, we validate the constraints on all "completed" shapes

## Currently supported constraints

### maxCount

- type: `number`
- meaning: the specified shape may not occur more times than the specified amount in the focusNode



### `minCount: number`

- type: `number`
- meaning: the specified shape must occur at least as many times as the specified amount in the focusNode

