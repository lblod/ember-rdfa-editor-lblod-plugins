import AuButton from '@appuniversum/ember-appuniversum/components/au-button';
import { on } from '@ember/modifier';
import Component from '@glimmer/component';
import { SayController } from '@lblod/ember-rdfa-editor';
import { restartableTask } from 'ember-concurrency';
import perform from 'ember-concurrency/helpers/perform';
import {
  MandateeTableConfig,
  syncDocument,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/mandatee-table-plugin';
import { SynchronizeIcon } from '@appuniversum/ember-appuniversum/components/icons/synchronize';

interface Sig<R> {
  Args: { controller: SayController; config: MandateeTableConfig<R> };
}

export default class SychronizeMandateesComponent<R> extends Component<Sig<R>> {
  get controller() {
    return this.args.controller;
  }

  synchronize = restartableTask(async () => {
    const newState = await syncDocument(
      this.controller.mainEditorState,
      this.args.config,
    );
    this.controller.mainEditorView.updateState(newState);
  });

  <template>
    <AuButton
      {{on 'click' (perform this.synchronize)}}
      @icon={{SynchronizeIcon}}
      @iconAlignment='left'
      @loading={{this.synchronize.isRunning}}
    >
      {{! template-lint-disable no-bare-strings  }}
      Synchronise mandatees
    </AuButton>
  </template>
}
