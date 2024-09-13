import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { on } from '@ember/modifier';
import { AddIcon } from '@appuniversum/ember-appuniversum/components/icons/add';
import AuButton from '@appuniversum/ember-appuniversum/components/au-button';
import { SayController } from '@lblod/ember-rdfa-editor';
import { sayDataFactory } from '@lblod/ember-rdfa-editor/core/say-data-factory';
import { addProperty } from '@lblod/ember-rdfa-editor/commands';
import {
  Aanvraag,
  AanvraagPluginConfig,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/aanvraag-plugin';
import { v4 as uuidv4 } from 'uuid';
import { getCurrentBesluitRange } from '../../plugins/besluit-topic-plugin/utils/helpers';
import { ELI } from '../../utils/constants';
import AanvraagModal from '@lblod/ember-rdfa-editor-lblod-plugins/components/aanvraag-plugin/modal';

interface Args {
  controller: SayController;
  config: AanvraagPluginConfig;
}

export default class AanvraagInsert extends Component<Args> {
  @tracked showModal = false;

  get controller() {
    return this.args.controller;
  }

  @action
  openModal() {
    this.controller.focus();
    this.showModal = true;
  }

  @action
  closeModal() {
    this.showModal = false;
  }

  get isButtonDisabled() {
    return !getCurrentBesluitRange(this.controller);
  }

  @action
  onInsert(aanvraag: Aanvraag) {
    const currentBesluitRange = getCurrentBesluitRange(this.controller);

    const resource =
      (currentBesluitRange &&
        'node' in currentBesluitRange &&
        (currentBesluitRange.node.attrs.subject as string)) ||
      undefined;

    if (!resource) {
      throw new Error('No besluit found in selection');
    }

    const rdfaId = uuidv4();
    const motivationUuid = uuidv4();

    this.controller.withTransaction(
      (tr) => {
        const node = this.controller.schema.node(
          'block_rdfa',
          {
            rdfaNodeType: 'resource',
            __rdfaId: rdfaId,
            subject: aanvraag.uri,
          },
          [
            this.controller.schema.node('paragraph', {}, [
              this.controller.schema.text(
                'Aanvraag om toelatingsplichtige werken op aanduidingsobject ',
              ),
              this.controller.schema.node(
                'link',
                {
                  href: aanvraag.objectUri,
                },
                [this.controller.schema.text(aanvraag.object)],
              ),
              this.controller.schema.text(' door te voeren. Gegeven dat "'),
              this.controller.schema.node(
                'inline_rdfa',
                { rdfaNodeType: 'literal', __rdfaId: motivationUuid },
                this.controller.schema.text(aanvraag.motivation),
              ),
              this.controller.schema.text(
                '" denkt het college dat de werken gerechtvaardigd zijne en keuren we deze goed.',
              ),
            ]),
          ],
        );

        return tr.replaceSelectionWith(node);
      },
      { view: this.controller.mainEditorView },
    );

    this.controller.doCommand(
      addProperty({
        resource,
        property: {
          predicate: ELI('refers_to').prefixed,
          object: sayDataFactory.resourceNode(aanvraag.uri),
        },
      }),
    );
    this.controller.doCommand(
      addProperty({
        resource: aanvraag.uri,
        property: {
          predicate: 'https://inventaris.onroerenderfgoed.be/motivatie',
          object: sayDataFactory.literalNode(motivationUuid),
        },
      }),
    );

    this.closeModal();
  }
  <template>
    <li class='au-c-list__item'>
      <AuButton
        @icon={{AddIcon}}
        @iconAlignment='left'
        @skin='link'
        {{on 'click' this.openModal}}
        @disabled={{this.isButtonDisabled}}
      >
        {{! template-lint-disable no-bare-strings  }}
        Aanvraag Invoegen
      </AuButton>
    </li>

    <AanvraagModal
      @open={{this.showModal}}
      @closeModal={{this.closeModal}}
      @config={{@config}}
      @onInsert={{this.onInsert}}
    />
  </template>
}
