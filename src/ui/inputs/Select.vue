<script setup lang="ts">
import {
  ref,
  computed,
  onMounted,
  onUnmounted,
  nextTick,
  watch,
  type Component,
} from "vue";
import UserIcon from "../../shared/icons/UserIcon.vue";
import ChevronDownIcon from "../../shared/icons/ChevronDownIcon.vue";
import Checkbox from "./Checkbox.vue";
import Button from "./Button.vue";

type Option = {
  value: string | number;
  label: string;
  description?: string;
  image?: string;
  disabled?: boolean;
  title?: string;
};

const props = withDefaults(
  defineProps<{
    options: Option[];
    modelValue: (string | number)[] | string | number;
    multiple?: boolean;
    placeholder?: string;
    icon?: Component | false;
    size?: "xs" | "sm" | "md" | "lg";
    displayMode?: "icon-label" | "icon-only";
    selectedIconClass?: string;
    optionIconClass?: string;
  }>(),
  {
    multiple: false,
    placeholder: "Виберіть...",
    icon: UserIcon,
    size: "md",
    displayMode: "icon-label",
    selectedIconClass: "",
    optionIconClass: "",
  },
);

const emit = defineEmits(["update:modelValue"]);

const sizeClasses = computed(() => {
  switch (props.size) {
    case "xs":
      return {
        selectText: "text-xs",
        optionText: "text-xs",
        icon: "w-4 h-4",
        chevron: "w-3 h-3",
        iconMargin: "mr-2",
      };
    case "sm":
      return {
        selectText: "text-sm",
        optionText: "text-sm",
        icon: "w-5 h-5",
        chevron: "w-4 h-4",
        iconMargin: "mr-2",
      };
    case "lg":
      return {
        selectText: "text-lg",
        optionText: "text-base",
        icon: "w-7 h-7",
        chevron: "w-5 h-5",
        iconMargin: "mr-3",
      };
    case "md":
    default:
      return {
        selectText: "text-base",
        optionText: "text-sm",
        icon: "w-6 h-6",
        chevron: "w-4 h-4",
        iconMargin: "mr-3",
      };
  }
});

// Explicit size in rem to strictly clamp image container
const iconSizeRem = computed(() => {
  switch (props.size) {
    case "xs":
      return "1rem"; // 16px
    case "sm":
      return "1.25rem"; // 20px
    case "lg":
      return "1.75rem"; // 28px
    case "md":
    default:
      return "1.5rem"; // 24px
  }
});

const selectedOption = computed(() => {
  if (props.multiple) {
    // For multiple, we don't have a single selected option with an image.
    return null;
  }
  return props.options.find((option) => option.value === props.modelValue);
});

const isOpen = ref(false);
const openUpwards = ref(false);
const selectElement = ref<HTMLElement | null>(null);
const dropdownMenu = ref<HTMLElement | null>(null);

const dropdownStyle = ref({});

const updateDropdownPosition = () => {
  if (!isOpen.value || !selectElement.value) return;

  const selectRect = selectElement.value.getBoundingClientRect();
  const menuHeight = dropdownMenu.value?.offsetHeight || 0;
  const spaceBelow = window.innerHeight - selectRect.bottom;

  openUpwards.value = spaceBelow < menuHeight && selectRect.top > menuHeight;

  dropdownStyle.value = {
    position: "fixed",
    top: openUpwards.value
      ? `${selectRect.top - menuHeight}px`
      : `${selectRect.bottom}px`,
    left: `${selectRect.left}px`,
    minWidth: `${selectRect.width}px`,
  };
};

const toggleDropdown = () => {
  isOpen.value = !isOpen.value;
  if (isOpen.value) {
    nextTick(() => {
      updateDropdownPosition();
    });
  }
};

const closeDropdown = (event: MouseEvent) => {
  if (
    selectElement.value &&
    !selectElement.value.contains(event.target as Node) &&
    dropdownMenu.value &&
    !dropdownMenu.value.contains(event.target as Node)
  ) {
    isOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener("mousedown", closeDropdown);
  window.addEventListener("scroll", updateDropdownPosition, true);
  window.addEventListener("resize", updateDropdownPosition);
});

onUnmounted(() => {
  document.removeEventListener("mousedown", closeDropdown);
  window.removeEventListener("scroll", updateDropdownPosition, true);
  window.removeEventListener("resize", updateDropdownPosition);
});

watch(isOpen, (value) => {
  if (value) {
    nextTick(updateDropdownPosition);
  }
});

