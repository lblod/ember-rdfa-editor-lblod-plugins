import { ReplaceStep, Slice } from '@lblod/ember-rdfa-editor';
import { Plugin } from 'prosemirror-state';
import { v4 as uuidv4 } from 'uuid';

const recreateUuidsOnPaste = new Plugin({
  props: {
    handlePaste: (view, event, slice) => {
      slice.content.descendants((node) => {
        const type = node.type;
        const spec = type.spec;
        console.log(spec);
        console.log('1');
        console.log(spec.recreateUri);
        console.log(spec.uriAttributes);
        if (spec.recreateUri) {
          if (spec.uriAttributes) {
            for (const uriAttribute of spec.uriAttributes) {
              const oldUri = node.attrs[uriAttribute as string] as string;
              const oldUriParts = oldUri.split('/');
              oldUriParts[oldUriParts.length - 1] = uuidv4();
              const newUri = oldUriParts.join('/');
              node.attrs[uriAttribute as string] = newUri;
              console.log(oldUri);
              console.log(newUri);
            }
          }
        }
        return true;
      });
      console.log(slice);
    },
  },
});

export default recreateUuidsOnPaste;
