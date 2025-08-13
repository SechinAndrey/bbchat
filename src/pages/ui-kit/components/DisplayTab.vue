<script setup lang="ts">
import { ref, provide } from "vue";

import AccordionButton from "@src/ui/data-display/AccordionButton.vue";
import VideoPlayer from "@src/ui/data-display/VideoPlayer.vue";

import Tabs from "@src/ui/navigation/Tabs/Tabs.vue";
import Tab from "@src/ui/navigation/Tabs/Tab.vue";

const accordionCollapsed = ref(false);

const toggleAccordion = function () {
  accordionCollapsed.value = !accordionCollapsed.value;
};

const demoAttachments = [
  {
    id: 1,
    type: "image",
    url: "https://picsum.photos/800/600",
    name: "Sample Image 1",
  },
  {
    id: 2,
    type: "image",
    url: "https://picsum.photos/800/601",
    name: "Sample Image 2",
  },
];

provide("activeConversation", {
  messages: [
    {
      attachments: demoAttachments,
    },
  ],
});
</script>

<template>
  <div>
    <h2 class="mb-6">Display Elements</h2>

    <!-- Accordion -->
    <section class="mb-10">
      <h3 class="mb-4">Accordion</h3>
      <div class="p-4 border rounded dark:border-gray-600">
        <AccordionButton
          :collapsed="accordionCollapsed"
          chevron
          @click="toggleAccordion"
        >
          <span class=""
            >Click to {{ accordionCollapsed ? "expand" : "collapse" }}</span
          >
        </AccordionButton>
        <div
          v-if="!accordionCollapsed"
          class="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded"
        >
          <p class="">Accordion content</p>
          <p class="mt-2">
            This is hidden content that can be revealed by clicking the
            accordion header.
          </p>
        </div>
      </div>
    </section>

    <!-- VideoPlayer -->
    <section class="mb-10">
      <h3 class="mb-4">Video Player</h3>
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
          <p class="">Custom video player with playback controls</p>
          <p class="mt-2">
            Features include play/pause, volume control, progress bar, and
            fullscreen toggle
          </p>
        </div>
      </div>
    </section>

    <!-- Tabs -->
    <section class="mb-10">
      <h3 class="mb-4">Tabs</h3>
      <div class="p-4 border rounded dark:border-gray-600">
        <div class="mb-4">
          <Tabs>
            <Tab :active="true" name="Active Tab" />
            <Tab :active="false" name="Inactive Tab" />
            <Tab :active="false" name="Another Tab" />
          </Tabs>
        </div>
        <div class="p-4 bg-gray-50 dark:bg-gray-700 rounded">
          <p class="">Active tab content</p>
        </div>
      </div>
    </section>
  </div>
</template>
