# @lblod/ember-rdfa-editor-lblod-plugins

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
