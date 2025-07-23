<script lang="ts" setup>
import { ref } from "vue";
import Button from "@src/ui/inputs/Button.vue";
import callService from "@src/shared/services/call-service";

const props = defineProps<{
  callId: number;
}>();

const isLoading = ref(false);
const transcription = ref<string | undefined>(undefined);

const getTranscription = async () => {
  try {
    isLoading.value = true;
    const res = await callService.getTranscription(props.callId);
    transcription.value = res.transcription;
  } catch (error) {
    console.error("Error fetching transcription:", error);
    transcription.value = "Транскрипція недоступна";
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <Button
    v-if="!transcription"
    class="btn-text-primary"
    size="small"
    :loading="isLoading"
    @click="getTranscription"
    >Транскрипція</Button
  >
  <div v-if="transcription">{{ transcription }}</div>
</template>
