<script setup lang="ts">
import { ref, watch, onBeforeUnmount } from "vue";
import { CheckIcon, ExclamationTriangleIcon } from "@heroicons/vue/24/outline";
import type { SlotStatus } from "../types";

const props = defineProps<{
  status?: SlotStatus;
}>();

const emit = defineEmits<{
  done: [];
  retry: [];
}>();

type UploadedPhase = "contract" | "checkmark" | null;
const uploadedPhase = ref<UploadedPhase>(null);

let t1: ReturnType<typeof setTimeout> | null = null;
let t2: ReturnType<typeof setTimeout> | null = null;
let t3: ReturnType<typeof setTimeout> | null = null;

const clearTimers = () => {
  if (t1) {
    clearTimeout(t1);
    t1 = null;
  }
  if (t2) {
    clearTimeout(t2);
    t2 = null;
  }
  if (t3) {
    clearTimeout(t3);
    t3 = null;
  }
};

watch(
  () => props.status,
  (val) => {
    clearTimers();
    uploadedPhase.value = null;

    if (val === "uploaded") {
      uploadedPhase.value = "contract";
      t1 = setTimeout(() => {
        uploadedPhase.value = "checkmark";
        t2 = setTimeout(() => {
          uploadedPhase.value = null;
          t3 = setTimeout(() => emit("done"), 500);
        }, 1600);
      }, 550);
    }
  },
  { immediate: true },
);

onBeforeUnmount(clearTimers);
</script>

<template>
  <div class="absolute inset-0 z-[15] pointer-events-none">
    <!-- ── MODIFIED ── -->
    <Transition name="badge-pop">
      <div
        v-if="status === 'modified'"
        class="absolute top-1.5 right-1.5 flex items-center justify-center"
      >
        <span
          class="absolute w-3.5 h-3.5 rounded-full bg-info opacity-60 animate-ping"
        />
        <span class="relative w-2.5 h-2.5 rounded-full bg-info shadow-sm" />
      </div>
    </Transition>

    <!-- ── QUEUED ── -->
    <Transition name="fade-overlay">
      <div
        v-if="status === 'queued' || status === 'uploading'"
        class="absolute inset-0"
      >
        <div class="absolute inset-0 overlay-queued" />
      </div>
    </Transition>

    <!-- ── UPLOADING ── -->
    <Transition name="fade-overlay">
      <div
        v-if="status === 'uploading'"
        class="absolute inset-0 overflow-hidden"
      >
        <div class="wave-band" />
      </div>
    </Transition>

    <!-- ── UPLOADED ── -->
    <div
      v-if="uploadedPhase === 'contract'"
      class="absolute inset-0 overlay-contract"
    />

    <!-- ── UPLOADED: checkmark  ── -->
    <Transition name="check-phase">
      <div
        v-if="uploadedPhase === 'checkmark'"
        class="absolute inset-0 flex items-center justify-center"
      >
        <div
          class="w-10 h-10 rounded-full bg-success flex items-center justify-center shadow-lg"
        >
          <CheckIcon class="w-6 h-6 text-white stroke-[2.5]" />
        </div>
      </div>
    </Transition>

    <!-- ── ERROR ── -->
    <Transition name="fade-overlay">
      <div
        v-if="status === 'error'"
        class="absolute inset-0 flex items-center justify-center cursor-pointer pointer-events-auto"
        style="background: rgba(220, 38, 38, 0.5)"
        @click.stop="emit('retry')"
      >
        <div
          class="w-9 h-9 rounded-full bg-danger flex items-center justify-center shadow-lg error-icon"
        >
          <ExclamationTriangleIcon class="w-5 h-5 text-white" />
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
/* ── Overlay fade (outer wrapper, no animation) ── */
.fade-overlay-enter-active {
  transition: opacity 0.3s ease;
}
.fade-overlay-leave-active {
  transition: opacity 0.25s ease;
}
.fade-overlay-enter-from,
.fade-overlay-leave-to {
  opacity: 0;
}

/* ── Badge spring pop ── */
.badge-pop-enter-active {
  transition:
    opacity 0.25s ease,
    transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.badge-pop-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}
.badge-pop-enter-from,
.badge-pop-leave-to {
  opacity: 0;
  transform: scale(0.3);
}

/* ── Checkmark: spring-in, inflate-out (no rotation = no "crooked" look) ── */
.check-phase-enter-active {
  transition:
    opacity 0.3s ease,
    transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.check-phase-leave-active {
  transition:
    opacity 0.5s ease,
    transform 0.5s ease;
}
.check-phase-enter-from {
  opacity: 0;
  transform: scale(0.15);
}
.check-phase-leave-to {
  opacity: 0;
  transform: scale(1.5);
}

/* ── Queued overlay: inner element with Perlin-like breathing ──
   Separated from the Transition wrapper so CSS animation doesn't
   conflict with Vue's enter/leave opacity transitions.          */
.overlay-queued {
  background: rgba(0, 0, 0, 0.4);
  animation: perlin-breathe 6s linear infinite;
}

@keyframes perlin-breathe {
  /* Range: 0.68–1.0  →  visual darkening 27–40%  →  clearly visible */
  0% {
    opacity: 1;
  }
  11% {
    opacity: 0.78;
  }
  23% {
    opacity: 0.96;
  }
  34% {
    opacity: 0.72;
  }
  45% {
    opacity: 0.88;
  }
  56% {
    opacity: 0.68;
  }
  67% {
    opacity: 0.97;
  }
  78% {
    opacity: 0.8;
  }
  89% {
    opacity: 0.92;
  }
  100% {
    opacity: 1;
  }
}

/* ── Uploading wave ── */
.wave-band {
  position: absolute;
  left: 0;
  right: 0;
  height: 55%;
  top: 100%;
  background: linear-gradient(
    to top,
    transparent 0%,
    rgba(142, 153, 243, 0.45) 35%,
    rgba(142, 153, 243, 0.65) 50%,
    rgba(142, 153, 243, 0.45) 65%,
    transparent 100%
  );
  animation: wave-rise 2s linear infinite;
}

@keyframes wave-rise {
  0% {
    transform: translateY(0);
  }
  100% {
    transform: translateY(-280%);
  }
}

/* ── Uploaded: overlay contracts to a circle in the center ── */
/* clip-path: circle() always produces a true circle regardless of element dimensions */
.overlay-contract {
  background: rgba(0, 0, 0, 0.42);
  animation: contract-overlay 0.55s cubic-bezier(0.4, 0, 1, 1) forwards;
}

@keyframes contract-overlay {
  0% {
    clip-path: circle(71% at 50% 50%);
    opacity: 0.9;
  }
  30% {
    clip-path: circle(45% at 50% 50%);
    opacity: 0.9;
  }
  70% {
    clip-path: circle(7% at 50% 50%);
    opacity: 0.5;
  }
  100% {
    clip-path: circle(0% at 50% 50%);
    opacity: 0;
  }
}

/* ── Error icon: shake on mount ── */
.error-icon {
  animation: error-shake 0.45s ease-out;
}

@keyframes error-shake {
  0%,
  100% {
    transform: scale(1) translateX(0);
  }
  20% {
    transform: scale(1.1) translateX(-3px);
  }
  40% {
    transform: scale(1.1) translateX(3px);
  }
  60% {
    transform: scale(1.05) translateX(-2px);
  }
  80% {
    transform: scale(1.05) translateX(2px);
  }
}
</style>
