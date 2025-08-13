<script setup lang="ts">
import type { INotification } from "@src/shared/types/types";

import {
  ArrowPathIcon,
  LockClosedIcon,
  PlusCircleIcon,
} from "@heroicons/vue/24/outline";

const props = defineProps<{
  notification: INotification;
}>();
</script>

<template>
  <div
    class="w-full px-5 py-5 mb-3 flex rounded outline-none"
    tabindex="0"
    :aria-label="props.notification.message"
  >
    <!--notifications icon-->
    <div class="mr-4">
      <div
        class="w-7 h-7 flex justify-center items-center rounded-full transition duration-500"
        :class="{
          'bg-secondary/20 dark:bg-secondary/20':
            notification.flag === 'account-update',
          'bg-warning/20 dark:bg-warning/20': notification.flag === 'security',
          'bg-success/20 dark:bg-success/20':
            notification.flag === 'added-to-group',
        }"
      >
        <ArrowPathIcon
          v-if="notification.flag === 'account-update'"
          class="w-5 h-5 stroke-1 text-secondary dark:text-white transition duration-500"
        />
        <LockClosedIcon
          v-else-if="notification.flag === 'security'"
          class="w-5 h-5 stroke-1 text-warning dark:text-white transition duration-500"
        />
        <PlusCircleIcon
          v-else-if="notification.flag === 'added-to-group'"
          class="w-5 h-5 stroke-1 text-success dark:text-white transition duration-500"
        />
      </div>
    </div>

    <!--notification content-->
    <div class="grow">
      <p class="mb-4">
        {{ props.notification.title }}
      </p>

      <p class="">
        {{ props.notification.message }}
      </p>
    </div>
  </div>
</template>
