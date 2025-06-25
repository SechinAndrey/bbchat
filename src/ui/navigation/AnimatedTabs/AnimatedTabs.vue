<script setup lang="ts">
import { ref, computed } from "vue";
import Tabs from "@src/ui/navigation/Tabs/Tabs.vue";
import Tab from "@src/ui/navigation/Tabs/Tab.vue";
import SlideTransition from "@src/ui/transitions/SlideTransition.vue";
import { useTabAnimation } from "@src/shared/composables/useTabAnimation";

export interface TabConfig {
  key: string;
  name: string;
  compact?: boolean;
}

interface Props {
  tabs: TabConfig[];
  defaultTab?: string;
  defaultDirection?: "LEFT" | "RIGHT";
  contentClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  defaultDirection: "LEFT",
  contentClass: "",
});

const emit = defineEmits<{
  tabChange: [tabKey: string];
}>();

const activeTab = ref(props.defaultTab || props.tabs[0]?.key || "");
const tabOrder = computed(() => props.tabs.map((tab) => tab.key));

const { animation } = useTabAnimation(activeTab, {
  tabOrder: tabOrder.value,
  defaultDirection: props.defaultDirection,
});

const handleTabClick = (tabKey: string) => {
  activeTab.value = tabKey;
  emit("tabChange", tabKey);
};
</script>

<template>
  <div class="animated-tabs">
    <Tabs>
      <Tab
        v-for="tab in tabs"
        :key="tab.key"
        :compact="tab.compact"
        :active="activeTab === tab.key"
        :name="tab.name"
        @click="handleTabClick(tab.key)"
      />
    </Tabs>

    <SlideTransition :animation="animation">
      <div :key="activeTab" :class="contentClass">
        <slot :name="activeTab" :activeTab="activeTab">
          <!-- Default slot if named slot is not found -->
          <slot :activeTab="activeTab" />
        </slot>
      </div>
    </SlideTransition>
  </div>
</template>

<style scoped>
.animated-tabs {
  display: flex;
  flex-direction: column;
  height: 100%;
}
</style>
