import AuHeading from '@appuniversum/ember-appuniversum/components/au-heading';
import AuPill from '@appuniversum/ember-appuniversum/components/au-pill';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import t from 'ember-intl/helpers/t';
import MeasurePreview from './measure-preview';
import AuRadioGroup from '@appuniversum/ember-appuniversum/components/au-radio-group';
import AuButtonGroup from '@appuniversum/ember-appuniversum/components/au-button-group';
import AuButton from '@appuniversum/ember-appuniversum/components/au-button';
import { MobilityMeasureConcept } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/roadsign-regulation-plugin/schemas/mobility-measure-concept';
import { action } from '@ember/object';
import { on } from '@ember/modifier';
import {
  ZONALITY_OPTIONS,
  ZonalOrNot,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/roadsign-regulation-plugin/constants';
import { Task } from 'ember-concurrency';
import { isSome } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/option';

export type InsertMobilityMeasureTask = Task<
  void,
  [MobilityMeasureConcept, ZonalOrNot, boolean]
>;
type Signature = {
  Args: {
    concept: MobilityMeasureConcept;
    selectRow: (uri: string) => void;
    insert: InsertMobilityMeasureTask;
    endpoint: string;
  };
};

export default class ExpandedMeasure extends Component<Signature> {
  @tracked zonalityValue?: ZonalOrNot;
  @tracked temporalValue?: boolean;

  get isPotentiallyZonal() {
    return this.args.concept.zonality === ZONALITY_OPTIONS.POTENTIALLY_ZONAL;
  }

  get insertButtonDisabled() {
    return (
      (this.isPotentiallyZonal && !this.zonalityValue) ||
      (this.args.concept.variableSignage && !isSome(this.temporalValue))
    );
  }

  @action
  changeZonality(zonality: ZonalOrNot) {
    this.zonalityValue = zonality;
  }

  @action
  changeTemporality(temporality: 'true' | 'false') {
    this.temporalValue = temporality === 'true';
  }

  @action
  insert() {
    this.args.insert.perform(
      this.args.concept,
      // POTENTIALLY_ZONAL option is filtered out by requiring a zonalityValue to submit
      (this.zonalityValue ?? this.args.concept.zonality) as ZonalOrNot,
      this.temporalValue ?? false,
    );
  }

  @action
  unselectRow() {
    this.args.selectRow(this.args.concept.uri);
  }

  <template>
    <tr class='au-c-data-table__detail'>
      <td colspan='5' class='au-o-flow au-o-flow--small'>
        <AuHeading @level='6' @skin='6'>
          {{t
            'editor-plugins.roadsign-regulation.expanded-measure.insert-measure'
          }}
        </AuHeading>
        <p>
          <AuPill>
            <MeasurePreview @concept={{@concept}} />
          </AuPill>
        </p>
        {{#if this.isPotentiallyZonal}}
          <AuHeading @level='6' @skin='6'>
            {{t
              'editor-plugins.roadsign-regulation.expanded-measure.select-zonality.label'
            }}
          </AuHeading>
          <div class='au-c-form'>
            <AuRadioGroup
              @name='zonal'
              @selected={{this.zonalityValue}}
              @onChange={{this.changeZonality}}
              as |Group|
            >
              <Group.Radio @value={{ZONALITY_OPTIONS.ZONAL}}>
                {{t
                  'editor-plugins.roadsign-regulation.expanded-measure.select-zonality.zonal'
                }}
              </Group.Radio>
              <Group.Radio @value={{ZONALITY_OPTIONS.NON_ZONAL}}>
                {{t
                  'editor-plugins.roadsign-regulation.expanded-measure.select-zonality.non-zonal'
                }}
              </Group.Radio>
            </AuRadioGroup>
          </div>
        {{/if}}
        {{#if @concept.variableSignage}}
          <AuHeading @level='6' @skin='6'>
            {{t
              'editor-plugins.roadsign-regulation.expanded-measure.varying-signalisation.label'
            }}
          </AuHeading>
          <div class='au-c-form'>
            <AuRadioGroup
              @name='temporal'
              @selected={{this.temporalValue}}
              @onChange={{this.changeTemporality}}
              as |Group|
            >
              <Group.Radio @value='true'>
                {{t
                  'editor-plugins.roadsign-regulation.expanded-measure.varying-signalisation.varying'
                }}
              </Group.Radio>
              <Group.Radio @value='false'>
                {{t
                  'editor-plugins.roadsign-regulation.expanded-measure.varying-signalisation.non-varying'
                }}
              </Group.Radio>
            </AuRadioGroup>
          </div>
        {{/if}}
        <AuButtonGroup>
          <AuButton
            {{on 'click' this.insert}}
            @loading={{@insert.isRunning}}
            @loadingMessage={{t 'common.loading'}}
            @disabled={{this.insertButtonDisabled}}
          >
            {{t 'editor-plugins.utils.insert'}}
          </AuButton>
          <AuButton @skin='secondary' {{on 'click' this.unselectRow}}>
            {{t 'editor-plugins.utils.cancel'}}
          </AuButton>
        </AuButtonGroup>
      </td>
    </tr>
  </template>
}
