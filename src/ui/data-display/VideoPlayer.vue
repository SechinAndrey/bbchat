<script setup lang="ts">
import { ref } from "vue";

import {
  ArrowsPointingInIcon,
  ArrowsPointingOutIcon,
  PauseIcon,
  PlayIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  ArrowDownTrayIcon,
} from "@heroicons/vue/24/solid";
import RangeSlider from "@src/ui/inputs/RangeSlider.vue";
import { VideoPlayer } from "@videojs-player/vue";
import { Capacitor } from "@capacitor/core";
import { Media } from "@capacitor-community/media";
import { useToast } from "@src/shared/composables/useToast";

import "video.js/dist/video-js.css";

interface VideoState {
  playing: boolean;
  muted: boolean;
  duration: number;
}

defineEmits(["videoLoad"]);

const props = defineProps<{
  id: string;
  url: string;
  name?: string;
  thumbnail: string;
}>();

const { toastSuccess, toastError } = useToast();

// if the fullscreen is toggled or not
const fullScreen = ref(false);

// percentage of the video that played
const percentage = ref(0);

// value representing the volume
const volume = ref(0);

// controls showing the volume slider when hovering over mute/unmute buttons
const volumeSliderInvisible = ref(false);

// tells us if the video was started
const started = ref(false);

// download progress state
const isDownloading = ref(false);
const downloadProgress = ref(0);

// (event) mute and unmute the audio of the video
const handleToggleMute = (player: any) => {
  player.muted(!player.muted());
};

// (event) increases and decreases volume based on the volume range slider location
const handleVolumeSliderChange = (value: number, player: any) => {
  player.volume(value / 100);
};

// (event) update the volume ref when the video volume changes
const handleVolumeChange = (event: any) => {
  volume.value = event.target.player.volume() * 100;
};

// (event) increase and decrease the percentage based on the video time
const handleTimeChange = (event: any) => {
  percentage.value =
    (event.target.player.cache_.currentTime /
      event.target.player.cache_.duration) *
    100;
};

// (event) change the current time of the video based on the slider's value
const handleTrackInput = (value: number, player: any, state: VideoState) => {
  player.currentTime((value / 100) * state.duration);
};

// (event) pause and play the video
const handleToggleVideo = (state: VideoState, player: any) => {
  if (!state.playing && !started.value) {
    started.value = true;
    volume.value = player.volume() * 100;
  }
  state.playing ? player.pause() : player.play();
};

const handleDownloadVideo = async (event: Event) => {
  event.preventDefault();
  event.stopPropagation();

  const isNative = Capacitor.isNativePlatform();
  isDownloading.value = true;
  downloadProgress.value = 0;

  try {
    const blob = await fetchWithProgress(props.url);

    if (isNative) {
      await downloadFileNative(blob);
    } else {
      downloadFileWeb(blob);
    }
  } catch (error) {
    console.error("❌ Download failed:", error);
    toastError(
      "Помилка завантаження. Перевірте з'єднання або спробуйте пізніше.",
    );
  } finally {
    isDownloading.value = false;
    downloadProgress.value = 0;
  }
};

const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      const base64Data = base64.split(",")[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

const fetchWithProgress = (url: string): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.responseType = "blob";

    xhr.onprogress = (event) => {
      if (event.lengthComputable) {
        downloadProgress.value = Math.round((event.loaded / event.total) * 100);
      }
    };

    xhr.onload = () => {
      if (xhr.status === 200) {
        resolve(xhr.response);
      } else {
        reject(new Error(`HTTP error! status: ${xhr.status}`));
      }
    };

    xhr.onerror = () => reject(new Error("Network error"));
    xhr.send();
  });
};
const downloadFileWeb = (blob: Blob) => {
  const blobUrl = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = blobUrl;
  link.download = props.name || "video.mp4";
  link.style.display = "none";

  document.body.appendChild(link);
  link.click();

  setTimeout(() => {
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
  }, 100);
};

