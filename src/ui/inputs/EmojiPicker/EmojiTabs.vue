<script setup lang="ts">
import IconButton from "@src/ui/inputs/IconButton.vue";
import {
  FaceSmileIcon,
  FireIcon,
  CakeIcon,
  FlagIcon,
  RocketLaunchIcon,
  GlobeAsiaAustraliaIcon,
  LightBulbIcon,
} from "@heroicons/vue/24/outline";

const props = defineProps<{
  active: string;
}>();

// Используем классы, основанные на переменных темы вместо хардкодных цветов
const activeClasses = {
  border: "border-primary",
  text: "text-primary",
};

const inactiveClasses = {
  border: "border-transparent",
  text: "text-app-text",
};
</script>

<template>
  <div class="flex justify-between">
    <!--people-->
    <div
      class="pb-[.3125rem] border-b transition-colors duration-200"
      :class="[
        props.active === 'people'
          ? activeClasses.border
          : inactiveClasses.border,
      ]"
    >
      <IconButton
        title="people and smiles"
        aria-label="people and smiles"
        @click="$emit('tab-change', 'people')"
      >
        <FaceSmileIcon
          class="w-5 h-5 transition-colors duration-200"
          :class="[
            props.active === 'people'
              ? activeClasses.text
              : inactiveClasses.text,
          ]"
        />
      </IconButton>
    </div>

    <!--nature-->
    <div
      class="pb-[.3125rem] border-b transition-colors duration-200"
      :class="[
        props.active === 'nature'
          ? activeClasses.border
          : inactiveClasses.border,
      ]"
    >
      <IconButton
        title="nature"
        aria-label="nature"
        @click="$emit('tab-change', 'nature')"
      >
        <FireIcon
          class="w-5 h-5 transition-colors duration-200"
          :class="[
            props.active === 'nature'
              ? activeClasses.text
              : inactiveClasses.text,
          ]"
        />
      </IconButton>
    </div>

    <!--food-->
    <div
      class="pb-[.3125rem] border-b transition-colors duration-200"
      :class="[
        props.active === 'food' ? activeClasses.border : inactiveClasses.border,
      ]"
    >
      <IconButton
        title="food"
        aria-label="food"
        @click="$emit('tab-change', 'food')"
      >
        <CakeIcon
          class="w-5 h-5 transition-colors duration-200"
          :class="[
            props.active === 'food' ? activeClasses.text : inactiveClasses.text,
          ]"
        />
      </IconButton>
    </div>

    <!--activity-->
    <div
      class="pb-[.3125rem] border-b transition-colors duration-200"
      :class="[
        props.active === 'activity'
          ? activeClasses.border
          : inactiveClasses.border,
      ]"
    >
      <IconButton
        title="activities and sports"
        aria-label="activities and sports"
        @click="$emit('tab-change', 'activity')"
      >
        <RocketLaunchIcon
          class="w-5 h-5 transition-colors duration-200"
          :class="[
            props.active === 'activity'
              ? activeClasses.text
              : inactiveClasses.text,
          ]"
        />
      </IconButton>
    </div>

    <!--objects-->
    <div
      class="pb-[.3125rem] border-b transition-colors duration-200"
      :class="[
        props.active === 'objects'
          ? activeClasses.border
          : inactiveClasses.border,
      ]"
    >
      <IconButton @click="$emit('tab-change', 'objects')">
        <LightBulbIcon
          class="w-5 h-5 transition-colors duration-200"
          :class="[
            props.active === 'objects'
              ? activeClasses.text
              : inactiveClasses.text,
          ]"
        />
      </IconButton>
    </div>

    <!--travel-->
    <div
      class="pb-[.3125rem] border-b transition-colors duration-200"
      :class="[
        props.active === 'travel'
          ? activeClasses.border
          : inactiveClasses.border,
      ]"
    >
      <IconButton
        title="travel"
        aria-label="travel"
        @click="$emit('tab-change', 'travel')"
      >
        <GlobeAsiaAustraliaIcon
          class="w-5 h-5 transition-colors duration-200"
          :class="[
            props.active === 'travel'
              ? activeClasses.text
              : inactiveClasses.text,
          ]"
        />
      </IconButton>
    </div>

    <!--flags-->
    <div
      class="pb-[.3125rem] border-b transition-colors duration-200"
      :class="[
        props.active === 'flags'
          ? activeClasses.border
          : inactiveClasses.border,
      ]"
    >
      <IconButton
        title="flags"
        aria-label="flags"
        @click="$emit('tab-change', 'flags')"
      >
        <FlagIcon
          class="w-5 h-5 transition-colors duration-200"
          :class="[
            props.active === 'flags'
              ? activeClasses.text
              : inactiveClasses.text,
          ]"
        />
      </IconButton>
    </div>
  </div>
</template>
