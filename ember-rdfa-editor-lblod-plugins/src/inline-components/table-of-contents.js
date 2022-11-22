import { InlineComponentSpec } from '@lblod/ember-rdfa-editor/model/inline-components/model-inline-component';
import { isElement } from '@lblod/ember-rdfa-editor/utils/dom-helpers';
import { TABLE_OF_CONTENTS_DEFAULT_CONFIG } from '../constants';
export default class TableOfContentsSpec extends InlineComponentSpec {
  matcher = {
    tag: this.tag,
    attributeBuilder: (node) => {
      if (isElement(node)) {
        if (
          (node.classList.contains('inline-component') &&
            node.classList.contains(this.name)) ||
          node.dataset.inlineComponent === this.name
        ) {
          return {};
        }
      }
      return null;
    },
  };

  properties = {
    config: {
      serializable: true,
      defaultValue: TABLE_OF_CONTENTS_DEFAULT_CONFIG,
    },
  };

  _renderStatic() {
    // TODO: should be implemented when static version of inline components work correctly
    return '';
  }
  constructor(controller) {
    super(
      'table-of-contents-plugin/inline-components/table-of-contents',
      'div',
      controller
    );
  }
}
