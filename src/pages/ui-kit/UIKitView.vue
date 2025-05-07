<script setup lang="ts">
import { ref, provide } from "vue";

// Import input components
import Button from "@src/ui/inputs/Button.vue";
import IconButton from "@src/ui/inputs/IconButton.vue";
import TextInput from "@src/ui/inputs/TextInput.vue";
import LabeledTextInput from "@src/ui/inputs/LabeledTextInput.vue";
import SearchInput from "@src/ui/inputs/SearchInput.vue";
import PasswordInput from "@src/ui/inputs/PasswordInput.vue";
import Textarea from "@src/ui/inputs/Textarea.vue";
import Checkbox from "@src/ui/inputs/Checkbox.vue";
import SwitchInput from "@src/ui/inputs/SwitchInput.vue";
import RangeSlider from "@src/ui/inputs/RangeSlider.vue";
import DropFileUpload from "@src/ui/inputs/DropFileUpload.vue";

// Import block components
import IconAndText from "@src/shared/components/blocks/IconAndText.vue";
import ContactItem from "@src/shared/components/blocks/ContactItem.vue";
import CallAvatar from "@src/shared/components/blocks/CallAvatar.vue";

// Import data display components
import AccordionButton from "@src/ui/data-display/AccordionButton.vue";
import VideoPlayer from "@src/ui/data-display/VideoPlayer.vue";
import Carousel from "@src/ui/data-display/Carousel/Carousel.vue";
import Toolbar from "@src/ui/data-display/Carousel/Toolbar.vue";

// Import modal components
import Modal from "@src/ui/modals/Modal.vue";

// Import navigation components
import Tabs from "@src/ui/navigation/Tabs/Tabs.vue";
import Tab from "@src/ui/navigation/Tabs/Tab.vue";

// Import state components
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

// Import transition components
import FadeTransition from "@src/ui/transitions/FadeTransition.vue";
import SlideTransition from "@src/ui/transitions/SlideTransition.vue";
import ScaleTransition from "@src/ui/transitions/ScaleTransition.vue";
import CollapseTransition from "@src/ui/transitions/CollapseTransition.vue";
import ExpandTransition from "@src/ui/transitions/ExpandTransition.vue";

// Import icons
import {
  PaperAirplaneIcon,
  UserPlusIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  Cog6ToothIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
  BellIcon,
  ArrowPathIcon,
  PhoneIcon
} from "@heroicons/vue/24/outline";

// Variables for component demonstration
const checkboxValue = ref(false);
const switchValue = ref(false);
const sliderValue = ref(50);
const activeTab = ref("inputs");
const accordionCollapsed = ref(false);
const showTransitionContent = ref(false);
const modalOpen = ref(false);
const carouselOpen = ref(false);
const carouselStartingId = ref(1);

// Functions for component control
const handleCheckboxToggle = () => {
  checkboxValue.value = !checkboxValue.value;
};

const handleSwitchToggle = (value: boolean) => {
  switchValue.value = value;
};

const handleSliderChange = (value: number) => {
  sliderValue.value = value;
};

const toggleAccordion = () => {
  accordionCollapsed.value = !accordionCollapsed.value;
};

const toggleTransitionContent = () => {
  showTransitionContent.value = !showTransitionContent.value;
};

const toggleModal = () => {
  modalOpen.value = !modalOpen.value;
};

const toggleCarousel = () => {
  carouselOpen.value = !carouselOpen.value;
};

// Demo data for carousel
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

// Demo data for contact component
const demoContact = {
  id: 1,
  firstName: "John",
  lastName: "Doe",
  avatar: "https://randomuser.me/api/portraits/men/1.jpg",
  phoneNumber: "+1234567890",
  email: "john.doe@example.com",
  status: "online",
  lastSeen: new Date()
};

