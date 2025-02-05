import Component from '@glimmer/component';
import { service } from '@ember/service';
import IntlService from 'ember-intl/services/intl';
import {
  ArticleStructurePluginOptions,
  StructureSpec,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/article-structure-plugin';
import { action } from '@ember/object';
import { on } from '@ember/modifier';
import { fn } from '@ember/helper';
import t from 'ember-intl/helpers/t';
import { not } from 'ember-truth-helpers';
import AuButton from '@appuniversum/ember-appuniversum/components/au-button';
import { AddIcon } from '@appuniversum/ember-appuniversum/components/icons/add';
import { insertStructure } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/article-structure-plugin/commands';
import { SayController } from '@lblod/ember-rdfa-editor';

type Args = {
  controller: SayController;
  options: ArticleStructurePluginOptions;
};
export default class EditorPluginsArticleStructureCardComponent extends Component<Args> {
  @service declare intl: IntlService;

  get structureTypes() {
    return this.args.options;
  }

  get controller() {
    return this.args.controller;
  }

  @action
  insertStructure(spec: StructureSpec) {
    this.args.controller.doCommand(insertStructure(spec, this.intl), {
      view: this.controller.mainEditorView,
    });
    this.args.controller.focus();
  }

  canInsertStructure = (spec: StructureSpec) =>
    this.args.controller.checkCommand(insertStructure(spec, this.intl), {
      view: this.controller.mainEditorView,
    });

  <template>
    <div>
      {{#each this.structureTypes as |structureType|}}
        <li class='au-c-list__item'>
          <AuButton
            @icon={{AddIcon}}
            @iconAlignment='left'
            @skin='link'
            @disabled={{not (this.canInsertStructure structureType)}}
            {{on 'click' (fn this.insertStructure structureType)}}
          >
            {{t structureType.translations.insert}}
          </AuButton>
        </li>
      {{/each}}
    </div>
  </template>
}
