import BesluitTypePlugin from '../plugins/besluit-type-plugin';
import CitatenPlugin from '../plugins/citaten-plugin';
import StandardTemplatePlugin from '../plugins/standard-template-plugin';
import GenerateTemplatePlugin from '../plugins/generate-template-plugin';
import RoadSignRegulationPlugin from '../plugins/roadsign-regulation-plugin';
import TableOfContentsPlugin from '../plugins/table-of-contents-plugin';
import RdfaDatePlugin from '../plugins/rdfa-date-plugin';
import ImportSnippetPlugin from '../plugins/import-snippet-plugin';
import TemplateVariablePlugin from '../plugins/template-variable-plugin';
import InsertVariablePlugin from '../plugins/insert-variable-plugin';

function pluginFactory(plugin) {
  return {
    create: (initializers) => {
      const pluginInstance = new plugin();
      Object.assign(pluginInstance, initializers);
      return pluginInstance;
    },
  };
}

export function initialize(application) {
  // application.register('plugin:citaten', pluginFactory(CitatenPlugin), {
  //   singleton: false,
  // });
  // application.register(
  //   'plugin:standard-template',
  //   pluginFactory(StandardTemplatePlugin),
  //   { singleton: false }
  // );
  // application.register(
  //   'plugin:besluit-type',
  //   pluginFactory(BesluitTypePlugin),
  //   { singleton: false }
  // );
  // application.register(
  //   'plugin:table-of-contents',
  //   pluginFactory(TableOfContentsPlugin),
  //   { singleton: false }
  // );
  // application.register(
  //   'plugin:generate-template',
  //   pluginFactory(GenerateTemplatePlugin),
  //   { singleton: false }
  // );
  // application.register(
  //   'plugin:roadsign-regulation',
  //   pluginFactory(RoadSignRegulationPlugin),
  //   { singleton: false }
  // );
  // application.register('plugin:rdfa-date', pluginFactory(RdfaDatePlugin), {
  //   singleton: false,
  // });
  // application.register(
  //   'plugin:import-snippet',
  //   pluginFactory(ImportSnippetPlugin),
  //   {
  //     singleton: false,
  //   }
  // );
  // application.register(
  //   'plugin:template-variable',
  //   pluginFactory(TemplateVariablePlugin),
  //   { singleton: false }
  // );
  // application.register(
  //   'plugin:insert-variable',
  //   pluginFactory(InsertVariablePlugin),
  //   { singleton: false }
  // );
}

export default {
  initialize,
};
