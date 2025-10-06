<!--
  KPI Card Component
  Displays key performance indicators with icons and trend indicators
-->
<template>
  <div class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
    <div class="flex items-center justify-between">
      <div class="flex-1">
        <p class="text-sm font-medium text-gray-600 mb-1">
          {{ title }}
        </p>
        <div class="flex items-baseline space-x-2">
          <p class="text-2xl font-bold" :class="valueColor">
            {{ formattedValue }}
          </p>
          <div v-if="change !== undefined" class="flex items-center space-x-1">
            <i 
              :class="changeIcon" 
              class="text-sm"
              :aria-label="changeLabel"
            ></i>
            <span 
              class="text-sm font-medium"
              :class="changeColor"
              :aria-label="changeText"
            >
              {{ changeText }}
            </span>
          </div>
        </div>
        <p v-if="subtitle" class="text-xs text-gray-500 mt-1">
          {{ subtitle }}
        </p>
      </div>
      
      <div class="flex-shrink-0">
        <div 
          class="w-12 h-12 rounded-lg flex items-center justify-center"
          :class="iconBgColor"
          :aria-label="'Ícone para ' + title"
        >
          <i :class="icon" class="text-xl" :aria-hidden="true"></i>
        </div>
      </div>
    </div>

    <!-- Progress bar for percentage values -->
    <div v-if="showProgress && progressValue !== undefined" class="mt-4">
      <div class="flex justify-between text-xs text-gray-600 mb-1">
        <span>Progresso</span>
        <span>{{ Math.round(progressValue) }}%</span>
      </div>
      <div class="w-full bg-gray-200 rounded-full h-2">
        <div 
          class="h-2 rounded-full transition-all duration-300"
          :class="progressColor"
          :style="{ width: progressValue + '%' }"
          :aria-label="'Barra de progresso: ' + Math.round(progressValue) + '%'"
        ></div>
      </div>
    </div>

    <!-- Additional metrics -->
    <div v-if="additionalMetrics" class="mt-4 pt-4 border-t border-gray-100">
      <div class="grid grid-cols-2 gap-4 text-xs">
        <div v-for="metric in additionalMetrics" :key="metric.label" class="text-center">
          <p class="text-gray-500">{{ metric.label }}</p>
          <p class="font-semibold text-gray-900">{{ metric.value }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  title: string
  value: number
  change?: number
  subtitle?: string
  icon?: string
  format?: 'number' | 'currency' | 'percentage'
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'gray'
  showProgress?: boolean
  progressValue?: number
  additionalMetrics?: Array<{ label: string; value: string | number }>
}

const props = withDefaults(defineProps<Props>(), {
  format: 'number',
  color: 'blue',
  showProgress: false,
  icon: 'pi pi-chart-line'
})

// Computed properties
const formattedValue = computed(() => {
  switch (props.format) {
    case 'currency':
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(props.value)
    case 'percentage':
      return `${props.value.toFixed(1)}%`
    default:
      return props.value.toLocaleString('pt-BR')
  }
})

const changeText = computed(() => {
  if (props.change === undefined) return ''
  const absChange = Math.abs(props.change)
  const sign = props.change > 0 ? '+' : ''
  return `${sign}${absChange.toFixed(1)}%`
})

const changeIcon = computed(() => {
  if (props.change === undefined) return ''
  if (props.change > 0) return 'pi pi-arrow-up'
  if (props.change < 0) return 'pi pi-arrow-down'
  return 'pi pi-minus'
})

const changeColor = computed(() => {
  if (props.change === undefined) return 'text-gray-500'
  if (props.change > 0) return 'text-green-600'
  if (props.change < 0) return 'text-red-600'
  return 'text-gray-500'
})

const changeLabel = computed(() => {
  if (props.change === undefined) return 'Sem mudança'
  if (props.change > 0) return 'Aumento'
  if (props.change < 0) return 'Queda'
  return 'Sem mudança'
})

const valueColor = computed(() => {
  const colors = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    red: 'text-red-600',
    yellow: 'text-yellow-600',
    purple: 'text-purple-600',
    gray: 'text-gray-600'
  }
  return colors[props.color]
})

const iconBgColor = computed(() => {
  const colors = {
    blue: 'bg-blue-100',
    green: 'bg-green-100',
    red: 'bg-red-100',
    yellow: 'bg-yellow-100',
    purple: 'bg-purple-100',
    gray: 'bg-gray-100'
  }
  return colors[props.color]
})

const progressColor = computed(() => {
  const colors = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    red: 'bg-red-500',
    yellow: 'bg-yellow-500',
    purple: 'bg-purple-500',
    gray: 'bg-gray-500'
  }
  return colors[props.color]
})
</script>

<style scoped>
/* Custom hover effects */
.hover\:shadow-lg:hover {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

/* Smooth transitions */
.transition-shadow {
  transition-property: box-shadow;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

/* Focus styles for accessibility */
div:focus-within {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}
</style>
