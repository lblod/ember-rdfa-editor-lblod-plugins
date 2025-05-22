# decision-plugin

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
