<script setup lang="ts">
import { ref, computed, watch, inject, type Ref } from "vue";
import { useEventBus } from "@vueuse/core";
import useConversationsStore from "@src/features/conversations/conversations-store";
import Button from "@src/ui/inputs/Button.vue";
import {
  CheckCircleIcon,
  MinusCircleIcon,
  PaperAirplaneIcon,
  EyeIcon,
  PhotoIcon,
} from "@heroicons/vue/24/outline";
import { usePhotoReportsStore } from "@src/features/photo-reports/photo-reports-store";
import { useToast } from "@src/shared/composables/useToast";
import Spinner from "@src/ui/states/loading-states/Spinner.vue";
import EmptyState from "@src/ui/states/empty-states/EmptyState.vue";
import AssignPhotoReportModal from "@src/features/photo-reports/modals/AssignPhotoReportModal.vue";
import type { ClientPeriod } from "@src/features/photo-reports/types";

const entity = inject<Ref<"leads" | "clients" | "suppliers">>("entity");
const conversationsStore = useConversationsStore();

const entityId = computed(() => {
  return conversationsStore.activeConversation?.id || 0;
});

const store = usePhotoReportsStore();
const { toastSuccess, toastError } = useToast();
const insertMessageBus = useEventBus<string>("photo-report-insert-message");

const sendingYm = ref<string | null>(null);
const showModal = ref(false);
const modalMode = ref<"view" | "edit">("view");
const modalYm = ref<string>("");
const modalPeriodLabel = ref<string>("");

const fillPercent = (period: ClientPeriod) => {
  const total = Number(period.slots_count);
  if (!total) return 0;
  return Math.round((Number(period.filled_slots_count ?? 0) / total) * 100);
};

const progressBarClass = (percent: number) => {
  if (percent === 100) return "bg-success";
  if (percent >= 50) return "bg-warning";
  return "bg-primary";
};

const hasStats = (period: ClientPeriod) =>
  period.slots_count != null && Number(period.slots_count) > 0;

const isComplete = (period: ClientPeriod) =>
  hasStats(period) &&
  Number(period.filled_slots_count) === Number(period.slots_count);

const handleViewPeriod = (period: ClientPeriod) => {
  modalYm.value = period.ym;
  modalPeriodLabel.value = period.label;
  modalMode.value = "view";
  showModal.value = true;
};

const handlePeriodSaved = () => {
  store.loadPeriods(entityId.value);
};

const handleSendReport = async (period: ClientPeriod) => {
  sendingYm.value = period.ym;
  try {
    const { message, report_url } = await store.getMessageTemplate(
      entityId.value,
      period.ym,
    );
    await navigator.clipboard.writeText(report_url);
    insertMessageBus.emit(message);
    toastSuccess("Посилання скопійовано, повідомлення вставлено в поле вводу");
  } catch (error) {
    console.error("Error sending report:", error);
    toastError("Помилка надсилання звіту");
  } finally {
    sendingYm.value = null;
  }
};

watch(
  entityId,
  (id) => {
    if (id) {
      store.loadPeriods(id);
    }
  },
  { immediate: true },
);
</script>

<template>
  <div class="pb-6">
    <template v-if="entity === 'clients' && entityId">
      <div class="my-4 text-app-text-secondary text-[0.813rem]">Періоди</div>

      <Spinner v-if="store.isLoadingPeriods" class="py-2" />

      <EmptyState
        v-else-if="store.periods.length === 0"
        bg
        :icon="PhotoIcon"
        title="Немає фотозвітів"
        class="py-5 rounded"
      />

      <div v-else class="space-y-3">
        <div v-for="period in store.periods" :key="period.ym" class="py-0.5">
          <div class="flex items-center justify-between mb-1.5">
            <div class="flex items-center gap-2">
              <CheckCircleIcon
                v-if="isComplete(period)"
                class="w-4 h-4 text-success flex-shrink-0"
              />
              <MinusCircleIcon
                v-else
                class="w-4 h-4 text-app-text-secondary flex-shrink-0"
              />
              <span class="text-[0.875rem]">{{ period.label }}</span>
            </div>

            <div class="flex items-center gap-0.5">
              <Button
                variant="ghost"
                size="xs"
                :ring="false"
                icon-only
                title="Переглянути"
                @click="handleViewPeriod(period)"
              >
                <template #icon>
                  <EyeIcon class="w-4 h-4 text-app-text-secondary" />
                </template>
              </Button>

              <Button
                variant="ghost"
                size="xs"
                :ring="false"
                :loading="sendingYm === period.ym"
                :disabled="sendingYm !== null"
                icon-only
                title="Надіслати"
                @click="handleSendReport(period)"
              >
                <template #icon>
                  <PaperAirplaneIcon class="w-4 h-4 text-primary" />
                </template>
              </Button>
            </div>
          </div>

          <template v-if="hasStats(period)">
            <div
              class="h-1 w-full bg-app-border rounded-full overflow-hidden mb-1"
            >
              <div
                class="h-full rounded-full transition-all"
                :class="progressBarClass(fillPercent(period))"
                :style="{ width: fillPercent(period) + '%' }"
              />
            </div>

            <div class="text-[0.6875rem] text-app-text-secondary">
              {{ period.filled_boards_count ?? 0 }}/{{
                period.boards_count ?? 0
              }}
              площин &bull;
              {{ period.filled_slots_count ?? 0 }}/{{ period.slots_count ?? 0 }}
              слотів
            </div>
          </template>
        </div>
      </div>

      <AssignPhotoReportModal
        :open="showModal"
        :photos="[]"
        :mode="modalMode"
        :ym="modalYm"
        :period-label="modalPeriodLabel"
        :client-id="entityId"
        @close="showModal = false"
        @saved="handlePeriodSaved"
      />
    </template>
  </div>
</template>
