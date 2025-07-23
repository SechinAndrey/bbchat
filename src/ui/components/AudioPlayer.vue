<template>
  <div
    class="w-full max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg border border-theme-bg p-4 shadow-sm"
  >
    <audio
      ref="audioElement"
      :src="props.src"
      @timeupdate="updateProgress"
      @loadedmetadata="onLoadedMetadata"
      @ended="onEnded"
    ></audio>

    <div class="flex items-center space-x-4">
      <!-- Play/Pause -->
      <button
        class="flex items-center justify-center w-8 h-8 bg-primary text-white rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-hover focus:ring-offset-2"
        :disabled="!canPlay"
        @click="togglePlay"
      >
        <svg
          v-if="!isPlaying"
          class="w-6 h-6 ml-0.5"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M8 5v14l11-7z" />
        </svg>
        <svg v-else class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
        </svg>
      </button>

      <div class="flex-1 space-y-2 mt-4">
        <!-- Timeline -->
        <div class="relative">
          <div
            ref="timelineContainer"
            class="w-full h-2 bg-gray-200 rounded-full cursor-pointer"
            @click="seekToPosition"
            @mousedown="startDrag"
          >
            <!-- Progress -->
            <div
              class="h-full bg-primary rounded-full transition-all duration-100 ease-out"
              :style="{ width: `${progressPercent}%` }"
            ></div>

            <!-- Thumb -->
            <div
              class="absolute top-1/2 w-4 h-4 bg-white border-2 border-primary rounded-full cursor-grab active:cursor-grabbing transform -translate-y-1/2 transition-all duration-100 ease-out shadow-sm"
              :style="{ left: `calc(${progressPercent}% - 8px)` }"
              @mousedown="startDrag"
            ></div>
          </div>
        </div>

        <!-- time -->
        <div
          class="flex justify-between text-xs text-gray-500 font-mono select-none"
        >
          <span>{{ formatTime(currentTime) }}</span>
          <span>{{ formatTime(duration) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";

const props = defineProps({
  src: {
    type: String,
    required: true,
  },
});

const audioElement = ref(null);
const timelineContainer = ref(null);
const isPlaying = ref(false);
const currentTime = ref(0);
const duration = ref(0);
const canPlay = ref(false);
const isDragging = ref(false);

const progressPercent = computed(() => {
  if (duration.value === 0) return 0;
  return (currentTime.value / duration.value) * 100;
});

const togglePlay = () => {
  if (!audioElement.value || !canPlay.value) return;

  if (isPlaying.value) {
    audioElement.value.pause();
    isPlaying.value = false;
  } else {
    audioElement.value.play();
    isPlaying.value = true;
  }
};

const updateProgress = () => {
  if (!isDragging.value && audioElement.value) {
    currentTime.value = audioElement.value.currentTime;
  }
};

const onLoadedMetadata = () => {
  if (audioElement.value) {
    duration.value = audioElement.value.duration;
    canPlay.value = true;
  }
};

const onEnded = () => {
  isPlaying.value = false;
  currentTime.value = 0;
  if (audioElement.value) {
    audioElement.value.currentTime = 0;
  }
};

const seekToPosition = (event) => {
  if (!audioElement.value || !timelineContainer.value || !canPlay.value) return;

  const rect = timelineContainer.value.getBoundingClientRect();
  const clickX = event.clientX - rect.left;
  const width = rect.width;
  const percent = Math.max(0, Math.min(1, clickX / width));
  const newTime = percent * duration.value;

  audioElement.value.currentTime = newTime;
  currentTime.value = newTime;
};

const startDrag = (event) => {
  if (!canPlay.value) return;

  isDragging.value = true;
  event.preventDefault();

  const handleMouseMove = (e) => {
    if (!timelineContainer.value || !audioElement.value) return;

    const rect = timelineContainer.value.getBoundingClientRect();
    const dragX = e.clientX - rect.left;
    const width = rect.width;
    const percent = Math.max(0, Math.min(1, dragX / width));
    const newTime = percent * duration.value;

    currentTime.value = newTime;
    audioElement.value.currentTime = newTime;
  };

  const handleMouseUp = () => {
    isDragging.value = false;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  document.addEventListener("mousemove", handleMouseMove);
  document.addEventListener("mouseup", handleMouseUp);
};

const formatTime = (seconds) => {
  if (isNaN(seconds) || seconds === 0) return "0:00";

  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

onMounted(() => {
  if (audioElement.value) {
    audioElement.value.preload = "metadata";
  }
});

onUnmounted(() => {
  if (audioElement.value) {
    audioElement.value.pause();
  }
});
</script>