const downloadFileNative = async (blob: Blob) => {
  try {
    const base64Data = await blobToBase64(blob);
    const fileName = props.name || `video_${Date.now()}.mp4`;
    const dataUrl = `data:video/mp4;base64,${base64Data}`;
    let albumIdentifier: string | undefined;

    try {
      const albumsResponse = await Media.getAlbums();
      const bbChatAlbum = albumsResponse.albums.find(
        (album) => album.name === "Billboards комунікації",
      );

      if (bbChatAlbum) {
        albumIdentifier = bbChatAlbum.identifier;
      } else {
        await Media.createAlbum({ name: "Billboards комунікації" });
        const updatedAlbums = await Media.getAlbums();
        const newAlbum = updatedAlbums.albums.find(
          (album) => album.name === "Billboards комунікації",
        );
        albumIdentifier = newAlbum?.identifier;
      }
    } catch (albumError) {
      console.warn(
        "⚠️ Album handling failed, saving to default location:",
        albumError,
      );
    }

    await Media.saveVideo({
      path: dataUrl,
      albumIdentifier: albumIdentifier,
      fileName: fileName,
    });

    toastSuccess(`Відео збережено в галереї: ${fileName}`);
  } catch (error) {
    console.error("❌ Gallery save failed:", error);
    toastError("Помилка збереження в галерею. Перевірте дозволи програми.");
  }
};
</script>

<template>
  <VideoPlayer
    class="video-player"
    :src="props.url"
    @timeupdate="handleTimeChange"
    @volumechange="handleVolumeChange"
    @loadstart="(event) => $emit('videoLoad', event)"
  >
    <template #default="{ player, state }">
      <div class="overlay-container">
        <!--video title-->
        <div v-if="props.name" class="video-title">
          <p class="video-name">{{ props.name }}</p>
          <button
            type="button"
            class="download-button-title"
            :title="isDownloading ? 'Завантаження...' : 'Завантажити відео'"
            :disabled="isDownloading"
            @click.prevent.stop="handleDownloadVideo"
          >
            <ArrowDownTrayIcon v-if="!isDownloading" class="icon small" />
            <div v-else class="download-spinner"></div>
          </button>
          <!-- Progress indicator -->
          <div
            v-if="isDownloading"
            class="download-progress"
            :style="{ width: downloadProgress + '%' }"
          ></div>
        </div>

        <!--pause and start buttons-->
        <div class="pause-start-container">
          <!--play button-->
          <button
            v-if="!state.playing"
            class="control-button play-button"
            @click="() => handleToggleVideo(state, player)"
          >
            <PlayIcon class="icon large" />
          </button>
          <!--pause button-->
          <button
            v-if="state.playing"
            class="control-button pause-button"
            :class="{ 'opacity-0': state.playing }"
            @click="() => handleToggleVideo(state, player)"
          >
            <PauseIcon class="icon large" />
          </button>
        </div>

        <!--controls-->
        <div v-if="started" class="controls-container">
          <!--audio controls-->
          <div
            class="audio-controls-container"
            @mouseenter="volumeSliderInvisible = false"
            @mouseleave="volumeSliderInvisible = true"
          >
            <!--unmute button-->
            <button
              v-if="state.muted"
              class="mute-unmute-buttons"
              @click="() => handleToggleMute(player)"
            >
              <SpeakerXMarkIcon class="icon small" />
            </button>

            <!--mute button-->
            <button
              v-else
              class="mute-unmute-buttons"
              @click="() => handleToggleMute(player)"
            >
              <SpeakerWaveIcon class="icon small" />
            </button>

            <!--audio slider-->
            <div
              class="volume-slider-container"
              :style="{ opacity: volumeSliderInvisible ? 0 : 1 }"
            >
              <RangeSlider
                :percentage="volume"
                class="volume-slider"
                aria-label="volume change slider"
                @value-changed="
                  ($event) => handleVolumeSliderChange($event, player)
                "
              />
            </div>
          </div>

          <!--pause button-->
          <button
            v-if="state.playing"
            class="pause-play-buttons"
            @click="() => handleToggleVideo(state, player)"
          >
            <PauseIcon class="icon small" />
          </button>

          <!--play button-->
          <button
            v-if="!state.playing"
            class="pause-play-buttons"
            @click="() => handleToggleVideo(state, player)"
          >
            <PlayIcon class="icon small" />
          </button>

          <!--track slider-->
          <RangeSlider
            class="track-slider"
            :percentage="percentage"
            aria-label="time track slider"
            @value-changed="($event) => handleTrackInput($event, player, state)"
          />

          <!--maximize button-->
          <button
            v-if="!fullScreen"
            @click="
              () => {
                fullScreen = !fullScreen;
                player.enterFullWindow();
              }
            "
          >
            <ArrowsPointingOutIcon class="icon small" />
          </button>

          <!--minimize button-->
          <button
            v-if="fullScreen"
            @click="
              () => {
                fullScreen = !fullScreen;
                player.exitFullWindow();
              }
            "
          >
            <ArrowsPointingInIcon class="icon small" />
          </button>
        </div>
      </div>
    </template>
  </VideoPlayer>
