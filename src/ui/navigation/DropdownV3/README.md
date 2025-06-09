# Dropdown Component Documentation

## Description

The `Dropdown` component is a versatile dropdown menu that can be used to display a list of options or filters. The component has a customizable appearance, supports various activation methods, and can be positioned in different directions relative to the activator.

## Importing Components

```js
import {
  Dropdown,
  DropdownItem,
  DropdownFilter,
} from "@src/ui/navigation/DropdownV3";
```

## Dropdown Component

### Props

| Name          | Type                                   | Default  | Description                                            |
| ------------- | -------------------------------------- | -------- | ------------------------------------------------------ |
| position      | 'top' \| 'bottom' \| 'left' \| 'right' | 'bottom' | Direction in which the dropdown opens                  |
| trigger       | 'hover' \| 'click'                     | 'click'  | Method to activate the dropdown                        |
| closeOnSelect | boolean                                | true     | Whether to close the dropdown when an item is selected |
| disabled      | boolean                                | false    | Disable the dropdown                                   |

### Events

| Name  | Parameters | Description                        |
| ----- | ---------- | ---------------------------------- |
| open  | -          | Triggered when the dropdown opens  |
| close | -          | Triggered when the dropdown closes |

### Slots

| Name      | Description                                                                          |
| --------- | ------------------------------------------------------------------------------------ |
| activator | Dropdown activator content. If not specified, the default button is displayed        |
| default   | Dropdown content (usually DropdownItem or DropdownFilter components are placed here) |

## DropdownItem Component

### Props

| Name     | Type    | Default   | Description                              |
| -------- | ------- | --------- | ---------------------------------------- |
| active   | boolean | false     | Whether the item is active (highlighted) |
| disabled | boolean | false     | Whether the item is disabled             |
| value    | any     | undefined | Value associated with the item           |

### Events

| Name  | Parameters                        | Description                        |
| ----- | --------------------------------- | ---------------------------------- |
| click | { event: MouseEvent, value: any } | Triggered when the item is clicked |

### Slots

| Name    | Description           |
| ------- | --------------------- |
| default | Dropdown item content |

## DropdownFilter Component

### Events

| Name  | Parameters | Description                                  |
| ----- | ---------- | -------------------------------------------- |
| apply | -          | Triggered when the "Apply" button is clicked |
| reset | -          | Triggered when the "Reset" button is clicked |

### Slots

| Name    | Description                                                                                                                |
| ------- | -------------------------------------------------------------------------------------------------------------------------- |
| default | Main filter content (checkboxes, radio buttons, etc.)                                                                      |
| actions | Custom actions (buttons) at the bottom of the filter. If not specified, standard "Apply" and "Reset" buttons are displayed |

## Usage Examples

### Simple Menu with Options

```vue
<Dropdown position="bottom" trigger="click">
  <template #activator>
    <Button>Menu</Button>
  </template>
  
  <DropdownItem @click="doAction">Option 1</DropdownItem>
  <DropdownItem @click="doAnotherAction">Option 2</DropdownItem>
  <DropdownItem disabled>Disabled option</DropdownItem>
</Dropdown>
```

### Menu with Active Item

```vue
<script setup>
import { ref } from "vue";

const selectedOption = ref("option1");

function selectOption(option) {
  selectedOption.value = option;
}
</script>

<template>
  <Dropdown position="bottom" trigger="click">
    <template #activator>
      <Button>{{ selectedOption }}</Button>
    </template>

    <DropdownItem
      v-for="option in ['option1', 'option2', 'option3']"
      :key="option"
      :active="selectedOption === option"
      :value="option"
      @click="selectOption(option)"
    >
      {{ option }}
    </DropdownItem>
  </Dropdown>
</template>
```

### Filter Menu

```vue
<script setup>
import { ref } from "vue";

const filters = ref({
  category1: false,
  category2: false,
});

function applyFilters() {
  // Filter application logic
  console.log("Applied filters:", filters.value);
}

function resetFilters() {
  filters.value = {
    category1: false,
    category2: false,
  };
}
</script>

<template>
  <Dropdown position="bottom" trigger="click" :close-on-select="false">
    <template #activator>
      <Button>Filters</Button>
    </template>

    <DropdownFilter @apply="applyFilters" @reset="resetFilters">
      <div class="filter-group">
        <h4>Categories</h4>
        <label>
          <input type="checkbox" v-model="filters.category1" />
          Category 1
        </label>
        <label>
          <input type="checkbox" v-model="filters.category2" />
          Category 2
        </label>
      </div>
    </DropdownFilter>
  </Dropdown>
</template>
```

## Features

1. Dropdown automatically closes when the ESC key is pressed or when clicking outside the dropdown area.
2. For the `hover` trigger, a delay has been added when the cursor leaves, to prevent accidental closing when moving the cursor.
3. When using `closeOnSelect={false}`, the dropdown will not close when an item is selected (useful for filters).
4. The component supports dark theme through the `prefers-color-scheme: dark` media query.
