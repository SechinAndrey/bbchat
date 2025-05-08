<script setup lang="ts">
import { defineEmits } from 'vue';

const emit = defineEmits(['apply', 'reset']);

function handleApply() {
  emit('apply');
}

function handleReset() {
  emit('reset');
}
</script>

<template>
  <div class="dropdown-filter">
    <div class="dropdown-filter-content">
      <slot></slot>
    </div>
    
    <div class="dropdown-filter-actions">
      <slot name="actions">
        <button class="filter-button reset-button" @click="handleReset">
          Reset
        </button>
        <button class="filter-button apply-button" @click="handleApply">
          Apply
        </button>
      </slot>
    </div>
  </div>
</template>

<style scoped>
.dropdown-filter {
  padding: 8px;
  min-width: 200px;
}

.dropdown-filter-content {
  margin-bottom: 12px;
}

.dropdown-filter-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding-top: 8px;
  border-top: 1px solid #e2e8f0;
}

.filter-button {
  padding: 6px 12px;
  font-size: 14px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.apply-button {
  background-color: #3182ce;
  color: white;
  border: none;
}

.apply-button:hover {
  background-color: #2c5282;
}

.reset-button {
  background-color: transparent;
  color: #4a5568;
  border: 1px solid #e2e8f0;
}

.reset-button:hover {
  background-color: #f7fafc;
}

/* Dark theme */
@media (prefers-color-scheme: dark) {
  .dropdown-filter-actions {
    border-top-color: #4a5568;
  }
  
  .reset-button {
    color: #e2e8f0;
    border-color: #4a5568;
  }
  
  .reset-button:hover {
    background-color: #4a5568;
  }
}
</style>