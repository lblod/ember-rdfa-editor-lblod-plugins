# import-snippet-plugin

Plugin allowing importing of external RDFA snippets and inserting it in the document.

The plugin has a card that needs to be added to the sidebar:

```hbs
<ImportSnippetPlugin::Card @controller={{this.controller}} />
```

## Using the plugin

This plugin provides an Ember service, `import-rdfa-snippet` which allows you to download rdfa snippets in the following
manner:

```js
import { service } from '@ember/service';

// An entry point to download the resouce (e.g a route) in your host app.
// (...)

let downloadData = { source: 'http://remote/resource.html' };
await this.importRdfaSnippet.downloadSnippet(downloadData);
```

After having downloaded a snippet, a user can use the plugin in the Gelinkt Notuleren
application (https://github.com/lblod/frontend-gelinkt-notuleren).

When opening a new document, users will get the option to either include the snippet data in the document or as an
attachment.
