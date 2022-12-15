import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { ProseController } from '@lblod/ember-rdfa-editor/core/prosemirror';
import { VariableType } from '../../utils/variable-plugins/default-variable-types';
import { action } from '@ember/object';
import { recalculateArticleNumbers } from '@lblod/ember-rdfa-editor-lblod-plugins/commands/recalculate-article-numbers-command';
import { moveArticleCommand } from '@lblod/ember-rdfa-editor-lblod-plugins/commands/move-article-command';

type Args = {
  controller: ProseController;
  widgetArgs: {
    options: {
      publisher: string;
      variableTypes: (VariableType | string)[];
      defaultEndpoint: string;
    };
  };
};

export default class BesluitContextCardComponent extends Component<Args> {
  @tracked articleElement: any;
  @tracked besluitUri: string;

  constructor(parent: unknown, args: Args) {
    super(parent, args);
  }

  get controller() {
    return this.args.controller;
  }

  @action
  deleteArticle() {
    const { from, to } = this.controller.state.selection;

    const limitedDatastore = this.controller.datastore.limitToRange(
      this.controller.state,
      from,
      to
    );
    const articleNode = [
      ...limitedDatastore
        .match(null, 'a', '>http://data.vlaanderen.be/ns/besluit#Artikel')
        .asSubjectNodeMapping()
        .nodes(),
    ][0];
    if (!articleNode?.pos) {
      return;
    }
    this.controller.withTransaction((tr) => {
      return tr.delete(
        articleNode?.pos.pos,
        articleNode.pos.pos + articleNode.node.nodeSize
      );
    });
    recalculateArticleNumbers(this.controller, this.besluitUri);

    // console.log('sbx6 sel', sel);
    // tr.deleteSelection();

    // const { from, to } = this.controller.state.selection;
    // this.controller.state.doc.nodesBetween(from, to, (mynode) => {
    //   // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
    //   if (mynode.attrs['typeof']?.includes('besluit:Artikel')) {
    //     console.log('sbx6 DELETE controller mynode', mynode);
    //   }
    // });
    //
    // this.controller.doCommand(insertHtml('', from, to));
    // const range = this.args.controller.rangeFactory.fromAroundNode(
    //   this.articleElement
    // );
    // this.args.controller.selection.selectRange(range);
    // this.args.controller.executeCommand('delete-selection');
    // this.args.controller.executeCommand(
    //   'recalculate-article-numbers',
    //   this.args.controller,
    //   this.besluitUri
    // );
  }
  //
  @action
  moveUpArticle() {
    moveArticleCommand(
      this.controller,
      this.besluitUri,
      this.articleElement,
      true
    );
    // this.args.controller.executeCommand(
    //   'move-article',
    //   this.args.controller,
    //   this.besluitUri,
    //   this.articleElement,
    //   true
    // );
  }
  //
  // @action
  // moveDownArticle() {
  //   this.args.controller.executeCommand(
  //     'move-article',
  //     this.args.controller,
  //     this.besluitUri,
  //     this.articleElement,
  //     false
  //   );
  // }

  @action
  selectionChangedHandler() {
    this.articleElement = undefined;
    const { from, to } = this.controller.state.selection;

    const limitedDatastore = this.controller.datastore.limitToRange(
      this.controller.state,
      from,
      to
    );
    const articleNode = [
      ...limitedDatastore
        .match(null, 'a', '>http://data.vlaanderen.be/ns/besluit#Artikel')
        .asSubjectNodeMapping()
        .nodes(),
    ][0];

    // console.log('sbx6 here->', besluit);
    // const besluit = limitedDatastore
    //   .match(null, 'a', '>http://data.vlaanderen.be/ns/besluit#Besluit')
    //   .asQuads()
    //   .next().value;

    // if (besluit) {
    //   const articleSubjectNodes = limitedDatastore
    //     .match(null, 'a', '>http://data.vlaanderen.be/ns/besluit#Artikel')
    //     .asSubjectNodes()
    //     .next().value;
    //   if (articleSubjectNodes) {
    //     this.articleElement = [...articleSubjectNodes.nodes][0];
    //   }
    //   this.besluitUri = besluit.subject.value;
    // }
    this.articleElement = articleNode;
    console.log('article node', articleNode);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
    this.besluitUri = articleNode?.node.attrs['resource'] || '';
    console.log('this.beslsslls', this.besluitUri);
    // const range: unknown = this.controller.state.selection;
    // if (!range) {
    //   return;
    // }
    //
    // const { from, to } = this.controller.state.selection;
    // this.controller.state.doc.nodesBetween(from, to, (mynode) => {
    //   // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
    //   if (mynode.attrs['typeof']?.includes('besluit:Artikel')) {
    //     console.log('sbx6 controller mynode', mynode);
    //     this.articleElement = mynode;
    //   }
    // });

    // this.controller.withTransaction((tr) => {
    //   console.log('sbx6 tr', tr);
    //   // const resolvedPos = tr.doc.resolve(pos);
    //   // const selection = Selection.near(resolvedPos, 1);
    //   // if (selection) {
    //   //   tr.setSelection(selection);
    //   //   tr.scrollIntoView();
    //   // }
    //   return tr;
    // });

    // const besluit = this.controller.state.doc.descendants((node, pos) => {
    //   // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    //   const typeOfAttribute: string = node.attrs['typeof'];
    //   console.log('sbx6 typeOfAttribute', typeOfAttribute);
    //   console.log('sbx6 firstNode', node);
    //   console.log('sbx6 firstNode content --->', node.content);
    //   if (
    //     typeOfAttribute?.includes('besluit:Besluit') ||
    //     typeOfAttribute?.includes(
    //       'http://data.vlaanderen.be/ns/besluit#Besluit'
    //     )
    //   ) {
    //     console.log('sbx6 inside here');
    //     node.content.forEach((_node) => {
    //       // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    //       const propertyOfAttribute: string = _node.attrs['property'];
    //       if (propertyOfAttribute?.includes('prov:value')) {
    //         _node.content.forEach((articleSubjectNodes) => {
    //           // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    //           const aaa = articleSubjectNodes.attrs['typeof'];
    //           if (aaa?.includes('besluit:Artikel')) {
    //             console.log('sbx6 aaaaaa ->', aaa);
    //             console.log(
    //               'sbx6 nodes articleSubjectNodes',
    //               articleSubjectNodes
    //             );
    //             this.articleElement =
    //               articleSubjectNodes && this.checkIfCursorIsAtArticle();
    //             console.log('sbx6 ---->', this.articleElement);
    //           }
    //           // console.log('sbx6 --> node inside', _node);
    //         });
    //       }
    //     });
    //     return false;
    //   }
    // });

    // console.log('sbx6 here->', besluit);
    // const besluit = limitedDatastore
    //   .match(null, 'a', '>http://data.vlaanderen.be/ns/besluit#Besluit')
    //   .asQuads()
    //   .next().value;

    // if (besluit) {
    //   const articleSubjectNodes = limitedDatastore
    //     .match(null, 'a', '>http://data.vlaanderen.be/ns/besluit#Artikel')
    //     .asSubjectNodes()
    //     .next().value;
    //   if (articleSubjectNodes) {
    //     this.articleElement = [...articleSubjectNodes.nodes][0];
    //   }
    //   this.besluitUri = besluit.subject.value;
    // }
  }
}
