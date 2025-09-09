import { SayController } from '@lblod/ember-rdfa-editor';
import { getCurrentBesluitRange } from '../besluit-topic-plugin/utils/helpers';
import IntlService from 'ember-intl/services/intl';
import {
  insertMotivation,
  insertArticleContainer,
  insertDescription,
  insertTitle,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/decision-plugin/commands';

export function insertTitleAtCursor(
  controller: SayController,
  intl: IntlService,
) {
  const decisionNodeLocation = getDecisionNodeLocation(controller);
  if (!decisionNodeLocation) return;
  controller.doCommand(
    insertTitle({
      placeholderText: intl.t('besluit-plugin.placeholder.decision-title'),
      decisionLocation: decisionNodeLocation,
    }),
    { view: controller.mainEditorView },
  );
  controller.focus();
}

export function insertDescriptionAtCursor(
  controller: SayController,
  intl: IntlService,
) {
  const decisionNodeLocation = getDecisionNodeLocation(controller);
  if (!decisionNodeLocation) return;
  controller.doCommand(
    insertDescription({
      placeholderText: intl.t(
        'besluit-plugin.placeholder.decision-description',
      ),
      decisionLocation: decisionNodeLocation,
    }),
    {
      view: controller.mainEditorView,
    },
  );
  controller.focus();
}

export function insertMotivationAtCursor(
  controller: SayController,
  intl: IntlService,
) {
  const decisionNodeLocation = getDecisionNodeLocation(controller);
  if (!decisionNodeLocation) return;
  controller.doCommand(
    insertMotivation({
      intl: intl,
      decisionLocation: decisionNodeLocation,
    }),
    {
      view: controller.mainEditorView,
    },
  );
  controller.focus();
}

export function insertArticleContainerAtCursor(
  controller: SayController,
  intl: IntlService,
  articleUriGenerator?: () => string,
) {
  const decisionNodeLocation = getDecisionNodeLocation(controller);
  if (!decisionNodeLocation) return;
  controller.doCommand(
    insertArticleContainer({
      intl: intl,
      decisionUri: decisionNodeLocation?.node.attrs.subject,
      articleUriGenerator: articleUriGenerator,
    }),
    {
      view: controller.mainEditorView,
    },
  );
}

function getDecisionNodeLocation(controller: SayController) {
  const besluitRange = getCurrentBesluitRange(controller);
  if (!besluitRange) return;
  const decisionNodeLocation = {
    pos: besluitRange.from,
    node: besluitRange.node,
  };
  return decisionNodeLocation;
}
