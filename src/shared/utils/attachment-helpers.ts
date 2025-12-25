import type { IAttachment } from "@src/shared/types/types";
import { formatFileSize, getFileType } from "@src/shared/utils";

export function createAttachmentFromFile(file: File): IAttachment {
  return {
    id: Date.now() + Math.random(),
    type: getFileType(file),
    name: file.name,
    size: formatFileSize(file.size),
    url: URL.createObjectURL(file),
    thumbnail: file.type.startsWith("image/")
      ? URL.createObjectURL(file)
      : undefined,
    file: file,
  };
}

export function revokeAttachmentURLs(attachment: IAttachment): void {
  if (attachment.url) {
    URL.revokeObjectURL(attachment.url);
  }
  if (attachment.thumbnail) {
    URL.revokeObjectURL(attachment.thumbnail);
  }
}
