<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from "vue";
import { XMarkIcon } from "@heroicons/vue/24/outline";
import ChevronDownIcon from "../../shared/icons/ChevronDownIcon.vue";
import Checkbox from "./Checkbox.vue";
import TextInput from "./TextInput.vue";

type Option = {
  value: string | number;
  label: string;
};

const modelValue = defineModel<(string | number)[] | string | number>({
  required: true,
});

const props = withDefaults(
  defineProps<{
    options: Option[];
    multiple?: boolean;
    placeholder?: string;
    label?: string;
    bordered?: boolean;
    searchable?: boolean;
    debounceMs?: number;
    filterFunction?: (options: Option[], query: string) => Option[];
  }>(),
  {
    multiple: false,
    placeholder: "Виберіть...",
    label: "",
    bordered: false,
    searchable: true,
    debounceMs: 300,
    filterFunction: undefined,
  },
);

const emit = defineEmits<{
  search: [query: string];
}>();

const searchQuery = ref("");
const isOpen = ref(false);
const openUpwards = ref(false);
const selectElement = ref<HTMLElement | null>(null);
const dropdownMenu = ref<HTMLElement | null>(null);
const inputElement = ref<InstanceType<typeof TextInput> | null>(null);
const highlightedIndex = ref(-1);

const dropdownStyle = ref({});

const defaultFilterFunction = (options: Option[], query: string) => {
  if (!query) return options;
  return options.filter((option) =>
    option.label.toLowerCase().includes(query.toLowerCase()),
  );
};

let searchTimeout: number;
const debouncedEmitSearch = (query: string) => {
  clearTimeout(searchTimeout);
  searchTimeout = window.setTimeout(() => {
    emit("search", query);
  }, props.debounceMs);
};

const filteredOptions = computed(() => {
  const filterFn = props.filterFunction || defaultFilterFunction;
  return filterFn(props.options, searchQuery.value);
});

const selectedOptions = computed(() => {
  if (props.multiple) {
    return props.options.filter((option) =>
      (modelValue.value as (string | number)[]).includes(option.value),
    );
  } else {
    const selected = props.options.find(
      (option) => option.value === modelValue.value,
    );
    return selected ? [selected] : [];
  }
});

const displayValue = computed(() => {
  if (isOpen.value && props.searchable) {
    return searchQuery.value;
  }

  if (props.multiple) {
    if (!Array.isArray(modelValue.value) || modelValue.value.length === 0) {
      return "";
    }
    if (selectedOptions.value.length > 1) {
      return `${selectedOptions.value.length} обрано`;
    }
    if (selectedOptions.value.length === 1) {
      return selectedOptions.value[0].label;
    }
    return "";
  } else {
    return selectedOptions.value[0]?.label || "";
  }
});

const showClearButton = computed(() => {
  if (props.multiple) {
    return Array.isArray(modelValue.value) && modelValue.value.length > 0;
  } else {
    return (
      modelValue.value !== null &&
      modelValue.value !== undefined &&
      modelValue.value !== ""
    );
  }
});

const computedPlaceholder = computed(() => {
  return displayValue.value || props.placeholder;
});

const clearSelection = (event: MouseEvent) => {
  event.stopPropagation();
  if (props.multiple) {
    modelValue.value = [];
  } else {
    modelValue.value = "";
  }
  searchQuery.value = "";
};

const updateDropdownPosition = () => {
  if (!isOpen.value || !selectElement.value) {
    return;
  }

  if (!dropdownMenu.value) {
    nextTick(() => updateDropdownPosition());
    return;
  }

  const selectRect = selectElement.value.getBoundingClientRect();
  const menuHeight = dropdownMenu.value?.offsetHeight || 240;
  const spaceBelow = window.innerHeight - selectRect.bottom;

  openUpwards.value = spaceBelow < menuHeight && selectRect.top > menuHeight;

  const calculatedStyle = {
    top: openUpwards.value
      ? `${Math.round(selectRect.top - menuHeight)}px`
      : `${Math.round(selectRect.bottom)}px`,
    left: `${Math.round(selectRect.left)}px`,
    minWidth: `${Math.round(selectRect.width)}px`,
  };

  dropdownStyle.value = calculatedStyle;
};

