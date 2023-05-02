export const config = [
  { type: 'title', structure_name: 'structure_title', name: 'Titel' },
  { type: 'chapter', structure_name: 'structure_chapter', name: 'Hoofdstuk' },
  { type: 'section', structure_name: 'structure_section', name: 'Afdeling' },
  {
    type: 'subsection',
    structure_name: 'structure_subsection',
    name: 'Onderafdeling',
  },
];

export const config_article = {
  type: 'article',
  structure_name: 'structure_article',
  name: 'Artikel',
};

export const config_paragraph = {
  type: 'paragraph',
  structure_name: 'structure_paragraph',
  name: 'Paragraaf',
};

export type baseStructureConfig = {
  type: string;
  structure_name: string;
  name: string;
};

export type baseStructureConfigWithChild = baseStructureConfig & {
  child: null | baseStructureConfig;
};

export function getConfig(type: string): baseStructureConfigWithChild {
  if (type === 'article') return { ...config_article, child: null };
  if (type === 'paragraph') return { ...config_paragraph, child: null };
  const index = config.findIndex((c) => c.type === type);
  if (index <= config.length) {
    return { ...config[index], child: config[index + 1] };
  } else return { ...config[index], child: null };
}

export function createStructureConfig(type: string) {
  const c = getConfig(type);
  return {
    name: c.structure_name,
    componentPath: `structured-blocks-plugin/ember-nodes/${c.type}`,
    inline: false,
    group: `${c.structure_name} structure`,
    atom: false,
    content: `structure_paragraph* structure_article* ${
      c.child ? c.child.structure_name + '*' : ''
    }`,
    attrs: {
      text: { default: '' },
      config: { default: c },
    },
  };
}
