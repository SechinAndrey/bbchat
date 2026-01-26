/**
 * Copy text to clipboard with fallback for iframe and insecure contexts
 * @param text - Text to copy to clipboard
 * @returns Promise that resolves when text is copied
 * @throws Error if copying fails
 */
export async function copyToClipboard(text: string): Promise<void> {
  // Try modern clipboard API first
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch (error) {
      console.warn("Clipboard API failed, using fallback method:", error);
    }
  }

  // Fallback method using textarea and execCommand
  // This works in iframe and when Clipboard API is blocked
  const textArea = document.createElement("textarea");
  textArea.value = text;

  textArea.style.position = "fixed";
  textArea.style.left = "-999999px";
  textArea.style.top = "-999999px";
  textArea.style.opacity = "0";
  textArea.setAttribute("readonly", "");

  document.body.appendChild(textArea);

  try {
    // Focus and select text
    textArea.focus();
    textArea.select();
    textArea.setSelectionRange(0, text.length);

    const successful = document.execCommand("copy");
    if (!successful) {
      throw new Error("Copy command failed");
    }
  } finally {
    document.body.removeChild(textArea);
  }
}
