import type { Option } from '../utils/option';
export function isElement(node: Option<Node>): node is Element {
  return node?.nodeType === Node.ELEMENT_NODE;
}
