<script setup lang="ts">
import { ref } from "vue";

import Modal from "@src/ui/modals/Modal.vue";

import Button from "@src/ui/inputs/Button.vue";

const modalOpen = ref(false);

const toggleModal = function() {
  modalOpen.value = !modalOpen.value;
};
</script>

<template>
  <div>
    <h2 class="heading-1 text-color mb-6">Modal Dialogs</h2>

    <!-- Basic Modal -->
    <section class="mb-10">
      <h3 class="heading-2 text-color mb-4">Basic Modal</h3>
      <div class="p-4 border rounded dark:border-gray-600">
        <div class="flex justify-center">
          <Button class="contained-primary contained-text" @click="toggleModal">
            Open Modal
          </Button>
        </div>
        <div class="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded">
          <p class="body-2 text-color">Basic modal dialog</p>
          <p class="body-3 text-color mt-2">Features include a slide transition, focus trap, and ability to close with ESC key or clicking outside.</p>
        </div>
      </div>

      <!-- Modal Component -->
      <Modal :open="modalOpen" :close-modal="toggleModal">
        <template v-slot:content>
          <div class="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
            <div>
              <div class="mt-3 text-center sm:mt-5">
                <h3 class="text-lg leading-6 font-medium text-color" id="modal-title">
                  Modal Dialog Example
                </h3>
                <div class="mt-2">
                  <p class="body-3 text-color">
                    This is an example of a modal dialog component.
                    You can close it by clicking outside or pressing ESC.
                  </p>
                </div>
              </div>
            </div>
            <div class="mt-5 sm:mt-6">
              <Button
                class="contained-primary contained-text w-full"
                @click="toggleModal"
              >
                Close Modal
              </Button>
            </div>
          </div>
        </template>
      </Modal>
    </section>
  </div>
</template>