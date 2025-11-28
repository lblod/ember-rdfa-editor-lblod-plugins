# variable-plugin

Editor plugin which provides node-specs and components which allow you to insert and edit different types of variables in a document. The plugin provides the following variable types:

- text variable
- number variable
- date variable
- codelist
- location
- address
- person
- autofilled variable

Additional variable types can be added in the consuming application or addon.

For each of these variable types, a node-spec and node-view are defined. You can import them like this:

```js
import {
  address,
  addressView,
  autofilled_variable,
  autofilledVariableView,
  codelist,
  codelistView,
  codelist_option,
  date,
  dateView,
  location,
  locationView,
  number,
  numberView,
  personVariableView,
  person_variable,
  text_variable,
  textVariableView,
} from '@lblod/ember-rdfa-editor-lblod-plugins/plugins/variable-plugin/variables';
```

For each of the variable-types you want to include in your editor instance, you should add the corresponding node-spec to your schema and the node-view to the `nodeViews` editor argument.

Both the `date` node-spec and `dateView` nodeview are functions which expect a `DateOptions` object, more information on how to define such a `DateOptions` object can be found in the section on the [date-edit component](#the-date-variable)

## Inserting variables into a document

This addon includes an insert-component for each of these variable types:

- `variable-plugin/text/insert`
- `variable-plugin/number/insert`
- `variable-plugin/date/insert`
- `variable-plugin/location/insert`
- `variable-plugin/codelist/insert`
- `variable-plugin/address/insert-variable`
- `variable-plugin/person/insert`
- `variable-plugin/autofilled/insert`

Each of these components presents a custom UI which allows a user to insert a variable of the corresponding type in a document.

These insert-components can be used on their own, but can also be used in combination with the `variable-plugin/insert-variable-card` component. The responsibility of this component is two-fold:

- It allows a user to select a variable type.
- The correct insert component corresponding to the user-selected variable type is shown.

The `variable-plugin/insert-variable-card` can be easily configured: it expects two arguments:

- `controller`: An instance of the `SayController` class
- `variableTypes`: A list of `VariableConfig` objects. With each `VariableConfig` containing:
  - the `label` which should be displayed in the variable-select dropdown
  - the `component`: class of the component which should be displayed upon selecting the variable type.
  - _optionally_ an `options` argument object which should be passed to the insert-variable component.

* The `VariableConfig` type is defined as follows:

```js
 type VariableConfig = {
   label: string;
   component: ComponentLike;
   options?: unknown;
 };
```

### An example

To allows users to insert variables into a document, add the following to the editor sidebar in your template:

```hbs
<VariablePlugin::InsertVariableCard
  @controller={{this.controller}}
  @variableTypes={{this.variableTypes}}
/>
```

`this.controller` is an instance of `SayController` and `this.variableTypes` is the list of `VariableConfig` objects which should be defined in your controller/component class:

```js
import TextVariableInsertComponent from '@lblod/ember-rdfa-editor-lblod-plugins/components/variable-plugin/text/insert';
import NumberInsertComponent from '@lblod/ember-rdfa-editor-lblod-plugins/components/variable-plugin/number/insert';
import DateInsertVariableComponent from '@lblod/ember-rdfa-editor-lblod-plugins/components/variable-plugin/date/insert-variable';
import LocationInsertComponent from '@lblod/ember-rdfa-editor-lblod-plugins/components/variable-plugin/location/insert';
import CodelistInsertComponent from '@lblod/ember-rdfa-editor-lblod-plugins/components/variable-plugin/codelist/insert';
import VariablePluginAddressInsertVariableComponent from '@lblod/ember-rdfa-editor-lblod-plugins/components/variable-plugin/address/insert-variable';
...
get variableTypes() {
  return [
    {
      label: 'text',
      component: TextVariableInsertComponent,
    },
    {
      label: 'number',
      component: NumberInsertComponent,
    },
    {
      label: 'date',
      component: DateInsertVariableComponent
    },
    {
      label: 'location',
      component: LocationInsertComponent,
      options: {
        endpoint: 'https://dev.roadsigns.lblod.info/sparql',
      },
    },
    {
      label: 'codelist',
      component: CodelistInsertComponent,
      options: {
        endpoint: 'https://dev.roadsigns.lblod.info/sparql',
      },
    },
    {
      label: 'address',
      component: VariablePluginAddressInsertVariableComponent,
    },
  ];
}
```

As you can see, both the `location` and `codelist` insert-components require an endpoint to be provided. They will use it to fetch the codelists/locations.
Aside from the endpoint, the `codelist` insert-component may optionally expect a publisher argument which it will use to limit the codelist fetch to a specific publisher.

## Editing variables in a document

Each of the variables provided by this addon have a different editing experiences and use different components:

### The text variable

Editing a text variable requires no extra components aside from its node-spec and node-view. A user can just type into the text variable directly.

### The number variable

Editing a number variable can be done in its nodeview directly. When a user clicks on a number variable in a document, it opens a popup allow you to fill in a number.

### The date variable

This addon provides a seperate edit component which allows users to fill in date variables in a document.
This component can be added to the sidebar of an editor instance in a template as follows:

```hbs
<RdfaDatePlugin::Card
  @controller={{this.controller}}
  @options={{this.dateOptions}}
/>
```

Where `this.dateOptions` is a `DateOptions` object used to configure the edit component. It can be defined as e.g.:

```js
get dateOptions(){
  return {
     formats: [
      {
        label: 'Short Date',
        key: 'short',
        dateFormat: 'dd/MM/yy',
        dateTimeFormat: 'dd/MM/yy HH:mm',
      },
      {
        label: 'Long Date',
        key: 'long',
        dateFormat: 'EEEE dd MMMM yyyy',
        dateTimeFormat: 'PPPPp',
      },
    ],
    allowCustomFormat: true,
  }
}
```

- `formats`: specify default formats to show for selection in the date card.
	- `label` (optional): The label shown to the user on the card. If not provided, the format is used instead e.g.: `dd/MM/yyyy`
	- `key`: A **unique** identifier used for identification in the internal code. 
	- `dateFormat`: The date format used when this is selected.
	- `dateTimeFormat`: The datetime format to use when this is selected. Used when the user selects "Include time".
- `allowCustomFormat`: true by default, determines if the option to insert a fully custom format is available for newly created date nodes.

The syntax of formats can be found at [date-fns](https://date-fns.org/v2.29.3/docs/format).

### The location variable

This addon provides a seperate edit component which allows users to fill in location variables in a document.
This component can be added to the sidebar of an editor instance in a template as follows:

```hbs
<VariablePlugin::Location::Edit
  @controller={{this.controller}}
  @options={{this.locationEditOptions}}
/>
```

Where `this.locationEditOptions` is a `LocationEditOptions` object used to configure the edit component. It can be defined as e.g.:

```js
get locationEditOptions() {
  return {
      endpoint: 'https://dev.roadsigns.lblod.info/sparql', //the fallback endpoint the edit component should use to fetch location values if the location variable has no `source` attribute
      zonalLocationCodelistUri:
        'http://lblod.data.gift/concept-schemes/62331E6900730AE7B99DF7EF', //the uri the edit component should search for if the location variable is included in a zonal traffic measure
      nonZonalLocationCodelistUri:
        'http://lblod.data.gift/concept-schemes/62331FDD00730AE7B99DF7F2', // the uri the edit component should search for if the location variable is included in a non-zonal traffic measure
    };
}
```

### The codelist variable

This addon provides a seperate edit component which allows users to fill in codelist variables in a document.
This component can be added to the sidebar of an editor instance in a template as follows:

```hbs
<VariablePlugin::Codelist::Edit
  @controller={{this.controller}}
  @options={{this.codelistEditOptions}}
/>
```

Where `this.codelistEditOptions` is a `CodelistEditOptions` object used to configure the edit component. It can be defined as e.g.:

```js
get codelistEditOptions() {
  return {
      endpoint: 'https://dev.roadsigns.lblod.info/sparql', //the fallback endpoint the edit component should use to fetch codelist values if the codelist variable has no `source` attribute
    };
}
```

### The address variable

This addon provides a seperate edit component which allows users to search for an address and update the select address variable. Additionally, they can also choose whether to include the housenumber of an address.
You can add this edit-component to a template as follows:

```hbs
<VariablePlugin::Address::Edit
  @controller={{this.controller}}
  @defaultMuncipality='Antwerpen'
/>
```

The edit card can be configured with two arguments:

- An instance of a `SayController` (required)
- A `defaultMuncipality` which should be used as the default value of the `muncipality` field in the edit-card (optional)

You can also add an insert component meant for use outside of `insert-variable-card` by using the `variable-plugin/address/insert` component. This has no label-input and will show a default label.

```hbs
<VariablePlugin::Address::Insert @controller={{this.controller}} />
```

## Styling

Nodes from this plugin can be styled by using the following classes:

| Node | Css class |
|---|---|
| All nodes, when empty | say-variable |
| date | say-date-variable|
| person | say-person-variable |
| codelist | say-codelist-variable |
| autofilled | say-autofilled-variable |
| address | say-address-variable |
| text_variable | say-text-variable |
| number | say-number-variable |
| location | say-location-variable |
