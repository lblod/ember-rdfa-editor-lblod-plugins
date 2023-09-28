import Component from '@glimmer/component';
import { htmlSafe } from '@ember/template';
import { Article } from '../../../plugins/citation-plugin/utils/article';

interface Args {
  article: Article;
}

export default class ArticlePreviewComponent extends Component<Args> {
  get content() {
    return htmlSafe(this.args.article.content ?? '');
  }
}
