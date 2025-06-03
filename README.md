# ember-rdfa-editor-lblod-plugins

Ember v2 addon which bundles a collection of [ember-rdfa-editor](https://github.com/lblod/ember-rdfa-editor) plugins
related to the LBLOD Project.

## Compatibility

- Ember.js 5.4+ (or 4.12+)
  4.12 is no longer tested and not officially supported, but should still work for now.

- Embroider or ember-auto-import v2
- Node 18 or above (20+ recommended)

## Installation

```
ember install ember-rdfa-editor-lblod-plugins
```

## General addon information

This addon contains the following editor plugins:

- [article-structure-plugin](docs/plugins/article-structure.md)
- [besluit-topic-plugin](docs/plugins/besluit-topic.md)
- [besluit-type-plugin](docs/plugins/besluit-type.md)
- [citation-plugin](docs/plugins/citation.md)
- [decision-plugin](docs/plugins/decision.md)
- [import-snippet-plugin](docs/plugins/import-snippet.md)
- [roadsign-regulation-plugin](docs/plugins/roadsign-regulation.md)
- [standard-template-plugin](docs/plugins/standard-template.md)
- [table-of-contents-plugin](docs/plugins/table-of-contents.md)
- [variable-plugin](docs/plugins/variable.md)
- [template-comments-plugin](docs/plugins/template-comments.md)
- [confidentiality-plugin](docs/plugins/confidentiality.md)
- [document-title-plugin](docs/plugins/document-title.md)
- [generic-rdfa-variable-plugin](docs/plugins/generic-rdfa-variable.md)
- [lmb-plugin](docs/plugins/lmb.md)
- [location-plugin](docs/plugins/location.md)
- [lpdc-plugin](docs/plugins/lpdc.md)
- [mandatee-table-plugin](docs/plugins/mandatee-table.md)
- [snippet-plugin](docs/plugins/snippet.md)
- [structure-plugin](docs/plugins/structure.md)
- [worship-plugin](docs/plugins/worship.md)

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

## Styling

Most custom nodespecs defined by plugins define specific CSS classes to allow for them to be styled by a consuming app.
These can be augmented by adding custom classes when adding nodespecs to the schema, [in the way defined in the ember-rdfa-editor repo](https://github.com/lblod/ember-rdfa-editor#override-node-classes).

## Embroider

To use `@lblod/ember-rdfa-editor-lblod-plugins` with Embroider some extra Webpack configuration is needed, which you can import like this:

```js
// ember-cli-build.js
  // ...
  const { Webpack } = require('@embroider/webpack');
  return require('@embroider/compat').compatBuild(app, Webpack, {
    // other Embroider options
    packagerOptions: {
      webpackConfig: require('@lblod/ember-rdfa-editor-lblod-plugins/webpack-config'),
    },
    extraPublicTrees: [],
  });
};
```

If you already provide some Webpack configuration, you can deep merge that with the config object we provide.

## Translation

Translations are provided for UI elements using ember-intl.
Currently the only languages supported are English (en-US) and Dutch (nl-BE).
Other languages can be added by copying the contents of the file `translations/en-us.yaml` into the relevant language file in your `translations` folder and translating all of the strings.

A helper function is provided to assist with finding a reasonable fallback locale, for example providing `en-US` translations if `en` is requested.
See [the test app](tests/dummy/app/routes/application.ts) for example of it's usage.

## Contributing

See the [Contributing](CONTRIBUTING.md) guide for details.

## Releasing

See the [Release](RELEASE.md) guide.

## License

This project is licensed under the [MIT License](LICENSE.md).
