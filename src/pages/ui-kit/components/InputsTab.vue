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
    <h2 class="mb-6">Input Elements</h2>

    <!-- Buttons -->
    <section class="mb-10">
      <h3 class="mb-4">Buttons (Button)</h3>

      <!-- Primary, Secondary variants -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div class="p-4 border rounded dark:border-gray-600">
          <h4 class="mb-2">Primary Button</h4>
          <Button variant="primary">Основна кнопка</Button>
        </div>
        <div class="p-4 border rounded dark:border-gray-600">
          <h4 class="mb-2">Secondary Button</h4>
          <Button variant="secondary">Вторинна кнопка</Button>
        </div>
        <div class="p-4 border rounded dark:border-gray-600">
          <h4 class="mb-2">Loading Button</h4>
          <Button variant="primary" loading>Завантаження</Button>
        </div>
      </div>

      <!-- Outline variants -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div class="p-4 border rounded dark:border-gray-600">
          <h4 class="mb-2">Outline Primary</h4>
          <Button variant="outline">Контурна кнопка</Button>
        </div>
        <div class="p-4 border rounded dark:border-gray-600">
          <h4 class="mb-2">Ghost Button</h4>
          <Button variant="ghost">Примарна кнопка</Button>
        </div>
        <div class="p-4 border rounded dark:border-gray-600">
          <h4 class="mb-2">Text Button</h4>
          <Button variant="text">Текстова кнопка</Button>
        </div>
      </div>

      <!-- Sizes -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div class="p-4 border rounded dark:border-gray-600">
          <h4 class="mb-2">Small Button</h4>
          <Button size="sm">Мала кнопка</Button>
        </div>
        <div class="p-4 border rounded dark:border-gray-600">
          <h4 class="mb-2">Medium Button</h4>
          <Button size="md">Середня кнопка</Button>
        </div>
        <div class="p-4 border rounded dark:border-gray-600">
          <h4 class="mb-2">Large Button</h4>
          <Button size="lg">Велика кнопка</Button>
        </div>
      </div>

      <!-- States -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div class="p-4 border rounded dark:border-gray-600">
          <h4 class="mb-2">Disabled Button</h4>
          <Button disabled>Відключена кнопка</Button>
        </div>
        <div class="p-4 border rounded dark:border-gray-600">
          <h4 class="mb-2">Block Button</h4>
          <Button block>Блокова кнопка</Button>
        </div>
        <div class="p-4 border rounded dark:border-gray-600">
          <h4 class="mb-2">Link Button</h4>
          <Button link to="/ui-kit">Кнопка-посилання</Button>
        </div>
      </div>

      <!-- With Icons -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="p-4 border rounded dark:border-gray-600">
          <h4 class="mb-2">Button with Icon</h4>
          <Button variant="primary">
            <template #icon>
              <PaperAirplaneIcon class="w-5 h-5" />
            </template>
            Надіслати
          </Button>
        </div>
        <div class="p-4 border rounded dark:border-gray-600">
          <h4 class="mb-2">Icon Only Button</h4>
          <Button variant="outline" icon-only>
            <template #icon>
              <Cog6ToothIcon class="w-5 h-5" />
            </template>
          </Button>
        </div>
        <div class="p-4 border rounded dark:border-gray-600">
          <h4 class="mb-2">Ghost Icon Button</h4>
          <Button variant="ghost" icon-only>
            <template #icon>
              <TrashIcon class="w-5 h-5" />
            </template>
          </Button>
        </div>
      </div>
    </section>

    <!-- Icon Buttons (deprecated, replaced with Button icon-only) -->
    <section class="mb-10">
      <h3 class="mb-4">Icon Buttons (using Button component)</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div class="p-4 border rounded dark:border-gray-600">
          <h4 class="mb-2">Primary Icon Button</h4>
          <div class="flex justify-center">
            <Button variant="primary" icon-only size="md">
              <template #icon>
                <PaperAirplaneIcon class="w-5 h-5" />
              </template>
            </Button>
          </div>
        </div>
        <div class="p-4 border rounded dark:border-gray-600">
          <h4 class="mb-2">Secondary Icon Button</h4>
          <div class="flex justify-center">
            <Button variant="secondary" icon-only size="md">
              <template #icon>
                <UserPlusIcon class="w-5 h-5" />
              </template>
            </Button>
          </div>
        </div>
        <div class="p-4 border rounded dark:border-gray-600">
          <h4 class="mb-2">Outline Icon Button</h4>
          <div class="flex justify-center">
            <Button variant="outline" icon-only size="md">
              <template #icon>
                <TrashIcon class="w-5 h-5" />
              </template>
            </Button>
          </div>
        </div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="p-4 border rounded dark:border-gray-600">
          <h4 class="mb-2">Ghost Icon Button</h4>
          <div class="flex justify-center">
            <Button variant="ghost" icon-only size="md">
              <template #icon>
                <MagnifyingGlassIcon class="w-5 h-5" />
              </template>
            </Button>
          </div>
        </div>
        <div class="p-4 border rounded dark:border-gray-600">
          <h4 class="mb-2">Small Icon Button</h4>
          <div class="flex justify-center">
            <Button variant="primary" icon-only size="sm">
              <template #icon>
                <Cog6ToothIcon class="w-4 h-4" />
              </template>
            </Button>
          </div>
        </div>
        <div class="p-4 border rounded dark:border-gray-600">
          <h4 class="mb-2">Large Icon Button</h4>
          <div class="flex justify-center">
            <Button variant="ghost" icon-only size="lg">
              <template #icon>
                <XMarkIcon class="w-6 h-6" />
              </template>
            </Button>
          </div>
        </div>
      </div>
    </section>

    <!-- Text Fields -->
    <section class="mb-10">
      <h3 class="mb-4">Text Fields</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div class="p-4 border rounded dark:border-gray-600">
          <h4 class="mb-2">Text Field with Border</h4>
          <TextInput placeholder="Enter text..." bordered />
        </div>
        <div class="p-4 border rounded dark:border-gray-600">
          <h4 class="mb-2">Text Field with Fill</h4>
          <TextInput placeholder="Enter text..." />
        </div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div class="p-4 border rounded dark:border-gray-600">
          <h4 class="mb-2">Text Field with Label</h4>
          <LabeledTextInput label="Username" placeholder="Enter name..." />
        </div>
        <div class="p-4 border rounded dark:border-gray-600">
          <h4 class="mb-2">Password Field</h4>
          <PasswordInput label="Password" placeholder="Enter password..." />
        </div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div class="p-4 border rounded dark:border-gray-600">
          <h4 class="mb-2">Search Field</h4>
          <SearchInput placeholder="Search..." />
        </div>
        <div class="p-4 border rounded dark:border-gray-600">
          <h4 class="mb-2">Textarea</h4>
          <Textarea placeholder="Enter multiple lines..." />
        </div>
      </div>
    </section>

    <!-- Checkboxes and Switches -->
    <section class="mb-10">
      <h3 class="mb-4">Checkboxes and Switches</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div class="p-4 border rounded dark:border-gray-600">
          <h4 class="mb-2">Checkbox (Unchecked)</h4>
          <div class="flex items-center">
            <Checkbox :model-value="false" class="mr-2" />
            <span class="">Unchecked</span>
          </div>
        </div>
        <div class="p-4 border rounded dark:border-gray-600">
          <h4 class="mb-2">Checkbox (Checked)</h4>
          <div class="flex items-center">
            <Checkbox :model-value="true" class="mr-2" />
            <span class="">Checked</span>
          </div>
        </div>
        <div class="p-4 border rounded dark:border-gray-600">
          <h4 class="mb-2">Checkbox (Interactive)</h4>
          <div class="flex items-center">
            <Checkbox
              :model-value="checkboxValue"
              class="mr-2"
              @update:model-value="(v) => (checkboxValue = v)"
            />
            <span class="">{{ checkboxValue ? "Checked" : "Unchecked" }}</span>
          </div>
        </div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div class="p-4 border rounded dark:border-gray-600">
          <h4 class="mb-2">Checkbox Array (v-model)</h4>
          <div class="space-y-2">
            <div class="flex items-center">
              <Checkbox
                v-model="checkboxArrayValue"
                value="option1"
                class="mr-2"
              />
              <span class="">Варіант 1</span>
            </div>
            <div class="flex items-center">
              <Checkbox
                v-model="checkboxArrayValue"
                value="option2"
                class="mr-2"
              />
              <span class="">Варіант 2</span>
            </div>
            <div class="flex items-center">
              <Checkbox
                v-model="checkboxArrayValue"
                value="option3"
                class="mr-2"
              />
              <span class="">Варіант 3</span>
            </div>
            <div class="mt-2">
              Обрано: {{ checkboxArrayValue.join(", ") || "Нічого" }}
            </div>
          </div>
        </div>
        <div class="p-4 border rounded dark:border-gray-600">
          <h4 class="mb-2">Checkbox with v-model</h4>
          <div class="flex items-center">
            <Checkbox v-model="checkboxValue" class="mr-2" />
            <span class="">{{
              checkboxValue ? "Відмічено" : "Не відмічено"
            }}</span>
          </div>
        </div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div class="p-4 border rounded dark:border-gray-600">
          <h4 class="mb-2">Switch (Off)</h4>
          <div class="flex items-center">
            <SwitchInput :value="false" class="mr-2" />
            <span class="">Off</span>
          </div>
        </div>
        <div class="p-4 border rounded dark:border-gray-600">
          <h4 class="mb-2">Switch (On)</h4>
          <div class="flex items-center">
            <SwitchInput :value="true" class="mr-2" />
            <span class="">On</span>
          </div>
        </div>
        <div class="p-4 border rounded dark:border-gray-600">
          <h4 class="mb-2">Switch (Interactive)</h4>
          <div class="flex items-center">
            <SwitchInput
              :value="switchValue"
              class="mr-2"
              @switch-clicked="handleSwitchToggle"
            />
            <span class="">{{ switchValue ? "On" : "Off" }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Sliders and File Upload -->
    <section class="mb-10">
      <h3 class="mb-4">Sliders and File Upload</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="p-4 border rounded dark:border-gray-600">
          <h4 class="mb-2">Slider ({{ sliderValue }}%)</h4>
          <RangeSlider
            :percentage="sliderValue"
            @value-changed="handleSliderChange"
          />
        </div>
        <div class="p-4 border rounded dark:border-gray-600">
          <h4 class="mb-2">File Upload</h4>
          <DropFileUpload label="Upload File" />
        </div>
      </div>
    </section>

    <!-- Selects -->
    <section class="mb-10">
      <h3 class="mb-4">Selects</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="p-4 border rounded dark:border-gray-600">
          <h4 class="mb-2">Single Select</h4>
          <Select
            v-model="singleSelectValue"
            :options="selectOptions"
            placeholder="Список мемберів"
          />
        </div>
        <div class="p-4 border rounded dark:border-gray-600">
          <h4 class="mb-2">Multi Select</h4>
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
      <h3 class="mb-4">Autocomplete Selects</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div class="p-4 border rounded dark:border-gray-600">
          <h4 class="mb-2">Single Autocomplete Select</h4>
          <AutocompleteSelect
            v-model="singleAutocompleteValue"
            :options="selectOptions"
            placeholder="Пошук опцій..."
            label="Оберіть один варіант"
          />
        </div>
        <div class="p-4 border rounded dark:border-gray-600">
          <h4 class="mb-2">Multi Autocomplete Select</h4>
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
          <h4 class="mb-2">Autocomplete with Border</h4>
          <AutocompleteSelect
            v-model="singleAutocompleteValue"
            :options="selectOptions"
            bordered
            placeholder="З рамкою..."
          />
        </div>
        <div class="p-4 border rounded dark:border-gray-600">
          <h4 class="mb-2">Non-searchable Autocomplete</h4>
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
