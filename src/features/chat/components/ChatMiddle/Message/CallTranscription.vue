<script lang="ts" setup>
import { ref } from "vue";
import Button from "@src/ui/inputs/Button.vue";
import callService from "@src/shared/services/call-service";
import { useFormattedText } from "@src/shared/composables/useFormattedText";
import { useMdFormatting } from "@src/shared/composables/useMdFormatting";
import { ChevronDownIcon } from "@heroicons/vue/24/outline";
import CollapseTransition from "@src/ui/transitions/CollapseTransition.vue";

defineOptions({
  inheritAttrs: false,
});

const props = defineProps<{
  callId: number;
}>();

const isLoading = ref(false);

const summary = ref<string>("");
const formattedSummary = useMdFormatting(summary);
const unfoldedSummary = ref(false);

const transcription = ref<string>("");
const formattedTranscription = useFormattedText(transcription);
const unfoldedTranscription = ref(false);

const getTranscription = async () => {
  if (unfoldedSummary.value) {
    unfoldedSummary.value = false;
    return;
  }

  if (transcription.value) {
    unfoldedSummary.value = true;
    return;
  }

  try {
    isLoading.value = true;
    const res = await callService.getTranscription(props.callId);
    summary.value = res?.summary || "";
    transcription.value = res?.transcription || "";
  } catch (error) {
    console.error("Error fetching transcription:", error);
    transcription.value = "Транскрипція недоступна";
  } finally {
    isLoading.value = false;
    unfoldedSummary.value = true;
  }
};
</script>

<template>
  <div v-bind="$attrs">
    <!-- Summary Section -->
    <CollapseTransition>
      <div v-if="unfoldedSummary" class="w-full">
        <hr class="w-full my-4 border-app-border" />
        <div
          class="markdown-content text-[0.813rem] leading-relaxed"
          v-html="formattedSummary"
        ></div>

        <!-- Full Transcription Section -->
        <CollapseTransition>
          <div v-if="unfoldedTranscription" class="w-full mt-4">
            <hr class="w-full my-4 border-app-border" />
            <div class="text-app-text-secondary text-[0.813rem] mb-2">
              Повна транскрипція:
            </div>
            <div class="text-[0.813rem]" v-html="formattedTranscription"></div>
          </div>
        </CollapseTransition>

        <!-- Button to expand full transcription -->
        <Button
          size="sm"
          variant="text"
          block
          :ring="false"
          class="mt-2"
          @click="unfoldedTranscription = !unfoldedTranscription"
        >
          <ChevronDownIcon
            :class="[
              'w-5 h-5 inline-block mr-2 transition duration-150 ease-in-out',
              { 'rotate-180': unfoldedTranscription },
            ]"
          />
          {{
            unfoldedTranscription ? "Сховати повну розмову" : "Повна розмова"
          }}
        </Button>

        <hr class="w-full my-4 border-app-border" />
      </div>
    </CollapseTransition>

    <!-- Main button to show summary -->
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
          { 'rotate-180': unfoldedSummary },
        ]"
      />
      Транскрипція
    </Button>
  </div>
</template>
