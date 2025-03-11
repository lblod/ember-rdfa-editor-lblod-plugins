import { IMPORTED_RESOURCES_ATTR } from '@lblod/ember-rdfa-editor/plugins/imported-resources';
import { jsonParse } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/strings';
import { type Snippet } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/snippet-plugin';
import { optionMap } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/option';

export function collateImportedResources(snippets: Snippet[]): string[] {
  const domParser = new DOMParser();
  return [
    ...new Set(
      snippets.flatMap(({ content }) => {
        const htmlNode = optionMap(
          (some) => domParser.parseFromString(some, 'text/html'),
          content,
        );
        const imports = jsonParse(
          htmlNode
            ?.querySelector('[data-say-document]')
            ?.getAttribute(IMPORTED_RESOURCES_ATTR),
        );

        return Array.isArray(imports) ? (imports as string[]) : [];
      }),
    ).values(),
  ];
}
