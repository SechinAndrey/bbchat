<script setup lang="ts">
import { computed } from "vue";

import type {
  ApiCommunicationLeadFull,
  ApiCommunicationClientFull,
  ApiCommunicationCallInfo,
} from "@src/api/types";
import {
  PhoneIcon,
  PhoneArrowUpRightIcon,
  PhoneArrowDownLeftIcon,
} from "@heroicons/vue/24/outline";
import { formatConversationDate, formatSeconds } from "@src/shared/utils/utils";
import useConversationsStore from "@src/features/conversations/conversations-store";
import CallTranscription from "@src/features/chat/components/ChatMiddle/Message/CallTranscription.vue";
import CallPlayer from "@src/features/chat/components/ChatMiddle/Message/CallPlayer.vue";

const conversationsStore = useConversationsStore();

const activeConversationInfo = computed<
  ApiCommunicationLeadFull | ApiCommunicationClientFull | null
>(() => {
  return conversationsStore.activeConversationInfo;
});

function callTypeIcon(call: ApiCommunicationCallInfo) {
  if (!call) return PhoneIcon;
  // call_type: 0 - incoming, 1 - outgoing
  return call.call_type === 0 ? PhoneArrowDownLeftIcon : PhoneArrowUpRightIcon;
}
</script>

<template>
  <div class="pt-5 h-[99%]">
    <div class="space-y-3 max-h-[96%] overflow-auto pb-6 scrollbar-thin pr-2">
      <div v-for="call in activeConversationInfo?.calls || []" :key="call.id">
        <div class="flex gap-5">
          <component
            :is="callTypeIcon(call)"
            class="w-[1.25rem] h-[1.25rem] text-blue-500 mt-2"
          />
          <div class="flex-1">
            <div class="flex">
              <div class="text-theme-t-alt text-[0.813rem] min-w-[49%]">
                Дата
              </div>
              <div class="text-[0.813rem]">
                {{ formatConversationDate(call.created_at) }}
              </div>
            </div>
            <div class="flex">
              <div class="text-theme-t-alt text-[0.813rem] min-w-[49%]">
                Номер
              </div>

              <a
                class="text-[0.813rem] text-primary"
                :href="`tel:${call.phone}`"
                >{{ call.phone }}</a
              >
            </div>
            <div class="flex">
              <div class="text-theme-t-alt text-[0.813rem] min-w-[49%]">
                Очікування
              </div>
              <div class="text-[0.813rem]">
                {{ formatSeconds(call.waitsec) }}
              </div>
            </div>
            <div class="flex">
              <div class="text-theme-t-alt text-[0.813rem] min-w-[49%]">
                Тривалість
              </div>
              <div class="text-[0.813rem]">
                {{ formatSeconds(call.billsec) }}
              </div>
            </div>
            <div class="flex">
              <div class="text-theme-t-alt text-[0.813rem] min-w-[49%]">
                ПІБ
              </div>
              <div class="text-[0.813rem]">
                {{ activeConversationInfo?.fio || "не вказано" }}
              </div>
            </div>
            <div>
              <CallPlayer
                v-if="call.binotel_id"
                :binotel-id="call.binotel_id"
                class="m-2"
              />
            </div>

            <CallTranscription class="m-2" :call-id="call.id" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
