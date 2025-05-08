<script setup lang="ts">
import { ref, provide } from "vue";

import AccordionButton from "@src/ui/data-display/AccordionButton.vue";
import VideoPlayer from "@src/ui/data-display/VideoPlayer.vue";
import Carousel from "@src/ui/data-display/Carousel/Carousel.vue";
import Toolbar from "@src/ui/data-display/Carousel/Toolbar.vue";

import Tabs from "@src/ui/navigation/Tabs/Tabs.vue";
import Tab from "@src/ui/navigation/Tabs/Tab.vue";

import Button from "@src/ui/inputs/Button.vue";

const accordionCollapsed = ref(false);
const carouselOpen = ref(false);
const carouselStartingId = ref(1);

const toggleAccordion = function() {
  accordionCollapsed.value = !accordionCollapsed.value;
};

const toggleCarousel = function() {
  carouselOpen.value = !carouselOpen.value;
};

const demoAttachments = [
  {
    id: 1,
    type: "image",
    url: "https://picsum.photos/800/600",
    name: "Sample Image 1"
  },
  {
    id: 2,
    type: "image",
    url: "https://picsum.photos/800/601",
    name: "Sample Image 2"
  }
];

provide("activeConversation", {
  messages: [
    {
      attachments: demoAttachments
    }
  ]
});
</script>

<template>
  <div>
    <h2 class="heading-1 text-color mb-6">Display Elements</h2>

    <!-- Accordion -->
    <section class="mb-10">
      <h3 class="heading-2 text-color mb-4">Accordion</h3>
      <div class="p-4 border rounded dark:border-gray-600">
        <AccordionButton
          :collapsed="accordionCollapsed"
          chevron
          @click="toggleAccordion"
        >
          <span class="body-2 text-color">Click to {{ accordionCollapsed ? 'expand' : 'collapse' }}</span>
        </AccordionButton>
        <div v-if="!accordionCollapsed" class="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded">
          <p class="body-2 text-color">Accordion content</p>
          <p class="body-3 text-color mt-2">This is hidden content that can be revealed by clicking the accordion header.</p>
        </div>
      </div>
    </section>

    <!-- VideoPlayer -->
    <section class="mb-10">
      <h3 class="heading-2 text-color mb-4">Video Player</h3>
      <div class="p-4 border rounded dark:border-gray-600">
        <div class="flex justify-center">
          <VideoPlayer
            id="demo-video"
            url="https://samplelib.com/lib/preview/mp4/sample-5s.mp4"
            thumbnail="https://samplelib.com/lib/preview/mp4/sample-5s.jpg"
            name="Sample Video"
          />
        </div>
        <div class="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded">
          <p class="body-2 text-color">Custom video player with playback controls</p>
          <p class="body-3 text-color mt-2">Features include play/pause, volume control, progress bar, and fullscreen toggle</p>
        </div>
      </div>
    </section>

    <!-- Tabs -->
    <section class="mb-10">
      <h3 class="heading-2 text-color mb-4">Tabs</h3>
      <div class="p-4 border rounded dark:border-gray-600">
        <div class="mb-4">
          <Tabs>
            <Tab :active="true" name="Active Tab" />
            <Tab :active="false" name="Inactive Tab" />
            <Tab :active="false" name="Another Tab" />
          </Tabs>
        </div>
        <div class="p-4 bg-gray-50 dark:bg-gray-700 rounded">
          <p class="body-2 text-color">Active tab content</p>
        </div>
      </div>
    </section>

    <!-- Carousel -->
    <section class="mb-10">
      <h3 class="heading-2 text-color mb-4">Media Carousel</h3>
      <div class="p-4 border rounded dark:border-gray-600">
        <div class="flex justify-center mb-4">
          <Button class="contained-primary contained-text" @click="toggleCarousel">
            Open Image Carousel
          </Button>
        </div>
        <div class="p-4 bg-gray-50 dark:bg-gray-700 rounded">
          <p class="body-2 text-color">Media Carousel</p>
          <p class="body-3 text-color mt-2">A fullscreen carousel for displaying images and videos. Features include zoom control, navigation between items, and keyboard shortcuts.</p>
          <div class="mt-2">
            <h5 class="body-3 font-medium text-color">Keyboard Controls:</h5>
            <ul class="list-disc pl-5 body-3 text-color">
              <li>ESC - Close carousel</li>
              <li>Arrow Left/Right - Navigate between items</li>
              <li>+ / - Keys - Zoom in/out (for images)</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Carousel Component -->
      <Carousel
        :open="carouselOpen"
        :starting-id="carouselStartingId"
        :close-carousel="toggleCarousel"
      />

      <!-- Toolbar Component (for demonstration) -->
      <div class="mt-5 p-4 border rounded dark:border-gray-600">
        <h4 class="body-2 text-color mb-4">Carousel Toolbar Component</h4>
        <div class="p-4 bg-gray-700 rounded flex justify-end">
          <Toolbar
            :is-image="true"
            :handle-close-carousel="() => {}"
            :handle-increase-zoom="() => {}"
            :handle-decrease-zoom="() => {}"
          />
        </div>
        <div class="mt-2 p-4 bg-gray-50 dark:bg-gray-700 rounded">
          <p class="body-3 text-color">The Toolbar component provides controls for zooming images and closing the carousel.</p>
        </div>
      </div>
    </section>
  </div>
</template>