<script setup lang="ts">
import { ref } from "vue";

import FadeTransition from "@src/ui/transitions/FadeTransition.vue";
import SlideTransition from "@src/ui/transitions/SlideTransition.vue";
import ScaleTransition from "@src/ui/transitions/ScaleTransition.vue";
import CollapseTransition from "@src/ui/transitions/CollapseTransition.vue";
import ExpandTransition from "@src/ui/transitions/ExpandTransition.vue";

import Button from "@src/ui/inputs/Button.vue";

const showTransitionContent = ref(false);

const toggleTransitionContent = function() {
  showTransitionContent.value = !showTransitionContent.value;
};
</script>

<template>
  <div>
    <h2 class="heading-1 text-color mb-6">Transitions and Animations</h2>

    <div class="mb-4">
      <Button class="contained-primary contained-text" @click="toggleTransitionContent">
        {{ showTransitionContent ? 'Hide' : 'Show' }} content
      </Button>
    </div>

    <!-- Transitions -->
    <section class="mb-10">
      <h3 class="heading-2 text-color mb-4">Fade Transition</h3>
      <div class="p-4 border rounded dark:border-gray-600 min-h-[120px]">
        <FadeTransition>
          <div v-if="showTransitionContent" class="p-4 bg-indigo-100 dark:bg-indigo-700 rounded">
            <p class="body-2 text-color">This is content with fade animation</p>
          </div>
        </FadeTransition>
      </div>
    </section>

    <section class="mb-10">
      <h3 class="heading-2 text-color mb-4">Slide Transition</h3>
      <div class="p-4 border rounded dark:border-gray-600 min-h-[120px]">
        <SlideTransition animation="slide-down">
          <div v-if="showTransitionContent" class="p-4 bg-green-100 dark:bg-green-700 rounded">
            <p class="body-2 text-color">This is content with slide animation</p>
          </div>
        </SlideTransition>
      </div>
    </section>

    <section class="mb-10">
      <h3 class="heading-2 text-color mb-4">Scale Transition</h3>
      <div class="p-4 border rounded dark:border-gray-600 min-h-[120px]">
        <ScaleTransition>
          <div v-if="showTransitionContent" class="p-4 bg-blue-100 dark:bg-blue-700 rounded">
            <p class="body-2 text-color">This is content with scale animation</p>
          </div>
        </ScaleTransition>
      </div>
    </section>

    <section class="mb-10">
      <h3 class="heading-2 text-color mb-4">Collapse Transition</h3>
      <div class="p-4 border rounded dark:border-gray-600 min-h-[120px]">
        <CollapseTransition>
          <div v-if="showTransitionContent" class="p-4 bg-red-100 dark:bg-red-700 rounded">
            <p class="body-2 text-color">This is content with collapse animation</p>
          </div>
        </CollapseTransition>
      </div>
    </section>

    <section class="mb-10">
      <h3 class="heading-2 text-color mb-4">Expand Transition</h3>
      <div class="p-4 border rounded dark:border-gray-600 min-h-[120px]">
        <ExpandTransition>
          <div v-if="showTransitionContent" class="p-4 bg-yellow-100 dark:bg-yellow-700 rounded">
            <p class="body-2 text-color">This is content with expand animation</p>
          </div>
        </ExpandTransition>
      </div>
    </section>
  </div>
</template>