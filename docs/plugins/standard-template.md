# standard-template-plugin

Plugin which allows users to insert standard templates in the editor. Depending on the position of the cursor or
selected text, a dropdown will appear in the toolbar of the editor that lets you insert a template for the proper
context at the location of the cursor.

In order to use this plugin you will need to add its card:

```hbs
<StandardTemplatePlugin::Card @controller={{this.controller}} />
```

## Template resource used by the plugin

When creating a template in your database, the following properties are used by the plugin:

- the title of the template (`title`)
- its HTML content (`content`)
- the words of the document the template should match on (`matches`)
- the contexts in which it should be active (`contexts`)
- the contexts in which it should not be active (`disabled-in-contexts`)

## Using the plugin

The plugin will search for RDFa contexts in the content of the editor and the editor itself. Based on the contexts, the
plugin will show possible templates to be added at the location of the cursor. E.g. if an element in the editor has
the `typeof="besluit:BehandelingVanAgendapunt"` attribute, the plugin will show the templates related
to [`besluit:BehandelingVanAgendapunt`](http://data.vlaanderen.be/ns/besluit#BehandelingVanAgendapunt) in the dropdown
menu. This attribute can be set on an element in the content of the editor or predefined in the editor itself.
