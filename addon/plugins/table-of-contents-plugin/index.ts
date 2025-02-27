export type LegacyTableOfContentsConfig = {
  nodeHierarchy: string[];
  scrollContainer?: () => HTMLElement;
}[];
export type TableOfContentsConfig =
  | LegacyTableOfContentsConfig
  | { scrollContainer?: () => HTMLElement };
