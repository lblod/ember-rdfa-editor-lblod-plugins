import Component from '@glimmer/component';
import { service } from '@ember/service';
import { on } from '@ember/modifier';
import IntlService from 'ember-intl/services/intl';
import t from 'ember-intl/helpers/t';
import { PlusTextIcon } from '@appuniversum/ember-appuniversum/components/icons/plus-text';
import AuIcon from '@appuniversum/ember-appuniversum/components/au-icon';
import AuButton from '@appuniversum/ember-appuniversum/components/au-button';
import { type EmberNodeArgs } from '@lblod/ember-rdfa-editor/utils/_private/ember-node';
import { type SnippetPluginConfig } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/snippet-plugin';

interface Signature {
  Args: Pick<EmberNodeArgs, 'node' | 'selectNode'> & {
    insertSnippet: () => void;
  };
}

export default class SnippetPluginPlaceholder extends Component<Signature> {
  @service declare intl: IntlService;

  get node() {
    return this.args.node;
  }
  get listNames() {
    return this.args.node.attrs.snippetListNames;
  }
  get config(): SnippetPluginConfig {
    return this.node.attrs.config;
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
    {{! template-lint-disable no-invalid-interactive }}
    <div class='say-snippet-placeholder' {{on 'click' @selectNode}}>
      <div class='say-snippet-placeholder__icon'>
        <AuIcon @icon={{PlusTextIcon}} />
      </div>
      <div class='say-snippet-placeholder__content'>
        <p class='say-snippet-placeholder__title'>{{this.alertTitle}}</p>
        {{#unless this.isSingleList}}
          <ul class='say-snippet-placeholder__list'>
            {{#each this.listNames as |listName|}}
              <li>{{listName}}</li>
            {{/each}}
          </ul>
        {{/unless}}
        {{#unless this.config.hidePlaceholderInsertButton}}
          <AuButton
            @skin='link'
            class='say-snippet-placeholder__button'
            {{on 'click' @insertSnippet}}
          >
            {{t 'snippet-plugin.placeholder.button'}}
          </AuButton>
        {{/unless}}
      </div>
    </div>
  </template>
}
