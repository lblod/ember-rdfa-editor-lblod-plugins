# article-structure plugin

Plugin which allows a user to insert different types of structures, like chapters, sections, articles etc.

This plugin provides two widgets which can be added to the sidebar.

## The structure insertion widget

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

## The structure context widget

This widget displays a context card in the sidebar when a structure is selected by the user. The card displays controls which allow users to move a structure around or remove it alltogether.

You can add this widget to the sidebar using the following syntax:

```hbs
<ArticleStructurePlugin::StructureCard
  @controller={{this.controller}}
  @options={{this.config.structures}}
/>
```

Just like the insertion widget, this widget also accepts the same two properties.

## Configuring the plugin

This plugin uses the [structure-plugin](docs/plugins/structure-plugin.md) for most of its functionality, so the configuration options are the same as for that plugin.

### Deprecated configuration options

> [!WARNING]
> Previously configuration was done through specifying structure specs.
> This section refers to that and should not be used for new projects.

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
