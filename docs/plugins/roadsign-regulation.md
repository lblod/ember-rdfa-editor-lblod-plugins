# roadsign-regulation-plugin

A plugin that fetches data from the mow regulation and roadsign registry and allows users to insert roadsign regulations
inside an editor document.

This plugin provides a card that needs to be added to the editor sidebar like:

```hbs
<RoadsignRegulationPlugin::RoadsignRegulationCard
  @controller={{this.controller}}
  @options={{this.config.roadsignRegulation}}
/>
```

You will need to set the following configuration in the config object

```js
{
  endpoint: 'https://dev.roadsigns.lblod.info/sparql',
  imageBaseUrl: 'https://register.mobiliteit.vlaanderen.be/',
}
```

The `endpoint` from where the plugin will fetch the roadsigns, and the `imageBaseUrl` is a fallback for the images that don't have a baseUrl specified. This won't be used if your data is correctly constructed.

## Prosemirror node-specs

This plugin defines the following node-spec, which needs to be added to the Prosemirror schema for it to work correctly:

```
import { roadsign_regulation } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/roadsign-regulation-plugin/nodes';
```

## Styling

Nodes from this plugin can be styled by using the following classes:

| Node | Css class |
|---|---|
| roadsign_regulation | say-roadsign-regulation |
