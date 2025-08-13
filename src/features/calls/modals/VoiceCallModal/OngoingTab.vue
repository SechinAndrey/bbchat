<script setup lang="ts">
import type { ICall, IContact } from "@src/shared/types/types";

import { getCallName } from "@src/shared/utils/utils";

import {
  ChatBubbleBottomCenterTextIcon,
  PhoneIcon,
  SpeakerXMarkIcon,
  UserPlusIcon,
} from "@heroicons/vue/24/solid";
import CallAvatar from "@src/shared/components/blocks/CallAvatar.vue";
import IconButton from "@src/ui/inputs/IconButton.vue";

const props = defineProps<{
  members: IContact[];
  activeCall: ICall;
  closeModal: () => void;
}>();
</script>

<template>
  <div class="w-full h-full pt-6 flex flex-col items-center">
    <!--call info-->
    <div class="mb-7">
      <div class="relative mb-5">
        <CallAvatar
          v-for="(member, index) in members"
          :member="member"
          :index="index"
          :members-length="members.length"
          :large="true"
        />
      </div>

      <p class="mb-4 outline-none" tabindex="0">
        {{ getCallName(activeCall) }}
      </p>

      <p class="outline-none text-success" tabindex="0">
        {{ activeCall.direction }}
      </p>
    </div>

    <!--call actions-->
    <div class="mb-9 flex">
      <!--add member to call-->
      <div class="mr-5 first-letter:flex flex-col justify-center items-center">
        <IconButton class="p-3 mb-3">
          <UserPlusIcon class="w-[1.0625rem] h-[1.0625rem]" />
        </IconButton>
        <p class="">add</p>
      </div>

      <!--mute sound-->
      <div class="mr-5 flex flex-col justify-center items-center">
        <IconButton class="p-3 mb-3">
          <SpeakerXMarkIcon
            class="w-[1.0625rem] h-[1.0625rem] text-black text-opacity-60 dark:text-white dark:text-opacity-70"
          />
        </IconButton>
        <p class="">mute</p>
      </div>

      <!--open chat-->
      <div class="flex flex-col justify-center items-center">
        <IconButton class="p-3 mb-3">
          <ChatBubbleBottomCenterTextIcon
            class="w-[1.0625rem] h-[1.0625rem] text-black text-opacity-60 dark:text-white dark:text-opacity-70"
          />
        </IconButton>
        <p class="">chat</p>
      </div>
    </div>

    <!--call actions-->
    <div
      class="relative w-full h-[3.125rem] rounded-b flex justify-center bg-surface-variant dark:bg-surface-variant"
    >
      <div class="absolute bottom-[1.1875rem]">
        <div class="p-3 rounded-full bg-surface dark:bg-surface">
          <IconButton
            @click="
              () => {
                props.closeModal();
              }
            "
            class="p-[1.0625rem]"
          >
            <PhoneIcon class="w-[1rem] h-[1rem]" />
          </IconButton>
        </div>
      </div>
    </div>
  </div>
</template>
