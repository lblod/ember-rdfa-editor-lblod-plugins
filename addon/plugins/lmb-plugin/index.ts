import { SayController } from '@lblod/ember-rdfa-editor';
import { BestuursperiodeLabel } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/constants';
import { Person } from '../variable-plugin/variables';
import {
  ProsePlugin,
  PluginKey,
  EditorState,
  EditorView,
  Command,
} from '@lblod/ember-rdfa-editor';

export type LmbPluginConfig = {
  endpoint: string;
  defaultPeriod?: BestuursperiodeLabel;
  defaultAdminUnit?: string;
};

export function createPersonNode(controller: SayController, person: Person) {
  const schema = controller.schema;
  const fullName = `${person.firstName} ${person.lastName}`;
  const electeeNode = schema.node(
    'inline_rdfa',
    {
      rdfaNodeType: 'resource',
      subject: person.uri,
    },
    [schema.text(`${fullName}`)],
  );
  return electeeNode;
}

type PluginState = {
  modalOpen: boolean;
};

type LmbModalMeta =
  | { action: 'open_lmb_modal' }
  | { action: 'close_lmb_modal' }
  | undefined;

function isLmbModalMeta(meta: unknown): meta is LmbModalMeta {
  if (!meta || typeof meta !== 'object') return false;
  return 'action' in meta;
}

export const lmbModalsPluginKey = new PluginKey<PluginState>(
  'LMB_MODALS_PLUGIN',
);

export function closeLmbModal(view: EditorView) {
  const tr = view.state.tr;
  tr.setMeta(lmbModalsPluginKey, { action: 'close_lmb_modal' });
  view.dispatch(tr);
}

export function openLmbModal(view: EditorView) {
  const tr = view.state.tr;
  tr.setMeta(lmbModalsPluginKey, {
    action: 'open_lmb_modal',
  });
  view.dispatch(tr);
}

export function openLmbModalCommand(): Command {
  return function (state, dispatch) {
    if (!dispatch) {
      return false;
    }
    const tr = state.tr;
    tr.setMeta(lmbModalsPluginKey, {
      action: 'open_lmb_modal',
    });
    dispatch(tr);
    return true;
  };
}

export function lmbModalsPlugin() {
  return new ProsePlugin<PluginState>({
    key: lmbModalsPluginKey,
    state: {
      init() {
        return { modalOpen: false };
      },
      apply(tr, pluginState) {
        const meta = tr.getMeta(lmbModalsPluginKey);
        if (!isLmbModalMeta(meta)) return pluginState;

        if (meta?.action === 'open_lmb_modal') {
          return {
            modalOpen: true,
          };
        } else if (meta?.action === 'close_lmb_modal') {
          return { modalOpen: false };
        } else {
          return pluginState;
        }
      },
    },
  });
}

export function getLmbModalsPluginState(
  state: EditorState,
): PluginState | undefined {
  return lmbModalsPluginKey.getState(state);
}
