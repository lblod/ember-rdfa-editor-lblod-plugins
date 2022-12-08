import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { getOwner } from '@ember/application';
import { task } from 'ember-concurrency';

import {
  CodeListOption,
  fetchCodeListOptions,
} from '../../utils/variable-plugins/fetch-data';
import { MULTI_SELECT_CODELIST_TYPE, ZONAL_URI } from '../../constants';
import { ProseController } from '@lblod/ember-rdfa-editor/core/prosemirror';
import { ProseStore } from '@lblod/ember-rdfa-editor/utils/datastore/prose-store';
import htmlToFragment from '@lblod/ember-rdfa-editor-lblod-plugins/utils/html-to-fragment';

type Args = {
  controller: ProseController;
};
export default class EditorPluginsTemplateVariableCardComponent extends Component<Args> {
  @tracked variableOptions: CodeListOption[] = [];
  @tracked selectedVariable?: CodeListOption | CodeListOption[];
  @tracked showCard = false;
  @tracked multiSelect = false;
  mappingUri?: string;
  zonalLocationCodelistUri: string;
  endpoint: string;
  nonZonalLocationCodelistUri: string;

  constructor(parent: unknown, args: Args) {
    super(parent, args);
    const config = getOwner(this)?.resolveRegistration(
      'config:environment'
    ) as {
      templateVariablePlugin: {
        zonalLocationCodelistUri: string;
        endpoint: string;
        nonZonalLocationCodelistUri: string;
      };
    };
    const pluginConfig = config.templateVariablePlugin;
    this.zonalLocationCodelistUri = pluginConfig.zonalLocationCodelistUri;
    this.endpoint = pluginConfig.endpoint;
    this.nonZonalLocationCodelistUri = pluginConfig.nonZonalLocationCodelistUri;
  }

  get controller() {
    return this.args.controller;
  }

  @action
  insert() {
    const { selection } = this.controller.state;
    if (!selection.from || !this.mappingUri || !this.selectedVariable) {
      return;
    }
    this.controller.datastore;
    const limitedDatastore = this.controller.datastore.limitToRange(
      this.controller.state,
      selection.from,
      selection.to
    );
    const mapping = limitedDatastore
      .match(`>${this.mappingUri}`, 'ext:content')
      .asSubjectNodeMapping()
      .single();
    if (!mapping) {
      return;
    }
    const { node: mappingNode, pos: resolvedMappingPos } = [
      ...mapping.nodes,
    ][0]!;
    let insertRange: { from: number; to: number };
    mappingNode.descendants((child, relativePos) => {
      const absolutePos = resolvedMappingPos
        ? resolvedMappingPos.pos + relativePos + 1
        : relativePos;
      if (child.attrs['property'] === 'ext:content') {
        insertRange = {
          from: absolutePos + 1,
          to: absolutePos + child.nodeSize - 1,
        };
        return false;
      }
    });
    let htmlToInsert: string;
    if (Array.isArray(this.selectedVariable)) {
      htmlToInsert = this.selectedVariable
        .map((variable) => variable.value)
        .join(', ');
    } else {
      htmlToInsert = this.selectedVariable.value!;
    }
    const fragment = htmlToFragment(htmlToInsert, this.controller.schema);
    this.controller.withTransaction((tr) => {
      return tr.replaceWith(insertRange.from, insertRange.to, fragment);
    });
  }

  wrapVariableInHighlight(text: string) {
    return text.replace(
      /\$\{(.+?)\}/g,
      '<span class="mark-highlight-manual">${$1}</span>'
    );
  }

  @action
  selectionChanged() {
    this.showCard = false;
    this.selectedVariable = undefined;
    const { selection } = this.controller.state;
    const { from, to } = selection;
    const fullDatastore = this.controller.datastore;
    const limitedDatastore = this.controller.datastore.limitToRange(
      this.controller.state,
      from,
      to
    );
    const mapping = limitedDatastore
      .match(null, 'a', 'ext:Mapping')
      .asQuadResultSet()
      .single();
    if (mapping) {
      const mappingUri = mapping.subject.value;
      this.mappingUri = mappingUri;
      const mappingTypeTriple = fullDatastore
        .match(`>${mappingUri}`, 'dct:type')
        .asQuadResultSet()
        .single();
      if (mappingTypeTriple) {
        const mappingType = mappingTypeTriple.object.value;
        if (mappingType === 'codelist') {
          const codelistTriple = fullDatastore
            .match(`>${mappingUri}`, 'ext:codelist')
            .asQuadResultSet()
            .single();
          if (codelistTriple) {
            const codelistSource = this.getCodelistSource(
              fullDatastore,
              mappingUri
            );
            this.showCard = true;
            const codelistUri = codelistTriple.object.value;
            void this.fetchCodeListOptions.perform(codelistSource, codelistUri);
          }
        } else if (mappingType === 'location') {
          const codelistSource = this.getCodelistSource(
            fullDatastore,
            mappingUri
          );
          const measureTriple = limitedDatastore
            .match(
              null,
              'a',
              '>https://data.vlaanderen.be/ns/mobiliteit#Mobiliteitsmaatregel'
            )
            .asQuadResultSet()
            .single();
          if (!measureTriple) {
            return;
          }
          const measureUri = measureTriple.subject.value;
          const zonalityTriple = fullDatastore
            .match(`>${measureUri}`, 'ext:zonality')
            .asQuadResultSet()
            .single();
          if (!zonalityTriple) {
            return;
          }
          const zonalityUri = zonalityTriple.object.value;
          if (zonalityUri === ZONAL_URI) {
            void this.fetchCodeListOptions.perform(
              codelistSource,
              this.zonalLocationCodelistUri,
              true
            );
          } else {
            void this.fetchCodeListOptions.perform(
              codelistSource,
              this.nonZonalLocationCodelistUri,
              true
            );
          }
          this.showCard = true;
        }
      }
    }
  }

  getCodelistSource(fullDatastore: ProseStore, mappingUri: string): string {
    const codelistSourceTriple = fullDatastore
      .match(`>${mappingUri}`, 'dct:source')
      .asQuadResultSet()
      .single();

    if (codelistSourceTriple) {
      return codelistSourceTriple.object.value;
    } else {
      return this.endpoint;
    }
  }

  @action
  updateVariable(variable: CodeListOption | CodeListOption[]) {
    this.selectedVariable = variable;
  }

  fetchCodeListOptions = task(
    async (endpoint: string, codelistUri: string, isLocation?: boolean) => {
      const { type, options } = await fetchCodeListOptions(
        endpoint,
        codelistUri
      );
      if (isLocation) {
        this.variableOptions = options.map((option) => ({
          label: option.label,
          value: this.wrapInLocation(option.value!),
        }));
      } else {
        this.variableOptions = options;
      }
      if (type === MULTI_SELECT_CODELIST_TYPE) {
        this.multiSelect = true;
      } else {
        this.multiSelect = false;
      }
    }
  );

  wrapInLocation(value: string) {
    return `
      <span property="https://data.vlaanderen.be/ns/mobiliteit#plaatsbepaling">
        ${value}
      </span>
    `;
  }
}
