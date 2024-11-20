# @lblod/ember-rdfa-editor-lblod-plugins

## 26.0.1

### Patch Changes

- [#507](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/507) [`d7bf867`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/d7bf867860134c38aff2ab7bb6a3431c0546e354) Thanks [@elpoelma](https://github.com/elpoelma)! - Update `@lblod/template-uuid-instantiator` to version [1.0.3](https://github.com/lblod/template-uuid-instantiator/releases/tag/v1.0.3)

## 26.0.0

### Major Changes

- [#504](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/504) [`82dd848`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/82dd848062665bf907055d47231beaa156ec243c) Thanks [@elpoelma](https://github.com/elpoelma)! - Adjustments to `lmb-plugin`:

  - Rework `fetchMandatees` queries into `fetchElectees`
    - Fetches all electees for a certain legislation period + all non-elected people with a mandate
    - Replace `Mandatee` model by simpler `Electee` model
  - Adjust UI components to reflect the `Mandatee` to `Electee` change

- [#504](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/504) [`82dd848`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/82dd848062665bf907055d47231beaa156ec243c) Thanks [@elpoelma](https://github.com/elpoelma)! - Adjustments to `person` variable:
  - Removal of unused `content` attribute
  - Removal of `mandatee` attribute. Replaced by `value` attribute which contains an object of type `Person`.
    ```ts
    type Person = {
      uri: string;
      firstName: string;
      lastName: string;
    };
    ```
  - Adjust parsing rules of `person_variable` nodespec to work with old and new serializations
  - Is now more generic, instead of relying on `Mandatee` instances

### Minor Changes

- [#509](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/509) [`092cc56`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/092cc569ef130e65611bb6de0e45c6d73f9c3718) Thanks [@elpoelma](https://github.com/elpoelma)! - Mandatee table plugin: ensure synchronisation warning shown in mandatee tables is clearer/more explicit

### Patch Changes

- [#504](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/504) [`c5d4e05`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/c5d4e05c9b1e7a37bba6f79df862d5505aebbd47) Thanks [@elpoelma](https://github.com/elpoelma)! - person-variable plugin: remove unused `content` node-attribute

- [#505](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/505) [`0cb4f55`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/0cb4f555effe599d6e481d14bfcb6de7ac15fb66) Thanks [@lagartoverde](https://github.com/lagartoverde)! - Use new template uris on variables

- [#508](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/508) [`05f5e77`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/05f5e7711f7062132f1912f6675b8fd440d54daf) Thanks [@elpoelma](https://github.com/elpoelma)! - Decision article structures: remove unnecessary css placeholder from content section

## 25.2.2

### Patch Changes

- [`7a31422`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/7a314220944f266566efced7343d630810fc0247) Thanks [@abeforgit](https://github.com/abeforgit)! - loosen editor peerdep

- [`1c165af`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/1c165afcf6793c6ec96c40a902d90bdcac60900c) Thanks [@abeforgit](https://github.com/abeforgit)! - bump editor to [v10.7.4](https://github.com/lblod/ember-rdfa-editor/releases/tag/v10.7.4)

## 25.2.1

### Patch Changes

- [#497](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/497) [`2b4b401`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/2b4b4011e3d66c23f232bf6690ca80a5b0a90298) Thanks [@lagartoverde](https://github.com/lagartoverde)! - Redesign variable pills

- [#497](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/497) [`2b4b401`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/2b4b4011e3d66c23f232bf6690ca80a5b0a90298) Thanks [@lagartoverde](https://github.com/lagartoverde)! - Bump ember-rdfa-editor to 10.7.3

## 25.2.0

### Minor Changes

- [#496](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/496) [`2e3c09f`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/2e3c09f95db40967caaceaa791e7eefd6187c5e4) Thanks [@piemonkey](https://github.com/piemonkey)! - Redesign snippet placeholder to have more intuitive UX

- [#503](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/503) [`37ba9c3`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/37ba9c3ecd2c0452fb49ea1d0bb2704e6e716d05) Thanks [@elpoelma](https://github.com/elpoelma)! - Extension of configuration options of `citation-plugin`.
  The `CitationPluginNodeConfig` is extended to allow for a `activeInNode` condition.
  This allows you to specify a condition which an active/context node needs to satisfy.

  ```ts
  interface CitationPluginNodeConditionConfig {
    type: 'nodes';
    regex?: RegExp;

    activeInNode(node: PNode, state?: EditorState): boolean;
  }
  ```

  The previously expected `activeInNodeTypes` option is marked as deprecated and will be removed in a future release.

- [#501](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/501) [`997fa98`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/997fa986a7094349ad368d291cb8364e5c50a140) Thanks [@lagartoverde](https://github.com/lagartoverde)! - Add snippet list names to the modal title

## 25.1.0

### Minor Changes

- [#502](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/502) [`9beff10`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/9beff10b99a5825a4eb9be94128c2efb822ac982) Thanks [@abeforgit](https://github.com/abeforgit)! - Improved LMB-plugin

  - Fixes missing data due to 10000 triple limit of query
  - does all pagination, sorting and searching through the query
  - adds filters for administrative period and unit

## 25.0.0

### Major Changes

- [#499](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/499) [`3255c70`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/3255c7021008a801eb5b07ebd49a6e557467b4ba) Thanks [@elpoelma](https://github.com/elpoelma)! - Update `@lblod/ember-rdfa-editor` peerdep requirement to version [10.7.2](https://github.com/lblod/ember-rdfa-editor/releases/tag/v10.7.2)

### Minor Changes

- [#495](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/495) [`046b6b7`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/046b6b7c65b1e9144b7c469bbb2d968652639117) Thanks [@piemonkey](https://github.com/piemonkey)! - When removing last snippet of a 'group', replace the placeholder instead of completely deleting

### Patch Changes

- [#495](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/495) [`6547270`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/65472703c65a05feb6793a973e3785228822e1a1) Thanks [@piemonkey](https://github.com/piemonkey)! - Fix bug with snippet list names containing a `,` displaying as multiple lists

- [#499](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/499) [`3255c70`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/3255c7021008a801eb5b07ebd49a6e557467b4ba) Thanks [@elpoelma](https://github.com/elpoelma)! - Fix margins of mandatee table warning message

- [#500](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/500) [`0b336ad`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/0b336addbf4287620d471515aa75c2d62dc2627d) Thanks [@lagartoverde](https://github.com/lagartoverde)! - Fix bug when setting a date with a day bigger than the number of days in the current month

## 24.3.2

### Patch Changes

- [#498](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/498) [`2f0c6fa`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/2f0c6fa7bb8db188849b5331892eb16d7d692f44) Thanks [@piemonkey](https://github.com/piemonkey)! - Correctly instantiate placeholder URIs in snippets when inserting

## 24.3.1

### Patch Changes

- [#494](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/494) [`3941b65`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/3941b659fbb710be0aafd34b911a42416a1124c9) Thanks [@elpoelma](https://github.com/elpoelma)! - Ensure that the event handlers of snippet actions are only triggered once

## 24.3.0

### Minor Changes

- [#493](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/493) [`1e596e1`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/1e596e1db4d201ed2cba0713808d918944c51eb6) Thanks [@lagartoverde](https://github.com/lagartoverde)! - Redesign structure nodes v1

### Patch Changes

- [#492](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/492) [`76b6ecb`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/76b6ecb4ff09ec18088448fd6da69b9e69f34a7c) Thanks [@elpoelma](https://github.com/elpoelma)! - Disable `rdfaAware` setting for heading nodes in dummy app

## 24.2.3

### Patch Changes

- [#491](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/491) [`2191d5a`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/2191d5a18669ab15bb64e09ec8e7273020dbca79) Thanks [@piemonkey](https://github.com/piemonkey)! - Do not add `" ."` at the end of 'only article' for single articles

## 24.2.2

### Patch Changes

- [`651d431`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/651d431f79c13ee85f9265cc01a7389e71392716) Thanks [@abeforgit](https://github.com/abeforgit)! - Allow block content in template comments

## 24.2.1

### Patch Changes

- [#490](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/490) [`816bb59`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/816bb59edb6e8e51dee6ee1ad26acb1b7ad44761) Thanks [@lagartoverde](https://github.com/lagartoverde)! - parse articles also from templates

## 24.2.0

### Minor Changes

- [#489](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/489) [`9a89b99`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/9a89b992a2e6520e06720c099bff1dd7f115d9ab) Thanks [@piemonkey](https://github.com/piemonkey)! - Add config to specify an external decision URI when creating decision article structures

- [#489](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/489) [`9a89b99`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/9a89b992a2e6520e06720c099bff1dd7f115d9ab) Thanks [@piemonkey](https://github.com/piemonkey)! - Add config to specify an external decision URI in lpdc plugin

- [#489](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/489) [`9a89b99`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/9a89b992a2e6520e06720c099bff1dd7f115d9ab) Thanks [@piemonkey](https://github.com/piemonkey)! - Add config to specify an external decision URI and type in roadsign-regulation-plugin

## 24.1.2

### Patch Changes

- [`45068be`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/45068be46fccd98ad9af2afafcd423c9c5dfd5fd) Thanks [@abeforgit](https://github.com/abeforgit)! - fix word-wrapping in structure nodes

## 24.1.1

### Patch Changes

- [#488](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/488) [`8f665b9`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/8f665b907a1e89859b236d43c69beb941337dc48) Thanks [@lagartoverde](https://github.com/lagartoverde)! - Fix the person edit modal was not being resetted on closing

## 24.1.0

### Minor Changes

- [#486](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/486) [`630ee77`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/630ee77532506c3643edfe70c0e220e61e33ffa2) Thanks [@lagartoverde](https://github.com/lagartoverde)! - Use a special name if you only have one article in the document
  The title from the second article is shortened to Art.

## 24.0.0

### Major Changes

- [#482](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/482) [`8c46ded`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/8c46deddb0ab3d156b27fb555709e6489f647ced) Thanks [@elpoelma](https://github.com/elpoelma)! - Adjust snippet queries to work with new snippet data-model

### Minor Changes

- [#472](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/472) [`a114436`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/a114436ce7b0a7a4f2fca9faf494729169554dbd) Thanks [@lagartoverde](https://github.com/lagartoverde)! - Add autofill variable

- [#484](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/484) [`14e8c57`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/14e8c5746b7674dfa3e0d968d4ce16c5855ffff3) Thanks [@elpoelma](https://github.com/elpoelma)! - Add option for enabling/disabling multi-snippet insertion

## 23.1.0

### Minor Changes

- [#483](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/483) [`2ac7d9a`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/2ac7d9ae70a885fa7747df6e3a18eece2b06e910) Thanks [@piemonkey](https://github.com/piemonkey)! - Add property to hide template comments while publishing

## 23.0.0

### Major Changes

- [#478](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/478) [`b3cf324`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/b3cf324e6b959a50ba354e1563b04a0e12f41f67) Thanks [@abeforgit](https://github.com/abeforgit)! - Run recalculate numbers after inserting a snippet

### Minor Changes

- [#480](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/480) [`789180f`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/789180fde786000756c2880dca9591866bf7132f) Thanks [@piemonkey](https://github.com/piemonkey)! - Internal: update to latest ember-resources 7.0.2. Requires an upgrade only if consumer app uses
  ember dependency-lint to maintain matching versions.

## 22.5.2

### Patch Changes

- [#476](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/476) [`6de71f8`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/6de71f8b57e1cf5297445e288e0221707f1fbc7c) Thanks [@piemonkey](https://github.com/piemonkey)! - Add configuration option to snippet plugin to set the allowed content

- [#479](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/479) [`4755750`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/47557501ed745a274cc062bd59234736bc278ded) Thanks [@piemonkey](https://github.com/piemonkey)! - Fix bug where snippet hover buttons were not always functional on Chrome

## 22.5.1

### Patch Changes

- [`ca26f13`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/ca26f1373d1fb14f8cc998d4a91a6f1a10d48049) Thanks [@piemonkey](https://github.com/piemonkey)! - Correct peer dependency editor version as it shouldn't change on a non-major release

## 22.5.0

### Minor Changes

- [#475](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/475) [`9e2ef89`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/9e2ef899e5e35ed755e4af90ca15096b3957222b) Thanks [@elpoelma](https://github.com/elpoelma)! - Introduction of `auto-resizing-text-area` component

- [#475](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/475) [`a9df4e7`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/a9df4e7546a1414e2fe8551a8ca21fd5b9f64898) Thanks [@elpoelma](https://github.com/elpoelma)! - mandatee-table plugin: replace `input` element by `textarea` element for entering mandatee table titles

- [#462](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/462) [`dfb349e`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/dfb349ef83c97eac2c498eaac392dbfd6ab77a4b) Thanks [@piemonkey](https://github.com/piemonkey)! - Allow resources imported into snippet placeholders to be linked to resources in the document

### Patch Changes

- [#475](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/475) [`36b0005`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/36b00054624de60a1c51f7617a83c61594f4074b) Thanks [@elpoelma](https://github.com/elpoelma)! - Support newlines in mandatee table titles (using the `white-space: pre-line` rule)

- [#475](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/475) [`127c6e2`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/127c6e256d7fb3a0e1912bfc0a56a2f4d08d1837) Thanks [@elpoelma](https://github.com/elpoelma)! - Use `h6` to represent mandatee table title

- [#473](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/473) [`1c9dd11`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/1c9dd1119670ee35f04f8a0d0677e6a4230acd84) Thanks [@piemonkey](https://github.com/piemonkey)! - Add error handling to lmb-plugin

## 22.4.1

### Patch Changes

- [#474](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/474) [`714f260`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/714f260e2c9024fe8ea3f031b42b746fd2ac0c26) Thanks [@elpoelma](https://github.com/elpoelma)! - LMB-plugin: query mandatees using `application/x-www-form-urlencoded` approach

## 22.4.0

### Minor Changes

- [#471](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/471) [`8132a55`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/8132a550124cf90b47c3d1c759ce43bd9f72cfab) Thanks [@elpoelma](https://github.com/elpoelma)! - Introduce opt-in option to `insert-article` component to allow for inserting decision articles everywhere in a document (not just to the article-container of a decision). Useful when e.g. creating snippets.

### Patch Changes

- [#470](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/470) [`fdfd8b8`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/fdfd8b80c58adc07e968d131dce7618b57b27e49) Thanks [@piemonkey](https://github.com/piemonkey)! - Correct CRS URI used in location plugin to correctly use http: instead of https:

## 22.3.0

### Minor Changes

- [#468](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/468) [`c430761`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/c430761784bb5017b803fc91321e51b05899bf20) Thanks [@elpoelma](https://github.com/elpoelma)! - Update `snippet-preview` component to include a collapsible (by default not shown) preview of the snippet

## 22.2.3

### Patch Changes

- [#469](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/469) [`52c22d6`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/52c22d6042a5c8e7bc88094625c3b1136d1dcdc9) Thanks [@elpoelma](https://github.com/elpoelma)! - Remove constraint on mandatee table insertion. Mandatee table can now be inserted everywhere in a document.

## 22.2.2

### Patch Changes

- [#465](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/465) [`83b95db`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/83b95db9991f6b5ef090cd77765d8c09eac90db7) Thanks [@lagartoverde](https://github.com/lagartoverde)! - Correctly export empty person nodes

- [#465](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/465) [`be233e8`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/be233e8bc70aee1db00644ad6f956157da8d3a20) Thanks [@lagartoverde](https://github.com/lagartoverde)! - Correctly export empty person node

## 22.2.1

### Patch Changes

- [#464](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/464) [`8401163`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/8401163ca2789e1303060fa1532cd26ce3eaa9e7) Thanks [@elpoelma](https://github.com/elpoelma)! - test-app: exclude fingerprinting on ember-leaflet related images to ensure production builds behave as expected

- [#466](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/466) [`227387b`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/227387b683b3b49314683b2c299c45c492393eb8) Thanks [@lagartoverde](https://github.com/lagartoverde)! - Don't show title annotation outside the editor

## 22.2.0

### Minor Changes

- [#461](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/461) [`c3d659f`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/c3d659f0ddfb62c9241a8a34aea53a45375687f2) Thanks [@elpoelma](https://github.com/elpoelma)! - Improve serialization of `mandatee_table` node

- [#463](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/463) [`8c18bc2`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/8c18bc2106dd2a48231e5465bf0df9bf2e507d13) Thanks [@elpoelma](https://github.com/elpoelma)! - Fix issue with unresponsive edit/insert button when person variable is selected

## 22.1.0

### Minor Changes

- [#460](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/460) [`b792b75`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/b792b756267548d1b29fce8e9b8c64c3219b47b2) Thanks [@elpoelma](https://github.com/elpoelma)! - Addition of a mandatee table plugin
  - Addition of a `mandatee_table` node-spec and `mandateeTableView` node-view
    - `mandatee_table` nodes support two attributes: `tag` and `title` which can be configured by a template-creator
  - Addition of two components used to insert and configure mandatee tables
    - `MandateeTablePlugin::Insert` allows a user/template-creator to insert empty `mandatee_table` nodes
    - `MandateeTablePlugin::Configure` allows a user/template-creator to configure the title/tag of a `mandatee_table` node
  - Addition of a `syncDocument` function.
    - Synchronizes the `mandatee_table` nodes in a document based on a supplied configuration
    - Can work in a headless way (does not require a prosemirror view). It accepts and outputs a `ProseMirrorState` object.

### Patch Changes

- [#459](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/459) [`cfe0d3b`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/cfe0d3bdec8c9d3fe313b75eb3ed9a9aabd8fae1) Thanks [@lagartoverde](https://github.com/lagartoverde)! - Add body to templates so they can be inserted in the dummy app

## 22.0.2

### Patch Changes

- [`3f90b8a`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/3f90b8ac9a07a884e28d838aa39d4eec42fffbd9) Thanks [@elpoelma](https://github.com/elpoelma)! - Fix structure-control card labels

- [#458](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/458) [`d1f3a8c`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/d1f3a8c10c84fcfd02fbea2df18f10523d548287) Thanks [@piemonkey](https://github.com/piemonkey)! - Add support for relative urls to lpdc endpoint configuration

## 22.0.1

### Patch Changes

- [#456](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/456) [`f1844a1`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/f1844a1c61112bbc226e84b2728b20ae18410715) Thanks [@abeforgit](https://github.com/abeforgit)! - Allow any block content in snippet nodes

## 22.0.0

### Major Changes

- [#448](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/448) [`e6fe1df`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/e6fe1dfd89c0e7fba6d58c0f373438fdd7730403) Thanks [@piemonkey](https://github.com/piemonkey)! - Update ember-intl to v7, drops support for v5 and v6 due to API changes

- [#448](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/448) [`e6fe1df`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/e6fe1dfd89c0e7fba6d58c0f373438fdd7730403) Thanks [@piemonkey](https://github.com/piemonkey)! - Update ember-modifier to v4 and drop support for older versions

- [#448](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/448) [`e6fe1df`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/e6fe1dfd89c0e7fba6d58c0f373438fdd7730403) Thanks [@piemonkey](https://github.com/piemonkey)! - Update to ember-power-select v7.1, drops support for older versions

- [#448](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/448) [`e6fe1df`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/e6fe1dfd89c0e7fba6d58c0f373438fdd7730403) Thanks [@piemonkey](https://github.com/piemonkey)! - Update all dependencies to latest supported versions

- [#448](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/448) [`e6fe1df`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/e6fe1dfd89c0e7fba6d58c0f373438fdd7730403) Thanks [@piemonkey](https://github.com/piemonkey)! - Run pnpm up to update dependencies to latest supported versions

- [#451](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/451) [`8f560c6`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/8f560c688458eb6c143c20a6758749811871d78e) Thanks [@elpoelma](https://github.com/elpoelma)! - Remove `nodeType`-based validation plugin. This validation plugin validated documents based on the presence of nodes with a specific node-type. This turned out not to be as useful/intuitive.

### Minor Changes

- [#455](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/455) [`0ae858b`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/0ae858b4dd6bf8034024e312abc468e2bc1bc21f) Thanks [@lagartoverde](https://github.com/lagartoverde)! - Added person variable

- [#448](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/448) [`e6fe1df`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/e6fe1dfd89c0e7fba6d58c0f373438fdd7730403) Thanks [@piemonkey](https://github.com/piemonkey)! - Update to ember-template-imports 4.1.1

### Patch Changes

- [#453](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/453) [`9ffbcae`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/9ffbcae60370a43d80e03887fc3f41473cd8b849) Thanks [@abeforgit](https://github.com/abeforgit)! - fix: allow basic templates to be inserted again

- [#450](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/450) [`19d811d`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/19d811dfae52ff0dca37ddedcb0a141fbb3cb5b0) Thanks [@elpoelma](https://github.com/elpoelma)! - lbm-plugin: add support for inserting independent mandatees (who are not part of a fraction)

- [#454](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/454) [`fdeb6cd`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/fdeb6cd7b9bfcf7f13ad3c4005f2179776d3ef41) Thanks [@piemonkey](https://github.com/piemonkey)! - Use icon classes in order to support embeddable editor

## 21.0.0

### Major Changes

- [#449](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/449) [`335cb673df926d26a0d421a958c414d334653575`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/335cb673df926d26a0d421a958c414d334653575) Thanks [@elpoelma](https://github.com/elpoelma)! - Drop obsolete decision nodes from `standard-template` plugin

### Minor Changes

- [#443](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/443) [`9f53a0c5a0e0db0414b0c84aed978d01752ccbf8`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/9f53a0c5a0e0db0414b0c84aed978d01752ccbf8) Thanks [@piemonkey](https://github.com/piemonkey)! - Add ability to specify area locations in the location-plugin

- [#445](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/445) [`06fe546cea3d3e7076f3a0ab4549c8de389a43d7`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/06fe546cea3d3e7076f3a0ab4549c8de389a43d7) Thanks [@lagartoverde](https://github.com/lagartoverde)! - Support for repeatable fragments

  Addition of a custom, interactive `fragment` node and nodeview.
  Using the fragment node interactive buttons, you can replace, add and remove fragments.

- [#444](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/444) [`3eea339d0d4bd5bf746d6c8cd9c99cf95e127825`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/3eea339d0d4bd5bf746d6c8cd9c99cf95e127825) Thanks [@elpoelma](https://github.com/elpoelma)! - Addition of a backwards-compatible parsing-rule for decision articles to `structure` node-spec

- [#446](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/446) [`f9b4a65a743b214d4f5fa2ba3936fc9fca9fa4c2`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/f9b4a65a743b214d4f5fa2ba3936fc9fca9fa4c2) Thanks [@elpoelma](https://github.com/elpoelma)! - Introduce some modifications to new `structure` node-spec:
  - Drop `structureName` node-attribute. This attribute has been replaced by both the `structureType` and `displayStructureName` attributes.
  - Introduction of a required `structureType` attribute. Examples of `structureType` values are:
    - `article`
    - `title`
    - `chapter`
    - `section`
    - `subsection`
    - `paragraph`
  - Introduction of a `displayStructureName` attribute. This attribute controls whether the internationalizated (based on the document language) version of the structure name is displayed inside the header of the structure. The internationalized structure name is based on the `structureType` value and the entries included in the translation files. `displayStructureName` has a default value of `false`.

### Patch Changes

- [#447](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/447) [`f06edfdf1681fc2c52e46462cad8faa5d97215c4`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/f06edfdf1681fc2c52e46462cad8faa5d97215c4) Thanks [@elpoelma](https://github.com/elpoelma)! - Ensure `zonality` is set up as optional when fetching traffic signs

## 20.0.0

### Major Changes

- [#440](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/440) [`8c242fe2eda10725e2bce59a77c86e905b6878b9`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/8c242fe2eda10725e2bce59a77c86e905b6878b9) Thanks [@abeforgit](https://github.com/abeforgit)! - Convert plugins that used decision nodes to work on any nodes that have the rdf decision type

### Minor Changes

- [#440](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/440) [`8c242fe2eda10725e2bce59a77c86e905b6878b9`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/8c242fe2eda10725e2bce59a77c86e905b6878b9) Thanks [@abeforgit](https://github.com/abeforgit)! - Add new structure node using a nodeview approach

### Patch Changes

- [#441](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/441) [`45aad15462f89eede7cd2633ccf129189367d8db`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/45aad15462f89eede7cd2633ccf129189367d8db) Thanks [@piemonkey](https://github.com/piemonkey)! - Fix docker image builds

## 19.3.1

### Patch Changes

- [`b13b2c304448ca0b342c794388f9e5dacf28ab38`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/b13b2c304448ca0b342c794388f9e5dacf28ab38) Thanks [@piemonkey](https://github.com/piemonkey)! - Correct peer-dependency range of ember-modifier to include 4.x

## 19.3.0

### Minor Changes

- [#433](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/433) [`b43ae7e6b08b2b78e21a2ab6b2dfee3d044b5297`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/b43ae7e6b08b2b78e21a2ab6b2dfee3d044b5297) Thanks [@lagartoverde](https://github.com/lagartoverde)! - Hide label if the variable is filled

- [#439](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/439) [`3c848481a9725b86c3bc4bd82d7381a3dfc2e509`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/3c848481a9725b86c3bc4bd82d7381a3dfc2e509) Thanks [@piemonkey](https://github.com/piemonkey)! - Add ability to select geographical positions from a map to the location plugin

- [#436](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/436) [`2b270eccf55469187dd2273d6953a286b4868154`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/2b270eccf55469187dd2273d6953a286b4868154) Thanks [@lagartoverde](https://github.com/lagartoverde)! - Changed UI of snippet placeholder to show which lists you can insert from

- [#435](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/435) [`596b85bfe9c85a3a24b6964d44381cea8909698f`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/596b85bfe9c85a3a24b6964d44381cea8909698f) Thanks [@dkozickis](https://github.com/dkozickis)! - GN-4820: Paste variables

  Pasting variable (which was copied from same editor) will now paste actual variable, not just the text that was contained inside it.

### Patch Changes

- [#437](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/437) [`f2c4ece21d5a2c56029f7111361719220eeaefef`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/f2c4ece21d5a2c56029f7111361719220eeaefef) Thanks [@dkozickis](https://github.com/dkozickis)! - GN-4692: Add missing `nl-BE` translation for besluit topic plugin

## 19.2.0

### Minor Changes

- [#427](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/427) [`0de131824462d4297190bc25f8916a70b358e46a`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/0de131824462d4297190bc25f8916a70b358e46a) Thanks [@lagartoverde](https://github.com/lagartoverde)! - Added lmb-plugin to add LMB mandatees to the document

- [#429](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/429) [`db575dea5da9b71c645c5ed5e091a307bb075ba4`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/db575dea5da9b71c645c5ed5e091a307bb075ba4) Thanks [@dkozickis](https://github.com/dkozickis)! - GN-4693: Insert LPDC

- [#431](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/431) [`f3bfdd1caff44d4011fb0aaf7edeef5da7510a35`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/f3bfdd1caff44d4011fb0aaf7edeef5da7510a35) Thanks [@piemonkey](https://github.com/piemonkey)! - Add location plugin

- [#430](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/430) [`e9a92cbf8548bb782c819c95bce44486ce9633eb`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/e9a92cbf8548bb782c819c95bce44486ce9633eb) Thanks [@piemonkey](https://github.com/piemonkey)! - Use OSLO model for addresses in variable-plugin

- [#432](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/432) [`81f82bee3cc2f269f9a92031167000697d72365d`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/81f82bee3cc2f269f9a92031167000697d72365d) Thanks [@piemonkey](https://github.com/piemonkey)! - Move location-plugin address search to a modal

### Patch Changes

- [#428](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/428) [`c21ac34b0fd304ad9126243f9b693d4ce6107c4b`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/c21ac34b0fd304ad9126243f9b693d4ce6107c4b) Thanks [@lagartoverde](https://github.com/lagartoverde)! - Styling fixes

- [#430](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/430) [`b19acda5b1b31bfb289c0f0c0a16e43712ca376f`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/b19acda5b1b31bfb289c0f0c0a16e43712ca376f) Thanks [@piemonkey](https://github.com/piemonkey)! - Change format for geodata used by the address plugin to WKT instead of GML to match the OSLO spec

- [#430](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/430) [`def6922e0037dbea6857fc309ac4fdae07fffca6`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/def6922e0037dbea6857fc309ac4fdae07fffca6) Thanks [@piemonkey](https://github.com/piemonkey)! - Correct typo in adres: prefix

## 19.1.0

### Minor Changes

- [#426](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/426) [`cb28e40ae4a8b1bf1d2d792788a10986db77aec2`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/cb28e40ae4a8b1bf1d2d792788a10986db77aec2) Thanks [@dkozickis](https://github.com/dkozickis)! - GN-4692: Create a `besluit-topic` (decision topic) plugin

### Patch Changes

- [#425](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/425) [`69da05460e79b8cb4a5601d9d5f4eae3026c4da3`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/69da05460e79b8cb4a5601d9d5f4eae3026c4da3) Thanks [@dkozickis](https://github.com/dkozickis)! - Apply Prettier to the codebase

## 19.0.0

### Major Changes

- [`b9f7f56a469a18adbd75951e5ddd2a2f1cda7e45`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/b9f7f56a469a18adbd75951e5ddd2a2f1cda7e45) Thanks [@abeforgit](https://github.com/abeforgit)! - Use the selectNode argument instead of the helper

  The select-on-click helper was removed in 9.8.0 of the editor, and was arguably never really public API.

  This uses the replacement, a selectNode argument all ember-nodes receive.

  This is breaking cause it restricts the peerdep to at least 9.8.0.

## 18.1.1

### Patch Changes

- [`974469d3f16d045be14b6111cc1be9c251971609`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/974469d3f16d045be14b6111cc1be9c251971609) Thanks [@abeforgit](https://github.com/abeforgit)! - Fix peerdeps to avoid broken combo

  Version 9.8.0 of the editor removes a helper that's used in the number variable nodeview. We restrict the peerdep here so we avoid a broken combination of plugins + editor

## 18.1.0

### Minor Changes

- [#419](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/419) [`05c46c06c426141b73420c240834cdaf7e52a095`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/05c46c06c426141b73420c240834cdaf7e52a095) Thanks [@piemonkey](https://github.com/piemonkey)! - Add Snippet Placeholder component to signal the intended location for snippets to be inserted

### Patch Changes

- [`e2cdeff70e8364b643d10355fa9de55c5a078ede`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/e2cdeff70e8364b643d10355fa9de55c5a078ede) Thanks [@abeforgit](https://github.com/abeforgit)! - Fix template node lookup

  The template card could not determine it was already in a decision node, due to the attribute comparison function being passed the node instead of the node's attrs

## 18.0.0

### Major Changes

- [#420](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/420) [`8cfa3eb042960f64bfef611f7cf27bdf981a9453`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/8cfa3eb042960f64bfef611f7cf27bdf981a9453) Thanks [@dkozickis](https://github.com/dkozickis)! - ### RDFa aware editing

  This release adapts plugins
  to [RDFa (RDF in Attributes)](https://github.com/lblod/ember-rdfa-editor/blob/9c32a9dea0da13df4092c39d9a092ba0803a3f42/README.md#experimental-a-new-approach-to-handle-rdfa-in-documents)
  aware editing, based on the changes in `ember-rdfa-editor`
  version [9.6.0](https://github.com/lblod/ember-rdfa-editor/releases/tag/v9.6.0)

  #### N.B. This release is not compatible with `ember-rdfa-editor` configurations that don't use ` rdfaAware` features, see [editor documentation](https://github.com/lblod/ember-rdfa-editor/blob/9c32a9dea0da13df4092c39d9a092ba0803a3f42/README.md#experimental-a-new-approach-to-handle-rdfa-in-documents) for more.

  #### Changes

  - Plugins now use RDFa aware specs when rendering to HTML, and they also expect RDFa aware specs when parsing from HTML.
  - Introduces RDFa aware version of `snippet-plugin`, that allows to record allowed snippet list IDs on a resource node level in the document.

### Minor Changes

- [#357](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/357) [`6b3b926db2e30a133ac399bf1f079e161a910f23`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/6b3b926db2e30a133ac399bf1f079e161a910f23) Thanks [@piemonkey](https://github.com/piemonkey)! - - Addition of the `say-template-comment` class to the static version of template comments.

  - Addition of some extra styles to the `say-template-comment` class.

- [#369](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/369) [`8eb536dfc8985cc079b169182b0aab0ccb7e8727`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/8eb536dfc8985cc079b169182b0aab0ccb7e8727) Thanks [@dkozickis](https://github.com/dkozickis)! - GN-4650: Snippet selection placeholder in template

- [#357](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/357) [`8ca4edf3a3d57d21a32bbcb634a6250d87e3487a`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/8ca4edf3a3d57d21a32bbcb634a6250d87e3487a) Thanks [@piemonkey](https://github.com/piemonkey)! - Add helper function to help with locale selection and add translation note to readme

- [#392](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/392) [`d23e0bb9c8a76172e635124c0ce267c7070b4155`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/d23e0bb9c8a76172e635124c0ce267c7070b4155) Thanks [@elpoelma](https://github.com/elpoelma)! - Ensure that variables are node-selected/focused after insertion

### Patch Changes

- [#357](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/357) [`6b3b926db2e30a133ac399bf1f079e161a910f23`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/6b3b926db2e30a133ac399bf1f079e161a910f23) Thanks [@piemonkey](https://github.com/piemonkey)! - Remove `@import "ember-appuniversum"` statements from plugin sass modules in order to prevent style overrding.

- [#381](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/381) [`45913e187eaa1d5f575b225b279657372bba539f`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/45913e187eaa1d5f575b225b279657372bba539f) Thanks [@dkozickis](https://github.com/dkozickis)! - GN-4650: Fix behavior of "Insert snippet" button

- [#413](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/413) [`36de6ef2b2c79f1c9864fb53046d269b4eb46836`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/36de6ef2b2c79f1c9864fb53046d269b4eb46836) Thanks [@elpoelma](https://github.com/elpoelma)! - article-structure-plugin: Make `setStartNumber` and `getStartNumber` properties optional

- [#417](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/417) [`d0e97c9cef007ff964b0f4ab3dfa225d5a563e1d`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/d0e97c9cef007ff964b0f4ab3dfa225d5a563e1d) Thanks [@dkozickis](https://github.com/dkozickis)! - GN-4818: Add missing translations for date picker

- [#357](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/357) [`48858e8136ad10854600a729e4f493fc02f10b9c`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/48858e8136ad10854600a729e4f493fc02f10b9c) Thanks [@piemonkey](https://github.com/piemonkey)! - Fix template-comment padding

- [#408](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/408) [`fbe611679fca23b899b7f0b83e9bc5ca67f4945b`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/fbe611679fca23b899b7f0b83e9bc5ca67f4945b) Thanks [@dkozickis](https://github.com/dkozickis)! - Allow to insert structure even if insertion range does not have RDFA attributes.

## 17.1.1

### Patch Changes

- [#415](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/415) [`dff79133f9072cb1a817ed73588ffe8dea315479`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/dff79133f9072cb1a817ed73588ffe8dea315479) Thanks [@elpoelma](https://github.com/elpoelma)! - When passing a `content` argument to the `insertStructure` command, do not run the `wrapStructureContent` command

- [#416](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/416) [`4b40cafe3aee7846e44f0a5be7c5330ced28736e`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/4b40cafe3aee7846e44f0a5be7c5330ced28736e) Thanks [@dkozickis](https://github.com/dkozickis)! - GN-4816: Fix selecting snippet list when pressing on a checkbox

## 17.1.0

### Minor Changes

- [#411](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/411) [`aca238e`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/aca238ecc541f069b5df5c80a00481c6540b584f) Thanks [@dkozickis](https://github.com/dkozickis)! - GN-4811: Only show the titles of the snippets

  In the snippet insert modal: only show the titles of the snippets

- [#412](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/412) [`4ee0e95`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/4ee0e95c71d0cedce1f867058721ef3ea7d13f35) Thanks [@dkozickis](https://github.com/dkozickis)! - GN-4816: Add sorting for snippet lists

  - Use `AuDataTable`
  - Add sorting for snippet lists

## 17.0.0

### Major Changes

- [#407](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/407) [`f2a7660`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/f2a7660d32c6c54016c0547cd71e25ae239168a8) Thanks [@piemonkey](https://github.com/piemonkey)! - BREAKING: Update ember-appuniversum dependency to 3.4.1 in order to support the use of inline svg components for e.g. embeddable

### Minor Changes

- [#407](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/407) [`d4b8814`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/d4b8814df14a5f66354ce3948db898c928a658a7) Thanks [@piemonkey](https://github.com/piemonkey)! - Modernise typescript configuration

### Patch Changes

- [#407](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/407) [`f7d257b`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/f7d257bbc03e7b7f9375ade79a08f9e103e0c3df) Thanks [@piemonkey](https://github.com/piemonkey)! - Update deprecated use of AppUniversum

## 16.4.0

### Minor Changes

- [#404](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/404) [`9382c7f`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/9382c7f3e1c0e9495e2d9a7c21a58505653693b4) Thanks [@piemonkey](https://github.com/piemonkey)! - Add plugin to handle inserting worship services (erediensten)

## 16.3.0

### Minor Changes

- [#406](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/406) [`d07eb52`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/d07eb52f7be0c08ae5bb563d69020574f0931088) Thanks [@elpoelma](https://github.com/elpoelma)! - Drop support for `@lblod/ember-rdfa-editor` `10.x` range.
  This support was initially introduce to support `10.x` alpha releases of the editor.
  We managed to release the new editor version as a `9.x` minor release (and the `10.x` releases are thus obsolete).

## 16.2.0

### Minor Changes

- [#386](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/386) [`83becf142951f09a3cef68a27ae1a23ed141a2ad`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/83becf142951f09a3cef68a27ae1a23ed141a2ad) Thanks [@elpoelma](https://github.com/elpoelma)! - Simplify label of template-comments from 'Toelichtings- en voorbeeldbepaling' to 'Toelichting'

### Patch Changes

- [#401](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/401) [`3a1cd544608a272a1c228b42c67fc44b6d856bc3`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/3a1cd544608a272a1c228b42c67fc44b6d856bc3) Thanks [@elpoelma](https://github.com/elpoelma)! - Add title attribute to table-of-contents toggle

- [#402](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/402) [`cb204915559bfd3a61e6104ac4cbb80652c36f44`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/cb204915559bfd3a61e6104ac4cbb80652c36f44) Thanks [@piemonkey](https://github.com/piemonkey)! - Widen support for ember-rdfa-editor to include upcoming v10

- [#401](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/401) [`31415d8bccfa0525af047d9f126c18f8574a2413`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/31415d8bccfa0525af047d9f126c18f8574a2413) Thanks [@elpoelma](https://github.com/elpoelma)! - Add title attribute to decision-type selector

## 16.1.0

### Minor Changes

- [#377](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/377) [`c383236`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/c38323626745e55671bcbc2afc01d91b17911dd3) Thanks [@elpoelma](https://github.com/elpoelma)! - - Addition of the `say-template-comment` class to the static version of template comments.

  - Addition of some extra styles to the `say-template-comment` class.

- [#378](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/378) [`7b53e51`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/7b53e514aac79286267da1f7f32b7179fea3fb7d) Thanks [@elpoelma](https://github.com/elpoelma)! - Add helper function to help with locale selection and add translation note to readme

- [#376](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/376) [`301b4b3`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/301b4b3a9288ce53f7be4117e95526bf73be1534) Thanks [@dkozickis](https://github.com/dkozickis)! - GN-4650: Allows to set a "start number" for a structure.

### Patch Changes

- [#377](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/377) [`c383236`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/c38323626745e55671bcbc2afc01d91b17911dd3) Thanks [@elpoelma](https://github.com/elpoelma)! - Remove `@import "ember-appuniversum"` statements from plugin sass modules in order to prevent style overrding.

- [`4ddf16c`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/4ddf16c91959d77fda1cd7b033f7ca18d2857b70) Thanks [@elpoelma](https://github.com/elpoelma)! - Fix template-comment padding

## 16.0.1

### Patch Changes

- [#375](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/375) [`93d3f7b`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/93d3f7b63bc0e720e9f6f328ffa9a384947ca31f) Thanks [@elpoelma](https://github.com/elpoelma)! - Widen support for `ember-intl` to include version 5.7.2 due to outstanding issues with the 6.x releases.

## 16.0.0

### Major Changes

- [#371](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/371) [`ed260b7`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/ed260b7e674fec5a5fe2829eeba5ce9a1778bc9e) Thanks [@elpoelma](https://github.com/elpoelma)! - Stricten `ember-concurrency` peerdep to `^2.3.7 || ^3.1.0`

- [#374](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/374) [`e726eb5`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/e726eb521229aedb574dbaf1cbb7a5b98d712d01) Thanks [@elpoelma](https://github.com/elpoelma)! - Restrict `@lblod/ember-rdfa-editor` peerdep to `^9.0.0`

- [#372](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/372) [`55e871b`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/55e871b554cc13edc97c7cae5502bb8c4db4623d) Thanks [@elpoelma](https://github.com/elpoelma)! - Drop `ember-source` 4.8.x support.
  The supported `ember-source` version range is now `^4.12.0`

- [`c066646`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/c066646f144f7ee4b36cfa67e5d689df57b4f03a) Thanks [@elpoelma](https://github.com/elpoelma)! - Add `ember-intl` `^6.1.0` to peerdependencies

- [#370](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/370) [`cb6c311`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/cb6c311f650e3081a153fb6582a2a278d4be9177) Thanks [@elpoelma](https://github.com/elpoelma)! - Increase `@appuniversum/ember-appuniversum` peerdependency requirement to `^2.15.0`

## 15.2.2

### Patch Changes

- [#364](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/364) [`0cf1600`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/0cf160031bfc27ce84fd34d532654b74269ceed8) Thanks [@piemonkey](https://github.com/piemonkey)! - Improve styling of redacted text

## 15.2.1

### Patch Changes

- [`763d762`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/763d76255bcee0fe9cf7be9472c2120793cad277) Thanks [@dkozickis](https://github.com/dkozickis)! - Bump editor version

## 15.2.0

### Minor Changes

- [#362](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/362) [`47f2337`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/47f233767cd5f6169e2d4b8a3c71619d0718c035) Thanks [@piemonkey](https://github.com/piemonkey)! - Add incredibly small plugin for highlighting text as redacted

## 15.1.0

### Minor Changes

- [#343](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/343) [`e9b428c`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/e9b428cdffca32164ce9f2c03540dd5ad6a9ba19) Thanks [@dkozickis](https://github.com/dkozickis)! - GN-4130: Move styles for `data-editor-highlight`

  Styles that were applied to elements with the `data-editor-highlight` attribute (used by `citation-plugin`) moved from
  [editor repository](https://github.com/lblod/ember-rdfa-editor/pull/1013) to this repo as part of the `citation-plugin`.

- [#351](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/351) [`f6fa933`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/f6fa933569a70c3cc0f7d4348c4c8a121b77cd1f) Thanks [@elpoelma](https://github.com/elpoelma)! - Remove explicit creation of `rdfa-id` attributes

### Patch Changes

- [`83cc1ae`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/83cc1ae8b3bba280aa001566e7d77109a2d43170) Thanks [@abeforgit](https://github.com/abeforgit)! - bump peerdep to allow editor v7

## 15.0.0

### Major Changes

- [#323](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/323) [`5bedaab`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/5bedaabb7efa05626012333e63095671309e9f97) Thanks [@elpoelma](https://github.com/elpoelma)! - Remove usage of `component` helper in preparation of embroider-compatibility.

  This removal also causes a change in the variable-plugin insert-component API, the insert-components now need to be passed directly (instead of their path).

  Before:

  ```typescript
  get variableTypes(): VariableConfig[] {
    return [
      {
        label: 'text',
        component: {
          path: 'variable-plugin/text/insert',
        },
      },
      {
        label: 'location',
        component: {
          path: 'variable-plugin/location/insert',
          options: {
            endpoint: 'https://dev.roadsigns.lblod.info/sparql',
          },
        },
      },
    ];
  }
  ```

  After:

  ```typescript
  import TextVariableInsertComponent from '@lblod/ember-rdfa-editor-lblod-plugins/components/variable-plugin/text/insert';
  import LocationInsertComponent from '@lblod/ember-rdfa-editor-lblod-plugins/components/variable-plugin/location/insert';
  ...
  get variableTypes() {
    return [
      {
        label: 'text',
        component: TextVariableInsertComponent,
      },
      {
        label: 'location',
        component: LocationInsertComponent,
        options: {
          endpoint: 'https://dev.roadsigns.lblod.info/sparql',
        },
      },
    ];
  }
  ```

- [#333](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/333) [`04ea965`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/04ea96580189ee0a9440fe77618b8b2c1d9941a5) Thanks [@elpoelma](https://github.com/elpoelma)! - Drop support for ember 3.28
  The minimum required version of `ember-source` is now 4.8.0.
  The 5.x range remains untested.

### Minor Changes

- [#332](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/332) [`cf7082f`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/cf7082fdd89c862936276cfb562a0a07e5a49c4b) Thanks [@elpoelma](https://github.com/elpoelma)! - Expose a Webpack config for Embroidered apps

- [#332](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/332) [`cf7082f`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/cf7082fdd89c862936276cfb562a0a07e5a49c4b) Thanks [@elpoelma](https://github.com/elpoelma)! - Specify `@ember/string` 3.x as a peerdep

- [#334](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/334) [`fd271a1`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/fd271a1dd9b32e4081707ea416f35be70f57aa30) Thanks [@elpoelma](https://github.com/elpoelma)! - Add support for the ember-concurrency 3.x range

- [#332](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/332) [`cf7082f`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/cf7082fdd89c862936276cfb562a0a07e5a49c4b) Thanks [@elpoelma](https://github.com/elpoelma)! - Specify `ember-power-select` 6.x|7.x as a peerdep

- [#325](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/325) [`4c402d2`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/4c402d21f6e45a03436fd5155bb508ce6c3fb091) Thanks [@elpoelma](https://github.com/elpoelma)! - Remove redundant types for `string-set` ember-data transform

- [#324](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/324) [`95634ed`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/95634eda12927736fa16945ff85b80876b7c0058) Thanks [@elpoelma](https://github.com/elpoelma)! - Remove direct usages of aulist::item in order to ensure compatibility with `@appuniversum/ember-appuniversum` 2.16.0

- [#325](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/325) [`4c402d2`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/4c402d21f6e45a03436fd5155bb508ce6c3fb091) Thanks [@elpoelma](https://github.com/elpoelma)! - Fix internal types for tracked-toolbox

### Patch Changes

- [#331](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/331) [`910ec85`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/910ec8596b602a0ff408da0fcec4222ad81fb75a) Thanks [@piemonkey](https://github.com/piemonkey)! - Small internal changes to allow for embroider builds

## 14.2.0

### Minor Changes

- [#322](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/322) [`a168dc5`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/a168dc54b5ddc0a4a5b3bf8c521ccb914bb91b7a) Thanks [@x-m-el](https://github.com/x-m-el)! - For article-structure plugin

  - The `StructureSpec`'s `constructor` now also contains the optional argument `state` (an EditorState)
  - The existing structures' placeholders are translated using the document language
    - This is only the case if emberApplication plugin is configured.
      **Recommended change**: activate emberApplication plugin
    - Will fallback to translating based on browser locale (=old logic) if emberApplication plugin is not configured

- [#322](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/322) [`690738f`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/690738f56692555880c5ad29c25c76f400a48bcb) Thanks [@x-m-el](https://github.com/x-m-el)! - For decision-plugin and standard-template-plugin

  Make use of `state` argument to translate placeholders based on document language instead of browser locale
  Depending on the place where placeholders are defined either of the following logic happens:

  - will always use document language
  - will use document language if emberApplication plugin is active. If not, defaults to browser locale (like before)

### Patch Changes

- [#322](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/322) [`5ceca68`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/5ceca68ec271477dfcf75c7d9fba35c21880642e) Thanks [@x-m-el](https://github.com/x-m-el)! - Using "show as words" for a number variable will convert the number to a string in the language in the document, instead of always showing Dutch.

## 14.1.0

### Minor Changes

- [#315](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/315) [`01163d8`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/01163d8d45b801a50728b9aeabaf0e52a1cf9a33) Thanks [@piemonkey](https://github.com/piemonkey)! - Export standard-template-plugin's uuid instantiation function

### Patch Changes

- [#317](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/317) [`1d28bc9`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/1d28bc9b9b0e07e8eb5698988dfe0e3dd946c2a3) Thanks [@dkozickis](https://github.com/dkozickis)! - GN-4538: Display correctly that there are no streets when searching in the address plugin

- [#316](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/316) [`e109035`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/e109035809df341ede0a03fb0b146909883903ef) Thanks [@x-m-el](https://github.com/x-m-el)! - - Bugfix: `allowCustomFormat` for rdfa-date variable will now disable custom formats if set to false.
  - No changes for old documents: date variables in old documents will allow custom formats, which is the default.

## 14.0.0

### Major Changes

- [#314](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/314) [`a4402a0`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/a4402a0eb3acc4b7184ed362451875a6cf43be76) Thanks [@piemonkey](https://github.com/piemonkey)! - Remove Current Session Service from plugins, now classificatie uri needs to be passed in to the besluit-type plugin

- [#313](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/313) [`d4127ce`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/d4127cece3424051447b0b3407202f0f05f23512) Thanks [@piemonkey](https://github.com/piemonkey)! - Breaking change: Standard Template plugin now requires a list of templates to be passed in.
  No depends on ember-data.

### Patch Changes

- [#309](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/309) [`679b030`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/679b030539d5b604e5eaa4276a4e3d966998fc3f) Thanks [@dkozickis](https://github.com/dkozickis)! - GN-4539: Rename `besluit` to `gemeentebesluit`

- [#310](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/310) [`b07035f`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/b07035f8568ea397a5ed6514701ebedb284078b9) Thanks [@dkozickis](https://github.com/dkozickis)! - GN-4501: Fail gracefully when house number does not exist

  When house number does not exist provide user with an alternative of inserting
  address with just the street information.

- [#309](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/309) [`679b030`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/679b030539d5b604e5eaa4276a4e3d966998fc3f) Thanks [@dkozickis](https://github.com/dkozickis)! - GN-4539: Rename references to `decision` in Citation plugin

  Instead of using `decision` use `legalDocument` in Citation plugin, to not confuse with `besluit` usage (which also means "decision" in Flemish).

- [#311](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/311) [`bb8eee6`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/bb8eee6f60acaae7c243b85a30979137757ba1dc) Thanks [@dkozickis](https://github.com/dkozickis)! - GN-4544: Decision title sometimes is not present from public decisions query

- [#308](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/308) [`39f3105`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/39f31053b59a5077c9a118431154c6d766f494eb) Thanks [@dkozickis](https://github.com/dkozickis)! - GN-4534: Citation insert card filter enhancement

- [#307](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/307) [`03ab824`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/03ab824d7dbe3eab6a86b6b0aa6c99a27d9fbeee) Thanks [@elpoelma](https://github.com/elpoelma)! - Allow municipality and street fields of address-variable to be cleared when editing

- [#312](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/312) [`52420c6`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/52420c62846b18532b1d87b8d746c201ac1be408) Thanks [@elpoelma](https://github.com/elpoelma)! - reset address-edit input fields when `currentAddress` property changes

## 13.0.0

### Major Changes

- [#304](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/304) [`d52be6c`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/d52be6c70c30e81dffdbf14f91e140d3fc1b5e7e) Thanks [@elpoelma](https://github.com/elpoelma)! - Merge rdfa-date plugin into variable plugin

  Breaking changes:

  - Rename of variable date insert component from `VariablePlugin::Date::Insert` to `VariablePlugin::Date::InsertVariable`
  - Rename of standalone date insert component from `RdfaDatePlugin::Insert` to `VariablePlugin::Date::Insert`
  - Removal of `RdfaDatePlugin::Card` component, replaced by `VariablePlugin::Date::Edit` component
  - Removal of `RdfaDatePlugin::Date` component, replace by `VariablePlugin::Date::Nodeview` component
  - Removal of `RdfaDatePlugin::DateTimePicker` component, replaced by `VariablePlugin::Date::DateTimePicker` component
  - Removal of `RdfaDatePlugin::HelpModal` component, replaced by `VariablePlugin::Date::HelpModal` component
  - The `date` node-spec and `dateView` node-view should now be imported from `@lblod/ember-rdfa-editor-lblod-plugins/plugins/variable-plugin/variables`

- [#297](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/297) [`30aad4d`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/30aad4df3fc45c37d985dc76d955ed051fc837b2) Thanks [@dkozickis](https://github.com/dkozickis)! - Internationalization of variable plugins using document language

  Breaking: date plugins does not accept `placeholder` config anymore, the plugin won't break
  if the config is still present, but it will be ignored.

- [#303](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/303) [`80f92d2`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/80f92d293404883871b7ac4e9ab4175d5deb8b46) Thanks [@elpoelma](https://github.com/elpoelma)! - Addition of @glint/template to peerDependencies

- [#303](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/303) [`80f92d2`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/80f92d293404883871b7ac4e9ab4175d5deb8b46) Thanks [@elpoelma](https://github.com/elpoelma)! - Update @lblod/ember-rdfa-editor to 6.0.0 and increase peerdependency requirement to ^6.0.0

### Patch Changes

- [#302](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/302) [`90b5d1a`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/90b5d1a8e1b25f944305445eb653a11bf463fa6e) Thanks [@dkozickis](https://github.com/dkozickis)! - GN-4517: Reduce possible CSS conflicts

## 12.1.0

### Minor Changes

- [#286](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/286) [`955535b`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/955535b4d99d729b40f0e01bf1c634042894bf60) Thanks [@dkozickis](https://github.com/dkozickis)! - GN-4266: Referring to published decisions - filter by government name

- [#299](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/299) [`3732e50`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/3732e5041df3d3e994df34de9dd436f59f7bade0) Thanks [@x-m-el](https://github.com/x-m-el)! - Update readme documentation for RDFa date and Table of Contents plugin to include explanation about their configurations

- [#290](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/290) [`8c1ad72`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/8c1ad729b0eb1a159637d3ed9f3b49a02a659a96) Thanks [@elpoelma](https://github.com/elpoelma)! - Add support for address variables inside location variables

- [#296](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/296) [`bcf7a2d`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/bcf7a2d7314dfd1156ca1e310d5c15d1d2c2fbfe) Thanks [@abeforgit](https://github.com/abeforgit)! - bump ember and ember data to 4.12 for development, and add correct peerdep specification for consumers

- [#298](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/298) [`2908aa3`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/2908aa355b6dadc694ee90fd93ad2e79faa22257) Thanks [@x-m-el](https://github.com/x-m-el)! - Added a second address insert `variable-plugin/address/insert-variable`. This replaces the `insert` from before when used inside the `insert-variable-card` dropdown.

  - same UI as other variables
  - allows using a custom label

## 12.0.0

### Major Changes

- [#289](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/289) [`d1e2af1`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/d1e2af14bab0eb4ed6e1d7d62a5c55e396c707ce) Thanks [@elpoelma](https://github.com/elpoelma)! - refactor number-variable: component now uses modifiers for keyboard navigation (arrow keys and enter)
  Breaking: This needs at least ember-rdfa-editor 5.3.0 to work.

### Patch Changes

- fixed compat with 3.28 by importing inject as service

- got rid of all uses of ember/string

- [#289](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/289) [`d1e2af1`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/d1e2af14bab0eb4ed6e1d7d62a5c55e396c707ce) Thanks [@elpoelma](https://github.com/elpoelma)! - switch to changesets for changelog management

- [#289](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/289) [`d1e2af1`](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/commit/d1e2af14bab0eb4ed6e1d7d62a5c55e396c707ce) Thanks [@elpoelma](https://github.com/elpoelma)! - Bumps `@lblod/ember-rdfa-editor` from 5.2.0 to 5.3.0

## [11.3.0] - 2023-09-06

### Changed

- CI: move changelog check to separate CI pipeline

### Added

- GN-4266: Referring to published decisions

## [11.2.0] - 2023-09-04

### Added

- ember-modifier is now explicitly a peerDependency
- GN4470: ability to specify single/multi-select per codelist instance

## [11.1.0] - 2023-08-29

### Fixed

- GN-4370: Do not allow header nodes to be split by table
- Grey out Generic RDFA button in embedded view
- GN-4425: Smarter content wrapping for structure nodes

### Changed

- GN-4442: template comments can move up and down over the _whole_ document
- GN-4322: Add ORDER to snippet list query
- Bumps `@lblod/ember-rdfa-editor` from 5.1.0 to 5.2.0

## [11.0.0] - 2023-08-22

### Added

- GN-4261: addition of an address variable
- GN-4262: addition of WGS84 coordinates to address variables
- Introduce internationalization in the table of contents node based on the document language.
- The whole table of contents node (include its entries) is now exported in its `serialize` method without the need of an `entries` attribute.
- GN-4461: update readme to specify needed imports for template comment
- Check validity on number minimum/maximum inputs

### Changed

- GN-4263: update address variable edit UI/UX according to updated design
- Allow the address municipality-edit field to be prefilled
- Use one-way-binding in variable label input
- Use one-way-binding in number variable inputs
- Manage snippet list connection with template

### Fixed

- GN-4404: ensure number-variable placeholders are consistent

### Breaking

- Removal of old address-plugin
- Removal of the `entries` attribute from the table-of-contents prosemirror node. The node can now generate it's own outline in its `serialize` method.

### Dependencies

- Bumps `@codemirror/view` from 6.12.0 to 6.16.0
- Bumps `@lblod/ember-rdfa-editor` from 4.2.0 to 5.1.0

## [10.0.0] - 2023-08-08

### Changed

- remove unused code from template comment component
- remove allowedTypes from indentation menu
- allow normal type of paragraphs (=can have italic mark) in template comments

### Dependencies

- Bumps `@embroider/test-setup` from 1.8.3 to 3.0.1
- Bumps `@types/ember__application` from 4.0.4 to 4.0.6
- Bumps `webpack` from 5.76.0 to 5.88.2
- Bumps `@types/ember__component` from 4.0.11 to 4.0.14

### Fixed

- Allow `block*` content in `article_paragraph`
- Move buttons for template comments are blue
- problems with lists in template comments
- GN-4451: fix roadsign plugin no longer showing rendered templates in modal (merge hotfix v8.4.3)
- Snippet insertion inserts first node correctly
- Enable no-bare-strings rule and update translations where needed

### Added

- Addition of `variable` group to each variable node-spec.

### Breaking

#### Major rework of variable plugin

- Removal of generic `variable` node-spec. This node-spec is now replaced by domain-specific `text_variable`, `number`, `date`, `location` and `codelist` node-specs. These new node-specs each have their corresponding node-view.
- Rework of the `insert-variable-card` component: this component is only a wrapper which lets you select a variable type. It then shows the insert component corresponding to that variable type. You can configure the `insert-variable-card` with a list of variable types and their corresponding insert component. Each variable type (text, number, date, codelist and location) now has a seperate insert component defined.
- Removal of the `template-variable-card` component. This component has been replaced by two edit components for both the `location` and `codelist` variables.
- Removal of `DEFAULT_VARIABLE_TYPES`. The insertion of the variable types are now handled by the insert components of the different variable types.

## [9.1.1] - 2023-08-02

### Fixed

- GN-4446: fix email-address formatting in error components

### Dependencies

- Bumps `@types/uuid` from 9.0.0 to 9.0.2
- Bumps `@types/rdf-validate-shacl` from 0.4.0 to 0.4.2
- Bumps `@types/ember__polyfills` from 4.0.1 to 4.0.2

## [8.4.3] - 2023-08-07

### Fixed

- GN-4451: fix roadsign plugin no longer showing rendered templates in modal

## [8.4.2] - 2023-08-02

### Fixed

- GN-4446: fix email-address formatting in error components

## [9.1.0] - 2023-07-29

### Added

- template-comments plugin
  - A plugin to insert and edit template comments (as a "block")
  - can be inserted anywhere
  - have a specific rdfa-attribute so they can be removed at publishing

## [9.0.2] - 2023-07-28

### Dependencies

- Bumps `release-it` from 15.5.0 to 15.11.0
- Bumps `@codemirror/lang-html` from 6.4.3 to 6.4.5
- Bumps `@types/ember-data__model` from 4.0.0 to 4.0.1
- Bumps `eslint-plugin-ember` from 11.9.0 to 11.10.0
- Bumps `@types/ember__runloop` from 4.0.2 to 4.0.3

### Fixed

- Snippet insertion accounts for wrapping document

## [9.0.1] - 2023-07-24

### Changed

- Update docker build to serve static files

## [9.0.0] - 2023-07-24

### Added

- Addition of documentation on the article-structure plugin

### Fixed

- When a number is too big to be converted to words, display it numerically.
- Can only insert a number variable with a minimum that is smaller than its maximum
- Fetch public snippets

### Changed

- Make `errorMessage` of number input modal reactive to attribute changes
- Number variable input box has a cleaner UI by adjusting the top margins.
- Demo uses `initialize` and `docWithConfig` introduced in `ember-rdfa-editor@4.0.0`

### Dependencies

- Bumps `@lblod/ember-rdfa-editor` from 3.10.0 to 4.0.0
- Bumps `@typescript-eslint/parser` from 5.60.0 to 5.61.0
- Bumps `@tsconfig/ember` from 1.0.1 to 3.0.0
- Bumps `fetch-sparql-endpoint` from 3.1.1 to 3.3.3
- Bumps `eslint` from 7.32.0 to 8.44.0
- Bumps `semver` from 5.7.1 to 5.7.2
- Bumps `prettier` from 2.8.8 to 3.0.0
- Bumps `eslint-plugin-prettier` to 5.0.0
- Bumps `@types/ember__utils` from 4.0.2 to 4.0.3
- Bumps `@types/ember__controller` from 4.0.3 to 4.0.5
- Bumps `tracked-built-ins` from 3.1.0 to 3.1.1
- Bumps `word-wrap` from 1.2.3 to 1.2.4
- Pin `ember-auto-import` to 2.5.x

## [8.4.1] - 2023-07-06

### Fixed

- Fixed compatibility issue with ember 3.28 in number variable component

## [8.4.0] - 2023-07-06

### Changed

- revert editor bump to 4.0.0, bump to 3.10.0 instead
- Addition of document-title plugin

## [8.3.0] - 2023-07-06

### Added

- Insert the snippet
- Addition of a precompile step to woodpecker PR check

### Fixed

- fix type error due to bad tsconfig

### Changed

- Woodpecker: do not run changelog-check when PR contains `dependabot` label
- Made the number variable also show placeholders
- Extract SPARQL query tools

### Dependencies

- Bumps `@types/rdfjs__data-model` from 2.0.1 to 2.0.4
- Bumps `eslint-plugin-ember` from 11.4.6 to 11.9.0
- Bumps `@typescript-eslint/eslint-plugin` from 5.45.0 to 5.60.1
- Bumps `ember-velcro` to 2.1.0
- Bumps `@lblod/ember-rdfa-editor` to 4.0.0
- Bumps `ember-resources` from 5.6.2 to 6.1.1

## [8.2.2] - 2023-06-28

### Fixed

- Fix code filtering of roadsign regulation plugin

## [8.2.1] - 2023-06-28

### Fixed

- GN-4200: Fixed bug with TOC scroll in GN and RB

### Dependencies

- Bump `date-fns` from 2.29.3 to 2.30.0

## [8.2.0] - 2023-06-26

### Added

- Add a toggle to show the number as words in a number variable

### Dependencies

- Bumps `sass` from 1.56.1 to 1.63.6
- Bumps `@types/ember` from 4.0.2 to 4.0.4
- Bumps `@types/ember-data__store` from 4.0.2 to 4.0.3
- Bumps `@types/ember__template` from 4.0.1 to 4.0.2
- Bumps `@types/rdfjs__parser-n3` from 1.1.5 to 2.0.1

## [8.1.0] - 2023-06-22

### Added

- Numbers inputted into a number variable are validated on defined min/max and if it is a number
- Add toggle for the user to show number variable as words

### Fixed

- Fixed woodpecker builds crashing on syntax errors
- Use dutch language in static version of table of contents
- fix typo "Vlaams Codex" → "Vlaamse Codex"
- add missing argument to citation card in dummy app
- correct erroneous arguments to AuAlert

### Changed

- remove the unnecessary type and add the html-safe tag at the rendering site

### Removed

- remove ensure-changelog github action

### Dependencies

- Bumps `@types/rdfjs__dataset` from 2.0.0 to 2.0.2
- Bumps `@types/ember__array` from 4.0.3 to 4.0.4
- Bumps `@typescript-eslint/parser` from 5.45.0 to 5.60.0
- Bumps `@types/ember__engine` from 4.0.4 to 4.0.5
- Bumps `typescript` to 5.0.4
- Bumps `prosemirror-dev-tools` from 3.1.0 to 4.0.0

## [8.0.1] - 2023-06-15

### Fixed

- Change problematic type in citation that made it to break with new ember

## [8.0.0] - 2023-06-15

### Fixed

- Bump `@lblod/ember-rdfa-editor` package to fix annotation not present for some structures
- Change variable label to be stored in the data-attributes and solve bug with date not getting a default label

### Added

- navigation links in TOC of readme
- support for option labels in Variable-plugin
- Generic rdfa variables input plugin - HTML only input
- Number variable - support min/max

### Breaking

- Add label to variables

### Dependencies

- Bumps `webpack` from 5.75.0 to 5.76.0
- Move `tracked-toolbox` to dependencies
- Bumps `prettier` from 2.8.0 to 2.8.8
- Bumps `minimist` from 0.2.2 to 0.2.4
- Bumps `socket.io-parser` from 4.2.1 to 4.2.4
- Bumps `decode-uri-component` from 0.2.0 to 0.2.2
- Bumps loader-utils from 1.0.4 to 2.0.4
- Bumps handlebars-loader from 1.7.2 to 1.7.3

## [7.1.0] - 2023-05-18

### Added

- validate motivering and article section

## [7.0.0] - 2023-05-17

### Added

- add docker build for easy demo environments

### Change

- BREAKING: Endpoint config for `CitationPlugin`

### Fixed

- Remove structure doesn't always work - disable the "Remove <structure>" button correctly
- Fix initialization of default date properties

### Fixed

## [6.1.0] - 2023-05-11

### Added

- make static TOC look the same in dynamic content

## [6.0.0] - 2023-05-05

### Changed

- Use plugin configuration instead of ember environment in all the plugins
- Insert address plugin

### Added

- validation plugin
- Enable Firefox cursor fix for variables

### Deprecated

- the decision-plugin card component is now deprecated in favor of the host app's choice of insert button

## [5.0.1] - 2023-04-07

### Fixed

- fix deprecated use of modifier without specifying eagerness
- add missing translations
- make application route in dummy app a javascript file to avoid [issues](https://github.com/typed-ember/ember-cli-typescript/issues/780)

## [5.0.0] - 2023-04-07

### Added

- add a hover-tooltip utility component
- docs: add tooltips to the remove structure buttons

### Changed

- Change date labels based on designer feedback
- split out structure removal card into two buttons

### Fixed

- BREAKING: Rename decision title node from title to besluit_title to avoid conflicts
- properly initialize ember-intl

## [4.0.2] - 2023-04-04

### Fixed

- Prevent decision nodes regenerating when (de)serializing
- Ensure editor is focused after inserting a citation
- fix(citation): make plugin trigger correctly when `doc` is passed as an allowed nodeType

### Added

- docs: add examples on how to enable the citation plugin for the entire document

## [4.0.1] - 2023-03-27

### Dependencies

- bump `ember-rdfa-editor` to v3.4.1

## [4.0.0] - 2023-03-27

### Fixed

- Ensure citation suggestions are only updated when search-text or document-legislation-type updates.

### Changed

- Feature: make citation use the new link node
- BREAKING: citation mark has been removed
- Table of contents now is able to be inserted in the corresponding place instead of always being inserted at position 0
- Change paragraph symbol to §
- Update schema on dummy page to make articles insertable in empty document
- Add padding to structure card
- Placeholder text when inserting date
- Feature/improve toc scroll

### Removed:

- Removal of prosemirror-plugin dependency of `CitationPlugin::CitationInsert` component.

### Dependencies

- bump `ember-rdfa-editor` to v3.4.0

## [3.1.0] - 2023-03-02

### Fixed

- Article paragraph numbering is no longer continuous
- Fixed white-space issue in variables

### Changed

- Use `AuModalContainer` component instead of #ember-appuniversum-wormhole element in dummy app
- Improved documentation of the plugins

### Dependencies

- bump `ember-rdfa-editor` to v3.3.0

## [3.0.0] - 2023-02-27

### Changed

- Feature/allow paragraphs inside article paragraphs
- Set selectable on false for structure-headers
- BREAKING: the argument structure of plugin components has changed. `widgetArgs` is no longer in use, it's properties are now direct properties of the component `args`.

### Added

- Added a new option to the structures to not support unwrap and made the article paragraphs the first structure to use this option

### Fixed

- fix translation warnings

### Removed

- Remove insert date and time as it's no longer needed

### Dependencies

- Bumps `ember-power-select` to 6.0.1
- Bumps `ember-source` to 4.8.4
- Bumps `@lblod/ember-rdfa-editor` to 3.2.0

## [2.1.2] - 2023-02-15

### Fixed

- fixed subsection 'move down' dutch translation
- Hotfix: use content attribute as a fallback to extract the codelist URI

## [2.1.1] - 2023-02-07

### Changed

- move to keep-a-changelog for changelog management
- bump editor to v2.1.2
- bump editor to v2.1.1

### Added

- add types for the `debug` lib

### Fixed

- correctly set the date type as xsd:date or xsd:dateTime based on the date content
- Add the \_\_rdfaId when manually creating decisions titles, decision articles or citations
- fix citation highlights not triggering correctly in various situations

## [2.1.0] - 2023-02-06

#### :rocket: Enhancement

- [#98](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/98) Improve citation plugin regex and improve
  citation type matching ([@elpoelma](https://github.com/elpoelma))

#### :bug: Bug Fix

- [#96](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/96) Fix insert-citation button not being enabled
  in correct context. ([@elpoelma](https://github.com/elpoelma))
- [#100](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/100) Prevent splitting of besluit related nodes ([@elpoelma](https://github.com/elpoelma))
- [#97](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/97) Fix: disallow splitting of besluit node ([@elpoelma](https://github.com/elpoelma))

#### :house: Internal

- [#99](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/99) Update editor to 2.1.0 ([@elpoelma](https://github.com/elpoelma))

#### Committers: 1

- Elena Poelman ([@elpoelma](https://github.com/elpoelma))

## 2.0.1 (2023-02-06)

#### :bug: Bug Fix

- [#95](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/95) Move ember-velcro to hard dependencies ([@elpoelma](https://github.com/elpoelma))

#### Committers: 1

- Elena Poelman ([@elpoelma](https://github.com/elpoelma))

## 2.0.0 (2023-02-06)

version-only bump to match editor major cycle

## 1.0.0 (2023-02-06)

#### :boom: Breaking Change

- [#94](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/94) feat(dates): add nice error messages to custom format box ([@abeforgit](https://github.com/abeforgit))

#### :rocket: Enhancement

- [#94](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/94) feat(dates): add nice error messages to custom format box ([@abeforgit](https://github.com/abeforgit))
- [#93](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/93) Make headers and content nodes of structures isolating and defining ([@elpoelma](https://github.com/elpoelma))
- [#74](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/74) Feature/recreate uuids on paste ([@lagartoverde](https://github.com/lagartoverde))
- [#90](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/90) show error when the date format is empty ([@lagartoverde](https://github.com/lagartoverde))

#### :house: Internal

- [#92](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/92) Update editor to 2.0.1 ([@elpoelma](https://github.com/elpoelma))

#### Committers: 3

- Arne Bertrand ([@abeforgit](https://github.com/abeforgit))
- Elena Poelman ([@elpoelma](https://github.com/elpoelma))
- Oscar Rodriguez Villalobos ([@lagartoverde](https://github.com/lagartoverde))

## 1.0.0-beta.8 (2023-01-26)

#### :house: Internal

- [#83](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/83) Update editor to 1.0.0 ([@elpoelma](https://github.com/elpoelma))

#### Committers: 1

- Elena Poelman ([@elpoelma](https://github.com/elpoelma))

## 1.0.0-beta.7 (2023-01-25)

#### :bug: Bug Fix

- [#82](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/82) Add typeof and property to article_paragraph attrs ([@elpoelma](https://github.com/elpoelma))

#### Committers: 1

- Elena Poelman ([@elpoelma](https://github.com/elpoelma))

## 1.0.0-beta.6 (2023-01-25)

#### :bug: Bug Fix

- [#81](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/81) Wrap-structure-content: return false if structure is not a wrapper ([@elpoelma](https://github.com/elpoelma))

#### Committers: 1

- Elena Poelman ([@elpoelma](https://github.com/elpoelma))

## 1.0.0-beta.5 (2023-01-25)

- chore(deps): update editor to beta 7 (ef72b82)
- Merge pull request #80 (d76dd89)
- Merge pull request #79 (69a5c62)
- Merge pull request #78 (fc68bf5)
- fix(decision-type): remove the old type before adding the new one (701ad87)
- fix(template): improve insertion behavior of standard templates (96cba5c)
- fix(nodes): make important nodes defining (5534c00)
- fix(nodes): make title node also parse on other header levels (9229677)

## 1.0.0-beta.4 (2023-01-24)

#### :bug: Bug Fix

- [#72](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/72) Enable word-break as break-all on variable contenteditable ([@elpoelma](https://github.com/elpoelma))
- [#71](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/71) Avoid writing out p tags for nodes different than paragraph ([@elpoelma](https://github.com/elpoelma))

#### :house: Internal

- [#73](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/73) Make besluit title optional ([@elpoelma](https://github.com/elpoelma))

#### Committers: 1

- Elena Poelman ([@elpoelma](https://github.com/elpoelma))

## 1.0.0-beta.3 (2023-01-23)

add onclick handler to pencil icon in variable plugin

## 1.0.0-beta.2 (2023-01-23)

#### :boom: Breaking Change

- [#67](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/67) New version of the variable plugin ([@elpoelma](https://github.com/elpoelma))
- [#62](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/62) feat(citation): make citation plugin datastore-independent ([@abeforgit](https://github.com/abeforgit))

#### :rocket: Enhancement

- [#69](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/69) Add enter handler to variable editor view ([@elpoelma](https://github.com/elpoelma))
- [#66](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/66) make the template plugin independent of the datastore ([@abeforgit](https://github.com/abeforgit))
- [#43](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/43) Feature/template nodes ([@lagartoverde](https://github.com/lagartoverde))
- [#62](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/62) feat(citation): make citation plugin datastore-independent ([@abeforgit](https://github.com/abeforgit))
- [#49](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/49) Avoid using the datastore on the besluit type plugin ([@lagartoverde](https://github.com/lagartoverde))
- [#47](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/47) Implement besluit articles using article-structure plugin ([@elpoelma](https://github.com/elpoelma))
- [#48](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/48) Roadsign regulation plugin rework ([@elpoelma](https://github.com/elpoelma))

#### :bug: Bug Fix

- [#63](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/63) Preserve date format across reloads ([@elpoelma](https://github.com/elpoelma))

#### :house: Internal

- [#68](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/68) Update editor to 1.0.0-beta.5 ([@elpoelma](https://github.com/elpoelma))
- [#65](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/65) Update editor to 1.0.0-beta.4 ([@elpoelma](https://github.com/elpoelma))

#### Committers: 3

- Arne Bertrand ([@abeforgit](https://github.com/abeforgit))
- Elena Poelman ([@elpoelma](https://github.com/elpoelma))
- Oscar Rodriguez Villalobos ([@lagartoverde](https://github.com/lagartoverde))

## 1.0.0-beta.1 (2023-01-17)

#### :rocket: Enhancement

- [#27](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/27) Conversion of plugins to prosemirror based editor ([@elpoelma](https://github.com/elpoelma))
- [#54](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/54) Move table-of-contents toggle to toolbar ([@elpoelma](https://github.com/elpoelma))
- [#46](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/46) Update insert-structure command so it looks forward for the next best position to insert ([@elpoelma](https://github.com/elpoelma))

#### :bug: Bug Fix

- [#59](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/59) Rename verwijzing to citeeropschrift ([@elpoelma](https://github.com/elpoelma))
- [#56](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/56) Add space before 'met zonale geldigheid' ([@elpoelma](https://github.com/elpoelma))

#### :house: Internal

- [#61](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/61) Update editor to 1.0.0-beta.2 ([@elpoelma](https://github.com/elpoelma))
- [#60](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/60) Update editor to 1.0.0-beta.1 ([@elpoelma](https://github.com/elpoelma))

#### Committers: 1

- Elena Poelman ([@elpoelma](https://github.com/elpoelma))

## 1.0.0-alpha.3 (2023-01-09)

#### :house: Internal

- [#42](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/42) Remove redundant context from article-structure plugin ([@elpoelma](https://github.com/elpoelma))

#### Committers: 1

- Elena Poelman ([@elpoelma](https://github.com/elpoelma))

## 1.0.0-alpha.2 (2023-01-03)

#### :boom: Breaking Change

- [#38](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/38) Folder restructure ([@elpoelma](https://github.com/elpoelma))

#### :rocket: Enhancement

- [#40](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/40) Major rework of article-structure plugin ([@elpoelma](https://github.com/elpoelma))
- [#39](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/39) Remove paragraphs from toc ([@lagartoverde](https://github.com/lagartoverde))

#### :bug: Bug Fix

- [#37](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/37) Fix besluit plugin numbering ([@elpoelma](https://github.com/elpoelma))

#### :house: Internal

- [#41](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/41) Update editor to 1.0.0-alpha.13 ([@elpoelma](https://github.com/elpoelma))
- [#38](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/38) Folder restructure ([@elpoelma](https://github.com/elpoelma))

#### Committers: 2

- Elena Poelman ([@elpoelma](https://github.com/elpoelma))
- Oscar Rodriguez Villalobos ([@lagartoverde](https://github.com/lagartoverde))

## 1.0.0-alpha.1 (2022-12-22)

#### :rocket: Enhancement

- [#35](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/35) converting the besluit-plugin to new API ([@usrtim](https://github.com/usrtim))
- [#34](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/34) Add and convert citation plugin ([@abeforgit](https://github.com/abeforgit))
- [#32](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/32) Convert table-of-contents plugin to prosemirror based editor. ([@elpoelma](https://github.com/elpoelma))
- [#33](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/33) feature/dev utils ([@abeforgit](https://github.com/abeforgit))
- [#31](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/31) Convert roadsign-regulation plugin to prosemirror based editor. ([@elpoelma](https://github.com/elpoelma))
- [#28](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/28) Convert insert-variable plugin to prosemirror based editor. ([@elpoelma](https://github.com/elpoelma))
- [#29](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/29) Convert template-variable plugin to prosemirror based editor. ([@elpoelma](https://github.com/elpoelma))
- [#20](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/20) Convert standard-template plugin to prosemirror based editor plugin ([@elpoelma](https://github.com/elpoelma))
- [#19](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/19) Convert import-snippet plugin to prosemirror based editor plugin ([@elpoelma](https://github.com/elpoelma))
- [#18](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/18) Convert besluit-type plugin to prosemirror based editor plugin ([@elpoelma](https://github.com/elpoelma))
- [#17](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/17) Convert rdfa-date plugin to prosemirror based editor plugin ([@elpoelma](https://github.com/elpoelma))

#### :house: Internal

- [#26](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/26) Convert besluit-type, import-snippet, rdfa-date and standard-template plugins to typescript ([@elpoelma](https://github.com/elpoelma))

#### Committers: 4

- Arne Bertrand ([@abeforgit](https://github.com/abeforgit))
- Elena Poelman ([@elpoelma](https://github.com/elpoelma))
- Oscar Rodriguez Villalobos ([@lagartoverde](https://github.com/lagartoverde))
- [@usrtim](https://github.com/usrtim)

## 0.4.1 (2022-12-02)

#### :bug: Bug Fix

- [#25](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/25) Replace citaten-plugin.citaten-plugin by citaten-plugin ([@elpoelma](https://github.com/elpoelma))
- [#24](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/24) Trigger date plugin correctly ([@lagartoverde](https://github.com/lagartoverde))

#### Committers: 2

- Elena Poelman ([@elpoelma](https://github.com/elpoelma))
- Oscar Rodriguez Villalobos ([@lagartoverde](https://github.com/lagartoverde))

## 0.4.0 (2022-12-01)

#### :house: Internal

- [#23](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/23) Add typescript support ([@elpoelma](https://github.com/elpoelma))
- [#22](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/22) Move to classic ember addon ([@elpoelma](https://github.com/elpoelma))

#### Committers: 1

- Elena Poelman ([@elpoelma](https://github.com/elpoelma))

## v0.3.1 (2022-11-24)

#### :memo: Documentation

- [#15](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/15) Add documentation to readme ([@elpoelma](https://github.com/elpoelma))

#### Committers: 1

- Elena Poelman ([@elpoelma](https://github.com/elpoelma))

## v0.3.0 (2022-11-23)

#### :rocket: Enhancement

- [#7](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/7) Add roadsign regulation plugin ([@elpoelma](https://github.com/elpoelma))

#### Committers: 1

- Elena Poelman ([@elpoelma](https://github.com/elpoelma))

## v0.2.0 (2022-11-23)

#### :rocket: Enhancement

- [#14](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/14) Add insert and template variable plugins ([@elpoelma](https://github.com/elpoelma))

#### Committers: 1

- Elena Poelman ([@elpoelma](https://github.com/elpoelma))

## v0.1.3 (2022-11-23)

#### :bug: Bug Fix

- [#13](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/13) Fix path of table-of-contents outline component ([@elpoelma](https://github.com/elpoelma))

#### Committers: 1

- Elena Poelman ([@elpoelma](https://github.com/elpoelma))

## v0.1.2 (2022-11-23)

#### :house: Internal

- [#12](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/12) Export config and translations ([@elpoelma](https://github.com/elpoelma))

#### Committers: 1

- Elena Poelman ([@elpoelma](https://github.com/elpoelma))

## v0.1.1 (2022-11-23)

#### :house: Internal

- [#11](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/11) Loosen ember-data peerdep requirement to 3.27.0 ([@elpoelma](https://github.com/elpoelma))

#### Committers: 1

- Elena Poelman ([@elpoelma](https://github.com/elpoelma))

## v0.1.0 (2022-11-23)

#### :rocket: Enhancement

- [#9](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/9) Add import-snippet plugin ([@elpoelma](https://github.com/elpoelma))
- [#8](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/8) Add rdfa-date plugin ([@elpoelma](https://github.com/elpoelma))
- [#3](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/3) Add standard-template plugin ([@elpoelma](https://github.com/elpoelma))
- [#4](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/4) Add besluit-type plugin ([@elpoelma](https://github.com/elpoelma))
- [#6](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/6) Add generate template plugin ([@elpoelma](https://github.com/elpoelma))
- [#5](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/5) Add table-of-contents plugin ([@elpoelma](https://github.com/elpoelma))
- [#2](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/2) Add citaten-plugin ([@elpoelma](https://github.com/elpoelma))

#### :house: Internal

- [#10](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/10) Set up woodpecker ([@elpoelma](https://github.com/elpoelma))
- [#1](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/1) Setup basic test-app ([@elpoelma](https://github.com/elpoelma))

#### Committers: 1

- Elena Poelman ([@elpoelma](https://github.com/elpoelma))

# Changelog

[unreleased]: https://github.com/lblod/ember-rdfa-editor-lblod-plugins/compare/v11.3.0...HEAD
[8.0.0]: https://github.com/lblod/ember-rdfa-editor-lblod-plugins/compare/v8.0.0...v8.0.1
[8.0.0]: https://github.com/lblod/ember-rdfa-editor-lblod-plugins/compare/v7.1.0...v8.0.0
[7.1.0]: https://github.com/lblod/ember-rdfa-editor-lblod-plugins/compare/v7.0.0...v7.1.0
[7.0.0]: https://github.com/lblod/ember-rdfa-editor-lblod-plugins/compare/v6.1.0...v7.0.0
[6.1.0]: https://github.com/lblod/ember-rdfa-editor-lblod-plugins/compare/v6.0.0...v6.1.0
[6.0.0]: https://github.com/lblod/ember-rdfa-editor-lblod-plugins/compare/v5.0.1...v6.0.0
[5.0.1]: https://github.com/lblod/ember-rdfa-editor-lblod-plugins/compare/v5.0.0...v5.0.1
[5.0.0]: https://github.com/lblod/ember-rdfa-editor-lblod-plugins/compare/v4.0.2...v5.0.0
[4.0.2]: https://github.com/lblod/ember-rdfa-editor-lblod-plugins/compare/v4.0.1...v4.0.2
[4.0.1]: https://github.com/lblod/ember-rdfa-editor-lblod-plugins/compare/v4.0.0...v4.0.1
[4.0.0]: https://github.com/lblod/ember-rdfa-editor-lblod-plugins/compare/v3.1.0...v4.0.0
[3.1.0]: https://github.com/lblod/ember-rdfa-editor-lblod-plugins/compare/v3.0.0...v3.1.0
[3.0.0]: https://github.com/lblod/ember-rdfa-editor-lblod-plugins/compare/v2.1.2...v3.0.0
[2.1.2]: https://github.com/lblod/ember-rdfa-editor-lblod-plugins/compare/v2.1.1...v2.1.2
[2.1.1]: https://github.com/lblod/ember-rdfa-editor-lblod-plugins/compare/v2.1.0...v2.1.1
[11.3.0]: https://github.com/lblod/ember-rdfa-editor-lblod-plugins/compare/v11.2.0...v11.3.0
[11.2.0]: https://github.com/lblod/ember-rdfa-editor-lblod-plugins/compare/v11.1.0...v11.2.0
[11.1.0]: https://github.com/lblod/ember-rdfa-editor-lblod-plugins/compare/v11.0.0...v11.1.0
[11.0.0]: https://github.com/lblod/ember-rdfa-editor-lblod-plugins/compare/v10.0.0...v11.0.0
[10.0.0]: https://github.com/lblod/ember-rdfa-editor-lblod-plugins/compare/v9.1.1...v10.0.0
[9.1.1]: https://github.com/lblod/ember-rdfa-editor-lblod-plugins/compare/v9.1.0...v9.1.1
[9.1.0]: https://github.com/lblod/ember-rdfa-editor-lblod-plugins/compare/v9.0.2...v9.1.0
[9.0.2]: https://github.com/lblod/ember-rdfa-editor-lblod-plugins/compare/v9.0.1...v9.0.2
[9.0.1]: https://github.com/lblod/ember-rdfa-editor-lblod-plugins/compare/v9.0.0...v9.0.1
[9.0.0]: https://github.com/lblod/ember-rdfa-editor-lblod-plugins/compare/v8.4.1...v9.0.0
[8.4.3]: https://github.com/lblod/ember-rdfa-editor-lblod-plugins/compare/v8.4.2...v8.4.3
[8.4.2]: https://github.com/lblod/ember-rdfa-editor-lblod-plugins/compare/v8.4.1...v8.4.2
[8.4.1]: https://github.com/lblod/ember-rdfa-editor-lblod-plugins/compare/v8.4.0...v8.4.1
[8.4.0]: https://github.com/lblod/ember-rdfa-editor-lblod-plugins/compare/v8.3.0...v8.4.0
[8.3.0]: https://github.com/lblod/ember-rdfa-editor-lblod-plugins/compare/v8.2.2...v8.3.0
[8.2.2]: https://github.com/lblod/ember-rdfa-editor-lblod-plugins/compare/v8.2.1...v8.2.2
[8.2.1]: https://github.com/lblod/ember-rdfa-editor-lblod-plugins/compare/v8.2.0...v8.2.1
[8.2.0]: https://github.com/lblod/ember-rdfa-editor-lblod-plugins/compare/v8.1.0...v8.2.0
[8.1.0]: https://github.com/lblod/ember-rdfa-editor-lblod-plugins/compare/v8.0.1...v8.1.0
