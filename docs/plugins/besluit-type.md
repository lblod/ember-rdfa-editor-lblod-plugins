# besluit-type-plugin

Plugin which allows a user to change the type of a [besluit](https://data.vlaanderen.be/ns/besluit#Besluit).

This plugin needs to be added to the toolbar as a dropdown with the following syntax:

```hbs
<BesluitTypePlugin::ToolbarDropdown
  @controller={{this.controller}}
  @options={{this.config.besluitType}}
/>
```

You need to specify the endpoint from which the plugin will fetch the types in the config object

```js
{
  endpoint: 'https://centrale-vindplaats.lblod.info/sparql',
}
```
