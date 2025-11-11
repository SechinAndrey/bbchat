<script setup lang="ts">
import Modal from "@src/ui/modals/Modal.vue";
import Button from "@src/ui/inputs/Button.vue";
import Select from "@src/ui/inputs/Select.vue";
import TextInput from "@src/ui/inputs/TextInput.vue";
import AnimatedTabs from "@src/ui/navigation/AnimatedTabs/AnimatedTabs.vue";
import { ref, computed, onMounted, watch } from "vue";
import { selectionsService, type FollowParams } from "./selections-service";
import type { EntityType } from "@src/shared/types/common";
import { useSelectionsStore } from "@src/features/selections/selection-store";

const props = defineProps<{
  selectedBoardIds: number[];
  selectionId: number;
  entityId: number;
  entityType: EntityType;
}>();

const emit = defineEmits<{
  followed: [];
}>();

const open = defineModel<boolean>({ default: false });

const selectionsStore = useSelectionsStore();

const activeTab = ref<"month" | "period" | "asap">("month");
const selectedMonth = ref<string>("");
const dateFrom = ref<string>("");
const dateTo = ref<string>("");
const isLoading = ref(false);

const tabsConfig = [
  { key: "month", name: "Місяць", compact: true },
  { key: "period", name: "Період", compact: true },
  { key: "asap", name: "Як тільки звільниться", compact: true },
];

// Generate 12 months starting from current month
const monthOptions = computed(() => {
  const options = [];
  const today = new Date();

  for (let i = 0; i < 12; i++) {
    const date = new Date(today.getFullYear(), today.getMonth() + i, 1);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const value = `${year}-${month}`;

    const monthNames = [
      "Січень",
      "Лютий",
      "Березень",
      "Квітень",
      "Травень",
      "Червень",
      "Липень",
      "Серпень",
      "Вересень",
      "Жовтень",
      "Листопад",
      "Грудень",
    ];

    const label = `${monthNames[date.getMonth()]} ${year}`;
    options.push({ value, label });
  }

  return options;
});

onMounted(() => {
  if (!selectedMonth.value && monthOptions.value.length > 0) {
    selectedMonth.value = monthOptions.value[0].value;
  }
});

const close = () => {
  open.value = false;
};

watch(open, (isOpen) => {
  if (!isOpen) {
    activeTab.value = "month";
  }
});

const formatDateToMonth = (dateString: string): string => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
};

const followBoards = async () => {
  if (isLoading.value) return;

  try {
    isLoading.value = true;

    let month_from: string | null | undefined;
    let month_to: string | null | undefined;

    if (activeTab.value === "month") {
      // For month tab: both month_from and month_to are the same selected month
      month_from = selectedMonth.value || undefined;
      month_to = selectedMonth.value || undefined;
    } else if (activeTab.value === "period") {
      // For period tab: use date range
      month_from = dateFrom.value
        ? formatDateToMonth(dateFrom.value)
        : undefined;
      month_to = dateTo.value ? formatDateToMonth(dateTo.value) : undefined;
    } else if (activeTab.value === "asap") {
      // For "as soon as available" tab: send null values
      month_from = null;
      month_to = null;
    }

    const params: FollowParams = {
      id: props.entityId,
      type: props.entityType,
      selection_id: props.selectionId,
      boards_ids: props.selectedBoardIds,
      month_from,
      month_to,
    };

    await selectionsService.followBoards(params);

    // For asap mode, set period to one year from current month for UI display
    let displayMonthFrom = month_from;
    let displayMonthTo = month_to;

    if (activeTab.value === "asap") {
      const today = new Date();
      const currentYear = today.getFullYear();
      const currentMonth = String(today.getMonth() + 1).padStart(2, "0");
      displayMonthFrom = `${currentYear}-${currentMonth}`;

      const nextYear = currentYear + 1;
      displayMonthTo = `${nextYear}-${currentMonth}`;
    }

    selectionsStore.updateBoardsWatchStatus(
      props.selectionId,
      props.selectedBoardIds,
      displayMonthFrom,
      displayMonthTo,
    );

    // Reset form after successful submission
    dateFrom.value = "";
    dateTo.value = "";

    emit("followed");
    close();
  } catch (error) {
    console.error("Error following boards:", error);
  } finally {
    isLoading.value = false;
  }
};

const handleTabChange = (tabKey: string) => {
  activeTab.value = tabKey as "month" | "period" | "asap";
};
</script>

<template>
  <Modal :open="open" :close-modal="close">
    <template #header>
      <h3 id="modal-title" class="text-lg leading-6 font-medium text-app-text">
        Слідкувати за дошками
      </h3>
      <p class="mt-2 text-app-text-secondary">
        Налаштуйте період спостереження за вибраними дошками
      </p>
      <div class="mt-2 text-sm text-app-text-secondary">
        Вибрано дошок:
        <span class="font-medium">{{ selectedBoardIds.length }}</span>
      </div>
    </template>

    <template #body>
      <div class="bg-app-bg-secondary p-3 rounded-sm mb-0">
        <AnimatedTabs
          :tabs="tabsConfig"
          default-tab="month"
          content-class="py-4"
          @tab-change="handleTabChange"
        >
          <template #month>
            <div class="space-y-4">
              <div>
                <label
                  for="month-select"
                  class="block text-sm font-medium text-app-text-secondary mb-4 mt-2"
                >
                  Оберіть місяць:
                </label>
                <Select
                  v-model="selectedMonth"
                  :options="monthOptions"
                  :icon="false"
                  placeholder="Оберіть місяць"
                  size="md"
                />
              </div>
            </div>
          </template>

          <template #period>
            <div class="space-y-2">
              <div>
                <label
                  for="date-from"
                  class="block text-sm font-medium text-app-text mb-2"
                >
                  Дата з:
                </label>
                <TextInput
                  id="date-from"
                  v-model="dateFrom"
                  type="date"
                  :disabled="isLoading"
                  variant="default"
                  size="sm"
                  block
                />
              </div>

              <div>
                <label
                  for="date-to"
                  class="block text-sm font-medium text-app-text mb-2"
                >
                  Дата до:
                </label>
                <TextInput
                  id="date-to"
                  v-model="dateTo"
                  type="date"
                  :disabled="isLoading"
                  variant="default"
                  size="sm"
                  block
                />
              </div>
            </div>
          </template>

          <template #asap>
            <div class="space-y-4">
              <div class="text-center py-8">
                <p class="text-app-text font-medium mb-2">
                  Як тільки звільниться
                </p>
                <p class="text-app-text-secondary text-sm">
                  Ми повідомимо вас, щойно площина звільниться і буде доступна
                </p>
              </div>
            </div>
          </template>
        </AnimatedTabs>
      </div>
    </template>

    <template #footer>
      <Button
        class="flex-1"
        variant="text"
        :disabled="isLoading"
        @click="close"
      >
        Скасувати
      </Button>
      <Button
        class="flex-1"
        :disabled="isLoading"
        :loading="isLoading"
        @click="followBoards"
      >
        Додати до спостереження
      </Button>
    </template>
  </Modal>
</template>
