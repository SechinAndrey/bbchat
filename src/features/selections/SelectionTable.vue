<script setup lang="ts">
import { ref } from "vue";
import type { ApiSelectionItem } from "@src/api/types";
import Checkbox from "@src/ui/inputs/Checkbox.vue";
import { LightBulbIcon, PhotoIcon } from "@heroicons/vue/24/outline";

const props = defineProps<{
  selectionItems: ApiSelectionItem[] | null;
}>();

const allSelected = ref(false);
const selectedBoardIds = ref<number[]>([]);

const allSelectedChanged = () => {
  if (allSelected.value) {
    selectedBoardIds.value = props.selectionItems?.map((item) => item.id) || [];
  } else {
    selectedBoardIds.value = [];
  }
};
</script>

<template>
  <div class="selection-table h-[100vh] overflow-hidden text-[0.813rem]">
    <!-- PC table with horizontal scroll -->
    <div
      class="h-[calc(100%-57px)] overflow-auto scrollbar-thin hidden md:block"
    >
      <div class="overflow-x-auto bg-theme-bg rounded-lg shadow-shadow">
        <table class="w-full min-w-[1200px]">
          <!-- Table Header -->
          <thead
            class="bg-theme-table-bg border-b border-theme-surface-variant"
          >
            <tr>
              <th class="w-[1%] pl-[1.25rem] py-[0.625rem] pr-3">
                <Checkbox
                  v-model="allSelected"
                  size="[1.25rem]"
                  @update:model-value="allSelectedChanged"
                />
              </th>
              <th
                class="w-[1%] py-[0.625rem] px-3 text-left font-medium text-text-primary"
              >
                ID
              </th>
              <th
                class="w-[3.52%] py-[0.625rem] px-3 text-left font-medium text-text-primary"
              >
                Місто
              </th>
              <th
                class="w-[8.52%] py-[0.625rem] px-3 text-left font-medium text-text-primary"
              >
                Фірма Код
              </th>
              <th
                class="w-[8.52%] py-[0.625rem] px-3 text-left font-medium text-text-primary"
              >
                Тип
              </th>
              <th
                class="w-[13.52%] py-[0.625rem] px-3 text-left font-medium text-text-primary"
              >
                Адреса
              </th>
              <th
                class="w-[1%] py-[0.625rem] px-3 text-left font-medium text-text-primary"
              >
                Сторона
              </th>
              <th
                class="w-[1%] py-[0.625rem] px-3 text-left font-medium text-text-primary"
              >
                Підсвітка
              </th>
              <th
                class="w-[8.52%] py-[0.625rem] px-3 text-left font-medium text-text-primary"
              >
                Дата оновлення
              </th>
              <th
                class="w-[1%] py-[0.625rem] px-3 text-left font-medium text-text-primary"
              >
                Фото
              </th>
              <th
                class="w-[8.52%] py-[0.625rem] px-3 text-left font-medium text-text-primary"
              >
                Зайнятість
              </th>
              <th
                class="w-[8.52%] py-[0.625rem] px-3 text-left font-medium text-text-primary"
              >
                Ціна системі
              </th>
              <th
                class="w-[8.52%] py-[0.625rem] px-3 text-left font-medium text-text-primary"
              >
                Ціна купівлі (без ПДВ)
              </th>
              <th
                class="w-[8.52%] py-[0.625rem] px-3 text-left font-medium text-text-primary"
              >
                Ціна продажу (без ПДВ)
              </th>
              <th
                class="w-[8.52%] py-[0.625rem] px-3 text-left font-medium text-text-primary"
              >
                Ціна друку
              </th>
              <th
                class="w-[8.52%] pl-3 py-[0.625rem] pr-[1.25rem] text-left font-medium text-text-primary"
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
              class="border-b border-theme-surface-variant bg-theme-table-bg hover:bg-theme-table-hover transition-colors"
            >
              <td class="pl-[1.25rem] py-[0.625rem] pr-3">
                <Checkbox
                  v-model="selectedBoardIds"
                  :value="item.id"
                  size="[1.25rem]"
                />
              </td>
              <td class="py-[0.625rem] px-3 text-text-primary">
                {{ item.id }}
              </td>
              <td class="py-[0.625rem] px-3 text-text-primary">
                {{ item.city_name }}
              </td>
              <td class="py-[0.625rem] px-3 text-text-primary">
                <div>{{ item.firm_name }}</div>
                <div class="text-xs text-text-secondary">{{ item.code }}</div>
              </td>
              <td class="py-[0.625rem] px-3 text-text-primary">
                {{ item.title }}
              </td>
              <td class="py-[0.625rem] px-3 text-text-primary">
                {{ item.addr }}
              </td>
              <td class="py-[0.625rem] px-3 text-text-primary text-center">
                <span
                  class="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium"
                  :class="
                    item.side_type === 'В'
                      ? 'bg-success text-white'
                      : 'bg-neutral text-text-primary'
                  "
                >
                  {{ item.side_type }}
                </span>
              </td>
              <td class="py-[0.625rem] px-3 text-text-primary text-center">
                <span
                  class="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium"
                >
                  <LightBulbIcon
                    :class="
                      item.light
                        ? 'text-green-500'
                        : 'text-gray-300 dark:text-gray-700'
                    "
                  />
                </span>
              </td>
              <td class="py-[0.625rem] px-3 text-text-primary">
                {{ item.updated_at }}
              </td>
              <td class="py-[0.625rem] px-3">
                <button
                  v-if="item.image"
                  class="w-8 h-8 ic-btn ic-btn-ghost-gray flex items-center justify-center"
                >
                  <PhotoIcon class="w-6 h-6 text-text-primary" />
                </button>
                <span v-else class="text-text-secondary">—</span>
              </td>
              <td class="py-[0.625rem] px-3">
                <div class="w-16 h-2 bg-neutral rounded-full overflow-hidden">
                  <div
                    class="h-full bg-success rounded-full"
                    style="width: 100%"
                  ></div>
                </div>
              </td>
              <td class="py-[0.625rem] px-3 text-text-primary">
                {{ item.price }} ₴
              </td>
              <td class="py-[0.625rem] px-3 text-text-primary">
                {{ item.buying_price }} ₴
              </td>
              <td class="py-[0.625rem] px-3 text-text-primary">
                {{ item.selling_price }} ₴
              </td>
              <td class="py-[0.625rem] px-3 text-text-primary">
                {{ item.printing_price }} ₴
              </td>
              <td class="pl-3 py-[0.625rem] pr-[1.25rem] text-right">
                <div
                  v-if="item.isWatched"
                  class="bg-secondary px-4 py-2 rounded"
                >
                  <span class="text-secondary-active">
                    Площина під наглядом
                  </span>
                </div>
                <div v-else class="bg-secondary px-4 py-2 rounded-sm">
                  <span class="text-secondary-active">
                    Площина не під наглядом
                  </span>
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
      <div
        v-for="item in props.selectionItems"
        :key="item.id"
        class="bg-theme-bg shadow-shadow border border-theme-surface-variant overflow-hidden"
      >
        <div class="p-4 flex items-center justify-between">
          <div>ID</div>
          <div>{{ item.id }}</div>
        </div>
        <div class="p-4 flex items-center justify-between">
          <div>Місто</div>
          <div>{{ item.city_name }}</div>
        </div>
        <div class="p-4 flex items-center justify-between">
          <div>Фірма Код</div>
          <div>{{ item.firm_name }} ({{ item.code }})</div>
        </div>
        <div class="p-4 flex items-center justify-between">
          <div>Тип</div>
          <div>{{ item.type }}</div>
        </div>
        <div class="p-4 flex items-center justify-between">
          <div>Адреса</div>
          <div>{{ item.addr }}</div>
        </div>
        <div class="p-4 flex items-center justify-between">
          <div>Сторона</div>
          <div>{{ item.side_type }}</div>
        </div>
        <div class="p-4 flex items-center justify-between">
          <div>Підсвітка</div>
          <div>{{ item.light ? "🔆" : "—" }}</div>
        </div>

        <div class="p-4 flex items-center justify-between">
          <div>Дата оновлення</div>
          <div>{{ item.updated_at }}</div>
        </div>

        <div class="p-4 flex items-center justify-between">
          <div>Фото</div>
          <div v-if="item.image">📷</div>
          <div v-else>—</div>
        </div>

        <div class="p-4 flex items-center justify-between">
          <div>Зайнятість</div>
          <div class="w-16 h-2 bg-neutral rounded-full overflow-hidden">
            <div
              class="h-full bg-success rounded-full"
              style="width: 100%"
            ></div>
          </div>
        </div>

        <div class="p-4 flex items-center justify-between">
          <div>Ціна системі</div>
          <div>{{ item.price }} ₴</div>
        </div>

        <div class="p-4 flex items-center justify-between">
          <div>Ціна купівлі (без ПДВ)</div>
          <div>{{ item.buying_price }} ₴</div>
        </div>

        <div class="p-4 flex items-center justify-between">
          <div>Ціна продажу (без ПДВ)</div>
          <div>{{ item.selling_price }} ₴</div>
        </div>

        <div class="p-4 flex items-center justify-between">
          <div>Ціна друку</div>
          <div>{{ item.printing_price }} ₴</div>
        </div>

        <div class="p-4 flex items-center justify-between">
          <div>Ціна друку</div>
          <div>{{ item.printing_price }} ₴</div>
        </div>

        <div class="p-4 flex items-center justify-between">
          <div>Сповіщення</div>
          <div class="text-warning">
            {{ item.isWatched ? "⭐" : "Площина не під наглядом" }}
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
