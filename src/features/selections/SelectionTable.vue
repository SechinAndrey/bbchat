<script setup lang="ts">
import { ref, computed } from "vue";
import type { ApiSelectionItem } from "@src/api/types";
import Checkbox from "@src/ui/inputs/Checkbox.vue";
import { LightBulbIcon, PhotoIcon } from "@heroicons/vue/24/outline";
import { formatDate } from "@src/shared/utils/utils";
import SimpleMediaModal from "@src/ui/data-display/SimpleMediaModal.vue";
import CurrencyInput from "@src/ui/inputs/CurrencyInput.vue";
import apiClient from "@src/api/axios-instance";
import Button from "@src/ui/inputs/Button.vue";
import BoardAvailability from "@src/features/selections/BoardAvailability.vue";
import BoardAvailabilityFull from "@src/features/selections/BoardAvailabilityFull.vue";

import VuePopper from "@kalimahapps/vue-popper";

const model = defineModel<number[]>();

const selectedSelectionItemIds = computed(() => {
  if (!model.value || !props.selectionItems) return [];
  return props.selectionItems
    .filter((item) => model.value!.includes(item.id))
    .map((item) => item.selection_item_id);
});

defineExpose({
  selectedSelectionItemIds,
});

const props = defineProps<{
  selectionItems: ApiSelectionItem[] | null;
  selectionId: number | null;
}>();

const allSelected = ref(false);

const allSelectedChanged = () => {
  if (allSelected.value) {
    model.value = props.selectionItems?.map((item) => item.id) || [];
  } else {
    model.value = [];
  }
};

