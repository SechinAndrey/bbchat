<script setup lang="ts">
import { computed } from "vue";

import { ICall } from "@src/shared/types/types";
import { getCallName, getOtherMembers } from "@src/shared/utils/utils";

import {
  PhoneIcon,
  PhoneArrowDownLeftIcon,
  PhoneArrowUpRightIcon,
  PhoneXMarkIcon,
} from "@heroicons/vue/24/solid";
import CallAvatar from "@src/shared/components/blocks/CallAvatar.vue";

const props = defineProps<{
  call: ICall;
  active?: boolean;
  openInfoModal?: (call: ICall) => void;
  openVoiceCallModal?: () => void;
  endCall?: () => void;
}>();

const members = computed(() => {
  return getOtherMembers(props.call);
});

const handleOpenInfoModal = () => {
  if (props.openInfoModal && !props.active) {
    props.openInfoModal(props.call);
  }
};
</script>

<template>
  <div>
    <component
      :is="props.active ? 'div' : 'button'"
      :aria-label="'voice call with ' + getCallName(props.call, true)"
      @click="handleOpenInfoModal"
      class="w-full h-[5.75rem] px-5 py-6 mb-3 flex rounded focus:outline-none transition duration-500 ease-out"
      :class="
        props.active
          ? ['border border-dashed border-success dark:border-success']
          : [
              'focus:bg-primary-hover/10 dark:active:bg-gray-600 dark:focus:bg-gray-600 dark:hover:bg-gray-600 hover:bg-primary-hover/10 active:bg-primary-hover/20',
            ]
      "
      tabindex="0"
    >
      <!--profile images-->
      <div :class="members.length === 1 ? ['mr-4'] : ['mr-[2rem]']">
        <div class="relative">
          <button
            v-if="props.active"
            class="relative block"
            @click="props.openVoiceCallModal"
          >
            <CallAvatar
              v-for="(member, index) in members"
              :member="member"
              :index="index"
              :members-length="members.length"
            />
          </button>

          <CallAvatar
            v-else
            v-for="(member, index) in members"
            :member="member"
            :index="index"
            :members-length="members.length"
          />
        </div>
      </div>

      <div class="w-full flex flex-col">
        <div class="w-full">
          <!--contacts names-->
          <div class="flex items-start">
            <div class="grow mb-4 text-start">
              <button
                v-if="props.active"
                class="block"
                @click="props.openVoiceCallModal"
              >
                <p class="heading-2 text-color">
                  {{ getCallName(props.call) }}
                </p>
              </button>

              <p v-else class="heading-2 text-color">
                {{ getCallName(props.call) }}
              </p>
            </div>

            <!--end Call-->
            <button
              v-if="props.active"
              @click="props.endCall"
              class="p-[.3125rem] flex justify-center items-center rounded-full outline-none bg-danger hover:bg-danger-hover active:bg-danger-active transition-all duration-500 ease"
            >
              <PhoneIcon class="w-[.875rem] h-[.875rem] text-white" />
            </button>

            <!--status icon-->
            <div v-else class="mr-2">
              <PhoneXMarkIcon
                v-if="props.call.status === 'missed'"
                class="w-[.875rem] h-[.875rem] text-danger dark:text-danger"
              />
              <PhoneArrowUpRightIcon
                v-else-if="props.call.status === 'sent'"
                class="w-[.875rem] h-[.875rem] text-success dark:text-success"
              />
              <PhoneArrowDownLeftIcon
                v-else-if="props.call.status === 'received'"
                class="w-[.875rem] h-[.875rem] text-success dark:text-success"
              />
            </div>
          </div>
        </div>

        <div>
          <!--recording length-->
          <p
            v-if="props.active"
            class="body-2 flex justify-start items-center text-primary"
          >
            {{ props.call.length }}
          </p>

          <!--recording date-->
          <p v-else class="body-2 text-color flex justify-start items-center">
            {{ props.call.date }}
          </p>
        </div>
      </div>
    </component>
  </div>
</template>
