import { SayController } from '@lblod/ember-rdfa-editor';
import { getDecisionNodeLocation } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/decision-utils';
import IntlService from 'ember-intl/services/intl';
import {
  Notification,
  notificationPluginKey,
} from '@lblod/ember-rdfa-editor/plugins/notification';
import {
  insertMotivation,
  insertArticleContainer,
  insertDescription,
  insertTitle,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/decision-plugin/commands';
import { CircleXIcon } from '@appuniversum/ember-appuniversum/components/icons/circle-x';

export function insertTitleAtCursor(
  controller: SayController,
  intl: IntlService,
) {
  const decisionNodeLocation = getDecisionNodeLocation(controller);
  if (!decisionNodeLocation) {
    return sendNotificationError(
      controller,
      intl.t('document-validation-plugin.decision-node-not-found'),
    );
  }
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
  if (!decisionNodeLocation) {
    return sendNotificationError(
      controller,
      intl.t('document-validation-plugin.decision-node-not-found'),
    );
  }
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
  if (!decisionNodeLocation) {
    return sendNotificationError(
      controller,
      intl.t('document-validation-plugin.decision-node-not-found'),
    );
  }
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
  if (!decisionNodeLocation) {
    return sendNotificationError(
      controller,
      intl.t('document-validation-plugin.decision-node-not-found'),
    );
  }
  controller.doCommand(
    insertArticleContainer({
      intl: intl,
      decisionUri: decisionNodeLocation?.node.attrs.subject,
      articleUriGenerator: articleUriGenerator,
      decisionLocation: decisionNodeLocation,
    }),
    {
      view: controller.mainEditorView,
    },
  );
}

function sendNotificationError(controller: SayController, text: string) {
  // Show a notification via the notification plugin
  const { notificationCallback } = notificationPluginKey.getState(
    controller.mainEditorState,
  ) as {
    notificationCallback: (notification: Notification) => void;
    intl: IntlService;
  };
  notificationCallback({
    title: text,
    options: {
      type: 'error',
      icon: CircleXIcon,
    },
  });
}
