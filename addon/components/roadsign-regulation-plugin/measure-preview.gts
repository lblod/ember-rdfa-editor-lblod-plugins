import limitText from '@lblod/ember-rdfa-editor-lblod-plugins/helpers/limit-text';
import { TOC } from '@ember/component/template-only';
import { MobilityMeasureConcept } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/roadsign-regulation-plugin/schemas/mobility-measure-concept';

type Args = {
  concept: MobilityMeasureConcept;
  limitText?: boolean;
};

const MeasurePreview: TOC<Args> = <template>
  {{#if @limitText}}
    {{limitText @concept.preview}}
  {{else}}
    {{@concept.preview}}
  {{/if}}
</template>;

export default MeasurePreview;
