import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { ProseController } from '@lblod/ember-rdfa-editor';
import { Structure } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/article-structure-plugin/constants';
import insertArticleStructureV2, {
  validateDatastore,
} from '@lblod/ember-rdfa-editor-lblod-plugins/commands/insert-article-structure-v2';
import IntlService from 'ember-intl/services/intl';
import { trackedFunction } from 'ember-resources/util/function';

type Args = {
  controller: ProseController;
  widgetArgs: {
    options: {
      structures: Structure[];
      structureTypes: string[];
    };
  };
};
export default class EditorPluginsArticleStructureCardComponent extends Component<Args> {
  @tracked isOutsideArticle = true;
  @tracked articleUri = undefined;
  @service declare intl: IntlService;

  structures = trackedFunction(this, async () => {
    return Promise.all(
      this.args.widgetArgs.options.structures.map(async (structure) => {
        const shaclReport = await validateDatastore(
          this.args.controller.datastore,
          structure.shaclConstraint
        );
        return {
          ...structure,
          canExecute: this.args.controller.checkCommand(
            insertArticleStructureV2(
              this.args.controller,
              structure.title,
              this.args.widgetArgs.options,
              shaclReport,
              this.intl
            )
          ),
        };
      })
    );
  });

  @action
  async insertStructure(structureName: string) {
    const structureToAdd = this.args.widgetArgs.options.structures.find(
      (structure) => structure.title === structureName
    );
    if (structureToAdd) {
      const shaclReport = await validateDatastore(
        this.args.controller.datastore,
        structureToAdd.shaclConstraint
      );
      this.args.controller.doCommand(
        insertArticleStructureV2(
          this.args.controller,
          structureName,
          this.args.widgetArgs.options,
          shaclReport,
          this.intl
        )
      );
    }
  }

  get structureUri() {
    const currentSelection = this.args.controller.state.selection;
    const limitedDatastore = this.args.controller.datastore.limitToRange(
      this.args.controller.state,
      currentSelection.from,
      currentSelection.to
    );

    const documentMatches = limitedDatastore
      .match(null, 'a', '>https://say.data.gift/ns/DocumentSubdivision')
      .asPredicateNodeMapping()
      .single();
    if (
      documentMatches &&
      documentMatches.nodes &&
      documentMatches.nodes.length
    ) {
      const structure = documentMatches.nodes.pop();
      if (structure) {
        return structure.node.attrs['resource'] as string;
      }
    }
  }

  get isOutsideStructure() {
    return !this.structureUri;
  }
}