const openDropdown = () => {
  isOpen.value = true;
  highlightedIndex.value = -1;

  nextTick(() => {
    if (props.searchable) {
      (inputElement.value?.$el as HTMLInputElement)?.focus();
    }
  });
};

const toggleDropdown = () => {
  if (isOpen.value) {
    closeDropdown();
  } else {
    openDropdown();
  }
};

const closeDropdown = (event?: MouseEvent) => {
  if (!event) {
    isOpen.value = false;
    highlightedIndex.value = -1;
    return;
  }

  // Don't close if clicking inside the select element
  if (selectElement.value?.contains(event.target as Node)) return;

  // Don't close if clicking inside the dropdown menu
  if (dropdownMenu.value?.contains(event.target as Node)) return;

  isOpen.value = false;
  highlightedIndex.value = -1;
  if (
    props.searchable &&
    !props.multiple &&
    selectedOptions.value.length === 0
  ) {
    searchQuery.value = "";
  }
};

const isSelected = (optionValue: string | number) => {
  if (props.multiple) {
    return (modelValue.value as (string | number)[]).includes(optionValue);
  }
  return modelValue.value === optionValue;
};

const selectOption = (option: Option) => {
  if (props.multiple) {
    const selected = isSelected(option.value);
    let newValue: (string | number)[];

    if (selected) {
      newValue = (modelValue.value as (string | number)[]).filter(
        (item) => item !== option.value,
      );
    } else {
      newValue = [...(modelValue.value as (string | number)[]), option.value];
    }

    modelValue.value = newValue;
  } else {
    modelValue.value = option.value;
    searchQuery.value = option.label;
    closeDropdown();
  }
};

const handleInputChange = () => {
  if (props.searchable) {
    highlightedIndex.value = -1;
    debouncedEmitSearch(searchQuery.value);
  }
};

const navigateToNext = () => {
  if (filteredOptions.value.length === 0) return;

  highlightedIndex.value =
    highlightedIndex.value < filteredOptions.value.length - 1
      ? highlightedIndex.value + 1
      : 0;
  scrollToHighlighted();
};

const navigateToPrevious = () => {
  if (filteredOptions.value.length === 0) return;

  highlightedIndex.value =
    highlightedIndex.value > 0
      ? highlightedIndex.value - 1
      : filteredOptions.value.length - 1;
  scrollToHighlighted();
};

const scrollToHighlighted = () => {
  nextTick(() => {
    const menu = dropdownMenu.value;
    if (!menu) return;

    const items = menu.querySelectorAll("[data-option-index]");
    const highlightedItem = items[highlightedIndex.value] as HTMLElement;

    if (highlightedItem) {
      const menuRect = menu.getBoundingClientRect();
      const itemRect = highlightedItem.getBoundingClientRect();

      if (itemRect.bottom > menuRect.bottom) {
        menu.scrollTop += itemRect.bottom - menuRect.bottom;
      } else if (itemRect.top < menuRect.top) {
        menu.scrollTop -= menuRect.top - itemRect.top;
      }
    }
  });
};

const selectHighlighted = () => {
  if (
    highlightedIndex.value >= 0 &&
    highlightedIndex.value < filteredOptions.value.length
  ) {
    selectOption(filteredOptions.value[highlightedIndex.value]);
  }
};

const handleKeydown = (event: KeyboardEvent) => {
  if (
    !isOpen.value &&
    (event.key === "ArrowDown" || event.key === "ArrowUp" || event.key === " ")
  ) {
    event.preventDefault();
    openDropdown();
    return;
  }

  if (isOpen.value) {
    switch (event.key) {
      case "Escape":
        event.preventDefault();
        closeDropdown();
        break;
      case "ArrowDown":
        event.preventDefault();
        navigateToNext();
        break;
      case "ArrowUp":
        event.preventDefault();
        navigateToPrevious();
        break;
      case "Enter":
        event.preventDefault();
        if (highlightedIndex.value >= 0) {
          selectHighlighted();
        } else if (filteredOptions.value.length === 1) {
          selectOption(filteredOptions.value[0]);
        }
        break;
      case "Tab":
        if (highlightedIndex.value >= 0) {
          event.preventDefault();
          selectHighlighted();
        } else {
          closeDropdown();
        }
        break;
    }
  }
};

