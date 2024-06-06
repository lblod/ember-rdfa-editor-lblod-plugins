import Component from '@glimmer/component';
import { on } from '@ember/modifier';
import t from 'ember-intl/helpers/t';
import AuAlert from '@appuniversum/ember-appuniversum/components/au-alert';
import { PlusTextIcon } from '@appuniversum/ember-appuniversum/components/icons/plus-text';
import { type EmberNodeArgs } from '@lblod/ember-rdfa-editor/utils/_private/ember-node';
import { service } from '@ember/service';
import IntlService from 'ember-intl/services/intl';

interface Signature {
  Args: EmberNodeArgs;
}

// We don't have a way to type template only components without ember-source 5, so create an empty
// class to allow for type checking
// eslint-disable-next-line ember/no-empty-glimmer-component-classes
export default class SnippetPluginPlaceholder extends Component<Signature> {
  @service declare intl: IntlService;
  get listNames() {
    return this.args.node.attrs.listNames;
  }
  get isSingleList() {
    return this.listNames.length === 1;
  }
  get alertTitle() {
    if (this.isSingleList) {
      return this.intl.t('snippet-plugin.placeholder.title-single', {
        listName: this.listNames[0],
      });
    } else {
      return this.intl.t('snippet-plugin.placeholder.title-multiple');
    }
  }
  <template>
    <AuAlert
      @title={{this.alertTitle}}
      @skin='warning'
      @icon={{PlusTextIcon}}
      @size='small'
      class='say-snippet-placeholder'
      {{on 'click' @selectNode}}
    >
      {{#unless this.isSingleList}}
        {{t 'snippet-plugin.placeholder.active-lists'}}
        <ul>
          {{#each this.listNames as |listName|}}
            <li>{{listName}}</li>
          {{/each}}
        </ul>
      {{/unless}}
      {{t 'snippet-plugin.placeholder.text'}}
    </AuAlert>
  </template>
}