const selectedLabel = computed(() => {
  if (props.multiple) {
    if (!Array.isArray(props.modelValue) || props.modelValue.length === 0) {
      return props.placeholder;
    }
    const selectedOptions = props.options.filter((option) =>
      (props.modelValue as (string | number)[]).includes(option.value),
    );
    if (selectedOptions.length > 1) {
      return `${selectedOptions.length} - обрано`;
    }
    if (selectedOptions.length === 1) {
      return selectedOptions[0].label;
    }
    return props.placeholder;
  } else {
    const selectedOption = props.options.find(
      (option) => option.value === props.modelValue,
    );
    return selectedOption ? selectedOption.label : props.placeholder;
  }
});

const isSelected = (optionValue: string | number) => {
  if (props.multiple) {
    return (props.modelValue as (string | number)[]).includes(optionValue);
  }
  return props.modelValue === optionValue;
};

const toggleOption = (option: Option) => {
  if (props.multiple) {
    const selected = isSelected(option.value);
    if (selected) {
      const newModelValue = (props.modelValue as (string | number)[]).filter(
        (item) => item !== option.value,
      );
      emit("update:modelValue", newModelValue);
    } else {
      const newModelValue = [
        ...(props.modelValue as (string | number)[]),
        option.value,
      ];
      emit("update:modelValue", newModelValue);
    }
    // We don't close the dropdown in multiple mode
  } else {
    emit("update:modelValue", option.value);
    isOpen.value = false;
  }
};

const handleOptionClick = (option: Option) => {
  if (option.disabled) return;
  toggleOption(option);
};
</script>

<template>
  <div ref="selectElement" class="relative">
    <Button
      block
      variant="ghost"
      :size="size"
      :ring="false"
      class="justify-between font-normal"
      @click="toggleDropdown"
    >
      <span class="flex items-center min-w-0">
        <!-- Strict size wrapper to prevent overflow -->
        <span
          v-if="selectedOption && selectedOption.image"
          class="flex-shrink-0 inline-flex items-center justify-center overflow-hidden"
          :class="[sizeClasses.iconMargin]"
          :style="{ width: iconSizeRem, height: iconSizeRem }"
        >
          <img
            :src="selectedOption.image"
            class="block max-w-full max-h-full object-contain"
          />
        </span>
        <component
          :is="icon"
          v-else-if="icon"
          class="flex-shrink-0 text-app-text-secondary"
          :class="[sizeClasses.icon, sizeClasses.iconMargin]"
        />
        <span
          v-if="displayMode === 'icon-label'"
          class="truncate text-app-text"
          :class="sizeClasses.selectText"
          >{{ selectedLabel }}</span
        >
      </span>
      <ChevronDownIcon
        class="flex-shrink-0 text-app-text-secondary transition-transform duration-200"
        :class="[{ 'rotate-180': isOpen }, sizeClasses.chevron]"
      />
    </Button>

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
          class="z-[100] bg-app-bg rounded-md shadow-lg border border-app-border"
        >
          <div
            v-if="$slots.header"
            class="px-3 py-2 font-bold border-b border-app-border text-app-text"
          >
            <slot name="header" />
          </div>
          <ul>
            <li
              v-for="option in options"
              :key="option.value"
              :title="option.title || ''"
              class="flex items-center w-full px-4 py-3 text-sm text-app-text cursor-pointer select-none transition-all duration-200 hover:bg-app-bg-secondary"
              :class="{
                'bg-app-bg-secondary font-medium': isSelected(option.value),
                'opacity-50 cursor-not-allowed hover:bg-app-bg':
                  option.disabled,
              }"
              @click="handleOptionClick(option)"
            >
              <Checkbox
                v-if="multiple"
                :model-value="isSelected(option.value)"
                class="mr-2"
              />

              <span
                v-if="option.image"
                class="flex-shrink-0 inline-flex items-center justify-center overflow-hidden mr-3"
                :style="{ width: iconSizeRem, height: iconSizeRem }"
              >
                <img
                  :src="option.image"
                  class="block max-w-full max-h-full object-contain"
                />
              </span>
              <span class="truncate">
                {{ option.label }}
                <br v-if="option.description" />
                <span
                  v-if="option.description"
                  class="text-app-text-secondary text-xs"
                >
                  {{ option.description }}
                </span>
              </span>
            </li>
          </ul>
        </div>
      </transition>
    </Teleport>
  </div>
</template>
