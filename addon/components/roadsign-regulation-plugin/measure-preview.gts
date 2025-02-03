import limitText from '@lblod/ember-rdfa-editor-lblod-plugins/helpers/limit-text';
import { TOC } from '@ember/component/template-only';
import Measure from 'dummy/models/measure';

type Args = {
  measure: Measure;
  limitText?: boolean;
};

const MeasurePreview: TOC<Args> = <template>
  {{#if @limitText}}
    {{limitText @measure.preview}}
  {{else}}
    {{@measure.preview}}
  {{/if}}
</template>;

export default MeasurePreview;
