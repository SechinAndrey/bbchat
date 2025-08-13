<script setup lang="ts">
import type { IContact, IConversation } from "@src/shared/types/types";

import { computed, ref } from "vue";

import { getAvatar, getName, getOddContact } from "@src/shared/utils/utils";

import {
  ArrowLeftStartOnRectangleIcon,
  AtSymbolIcon,
  BellIcon,
  NoSymbolIcon,
  PencilIcon,
  ShareIcon,
  TrashIcon,
  UserIcon,
} from "@heroicons/vue/24/outline";
import { ArrowUturnLeftIcon } from "@heroicons/vue/24/solid";
import IconAndText from "@src/shared/components/blocks/IconAndText.vue";
import ImageViewer from "@src/features/conversations/modals/ConversationInfoModal/ConversationInfoTab/ImageViewer.vue";
import Button from "@src/ui/inputs/Button.vue";
import IconButton from "@src/ui/inputs/IconButton.vue";

const props = defineProps<{
  conversation: IConversation;
  contact?: IContact;
  closeModal: () => void;
}>();

const openImageViewer = ref(false);

const imageUrl = computed(() => {
  if (props.contact) {
    return props.contact.avatar;
  } else {
    return getAvatar(props.conversation);
  }
});
</script>

<template>
  <div>
    <div class="mb-6 px-5 flex justify-between items-center">
      <!--title-->
      <p id="modal-title" class="" tabindex="0">
        <span v-if="conversation.type === 'couple' || props.contact"
          >Contact</span
        >
        <span v-else-if="conversation.type === 'group'">Group</span>
        <span v-else-if="conversation.type === 'broadcast'">Broadcast</span>
        Info
      </p>

      <!--close button-->
      <Button v-if="!props.contact" class="py-2 px-4" @click="props.closeModal">
        esc
      </Button>

      <!--return button-->
      <IconButton
        v-else
        class="p-2"
        @click="
          $emit('active-page-change', {
            tabName: 'members',
            animationName: 'slide-right',
          })
        "
      >
        <ArrowUturnLeftIcon
          class="w-5 h-5 text-black opacity-50 dark:text-white dark:opacity-70 group-focus:text-danger dark:group-focus:text-white group-hover:text-danger group-hover:opacity-100 dark:group-hover:text-white"
        />
      </IconButton>
    </div>

    <!--top-->
    <div class="w-full p-5 pb-6">
      <div class="flex">
        <!--avatar-->
        <div class="mr-5">
          <button
            class="outline-none"
            aria-label="view avatar"
            @click="openImageViewer = true"
          >
            <div
              :style="{
                backgroundImage: `url(${getAvatar(props.conversation)})`,
              }"
              class="w-[2.375rem] h-[2.375rem] rounded-full bg-cover bg-center"
            ></div>
          </button>
        </div>

        <!--name-->
        <div class="w-full flex justify-between">
          <div>
            <p class="mb-3 mr-5 text-start">
              <span>
                {{ getName(props.conversation) }}
              </span>
            </p>

            <p class="font-extralight text-start">
              <!--last seen-->
              <!--or number of group members-->
              {{
                conversation.type === "couple" || props.contact
                  ? "Last seen Dec 16, 2019"
                  : `${conversation.contacts.length} Contacts`
              }}
            </p>
          </div>

          <IconButton
            v-if="['group', 'broadcast'].includes(conversation.type)"
            title="edit group"
            class="w-7 h-7"
            @click="
              $emit('active-page-change', {
                tabName: 'edit-group',
                animationName: 'slide-left',
              })
            "
          >
            <PencilIcon class="w-5 h-5" />
          </IconButton>
        </div>
      </div>
    </div>

    <!--middle-->
    <div class="w-full py-5 border-t border-gray-100 dark:border-gray-700">
      <!--(contact) email-->
      <div
        v-if="conversation.type === 'couple' || props.contact"
        class="flex px-5 pb-5 items-center"
      >
        <IconAndText
          :icon="AtSymbolIcon"
          :title="getOddContact(props.conversation)?.email"
        />
      </div>

      <!--(group) members-->
      <div
        v-if="
          ['group', 'broadcast'].includes(conversation.type) && !props.contact
        "
        class="px-5 flex items-center pb-5"
      >
        <IconAndText
          :icon="UserIcon"
          title="members"
          link
          chevron
          @click="
            $emit('active-page-change', {
              tabName: 'members',
              animationName: 'slide-left',
            })
          "
        />
      </div>

      <!--(both) notifications-->
      <div class="px-5 flex items-center">
        <IconAndText :icon="BellIcon" title="notifications" switch />
      </div>

      <!--(both) shared media-->
      <div class="px-5 pt-5 flex items-center">
        <IconAndText
          :icon="ShareIcon"
          title="shared media"
          link
          chevron
          @click="
            $emit('active-page-change', {
              tabName: 'shared-media',
              animationName: 'slide-left',
            })
          "
        />
      </div>
    </div>

    <!--bottom-->
    <div class="w-full border-t border-gray-100 dark:border-gray-700">
      <!--(contact) block contact-->
      <div
        v-if="conversation.type === 'couple' || props.contact"
        class="px-5 pt-5 group"
      >
        <IconAndText :icon="NoSymbolIcon" title="block contact" link />
      </div>

      <!--(contact) delete contact-->
      <div
        v-if="conversation.type === 'couple' || props.contact"
        class="px-5 pt-5 group"
      >
        <IconAndText :icon="TrashIcon" title="delete contact" link />
      </div>

      <!--(group) exit group-->
      <div
        v-if="
          ['group', 'broadcast'].includes(conversation.type) && !props.contact
        "
        class="px-5 pt-5 flex items-center group"
      >
        <IconAndText
          :icon="ArrowLeftStartOnRectangleIcon"
          title="exit group"
          link
        />
      </div>
    </div>

    <!--image viewer-->
    <ImageViewer
      :image-url="imageUrl"
      :open="openImageViewer"
      :close-image="() => (openImageViewer = false)"
    />
  </div>
</template>
