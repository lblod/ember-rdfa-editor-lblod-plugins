export type TableOfContentsConfig =
  | {
      nodeHierarchy: string[];
      scrollContainer?: () => HTMLElement;
    }[]
  | { scrollContainer?: () => HTMLElement };
