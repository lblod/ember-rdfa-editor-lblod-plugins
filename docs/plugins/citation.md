# citaten-plugin

Plugin which allows a user to insert references to a legal resource or legal expression into the document.

This plugin provides a card that shows up when using certain keywords. This needs to be added to the sidebar of the editor like

```hbs
<CitationPlugin::CitationCard
  @controller={{this.controller}}
  @plugin={{this.citationPlugin}}
  @config={{this.config.citation}}
/>
```

Same goes for the `CitationInsert` component, with which you can directly insert a citation

```hbs
<CitationPlugin::CitationInsert
  @controller={{this.controller}}
  @config={{this.config.citation}}
/>
```

You need to specify the endpoints for the plugin in the config object

```js
const citationPluginConfig = {
  endpoint: 'https://codex.opendata.api.vlaanderen.be:8888/sparql',
  decisionsEndpoint:
    'https://publicatie.gelinkt-notuleren.vlaanderen.be/sparql',
  defaultDecisionsGovernmentName: 'Edegem',
};
```

The `decisionsEndpoint` is optional, and is required if you want to display decisions from the Publicatie.  
The `defaultDecisionsGovernmentName` is also optional, and is used to filter the decisions from the Publicatie by government name, the government name for the filter can be changed by the user during the search.

Make `this.citationPlugin` a tracked reference to the plugin created with the function exported from the package and the wished configuration

```js
  import { citationPlugin } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/citation-plugin';

  @tracked citationPlugin = citationPlugin({
    activeInNodeTypes(schema) {
      return new Set([schema.nodes.motivering]);
    },
  });
```

Configuration:

- You are expected to set one of two functions
  * `activeInNode` function. It's a function which expects an instance of a prosemirror node and returns whether it should be active in that node.
  * `activeInRanges` function. It's a function that gets the state of the actual instance of the editor and returns an array of ranges for the plugin to be active in, for example `[[0,50], [70,100]]`.
  * If no function is provided, the citation plugin will be activated document-wide, if both are provided, it will use the range function first and then narrow it down using the node functions given the ranges but this is not encouraged.

- regex: you can provide your custom regex to detect citations, if not the default one will be used

A common usecase is to have the plugin active in the entire document. Here's how to do that using each configuration type:

```js
import { citationPlugin } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/citation-plugin';

const configA = {
  activeInNode(node, state) {
    return node.type === state.schema.nodes.doc;
  },
};

const configB = {
  activeInRanges(state) {
    // a node's nodeSize follows the Prosemirror definition
    // a non-leaf node's size is the sum of its children's sizes + 2
    // so to get the last valid position "inside" a node, you need to subtract two from its nodeSize
    // ref: https://prosemirror.net/docs/ref/#model.Node.nodeSize
    return [[0, state.doc.nodeSize - 2]];
  },
};
```

### Using the plugin

If used with the example configuration provided this plugin can be triggered by typing one of the following in the correct RDFa context (
the [besluit:motivering](http://data.vlaanderen.be/ns/besluit#motivering) of
a [besluit:Besluit](https://data.vlaanderen.be/ns/besluit#Besluit)).These will make `CitationCard` visible with the typed search terms.

- [specification]**decreet** [words to search for] _(e.g. "gemeentedecreet wijziging")_
- **omzendbrief** [words to search for]
- **verdrag** [words to search for]
- **grondwetswijziging** [words to search for]
- **samenwerkingsakkoord** [words to search for]
- [specification]**wetboek** [words to search for]
- **protocol** [words to search for]
- **besluit van de vlaamse regering** [words to search for]
- **gecoordineerde wetten** [words to search for]
- [specification]**wet** [words to search for] _(e.g. "kieswet wijziging", or "grondwet")_
- **koninklijk besluit** [words to search for]
- **ministerieel besluit** [words to search for]
- **genummerd besluit** [words to search for]

You can also add a reference manually by clicking on the `Insert` > `Insert reference` item in the Insert menu located on the top right of the editor (this is the `CitationInsert` component). This will open the advanced search window. **Note** that this will only be
avaliable in the proper context (see above in this section).
