<script setup lang="ts">
import AnimatedTabs from "@src/ui/navigation/AnimatedTabs/AnimatedTabs.vue";
import CommonInfoTab from "./CommonInfoTab.vue";
import CallsTab from "./CallsTab.vue";
import SetsTab from "./SetsTab.vue";
import Button from "@src/ui/inputs/Button.vue";
import { ChevronLeftIcon } from "@heroicons/vue/24/outline";

defineEmits(["close"]);

const tabsConfig = [
  { key: "common", name: "Загальна інформація", compact: true },
  { key: "calls", name: "Дзвінки", compact: true },
  { key: "sets", name: "Добірки", compact: true },
];

const handleTabChange = (tabKey: string) => {
  console.log(`Tab changed to: ${tabKey}`);
};
</script>

<template>
  <div
    class="bg-app-bg-secondary h-full xs:w-full md:min-w-[18.75rem] md:w-[18.75rem] flex flex-col scrollbar-hidden overflow-hidden px-5 py-6"
  >
    <div class="mb-4 md:hidden">
      <Button variant="text" size="sm" @click="$emit('close')">
        <template #icon>
          <ChevronLeftIcon class="w-4 h-4 mr-1" />
        </template>
        Назад
      </Button>
    </div>

    <AnimatedTabs
      :tabs="tabsConfig"
      default-tab="common"
      content-class="max-h-full h-full overflow-y-auto overflow-x-hidden scrollbar-thin pr-2"
      @tab-change="handleTabChange"
    >
      <template #common>
        <CommonInfoTab />
      </template>

      <template #calls>
        <CallsTab />
      </template>

      <template #sets>
        <SetsTab />
      </template>
    </AnimatedTabs>
  </div>
</template>
