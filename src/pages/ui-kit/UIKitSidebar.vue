<script setup lang="ts">
import { ref } from "vue";

// Import icons
import {
  PencilSquareIcon,
  DocumentTextIcon,
  SquaresPlusIcon,
  BeakerIcon,
  ArrowPathIcon,
  WindowIcon,
  ListBulletIcon,
} from "@heroicons/vue/24/outline";

const props = defineProps({
  activeTab: { type: String, required: true },
});

const emit = defineEmits(["tabChange"]);

const navigationItems = [
  { id: "inputs", name: "Input Elements", icon: PencilSquareIcon },
  { id: "display", name: "Display Elements", icon: DocumentTextIcon },
  { id: "blocks", name: "Blocks", icon: SquaresPlusIcon },
  { id: "states", name: "States", icon: BeakerIcon },
  { id: "transitions", name: "Transitions", icon: ArrowPathIcon },
  { id: "modals", name: "Modals", icon: WindowIcon },
  { id: "dropdown", name: "Dropdowns", icon: ListBulletIcon },
];

const handleTabChange = function (tabId: string): void {
  emit("tabChange", tabId);
};

const mobileMenuOpen = ref(false);

const toggleMobileMenu = function () {
  mobileMenuOpen.value = !mobileMenuOpen.value;
};
</script>

<template>
  <div class="ui-kit-sidebar">
    <!-- mobile -->
    <div class="md:hidden bg-white dark:bg-gray-800 p-4 sticky top-0 z-10">
      <div
        @click="toggleMobileMenu"
        class="flex items-center justify-between cursor-pointer"
      >
        <h2 class="font-medium">
          {{ navigationItems.find((item) => item.id === activeTab)?.name }}
        </h2>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5 transform transition-transform"
          :class="{ 'rotate-180': mobileMenuOpen }"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fill-rule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clip-rule="evenodd"
          />
        </svg>
      </div>
      <div
        v-if="mobileMenuOpen"
        class="mt-2 py-2 rounded-md shadow-lg bg-white dark:bg-gray-700 absolute w-full left-0 z-20"
      >
        <template v-for="item in navigationItems" :key="item.id">
          <a
            href="#"
            @click.prevent="
              handleTabChange(item.id);
              toggleMobileMenu();
            "
            class="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600"
            :class="{
              'bg-primary-hover/10 dark:bg-primary-hover/30':
                activeTab === item.id,
            }"
          >
            <div class="flex items-center">
              <component :is="item.icon" class="w-5 h-5 mr-2" />
              {{ item.name }}
            </div>
          </a>
        </template>
      </div>
    </div>

    <!-- pc -->
    <div class="hidden md:block h-full">
      <nav class="flex flex-col space-y-1 sticky top-8">
        <h2 class="text-xl font-bold mb-4">UI Kit</h2>
        <template v-for="item in navigationItems" :key="item.id">
          <button
            @click="handleTabChange(item.id)"
            class="text-left px-3 py-2 rounded-md text-sm font-medium transition duration-150 ease-in-out"
            :class="
              activeTab === item.id
                ? 'bg-primary-hover/10 text-primary dark:bg-primary-hover/30 dark:text-primary'
                : ' hover:bg-gray-100 dark:hover:bg-gray-700'
            "
          >
            <div class="flex items-center">
              <component :is="item.icon" class="w-5 h-5 mr-2" />
              {{ item.name }}
            </div>
          </button>
        </template>
      </nav>
    </div>
  </div>
</template>

<style scoped>
.ui-kit-sidebar {
  width: 100%;
  height: 100%;
}

@media (min-width: 768px) {
  .ui-kit-sidebar {
    min-width: 240px;
    border-right: 1px solid var(--border-color);
  }
}
</style>
