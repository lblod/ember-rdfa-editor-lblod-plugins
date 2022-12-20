import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { ProseController } from '@lblod/ember-rdfa-editor';
import { insertArticleStructure } from '@lblod/ember-rdfa-editor-lblod-plugins/commands/article-structure-plugin';
import IntlService from 'ember-intl/services/intl';
import { trackedFunction } from 'ember-resources/util/function';
import validateDatastore from '@lblod/ember-rdfa-editor-lblod-plugins/utils/article-structure-plugin/validate-datastore';
import { ResolvedArticleStructurePluginOptions } from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/article-structure-plugin';
import { getRdfaAttributes } from '@lblod/ember-rdfa-editor/utils/rdfa-utils';
import { unwrap } from '@lblod/ember-rdfa-editor/utils/option';

type Args = {
  controller: ProseController;
  widgetArgs: {
    options: ResolvedArticleStructurePluginOptions;
  };
};
export default class EditorPluginsArticleStructureCardComponent extends Component<Args> {
  @service declare intl: IntlService;

  structures = trackedFunction(this, async () => {
    return Promise.all(
      this.args.widgetArgs.options.structures.map(async (structure) => {
        const shaclReport = await validateDatastore(
          this.args.controller.datastore,
          structure.shaclConstraint
        );
        const canExecute = this.args.controller.checkCommand(
          insertArticleStructure(
            this.args.controller,
            structure.title,
            this.args.widgetArgs.options,
            shaclReport,
            this.intl
          )
        );
        return {
          ...structure,
          canExecute,
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
        insertArticleStructure(
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
        return getRdfaAttributes(
          unwrap(this.args.controller.state.doc.nodeAt(structure.from))
        )?.resource;
      }
    }
    return;
  }

  get isOutsideStructure() {
    return !this.structureUri;
  }
}