const dateWithTime = (date?: string): string => {
  if (!date) return "";
  return formatDate(date, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const watchedDate = (date?: string | null): string => {
  if (!date) return "";
  const [year, month] = date.split("-");
  return `${month}.${year}`;
};

const itemForGallery = ref<ApiSelectionItem | null>(null);
const isImagesModalOpen = ref(false);

const openImagesModal = (item: ApiSelectionItem) => {
  itemForGallery.value = item;
  isImagesModalOpen.value = true;
};

const closeImagesModal = () => {
  isImagesModalOpen.value = false;
  itemForGallery.value = null;
};

const imgs = (): string[] => {
  const imgs = [];
  if (itemForGallery.value?.image)
    imgs.push(
      import.meta.env.VITE_MEDIA_URL + "/" + itemForGallery.value.image,
    );
  if (itemForGallery.value?.scheme)
    imgs.push(
      import.meta.env.VITE_MEDIA_URL + "/" + itemForGallery.value.scheme,
    );
  return imgs;
};

const changePrice = async (
  boardId: number,
  newPrice: number | null,
  priceType: "selling_price" | "buying_price" | "printing_price",
) => {
  try {
    await apiClient.patch(`/selections/${props.selectionId}/board/${boardId}`, {
      type: priceType,
      value: newPrice,
    });
  } catch (error) {
    console.error("Error changing price:", error);
  }
};

const toggleSelection = (itemId: number) => {
  if (!model.value) {
    model.value = [itemId];
    return;
  }

  const index = model.value.indexOf(itemId);
  if (index > -1) {
    model.value = model.value.filter((id) => id !== itemId);
  } else {
    model.value = [...model.value, itemId];
  }
};
</script>

<template>
  <div class="selection-table h-[100vh] overflow-hidden text-[0.813rem]">
    <SimpleMediaModal
      :open="isImagesModalOpen"
      :image-urls="imgs()"
      @close="closeImagesModal"
    />
    <!-- PC table with horizontal scroll -->
    <div
      class="h-[calc(100%-131px)] overflow-auto scrollbar-thin hidden md:block"
    >
      <div class="overflow-x-auto rounded-lg shadow-shadow">
        <table class="w-full min-w-[1200px]">
          <!-- Table Header -->
          <thead class="bg-theme-table-bg border-b border-app-border">
            <tr>
              <th class="w-[1%] pl-[1.25rem] py-[0.625rem] pr-3">
                <Checkbox
                  v-model="allSelected"
                  size="[1.25rem]"
                  @update:model-value="allSelectedChanged"
                />
              </th>
              <th class="w-[1%] py-[0.625rem] px-3 text-left font-medium">
                ID
              </th>
              <th class="w-[3.52%] py-[0.625rem] px-3 text-left font-medium">
                Місто
              </th>
              <th class="w-[8.52%] py-[0.625rem] px-3 text-left font-medium">
                Фірма Код
              </th>
              <th class="w-[8.52%] py-[0.625rem] px-3 text-left font-medium">
                Тип
              </th>
              <th class="w-[13.52%] py-[0.625rem] px-3 text-left font-medium">
                Адреса
              </th>
              <th class="w-[1%] py-[0.625rem] px-3 text-left font-medium">
                Сторона
              </th>
              <th class="w-[1%] py-[0.625rem] px-3 text-left font-medium">
                Підсвітка
              </th>
              <th class="w-[8.52%] py-[0.625rem] px-3 text-left font-medium">
                Дата оновлення
              </th>
              <th class="w-[1%] py-[0.625rem] px-3 text-left font-medium">
                Фото
              </th>
              <th class="w-[8.52%] py-[0.625rem] px-3 text-left font-medium">
                Зайнятість
              </th>
              <th class="w-[8.52%] py-[0.625rem] px-3 text-left font-medium">
                Ціна системі
              </th>
              <th class="w-[8.52%] py-[0.625rem] px-3 text-left font-medium">
                Ціна купівлі (без ПДВ)
              </th>
              <th class="w-[8.52%] py-[0.625rem] px-3 text-left font-medium">
                Ціна продажу (без ПДВ)
              </th>
              <th class="w-[8.52%] py-[0.625rem] px-3 text-left font-medium">
                Ціна друку
              </th>
              <th
                class="w-[8.52%] pl-3 py-[0.625rem] pr-[1.25rem] text-left font-medium"
              >
                Сповіщення
              </th>
            </tr>
          </thead>
          <!-- Table Body -->
          <tbody v-if="props.selectionItems?.length">
            <tr
              v-for="item in props.selectionItems"
              :key="item.id"
              class="border-b border-app-border hover:bg-app-bg-secondary-lighter transition-colors cursor-pointer"
              @click="toggleSelection(item.id)"
            >
              <td class="pl-[1.25rem] py-[0.625rem] pr-3" @click.stop>
                <Checkbox v-model="model" :value="item.id" size="[1.25rem]" />
              </td>
              <td class="py-[0.625rem] px-3">
                {{ item.id }}
              </td>
              <td class="py-[0.625rem] px-3">
                {{ item.city_name }}
              </td>
              <td class="py-[0.625rem] px-3">
                <div>{{ item.firm_name }}</div>
                <div class="text-xs text-app-text-secondary">
                  {{ item.code }}
                </div>
              </td>
              <td class="py-[0.625rem] px-3">
                {{ item.title }}
              </td>
              <td class="py-[0.625rem] px-3">
                {{ item.addr }}
              </td>
              <td class="py-[0.625rem] px-3 text-center">
                <span
                  class="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium"
                >
                  {{ item.side_type }}
                </span>
              </td>
              <td class="py-[0.625rem] px-3 text-center">
                <span
                  class="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium"
                >
                  <LightBulbIcon
                    :class="
                      item.light ? 'text-success' : 'text-app-text-secondary'
                    "
                  />
                </span>
              </td>
              <td class="py-[0.625rem] px-3">
                {{ dateWithTime(item.updated_at) }}
              </td>
              <td class="py-[0.625rem] px-3" @click.stop>
                <Button
                  v-if="item.image"
                  variant="ghost"
                  icon-only
                  @click="openImagesModal(item)"
                >
                  <template #icon>
                    <PhotoIcon class="w-6 h-6" />
                  </template>
                </Button>
                <span v-else class="text-app-text-secondary">—</span>
              </td>
              <td class="py-[0.625rem] px-3" @click.stop>
                <VuePopper hover placement="top" class="w-full">
                  <template #default>
                    <BoardAvailability :schedule="item.reserve_data" />
                  </template>

                  <template #content>
                    <div class="p-4">
                      <BoardAvailabilityFull
                        class="w-full"
                        :schedule="item.reserve_data"
                      />
                    </div>
                  </template>
                </VuePopper>
              </td>
              <td class="py-[0.625rem] px-3">{{ item.price }} ₴</td>
              <td class="py-[0.625rem] px-3" @click.stop>
                <CurrencyInput
                  v-model="item.buying_price"
                  class="mt-4"
                  @change="
                    changePrice(item.id, item.buying_price, 'buying_price')
                  "
                />
              </td>
              <td class="py-[0.625rem] px-2" @click.stop>
                <CurrencyInput
                  v-model="item.selling_price"
                  class="mt-4"
                  @change="
                    changePrice(item.id, item.selling_price, 'selling_price')
                  "
                />
              </td>
              <td class="py-[0.625rem] px-2" @click.stop>
                <CurrencyInput
                  v-model="item.printing_price"
                  class="mt-4"
                  @change="
                    changePrice(item.id, item.printing_price, 'printing_price')
                  "
                />
              </td>
              <td class="pl-3 py-[0.625rem] pr-[1.25rem] text-right">
                <div v-if="item.isWatched" class="px-4 py-2 whitespace-nowrap">
                  <span>
                    {{ watchedDate(item.watchedFrom) }}
                  </span>
                  -
                  <span>
                    {{ watchedDate(item.watchedTo) }}
                  </span>
                </div>
                <div v-else class="bg-secondary-lighter px-4 py-2 rounded-sm">
                  <span class="text-secondary"> Площина не під наглядом </span>
                </div>
              </td>
            </tr>
          </tbody>
          <!-- Empty State -->
          <tbody v-else>
            <tr>
              <td colspan="16" class="p-8 text-center text-text-secondary">
                Немає даних для відображення
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Mobile view(cards) -->
    <div
      class="h-[calc(100%-113px)] overflow-auto scrollbar-thin md:hidden space-y-4 pb-3"
    >
      <!-- Mobile Select All -->
      <div
        class="bg-app-bg border border-app-border p-4 mb-4 cursor-pointer active:bg-app-bg-secondary transition-colors"
        @click="
          allSelected = !allSelected;
          allSelectedChanged();
        "
      >
        <div class="flex items-center justify-between">
          <span class="font-medium">Вибрати всі</span>
          <Checkbox
            v-model="allSelected"
            size="[1.25rem]"
            @click.stop
            @update:model-value="allSelectedChanged"
          />
        </div>
      </div>

      <div
        v-for="item in props.selectionItems"
        :key="item.id"
        class="bg-app-bg border border-app-border overflow-hidden"
      >
        <!-- Selection Checkbox Header -->
        <div
          class="p-4 border-b border-app-border bg-app-bg-secondary flex items-center justify-between cursor-pointer active:bg-app-bg-secondary-lighter transition-colors"
          @click="toggleSelection(item.id)"
        >
          <span class="font-medium text-app-text">ID: {{ item.id }}</span>
          <Checkbox
            v-model="model"
            :value="item.id"
            size="[1.25rem]"
            @click.stop
          />
        </div>

        <!-- Card Content -->
        <div class="divide-y divide-app-border">
          <div class="p-4 flex items-center justify-between">
            <div class="text-app-text-secondary font-medium">Місто</div>
            <div class="text-app-text">{{ item.city_name }}</div>
          </div>

          <div class="p-4 flex items-center justify-between">
            <div class="text-app-text-secondary font-medium">Фірма Код</div>
            <div class="text-app-text text-right">
              <div>{{ item.firm_name }}</div>
              <div class="text-xs text-app-text-secondary">{{ item.code }}</div>
            </div>
          </div>

          <div class="p-4 flex items-center justify-between">
            <div class="text-app-text-secondary font-medium">Тип</div>
            <div class="text-app-text">{{ item.title }}</div>
          </div>

          <div class="p-4 flex items-start justify-between">
            <div class="text-app-text-secondary font-medium">Адреса</div>
            <div class="text-app-text text-right max-w-[60%]">
              {{ item.addr }}
            </div>
          </div>

          <div class="p-4 flex items-center justify-between">
            <div class="text-app-text-secondary font-medium">Сторона</div>
            <div class="text-app-text">
              <span
                class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-app-bg-secondary text-sm font-medium"
              >
                {{ item.side_type }}
              </span>
            </div>
          </div>

          <div class="p-4 flex items-center justify-between">
            <div class="text-app-text-secondary font-medium">Підсвітка</div>
            <div class="text-app-text">
              <LightBulbIcon
                class="w-6 h-6"
                :class="
                  item.light
                    ? 'text-green-500'
                    : 'text-gray-300 dark:text-gray-700'
                "
              />
            </div>
          </div>

          <div class="p-4 flex items-center justify-between">
            <div class="text-app-text-secondary font-medium">
              Дата оновлення
            </div>
            <div class="text-app-text text-right text-sm">
              {{ dateWithTime(item.updated_at) }}
            </div>
          </div>

          <div class="p-4 flex items-center justify-between">
            <div class="text-app-text-secondary font-medium">Фото</div>
            <div>
              <Button
                v-if="item.image"
                variant="ghost"
                icon-only
                size="sm"
                @click="openImagesModal(item)"
              >
                <template #icon>
                  <PhotoIcon class="w-5 h-5" />
                </template>
              </Button>
              <span v-else class="text-app-text-secondary">—</span>
            </div>
          </div>

          <div class="p-4">
            <div class="flex items-center justify-between mb-2">
              <div class="text-app-text-secondary font-medium">Зайнятість</div>
            </div>
            <BoardAvailability :schedule="item.reserve_data" />
          </div>

          <div class="p-4 flex items-center justify-between">
            <div class="text-app-text-secondary font-medium">Ціна системі</div>
            <div class="text-app-text font-medium">{{ item.price }} ₴</div>
          </div>

          <div class="p-4">
            <div class="flex items-center justify-between mb-2">
              <div class="text-app-text-secondary font-medium">
                Ціна купівлі (без ПДВ)
              </div>
            </div>
            <CurrencyInput
              v-model="item.buying_price"
              size="sm"
              block
              class="mt-4"
              @change="changePrice(item.id, item.buying_price, 'buying_price')"
            />
          </div>

          <div class="p-4">
            <div class="flex items-center justify-between mb-2">
              <div class="text-app-text-secondary font-medium">
                Ціна продажу (без ПДВ)
              </div>
            </div>
            <CurrencyInput
              v-model="item.selling_price"
              size="sm"
              block
              class="mt-4"
              @change="
                changePrice(item.id, item.selling_price, 'selling_price')
              "
            />
          </div>

          <div class="p-4">
            <div class="flex items-center justify-between mb-2">
              <div class="text-app-text-secondary font-medium">Ціна друку</div>
            </div>
            <CurrencyInput
              v-model="item.printing_price"
              size="sm"
              block
              class="mt-4"
              @change="
                changePrice(item.id, item.printing_price, 'printing_price')
              "
            />
          </div>

          <div class="p-4 flex items-start justify-between">
            <div class="text-app-text-secondary font-medium">Сповіщення</div>
            <div class="text-right">
              <div v-if="item.isWatched" class="text-app-text">
                <span class="text-sm">
                  {{ watchedDate(item.watchedFrom) }}
                </span>
                <span class="text-app-text-secondary mx-1">-</span>
                <span class="text-sm">
                  {{ watchedDate(item.watchedTo) }}
                </span>
              </div>
              <div v-else class="bg-app-bg-secondary px-3 py-2 rounded text-sm">
                <span class="text-app-text-secondary"
                  >Площина не під наглядом</span
                >
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile Empty State -->
    <div v-if="!props.selectionItems?.length" class="text-center py-8">
      <p class="text-text-secondary">Немає даних для відображення</p>
    </div>
  </div>
</template>

<style>
.selection-table th,
.selection-table td {
  text-align: left;
}

.selection-table td.text-center {
  text-align: center;
}
</style>
