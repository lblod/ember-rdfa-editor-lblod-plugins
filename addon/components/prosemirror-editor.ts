import {
  DOMSerializer,
  EditorState,
  ProseParser,
  SayView,
  Schema,
  Transaction,
} from '@lblod/ember-rdfa-editor';
import { action } from '@ember/object';
import Component from '@glimmer/component';

type Args = {
  onInit?(view: SayView): void;
  onUpdate?(content: string): void;
  onFocus?(): void;
  schema: Schema;
  content?: string;
  inline?: boolean;
};

export default class ProseMirrorEditor extends Component<Args> {
  view?: SayView;

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
          focus: () => {
            this.args.onFocus?.();
          },
        },
      },
    );
    if (this.args.content) {
      this.view.setHtmlContent(this.args.content);
    }
    this.args.onInit?.(this.view);
  }

  @action
  onContentUpdate() {
    // console.log('content update');
    // if (this.view) {
    //   const newContent = this.args.content;
    //   const currentContent = this.view.htmlContent;
    //   console.log(newContent);
    //   console.log(currentContent);
    //   if (currentContent !== newContent) {
    //     this.view.setHtmlContent(newContent ?? '');
    //   }
    // }
  }

  dispatch = (tr: Transaction) => {
    if (this.view) {
      const newState = this.view.state.apply(tr);
      this.view.updateState(newState);
      // this.args.onUpdate?.(this.view.htmlContent);
    }
  };
}
