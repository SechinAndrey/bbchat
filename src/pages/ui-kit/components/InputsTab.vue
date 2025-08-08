<script setup lang="ts">
import { ref } from "vue";

import Button from "@src/ui/inputs/Button.vue";
import IconButton from "@src/ui/inputs/IconButton.vue";
import TextInput from "@src/ui/inputs/TextInput.vue";
import LabeledTextInput from "@src/ui/inputs/LabeledTextInput.vue";
import SearchInput from "@src/ui/inputs/SearchInput.vue";
import PasswordInput from "@src/ui/inputs/PasswordInput.vue";
import Textarea from "@src/ui/inputs/Textarea.vue";
import Checkbox from "@src/ui/inputs/Checkbox.vue";
import SwitchInput from "@src/ui/inputs/SwitchInput.vue";
import RangeSlider from "@src/ui/inputs/RangeSlider.vue";
import DropFileUpload from "@src/ui/inputs/DropFileUpload.vue";
import Select from "@src/ui/inputs/Select.vue";
import AutocompleteSelect from "@src/ui/inputs/AutocompleteSelect.vue";

import {
  PaperAirplaneIcon,
  UserPlusIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  Cog6ToothIcon,
  TrashIcon,
} from "@heroicons/vue/24/outline";

const checkboxValue = ref(false);
const checkboxArrayValue = ref([]);
const switchValue = ref(false);
const sliderValue = ref(50);
const singleSelectValue = ref("");
const multiSelectValue = ref([]);
const singleAutocompleteValue = ref("");
const multiAutocompleteValue = ref([]);
const selectOptions = [
  { value: 1, label: "Перший варіант" },
  { value: 2, label: "Другий варіант" },
  { value: 3, label: "Третій варіант" },
  { value: 4, label: "Четвертий варіант" },
];

const handleCheckboxToggle = function () {
  checkboxValue.value = !checkboxValue.value;
};

const handleSwitchToggle = function (value: boolean) {
  switchValue.value = value;
};

const handleSliderChange = function (value: number) {
  sliderValue.value = value;
};
</script>

