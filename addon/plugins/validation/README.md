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
