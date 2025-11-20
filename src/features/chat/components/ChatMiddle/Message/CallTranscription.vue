<script lang="ts" setup>
import { ref } from "vue";
import Button from "@src/ui/inputs/Button.vue";
import callService from "@src/shared/services/call-service";
import { useFormattedText } from "@src/shared/composables/useFormattedText";
import { ChevronDownIcon } from "@heroicons/vue/24/outline";
import CollapseTransition from "@src/ui/transitions/CollapseTransition.vue";

const props = defineProps<{
  callId: number;
}>();

const isLoading = ref(false);
const transcription = ref<string>("");
const unfolded = ref(false);
const formattedText = useFormattedText(transcription);
const getTranscription = async () => {
  if (unfolded.value) {
    unfolded.value = false;
    return;
  }

  if (transcription.value) {
    unfolded.value = true;
    return;
  }

  try {
    isLoading.value = true;
    const res = await callService.getTranscription(props.callId);
    transcription.value = res?.transcription || "";
  } catch (error) {
    console.error("Error fetching transcription:", error);
    transcription.value = "Транскрипція недоступна";
  } finally {
    isLoading.value = false;
    unfolded.value = true;
  }
};
</script>

<template>
  <!-- add transition fold/unfold -->
  <CollapseTransition>
    <div v-if="unfolded" class="w-full">
      <hr class="w-full my-4 border-app-border" />
      <div class="text-app-text-secondary text-[0.813rem]">Резюме розмови:</div>
      <div class="text-[0.813rem]" v-html="formattedText"></div>
    </div>
  </CollapseTransition>
  <Button
    size="sm"
    variant="text"
    block
    :loading="isLoading"
    :ring="false"
    @click="getTranscription"
  >
    <ChevronDownIcon
      :class="[
        'w-5 h-5 inline-block mr-2 transition duration-150 ease-in-out',
        { 'rotate-180': unfolded },
      ]"
    />
    Транскрипція
  </Button>
</template>
