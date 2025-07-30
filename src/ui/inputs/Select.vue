<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from "vue";
import UserIcon from "../../shared/icons/UserIcon.vue";
import ChevronDownIcon from "../../shared/icons/ChevronDownIcon.vue";
import Checkbox from "./Checkbox.vue";

type Option = {
  value: string | number;
  label: string;
  image?: string;
};

const props = withDefaults(
  defineProps<{
    options: Option[];
    modelValue: (string | number)[] | string | number;
    multiple?: boolean;
    placeholder?: string;
    icon?: any;
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
  document.addEventListener("click", closeDropdown);
  window.addEventListener("scroll", updateDropdownPosition, true);
  window.addEventListener("resize", updateDropdownPosition);
});

onUnmounted(() => {
  document.removeEventListener("click", closeDropdown);
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
  toggleOption(option);
};
</script>

<template>
  <div ref="selectElement" class="relative">
    <button
      class="flex items-center justify-between w-full text-left gap-[0.25rem]"
      @click="toggleDropdown"
    >
      <span class="flex items-center min-w-0">
        <img
          v-if="selectedOption && selectedOption.image"
          :src="selectedOption.image"
          class="flex-shrink-0"
          :class="[
            selectedIconClass || sizeClasses.icon,
            sizeClasses.iconMargin,
          ]"
        />
        <component
          :is="icon"
          v-else-if="icon"
          class="flex-shrink-0 text-text-secondary"
          :class="[sizeClasses.icon, sizeClasses.iconMargin]"
        />
        <span
          v-if="displayMode === 'icon-label'"
          class="truncate text-text-primary"
          :class="sizeClasses.selectText"
          >{{ selectedLabel }}</span
        >
      </span>
      <ChevronDownIcon
        class="flex-shrink-0 text-text-secondary transition-transform duration-200"
        :class="[{ 'rotate-180': isOpen }, sizeClasses.chevron]"
      />
    </button>

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
          class="z-50 bg-theme-surface rounded-md shadow-lg border border-neutral"
        >
          <div
            v-if="$slots.header"
            class="px-3 py-2 font-bold border-b text-text-primary border-neutral"
          >
            <slot name="header" />
          </div>
          <ul class="divide-y divide-neutral">
            <li
              v-for="option in options"
              :key="option.value"
              class="text-text-primary relative cursor-pointer select-none"
              :class="sizeClasses.optionText"
              @click="handleOptionClick(option)"
            >
              <div
                class="p-2 flex items-center space-x-3 rounded-sm"
                :class="{
                  'font-bold': isSelected(option.value),
                  'hover:bg-neutral-hover': !isSelected(option.value),
                }"
              >
                <Checkbox
                  v-if="multiple"
                  :model-value="isSelected(option.value)"
                  class="mr-2"
                />
                <img
                  v-if="option.image"
                  :src="option.image"
                  class="flex-shrink-0"
                  :class="optionIconClass || sizeClasses.icon"
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
