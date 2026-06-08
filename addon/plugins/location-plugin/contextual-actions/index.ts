import { EditorState, NodeSelection } from '@lblod/ember-rdfa-editor';
import { v4 as uuidv4 } from 'uuid';
import { getTranslationFunction } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/translation';
import { openLocationModalCommand } from '..';
import { LocationType } from '@lblod/ember-rdfa-editor-lblod-plugins/components/location-plugin/map';
import getDocumentLocations from '../utils/get-document-locations';
import { replaceLocationCommand } from '../utils/replace-location';
import { Area, Place } from '../utils/geo-helpers';
import { Address } from '../utils/address-helpers';
import { getLocationUri } from '../_private/utils/location-helpers';

const otherElementsGroupId =
  'other-elements-e01f46a0-b323-4add-8035-d81dc2e8578d';
const recentLocationsGroupId =
  'other-elements-de3e5a9a-40de-4fb5-832e-c22199ec584f';

const SUGGESTION_AMOUNT = 15;

export function getContextualActions() {
  return function (state: EditorState, searchQuery?: string) {
    const t = getTranslationFunction(state);
    const { selection } = state;
    if (!(selection instanceof NodeSelection)) return [];
    const selectedNode = selection.node;
    if (selectedNode.type.name !== 'oslo_location') return [];

    const selectedLocation = selectedNode.attrs.value as
      | Address
      | Place
      | Area
      | undefined;

    const locationSuggestionOptions = getDocumentLocations(state)
      .filter(
        (location) =>
          !selectedLocation ||
          getLocationUri(selectedLocation) !== getLocationUri(location),
      )
      .slice(0, SUGGESTION_AMOUNT)
      .map((location) => ({
        label: location.formatted,
        id: uuidv4(),
        group: recentLocationsGroupId,
        command: replaceLocationCommand(
          { value: selection.node, pos: selection.from },
          location,
        ),
      }));

    const otherElementsOptions = [
      {
        label: t(
          'location-plugin.context-actions.insert-address',
          'Adres invoegen',
        ),
        locationType: 'address' as LocationType,
        icon: 'location',
      },
      {
        label: t(
          'location-plugin.context-actions.insert-point-on-map',
          'Punt op de kaart invoegen',
        ),
        locationType: 'place' as LocationType,
        icon: 'location-gps',
      },
      {
        label: t(
          'location-plugin.context-actions.insert-area',
          'Gebied invoegen',
        ),
        locationType: 'area' as LocationType,
        icon: 'area',
      },
    ].map((option) => {
      return {
        ...option,
        id: uuidv4(),
        group: otherElementsGroupId,
        command: openLocationModalCommand(option.locationType),
      };
    });

    return locationSuggestionOptions
      .concat(otherElementsOptions)
      .filter(
        (option) =>
          !searchQuery ||
          option.label.toLocaleLowerCase().includes(searchQuery.toLowerCase()),
      );
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
    if (!contextualGroupIsVisible(state)) return [];
    return [
      {
        id: recentLocationsGroupId,
        label: getTranslationFunction(state)(
          'location-plugin.context-actions.location-suggestions',
          'Locatiesuggesties',
        ),
      },
      {
        id: otherElementsGroupId,
        label: getTranslationFunction(state)(
          'location-plugin.context-actions.other-elements',
          'Andere elementen',
        ),
        sticky: 'bottom',
      },
    ];
  };
}
