<script setup lang="ts">
import { CheckCircle, Mic, Pause, Play, RotateCcw, Send, X } from "lucide-vue-next";

defineProps<{
  phase: "recording" | "preview";
  seconds: number;
  playing: boolean;
}>();

defineEmits<{
  cancel: [];
  stop: [];
  rerecord: [];
  togglePlay: [];
  send: [];
}>();

function durationLabel(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`;
}
</script>

<template>
  <div class="voice-recording-controls" :class="phase" data-voice-composer>
    <button
      v-if="phase === 'recording'"
      class="voice-control-button"
      type="button"
      aria-label="Cancel voice recording"
      @click="$emit('cancel')"
    >
      <X :size="17" />
    </button>
    <button
      v-else
      class="voice-control-button"
      type="button"
      :aria-label="playing ? 'Pause voice preview' : 'Play voice preview'"
      @click="$emit('togglePlay')"
    >
      <Pause v-if="playing" :size="17" />
      <Play v-else :size="17" />
    </button>

    <div class="voice-capture-strip" role="status" aria-live="polite">
      <span v-if="phase === 'recording'" class="voice-record-dot" aria-hidden="true" />
      <Mic v-else :size="15" aria-hidden="true" />
      <strong>{{ phase === "recording" ? "REC" : "Voice preview" }}</strong>
      <span class="voice-waveform" :class="{ playing: phase === 'recording' || playing }" aria-hidden="true">
        <i v-for="bar in 6" :key="bar" :style="{ '--bar-index': bar }" />
      </span>
      <time>{{ durationLabel(seconds) }}</time>
    </div>

    <button
      v-if="phase === 'recording'"
      class="voice-control-button stop"
      type="button"
      aria-label="Stop voice recording"
      @click="$emit('stop')"
    >
      <CheckCircle :size="18" />
    </button>
    <template v-else>
      <button class="voice-control-button" type="button" aria-label="Record again" @click="$emit('rerecord')">
        <RotateCcw :size="17" />
      </button>
      <button class="voice-control-button delete" type="button" aria-label="Delete voice recording" @click="$emit('cancel')">
        <X :size="17" />
      </button>
      <button class="voice-control-button send" type="button" aria-label="Send voice message" @click="$emit('send')">
        <Send :size="17" />
      </button>
    </template>
  </div>
</template>

<style scoped>
.voice-recording-controls {
  display: flex;
  min-width: 0;
  flex: 1;
  align-items: center;
  gap: 8px;
}

.voice-control-button {
  display: inline-flex;
  width: 40px;
  height: 40px;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  padding: 0;
  color: var(--icon-muted);
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  cursor: pointer;
}

.voice-control-button.stop {
  color: var(--error);
}

.voice-control-button.delete {
  color: var(--error);
}

.voice-control-button.send {
  color: #fff;
  background: var(--mint);
  border-color: var(--mint);
}

.voice-capture-strip {
  display: flex;
  min-width: 0;
  min-height: 44px;
  flex: 1;
  align-items: center;
  gap: 8px;
  padding: 0 12px;
  color: var(--text);
  background: var(--surface-alt);
  border: 1px solid var(--border);
  border-radius: 8px;
}

.voice-capture-strip > svg {
  flex: 0 0 auto;
  color: var(--lavender);
}

.voice-capture-strip strong,
.voice-capture-strip time {
  flex: 0 0 auto;
  font-size: 10px;
}

.voice-capture-strip time {
  color: var(--muted);
  font-variant-numeric: tabular-nums;
}

.voice-record-dot {
  width: 9px;
  height: 9px;
  flex: 0 0 auto;
  background: var(--error);
  border-radius: 50%;
  animation: recording-pulse 1s ease-in-out infinite;
}

.voice-waveform {
  display: flex;
  min-width: 30px;
  flex: 1;
  align-items: center;
  justify-content: center;
  gap: 3px;
}

.voice-waveform i {
  width: 3px;
  height: calc(6px + (var(--bar-index) % 3) * 4px);
  background: var(--placeholder);
  border-radius: 999px;
}

.voice-waveform.playing i {
  background: var(--error);
  animation: waveform 720ms ease-in-out infinite alternate;
  animation-delay: calc(var(--bar-index) * -80ms);
}

@keyframes recording-pulse {
  50% { opacity: 0.35; }
}

@keyframes waveform {
  to { transform: scaleY(0.45); }
}

@media (max-width: 420px) {
  .voice-recording-controls {
    gap: 6px;
  }

  .voice-control-button {
    width: 36px;
    height: 36px;
  }

  .voice-capture-strip {
    gap: 6px;
    padding-inline: 9px;
  }

  .voice-capture-strip strong {
    max-width: 66px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>
