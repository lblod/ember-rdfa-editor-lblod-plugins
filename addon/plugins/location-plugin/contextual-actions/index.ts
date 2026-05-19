import { EditorState, NodeSelection } from '@lblod/ember-rdfa-editor';
import { v4 as uuidv4 } from 'uuid';
import { getTranslationFunction } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/translation';
import IntlService from 'ember-intl/services/intl';
import { openLocationModalCommand } from '..';
import { LocationType } from '@lblod/ember-rdfa-editor-lblod-plugins/components/location-plugin/map';

const otherElementsGroupId =
  'other-elements-e01f46a0-b323-4add-8035-d81dc2e8578d';

export function getContextualActions() {
  return async function (state: EditorState) {
    const t = getTranslationFunction(state);

    const options: {
      label: string;
      locationType: LocationType;
      icon: string;
    }[] = [
      {
        label: t(
          'location-plugin.context-actions.insert-address',
          'Adres invoegen',
        ),
        locationType: 'address',
        icon: 'location',
      },
      {
        label: t(
          'location-plugin.context-actions.insert-point-on-map',
          'Punt op de kaart invoegen',
        ),
        locationType: 'place',
        icon: 'location-gps',
      },
      {
        label: t(
          'location-plugin.context-actions.insert-area',
          'Gebied invoegen',
        ),
        locationType: 'area',
        icon: 'area',
      },
    ];

    return options.map((option) => {
      return {
        ...option,
        id: uuidv4(),
        group: otherElementsGroupId,
        command: openLocationModalCommand(option.locationType),
      };
    });
  };
}

function contextualGroupIsVisible(state: EditorState) {
  const { selection } = state;
  return (
    selection instanceof NodeSelection &&
    selection.node.type === selection.node.type.schema.nodes['oslo_location']
  );
}

export function getContextualActionGroups() {
  return function (state: EditorState) {
    return contextualGroupIsVisible(state)
      ? [
          {
            id: otherElementsGroupId,
            label: getTranslationFunction(state)(
              'location-plugin.context-actions.other-elements',
              'Andere elementen',
            ),
          },
        ]
      : [];
  };
}
