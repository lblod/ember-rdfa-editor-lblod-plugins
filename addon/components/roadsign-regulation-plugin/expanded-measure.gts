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
import { ZONALITY_OPTIONS } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/roadsign-regulation-plugin/constants';

type Signature = {
  Args: {
    concept: MobilityMeasureConcept;
    selectRow: (uri: string) => void;
    insert: (
      concept: MobilityMeasureConcept,
      zonalityValue?: string,
      temporalValue?: string,
    ) => void;
    endpoint: string;
  };
};

export default class ExpandedMeasure extends Component<Signature> {
  @tracked zonalityValue?: string;
  @tracked temporalValue?: string;

  get isPotentiallyZonal() {
    return this.args.concept.zonality === ZONALITY_OPTIONS.POTENTIALLY_ZONAL;
  }

  get insertButtonDisabled() {
    return this.isPotentiallyZonal && !this.zonalityValue;
  }

  @action
  changeZonality(zonality: string) {
    this.zonalityValue = zonality;
  }

  @action
  changeTemporality(temporality: string) {
    this.temporalValue = temporality;
  }

  @action
  insert() {
    this.args.insert(this.args.concept, this.zonalityValue, this.temporalValue);
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
        {{#if @concept.temporal}}
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
