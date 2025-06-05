<script setup lang="ts">
import { ref } from 'vue';
import { Dropdown, DropdownItem, DropdownFilter } from '@src/ui/navigation/DropdownV3';
import Button from '@src/ui/inputs/Button.vue';
import IconButton from '@src/ui/inputs/IconButton.vue';
import TextInput from '@src/ui/inputs/TextInput.vue';
import Checkbox from '@src/ui/inputs/Checkbox.vue';
import SwitchInput from '@src/ui/inputs/SwitchInput.vue';
import RangeSlider from '@src/ui/inputs/RangeSlider.vue';
import { 
  ChevronDownIcon, 
  AdjustmentsHorizontalIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  FunnelIcon
} from '@heroicons/vue/24/outline';

// For the options example
const selectedOption = ref('Option 1');

// For the filters example
const filters = ref({
  category1: false,
  category2: false,
  category3: false,
  showArchived: false,
  priceRange: 50,
  searchQuery: '',
  sortOrder: 'newest'
});

function selectOption(option: string) {
  selectedOption.value = option;
}

function applyFilters() {
  console.log('Filters applied:', filters.value);
  // Filter application logic would go here
}

function resetFilters() {
  filters.value = {
    category1: false,
    category2: false,
    category3: false,
    showArchived: false,
    priceRange: 50,
    searchQuery: '',
    sortOrder: 'newest'
  };
}

function handleSwitchToggle(value: boolean) {
  filters.value.showArchived = value;
}

function handleSliderChange(value: number) {
  filters.value.priceRange = value;
}

function handleCheckboxToggle(field: string) {
  const filtersObj = filters.value as any;
  filtersObj[field] = !filtersObj[field];
}
</script>

