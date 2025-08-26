<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    schedule: Record<string, string>;
    title?: string;
  }>(),
  {
    title: "Календар зайнятостi",
  },
);

const currentYearSchedule = computed(() => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  const result: Record<string, string> = {};

  for (let i = 0; i < 12; i++) {
    const targetDate = new Date(currentYear, currentMonth - 1 + i, 1);
    const year = targetDate.getFullYear();
    const month = targetDate.getMonth() + 1;

    const key = `${year}-${month.toString().padStart(2, "0")}`;
    result[key] = props.schedule[key] || "unknown";
  }

  return result;
});
</script>

<template>
  <div>
    <div v-if="props.title" class="text-sm font-semibold mb-3">
      {{ props.title }}
    </div>
  </div>
  <div class="current-year-schedule">
    <div
      v-for="(value, key) in currentYearSchedule"
      :key="key"
      class="p-3"
      :class="`current-year-schedule__${value}`"
    >
      {{ key.split("-")[1] }}
    </div>
  </div>
</template>

<style scoped>
.current-year-schedule {
  display: grid;
  gap: 1px;
  grid-template-columns: repeat(6, 1fr);
}

.current-year-schedule > div {
  min-height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.current-year-schedule__free {
  background-color: #4fb14b;
}

.current-year-schedule__busy {
  background-color: #ff6f20;
}

.current-year-schedule__reserve {
  background-color: #ffc62b;
}

.current-year-schedule__unknown {
  background-color: #bcbcbc;
}
</style>
