<script setup lang="ts">
import IconAndText from "@src/shared/components/blocks/IconAndText.vue";
import ContactItem from "@src/shared/components/blocks/ContactItem.vue";
import CallAvatar from "@src/shared/components/blocks/CallAvatar.vue";

import { BellIcon, UserPlusIcon, TrashIcon } from "@heroicons/vue/24/outline";

const demoContact = {
  id: 1,
  firstName: "John",
  lastName: "Doe",
  avatar: "https://randomuser.me/api/portraits/men/1.jpg",
  phoneNumber: "+1234567890",
  email: "john.doe@example.com",
  status: "online",
  lastSeen: new Date(),
};

// Demo data for group call
const demoCallMembers = [
  {
    id: 1,
    firstName: "John",
    lastName: "Doe",
    avatar: "https://randomuser.me/api/portraits/men/1.jpg",
    email: "john.doe@example.com",
    lastSeen: new Date(),
  },
  {
    id: 2,
    firstName: "Jane",
    lastName: "Smith",
    avatar: "https://randomuser.me/api/portraits/women/2.jpg",
    email: "jane.smith@example.com",
    lastSeen: new Date(),
  },
  {
    id: 3,
    firstName: "Alex",
    lastName: "Johnson",
    avatar: "https://randomuser.me/api/portraits/men/3.jpg",
    email: "alex.johnson@example.com",
    lastSeen: new Date(),
  },
];
</script>