<template>
  <div>
    <h2 class="heading-1 text-color mb-6">Input Elements</h2>

    <!-- Buttons -->
    <section class="mb-10">
      <h3 class="heading-2 text-color mb-4">Buttons (Button)</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div class="p-4 border rounded dark:border-gray-600">
          <h4 class="body-2 text-color mb-2">Primary Button</h4>
          <Button class="contained-primary contained-text"
            >Primary Button</Button
          >
        </div>
        <div class="p-4 border rounded dark:border-gray-600">
          <h4 class="body-2 text-color mb-2">Success Button</h4>
          <Button class="contained-success contained-text"
            >Success Button</Button
          >
        </div>
        <div class="p-4 border rounded dark:border-gray-600">
          <h4 class="body-2 text-color mb-2">Danger Button</h4>
          <Button class="contained-danger contained-text">Warning</Button>
        </div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div class="p-4 border rounded dark:border-gray-600">
          <h4 class="body-2 text-color mb-2">Outlined Button (Primary)</h4>
          <Button class="outlined-primary ghost-text">Outlined Button</Button>
        </div>
        <div class="p-4 border rounded dark:border-gray-600">
          <h4 class="body-2 text-color mb-2">Outlined Button (Success)</h4>
          <Button class="outlined-success ghost-text">Outlined Button</Button>
        </div>
        <div class="p-4 border rounded dark:border-gray-600">
          <h4 class="body-2 text-color mb-2">Outlined Button (Danger)</h4>
          <Button class="outlined-danger ghost-text">Outlined Button</Button>
        </div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="p-4 border rounded dark:border-gray-600">
          <h4 class="body-2 text-color mb-2">Ghost Button (Primary)</h4>
          <Button class="ghost-primary ghost-text">Ghost Button</Button>
        </div>
        <div class="p-4 border rounded dark:border-gray-600">
          <h4 class="body-2 text-color mb-2">Ghost Button (Success)</h4>
          <Button class="ghost-success ghost-text">Ghost Button</Button>
        </div>
        <div class="p-4 border rounded dark:border-gray-600">
          <h4 class="body-2 text-color mb-2">Ghost Button (Danger)</h4>
          <Button class="ghost-danger ghost-text">Ghost Button</Button>
        </div>
      </div>
    </section>

    <!-- Icon Buttons -->
    <section class="mb-10">
      <h3 class="heading-2 text-color mb-4">Icon Buttons (IconButton)</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div class="p-4 border rounded dark:border-gray-600">
          <h4 class="body-2 text-color mb-2">Primary Icon Button</h4>
          <div class="flex justify-center">
            <IconButton class="ic-btn-contained-primary p-2">
              <PaperAirplaneIcon class="w-5 h-5" />
            </IconButton>
          </div>
        </div>
        <div class="p-4 border rounded dark:border-gray-600">
          <h4 class="body-2 text-color mb-2">Success Icon Button</h4>
          <div class="flex justify-center">
            <IconButton class="ic-btn-contained-success p-2">
              <UserPlusIcon class="w-5 h-5" />
            </IconButton>
          </div>
        </div>
        <div class="p-4 border rounded dark:border-gray-600">
          <h4 class="body-2 text-color mb-2">Danger Icon Button</h4>
          <div class="flex justify-center">
            <IconButton class="ic-btn-contained-danger p-2">
              <TrashIcon class="w-5 h-5" />
            </IconButton>
          </div>
        </div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="p-4 border rounded dark:border-gray-600">
          <h4 class="body-2 text-color mb-2">Ghost Icon Button (Primary)</h4>
          <div class="flex justify-center">
            <IconButton class="ic-btn-ghost-primary p-2">
              <MagnifyingGlassIcon class="w-5 h-5" />
            </IconButton>
          </div>
        </div>
        <div class="p-4 border rounded dark:border-gray-600">
          <h4 class="body-2 text-color mb-2">Gray Icon Button</h4>
          <div class="flex justify-center">
            <IconButton class="ic-btn-ghost-gray p-2">
              <Cog6ToothIcon class="w-5 h-5" />
            </IconButton>
          </div>
        </div>
        <div class="p-4 border rounded dark:border-gray-600">
          <h4 class="body-2 text-color mb-2">Ghost Icon Button (Danger)</h4>
          <div class="flex justify-center">
            <IconButton class="ic-btn-ghost-danger p-2">
              <XMarkIcon class="w-5 h-5" />
            </IconButton>
          </div>
        </div>
      </div>
    </section>

    <!-- Text Fields -->
    <section class="mb-10">
      <h3 class="heading-2 text-color mb-4">Text Fields</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div class="p-4 border rounded dark:border-gray-600">
          <h4 class="body-2 text-color mb-2">Text Field with Border</h4>
          <TextInput placeholder="Enter text..." bordered />
        </div>
        <div class="p-4 border rounded dark:border-gray-600">
          <h4 class="body-2 text-color mb-2">Text Field with Fill</h4>
          <TextInput placeholder="Enter text..." />
        </div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div class="p-4 border rounded dark:border-gray-600">
          <h4 class="body-2 text-color mb-2">Text Field with Label</h4>
          <LabeledTextInput label="Username" placeholder="Enter name..." />
        </div>
        <div class="p-4 border rounded dark:border-gray-600">
          <h4 class="body-2 text-color mb-2">Password Field</h4>
          <PasswordInput label="Password" placeholder="Enter password..." />
        </div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div class="p-4 border rounded dark:border-gray-600">
          <h4 class="body-2 text-color mb-2">Search Field</h4>
          <SearchInput placeholder="Search..." />
        </div>
        <div class="p-4 border rounded dark:border-gray-600">
          <h4 class="body-2 text-color mb-2">Textarea</h4>
          <Textarea placeholder="Enter multiple lines..." />
        </div>
      </div>
    </section>

    <!-- Checkboxes and Switches -->
    <section class="mb-10">
      <h3 class="heading-2 text-color mb-4">Checkboxes and Switches</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div class="p-4 border rounded dark:border-gray-600">
          <h4 class="body-2 text-color mb-2">Checkbox (Unchecked)</h4>
          <div class="flex items-center">
            <Checkbox :model-value="false" class="mr-2" />
            <span class="body-2 text-color">Unchecked</span>
          </div>
        </div>
        <div class="p-4 border rounded dark:border-gray-600">
          <h4 class="body-2 text-color mb-2">Checkbox (Checked)</h4>
          <div class="flex items-center">
            <Checkbox :model-value="true" class="mr-2" />
            <span class="body-2 text-color">Checked</span>
          </div>
        </div>
        <div class="p-4 border rounded dark:border-gray-600">
          <h4 class="body-2 text-color mb-2">Checkbox (Interactive)</h4>
          <div class="flex items-center">
            <Checkbox
              :model-value="checkboxValue"
              class="mr-2"
              @update:model-value="(v) => (checkboxValue = v)"
            />
            <span class="body-2 text-color">{{
              checkboxValue ? "Checked" : "Unchecked"
            }}</span>
          </div>
        </div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div class="p-4 border rounded dark:border-gray-600">
          <h4 class="body-2 text-color mb-2">Checkbox Array (v-model)</h4>
          <div class="space-y-2">
            <div class="flex items-center">
              <Checkbox
                v-model="checkboxArrayValue"
                value="option1"
                class="mr-2"
              />
              <span class="body-2 text-color">Варіант 1</span>
            </div>
            <div class="flex items-center">
              <Checkbox
                v-model="checkboxArrayValue"
                value="option2"
                class="mr-2"
              />
              <span class="body-2 text-color">Варіант 2</span>
            </div>
            <div class="flex items-center">
              <Checkbox
                v-model="checkboxArrayValue"
                value="option3"
                class="mr-2"
              />
              <span class="body-2 text-color">Варіант 3</span>
            </div>
            <div class="body-2 text-color mt-2">
              Обрано: {{ checkboxArrayValue.join(", ") || "Нічого" }}
            </div>
          </div>
        </div>
        <div class="p-4 border rounded dark:border-gray-600">
          <h4 class="body-2 text-color mb-2">Checkbox with v-model</h4>
          <div class="flex items-center">
            <Checkbox v-model="checkboxValue" class="mr-2" />
            <span class="body-2 text-color">{{
              checkboxValue ? "Відмічено" : "Не відмічено"
            }}</span>
          </div>
        </div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div class="p-4 border rounded dark:border-gray-600">
          <h4 class="body-2 text-color mb-2">Switch (Off)</h4>
          <div class="flex items-center">
            <SwitchInput :value="false" class="mr-2" />
            <span class="body-2 text-color">Off</span>
          </div>
        </div>
        <div class="p-4 border rounded dark:border-gray-600">
          <h4 class="body-2 text-color mb-2">Switch (On)</h4>
          <div class="flex items-center">
            <SwitchInput :value="true" class="mr-2" />
            <span class="body-2 text-color">On</span>
          </div>
        </div>
        <div class="p-4 border rounded dark:border-gray-600">
          <h4 class="body-2 text-color mb-2">Switch (Interactive)</h4>
          <div class="flex items-center">
            <SwitchInput
              :value="switchValue"
              class="mr-2"
              @switch-clicked="handleSwitchToggle"
            />
            <span class="body-2 text-color">{{
              switchValue ? "On" : "Off"
            }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Sliders and File Upload -->
    <section class="mb-10">
      <h3 class="heading-2 text-color mb-4">Sliders and File Upload</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="p-4 border rounded dark:border-gray-600">
          <h4 class="body-2 text-color mb-2">Slider ({{ sliderValue }}%)</h4>
          <RangeSlider
            :percentage="sliderValue"
            @value-changed="handleSliderChange"
          />
        </div>
        <div class="p-4 border rounded dark:border-gray-600">
          <h4 class="body-2 text-color mb-2">File Upload</h4>
          <DropFileUpload label="Upload File" />
        </div>
      </div>
    </section>

    <!-- Selects -->
    <section class="mb-10">
      <h3 class="heading-2 text-color mb-4">Selects</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="p-4 border rounded dark:border-gray-600">
          <h4 class="body-2 text-color mb-2">Single Select</h4>
          <Select
            v-model="singleSelectValue"
            :options="selectOptions"
            placeholder="Список мемберів"
          />
        </div>
        <div class="p-4 border rounded dark:border-gray-600">
          <h4 class="body-2 text-color mb-2">Multi Select</h4>
          <Select
            v-model="multiSelectValue"
            :options="selectOptions"
            multiple
            placeholder="Список мемберів"
          />
        </div>
      </div>
    </section>

    <!-- Autocomplete Selects -->
    <section class="mb-10">
      <h3 class="heading-2 text-color mb-4">Autocomplete Selects</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div class="p-4 border rounded dark:border-gray-600">
          <h4 class="body-2 text-color mb-2">Single Autocomplete Select</h4>
          <AutocompleteSelect
            v-model="singleAutocompleteValue"
            :options="selectOptions"
            placeholder="Пошук опцій..."
            label="Оберіть один варіант"
          />
        </div>
        <div class="p-4 border rounded dark:border-gray-600">
          <h4 class="body-2 text-color mb-2">Multi Autocomplete Select</h4>
          <AutocompleteSelect
            v-model="multiAutocompleteValue"
            :options="selectOptions"
            multiple
            placeholder="Пошук опцій..."
            label="Оберіть кілька варіантів"
          />
        </div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="p-4 border rounded dark:border-gray-600">
          <h4 class="body-2 text-color mb-2">Autocomplete with Border</h4>
          <AutocompleteSelect
            v-model="singleAutocompleteValue"
            :options="selectOptions"
            bordered
            placeholder="З рамкою..."
          />
        </div>
        <div class="p-4 border rounded dark:border-gray-600">
          <h4 class="body-2 text-color mb-2">Non-searchable Autocomplete</h4>
          <AutocompleteSelect
            v-model="singleAutocompleteValue"
            :options="selectOptions"
            :searchable="false"
            placeholder="Без пошуку..."
          />
        </div>
      </div>
    </section>
  </div>
</template>
