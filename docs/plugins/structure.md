# Structure plugin

This documentation is a work in progress.
It's possible that better information can be found in [the embeddable editor documentation](https://github.com/lblod/frontend-embeddable-notule-editor/tree/master/docs/plugins).

## Prosemirror node-specs

This plugin defines the following node-specs and node-views, which need to be added to the Prosemirror schema for it to work correctly:

```
import {
  // These use default config
  structure,
  structureView,
  // These are identical but allow custom config
  structureWithConfig,
  structureViewWithConfig,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/structure-plugin/node';
```

## Styling

Nodes from this plugin can be styled by using the following classes:

| Node | Css class |
|---|---|
| structure | say-structure |
