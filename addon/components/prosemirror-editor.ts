import {
  DOMSerializer,
  EditorState,
  NodeSelection,
  ProseParser,
  SayController,
  SayView,
  Schema,
  Transaction,
} from '@lblod/ember-rdfa-editor';
import { action } from '@ember/object';
import Component from '@glimmer/component';

type Args = {
  onInit?(view: SayView): void;
  onUpdate?(content: string): void;
  onFocus?(view: SayView): void;
  getPos(): number;
  schema: Schema;
  content?: string;
  inline?: boolean;
  controller: SayController;
  outerView: SayView;
};

export default class ProseMirrorEditor extends Component<Args> {
  view?: SayView;

  initialContent: string;
  constructor(owner: unknown, args: Args) {
    super(owner, args);
    this.initialContent = this.args.content || '';
  }
  get outerView(): SayView {
    return this.args.outerView;
  }
  @action
  handleInit(target: HTMLElement) {
    const state = EditorState.create({ schema: this.args.schema });
    const parser = ProseParser.fromSchema(this.args.schema);

    this.view = new SayView(
      { mount: target },
      {
        state,
        domParser: parser,
        dispatchTransaction: this.dispatch,
        handleDOMEvents: {

          mousedown: () => {
            // Kludge to prevent issues due to the fact that the whole
            // footnote is node-selected (and thus DOM-selected) when
            // the parent editor is focused.

            if (this.outerView.hasFocus()) this.view?.focus();
          },
          focus: () => {

            const pos = this.args.getPos();
            if (pos !== undefined) {
              const outerSelectionTr = this.outerView.state.tr;
              const outerSelection = new NodeSelection(
                this.outerView.state.doc.resolve(pos),
              );
              outerSelectionTr.setSelection(outerSelection);
              this.outerView.dispatch(outerSelectionTr);
            }

            if (this.view) {
              this.args.controller.setActiveView(this.view);
              this.args.onFocus?.(this.view);
            }
          },
        },
      },
    );
    if (this.args.content) {
      this.view.setHtmlContent(this.initialContent);
    }
    this.args.onInit?.(this.view);
  }

  @action
  onContentUpdate() {
    console.log('content update');
    if (this.view) {
      const newContent = this.args.content;
      const currentContent = this.view.htmlContent;
      console.log(newContent);
      console.log(currentContent);
      if (currentContent !== newContent) {
        this.view.setHtmlContent(newContent ?? '');
      }
    }
  }

  dispatch = (tr: Transaction) => {
    console.log("transaction", tr);
    if (this.view) {
      const newState = this.view.state.apply(tr);
      console.log("newState", newState)
      this.view.updateState(newState);
      console.log("htmlcontent", this.view.htmlContent)
      this.args.onUpdate?.(this.view.htmlContent);
    }
  };
}
