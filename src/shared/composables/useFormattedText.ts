import { Ref, computed } from "vue";

export function useFormattedText(rawText: Ref<string>) {
  return computed(() => {
    return rawText.value
      .replace(/\n/g, "<br>")
      .replace(/\*\*(.*?)\*\*/g, "<b>$1</b>");
  });
}
