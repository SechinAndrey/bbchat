<script setup lang="ts">
import Button from "@src/ui/inputs/Button.vue";
import LabeledTextInput from "@src/ui/inputs/LabeledTextInput.vue";
import Modal from "@src/ui/modals/Modal.vue";

const props = defineProps<{
  openModal: boolean;
  closeModal: () => void;
}>();
</script>

<template>
  <Modal :open="props.openModal" :closeModal="props.closeModal">
    <template v-slot:content>
      <div class="w-[18.75rem] bg-surface dark:bg-surface rounded py-6">
        <!--modal header-->
        <div class="flex justify-between items-center px-5">
          <p id="modal-title" class="" tabindex="0">Add Contact</p>

          <Button class="py-2 px-4" @click="props.closeModal"> esc </Button>
        </div>

        <!--text input-->
        <div class="px-5 pb-5 pt-6">
          <LabeledTextInput type="text" placeholder="Email" />
        </div>

        <!--submit button-->
        <div class="px-5">
          <Button class="w-full py-4"> Add </Button>
        </div>
      </div>
    </template>
  </Modal>
</template>