<template>
  <div>
    <h2 class="heading-1 text-color mb-6">UI Blocks</h2>

    <!-- IconAndText -->
    <section class="mb-10">
      <h3 class="heading-2 text-color mb-4">Icon and Text</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div class="p-4 border rounded dark:border-gray-600">
          <h4 class="body-2 text-color mb-2">Icon with Text (Info Item)</h4>
          <div class="p-4 bg-gray-50 dark:bg-gray-700 rounded">
            <IconAndText :icon="BellIcon" title="Notifications" />
          </div>
          <div class="mt-2 p-4 bg-gray-50 dark:bg-gray-700 rounded">
            <p class="body-3 text-color">
              Basic information item with icon and text
            </p>
          </div>
        </div>
        <div class="p-4 border rounded dark:border-gray-600">
          <h4 class="body-2 text-color mb-2">
            Icon with Text (Link with Chevron)
          </h4>
          <div class="p-4 bg-gray-50 dark:bg-gray-700 rounded">
            <IconAndText
              link
              :icon="UserPlusIcon"
              title="Add Members"
              chevron
            />
          </div>
          <div class="mt-2 p-4 bg-gray-50 dark:bg-gray-700 rounded">
            <p class="body-3 text-color">
              Link item with chevron for navigation
            </p>
          </div>
        </div>
        <div class="p-4 border rounded dark:border-gray-600">
          <h4 class="body-2 text-color mb-2">Icon with Text and Switch</h4>
          <div class="p-4 bg-gray-50 dark:bg-gray-700 rounded">
            <IconAndText :icon="BellIcon" title="Enable Notifications" switch />
          </div>
          <div class="mt-2 p-4 bg-gray-50 dark:bg-gray-700 rounded">
            <p class="body-3 text-color">
              Toggle switch with icon and description
            </p>
          </div>
        </div>
        <div class="p-4 border rounded dark:border-gray-600">
          <h4 class="body-2 text-color mb-2">Icon with Text (Danger Color)</h4>
          <div class="p-4 bg-gray-50 dark:bg-gray-700 rounded">
            <IconAndText
              :icon="TrashIcon"
              title="Delete Account"
              color="danger"
            />
          </div>
          <div class="mt-2 p-4 bg-gray-50 dark:bg-gray-700 rounded">
            <p class="body-3 text-color">
              Warning/danger action with red color
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- ContactItem -->
    <section class="mb-10">
      <h3 class="heading-2 text-color mb-4">Contact Item</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div class="p-4 border rounded dark:border-gray-600">
          <h4 class="body-2 text-color mb-2">Basic Contact Item</h4>
          <div class="p-4 bg-gray-50 dark:bg-gray-700 rounded">
            <ContactItem :contact="demoContact" />
          </div>
          <div class="mt-2 p-4 bg-gray-50 dark:bg-gray-700 rounded">
            <p class="body-3 text-color">
              Standard contact item with name and avatar
            </p>
          </div>
        </div>
        <div class="p-4 border rounded dark:border-gray-600">
          <h4 class="body-2 text-color mb-2">Active Contact Item</h4>
          <div class="p-4 bg-gray-50 dark:bg-gray-700 rounded">
            <ContactItem :contact="demoContact" :active="true" />
          </div>
          <div class="mt-2 p-4 bg-gray-50 dark:bg-gray-700 rounded">
            <p class="body-3 text-color">
              Selected/active contact with highlighted background
            </p>
          </div>
        </div>
        <div class="p-4 border rounded dark:border-gray-600">
          <h4 class="body-2 text-color mb-2">Card Variant Contact</h4>
          <div class="p-4 bg-gray-50 dark:bg-gray-700 rounded">
            <ContactItem :contact="demoContact" variant="card" />
          </div>
          <div class="mt-2 p-4 bg-gray-50 dark:bg-gray-700 rounded">
            <p class="body-3 text-color">
              Card style contact item used in panels
            </p>
          </div>
        </div>
        <div class="p-4 border rounded dark:border-gray-600">
          <h4 class="body-2 text-color mb-2">Unselectable Contact</h4>
          <div class="p-4 bg-gray-50 dark:bg-gray-700 rounded">
            <ContactItem :contact="demoContact" :unselectable="true" />
          </div>
          <div class="mt-2 p-4 bg-gray-50 dark:bg-gray-700 rounded">
            <p class="body-3 text-color">
              Contact item without selection capability
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- CallAvatar -->
    <section class="mb-10">
      <h3 class="heading-2 text-color mb-4">Call Avatar</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div class="p-4 border rounded dark:border-gray-600">
          <h4 class="body-2 text-color mb-2">Single Avatar</h4>
          <div
            class="p-4 bg-gray-50 dark:bg-gray-700 rounded flex justify-center"
          >
            <div class="relative">
              <CallAvatar
                :member="demoCallMembers[0]"
                :index="0"
                :members-length="1"
              />
            </div>
          </div>
          <div class="mt-2 p-4 bg-gray-50 dark:bg-gray-700 rounded">
            <p class="body-3 text-color">Individual call participant avatar</p>
          </div>
        </div>
        <div class="p-4 border rounded dark:border-gray-600">
          <h4 class="body-2 text-color mb-2">Two Avatars</h4>
          <div
            class="p-4 bg-gray-50 dark:bg-gray-700 rounded flex justify-center"
          >
            <div class="relative">
              <CallAvatar
                :member="demoCallMembers[0]"
                :index="0"
                :members-length="2"
              />
              <CallAvatar
                :member="demoCallMembers[1]"
                :index="1"
                :members-length="2"
              />
            </div>
          </div>
          <div class="mt-2 p-4 bg-gray-50 dark:bg-gray-700 rounded">
            <p class="body-3 text-color">
              Two call participants with overlapping avatars
            </p>
          </div>
        </div>
        <div class="p-4 border rounded dark:border-gray-600">
          <h4 class="body-2 text-color mb-2">Group Call (3+ Members)</h4>
          <div
            class="p-4 bg-gray-50 dark:bg-gray-700 rounded flex justify-center"
          >
            <div class="relative">
              <CallAvatar
                :member="demoCallMembers[0]"
                :index="0"
                :members-length="3"
              />
              <CallAvatar
                :member="demoCallMembers[1]"
                :index="1"
                :members-length="3"
              />
            </div>
          </div>
          <div class="mt-2 p-4 bg-gray-50 dark:bg-gray-700 rounded">
            <p class="body-3 text-color">
              Group call with main avatar and counter for additional
              participants
            </p>
          </div>
        </div>
        <div class="p-4 border rounded dark:border-gray-600">
          <h4 class="body-2 text-color mb-2">Large Avatar</h4>
          <div
            class="p-4 bg-gray-50 dark:bg-gray-700 rounded flex justify-center"
          >
            <div class="relative">
              <CallAvatar
                :member="demoCallMembers[0]"
                :index="0"
                :members-length="1"
                :large="true"
              />
            </div>
          </div>
          <div class="mt-2 p-4 bg-gray-50 dark:bg-gray-700 rounded">
            <p class="body-3 text-color">
              Large sized avatar for primary display
            </p>
          </div>
        </div>
        <div class="p-4 border rounded dark:border-gray-600">
          <h4 class="body-2 text-color mb-2">Large Group Call</h4>
          <div
            class="p-4 bg-gray-50 dark:bg-gray-700 rounded flex justify-center"
          >
            <div class="relative">
              <CallAvatar
                :member="demoCallMembers[0]"
                :index="0"
                :members-length="3"
                :large="true"
              />
              <CallAvatar
                :member="demoCallMembers[1]"
                :index="1"
                :members-length="3"
                :large="true"
              />
            </div>
          </div>
          <div class="mt-2 p-4 bg-gray-50 dark:bg-gray-700 rounded">
            <p class="body-3 text-color">
              Large group call display with counter for additional members
            </p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