</template>

<style>
.video-player {
  border-radius: 12px;
  overflow: hidden;

  /** the video thumbnail */
  .vjs-poster {
    background-size: cover !important;
  }

  /* the overlay that contains the title and controls */
  .overlay-container {
    position: absolute;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    background: rgba(0, 0, 0, 0);
    transition: all 200ms ease;

    &:hover {
      background: rgba(0, 0, 0, 0.3);
    }

    /** the icons in the overlay container */
    .icon {
      color: white;
      &.small {
        width: 16px;
        height: 16px;
      }
      &.large {
        width: 32px;
        height: 32px;
      }
    }

    /* video title container */
    .video-title {
      width: 100%;
      padding: 16px;
      background: rgba(255, 255, 255, 0.2);
      opacity: 0;
      transition: all 200ms ease;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      position: relative;

      .video-name {
        flex: 1;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .download-button-title {
        flex-shrink: 0;

        &:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      }

      .download-spinner {
        width: 16px;
        height: 16px;
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-top-color: white;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
      }

      .download-progress {
        position: absolute;
        bottom: 0;
        left: 0;
        height: 3px;
        background: linear-gradient(90deg, #4ade80, #22c55e);
        transition: width 0.3s ease;
        border-radius: 0 0 8px 8px;
      }
    }

    /* pause and start container */
    .pause-start-container {
      position: absolute;
      top: calc(50% - 56px / 2);
      display: flex;
      justify-content: center;
      align-items: center;

      .control-button {
        padding: 12px;
        border-radius: 100%;
        background: rgba(255, 255, 255, 0.2);
        transition: all 200ms ease;
      }

      .pause-button {
        opacity: 0;
        &:hover {
          background: rgba(255, 255, 255, 0.5) !important;
        }
      }
    }

    /** contains the audio, play, time, and size controls */
    .controls-container {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100%;
      padding: 16px;
      background: rgba(255, 255, 255, 0.2);
      opacity: 0;
      transition: all 200ms ease;

      /** contains the mute audio buttons and range slider */
      .audio-controls-container {
        position: relative;

        /** contains the range slider */
        .volume-slider-container {
          position: absolute;
          bottom: 75px;
          right: -85%;
          transform: rotate(270deg);
          width: 100px;
          padding: 8px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.2);
        }

        /** the mute and unmute buttons */
        .mute-unmute-buttons {
          margin-right: 16px;
        }

        /* the slider that controls the video volume */
        .volume-slider {
          width: 100%;
          margin-right: 16px;
        }
      }

      /** the pause and play buttons */
      .pause-play-buttons {
        margin-right: 16px;
      }

      /** the slider that changes the video curren time */
      .track-slider {
        width: 100%;
        margin-right: 16px;
      }
    }
  }

  &:hover .overlay-container .video-title {
    opacity: 1;
  }

  @media (max-width: 60.4rem) {
    .overlay-container .video-title {
      opacity: 1;
    }
  }

  .overlay-container .video-title:has(.download-spinner),
  .overlay-container .video-title:has(.download-progress) {
    opacity: 1;
  }

  /* show pause button when the user hovers over the video */
  &:hover .overlay-container .pause-start-container .control-button {
    opacity: 1;
  }

  /** show the controls on the bottom when the user hovers over the video */
  &:hover .overlay-container .controls-container {
    opacity: 1;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/** tablets and above */
@media (min-width: 60.5rem) {
  .video-player {
    width: 546.39px;
    height: 301px;
  }
}

/** mobile */
@media (max-width: 60.4rem) {
  .video-player {
    width: 346px;
    height: 191px;

    .overlay-container
      .controls-container
      .audio-controls-container
      .volume-slider-container {
      bottom: 60px;
      right: -30%;
      width: 70px;
    }
  }
}
</style>
