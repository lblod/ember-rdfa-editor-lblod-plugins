---
'@lblod/ember-rdfa-editor-lblod-plugins': minor
---

Extension of configuration options of `citation-plugin`.
The `CitationPluginNodeConfig` is extended to allow for a `activeInNode` condition.
This allows you to specify a condition which an active/context node needs to satisfy.
```ts
interface CitationPluginNodeConditionConfig {
  type: 'nodes';
  regex?: RegExp;

  activeInNode(node: PNode, state?: EditorState): boolean;
}
```
The previously expected `activeInNodeTypes` option is marked as deprecated and will be removed in a future release.
