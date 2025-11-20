<script setup lang="ts">
import { computed } from "vue";

import type {
  ApiCommunicationLeadFull,
  ApiCommunicationClientFull,
} from "@src/api/types";
import { PhoneIcon } from "@heroicons/vue/24/solid";
import { formatConversationDate } from "@src/shared/utils/utils";
import {
  getCallStatusText,
  getCallStatusIcon,
  formatCallDuration,
} from "@src/shared/utils/callHelpers";
import useConversationsStore from "@src/features/conversations/conversations-store";
import CallTranscription from "@src/features/chat/components/ChatMiddle/Message/CallTranscription.vue";
import CallPlayer from "@src/features/chat/components/ChatMiddle/Message/CallPlayer.vue";
import EmptyState from "@src/ui/states/empty-states/EmptyState.vue";

const conversationsStore = useConversationsStore();

const activeConversation = computed<
  ApiCommunicationLeadFull | ApiCommunicationClientFull | null
>(() => {
  return conversationsStore.activeConversation;
});
</script>

<template>
  <div class="pt-5 pb-6">
    <EmptyState
      v-if="!activeConversation?.calls.length"
      :icon="PhoneIcon"
      bg
      title="Дзвінків немає"
    />
    <div class="space-y-3">
      <div v-for="call in activeConversation?.calls || []" :key="call.id">
        <div class="flex gap-5">
          <div class="flex-1">
            <div class="flex">
              <div class="text-app-text-secondary text-[0.813rem] min-w-[49%]">
                Дата
              </div>
              <div class="text-[0.813rem]">
                {{ formatConversationDate(call.created_at) }}
              </div>
            </div>

            <div class="flex">
              <div class="text-app-text-secondary text-[0.813rem] min-w-[49%]">
                Номер
              </div>

              <a
                class="text-[0.813rem] text-primary"
                :href="`tel:${call.phone}`"
                >{{ call.phone }}</a
              >
            </div>
            <div class="flex">
              <div class="text-app-text-secondary text-[0.813rem] min-w-[49%]">
                Тип
              </div>
              <div class="text-[0.813rem] flex items-center gap-3">
                <div>
                  {{ call.call_type === 0 ? "Вхідний" : "Вихідний" }}
                </div>
              </div>
            </div>
            <div class="flex">
              <div class="text-app-text-secondary text-[0.813rem] min-w-[49%]">
                Статус
              </div>
              <div class="text-[0.813rem] flex items-center gap-2">
                <component
                  :is="getCallStatusIcon(call).icon"
                  :class="getCallStatusIcon(call).color"
                  class="w-[0.9rem] h-[0.9rem]"
                />
                <span>{{ getCallStatusText(call.disposition) }}</span>
              </div>
            </div>
            <div class="flex">
              <div class="text-app-text-secondary text-[0.813rem] min-w-[49%]">
                Очікування
              </div>
              <div class="text-[0.813rem]">
                {{ formatCallDuration(call.waitsec) }}
              </div>
            </div>
            <div class="flex">
              <div class="text-app-text-secondary text-[0.813rem] min-w-[49%]">
                Тривалість
              </div>
              <div class="text-[0.813rem]">
                {{ formatCallDuration(call.billsec) }}
              </div>
            </div>
            <div class="flex">
              <div class="text-app-text-secondary text-[0.813rem] min-w-[49%]">
                ПІБ
              </div>
              <div class="text-[0.813rem]">
                {{ activeConversation?.fio || "не вказано" }}
              </div>
            </div>
            <div>
              <CallPlayer
                v-if="call.binotel_id"
                :binotel-id="call.binotel_id"
                class="mx-1 mt-4"
              />
            </div>

            <CallTranscription class="mx-1 my-4" :call-id="call.id" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
