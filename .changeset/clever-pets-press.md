---
'@lblod/ember-rdfa-editor-lblod-plugins': major
---

Remove usage of `component` helper in preparation of embroider-compatibility.

This removal also causes a change in the variable-plugin insert-component API, the insert-components now need to be passed directly (instead of their path). 

Before:

```typescript
get variableTypes(): VariableConfig[] {
  return [
    {
      label: 'text',
      component: {
        path: 'variable-plugin/text/insert',
      },
    },
    {
      label: 'location',
      component: {
        path: 'variable-plugin/location/insert',
        options: {
          endpoint: 'https://dev.roadsigns.lblod.info/sparql',
        },
      },
    },
  ];
}
```

After:

```typescript
import TextVariableInsertComponent from '@lblod/ember-rdfa-editor-lblod-plugins/components/variable-plugin/text/insert';
import LocationInsertComponent from '@lblod/ember-rdfa-editor-lblod-plugins/components/variable-plugin/location/insert';
...
get variableTypes() {
  return [
    {
      label: 'text',
      component: TextVariableInsertComponent,
    },
    {
      label: 'location',
      component: LocationInsertComponent,
      options: {
        endpoint: 'https://dev.roadsigns.lblod.info/sparql',
      },
    },
  ];
}
```
