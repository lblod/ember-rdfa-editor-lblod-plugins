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

* besluit-type-plugin
* citaten-plugin
* generate-template-plugin
* import-snippet-plugin
* insert-variable-plugin
* rdfa-date-plugin
* roadsign-regulation-plugin
* standard-template-plugin
* table-of-contents-plugin
* template-variable-plugin

An array of plugin configurations can be passed to an instance of the ember-rdfa-editor in order to enable them.
This is typically done in the following manner:

```hbs
<Rdfa::RdfaEditor
      class="au-c-rdfa-editor"
      @profile={{@profile}}
      @rdfaEditorInit={{this.rdfaEditorInit}}
      @editorOptions={{this.editorOptions}}
      @toolbarOptions={{this.toolbarOptions}}
      @plugins={{this.plugins}}
    />
```

Where `this.plugins` is an array of plugin configurations found in the backing class of the template shown above.

## besluit-type-plugin

Plugin which allows a user to change the type of a [besluit](https://data.vlaanderen.be/ns/besluit#Besluit).

This plugin can be configured in the following manner:

```js
  this.plugins = ["besluit"];
```

## citaten-plugin

Plugin which allows a user to insert references to a legal resource or legal expression into the document.

This plugin can be configured in the following manner:

```js
  this.plugins = ["citaten"];
```

### Using the plugin

This plugin can be triggered by typing one of the following in the correct RDFa context (
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

## generate-template-plugin

Plugin which provides an editor command which replaces resource URIs in a document by a generic template URI
containing `${generateUuid()}`. This allows for the generation of template documents. Template documents can be used by
other applications, these other applications can create an instance of a template by replacing the `${generateUuid()}`
keywords by real URIs.

This plugin can be configured in the following manner:

```js
  this.plugins = ["generate-template"];
```

The command can be used by executing:

```js
controller.executeCommand('generateTemplate', controller);
```

Where `controller` is an editor-controller.

## import-snippet-plugin

Plugin allowing importing of external RDFA snippets and inserting it in the document.

This plugin can be configured in the following manner:

```js
  this.plugins = ["import-snippet"];
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

### Configuring the plugin

The plugin can be configured through the following optional attributes:

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
  * `template`: function which returns an html template which should be resolved and inserted when inserting a variable
    of the custom variable type. The function takes two arguments: an `endpoint` and a `selectedVariableValue`.

#### Example

```js
{
  name:'insert-variable',
    options
:
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
        template: `
              <span property="ext:content" datatype="ext:myNewType">
                <span class="mark-highlight-manual">\${Simple variable}</span>
              </span>
            `,
      },
      {
        label: 'Complex Variable',
        fetchSubtypes: async (endpoint, publisher) => {
          const codelists = [
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
          return codelists;
        },
        template: (endpoint, selectedCodelist) => `
              <span property="ext:codelist" resource="${selectedCodelist.uri}"></span>
              <span property="dct:type" content="location"></span>
              <span property="dct:source" resource="${endpoint}"></span>
              <span property="ext:content" datatype="xsd:date">
                <span class="mark-highlight-manual">\${${selectedCodelist.label}}</span>
              </span>
            `,
      },
    ],
  }
}
```

### Using the plugin

When the insert-variable-plugin is enabled, users will have the option to insert a variable into a document through a
card which pops up in the sidebar of the editor.

## rdfa-date-plugin

Plugin to insert and modify semantic dates and timestamps in an editor document.

This plugin can be configured in the following manner:

```js
  this.plugins = ["rdfa-date"];
```

## roadsign-regulation-plugin

A plugin that fetches data from the mow regulation and roadsign registry and allows users to insert roadsign regulations
inside an editor document.

This plugin can be configured in the following manner:

```js
  this.plugins = ["roadsign-regulation"];
```

The default endpoint the plugin will query is https://roadsigns.lblod.info/sparql . This can be overwritten by
setting `roadsignRegulationPlugin.endpoint` in your `config/environment.js`.

## standard-template-plugin

Plugin which allows users to insert standard templates in the editor. Depending on the position of the cursor or
selected text, a dropdown will appear in the toolbar of the editor that lets you insert a template for the proper
context at the location of the cursor.

This plugin can be configured in the following manner:

```js
  this.plugins = ["standard-template"];
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

In order to enable the plugin you need to add `table-of-contents` to the list of plugins passed to the rdfa-editor. You
can configure the plugin with a custom table of contents configuration.

### Configuring the plugin with a custom config

```js
this.plugins = [
  {
    name: 'table-of-contents',
    options: {
      config: {
        sectionPredicate: 'https://say.data.gift/ns/hasPart',
        value: {
          predicate: 'https://say.data.gift/ns/heading',
        },
      },
  {
    sectionPredicate: 'https://say.data.gift/ns/hasParagraph',
    value: '§',
  },
}
},
]
```

You can insert an instance of a table of contents using the `insert-component` command:

```js
controller.executeCommand(
  'insert-component',
  'table-of-contents-plugin/inline-components/table-of-contents',
  {
    config: [
      {
        sectionPredicate: 'https://say.data.gift/ns/hasPart',
        value: {
          predicate: 'https://say.data.gift/ns/heading',
        },
      },
      {
        sectionPredicate: 'https://say.data.gift/ns/hasParagraph',
        value: '§',
      },
    ],
  },
  {},
  false
);
```

## template-variable-plugin

Editor plugin which allows you to interact with placeholders created by the insert-variable-plugin.

### Configuring the plugin

You can enable the plugin by adding it to the list of plugins:

```js
this.plugins = ['template-variable'];
```

Additionally, you can configure the plugin in your `environment.js` file:

```js
templateVariablePlugin: {
  endpoint: 'https://dev.roadsigns.lblod.info/sparql', // the fallback endpoint which should be used for codelists which do not have a `dct:source` property.
    zonalLocationCodelistUri
:
  'http://lblod.data.gift/concept-schemes/62331E6900730AE7B99DF7EF',
    nonZonalLocationCodelistUri
:
  'http://lblod.data.gift/concept-schemes/62331FDD00730AE7B99DF7F2',
}
,
```

## validation-plugin

see [the plugin docs](addon/plugins/validation/README.md)

## Contributing

See the [Contributing](CONTRIBUTING.md) guide for details.

## License

This project is licensed under the [MIT License](LICENSE.md).
