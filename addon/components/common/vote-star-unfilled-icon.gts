import type { TOC } from '@ember/component/template-only';

export interface VoteStarUnfilledIconSignature {
  Element: SVGSVGElement;
}

/**
 * There is no unfilled version in AU. Unfortunately, due to AU including a `stroke-width: 0` style
 * for icons, this icon shouldn't be used inside an `AuIcon`, it should be used in place of one.
 */
export const VoteStarUnfilledIcon: TOC<VoteStarUnfilledIconSignature> =
  <template>
    <svg
      xmlns='http://www.w3.org/2000/svg'
      viewBox='0 0 16 17'
      class='au-c-icon'
      {{! template-lint-disable no-inline-styles }}
      style='stroke-width:10%;'
      ...attributes
    ><path
        {{! template-lint-disable no-inline-styles }}
        style='fill:none;'
        d='M12 15.167a.668.668 0 0 1-.37-.112L8 12.635l-3.63 2.42a.667.667 0 0 1-1.01-.737l1.225-4.29-3.056-3.056A.668.668 0 0 1 2 5.834h3.588l1.816-3.631c.226-.452.967-.452 1.193 0l1.816 3.631H14a.667.667 0 0 1 .471 1.138l-3.056 3.056 1.226 4.29a.667.667 0 0 1-.641.85Z'
      /></svg>
  </template>;
