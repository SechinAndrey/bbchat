<script setup lang="ts">
import type { IMessage } from "@src/shared/types/types";

import { getFullName } from "@src/shared/utils/utils";

const props = defineProps<{
  message: IMessage;
}>();
</script>

<template>
  <button
    class="w-full p-5 flex outline-none hover:bg-primary-hover/10 focus:bg-primary-hover/10 active:bg-primary-hover/20 dark:hover:bg-gray-600 dark:focus:bg-gray-600 duration-200"
  >
    <!--profile image-->
    <div class="mr-4">
      <div
        :style="{ backgroundImage: `url(${props.message.sender.avatar})` }"
        class="w-7 h-7 rounded-full bg-cover bg-center"
      ></div>
    </div>

    <!--name and message-->
    <div class="grow">
      <div class="flex flex-col items-start">
        <p class="heading-2 text-color mb-4">
          {{ getFullName(props.message.sender) }}
        </p>

        <p class="body-2 text-color">Wow really cool</p>
      </div>
    </div>

    <!--message date-->
    <div>
      <p class="body-4 text-color">1/5/2019</p>
    </div>
  </button>
</template>
