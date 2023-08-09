# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- GN-4261: addition of an address variable
### Breaking
- Removal of old address-plugin

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
- GN-4404: ensure number-variable placeholders are consistent
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
- Use `AuModalContainer` component instead of  #ember-appuniversum-wormhole element in dummy app
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
- Add the __rdfaId when manually creating decisions titles, decision articles or citations
- fix citation highlights not triggering correctly in various situations

## [2.1.0] - 2023-02-06

#### :rocket: Enhancement

* [#98](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/98) Improve citation plugin regex and improve
  citation type matching ([@elpoelma](https://github.com/elpoelma))

#### :bug: Bug Fix

* [#96](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/96) Fix insert-citation button not being enabled
  in correct context. ([@elpoelma](https://github.com/elpoelma))
* [#100](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/100) Prevent splitting of besluit related nodes ([@elpoelma](https://github.com/elpoelma))
* [#97](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/97) Fix: disallow splitting of besluit node ([@elpoelma](https://github.com/elpoelma))

#### :house: Internal
* [#99](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/99) Update editor to 2.1.0 ([@elpoelma](https://github.com/elpoelma))

#### Committers: 1
- Elena Poelman ([@elpoelma](https://github.com/elpoelma))

## 2.0.1 (2023-02-06)

#### :bug: Bug Fix
* [#95](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/95) Move ember-velcro to hard dependencies ([@elpoelma](https://github.com/elpoelma))

#### Committers: 1
- Elena Poelman ([@elpoelma](https://github.com/elpoelma))

## 2.0.0 (2023-02-06)
version-only bump to match editor major cycle


## 1.0.0 (2023-02-06)

#### :boom: Breaking Change
* [#94](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/94) feat(dates): add nice error messages to custom format box ([@abeforgit](https://github.com/abeforgit))

#### :rocket: Enhancement
* [#94](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/94) feat(dates): add nice error messages to custom format box ([@abeforgit](https://github.com/abeforgit))
* [#93](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/93) Make headers and content nodes of structures isolating and defining ([@elpoelma](https://github.com/elpoelma))
* [#74](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/74) Feature/recreate uuids on paste ([@lagartoverde](https://github.com/lagartoverde))
* [#90](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/90) show error when the date format is empty ([@lagartoverde](https://github.com/lagartoverde))

#### :house: Internal
* [#92](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/92) Update editor to 2.0.1 ([@elpoelma](https://github.com/elpoelma))

#### Committers: 3
- Arne Bertrand ([@abeforgit](https://github.com/abeforgit))
- Elena Poelman ([@elpoelma](https://github.com/elpoelma))
- Oscar Rodriguez Villalobos ([@lagartoverde](https://github.com/lagartoverde))


## 1.0.0-beta.8 (2023-01-26)

#### :house: Internal
* [#83](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/83) Update editor to 1.0.0 ([@elpoelma](https://github.com/elpoelma))

#### Committers: 1
- Elena Poelman ([@elpoelma](https://github.com/elpoelma))

## 1.0.0-beta.7 (2023-01-25)

#### :bug: Bug Fix
* [#82](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/82) Add typeof and property to article_paragraph attrs ([@elpoelma](https://github.com/elpoelma))

#### Committers: 1
- Elena Poelman ([@elpoelma](https://github.com/elpoelma))

## 1.0.0-beta.6 (2023-01-25)

#### :bug: Bug Fix
* [#81](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/81) Wrap-structure-content: return false if structure is not a wrapper ([@elpoelma](https://github.com/elpoelma))

#### Committers: 1
- Elena Poelman ([@elpoelma](https://github.com/elpoelma))

## 1.0.0-beta.5 (2023-01-25)

* chore(deps): update editor to beta 7 (ef72b82)
* Merge pull request #80 (d76dd89)
* Merge pull request #79 (69a5c62)
* Merge pull request #78 (fc68bf5)
* fix(decision-type): remove the old type before adding the new one (701ad87)
* fix(template): improve insertion behavior of standard templates (96cba5c)
* fix(nodes): make important nodes defining (5534c00)
* fix(nodes): make title node also parse on other header levels (9229677)


## 1.0.0-beta.4 (2023-01-24)

#### :bug: Bug Fix
* [#72](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/72) Enable word-break as break-all on variable contenteditable ([@elpoelma](https://github.com/elpoelma))
* [#71](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/71) Avoid writing out p tags for nodes different than paragraph ([@elpoelma](https://github.com/elpoelma))

#### :house: Internal
* [#73](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/73) Make besluit title optional ([@elpoelma](https://github.com/elpoelma))

#### Committers: 1
- Elena Poelman ([@elpoelma](https://github.com/elpoelma))


## 1.0.0-beta.3 (2023-01-23)

add onclick handler to pencil icon in variable plugin


## 1.0.0-beta.2 (2023-01-23)

#### :boom: Breaking Change
* [#67](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/67) New version of the variable plugin ([@elpoelma](https://github.com/elpoelma))
* [#62](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/62) feat(citation): make citation plugin datastore-independent ([@abeforgit](https://github.com/abeforgit))

#### :rocket: Enhancement
* [#69](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/69) Add enter handler to variable editor view ([@elpoelma](https://github.com/elpoelma))
* [#66](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/66) make the template plugin independent of the datastore ([@abeforgit](https://github.com/abeforgit))
* [#43](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/43) Feature/template nodes ([@lagartoverde](https://github.com/lagartoverde))
* [#62](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/62) feat(citation): make citation plugin datastore-independent ([@abeforgit](https://github.com/abeforgit))
* [#49](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/49) Avoid using the datastore on the besluit type plugin ([@lagartoverde](https://github.com/lagartoverde))
* [#47](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/47) Implement besluit articles using article-structure plugin ([@elpoelma](https://github.com/elpoelma))
* [#48](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/48) Roadsign regulation plugin rework ([@elpoelma](https://github.com/elpoelma))

#### :bug: Bug Fix
* [#63](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/63) Preserve date format across reloads ([@elpoelma](https://github.com/elpoelma))

#### :house: Internal
* [#68](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/68) Update editor to 1.0.0-beta.5 ([@elpoelma](https://github.com/elpoelma))
* [#65](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/65) Update editor to 1.0.0-beta.4 ([@elpoelma](https://github.com/elpoelma))

#### Committers: 3
- Arne Bertrand ([@abeforgit](https://github.com/abeforgit))
- Elena Poelman ([@elpoelma](https://github.com/elpoelma))
- Oscar Rodriguez Villalobos ([@lagartoverde](https://github.com/lagartoverde))


## 1.0.0-beta.1 (2023-01-17)

#### :rocket: Enhancement
* [#27](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/27) Conversion of plugins to prosemirror based editor ([@elpoelma](https://github.com/elpoelma))
* [#54](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/54) Move table-of-contents toggle to toolbar ([@elpoelma](https://github.com/elpoelma))
* [#46](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/46) Update insert-structure command so it looks forward for the next best position to insert ([@elpoelma](https://github.com/elpoelma))

#### :bug: Bug Fix
* [#59](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/59) Rename verwijzing to citeeropschrift ([@elpoelma](https://github.com/elpoelma))
* [#56](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/56) Add space before 'met zonale geldigheid' ([@elpoelma](https://github.com/elpoelma))

#### :house: Internal
* [#61](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/61) Update editor to 1.0.0-beta.2 ([@elpoelma](https://github.com/elpoelma))
* [#60](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/60) Update editor to 1.0.0-beta.1 ([@elpoelma](https://github.com/elpoelma))

#### Committers: 1
- Elena Poelman ([@elpoelma](https://github.com/elpoelma))

## 1.0.0-alpha.3 (2023-01-09)

#### :house: Internal
* [#42](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/42) Remove redundant context from article-structure plugin ([@elpoelma](https://github.com/elpoelma))

#### Committers: 1
- Elena Poelman ([@elpoelma](https://github.com/elpoelma))

## 1.0.0-alpha.2 (2023-01-03)

#### :boom: Breaking Change
* [#38](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/38) Folder restructure ([@elpoelma](https://github.com/elpoelma))

#### :rocket: Enhancement
* [#40](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/40) Major rework of article-structure plugin ([@elpoelma](https://github.com/elpoelma))
* [#39](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/39) Remove paragraphs from toc ([@lagartoverde](https://github.com/lagartoverde))

#### :bug: Bug Fix
* [#37](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/37) Fix besluit plugin numbering ([@elpoelma](https://github.com/elpoelma))

#### :house: Internal
* [#41](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/41) Update editor to 1.0.0-alpha.13 ([@elpoelma](https://github.com/elpoelma))
* [#38](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/38) Folder restructure ([@elpoelma](https://github.com/elpoelma))

#### Committers: 2
- Elena Poelman ([@elpoelma](https://github.com/elpoelma))
- Oscar Rodriguez Villalobos ([@lagartoverde](https://github.com/lagartoverde))

## 1.0.0-alpha.1 (2022-12-22)

#### :rocket: Enhancement
* [#35](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/35) converting the besluit-plugin to new API ([@usrtim](https://github.com/usrtim))
* [#34](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/34) Add and convert citation plugin ([@abeforgit](https://github.com/abeforgit))
* [#32](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/32) Convert table-of-contents plugin to prosemirror based editor. ([@elpoelma](https://github.com/elpoelma))
* [#33](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/33) feature/dev utils ([@abeforgit](https://github.com/abeforgit))
* [#31](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/31) Convert roadsign-regulation plugin to prosemirror based editor. ([@elpoelma](https://github.com/elpoelma))
* [#28](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/28) Convert insert-variable plugin to prosemirror based editor. ([@elpoelma](https://github.com/elpoelma))
* [#29](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/29) Convert template-variable plugin to prosemirror based editor. ([@elpoelma](https://github.com/elpoelma))
* [#20](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/20) Convert standard-template plugin to prosemirror based editor plugin ([@elpoelma](https://github.com/elpoelma))
* [#19](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/19) Convert import-snippet plugin to prosemirror based editor plugin ([@elpoelma](https://github.com/elpoelma))
* [#18](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/18) Convert besluit-type plugin to prosemirror based editor plugin ([@elpoelma](https://github.com/elpoelma))
* [#17](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/17) Convert rdfa-date plugin to prosemirror based editor plugin ([@elpoelma](https://github.com/elpoelma))

#### :house: Internal
* [#26](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/26) Convert besluit-type, import-snippet, rdfa-date and standard-template plugins to typescript ([@elpoelma](https://github.com/elpoelma))

#### Committers: 4
- Arne Bertrand ([@abeforgit](https://github.com/abeforgit))
- Elena Poelman ([@elpoelma](https://github.com/elpoelma))
- Oscar Rodriguez Villalobos ([@lagartoverde](https://github.com/lagartoverde))
- [@usrtim](https://github.com/usrtim)

## 0.4.1 (2022-12-02)

#### :bug: Bug Fix
* [#25](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/25) Replace citaten-plugin.citaten-plugin by citaten-plugin ([@elpoelma](https://github.com/elpoelma))
* [#24](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/24) Trigger date plugin correctly ([@lagartoverde](https://github.com/lagartoverde))

#### Committers: 2
- Elena Poelman ([@elpoelma](https://github.com/elpoelma))
- Oscar Rodriguez Villalobos ([@lagartoverde](https://github.com/lagartoverde))

## 0.4.0 (2022-12-01)

#### :house: Internal
* [#23](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/23) Add typescript support ([@elpoelma](https://github.com/elpoelma))
* [#22](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/22) Move to classic ember addon ([@elpoelma](https://github.com/elpoelma))

#### Committers: 1
- Elena Poelman ([@elpoelma](https://github.com/elpoelma))

## v0.3.1 (2022-11-24)

#### :memo: Documentation
* [#15](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/15) Add documentation to readme ([@elpoelma](https://github.com/elpoelma))

#### Committers: 1
- Elena Poelman ([@elpoelma](https://github.com/elpoelma))

## v0.3.0 (2022-11-23)

#### :rocket: Enhancement
* [#7](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/7) Add roadsign regulation plugin ([@elpoelma](https://github.com/elpoelma))

#### Committers: 1
- Elena Poelman ([@elpoelma](https://github.com/elpoelma))

## v0.2.0 (2022-11-23)

#### :rocket: Enhancement
* [#14](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/14) Add insert and template variable plugins ([@elpoelma](https://github.com/elpoelma))

#### Committers: 1
- Elena Poelman ([@elpoelma](https://github.com/elpoelma))

## v0.1.3 (2022-11-23)

#### :bug: Bug Fix
* [#13](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/13) Fix path of table-of-contents outline component ([@elpoelma](https://github.com/elpoelma))

#### Committers: 1
- Elena Poelman ([@elpoelma](https://github.com/elpoelma))

## v0.1.2 (2022-11-23)

#### :house: Internal
* [#12](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/12) Export config and translations ([@elpoelma](https://github.com/elpoelma))

#### Committers: 1
- Elena Poelman ([@elpoelma](https://github.com/elpoelma))

## v0.1.1 (2022-11-23)

#### :house: Internal
* [#11](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/11) Loosen ember-data peerdep requirement to 3.27.0 ([@elpoelma](https://github.com/elpoelma))

#### Committers: 1
- Elena Poelman ([@elpoelma](https://github.com/elpoelma))

## v0.1.0 (2022-11-23)

#### :rocket: Enhancement
* [#9](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/9) Add import-snippet plugin ([@elpoelma](https://github.com/elpoelma))
* [#8](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/8) Add rdfa-date plugin ([@elpoelma](https://github.com/elpoelma))
* [#3](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/3) Add standard-template plugin ([@elpoelma](https://github.com/elpoelma))
* [#4](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/4) Add besluit-type plugin ([@elpoelma](https://github.com/elpoelma))
* [#6](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/6) Add generate template plugin ([@elpoelma](https://github.com/elpoelma))
* [#5](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/5) Add table-of-contents plugin ([@elpoelma](https://github.com/elpoelma))
* [#2](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/2) Add citaten-plugin ([@elpoelma](https://github.com/elpoelma))

#### :house: Internal
* [#10](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/10) Set up woodpecker ([@elpoelma](https://github.com/elpoelma))
* [#1](https://github.com/lblod/ember-rdfa-editor-lblod-plugins/pull/1) Setup basic test-app ([@elpoelma](https://github.com/elpoelma))

#### Committers: 1
- Elena Poelman ([@elpoelma](https://github.com/elpoelma))

# Changelog

[unreleased]: https://github.com/lblod/ember-rdfa-editor-lblod-plugins/compare/v10.0.0...HEAD
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
