<script setup lang="ts">
import { Pause, Play } from "lucide-vue-next";

const props = defineProps<{
  durationSeconds: number;
  playing: boolean;
  mine?: boolean;
}>();

defineEmits<{ toggle: [] }>();

function durationLabel(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${minutes}:${String(remainder).padStart(2, "0")}`;
}
</script>

<template>
  <div class="voice-message-bubble" :class="{ mine, playing }" data-voice-message>
    <button type="button" :aria-label="playing ? 'Pause voice message' : 'Play voice message'" @click="$emit('toggle')">
      <Pause v-if="playing" :size="16" />
      <Play v-else :size="16" />
    </button>
    <span class="voice-message-wave" aria-hidden="true">
      <i v-for="bar in 12" :key="bar" :style="{ '--bar-index': bar }" />
    </span>
    <time>{{ durationLabel(props.durationSeconds) }}</time>
  </div>
</template>

<style scoped>
.voice-message-bubble {
  display: flex;
  width: min(280px, 78vw);
  min-height: 44px;
  align-items: center;
  gap: 10px;
  padding: 7px 11px;
  color: var(--text);
  background: var(--surface-alt);
  border: 1px solid var(--border);
  border-radius: 14px;
}

.voice-message-bubble.mine {
  margin-left: auto;
  color: #fff;
  background: var(--mint);
  border-color: var(--mint);
}

.voice-message-bubble button {
  display: inline-flex;
  width: 30px;
  height: 30px;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  padding: 0;
  color: inherit;
  background: rgba(255, 255, 255, 0.74);
  border: 0;
  border-radius: 50%;
  cursor: pointer;
}

.voice-message-bubble:not(.mine) button {
  color: var(--lavender-text);
  background: var(--lavender-soft);
}

.voice-message-wave {
  display: flex;
  min-width: 0;
  flex: 1;
  align-items: center;
  gap: 2px;
}

.voice-message-wave i {
  width: 3px;
  height: calc(6px + (var(--bar-index) % 4) * 3px);
  background: currentColor;
  border-radius: 999px;
  opacity: 0.55;
}

.voice-message-bubble.playing .voice-message-wave i {
  animation: message-wave 650ms ease-in-out infinite alternate;
  animation-delay: calc(var(--bar-index) * -45ms);
}

.voice-message-bubble time {
  flex: 0 0 auto;
  font-size: 10px;
  font-variant-numeric: tabular-nums;
  opacity: 0.78;
}

@keyframes message-wave {
  to { transform: scaleY(0.45); }
}
</style>
