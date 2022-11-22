import CitatenPlugin from '../plugins/citaten-plugin';
import StandardTemplatePlugin from '../plugins/standard-template-plugin';

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
    'plugin:standard-template',
    pluginFactory(StandardTemplatePlugin),
    {
      singleton: false,
    }
  );
}

export default {
  initialize,
};
