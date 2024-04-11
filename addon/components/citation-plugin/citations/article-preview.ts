import Component from '@glimmer/component';
import { htmlSafe } from '@ember/template';
import { Article } from '../../../plugins/citation-plugin/utils/article';
import { PlusTextIcon } from '@appuniversum/ember-appuniversum/components/icons/plus-text';

interface Args {
  article: Article;
}

export default class ArticlePreviewComponent extends Component<Args> {
  PlusTextIcon = PlusTextIcon;
  get content() {
    return htmlSafe(this.args.article.content ?? '');
  }
}
