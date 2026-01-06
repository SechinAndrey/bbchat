/**
 * Media utility functions for detecting file types and extracting file information
 */

/**
 * Check if URL is an image based on file extension
 */
export const isImage = (url: string): boolean => {
  if (!url) return false;
  const imageExtensions = ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp"];
  const extension = url.split(".").pop()?.toLowerCase();
  return extension ? imageExtensions.includes(extension) : false;
};

/**
 * Check if URL is a video based on file extension
 */
export const isVideo = (url: string): boolean => {
  if (!url) return false;
  const videoExtensions = ["mp4", "webm", "ogg", "avi", "mov", "mkv", "m4v"];
  const extension = url.split(".").pop()?.toLowerCase();
  return extension ? videoExtensions.includes(extension) : false;
};

/**
 * Check if URL is an audio file based on file extension
 */
export const isAudio = (url: string): boolean => {
  if (!url) return false;
  const audioExtensions = ["mp3", "wav", "ogg", "m4a", "aac", "flac"];
  const extension = url.split(".").pop()?.toLowerCase();
  return extension ? audioExtensions.includes(extension) : false;
};

export const isTgsSticker = (url: string): boolean => {
  if (!url) return false;
  const extension = url.split(".").pop()?.toLowerCase();
  return extension === "tgs";
};

/**
 * Get file name from URL
 */
export const getFileName = (url: string): string => {
  if (!url) return "";
  const decodedUrl = decodeURI(url);
  return decodedUrl.split("/").pop() || "";
};

/**
 * Truncate long file names while preserving extension
 * @param fileName - Full file name
 * @param maxLength - Maximum length before truncation (default: 40)
 * @returns long_file_name.txt => long_fi…me.txt
 */
export const truncateFileName = (
  fileName: string,
  maxLength: number = 30,
): string => {
  if (!fileName || fileName.length <= maxLength) return fileName;

  const lastDotIndex = fileName.lastIndexOf(".");
  const hasExtension = lastDotIndex > 0 && lastDotIndex < fileName.length - 1;

  if (!hasExtension) {
    const endChars = 3;
    const startLength = maxLength - endChars - 1;
    return (
      fileName.substring(0, startLength) +
      "…" +
      fileName.substring(fileName.length - endChars)
    );
  }

  const extension = fileName.substring(lastDotIndex);
  const nameWithoutExt = fileName.substring(0, lastDotIndex);
  const availableLength = maxLength - extension.length - 1;

  if (availableLength <= 0) {
    return fileName.substring(0, maxLength - 1) + "…";
  }

  const endChars = 3;
  const startLength = availableLength - endChars;

  if (startLength <= 0) {
    return nameWithoutExt.substring(0, availableLength) + "…" + extension;
  }

  const startPart = nameWithoutExt.substring(0, startLength);
  const endPart = nameWithoutExt.substring(nameWithoutExt.length - endChars);

  return startPart + "…" + endPart + extension;
};

/**
 * Get file extension from URL
 */
export const getFileExtension = (url: string): string => {
  if (!url) return "";
  return url.split(".").pop()?.toLowerCase() || "";
};

/**
 * Determine media type based on file extension
 */
export const getMediaType = (
  url: string,
): "image" | "video" | "audio" | "file" => {
  if (isImage(url)) return "image";
  if (isVideo(url)) return "video";
  if (isAudio(url)) return "audio";
  return "file";
};

/**
 * Format file size in human-readable format
 * @param bytes - File size in bytes
 * @returns Formatted file size string (e.g., "1.5 MB")
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

/**
 * Get file type from File object based on MIME type
 * @param file - File object
 * @returns File type: "image" | "video" | "audio" | "file"
 */
export const getFileType = (
  file: File,
): "image" | "video" | "audio" | "file" => {
  const type = file.type.toLowerCase();

  if (type.startsWith("image/")) return "image";
  if (type.startsWith("video/")) return "video";
  if (type.startsWith("audio/")) return "audio";

  return "file";
};

/**
 * Validate file size
 * @param file - File object to validate
 * @param maxSize - Maximum file size in bytes (default: 10MB)
 * @returns Validation result with error message if invalid
 */
export const validateFile = (
  file: File,
  maxSize: number = 10 * 1024 * 1024,
): { valid: boolean; error?: string } => {
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `Файл занадто великий. Максимальний розмір: ${formatFileSize(maxSize)}`,
    };
  }
  return { valid: true };
};

/**
 * Revoke blob URLs to free up memory
 * @param url - Blob URL to revoke
 */
export const revokeBlobURL = (url: string | undefined): void => {
  if (url && url.startsWith("blob:")) {
    URL.revokeObjectURL(url);
  }
};
