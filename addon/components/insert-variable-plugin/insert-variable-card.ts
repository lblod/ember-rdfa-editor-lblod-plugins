import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import { v4 as uuidv4 } from 'uuid';
import {
  defaultVariableTypes,
  VariableType,
} from '../../utils/variable-plugins/default-variable-types';
import { ProseController } from '@lblod/ember-rdfa-editor/core/prosemirror';
import { CodeList } from '@lblod/ember-rdfa-editor-lblod-plugins/utils/variable-plugins/fetch-data';
import { DOMParser as ProseParser } from 'prosemirror-model';

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

export default class EditorPluginsInsertCodelistCardComponent extends Component<Args> {
  @tracked variablesArray: VariableType[];
  @tracked selectedVariable?: VariableType;
  @tracked showCard = true;
  @tracked hasSubtype = false;
  @tracked selectedSubtype?: CodeList;
  @tracked subtypes?: CodeList[];
  publisher: string;
  endpoint: string;

  constructor(parent: unknown, args: Args) {
    super(parent, args);
    const { publisher, variableTypes, defaultEndpoint } =
      this.args.widgetArgs.options || {};
    this.publisher = publisher;
    this.endpoint = defaultEndpoint;
    const variableTypesSelectedByUser = variableTypes ?? [
      'text',
      'number',
      'date',
      'location',
      'codelist',
    ];

    const variablesArray: VariableType[] = [];
    for (const type of variableTypesSelectedByUser) {
      if (typeof type === 'string') {
        const variableType = defaultVariableTypes[type];
        if (variableType) {
          variablesArray.push(variableType);
        } else {
          console.warn(
            `Template Variable Plugin: variable type ${type} not found in the default variable types`
          );
        }
      } else {
        variablesArray.push(type);
      }
    }
    this.variablesArray = variablesArray;
  }

  @action
  insert() {
    if (!this.selectedVariable) {
      return;
    }
    const uri = `http://data.lblod.info/mappings/${uuidv4()}`;
    let variableContent;
    if (typeof this.selectedVariable.template === 'function') {
      variableContent = this.selectedVariable.template(
        this.endpoint,
        this.selectedSubtype
      );
    } else {
      variableContent = this.selectedVariable.template;
    }
    const htmlToInsert = `<span resource="${uri}" typeof="ext:Mapping">${variableContent}</span>`;
    const domParser = new DOMParser();
    const fragmentToInsert = ProseParser.fromSchema(
      this.args.controller.schema
    ).parseSlice(domParser.parseFromString(htmlToInsert, 'text/html')).content;
    const { from, to } = this.args.controller.state.selection;
    this.args.controller.withTransaction((tr) => {
      return tr.replaceWith(from, to, fragmentToInsert);
    });
  }

  @action
  updateSelectedVariable(variable: VariableType) {
    this.selectedVariable = variable;
    if (variable.fetchSubtypes) {
      void this.fetchSubtypes.perform(variable.fetchSubtypes);
      this.hasSubtype = true;
    } else {
      this.hasSubtype = false;
    }
  }

  fetchSubtypes = task(
    async (
      fetchFunction: (
        endpoint: string,
        publisher: string
      ) => Promise<CodeList[]>
    ) => {
      const subtypes = await fetchFunction(this.endpoint, this.publisher);
      this.subtypes = subtypes;
    }
  );

  @action
  updateSubtype(subtype: CodeList) {
    this.selectedSubtype = subtype;
  }

  @action
  selectionChanged() {
    const currentSelection = this.args.controller.state.selection;
    this.showCard = false;
    const limitedDatastore = this.args.controller.datastore.limitToRange(
      this.args.controller.state,
      currentSelection.from,
      currentSelection.to
    );
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const quad = limitedDatastore
      .match(null, 'a', 'ext:Mapping')
      .asQuadResultSet()
      .single();
    if (quad) {
      this.showCard = false;
    } else {
      this.showCard = true;
    }
  }
}
