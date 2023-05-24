/**
 * An official structure for law documents.
 * - Possible structured blocks are: title (Titel), chapter (hoofdstuk), section (afdeling), subsection (subafdeling)
 * - every structured block can have multiple articles (artikels).
 * - Both structured blocks and artikels contain headings (opschriften): an optional text that gives some info about
 *   the specific block
 * - An artikel has content (inhoud): a textblock of any length (can contain alineas and other inline things)
 */

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

export const config_content = {
  type: 'content',
  structure_name: 'structure_content',
  name: 'Inhoud',
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
  if (type === 'content') return { ...config_content, child: null };
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
    draggable: true,
    selectable: false,
    defining: true,
    isolating: true,
    ignoreMutation() {
      return true;
    },
    stopEvent: (event: Event) => {
      // let hover events bubble up
      if (event.type === 'mouseenter' || event.type === 'mouseleave') {
        return false;
      }
      return true;
    },
    content: `structure_article* ${
      c.child ? c.child.structure_name + '*' : ''
    }`,
    attrs: {
      text: { default: '' },
      showRemoveBorder: { default: false },
      // should the css class for hovering be added. Hover is still needed to show it.
      addBlockHover: { default: true },
      config: { default: c },
      number: { default: 1 },
    },
  };
}
