<script setup lang="ts">
import { ref } from "vue";
import type { Component } from "vue";

// Import sidebar navigation
import UIKitSidebar from "./UIKitSidebar.vue";

// Import tab components
import InputsTab from "./components/InputsTab.vue";
import DisplayTab from "./components/DisplayTab.vue";
import BlocksTab from "./components/BlocksTab.vue";
import StatesTab from "./components/StatesTab.vue";
import TransitionsTab from "./components/TransitionsTab.vue";
import ModalsTab from "./components/ModalsTab.vue";
import DropdownTab from "./components/DropdownTab.vue";

const activeTab = ref("inputs");

const handleTabChange = function (tabId: string): void {
  activeTab.value = tabId;
};

const tabComponents: Record<string, Component> = {
  inputs: InputsTab,
  display: DisplayTab,
  blocks: BlocksTab,
  states: StatesTab,
  transitions: TransitionsTab,
  modals: ModalsTab,
  dropdown: DropdownTab,
};
</script>

<template>
  <div class="w-full min-h-screen bg-white dark:bg-gray-800">
    <div class="flex flex-col md:flex-row">
      <!-- Sidebar navigation (hidden on mobile, replaced with dropdown) -->
      <div class="md:w-64 md:sticky md:top-0 md:h-screen p-6">
        <UIKitSidebar :active-tab="activeTab" @tab-change="handleTabChange" />
      </div>

      <div class="flex-1 p-6 md:p-8">
        <component :is="tabComponents[activeTab]" />
      </div>
    </div>
  </div>
</template>
