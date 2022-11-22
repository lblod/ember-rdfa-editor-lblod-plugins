import CitatenPlugin from '../plugins/citaten-plugin';
import GenerateTemplatePlugin from '../plugins/generate-template-plugin';
import RoadSignRegulationPlugin from '../plugins/roadsign-regulation-plugin';
import TableOfContentsPlugin from '../plugins/table-of-contents-plugin';

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
  application.register('plugin:citaten', pluginFactory(CitatenPlugin), {
    singleton: false,
  });
  application.register(
    'plugin:table-of-contents',
    pluginFactory(TableOfContentsPlugin),
    {
      singleton: false,
    }
  );
  application.register(
    'plugin:generate-template',
    pluginFactory(GenerateTemplatePlugin),
    { singleton: false }
  );
  application.register(
    'plugin:roadsign-regulation',
    pluginFactory(RoadSignRegulationPlugin),
    { singleton: false }
  );
}

export default {
  initialize,
};
