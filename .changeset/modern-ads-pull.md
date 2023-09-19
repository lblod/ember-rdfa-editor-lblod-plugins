---
'@lblod/ember-rdfa-editor-lblod-plugins': major
---

Merge rdfa-date plugin into variable plugin

Breaking changes:
  - Rename of variable date insert component from `VariablePlugin::Date::Insert` to `VariablePlugin::Date::InsertVariable` 
  - Rename of standalone date insert component from `RdfaDatePlugin::Insert` to `VariablePlugin::Date::Insert`
  - Removal of `RdfaDatePlugin::Card` component, replaced by `VariablePlugin::Date::Edit` component
  - Removal of `RdfaDatePlugin::Date` component, replace by `VariablePlugin::Date::Nodeview` component
  - Removal of `RdfaDatePlugin::DateTimePicker` component, replaced by `VariablePlugin::Date::DateTimePicker` component
  - Removal of `RdfaDatePlugin::HelpModal` component, replaced by `VariablePlugin::Date::HelpModal` component
  - The `date` node-spec and `dateView` node-view should now be imported from `@lblod/ember-rdfa-editor-lblod-plugins/plugins/variable-plugin/variables`

