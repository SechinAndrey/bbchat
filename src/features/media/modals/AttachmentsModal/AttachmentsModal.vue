<script setup lang="ts">
import mockData from "@src/shared/store/real-api-example.ts";
const attachments = mockData.apiData.messages
  .filter(msg => msg.files.length > 0)
  .map((msg, index) => msg.files.map((file, fileIndex) => ({
    id: index * 100 + fileIndex,
    type: file.audio ? 'audio' : file.type.match(/mp4|avi|mov/i) ? 'video' : 'image',
    name: file.name,
    size: file.size || '0 MB',
    url: file.url,
    thumbnail: file.thumbnail || file.url
  })))
  .flat();

import Attachment from "@src/features/media/modals/AttachmentsModal/Attachment.vue";
import Button from "@src/ui/inputs/Button.vue";
import LabeledTextInput from "@src/ui/inputs/LabeledTextInput.vue";
import Modal from "@src/ui/modals/Modal.vue";
import ScrollBox from "@src/ui/utils/ScrollBox.vue";

const props = defineProps<{
  open: boolean;
  closeModal: () => void;
}>();
</script>

<template>
  <Modal :open="props.open" :close-modal="props.closeModal">
    <template v-slot:content>
      <div class="w-[25rem] bg-white dark:bg-gray-800 rounded py-6">
        <!--attachments list-->
        <ScrollBox class="max-h-[8.75rem] overflow-y-scroll">
          <Attachment
            v-for="(attachment, index) in attachments"
            :attachment="attachment"
            :key="index"
          />
        </ScrollBox>

        <!--Caption input-->
        <div class="px-5 py-6">
          <LabeledTextInput placeholder="Caption" type="text" />
        </div>

        <!--Action buttons-->
        <div class="flex w-full px-5">
          <div class="grow flex justify-start">
            <Button class="ghost-primary ghost-text"> Add </Button>
          </div>

          <Button
            class="ghost-primary ghost-text mr-4"
            @click="props.closeModal"
          >
            Cancel
          </Button>

          <Button class="contained-primary contained-text"> Send </Button>
        </div>
      </div>
    </template>
  </Modal>
</template>
