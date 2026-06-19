<script setup lang="ts">
import { Check, ChevronDown } from "lucide-vue-next";
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch, type CSSProperties } from "vue";

interface DropdownOption {
  value: string;
  label: string;
  disabled?: boolean;
}

const props = withDefaults(
  defineProps<{
    modelValue: string;
    options: DropdownOption[];
    ariaLabel?: string;
    placeholder?: string;
    disabled?: boolean;
  }>(),
  {
    ariaLabel: "Select option",
    placeholder: "Select",
    disabled: false,
  },
);

const emit = defineEmits<{
  (event: "update:modelValue", value: any): void;
  (event: "change", value: any): void;
}>();

const rootEl = ref<HTMLElement | null>(null);
const triggerEl = ref<HTMLElement | null>(null);
const menuEl = ref<HTMLElement | null>(null);
const open = ref(false);
const menuStyle = ref<CSSProperties>({});

const selectedOption = computed(() =>
  props.options.find((option) => option.value === props.modelValue) ?? null,
);

function updateMenuPosition() {
  const trigger = triggerEl.value;
  if (!trigger) {
    return;
  }

  const rect = trigger.getBoundingClientRect();
  const viewportPadding = 12;
  const gap = 6;
  const spaceBelow = window.innerHeight - rect.bottom - viewportPadding - gap;
  const spaceAbove = rect.top - viewportPadding - gap;
  const placeAbove = spaceBelow < 160 && spaceAbove > spaceBelow;
  const availableSpace = placeAbove ? spaceAbove : spaceBelow;
  const width = Math.min(rect.width, window.innerWidth - viewportPadding * 2);
  const left = Math.min(
    Math.max(rect.left, viewportPadding),
    Math.max(viewportPadding, window.innerWidth - width - viewportPadding),
  );

  menuStyle.value = {
    left: `${left}px`,
    top: placeAbove ? "auto" : `${rect.bottom + gap}px`,
    bottom: placeAbove ? `${window.innerHeight - rect.top + gap}px` : "auto",
    width: `${width}px`,
    maxHeight: `${Math.max(120, Math.min(280, availableSpace))}px`,
  };
}

async function openMenu() {
  if (props.disabled) {
    return;
  }
  open.value = true;
  await nextTick();
  updateMenuPosition();
}

function closeMenu() {
  open.value = false;
}

function toggleMenu() {
  if (open.value) {
    closeMenu();
    return;
  }
  void openMenu();
}

function selectOption(option: DropdownOption) {
  if (option.disabled) {
    return;
  }
  emit("update:modelValue", option.value);
  emit("change", option.value);
  closeMenu();
}

function handlePointerDown(event: PointerEvent) {
  const target = event.target as Node;
  if (rootEl.value?.contains(target) || menuEl.value?.contains(target)) {
    return;
  }
  closeMenu();
}

function handleTriggerKeydown(event: KeyboardEvent) {
  if (event.key === "Escape") {
    closeMenu();
    return;
  }
  if (event.key === "Enter" || event.key === " " || event.key === "ArrowDown") {
    event.preventDefault();
    void openMenu();
  }
}

function handleWindowChange() {
  if (open.value) {
    closeMenu();
  }
}

onMounted(() => {
  document.addEventListener("pointerdown", handlePointerDown);
  window.addEventListener("resize", handleWindowChange);
  window.addEventListener("scroll", handleWindowChange, true);
});

onBeforeUnmount(() => {
  document.removeEventListener("pointerdown", handlePointerDown);
  window.removeEventListener("resize", handleWindowChange);
  window.removeEventListener("scroll", handleWindowChange, true);
});

watch(
  () => props.options,
  () => {
    if (!props.options.some((option) => option.value === props.modelValue)) {
      closeMenu();
    }
  },
);
</script>

<template>
  <div ref="rootEl" class="app-select" :class="{ 'is-open': open, 'is-disabled': disabled }">
    <button
      ref="triggerEl"
      class="app-select-trigger"
      type="button"
      :disabled="disabled"
      :aria-label="ariaLabel"
      aria-haspopup="listbox"
      :aria-expanded="open"
      @click="toggleMenu"
      @keydown="handleTriggerKeydown"
    >
      <span>{{ selectedOption?.label ?? placeholder }}</span>
      <ChevronDown :size="16" aria-hidden="true" />
    </button>

    <div
      v-if="open"
      ref="menuEl"
      class="app-select-menu"
      :style="menuStyle"
      role="listbox"
      :aria-label="ariaLabel"
      @keydown.esc.prevent.stop="closeMenu"
    >
      <button
        v-for="option in options"
        :key="option.value"
        class="app-select-option"
        type="button"
        role="option"
        :aria-selected="option.value === modelValue"
        :disabled="option.disabled"
        :class="{ selected: option.value === modelValue }"
        @click="selectOption(option)"
      >
        <span>{{ option.label }}</span>
        <Check v-if="option.value === modelValue" :size="16" aria-hidden="true" />
      </button>
    </div>
  </div>
</template>
