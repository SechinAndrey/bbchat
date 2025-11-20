import { Ref, computed } from "vue";
import { marked } from "marked";

export function useMdFormatting(rawText: Ref<string>) {
  return computed(() => {
    if (!rawText.value) return "";

    try {
      marked.setOptions({
        breaks: true,
        gfm: true,
      });

      return marked.parse(rawText.value);
    } catch (error) {
      console.error("Error parsing markdown:", error);
      return rawText.value.replace(/\n/g, "<br>");
    }
  });
}
