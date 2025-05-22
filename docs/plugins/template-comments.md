# template-comments-plugin

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

## Styling

Template comments have a specific style that can be imported in the stylesheet with

```css
@import 'template-comments-plugin';
```

Nodes from this plugin can also be styled by using the following classes:

| Node | Css class |
|---|---|
| templateComment | say-template-comment |
