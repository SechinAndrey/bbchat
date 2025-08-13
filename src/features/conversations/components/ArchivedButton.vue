<script setup lang="ts">
import { ArchiveBoxIcon, XMarkIcon } from "@heroicons/vue/24/outline";
import useStore from "@src/shared/store/store";

const props = defineProps<{
  open: boolean;
}>();

const store = useStore();
</script>

<template>
  <div>
    <button
      :aria-label="'toggle archived conversations'"
      class="group w-full h-[5.75rem] px-5 py-6 mb-3 flex rounded focus:outline-none transition duration-300 ease-out"
      :class="
        props.open
          ? [
              'bg-danger',
              'hover:bg-danger-hover',
              'focus:bg-danger-focus',
              'active:bg-danger-active',
              'dark:bg-danger',
              'dark:hover:bg-danger-hover',
              'dark:focus:bg-danger-focus',
              'dark:active:bg-danger-active',
            ]
          : [
              'focus:bg-primary-hover/10',
              'dark:active:bg-gray-600',
              'dark:focus:bg-gray-600',
              'dark:hover:bg-gray-600',
              ' hover:bg-primary-hover/10',
              'active:bg-primary-hover/20',
            ]
      "
      tabindex="0"
    >
      <!--archived icon-->
      <div class="mr-4" :class="{ hidden: props.open }">
        <div
          class="w-7 h-7 flex justify-center items-center rounded-full bg-surface-variant transition duration-500"
        >
          <ArchiveBoxIcon
            class="w-5 h-5 stroke-1 text-muted transition duration-500"
          />
        </div>
      </div>

      <!--close archive button-->
      <div
        class="w-full h-full flex justify-center items-center"
        :class="{ hidden: !props.open }"
      >
        <XMarkIcon
          class="w-5 h-5 mr-3 stroke-1"
          :class="
            props.open
              ? [
                  'text-white',
                  'dark:text-white',
                  'group-hover:text-white',
                  'group-focus:text-white',
                ]
              : []
          "
        />

        <p
          class="text-white dark:text-white group-hover:text-white group-focus:text-white"
        >
          Close Archive
        </p>
      </div>

      <div class="w-full flex flex-col" :class="{ hidden: props.open }">
        <div class="w-full">
          <!--title-->
          <div class="flex items-start">
            <div class="grow mb-4 text-start">
              <p class="">Archived Conversations</p>
            </div>
          </div>
        </div>

        <div>
          <!--number of conversations -->
          <p class="flex justify-start items-center">
            {{ store.archivedConversations.length }}
            conversations
          </p>
        </div>
      </div>
    </button>
  </div>
</template>
