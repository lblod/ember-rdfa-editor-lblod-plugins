# ember-rdfa-editor-lblod-plugins

Ember v2 addon which bundles a collection of [ember-rdfa-editor](https://github.com/lblod/ember-rdfa-editor) plugins
related to the LBLOD Project.

## Compatibility

- Ember.js 4.8+
  The 5.x range is currently untested and not officially supported, but we accept issues and PRs to do so.

- Embroider or ember-auto-import v2
- Node 18 or above

## Installation

```
ember install ember-rdfa-editor-lblod-plugins
```

## General addon information

This addon contains the following editor plugins:

- [article-structure-plugin](#article-structure-plugin)
- [besluit-type-plugin](#besluit-type-plugin)
- [citaten-plugin](#citaten-plugin)
- [decision-plugin](#decision-plugin)
- [import-snippet-plugin](#import-snippet-plugin)
- [roadsign-regulation-plugin](#roadsign-regulation-plugin)
- [standard-template-plugin](#standard-template-plugin)
- [table-of-contents-plugin](#table-of-contents-plugin)
- [variable-plugin](#variable-plugin)
- [validation-plugin](#validation-plugin)
- [template-comments-plugin](#template-comments-plugin)

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
      @rdfaEditorInit={{this.rdfaEditorInit}}
    />
  </:default>
  <:aside>
    {...}
  </:aside>
</EditorContainer>
```

You will have 2 anchor points where to put your plugins: `top` for a toolbar, and `aside` for plugin cards.

## article-structure plugin

Plugin which allows a user to insert different types of structures, like chapters, sections, articles etc.

This plugin provides two widgets which can be added to the sidebar.

### The structure insertion widget

This widget displays a series of buttons which allows the user to insert the configured widgets.

You can add this widget to the sidebar using the following syntax:

```hbs
<ArticleStructurePlugin::ArticleStructureCard
  @controller={{this.controller}}
  @options={{this.config.structures}}
/>
```

The widgets accepts two properties:

- `controller`: an instance of a `SayController` which the widgets uses two insert structures into a document
- `options`: a list of structure configurations which are supported.

### The structure context widget

This widget displays a context card in the sidebar when a structure is selected by the user. The card displays controls which allow users to move a structure around or remove it alltogether.

You can add this widget to the sidebar using the following syntax:

```hbs
<ArticleStructurePlugin::StructureCard
  @controller={{this.controller}}
  @options={{this.config.structures}}
/>
```

Just like the insertion widget, this widget also accepts the same two properties.

### Configuring the plugin

Both widgets require an `options` property which allows you to configure which type of structures are supported, which is a list of `StructureSpec` objects.

E.g. a regulatory statement document will typically have the following configuration of structures:

```js
export const STRUCTURE_SPECS: ArticleStructurePluginOptions = [
  titleSpec,
  chapterSpec,
  sectionSpec,
  subsectionSpec,
  articleSpec,
  articleParagraphSpec,
];
```

Each of these entries is a seperate `StructureSpec` object. The `StructureSpec` interface is defined as:

```js
export type StructureSpec = {
  name: SpecName; // the name of the corresponding structure node-spec
  translations: { // the ember-intl translation keys which are to be used in the widgets
    insert: string;
    move?: {
      up?: string;
      down?: string;
    };
    remove?: string;
    removeWithContent?: string;
  };
  constructor: (args: { // a `constructor` method which creates an instance of the structure node
    schema: Schema;
    number?: number;
    intl?: IntlService;
    content?: PNode | Fragment;
    state?: EditorState;
  }) => {
    node: PNode;
    selectionConfig: {
      relativePos: number;
      type: 'node' | 'text';
    };
  };
  updateNumber: (args: { // a method which produces a transaction which updates the number of a structure when it is moved around
    number: number;
    pos: number;
    transaction: Transaction;
  }) => Transaction;
  content?: (args: { pos: number; state: EditorState }) => Fragment;
  continuous: boolean; // boolean which indicates whether the numbering of this structure type is continuous or should restart with each different parent
  limitTo?: string; // string which indicates a node-spec name to which the insertion of the structure should be limited to
  noUnwrap?: boolean; // disable unwrapping of the structure when it is removed and just remove it with it content alltogether
};
```

Note: for each structure you configure, the corresponding node-spec also needs to be added to the schema.

By default, this plugin already exports some structure-specs and their corresponding node-specs:

```js
const STRUCTURE_SPECS: ArticleStructurePluginOptions = [
  titleSpec,
  chapterSpec,
  sectionSpec,
  subsectionSpec,
  articleSpec,
  articleParagraphSpec,
];

const STRUCTURE_NODES = {
  structure_header,
  title,
  title_body,
  chapter,
  chapter_body,
  section,
  section_body,
  subsection,
  subsection_body,
  article,
  article_header,
  article_body,
  article_paragraph,
};

```

You can import these using:

```js
import {
  STRUCTURE_NODES,
  STRUCTURE_SPECS,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/article-structure-plugin/structures';
```

Additional examples can be found in the two controllers (besluit-sample and regulatory-statement-sample) of the dummy-app contained in this repository.

## besluit-type-plugin

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

## decision-plugin

This plugin provides some warnings to the user if the validation for a besluit fails, it need to be used with the validation plugin as it exports some validation rules for it.
In order to use it you will need to add its card to the sidebar like

```hbs
<DecisionPlugin::DecisionPluginCard @controller={{this.controller}} />
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
import { citationPlugin } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/citation-plugin';

const configA = {
  type: 'nodes',
  activeInNodeTypes(schema) {
    // the root node of the document should always have the doc type
    return new Set([schema.nodes.doc]);
  },
};

const configB = {
  type: 'ranges',
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

## import-snippet-plugin

Plugin allowing importing of external RDFA snippets and inserting it in the document.

The plugin has a card that needs to be added to the sidebar:

```hbs
<ImportSnippetPlugin::Card @controller={{this.controller}} />
```

### Using the plugin

This plugin provides an Ember service, `import-rdfa-snippet` which allows you to download rdfa snippets in the following
manner:

```js
import { inject as service } from '@ember/service';

// An entry point to download the resouce (e.g a route) in your host app.
// (...)

let downloadData = { source: 'http://remote/resource.html' };
await this.importRdfaSnippet.downloadSnippet(downloadData);
```

After having downloaded a snippet, a user can use the plugin in the Gelinkt Notuleren
application (https://github.com/lblod/frontend-gelinkt-notuleren).

When opening a new document, users will get the option to either include the snippet data in the document or as an
attachment.

## roadsign-regulation-plugin

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

## standard-template-plugin

Plugin which allows users to insert standard templates in the editor. Depending on the position of the cursor or
selected text, a dropdown will appear in the toolbar of the editor that lets you insert a template for the proper
context at the location of the cursor.

In order to use this plugin you will need to add its card:

```hbs
<StandardTemplatePlugin::Card @controller={{this.controller}} />
```

### Template resource used by the plugin

When creating a template in your database, the following properties are used by the plugin:

- the title of the template (`title`)
- its HTML content (`content`)
- the words of the document the template should match on (`matches`)
- the contexts in which it should be active (`contexts`)
- the contexts in which it should not be active (`disabled-in-contexts`)

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
<TableOfContentsPlugin::ToolbarButton @controller={{this.editor}} />
```

```js
  tableOfContentsView(this.config.tableOfContents)(controller),
```

You also need to allow this node as content by adding it to the doc node of the schema. It is _not_ part of the block group.

```js
// example to allow the table of contents at the top and any blocks underneath
doc: docWithConfig({
        content: 'table-of-contents? block+'
     }),
```

### Configuring the plugin with a custom config

You can configure the nodeview with the hierarchy of the nodes.  
For very custom setups, the plugin might be unable to find your scrollContainer (htmlElement providing scroll to your document). You can pass the scrollContainer element via the `scrollContainer()` function in the plugin config options instead.

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

`nodeHierarchy` is a list of _regex_ strings to specify the node structure of the document. Note that this means the order of the words does not matter. The example shows this for article structures.
The _first string_ selects the main nodes in the document that define the structure.
The strings afterwards are the sub-nodes inside main nodes that should be used to find the actual content to display in the table of contents, if the main node does not contain the content directly. In the example a title will have a `structure_header` that contains the actual text of the title.  
In the case that `structure_header` contains a node `actual_title_text` that should be used as content, you'd have to add a third regex string that matches `actual_title_text`.

### Internationalization of the table of contents

The dynamic version of the table of contents is internationalized based on the current document language and using the `ember-intl` service.
The static (serialized) version of the table of contents can also be internationalized based on the current document language. For this to work correctly, the `emberApplication` prosemirror-plugin should be present.
You can add this plugin as follows to the controller/component in which the editor is initialized:

```js
import { getOwner } from '@ember/application';
import { emberApplication } from '@lblod/ember-rdfa-editor/plugins/ember-application';
...
plugins = [
  ...
  emberApplication(getOwner(this));
  ...
];
...
```

As an example, the `emberApplication` plugin has been added to the regulatory-statement route of the dummy app included in this addon.

The table of contents node needs this plugin to be able to translate the serialized version properly. If the plugin is not present, a default (dutch) version of the table of contents will be generated.

## variable-plugin

Editor plugin which provides node-specs and components which allow you to insert and edit different types of variables in a document. The plugin provides the following variable types:

- text variable
- number variable
- date variable
- codelist
- location
- address

Additional variable types can be added in the consuming application or addon.

For each of these variable types, a node-spec and node-view are defined. You can import them like this:

```js
import {
  codelist,
  codelistView,
  location,
  locationView,
  number,
  numberView,
  text_variable,
  textVariableView,
  address,
  addressView,
  date,
  dateView,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/variable-plugin/variables';
```

For each of the variable-types you want to include in your editor instance, you should add the corresponding node-spec to your schema and the node-view to the `nodeViews` editor argument.

Both the `date` node-spec and `dateView` nodeview are functions which expect a `DateOptions` object, more information on how to define such a `DateOptions` object can be found in the section on the [date-edit component](#the-date-variable)

### Inserting variables into a document

This addon includes an insert-component for each of these variable types:

- `variable-plugin/text/insert`
- `variable-plugin/number/insert`
- `variable-plugin/date/insert`
- `variable-plugin/location/insert`
- `variable-plugin/codelist/insert`
- `variable-plugin/address/insert-variable`

Each of these components presents a custom UI which allows a user to insert a variable of the corresponding type in a document.

These insert-components can be used on their own, but can also be used in combination with the `variable-plugin/insert-variable-card` component. The responsibility of this component is two-fold:

- It allows a user to select a variable type.
- The correct insert component corresponding to the user-selected variable type is shown.

The `variable-plugin/insert-variable-card` can be easily configured: it expects two arguments:

- `controller`: An instance of the `SayController` class
- `variableTypes`: A list of `VariableConfig` objects. With each `VariableConfig` containing:
  - the `label` which should be displayed in the variable-select dropdown
  - the `component`: class of the component which should be displayed upon selecting the variable type.
  - _optionally_ an `options` argument object which should be passed to the insert-variable component.

* The `VariableConfig` type is defined as follows:

```js
 type VariableConfig = {
   label: string;
   component: ComponentLike;
   options?: unknown;
 };
```

#### An example

To allows users to insert variables into a document, add the following to the editor sidebar in your template:

```hbs
<VariablePlugin::InsertVariableCard
  @controller={{this.controller}}
  @variableTypes={{this.variableTypes}}
/>
```

`this.controller` is an instance of `SayController` and `this.variableTypes` is the list of `VariableConfig` objects which should be defined in your controller/component class:

```js
import TextVariableInsertComponent from '@lblod/ember-rdfa-editor-lblod-plugins/components/variable-plugin/text/insert';
import NumberInsertComponent from '@lblod/ember-rdfa-editor-lblod-plugins/components/variable-plugin/number/insert';
import DateInsertVariableComponent from '@lblod/ember-rdfa-editor-lblod-plugins/components/variable-plugin/date/insert-variable';
import LocationInsertComponent from '@lblod/ember-rdfa-editor-lblod-plugins/components/variable-plugin/location/insert';
import CodelistInsertComponent from '@lblod/ember-rdfa-editor-lblod-plugins/components/variable-plugin/codelist/insert';
import VariablePluginAddressInsertVariableComponent from '@lblod/ember-rdfa-editor-lblod-plugins/components/variable-plugin/address/insert-variable';
...
get variableTypes() {
  return [
    {
      label: 'text',
      component: TextVariableInsertComponent,
    },
    {
      label: 'number',
      component: NumberInsertComponent,
    },
    {
      label: 'date',
      component: DateInsertVariableComponent
    },
    {
      label: 'location',
      component: LocationInsertComponent,
      options: {
        endpoint: 'https://dev.roadsigns.lblod.info/sparql',
      },
    },
    {
      label: 'codelist',
      component: CodelistInsertComponent,
      options: {
        endpoint: 'https://dev.roadsigns.lblod.info/sparql',
      },
    },
    {
      label: 'address',
      component: VariablePluginAddressInsertVariableComponent,
    },
  ];
}
```

As you can see, both the `location` and `codelist` insert-components require an endpoint to be provided. They will use it to fetch the codelists/locations.
Aside from the endpoint, the `codelist` insert-component may optionally expect a publisher argument which it will use to limit the codelist fetch to a specific publisher.

### Editing variables in a document

Each of the variables provided by this addon have a different editing experiences and use different components:

#### The text variable

Editing a text variable requires no extra components aside from its node-spec and node-view. A user can just type into the text variable directly.

#### The number variable

Editing a number variable can be done in its nodeview directly. When a user clicks on a number variable in a document, it opens a popup allow you to fill in a number.

#### The date variable

This addon provides a seperate edit component which allows users to fill in date variables in a document.
This component can be added to the sidebar of an editor instance in a template as follows:

```hbs
<RdfaDatePlugin::Card
  @controller={{this.controller}}
  @options={{this.dateOptions}}
/>
```

Where `this.dateOptions` is a `DateOptions` object used to configure the edit component. It can be defined as e.g.:

```js
get dateOptions(){
  return {
     formats: [
      {
        label: 'Short Date',
        key: 'short',
        dateFormat: 'dd/MM/yy',
        dateTimeFormat: 'dd/MM/yy HH:mm',
      },
      {
        label: 'Long Date',
        key: 'long',
        dateFormat: 'EEEE dd MMMM yyyy',
        dateTimeFormat: 'PPPPp',
      },
    ],
    allowCustomFormat: true,
  }
}
```

- `formats`: specify default formats to show for selection in the date card.
	- `label` (optional): The label shown to the user on the card. If not provided, the format is used instead e.g.: `dd/MM/yyyy`
	- `key`: A **unique** identifier used for identification in the internal code. 
	- `dateFormat`: The date format used when this is selected.
	- `dateTimeFormat`: The datetime format to use when this is selected. Used when the user selects "Include time".
- `allowCustomFormat`: true by default, determines if the option to insert a fully custom format is available for newly created date nodes.

The syntax of formats can be found at [date-fns](https://date-fns.org/v2.29.3/docs/format).

#### The location variable

This addon provides a seperate edit component which allows users to fill in location variables in a document.
This component can be added to the sidebar of an editor instance in a template as follows:

```hbs
<VariablePlugin::Location::Edit
  @controller={{this.controller}}
  @options={{this.locationEditOptions}}
/>
```

Where `this.locationEditOptions` is a `LocationEditOptions` object used to configure the edit component. It can be defined as e.g.:

```js
get locationEditOptions() {
  return {
      endpoint: 'https://dev.roadsigns.lblod.info/sparql', //the fallback endpoint the edit component should use to fetch location values if the location variable has no `source` attribute
      zonalLocationCodelistUri:
        'http://lblod.data.gift/concept-schemes/62331E6900730AE7B99DF7EF', //the uri the edit component should search for if the location variable is included in a zonal traffic measure
      nonZonalLocationCodelistUri:
        'http://lblod.data.gift/concept-schemes/62331FDD00730AE7B99DF7F2', // the uri the edit component should search for if the location variable is included in a non-zonal traffic measure
    };
}
```

#### The codelist variable

This addon provides a seperate edit component which allows users to fill in codelist variables in a document.
This component can be added to the sidebar of an editor instance in a template as follows:

```hbs
<VariablePlugin::Codelist::Edit
  @controller={{this.controller}}
  @options={{this.codelistEditOptions}}
/>
```

Where `this.codelistEditOptions` is a `CodelistEditOptions` object used to configure the edit component. It can be defined as e.g.:

```js
get codelistEditOptions() {
  return {
      endpoint: 'https://dev.roadsigns.lblod.info/sparql', //the fallback endpoint the edit component should use to fetch codelist values if the codelist variable has no `source` attribute
    };
}
```

#### The address variable

This addon provides a seperate edit component which allows users to search for an address and update the select address variable. Additionally, they can also choose whether to include the housenumber of an address.
You can add this edit-component to a template as follows:

```hbs
<VariablePlugin::Address::Edit
  @controller={{this.controller}}
  @defaultMuncipality='Antwerpen'
/>
```

The edit card can be configured with two arguments:

- An instance of a `SayController` (required)
- A `defaultMuncipality` which should be used as the default value of the `muncipality` field in the edit-card (optional)

You can also add an insert component meant for use outside of `insert-variable-card` by using the `variable-plugin/address/insert` component. This has no label-input and will show a default label.

```hbs
<VariablePlugin::Address::Insert @controller={{this.controller}} />
```

## validation-plugin

see [the plugin docs](addon/plugins/validation/README.md)

## template-comments-plugin

A plugin to insert a template comment anywhere in the document.  
This is meant as a block of text for extra information to provide to a created template. It has
the attribute `ext:TemplateComment`. This can (and should) be filtered out when publishing the document, as it is only meant as extra information while filling in a template.  
It supports basic text with indenting, list items and marks.

Add it to editor by adding `templateComment` to your schema and

```js
templateComment: templateCommentView(controller),
```

as a nodeview.

Import with:

```js
import {
  templateComment,
  templateCommentView,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/template-comments-plugin';
```

Button to insert a template comment is added with

```hbs
<TemplateCommentsPlugin::Insert @controller={{this.controller}} />
```

Buttons to remove and move it when selected can be shown with

```hbs
<TemplateCommentsPlugin::EditCard @controller={{this.controller}} />
```

Template comments have a specific style that can be imported in the stylesheet with

```css
@import 'template-comments-plugin';
```

## Contributing

See the [Contributing](CONTRIBUTING.md) guide for details.

## Releasing

See the [Release](RELEASE.md) guide.

## License

This project is licensed under the [MIT License](LICENSE.md).
