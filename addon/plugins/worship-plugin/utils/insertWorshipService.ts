import { SayController } from '@lblod/ember-rdfa-editor';
import { WorshipService } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/worship-plugin/utils/fetchWorshipServices';

export function insertWorshipService(
  controller: SayController,
  worshipService: WorshipService,
) {
  const node = controller.schema.text(worshipService.label);

  controller.withTransaction(
    (tr) => {
      return tr.replaceSelectionWith(node);
    },
    { view: controller.mainEditorView },
  );
}
