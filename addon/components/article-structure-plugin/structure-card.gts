import { TemplateOnlyComponent } from '@ember/component/template-only';
import { SayController } from '@lblod/ember-rdfa-editor';
import StructureControlCardComponent from '../structure-plugin/control-card';

interface Sig {
  Args: { controller: SayController };
}

/** @deprecated This has been deprecated in favour of structure-plugin/control-card */
const EditorPluginsStructureCardComponent: TemplateOnlyComponent<Sig> =
  <template>
    <StructureControlCardComponent @controller={{@controller}} />
  </template>;

export default EditorPluginsStructureCardComponent;
