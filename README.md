# ember-rdfa-editor-lblod-plugins

Ember v2 addon which bundles a collection of [ember-rdfa-editor](https://github.com/lblod/ember-rdfa-editor) plugins
related to the LBLOD Project.

## Compatibility

* Ember.js v3.28 or above
* Embroider or ember-auto-import v2
* Node 18 or above

## Installation

```
ember install ember-rdfa-editor-lblod-plugins
```

## General addon information

This addon contains the following editor plugins:

* [besluit-type-plugin](#besluit-type-plugin)
* [citaten-plugin](#citaten-plugin)
* [decision-plugin](#decision-plugin)
* [import-snippet-plugin](#import-snippet-plugin)
* [insert-variable-plugin](#insert-variable-plugin)
* [rdfa-date-plugin](#rdfa-date-plugin)
* [roadsign-regulation-plugin](#roadsign-regulation-plugin)
* [standard-template-plugin](#standard-template-plugin)
* [table-of-contents-plugin](#table-of-contents-plugin)
* [template-variable-plugin](#template-variable-plugin)
* [validation-plugin](#validation-plugin)
* [address-plugin](#address-plugin)

You can configure your editor like this:
```hbs
<EditorContainer
  @editorOptions={{hash
    showRdfa='true'
    showRdfaHighlight='true'
    showRdfaHover='true'
    showPaper='true'
    showToolbarBottom=null
  }}
  @showRdfaBlocks={{this.controller.showRdfaBlocks}}
>
  <:top>
    {...}
  </:top>
  <:default>
    <Editor
      @plugins={{this.plugins}}
      @schema={{this.schema}}
      @nodeViews={{this.nodeViews}}
      @rdfaEditorInit={{this.rdfaEditorInit}}/>
  </:default>
  <:aside>
    {...}
  </:aside>
</EditorContainer>
```

You will have 2 anchor points where to put your plugins: `top` for a toolbar, and `aside` for plugin cards.

## besluit-type-plugin

Plugin which allows a user to change the type of a [besluit](https://data.vlaanderen.be/ns/besluit#Besluit).

This plugin needs to be added to the toolbar as a dropdown with the following syntax:
```hbs
  <BesluitTypePlugin::ToolbarDropdown @controller={{this.controller}} @options={{this.config.besluitType}}/>
```

You can need to specify the endpoint from which the plugin will fetch the types
```js
{
  endpoint: 'https://centrale-vindplaats.lblod.info/sparql',
}
```

## decision-plugin

This plugin provides some warnings to the user if the validation for a besluit fails, it need to be used with the validation plugin as it exports some validation rules for it.
In order to use it you will need to add its card to the sidebar like
```hbs
 <DecisionPlugin::DecisionPluginCard
    @controller={{this.controller}}
  />
```

and then import the rule and add it to the config of your validation plugin like
```js
import { atLeastOneArticleContainer } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/decision-plugin/utils/validation-rules';
...
 @tracked validationPlugin = validation((schema: Schema) => ({
    shapes: [
      atLeastOneArticleContainer(schema),
    ]
 })
```
With these changes you will see a warning if the decision is missing a title, a motivation block or an article block.

## citaten-plugin

Plugin which allows a user to insert references to a legal resource or legal expression into the document.

This plugin provides a card that needs to be added to the sidebar of the editor like
```hbs
  <CitationPlugin::CitationCard 
    @controller={{this.controller}} 
    @plugin={{this.citationPlugin}}
    @config={{this.config.citation}}
  />
```

You need to specify the endpoint for the plugin in the config object
```js
{
  endpoint: 'https://codex.opendata.api.vlaanderen.be:8888/sparql'
}
```

Same goes for the `CitationInsert` component
```hbs
  <CitationPlugin::CitationInsert
    @controller={{this.controller}}
    @config={{this.config.citation}}
  />
```


Being this.citationPlugin a tracked reference to the plugin created with the function exported from the package and the wished configuration
```js
  import { citationPlugin } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/citation-plugin';

  @tracked citationPlugin = citationPlugin({
    type: 'nodes',
    activeInNodeTypes(schema) {
      return new Set([schema.nodes.motivering]);
    },
  });
```

Configuration:
  - type: it can be 'nodes' or 'ranges' if nodes is selected you are expected to pass the `activeInNodeTypes` function, otherwise you should pass the `activeInRanges` function
  - activeInNodeTypes: it's a function that gets the prosemirror schema and the state of the actual instance of the editor and returns a `Set` of nodetypes where the plugin should be active
  - activeInRanges: it's a function that gets the state of the actual instance of the editor and returns an array of ranges for the plugin to be active in, for example `[[0,50], [70,100]]`
  - regex: you can provide your custom regex to detect citations, if not the default one will be used


A common usecase is to have the plugin active in the entire document. Here's how to do that using each configuration type:

```js
import { citationPlugin } from "@lblod/ember-rdfa-editor-lblod-plugins/plugins/citation-plugin";

const configA = {
   type: "nodes",
   activeInNodeTypes(schema) {
     // the root node of the document should always have the doc type
     return new Set([schema.nodes.doc]);
   }
 };
  
const configB = {
  type: "ranges",
  activeInRanges(state) {
    // a node's nodeSize follows the Prosemirror definition
    // a non-leaf node's size is the sum of its children's sizes + 2
    // so to get the last valid position "inside" a node, you need to subtract two from its nodeSize
    // ref: https://prosemirror.net/docs/ref/#model.Node.nodeSize 
    return [[0, state.doc.nodeSize - 2]];
  }
};
```
### Using the plugin

If used with the example configuration provided this plugin can be triggered by typing one of the following in the correct RDFa context (
the [besluit:motivering](http://data.vlaanderen.be/ns/besluit#motivering) of
a [besluit:Besluit](https://data.vlaanderen.be/ns/besluit#Besluit)).

* [specification]**decreet** [words to search for] *(e.g. "gemeentedecreet wijziging")*
* **omzendbrief** [words to search for]
* **verdrag** [words to search for]
* **grondwetswijziging** [words to search for]
* **samenwerkingsakkoord** [words to search for]
* [specification]**wetboek** [words to search for]
* **protocol** [words to search for]
* **besluit van de vlaamse regering** [words to search for]
* **gecoordineerde wetten** [words to search for]
* [specification]**wet** [words to search for] *(e.g. "kieswet wijziging", or "grondwet")*
* **koninklijk besluit** [words to search for]
* **ministerieel besluit** [words to search for]
* **genummerd besluit** [words to search for]

You should be able to add a reference manually by clicking on the `Insert` > `Insert reference` item in the Insert menu
located on the top right of the editor. This will open the advanced search window. **Note** that this will only be
avaliable in the proper context (see above in this section).

## import-snippet-plugin

Plugin allowing importing of external RDFA snippets and inserting it in the document.

The plugin has a card that needs to be added to the sidebar:
```hbs
  <ImportSnippetPlugin::Card @controller={{this.controller}}/>
```

### Using the plugin

This plugin provides an Ember service, `import-rdfa-snippet` which allows you to download rdfa snippets in the following
manner:

```js
import { inject as service } from '@ember/service';


// An entry point to download the resouce (e.g a route) in your host app.
// (...)

let downloadData = { source: 'http://remote/resource.html' }
await this.importRdfaSnippet.downloadSnippet(downloadData);
```

After having downloaded a snippet, a user can use the plugin in the Gelinkt Notuleren
application (https://github.com/lblod/frontend-gelinkt-notuleren).

When opening a new document, users will get the option to either include the snippet data in the document or as an
attachment.

## insert-variable-plugin

Plugin which allows users to insert variable placeholders into a document.

The plugin provides a card that needs to be attached to the editor sidebar like
```hbs
  <VariablePlugin::InsertVariableCard 
    @controller={{this.controller}}
    @options={{this.config.variable}}
  />
```

### Configuring the plugin

The plugin can be configured through the following optional attributes that can be added as a json to the options attribute of the card:

- `publisher`: the URI of a specific codelist publisher which you can use if you want to filter the codelists by its
  publisher.
- `defaultEndpoint`: The default endpoint where the codelists are fetched, this is also the variable that gets passed to
  the fetchSubtypes and template function
- `variableTypes`: a custom list of variable types you want the plugin to use. This list can contain the following
  default variable types: `text`, `number`,`date`,`location` and `codelist`. Additionally this list can also contain
  custom variable types, configured by the following three sub-attributes:
  * `label`: the label of the custom variable type
  * `fetchSubTypes` (optional): a function which returns a list of possible variable values. The function takes two
    optional arguments: an `endpoint` and a `publisher`.
  * `constructor`: function which returns a prosemirror node to be inserted, the function takes three arguments, the prosemirror `schema`, the `endpoint` and the `selectedSubtype` if you are using subtypes.

#### Example

```js
{
  
    publisher: 'http://data.lblod.info/id/bestuurseenheden/141d9d6b-54af-4d17-b313-8d1c30bc3f5b',
      defaultEndpoint
  :
    'https://dev.roadsigns.lblod.info/sparql',
      variableTypes
  :
    [
      'text',
      'number',
      'date',
      'location',
      'codelist',
      {
        label: 'Simple Variable',
        constructor: (schema) => {
        const mappingURI = `http://data.lblod.info/mappings/${uuidv4()}`;
        const variableInstance = `http://data.lblod.info/variables/${uuidv4()}`;
        return schema.node(
          'variable',
          {
            mappingResource: mappingURI,
            variableInstance,
            type: 'Simple Variable',
          },
          schema.node('placeholder', { placeholderText: 'text' })
        );
      },
      },
      {
        label: 'Complex Variable',
        fetchSubtypes: async (endpoint, publisher) => {
          const subtypes = [
            {
              uri: '1',
              label: '1',
            },
            {
              uri: '2',
              label: '2',
            },
            {
              uri: '3',
              label: '3',
            },
          ];
          return subtypes;
        },
        constructor: (schema, endpoint, selectedSubtype) => {
        const mappingURI = `http://data.lblod.info/mappings/${uuidv4()}`;
        const variableInstance = `http://data.lblod.info/variables/${uuidv4()}`;
        return schema.node(
          'variable',
          {
            type: 'Complex Variable',
            mappingResource: mappingURI,
            subTypeResource: selectedSubtype?.uri,
            variableInstance,
            source: endpoint,
          },
          schema.node('placeholder', {
            placeholderText: selectedSubtype?.label ?? '',
          })
        );
      }
    },
  ],
}
```

### Using the plugin

When the insert-variable-plugin is enabled, users will have the option to insert a variable into a document through a
card which pops up in the sidebar of the editor.

## rdfa-date-plugin

Plugin to insert and modify semantic dates and timestamps in an editor document.

This plugin provides a card to modify dates that needs to be added to the editor sidebar like

```hbs
  <RdfaDatePlugin::Card 
    @controller={{this.controller}}
    @options={{this.config.date}}/>
```

And a insert button to insert new dates that needs to be added to the insert part of the sidebar:
```hbs
  <RdfaDatePlugin::Insert 
    @controller={{this.controller}}
    @options={{this.config.date}}
  />
```

You will also need to add the date node with the following configuration (being the insertDate and insertDateTime the placeholder strings):
```js
  date: date({
    placeholder: {
      insertDate: this.intl.t('date-plugin.insert.date'),
      insertDateTime: this.intl.t('date-plugin.insert.datetime'),
    },
  }),
```

## roadsign-regulation-plugin

A plugin that fetches data from the mow regulation and roadsign registry and allows users to insert roadsign regulations
inside an editor document.

This plugin provides a card that needs to be added to the editor sidebar like:

```hbs
  <RoadsignRegulationPlugin::RoadsignRegulationCard @controller={{this.controller}}/>
```

You will need to set the following configuration
```js
{
  endpoint: 'https://dev.roadsigns.lblod.info/sparql',
  imageBaseUrl: 'https://register.mobiliteit.vlaanderen.be/',
}
```
The `endpoint` from where the plugin will fetch the roadsigns, and the `imageBaseUrl` is a fallback for the images that don't have a baseUrl specified, probably you won't need it if your data is correctly constructed

## standard-template-plugin

Plugin which allows users to insert standard templates in the editor. Depending on the position of the cursor or
selected text, a dropdown will appear in the toolbar of the editor that lets you insert a template for the proper
context at the location of the cursor.

In order to use this plugin you will need to add its card:
```hbs
  <StandardTemplatePlugin::Card @controller={{this.controller}}/>
```

### Template resource used by the plugin

When creating a template in your database, the following properties are used by the plugin:

* the title of the template (`title`)
* its HTML content (`content`)
* the words of the document the template should match on (`matches`)
* the contexts in which it should be active (`contexts`)
* the contexts in which it should not be active (`disabled-in-contexts`)

### Using the plugin

The plugin will search for RDFa contexts in the content of the editor and the editor itself. Based on the contexts, the
plugin will show possible templates to be added at the location of the cursor. E.g. if an element in the editor has
the `typeof="besluit:BehandelingVanAgendapunt"` attribute, the plugin will show the templates related
to [`besluit:BehandelingVanAgendapunt`](http://data.vlaanderen.be/ns/besluit#BehandelingVanAgendapunt) in the dropdown
menu. This attribute can be set on an element in the content of the editor or predefined in the editor itself.

## table-of-contents-plugin

Plugin implementing an auto-refreshing table of contents using an ember-rdfa-editor inline component.

In order to enable the plugin you need to add the table of contents button to the toolbar and the table of contents node view to the list of editor node views. 
```hbs
  <TableOfContentsPlugin::ToolbarButton @controller={{this.editor}}/>
```

```
  tableOfContentsView(this.config.tableOfContents)(controller),
```
### Configuring the plugin with a custom config

You can configure the nodeview with the hiearchy of the nodes, by default the plugin will try to find the scrollContainer automatically, this is the htmlElement that provides scroll to your document, but it might happen that this doesn't work due to your setup, so you can always specify that element yourself on the plugin options as showed below.

```js
{
  nodeHierarchy: [
    'title|chapter|section|subsection|article',
    'structure_header|article_header',
  ],
  scrollContainer: () =>
    document.getElementsByClassName('say-container__main')[0],
},
```


## template-variable-plugin

Editor plugin which allows you to interact with placeholders created by the insert-variable-plugin.

For enabling it, you need to add the card provided by the plugin to the editor sidebar
```hbs
  <VariablePlugin::TemplateVariableCard @controller={{this.controller}} @options={{this.config.templateVariable}}/>
```

You will also need to add the variable node to the list of nodes of your prosemirror schema and the variable view to the list of nodeviews like `variable: variableView(controller)` imported from:

```js
import {
  variable,
  variableView,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/variable-plugin/nodes';

```

### Configuring the plugin


You can configure the card with the following attributes:

```js
{
  endpoint: 'https://dev.roadsigns.lblod.info/sparql', // the fallback endpoint which should be used for codelists which do not have a `dct:source` property.
  zonalLocationCodelistUri:
    'http://lblod.data.gift/concept-schemes/62331E6900730AE7B99DF7EF',
  nonZonalLocationCodelistUri:
    'http://lblod.data.gift/concept-schemes/62331FDD00730AE7B99DF7F2',
}
```
The most important attributes are `zonalLocationCodelistUri` and `nonZonalLocationCodelistUri` that are the uri that the location codelists have on your backend.

## validation-plugin

see [the plugin docs](addon/plugins/validation/README.md)

## address-plugin

Editor plugin which allows you to insert address based on information from

- https://basisregisters.vlaanderen.be/api/v1/adressen
- https://geo.api.vlaanderen.be/geolocation/v4/Location

For enabling it, you need to add the card provided by the plugin to the editor sidebar

```hbs
<AddressPlugin::Insert @controller={{this.controller}} />
```

## Contributing

See the [Contributing](CONTRIBUTING.md) guide for details.

## License

This project is licensed under the [MIT License](LICENSE.md).