<template>
  <div>
    <h2 class="heading-1 text-color mb-6">Dropdown Menus</h2>

    <!-- Simple Dropdown with options -->
    <section class="mb-10">
      <h3 class="heading-2 text-color mb-4">Simple menu with options</h3>
      <div class="p-4 border rounded dark:border-gray-600">
        <div class="flex gap-4 mb-4">
          <Dropdown position="bottom" trigger="click">
            <template #activator>
              <Button class="contained-primary contained-text">
                {{ selectedOption }}
                <ChevronDownIcon class="w-4 h-4 ml-2" />
              </Button>
            </template>
            
            <DropdownItem 
              v-for="option in ['Option 1', 'Option 2', 'Option 3']" 
              :key="option"
              :active="selectedOption === option"
              @click="selectOption(option)"
            >
              {{ option }}
            </DropdownItem>
          </Dropdown>
          
          <Dropdown position="top" trigger="click">
            <template #activator>
              <Button class="outlined-primary ghost-text">
                Open upwards
                <ArrowUpIcon class="w-4 h-4 ml-2" />
              </Button>
            </template>
            
            <DropdownItem>Item 1</DropdownItem>
            <DropdownItem>Item 2</DropdownItem>
            <DropdownItem disabled>Disabled item</DropdownItem>
          </Dropdown>
        </div>
        
        <div class="p-4 bg-surface-variant rounded">
          <p class="body-2 text-color">Simple dropdown menu with options</p>
          <p class="body-3 text-color mt-2">
            Supports active items, disabled items, and can open in different directions.
            Menu items close after selection.
          </p>
        </div>
      </div>
    </section>

    <!-- Dropdown with different triggers -->
    <section class="mb-10">
      <h3 class="heading-2 text-color mb-4">Different trigger types</h3>
      <div class="p-4 border rounded dark:border-gray-600">
        <div class="flex gap-4 mb-4">
          <Dropdown position="bottom" trigger="click">
            <template #activator>
              <Button class="contained-success contained-text">
                Click trigger
                <ChevronDownIcon class="w-4 h-4 ml-2" />
              </Button>
            </template>
            
            <DropdownItem>Item 1</DropdownItem>
            <DropdownItem>Item 2</DropdownItem>
          </Dropdown>
          
          <Dropdown position="bottom" trigger="hover">
            <template #activator>
              <Button class="outlined-success ghost-text">
                Hover trigger
                <ChevronDownIcon class="w-4 h-4 ml-2" />
              </Button>
            </template>
            
            <DropdownItem>Item 1</DropdownItem>
            <DropdownItem>Item 2</DropdownItem>
          </Dropdown>
        </div>
        
        <div class="p-4 bg-surface-variant rounded">
          <p class="body-2 text-color">Dropdown menu with different triggers</p>
          <p class="body-3 text-color mt-2">
            Menu can be opened by click or by hovering over the activator.
          </p>
        </div>
      </div>
    </section>

    <!-- Dropdown with filters -->
    <section class="mb-10">
      <h3 class="heading-2 text-color mb-4">Filter menu</h3>
      <div class="p-4 border rounded dark:border-gray-600">
        <div class="flex gap-4 mb-4">
          <Dropdown position="bottom" trigger="click" :close-on-select="false">
            <template #activator>
              <Button class="contained-primary contained-text">
                Advanced Filters
                <FunnelIcon class="w-4 h-4 ml-2" />
              </Button>
            </template>
            
            <DropdownFilter @apply="applyFilters" @reset="resetFilters">
              <div class="p-2">
                <!-- Search Input -->
                <div class="mb-4">
                  <h4 class="body-2 text-color font-medium mb-2">Search</h4>
                  <TextInput 
                    v-model="filters.searchQuery" 
                    placeholder="Search items..." 
                    bordered
                    class="w-full"
                  />
                </div>
                
                <!-- Categories with Checkboxes -->
                <div class="mb-4">
                  <h4 class="body-2 text-color font-medium mb-2">Categories</h4>
                  <div class="flex flex-col gap-2">
                    <div class="flex items-center gap-2">
                      <Checkbox 
                        :value="filters.category1" 
                        :handle-check="() => handleCheckboxToggle('category1')" 
                      />
                      <span class="body-3 text-color">Category 1</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <Checkbox 
                        :value="filters.category2" 
                        :handle-check="() => handleCheckboxToggle('category2')" 
                      />
                      <span class="body-3 text-color">Category 2</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <Checkbox 
                        :value="filters.category3" 
                        :handle-check="() => handleCheckboxToggle('category3')" 
                      />
                      <span class="body-3 text-color">Category 3</span>
                    </div>
                  </div>
                </div>
                
                <!-- Price Range Slider -->
                <div class="mb-4">
                  <h4 class="body-2 text-color font-medium mb-2">Price Range ({{ filters.priceRange }}%)</h4>
                  <RangeSlider 
                    :percentage="filters.priceRange" 
                    @value-changed="handleSliderChange" 
                  />
                </div>
                
                <!-- Show archived toggle -->
                <div class="mb-4">
                  <div class="flex items-center justify-between">
                    <h4 class="body-2 text-color font-medium">Show archived</h4>
                    <SwitchInput 
                      :value="filters.showArchived" 
                      @switch-clicked="handleSwitchToggle" 
                    />
                  </div>
                </div>
                
                <!-- Sort Order -->
                <div class="mb-4">
                  <h4 class="body-2 text-color font-medium mb-2">Sort Order</h4>
                  <div class="flex gap-2">
                    <Button 
                      class="py-2 px-3" 
                      :class="filters.sortOrder === 'newest' ? 'contained-primary contained-text' : 'outlined-primary ghost-text'"
                      @button-clicked="filters.sortOrder = 'newest'"
                    >
                      Newest
                    </Button>
                    <Button 
                      class="py-2 px-3" 
                      :class="filters.sortOrder === 'oldest' ? 'contained-primary contained-text' : 'outlined-primary ghost-text'"
                      @button-clicked="filters.sortOrder = 'oldest'"
                    >
                      Oldest
                    </Button>
                  </div>
                </div>
              </div>
            </DropdownFilter>
          </Dropdown>
        </div>
        
        <div class="p-4 bg-surface-variant rounded">
          <p class="body-2 text-color">Advanced filter menu with input elements</p>
          <p class="body-3 text-color mt-2">
            This example demonstrates how various input elements can be integrated 
            into a dropdown filter menu, including text inputs, checkboxes, switches,
            sliders, and buttons.
          </p>
        </div>
      </div>
    </section>

    <!-- Dropdown with different positions -->
    <section class="mb-10">
      <h3 class="heading-2 text-color mb-4">Different positions</h3>
      <div class="p-4 border rounded dark:border-gray-600">
        <div class="flex justify-center items-center gap-6 mb-4 min-h-[200px]">
          <Dropdown position="top" trigger="click">
            <template #activator>
              <IconButton class="ic-btn-contained-primary p-2">
                <ArrowUpIcon class="w-5 h-5" />
              </IconButton>
            </template>
            <DropdownItem>Item 1</DropdownItem>
            <DropdownItem>Item 2</DropdownItem>
          </Dropdown>
          
          <Dropdown position="right" trigger="click">
            <template #activator>
              <IconButton class="ic-btn-contained-success p-2">
                <ArrowRightIcon class="w-5 h-5" />
              </IconButton>
            </template>
            <DropdownItem>Item 1</DropdownItem>
            <DropdownItem>Item 2</DropdownItem>
          </Dropdown>
          
          <Dropdown position="bottom" trigger="click">
            <template #activator>
              <IconButton class="ic-btn-contained-gray p-2">
                <ArrowDownIcon class="w-5 h-5" />
              </IconButton>
            </template>
            <DropdownItem>Item 1</DropdownItem>
            <DropdownItem>Item 2</DropdownItem>
          </Dropdown>
          
          <Dropdown position="left" trigger="click">
            <template #activator>
              <IconButton class="ic-btn-ghost-primary p-2">
                <ArrowLeftIcon class="w-5 h-5" />
              </IconButton>
            </template>
            <DropdownItem>Item 1</DropdownItem>
            <DropdownItem>Item 2</DropdownItem>
          </Dropdown>
        </div>
        
        <div class="p-4 bg-surface-variant rounded">
          <p class="body-2 text-color">Different positioning options</p>
          <p class="body-3 text-color mt-2">
            Dropdown menu can open in four different directions: top, right, bottom, and left.
          </p>
        </div>
      </div>
    </section>

    <!-- Dropdown with danger options -->
    <section class="mb-10">
      <h3 class="heading-2 text-color mb-4">Danger options</h3>
      <div class="p-4 border rounded dark:border-gray-600">
        <div class="flex gap-4 mb-4">
          <Dropdown position="bottom" trigger="click">
            <template #activator>
              <Button class="contained-danger contained-text">
                Actions
                <ChevronDownIcon class="w-4 h-4 ml-2" />
              </Button>
            </template>
            
            <DropdownItem>Edit item</DropdownItem>
            <DropdownItem>View details</DropdownItem>
            <DropdownItem danger>Delete item</DropdownItem>
          </Dropdown>
        </div>
        
        <div class="p-4 bg-surface-variant rounded">
          <p class="body-2 text-color">Dropdown with danger actions</p>
          <p class="body-3 text-color mt-2">
            Dangerous actions are highlighted in red to draw attention.
          </p>
        </div>
      </div>
    </section>
  </div>
</template>