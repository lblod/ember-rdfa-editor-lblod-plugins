import { fetchLegalDocumentsCache } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/citation-plugin/utils/legal-documents';
import { fetchArticlesCache } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/citation-plugin/utils/article';

export function cleanCaches() {
  fetchLegalDocumentsCache.clear();
  fetchArticlesCache.clear();
}
