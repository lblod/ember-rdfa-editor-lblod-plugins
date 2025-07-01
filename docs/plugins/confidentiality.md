## confidentiality-plugin

A very small plugin which allows for marking parts of text as redacted and including the styles to make this visible.

To enable the plugin you need to add the `MarkSpec` to the `Schema`:

``` js
import { redacted } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/confidentiality-plugin/marks/redacted';
// ...
new Schema({
  // ...
  marks: {
    // ...
    redacted,
  },
});
```

You can then add the button to the toolbar, passing it the `SayController`:

``` hbs
<ConfidentialityPlugin::Toolbar @controller={{this.controller}} />
```

To see the redactions you'll need to add styles that target the `[property='ext:redacted']` selector, which can be done easily in Sass by importing the included stylesheet:

``` scss
@import 'confidentiality-plugin';
```

