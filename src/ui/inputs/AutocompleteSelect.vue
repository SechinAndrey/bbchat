<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from "vue";
import { XMarkIcon } from "@heroicons/vue/24/outline";
import ChevronDownIcon from "../../shared/icons/ChevronDownIcon.vue";
import Checkbox from "./Checkbox.vue";

type Option = {
  value: string | number;
  label: string;
};

const modelValue = defineModel<(string | number)[] | string | number>({
  required: true,
});

// Same as TextInput.vue - refactor?
const INPUT_SIZES = {
  sm: {
    height: "h-[2rem]",
    padding: "px-3",
    text: "text-sm",
  },
  md: {
    height: "h-[2.25rem]",
    padding: "px-4",
    text: "text-base",
  },
  lg: {
    height: "h-[2.75rem]",
    padding: "px-5",
    text: "text-lg",
  },
} as const;

const INPUT_VARIANTS = {
  default: "input-default",
  filled: "input-filled",
  bordered: "input-bordered",
} as const;

type InputSize = keyof typeof INPUT_SIZES;
type InputVariant = keyof typeof INPUT_VARIANTS;

const props = withDefaults(
  defineProps<{
    options: Option[];
    multiple?: boolean;
    placeholder?: string;
    label?: string;
    searchable?: boolean;
    debounceMs?: number;
    filterFunction?: (options: Option[], query: string) => Option[];
    size?: InputSize;
    variant?: InputVariant;
    block?: boolean;
    disabled?: boolean;
    error?: string;
  }>(),
  {
    multiple: false,
    placeholder: "Виберіть...",
    label: "",
    searchable: true,
    debounceMs: 300,
    filterFunction: undefined,
    size: "sm",
    variant: "default",
    block: false,
    disabled: false,
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
const inputElement = ref<HTMLInputElement | null>(null);
const highlightedIndex = ref(-1);

const dropdownStyle = ref({});

const sizeConfig = computed(() => INPUT_SIZES[props.size] || INPUT_SIZES.md);

const inputClasses = computed(() => {
  const variantClass = INPUT_VARIANTS[props.variant];

  return [
    "input",
    "text-ellipsis",
    variantClass,
    sizeConfig.value.height,
    sizeConfig.value.text,
    sizeConfig.value.padding,
    "pr-9", // space for icons
    {
      "input-block": props.block,
      "input-disabled": props.disabled,
      "input-error": props.error,
    },
  ];
});

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

  const viewportHeight = window.visualViewport?.height || window.innerHeight;

  const spaceBelow = viewportHeight - selectRect.bottom;
  const spaceAbove = selectRect.top;

  openUpwards.value = spaceBelow < menuHeight && spaceAbove > menuHeight;

  const scrollY = window.scrollY || window.pageYOffset;
  const scrollX = window.scrollX || window.pageXOffset;

  const calculatedStyle = {
    top: openUpwards.value
      ? `${Math.round(selectRect.top + scrollY - menuHeight)}px`
      : `${Math.round(selectRect.bottom + scrollY)}px`,
    left: `${Math.round(selectRect.left + scrollX)}px`,
    minWidth: `${Math.round(selectRect.width)}px`,
    maxWidth: `${Math.round(selectRect.width)}px`,
  };

  dropdownStyle.value = calculatedStyle;
};

const openDropdown = () => {
  if (props.searchable) {
    searchQuery.value = "";
  }
  isOpen.value = true;
  highlightedIndex.value = -1;

  nextTick(() => {
    if (props.searchable) {
      inputElement.value?.focus();
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

  const target = event.target as Node;

  // Don't close if clicking inside the select element
  if (selectElement.value?.contains(target)) return;

  // Don't close if clicking inside the dropdown menu
  if (dropdownMenu.value?.contains(target)) return;

  const closestDropdown = (target as Element).closest?.(".z-50");
  if (closestDropdown === dropdownMenu.value) return;

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
  document.addEventListener("click", closeDropdown, true);
  window.addEventListener("scroll", debouncedUpdateDropdownPosition, true);
  window.addEventListener("resize", debouncedUpdateDropdownPosition);

  if (window.visualViewport) {
    window.visualViewport.addEventListener(
      "resize",
      debouncedUpdateDropdownPosition,
    );
    window.visualViewport.addEventListener(
      "scroll",
      debouncedUpdateDropdownPosition,
    );
  }
});

onUnmounted(() => {
  document.removeEventListener("click", closeDropdown, true);
  window.removeEventListener("scroll", debouncedUpdateDropdownPosition, true);
  window.removeEventListener("resize", debouncedUpdateDropdownPosition);

  if (window.visualViewport) {
    window.visualViewport.removeEventListener(
      "resize",
      debouncedUpdateDropdownPosition,
    );
    window.visualViewport.removeEventListener(
      "scroll",
      debouncedUpdateDropdownPosition,
    );
  }
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

watch(modelValue, () => {
  if (!isOpen.value) {
    searchQuery.value = displayValue.value;
  }
});
</script>

<template>
  <div class="flex flex-col pb-4 relative">
    <!-- Label -->
    <label v-if="label" class="mb-3 text-left text-sm text-app-text">
      {{ label }}
    </label>

    <!-- Input container -->
    <div ref="selectElement" class="relative">
      <input
        ref="inputElement"
        v-model="searchQuery"
        type="text"
        :placeholder="computedPlaceholder"
        :readonly="!searchable"
        :disabled="disabled"
        :class="inputClasses"
        @input="handleInputChange"
        @click="openDropdown"
        @keydown="handleKeydown"
      />

      <!-- Icons container -->
      <div
        class="absolute top-1/2 transform -translate-y-1/2 right-3 flex items-center space-x-2 text-gray-400 z-10"
      >
        <!-- Error icon -->
        <span v-if="props.error" class="text-danger pointer-events-none">
          <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fill-rule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clip-rule="evenodd"
            />
          </svg>
        </span>

        <!-- Clear button -->
        <button
          v-if="showClearButton"
          type="button"
          class="hover:text-gray-600"
          @mousedown.prevent="clearSelection"
        >
          <XMarkIcon class="h-4 w-4" />
        </button>

        <!-- Dropdown arrow -->
        <button type="button" @mousedown.prevent="toggleDropdown">
          <ChevronDownIcon
            class="h-5 w-5 transition-transform duration-200"
            :class="{ 'rotate-180': isOpen }"
          />
        </button>
      </div>
    </div>

    <!-- Error message -->
    <div
      v-if="props.error"
      class="text-left mt-0.5 text-[0.6875rem] leading-tight"
      style="color: var(--color-state-danger)"
    >
      {{ props.error }}
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
          class="z-[100] bg-theme-surface rounded-md shadow-lg border max-h-60 max-w-xs overflow-y-auto scrollbar-thin fixed"
        >
          <div
            v-if="filteredOptions.length === 0"
            class="px-3 py-4 bg-app-bg text-app-text text-center"
          >
            Нічого не знайдено
          </div>

          <ul v-else class="divide-y">
            <li
              v-for="(option, index) in filteredOptions"
              :key="option.value"
              :data-option-index="index"
              class="text-app-text relative cursor-pointer select-none bg-app-bg p-3 flex items-center space-x-3 transition-colors duration-150"
              :class="{
                'bg-primary text-white': isSelected(option.value),
                'bg-app-bg-secondary':
                  highlightedIndex === index && !isSelected(option.value),
              }"
              @mousedown.prevent="selectOption(option)"
              @click.stop.prevent="selectOption(option)"
              @mouseenter="highlightedIndex = index"
            >
              <Checkbox
                v-if="multiple"
                :model-value="isSelected(option.value)"
                class="mr-2"
                tabindex="-1"
              />
              <span class="truncate flex-1">{{ option.label }}</span>
            </li>
          </ul>
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<style scoped>
.input {
  @apply w-full transition-all duration-200 ease-in-out
         focus:outline-none focus:ring-2 focus:ring-offset-2;
  border-radius: var(--btn-border-radius);
  color: var(--color-input-text);
  --tw-ring-color: var(--color-input-focus);
  --tw-ring-offset-color: var(--color-focus-offset);
}

.input::placeholder {
  color: var(--color-input-placeholder);
}

.input-default {
  background-color: var(--color-input-bg);
  border: 1px solid transparent;
}

.input-default:focus {
  border-color: var(--color-primary);
}

.input-filled {
  background-color: var(--color-input-bg-alt);
  border: 1px solid transparent;
}

.input-filled:focus {
  border-color: var(--color-primary);
}

.input-bordered {
  background-color: transparent;
  border: 1px solid var(--color-input-border);
}

.input-bordered:focus {
  border-color: var(--color-primary);
}

.input-disabled {
  @apply cursor-not-allowed opacity-60;
  background-color: var(--color-btn-disabled-bg) !important;
  border-color: var(--color-btn-disabled-bg) !important;
  color: var(--color-btn-disabled-text) !important;
}

.input-error {
  border-color: var(--color-state-danger) !important;
  --tw-ring-color: var(--color-state-danger);
}

.input-block {
  @apply w-full;
}
</style>
