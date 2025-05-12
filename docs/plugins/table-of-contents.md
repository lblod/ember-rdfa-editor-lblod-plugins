# table-of-contents-plugin

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

## Configuring the plugin with a custom config

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

## Internationalization of the table of contents

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
