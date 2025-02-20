import type { Option } from '../utils/option';
export function isElement(node: Option<Node>): node is Element {
  return node?.nodeType === Node.ELEMENT_NODE;
}

export function parseBooleanDatasetAttribute(
  element: HTMLElement,
  key: string,
) {
  return element.dataset[key] ? element.dataset[key] !== 'false' : false;
}
