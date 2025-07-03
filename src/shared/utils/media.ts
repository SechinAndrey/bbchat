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

/**
 * Get file name from URL
 */
export const getFileName = (url: string): string => {
  if (!url) return "";
  return url.split("/").pop() || "";
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
