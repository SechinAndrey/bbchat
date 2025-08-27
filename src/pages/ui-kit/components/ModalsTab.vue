<script setup lang="ts">
import { ref } from "vue";

import Modal from "@src/ui/modals/Modal.vue";

import Button from "@src/ui/inputs/Button.vue";

const modalOpen = ref(false);
const nestedModalOpen = ref(false);
const longContentModalOpen = ref(false);

const toggleModal = () => {
  modalOpen.value = !modalOpen.value;
};

const toggleNestedModal = () => {
  nestedModalOpen.value = !nestedModalOpen.value;
};

const toggleLongContentModal = () => {
  longContentModalOpen.value = !longContentModalOpen.value;
};
</script>

<template>
  <div class="p-6">
    <h2 class="text-2xl font-bold mb-6">Modals</h2>

    <!-- Basic Modal -->
    <section class="mb-10">
      <h3 class="mb-4">Basic Modal</h3>
      <div class="p-4 border rounded dark:border-gray-600">
        <div class="flex justify-center">
          <Button class="" @click="toggleModal"> Open Modal </Button>
        </div>
        <div class="mt-4 p-4 bg-surface-variant rounded">
          <p class="">Basic modal dialog</p>
          <p class="mt-2">
            Features include adaptive mobile/desktop behavior, iOS-style swipe-to-close on mobile,
            focus trap with nested modal support, and ability to close with ESC key or clicking outside.
          </p>
        </div>
      </div>

      <!-- Modal Component -->
      <Modal :open="modalOpen" :close-modal="toggleModal">
        <template v-slot:content>
          <div class="p-6">
            <div class="text-center">
              <h3 class="text-lg leading-6 font-medium text-app-text" id="modal-title">
                Modal Dialog Example
              </h3>
              <div class="mt-4">
                <p class="text-app-text-secondary">
                  This is an example of a modal dialog component. You can
                  close it by clicking outside or pressing ESC.
                </p>
                <div class="mt-4">
                  <Button @click="toggleNestedModal">Open Nested Modal</Button>
                </div>
              </div>
            </div>
            <div class="mt-6">
              <Button class="w-full" @click="toggleModal"> Close Modal </Button>
            </div>
          </div>
        </template>
      </Modal>

      <!-- Nested Modal Component -->
      <Modal :open="nestedModalOpen" :close-modal="toggleNestedModal" :close-on-click-outside="false">
        <template v-slot:content>
          <div class="p-6">
            <div class="text-center">
              <h3 class="text-lg leading-6 font-medium text-app-text" id="nested-modal-title">
                Nested Modal
              </h3>
              <div class="mt-4">
                <p class="text-app-text-secondary">
                  This is a nested modal inside another modal. Both should work independently.
                </p>
                <p class="mt-2 text-app-text-secondary">
                  Try pressing ESC - only the topmost modal should close. This modal cannot be closed by clicking outside.
                </p>
              </div>
            </div>
            <div class="mt-6">
              <Button class="w-full" @click="toggleNestedModal"> Close Nested Modal </Button>
            </div>
          </div>
        </template>
      </Modal>
    </section>

    <!-- Long Content Modal -->
    <section class="mb-10">
      <h3 class="mb-4">Modal with Long Content & Scrolling</h3>
      <div class="p-4 border rounded dark:border-gray-600">
        <div class="flex justify-center">
          <Button @click="toggleLongContentModal">Open Long Content Modal</Button>
        </div>
        <div class="mt-4 p-4 bg-surface-variant rounded">
          <p class="">Modal with very long content that demonstrates scrolling behavior</p>
          <p class="mt-2">
            The modal automatically handles content overflow with proper scrolling within the content area.
            Maximum height is constrained to 90vh with dedicated scrollable content area.
          </p>
        </div>
      </div>

      <!-- Long Content Modal Component -->
      <Modal :open="longContentModalOpen" :close-modal="toggleLongContentModal">
        <template v-slot:content>
          <div class="p-6">
            <div class="text-center mb-6">
              <h3 class="text-lg leading-6 font-medium text-app-text" id="long-modal-title">
                Modal with Very Long Content
              </h3>
              <p class="mt-2 text-app-text-secondary">
                This modal demonstrates proper scrolling behavior for long content
              </p>
            </div>
            
            <!-- Very long content to test scrolling -->
            <div class="space-y-4 text-app-text-secondary">
              <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
              
              <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
              
              <p>Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.</p>
              
              <p>Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.</p>
              
              <p>Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem.</p>
              
              <p>Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur.</p>
              
              <p>At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident.</p>
              
              <p>Similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio.</p>
              
              <p>Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus.</p>
              
              <p>Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae.</p>
              
              <p>Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat.</p>
              
              <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.</p>
              
              <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
              
              <p>Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.</p>
              
              <p>Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet.</p>
              
              <div class="mt-8 p-4 bg-app-bg-secondary rounded-lg">
                <h4 class="font-medium text-app-text mb-2">Scrolling Test Section</h4>
                <p>This section should be visible when scrolling down. The modal maintains proper scrolling behavior while keeping the header and footer accessible.</p>
              </div>
              
              <p>Final paragraph to test the end of scrollable content. You should be able to scroll back to the top smoothly.</p>
            </div>
            
            <div class="mt-6 pt-4 border-t border-app-border">
              <Button class="w-full" @click="toggleLongContentModal">Close Modal</Button>
            </div>
          </div>
        </template>
      </Modal>
    </section>

    <section class="mb-10">
      <h3 class="mb-4">Adaptive Behavior & Mobile Features</h3>
      <div class="p-4 border rounded dark:border-gray-600">
        <p class="mb-4">The modal component now has adaptive behavior:</p>
        <ul class="list-disc pl-5 mb-4">
          <li><strong>Desktop:</strong> Centered modal with traditional appearance</li>
          <li><strong>Mobile:</strong> Slides up from bottom with rounded top corners and iOS-style handle</li>
          <li><strong>Swipe to close:</strong> On mobile, swipe down on the handle to close the modal</li>
          <li><strong>Nested modals:</strong> Support for modals inside modals with proper focus management</li>
          <li><strong>ESC key:</strong> Only closes the topmost modal in nested scenarios</li>
          <li><strong>Content scrolling:</strong> Long content automatically scrolls within the modal bounds</li>
        </ul>
        <p>Try resizing your browser window or testing on mobile to see the adaptive behavior in action.</p>
      </div>
    </section>
  </div>
</template>
