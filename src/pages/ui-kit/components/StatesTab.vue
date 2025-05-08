<script setup lang="ts">
import NoConversation from "@src/ui/states/empty-states/NoConversation.vue";
import NoMessage from "@src/ui/states/empty-states/NoMessage.vue";
import NoChatSelected from "@src/ui/states/empty-states/NoChatSelected.vue";
import NoContacts from "@src/ui/states/empty-states/NoContacts.vue";
import NoCalls from "@src/ui/states/empty-states/NoCalls.vue";
import NoMedia from "@src/ui/states/empty-states/NoMedia.vue";
import NoNotifications from "@src/ui/states/empty-states/NoNotifications.vue";
import NoArchive from "@src/ui/states/empty-states/NoArchive.vue";
import Circle2Lines from "@src/ui/states/loading-states/Circle2Lines.vue";
import MultipleLines from "@src/ui/states/loading-states/MultipleLines.vue";
import Spinner from "@src/ui/states/loading-states/Spinner.vue";
</script>

<template>
  <div>
    <h2 class="heading-1 text-color mb-6">States</h2>

    <!-- Empty states -->
    <section class="mb-10">
      <h3 class="heading-2 text-color mb-4">Empty States</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div class="p-4 border rounded dark:border-gray-600">
          <h4 class="body-2 text-color mb-2">No Conversations</h4>
          <NoConversation />
        </div>
        <div class="p-4 border rounded dark:border-gray-600">
          <h4 class="body-2 text-color mb-2">No Messages</h4>
          <NoMessage />
        </div>
        <div class="p-4 border rounded dark:border-gray-600">
          <h4 class="body-2 text-color mb-2">No Chat Selected</h4>
          <NoChatSelected />
        </div>
        <div class="p-4 border rounded dark:border-gray-600">
          <h4 class="body-2 text-color mb-2">No Contacts</h4>
          <NoContacts />
        </div>
        <div class="p-4 border rounded dark:border-gray-600">
          <h4 class="body-2 text-color mb-2">No Calls</h4>
          <NoCalls />
        </div>
        <div class="p-4 border rounded dark:border-gray-600">
          <h4 class="body-2 text-color mb-2">No Media</h4>
          <NoMedia />
        </div>
        <div class="p-4 border rounded dark:border-gray-600">
          <h4 class="body-2 text-color mb-2">No Notifications</h4>
          <NoNotifications />
        </div>
        <div class="p-4 border rounded dark:border-gray-600">
          <h4 class="body-2 text-color mb-2">No Archive</h4>
          <NoArchive />
        </div>
      </div>
    </section>

    <!-- Loading states -->
    <section class="mb-10">
      <h3 class="heading-2 text-color mb-4">Loading States</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="p-4 border rounded dark:border-gray-600">
          <h4 class="body-2 text-color mb-2">Circle with 2 Lines</h4>
          <div class="flex justify-center">
            <Circle2Lines />
          </div>
        </div>
        <div class="p-4 border rounded dark:border-gray-600">
          <h4 class="body-2 text-color mb-2">Multiple Lines</h4>
          <MultipleLines />
        </div>
        <div class="p-4 border rounded dark:border-gray-600">
          <h4 class="body-2 text-color mb-2">Spinner</h4>
          <div class="flex justify-center">
            <Spinner />
          </div>
        </div>
      </div>
    </section>
  </div>
</template>