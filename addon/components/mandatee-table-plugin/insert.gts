import AuButton from '@appuniversum/ember-appuniversum/components/au-button';
import { AddIcon } from '@appuniversum/ember-appuniversum/components/icons/add';
import { on } from '@ember/modifier';
import Component from '@glimmer/component';
import { SayController } from '@lblod/ember-rdfa-editor';
import { not } from 'ember-truth-helpers';
import { getCurrentBesluitRange } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/besluit-topic-plugin/utils/helpers';
import { action } from '@ember/object';
import { unwrap } from '@lblod/ember-rdfa-editor/utils/_private/option';
import t from 'ember-intl/helpers/t';

interface Sig {
  Args: { controller: SayController; defaultTag: string };
}

export default class InsertMandateeTableComponent extends Component<Sig> {
  get controller() {
    return this.args.controller;
  }
  get decisionRange() {
    return getCurrentBesluitRange(this.controller);
  }

  @action
  insert() {
    const mandatee_table = unwrap(
      this.controller.schema.nodes.mandatee_table.createAndFill({
        tag: this.args.defaultTag,
      }),
    );
    this.args.controller.withTransaction((tr) => {
      return tr.replaceSelectionWith(mandatee_table);
    });
  }

  get canInsert() {
    return Boolean(this.decisionRange);
  }

  <template>
    <li class='au-c-list__item'>
      <AuButton
        {{on 'click' this.insert}}
        @icon={{AddIcon}}
        @iconAlignment='left'
        @skin='link'
        @disabled={{not this.canInsert}}
      >
        {{t 'mandatee-table-plugin.insert.title'}}
      </AuButton>
    </li>
  </template>
}
