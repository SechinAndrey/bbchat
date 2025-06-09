<script setup lang="ts">
import { ref } from "vue";
import FadeTransition from "@src/ui/transitions/FadeTransition.vue";
import useStore from "@src/shared/store/store";

const store = useStore();
const select = ref(false);

// Используем CSS-переменные для цветов тонов кожи
// Это специфические цвета, которые не должны меняться с темой
const skinToneColor: any = {
  "1f3ff": "skin-tone-dark",
  "1f3fe": "skin-tone-medium-dark",
  "1f3fd": "skin-tone-medium",
  "1f3fc": "skin-tone-medium-light",
  neutral: "skin-tone-light",
};

// (event) change the skin tone of the emojis
const handleChangeSkinTone = (tone: string) => {
  select.value = false;
  store.emojiSkinTone = tone;
};
</script>

<template>
  <div class="w-full h-[1.25rem] flex justify-between items-center">
    <!--list of tones-->
    <div>
      <FadeTransition>
        <div v-if="select" class="h-5 max-h-fit">
          <button
            class="w-6 h-5 skin-tone-dark hover:scale-110 duration-200 ease-in"
            @click="handleChangeSkinTone('1f3ff')"
          ></button>
          <button
            class="w-6 h-5 skin-tone-medium-dark hover:scale-110 duration-200 ease-in"
            @click="handleChangeSkinTone('1f3fe')"
          ></button>
          <button
            class="w-6 h-5 skin-tone-medium hover:scale-110 duration-200 ease-in"
            @click="handleChangeSkinTone('1f3fd')"
          ></button>
          <button
            class="w-6 h-5 skin-tone-medium-light hover:scale-110 duration-200 ease-in"
            @click="handleChangeSkinTone('1f3fc')"
          ></button>
          <button
            class="w-6 h-5 skin-tone-light hover:scale-110 duration-200 ease-in"
            @click="handleChangeSkinTone('neutral')"
          ></button>
        </div>
      </FadeTransition>
    </div>

    <!--active tone-->
    <div class="flex items-center">
      <p class="body-2 text-color">Skin tone:</p>
      <button
        @click="select = !select"
        class="w-5 h-5 ml-3 rounded-full hover:scale-110 duration-200 ease-in"
        :class="[skinToneColor[store.emojiSkinTone]]"
      ></button>
    </div>
  </div>
</template>

<style scoped>
.skin-tone-dark {
  background-color: #60463a;
}
.skin-tone-medium-dark {
  background-color: #a86637;
}
.skin-tone-medium {
  background-color: #c88e62;
}
.skin-tone-medium-light {
  background-color: #ffdfbd;
}
.skin-tone-light {
  background-color: #ffd225;
}
</style>
