<script setup lang="ts">
import { ref } from "vue";

import Button from "@src/ui/inputs/Button.vue";
import TextInput from "@src/ui/inputs/TextInput.vue";
import Textarea from "@src/ui/inputs/Textarea.vue";
import SearchInput from "@src/ui/inputs/SearchInput.vue";
import CurrencyInput from "@src/ui/inputs/CurrencyInput.vue";

import {
  PaperAirplaneIcon,
  Cog6ToothIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
} from "@heroicons/vue/24/outline";

const textInputValue = ref("");
const textareaValue = ref("");
const searchValue = ref("");
const currencyValue = ref(9100);
</script>

<template>
  <div>
    <h2 class="mb-6">Input Elements</h2>

    <!-- Buttons -->
    <section class="mb-10">
      <h3 class="mb-4">Buttons</h3>

      <!-- Variants -->
      <div class="p-4 border rounded dark:border-gray-600 mb-6">
        <h4 class="mb-4">Варіанти</h4>
        <div class="flex flex-wrap items-start gap-4">
          <Button variant="primary">Основна</Button>
          <Button variant="secondary">Вторинна</Button>
          <Button variant="outline">Контурна</Button>
          <Button variant="ghost">Привидна</Button>
          <Button variant="text">Текстова</Button>
        </div>
      </div>

      <!-- Sizes -->
      <div class="p-4 border rounded dark:border-gray-600 mb-6">
        <h4 class="mb-4">Розміри</h4>
        <div class="flex flex-wrap items-center gap-4">
          <Button size="sm">Маленька</Button>
          <Button size="md">Середня</Button>
          <Button size="lg">Велика</Button>
        </div>
      </div>

      <!-- States -->
      <div class="p-4 border rounded dark:border-gray-600 mb-6">
        <h4 class="mb-4">Стани</h4>
        <div class="flex flex-wrap items-start gap-4">
          <Button loading>Завантаження</Button>
          <Button disabled>Вимкнена</Button>
        </div>
      </div>

      <!-- With Icons -->
      <div class="p-4 border rounded dark:border-gray-600 mb-6">
        <h4 class="mb-4">З іконками</h4>
        <div class="flex flex-wrap items-center gap-4">
          <Button>
            <template #icon>
              <PaperAirplaneIcon />
            </template>
            Надіслати
          </Button>
          <Button icon-only>
            <template #icon>
              <Cog6ToothIcon />
            </template>
          </Button>
          <Button variant="outline" icon-only>
            <template #icon>
              <TrashIcon />
            </template>
          </Button>
        </div>
      </div>

      <!-- Other -->
      <div class="p-4 border rounded dark:border-gray-600">
        <h4 class="mb-4">Інше</h4>
        <div class="flex flex-col items-start gap-4">
          <Button link to="/ui-kit">Кнопка-посилання</Button>
          <Button block>Блокова кнопка</Button>
        </div>
      </div>
    </section>

    <!-- Text Inputs -->
    <section class="mb-10">
      <h3 class="mb-4">Текстові поля</h3>

      <!-- Variants -->
      <div class="p-4 border rounded dark:border-gray-600 mb-6">
        <h4 class="mb-4">Варіанти</h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextInput
            v-model="textInputValue"
            variant="default"
            placeholder="Звичайне поле..."
          />
          <TextInput
            v-model="textInputValue"
            variant="filled"
            placeholder="Заповнене поле..."
          />
          <TextInput
            v-model="textInputValue"
            variant="bordered"
            placeholder="Поле з рамкою..."
          />
        </div>
      </div>

      <!-- Sizes -->
      <div class="p-4 border rounded dark:border-gray-600 mb-6">
        <h4 class="mb-4">Розміри</h4>
        <div class="flex flex-col gap-4">
          <TextInput
            v-model="textInputValue"
            size="sm"
            placeholder="Маленьке поле..."
          />
          <TextInput
            v-model="textInputValue"
            size="md"
            placeholder="Середнє поле..."
          />
          <TextInput
            v-model="textInputValue"
            size="lg"
            placeholder="Велике поле..."
          />
        </div>
      </div>

      <!-- States -->
      <div class="p-4 border rounded dark:border-gray-600 mb-6">
        <h4 class="mb-4">Стани</h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextInput v-model="textInputValue" placeholder="Звичайне" />
          <TextInput v-model="textInputValue" placeholder="Вимкнене" disabled />
        </div>
      </div>

      <!-- With Icons -->
      <div class="p-4 border rounded dark:border-gray-600 mb-6">
        <h4 class="mb-4">З іконками</h4>
        <div class="flex flex-col gap-4">
          <TextInput v-model="textInputValue" placeholder="Іконка зліва">
            <template #iconLeft>
              <MagnifyingGlassIcon />
            </template>
          </TextInput>
          <TextInput v-model="textInputValue" placeholder="Іконка справа">
            <template #iconRight>
              <ArrowRightIcon />
            </template>
          </TextInput>
          <TextInput v-model="textInputValue" placeholder="Іконки з обох боків">
            <template #iconLeft>
              <ArrowLeftIcon />
            </template>
            <template #iconRight>
              <ArrowRightIcon />
            </template>
          </TextInput>
        </div>
      </div>

      <!-- Other -->
      <div class="p-4 border rounded dark:border-gray-600">
        <h4 class="mb-4">Інше</h4>
        <TextInput
          v-model="textInputValue"
          block
          placeholder="Блокове поле..."
        />
      </div>
    </section>

    <!-- Search Inputs -->
    <section class="mb-10">
      <h3 class="mb-4">Поля пошуку</h3>
      <div class="p-4 border rounded dark:border-gray-600">
        <h4 class="mb-4">Варіанти</h4>
        <div class="flex flex-col gap-4">
          <SearchInput v-model="searchValue" />
          <SearchInput
            v-model="searchValue"
            variant="bordered"
            placeholder="Пошук з рамкою..."
          />
          <SearchInput
            v-model="searchValue"
            variant="filled"
            placeholder="Заповнене поле пошуку..."
          />
        </div>
      </div>
    </section>

    <section class="mb-10">
      <h3 class="mb-4">Поля пошуку</h3>
      <div class="p-4 border rounded dark:border-gray-600">
        <h4 class="mb-4">Варіанти</h4>
        <div class="flex flex-col gap-4">
          <SearchInput v-model="searchValue" size="sm" />
          <SearchInput v-model="searchValue" size="md" />
          <SearchInput v-model="searchValue" size="lg" />
        </div>
      </div>
    </section>

    <!-- Currency Inputs -->
    <section class="mb-10">
      <h3 class="mb-4">Поля валюти</h3>

      <!-- Sizes -->
      <div class="p-4 border rounded dark:border-gray-600 mb-6">
        <h4 class="mb-4">Розміри</h4>
        <div class="flex flex-col gap-4">
          <CurrencyInput v-model="currencyValue" size="sm" placeholder="0" />
          <CurrencyInput v-model="currencyValue" size="md" placeholder="0" />
          <CurrencyInput v-model="currencyValue" size="lg" placeholder="0" />
        </div>
      </div>

      <!-- Different Currencies -->
      <div class="p-4 border rounded dark:border-gray-600 mb-6">
        <h4 class="mb-4">Різні валюти</h4>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <CurrencyInput v-model="currencyValue" placeholder="0" />
          <CurrencyInput v-model="currencyValue" currency="$" placeholder="0" />
          <CurrencyInput v-model="currencyValue" currency="€" placeholder="0" />
        </div>
      </div>
    </section>

    <!-- Textareas -->
    <section class="mb-10">
      <h3 class="mb-4">Текстові області</h3>

      <!-- Variants -->
      <div class="p-4 border rounded dark:border-gray-600 mb-6">
        <h4 class="mb-4">Варіанти</h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Textarea
            v-model="textareaValue"
            variant="default"
            placeholder="Звичайна область..."
          />
          <Textarea
            v-model="textareaValue"
            variant="filled"
            placeholder="Заповнена область..."
          />
          <Textarea
            v-model="textareaValue"
            variant="bordered"
            placeholder="Область з рамкою..."
          />
        </div>
      </div>

      <!-- Sizes -->
      <div class="p-4 border rounded dark:border-gray-600 mb-6">
        <h4 class="mb-4">Розміри</h4>
        <div class="flex flex-col gap-4">
          <Textarea
            v-model="textareaValue"
            size="sm"
            placeholder="Маленька область..."
          />
          <Textarea
            v-model="textareaValue"
            size="md"
            placeholder="Середня область..."
          />
          <Textarea
            v-model="textareaValue"
            size="lg"
            placeholder="Велика область..."
          />
        </div>
      </div>

      <!-- States -->
      <div class="p-4 border rounded dark:border-gray-600 mb-6">
        <h4 class="mb-4">Стани</h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Textarea v-model="textareaValue" placeholder="Звичайна" />
          <Textarea v-model="textareaValue" placeholder="Вимкнена" disabled />
        </div>
      </div>

      <!-- Other -->
      <div class="p-4 border rounded dark:border-gray-600">
        <h4 class="mb-4">Інше</h4>
        <Textarea
          v-model="textareaValue"
          block
          placeholder="Блокова область..."
        />
      </div>
    </section>
  </div>
</template>
