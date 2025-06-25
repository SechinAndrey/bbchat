<script setup lang="ts">
import { ref } from "vue";
import AnimatedTabs from "@src/ui/navigation/AnimatedTabs/AnimatedTabs.vue";
import CommonInfoTab from "./CommonInfoTab.vue";
import CallsTab from "./CallsTab.vue";
import SetsTab from "./SetsTab.vue";
import useConversationsStore from "@src/features/conversations/conversations-store";

const tabsConfig = [
  { key: "common", name: "Загальна інформація", compact: true },
  { key: "calls", name: "Дзвінки", compact: true },
  { key: "sets", name: "Підбірки", compact: true },
];

const conversationsStore = useConversationsStore();
</script>

<template>
  <div
    class="bg-theme-conversations h-full xs:w-full md:min-w-[18.75rem] md:w-[18.75rem] flex flex-col scrollbar-hidden px-5 py-6"
  >
    <AnimatedTabs
      :tabs="tabsConfig"
      default-tab="common"
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
