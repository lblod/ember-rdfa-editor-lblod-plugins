import {
  ProsePlugin,
  PluginKey,
  EditorState,
  EditorView,
  Transaction,
  Command,
} from '@lblod/ember-rdfa-editor';
import { LocationType } from '@lblod/ember-rdfa-editor-lblod-plugins/components/location-plugin/map';

type PluginState = {
  modalOpen: boolean;
  locationType: LocationType | null;
};

type LocationModalMeta =
  | { action: 'open_location_modal'; locationType?: LocationType }
  | { action: 'close_location_modal' }
  | undefined;

function isLocationMeta(meta: unknown): meta is LocationModalMeta {
  if (!meta || typeof meta !== 'object') return false;
  return 'action' in meta;
}

export const locationModalsPluginKey = new PluginKey<PluginState>(
  'LOCATION_MODALS_PLUGIN',
);

export function closeLocationModal(view: EditorView) {
  const tr = view.state.tr;
  tr.setMeta(locationModalsPluginKey, { action: 'close_location_modal' });
  view.dispatch(tr);
}

export function openLocationModal(
  view: EditorView,
  locationType?: LocationType,
) {
  const tr = view.state.tr;
  tr.setMeta(locationModalsPluginKey, {
    action: 'open_location_modal',
    locationType: locationType ?? null,
  });
  view.dispatch(tr);
}

export function openLocationModalCommand(locationType: LocationType): Command {
  return function (state, dispatch) {
    if (!dispatch) {
      return false;
    }
    const tr = state.tr;
    tr.setMeta(locationModalsPluginKey, {
      action: 'open_location_modal',
      locationType,
    });
    dispatch(tr);
    return true;
  };
}

export function locationModalsPlugin() {
  return new ProsePlugin<PluginState>({
    key: locationModalsPluginKey,
    state: {
      init() {
        return { modalOpen: false, locationType: null };
      },
      apply(tr, pluginState) {
        const meta = tr.getMeta(locationModalsPluginKey);
        if (!isLocationMeta(meta)) return pluginState;

        if (meta?.action === 'open_location_modal') {
          return {
            modalOpen: true,
            locationType: meta.locationType ?? null,
          };
        } else if (meta?.action === 'close_location_modal') {
          return { modalOpen: false, locationType: null };
        } else {
          return pluginState;
        }
      },
    },
  });
}

export function getLocationModalsPluginState(
  state: EditorState,
): PluginState | undefined {
  return locationModalsPluginKey.getState(state);
}
