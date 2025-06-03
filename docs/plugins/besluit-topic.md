# besluit-topic-plugin

Plugin which allows a user to change the topic of a [besluit](https://data.vlaanderen.be/ns/besluit#Besluit).

This plugin needs to be added to the toolbar as a dropdown with the following syntax:

```hbs
<BesluitTopicPlugin::BesluitTopicToolbarDropdown
  @controller={{this.controller}}
  @options={{this.config.besluitTopic}}
/>
```

You need to specify the endpoint from which the plugin will fetch the types in the config object

```js
{
  endpoint: 'https://data.vlaanderen.be/sparql',
}
```
