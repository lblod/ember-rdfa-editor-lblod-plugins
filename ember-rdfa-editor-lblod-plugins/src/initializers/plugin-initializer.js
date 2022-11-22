import CitatenPlugin from '../plugins/citaten-plugin';
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
  application.register('plugin:citaten-plugin', pluginFactory(CitatenPlugin), {
    singleton: false,
  });
  application.register(
    'plugin:table-of-contents',
    pluginFactory(TableOfContentsPlugin),
    {
      singleton: false,
    }
  );
}

export default {
  initialize,
};
