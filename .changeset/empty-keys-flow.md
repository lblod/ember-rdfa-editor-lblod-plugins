---
'@lblod/ember-rdfa-editor-lblod-plugins': major
---

LMB-plugin: breaking change to the `LMBPluginConfig` interface:
the `defaultAdminUnit` now expects an object of the shape
```ts
{
  uri: string;
  label: string;
}
```

The administrative unit input field of the `lmb-plugin` `SearchModal` component is now implement through a dynamic `PowerSelect` component rather than a free-text input field.