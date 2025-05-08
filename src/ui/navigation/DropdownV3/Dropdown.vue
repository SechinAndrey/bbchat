<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';

interface Props {
  position?: 'top' | 'bottom' | 'left' | 'right';
  trigger?: 'hover' | 'click';
  closeOnSelect?: boolean;
  disabled?: boolean;
  id?: string;
  show?: boolean;
  handleClickOutside?: (event: Event) => void;
  closeDropdown?: () => void;
}

const props = withDefaults(defineProps<Props>(), {
  position: 'bottom',
  trigger: 'click',
  closeOnSelect: true,
  disabled: false,
  show: false
});

const emit = defineEmits(['open', 'close']);

const dropdownRef = ref<HTMLElement | null>(null);
const activatorRef = ref<HTMLElement | null>(null);
const isOpen = computed(() => props.show !== undefined && props.closeDropdown !== undefined 
  ? props.show 
  : isOpenInternal.value);
const isOpenInternal = ref(false);
const hoverTimeout = ref<number | null>(null);

const dropdownPosition = computed(() => {
  if (!activatorRef.value || !dropdownRef.value) return {};
  
  const activatorRect = activatorRef.value.getBoundingClientRect();
  const dropdownRect = dropdownRef.value.getBoundingClientRect();
  
  // Позиционирование в соответствии с указанным направлением
  const positions: Record<string, any> = {
    top: {
      bottom: `${activatorRef.value.offsetHeight + 5}px`,
      left: '0'
    },
    bottom: {
      top: `${activatorRef.value.offsetHeight + 5}px`,
      left: '0'
    },
    left: {
      top: '0',
      right: `${activatorRef.value.offsetWidth + 5}px`
    },
    right: {
      top: '0',
      left: `${activatorRef.value.offsetWidth + 5}px`
    }
  };
  
  return positions[props.position as string] || positions.bottom;
});

function openDropdown() {
  if (props.disabled) return;
  
  if (props.closeDropdown) {
    // If we're using external state management
    emit('open');
  } else {
    isOpenInternal.value = true;
    emit('open');
    document.addEventListener('click', handleOutsideClick);
  }
}

function closeDropdown() {
  if (props.closeDropdown) {
    // If we're using external state management
    props.closeDropdown();
    emit('close');
  } else {
    isOpenInternal.value = false;
    emit('close');
    document.removeEventListener('click', handleOutsideClick);
  }
}

function toggleDropdown() {
  if (isOpen.value) {
    closeDropdown();
  } else {
    openDropdown();
  }
}

function handleOutsideClick(event: MouseEvent) {
  if (props.handleClickOutside) {
    props.handleClickOutside(event);
    return;
  }
  
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node) && 
      activatorRef.value && !activatorRef.value.contains(event.target as Node)) {
    closeDropdown();
  }
}

function handleMouseEnter() {
  if (props.trigger === 'hover') {
    if (hoverTimeout.value) {
      clearTimeout(hoverTimeout.value);
      hoverTimeout.value = null;
    }
    openDropdown();
  }
}

function handleMouseLeave() {
  if (props.trigger === 'hover') {
    hoverTimeout.value = window.setTimeout(() => {
      closeDropdown();
    }, 200) as unknown as number;
  }
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && isOpen.value) {
    closeDropdown();
  }
}

function handleItemClick() {
  if (props.closeOnSelect) {
    closeDropdown();
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown);
  document.removeEventListener('click', handleOutsideClick);
  if (hoverTimeout.value) {
    clearTimeout(hoverTimeout.value);
  }
});

defineExpose({
  closeDropdown,
  isOpen
});
</script>

<template>
  <div 
    class="dropdown-container" 
    :class="{ 'dropdown-disabled': disabled }"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <!-- Dropdown activator -->
    <div 
      ref="activatorRef" 
      class="dropdown-activator"
      @click="props.trigger === 'click' ? toggleDropdown() : undefined"
    >
      <slot name="activator"></slot>
    </div>

    <!-- Overlay to capture clicks outside (for compatibility with the old dropdown) -->
    <div
      v-if="isOpen && !handleClickOutside"
      class="fixed left-0 top-0 z-[50] w-full h-full"
    ></div>
    
    <!-- Dropdown content -->
    <Transition :name="handleClickOutside ? 'scale' : 'dropdown'">
      <div
        v-show="isOpen"
        ref="dropdownRef"
        :id="id"
        :style="handleClickOutside ? {} : dropdownPosition"
        class="absolute z-[100] w-[12.5rem] rounded-sm bg-white dark:bg-gray-800 shadow-lg border border-gray-100 dark:border-gray-600 focus:outline-none"
        role="menu"
        aria-orientation="vertical"
        tabindex="-1"
      >
        <div role="none">
          <slot @dropdown-item-click="handleItemClick"></slot>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.dropdown-container {
  position: relative;
  display: inline-block;
}

.dropdown-activator {
  cursor: pointer;
}

.dropdown-disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Animations */
.dropdown-enter-active,
.dropdown-leave-active,
.scale-enter-active,
.scale-leave-active {
  transition: opacity 0.2s, transform 0.2s;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}

.scale-enter-from,
.scale-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>