let positionTimeout: number;
const debouncedUpdateDropdownPosition = () => {
  clearTimeout(positionTimeout);
  positionTimeout = window.setTimeout(() => {
    updateDropdownPosition();
  }, 50);
};

onMounted(() => {
  document.addEventListener("click", closeDropdown);
  window.addEventListener("scroll", debouncedUpdateDropdownPosition, true);
  window.addEventListener("resize", debouncedUpdateDropdownPosition);
});

onUnmounted(() => {
  document.removeEventListener("click", closeDropdown);
  window.removeEventListener("scroll", debouncedUpdateDropdownPosition, true);
  window.removeEventListener("resize", debouncedUpdateDropdownPosition);
});

watch(isOpen, (value) => {
  if (value) {
    updateDropdownPosition();
  } else {
    searchQuery.value = displayValue.value;
  }
});

watch(filteredOptions, () => {
  highlightedIndex.value = -1;
});
</script>

<template>
  <div class="flex flex-col">
    <!-- Label -->
    <label v-if="label" class="mb-3 text-left">
      {{ label }}
    </label>

    <!-- Input container -->
    <div ref="selectElement" class="relative">
      <TextInput
        ref="inputElement"
        v-model="searchQuery"
        :placeholder="computedPlaceholder"
        :bordered="bordered"
        :readonly="!searchable"
        class="pr-16"
        @input="handleInputChange"
        @click="openDropdown"
        @keydown="handleKeydown"
      />

      <!-- Clear button -->
      <button
        v-if="showClearButton"
        type="button"
        class="absolute top-1/2 transform -translate-y-1/2 right-7 text-gray-400 hover:text-gray-600 z-10"
        @mousedown.prevent="clearSelection"
      >
        <XMarkIcon class="h-4 w-4" />
      </button>

      <!-- Dropdown arrow -->
      <button
        type="button"
        class="absolute top-1/2 transform -translate-y-1/2 right-3 text-gray-400 z-10"
        @mousedown.prevent="toggleDropdown"
      >
        <ChevronDownIcon
          class="h-5 w-5 transition-transform duration-200"
          :class="{ 'rotate-180': isOpen }"
        />
      </button>
    </div>

    <!-- Dropdown -->
    <Teleport to="body">
      <transition
        enter-active-class="transition duration-100 ease-out"
        enter-from-class="transform scale-95 opacity-0"
        enter-to-class="transform scale-100 opacity-100"
        leave-active-class="transition duration-75 ease-in"
        leave-from-class="transform scale-100 opacity-100"
        leave-to-class="transform scale-95 opacity-0"
      >
        <div
          v-if="isOpen"
          ref="dropdownMenu"
          :style="dropdownStyle"
          class="z-50 bg-theme-surface rounded-md shadow-lg border max-h-60 overflow-y-auto scrollbar-thin fixed"
        >
          <div
            v-if="filteredOptions.length === 0"
            class="px-3 py-2 text-text-secondary"
          >
            Нічого не знайдено
          </div>

          <ul v-else class="divide-y">
            <li
              v-for="(option, index) in filteredOptions"
              :key="option.value"
              :data-option-index="index"
              class="text-text-primary relative cursor-pointer select-none"
              @mousedown.prevent="selectOption(option)"
              @click.stop.prevent="selectOption(option)"
              @mouseenter="highlightedIndex = index"
            >
              <div
                class="p-3 flex items-center space-x-3 rounded-sm"
                :class="{
                  'bg-primary text-white': isSelected(option.value),
                }"
              >
                <Checkbox
                  v-if="multiple"
                  :model-value="isSelected(option.value)"
                  class="mr-2"
                />
                <span class="truncate">{{ option.label }}</span>
              </div>
            </li>
          </ul>
        </div>
      </transition>
    </Teleport>
  </div>
</template>
