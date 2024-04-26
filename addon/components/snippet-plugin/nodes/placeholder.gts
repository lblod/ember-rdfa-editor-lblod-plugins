import Component from '@glimmer/component';
import { on } from '@ember/modifier';
import t from 'ember-intl/helpers/t';
import AuAlert from '@appuniversum/ember-appuniversum/components/au-alert';
import { PlusTextIcon } from '@appuniversum/ember-appuniversum/components/icons/plus-text';
import { type EmberNodeArgs } from '@lblod/ember-rdfa-editor/utils/_private/ember-node';

interface Signature {
  Args: EmberNodeArgs;
}

// We don't have a way to type template only components without ember-source 5, so create an empty
// class to allow for type checking
// eslint-disable-next-line ember/no-empty-glimmer-component-classes
export default class SnippetPluginPlaceholder extends Component<Signature> {
  <template>
    <AuAlert
      @title={{t 'snippet-plugin.placeholder.title'}}
      @skin='warning'
      @icon={{PlusTextIcon}}
      @size='small'
      class='say-snippet-placeholder'
      {{on 'click' @selectNode}}
    >
      {{t 'snippet-plugin.placeholder.text'}}
    </AuAlert>
  </template>
}