// Demo data for group call
const demoCallMembers = [
  {
    id: 1,
    firstName: "John",
    lastName: "Doe",
    avatar: "https://randomuser.me/api/portraits/men/1.jpg",
    email: "john.doe@example.com",
    lastSeen: new Date()
  },
  {
    id: 2,
    firstName: "Jane",
    lastName: "Smith",
    avatar: "https://randomuser.me/api/portraits/women/2.jpg",
    email: "jane.smith@example.com",
    lastSeen: new Date()
  },
  {
    id: 3,
    firstName: "Alex",
    lastName: "Johnson",
    avatar: "https://randomuser.me/api/portraits/men/3.jpg",
    email: "alex.johnson@example.com",
    lastSeen: new Date()
  }
];

// Provide demo data for carousel
provide("activeConversation", {
  messages: [
    {
      attachments: demoAttachments
    }
  ]
});
</script>

<template>
  <div class="w-full min-h-screen bg-white dark:bg-gray-800 p-8">
    <h1 class="text-3xl font-bold text-color mb-8">UI Kit</h1>

    <!-- Navigation by sections -->
    <div class="mb-10">
      <Tabs>
        <Tab
          :active="activeTab === 'inputs'"
          name="Input Elements"
          @click="activeTab = 'inputs'"
        />
        <Tab
          :active="activeTab === 'display'"
          name="Display Elements"
          @click="activeTab = 'display'"
        />
        <Tab
          :active="activeTab === 'blocks'"
          name="Blocks"
          @click="activeTab = 'blocks'"
        />
        <Tab
          :active="activeTab === 'states'"
          name="States"
          @click="activeTab = 'states'"
        />
        <Tab
          :active="activeTab === 'transitions'"
          name="Transitions"
          @click="activeTab = 'transitions'"
        />
        <Tab
          :active="activeTab === 'modals'"
          name="Modals"
          @click="activeTab = 'modals'"
        />
      </Tabs>
    </div>

    <!-- Input elements section -->
    <div v-if="activeTab === 'inputs'">
      <h2 class="heading-1 text-color mb-6">Input Elements</h2>

      <!-- Buttons -->
      <section class="mb-10">
        <h3 class="heading-2 text-color mb-4">Buttons (Button)</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div class="p-4 border rounded dark:border-gray-600">
            <h4 class="body-2 text-color mb-2">Primary Button</h4>
            <Button class="contained-primary contained-text">Primary Button</Button>
          </div>
          <div class="p-4 border rounded dark:border-gray-600">
            <h4 class="body-2 text-color mb-2">Success Button</h4>
            <Button class="contained-success contained-text">Success Button</Button>
          </div>
          <div class="p-4 border rounded dark:border-gray-600">
            <h4 class="body-2 text-color mb-2">Danger Button</h4>
            <Button class="contained-danger contained-text">Warning</Button>
          </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div class="p-4 border rounded dark:border-gray-600">
            <h4 class="body-2 text-color mb-2">Outlined Button (Primary)</h4>
            <Button class="outlined-primary ghost-text">Outlined Button</Button>
          </div>
          <div class="p-4 border rounded dark:border-gray-600">
            <h4 class="body-2 text-color mb-2">Outlined Button (Success)</h4>
            <Button class="outlined-success ghost-text">Outlined Button</Button>
          </div>
          <div class="p-4 border rounded dark:border-gray-600">
            <h4 class="body-2 text-color mb-2">Outlined Button (Danger)</h4>
            <Button class="outlined-danger ghost-text">Outlined Button</Button>
          </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="p-4 border rounded dark:border-gray-600">
            <h4 class="body-2 text-color mb-2">Ghost Button (Primary)</h4>
            <Button class="ghost-primary ghost-text">Ghost Button</Button>
          </div>
          <div class="p-4 border rounded dark:border-gray-600">
            <h4 class="body-2 text-color mb-2">Ghost Button (Success)</h4>
            <Button class="ghost-success ghost-text">Ghost Button</Button>
          </div>
          <div class="p-4 border rounded dark:border-gray-600">
            <h4 class="body-2 text-color mb-2">Ghost Button (Danger)</h4>
            <Button class="ghost-danger ghost-text">Ghost Button</Button>
          </div>
        </div>
      </section>

      <!-- Icon Buttons -->
      <section class="mb-10">
        <h3 class="heading-2 text-color mb-4">Icon Buttons (IconButton)</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div class="p-4 border rounded dark:border-gray-600">
            <h4 class="body-2 text-color mb-2">Primary Icon Button</h4>
            <div class="flex justify-center">
              <IconButton class="ic-btn-contained-primary p-2">
                <PaperAirplaneIcon class="w-5 h-5" />
              </IconButton>
            </div>
          </div>
          <div class="p-4 border rounded dark:border-gray-600">
            <h4 class="body-2 text-color mb-2">Success Icon Button</h4>
            <div class="flex justify-center">
              <IconButton class="ic-btn-contained-success p-2">
                <UserPlusIcon class="w-5 h-5" />
              </IconButton>
            </div>
          </div>
          <div class="p-4 border rounded dark:border-gray-600">
            <h4 class="body-2 text-color mb-2">Danger Icon Button</h4>
            <div class="flex justify-center">
              <IconButton class="ic-btn-contained-danger p-2">
                <TrashIcon class="w-5 h-5" />
              </IconButton>
            </div>
          </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="p-4 border rounded dark:border-gray-600">
            <h4 class="body-2 text-color mb-2">Ghost Icon Button (Primary)</h4>
            <div class="flex justify-center">
              <IconButton class="ic-btn-ghost-primary p-2">
                <MagnifyingGlassIcon class="w-5 h-5" />
              </IconButton>
            </div>
          </div>
          <div class="p-4 border rounded dark:border-gray-600">
            <h4 class="body-2 text-color mb-2">Gray Icon Button</h4>
            <div class="flex justify-center">
              <IconButton class="ic-btn-ghost-gray p-2">
                <Cog6ToothIcon class="w-5 h-5" />
              </IconButton>
            </div>
          </div>
          <div class="p-4 border rounded dark:border-gray-600">
            <h4 class="body-2 text-color mb-2">Ghost Icon Button (Danger)</h4>
            <div class="flex justify-center">
              <IconButton class="ic-btn-ghost-danger p-2">
                <XMarkIcon class="w-5 h-5" />
              </IconButton>
            </div>
          </div>
        </div>
      </section>

      <!-- Text Fields -->
      <section class="mb-10">
        <h3 class="heading-2 text-color mb-4">Text Fields</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div class="p-4 border rounded dark:border-gray-600">
            <h4 class="body-2 text-color mb-2">Text Field with Border</h4>
            <TextInput placeholder="Enter text..." bordered />
          </div>
          <div class="p-4 border rounded dark:border-gray-600">
            <h4 class="body-2 text-color mb-2">Text Field with Fill</h4>
            <TextInput placeholder="Enter text..." />
          </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div class="p-4 border rounded dark:border-gray-600">
            <h4 class="body-2 text-color mb-2">Text Field with Label</h4>
            <LabeledTextInput label="Username" placeholder="Enter name..." />
          </div>
          <div class="p-4 border rounded dark:border-gray-600">
            <h4 class="body-2 text-color mb-2">Password Field</h4>
            <PasswordInput label="Password" placeholder="Enter password..." />
          </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div class="p-4 border rounded dark:border-gray-600">
            <h4 class="body-2 text-color mb-2">Search Field</h4>
            <SearchInput placeholder="Search..." />
          </div>
          <div class="p-4 border rounded dark:border-gray-600">
            <h4 class="body-2 text-color mb-2">Textarea</h4>
            <Textarea placeholder="Enter multiple lines..." />
          </div>
        </div>
      </section>

      <!-- Checkboxes and Switches -->
      <section class="mb-10">
        <h3 class="heading-2 text-color mb-4">Checkboxes and Switches</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div class="p-4 border rounded dark:border-gray-600">
            <h4 class="body-2 text-color mb-2">Checkbox (Unchecked)</h4>
            <div class="flex items-center">
              <Checkbox :value="false" class="mr-2" />
              <span class="body-2 text-color">Unchecked</span>
            </div>
          </div>
          <div class="p-4 border rounded dark:border-gray-600">
            <h4 class="body-2 text-color mb-2">Checkbox (Checked)</h4>
            <div class="flex items-center">
              <Checkbox :value="true" class="mr-2" />
              <span class="body-2 text-color">Checked</span>
            </div>
          </div>
          <div class="p-4 border rounded dark:border-gray-600">
            <h4 class="body-2 text-color mb-2">Checkbox (Interactive)</h4>
            <div class="flex items-center">
              <Checkbox :value="checkboxValue" :handle-check="handleCheckboxToggle" class="mr-2" />
              <span class="body-2 text-color">{{ checkboxValue ? 'Checked' : 'Unchecked' }}</span>
            </div>
          </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div class="p-4 border rounded dark:border-gray-600">
            <h4 class="body-2 text-color mb-2">Switch (Off)</h4>
            <div class="flex items-center">
              <SwitchInput :value="false" class="mr-2" />
              <span class="body-2 text-color">Off</span>
            </div>
          </div>
          <div class="p-4 border rounded dark:border-gray-600">
            <h4 class="body-2 text-color mb-2">Switch (On)</h4>
            <div class="flex items-center">
              <SwitchInput :value="true" class="mr-2" />
              <span class="body-2 text-color">On</span>
            </div>
          </div>
          <div class="p-4 border rounded dark:border-gray-600">
            <h4 class="body-2 text-color mb-2">Switch (Interactive)</h4>
            <div class="flex items-center">
              <SwitchInput :value="switchValue" @switch-clicked="handleSwitchToggle" class="mr-2" />
              <span class="body-2 text-color">{{ switchValue ? 'On' : 'Off' }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Sliders and File Upload -->
      <section class="mb-10">
        <h3 class="heading-2 text-color mb-4">Sliders and File Upload</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="p-4 border rounded dark:border-gray-600">
            <h4 class="body-2 text-color mb-2">Slider ({{ sliderValue }}%)</h4>
            <RangeSlider :percentage="sliderValue" @value-changed="handleSliderChange" />
          </div>
          <div class="p-4 border rounded dark:border-gray-600">
            <h4 class="body-2 text-color mb-2">File Upload</h4>
            <DropFileUpload label="Upload File" />
          </div>
        </div>
      </section>
    </div>

    <!-- Display elements section -->
    <div v-if="activeTab === 'display'">
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

    <!-- Blocks section -->
    <div v-if="activeTab === 'blocks'">
      <h2 class="heading-1 text-color mb-6">UI Blocks</h2>

      <!-- IconAndText -->
      <section class="mb-10">
        <h3 class="heading-2 text-color mb-4">Icon and Text</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div class="p-4 border rounded dark:border-gray-600">
            <h4 class="body-2 text-color mb-2">Icon with Text (Info Item)</h4>
            <div class="p-4 bg-gray-50 dark:bg-gray-700 rounded">
              <IconAndText
                :icon="BellIcon"
                title="Notifications"
              />
            </div>
            <div class="mt-2 p-4 bg-gray-50 dark:bg-gray-700 rounded">
              <p class="body-3 text-color">Basic information item with icon and text</p>
            </div>
          </div>
          <div class="p-4 border rounded dark:border-gray-600">
            <h4 class="body-2 text-color mb-2">Icon with Text (Link with Chevron)</h4>
            <div class="p-4 bg-gray-50 dark:bg-gray-700 rounded">
              <IconAndText
                link
                :icon="UserPlusIcon"
                title="Add Members"
                chevron
              />
            </div>
            <div class="mt-2 p-4 bg-gray-50 dark:bg-gray-700 rounded">
              <p class="body-3 text-color">Link item with chevron for navigation</p>
            </div>
          </div>
          <div class="p-4 border rounded dark:border-gray-600">
            <h4 class="body-2 text-color mb-2">Icon with Text and Switch</h4>
            <div class="p-4 bg-gray-50 dark:bg-gray-700 rounded">
              <IconAndText
                :icon="BellIcon"
                title="Enable Notifications"
                switch
              />
            </div>
            <div class="mt-2 p-4 bg-gray-50 dark:bg-gray-700 rounded">
              <p class="body-3 text-color">Toggle switch with icon and description</p>
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
              <p class="body-3 text-color">Warning/danger action with red color</p>
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
              <p class="body-3 text-color">Standard contact item with name and avatar</p>
            </div>
          </div>
          <div class="p-4 border rounded dark:border-gray-600">
            <h4 class="body-2 text-color mb-2">Active Contact Item</h4>
            <div class="p-4 bg-gray-50 dark:bg-gray-700 rounded">
              <ContactItem :contact="demoContact" :active="true" />
            </div>
            <div class="mt-2 p-4 bg-gray-50 dark:bg-gray-700 rounded">
              <p class="body-3 text-color">Selected/active contact with highlighted background</p>
            </div>
          </div>
          <div class="p-4 border rounded dark:border-gray-600">
            <h4 class="body-2 text-color mb-2">Card Variant Contact</h4>
            <div class="p-4 bg-gray-50 dark:bg-gray-700 rounded">
              <ContactItem :contact="demoContact" variant="card" />
            </div>
            <div class="mt-2 p-4 bg-gray-50 dark:bg-gray-700 rounded">
              <p class="body-3 text-color">Card style contact item used in panels</p>
            </div>
          </div>
          <div class="p-4 border rounded dark:border-gray-600">
            <h4 class="body-2 text-color mb-2">Unselectable Contact</h4>
            <div class="p-4 bg-gray-50 dark:bg-gray-700 rounded">
              <ContactItem :contact="demoContact" :unselectable="true" />
            </div>
            <div class="mt-2 p-4 bg-gray-50 dark:bg-gray-700 rounded">
              <p class="body-3 text-color">Contact item without selection capability</p>
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
            <div class="p-4 bg-gray-50 dark:bg-gray-700 rounded flex justify-center">
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
            <div class="p-4 bg-gray-50 dark:bg-gray-700 rounded flex justify-center">
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
              <p class="body-3 text-color">Two call participants with overlapping avatars</p>
            </div>
          </div>
          <div class="p-4 border rounded dark:border-gray-600">
            <h4 class="body-2 text-color mb-2">Group Call (3+ Members)</h4>
            <div class="p-4 bg-gray-50 dark:bg-gray-700 rounded flex justify-center">
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
              <p class="body-3 text-color">Group call with main avatar and counter for additional participants</p>
            </div>
          </div>
          <div class="p-4 border rounded dark:border-gray-600">
            <h4 class="body-2 text-color mb-2">Large Avatar</h4>
            <div class="p-4 bg-gray-50 dark:bg-gray-700 rounded flex justify-center">
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
              <p class="body-3 text-color">Large sized avatar for primary display</p>
            </div>
          </div>
          <div class="p-4 border rounded dark:border-gray-600">
            <h4 class="body-2 text-color mb-2">Large Group Call</h4>
            <div class="p-4 bg-gray-50 dark:bg-gray-700 rounded flex justify-center">
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
              <p class="body-3 text-color">Large group call display with counter for additional members</p>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- States section -->
    <div v-if="activeTab === 'states'">
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

    <!-- Transitions section -->
    <div v-if="activeTab === 'transitions'">
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

    <!-- Modals section -->
    <div v-if="activeTab === 'modals'">
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
  </div>
</template>
