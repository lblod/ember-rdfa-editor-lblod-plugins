import { findParentNodeOfType } from '@curvenote/prosemirror-utils';
import { Command, NodeSelection } from '@lblod/ember-rdfa-editor';
import IntlService from 'ember-intl/services/intl';
import { v4 as uuid } from 'uuid';

export default function insertTitle(intl: IntlService): Command {
  return function (state, dispatch) {
    const { selection, schema } = state;
    const besluit = findParentNodeOfType(schema.nodes.besluit)(selection);
    if (!besluit) {
      return false;
    }
    if (!besluit.node.canReplaceWith(0, 0, schema.nodes.besluit_title)) {
      return false;
    }

    if (dispatch) {
      const tr = state.tr;
      tr.insert(
        besluit.pos + 1,
        schema.node(
          'besluit_title',
          { __rdfaId: uuid() },
          schema.node(
            'paragraph',
            null,
            schema.node('placeholder', {
              placeholderText: intl.t(
                'besluit-plugin.placeholder.decision-title'
              ),
            })
          )
        )
      );
      // Select placeholder in title
      const selection = new NodeSelection(tr.doc.resolve(besluit.pos + 3));
      tr.setSelection(selection);
      dispatch(tr);
    }

    return true;
  };
}
