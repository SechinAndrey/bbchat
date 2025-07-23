<script lang="ts" setup>
import { ref } from "vue";
import Button from "@src/ui/inputs/Button.vue";
import callService from "@src/shared/services/call-service";
import AudioPlayer from "@src/ui/components/AudioPlayer.vue";

const props = defineProps({
  binotelId: {
    type: Number,
    required: true,
  },
});

const callAudio = ref("");
const isLoading = ref(false);

async function getAudio() {
  isLoading.value = true;
  const res = await callService.getAudio(props.binotelId);
  if (!res.url) return;
  callAudio.value = res.url;
  isLoading.value = false;
}
</script>

<template>
  <div class="flex flex-col mb-4">
    <AudioPlayer v-if="callAudio" :src="callAudio" />
    <Button
      v-else
      class="contained-primary contained-text m-2"
      size="small"
      :loading="isLoading"
      @click="getAudio"
    >
      Отримати аудіо дзвінка
    </Button>
  </div>
</template>
