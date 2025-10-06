<!--
  Deviations Combo Chart Component
  Combination chart showing values and deviations over time using Chart.js
-->
<template>
  <div class="bg-white rounded-lg shadow-md p-6">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h3 class="text-lg font-semibold text-gray-900">Valores vs Desvios</h3>
        <p class="text-sm text-gray-600">Evolução de valores e desvios ao longo do tempo</p>
      </div>
      <div class="flex items-center space-x-2">
        <i class="pi pi-chart-line text-green-500 text-xl" aria-hidden="true"></i>
        <span class="text-sm text-gray-500">Combo</span>
      </div>
    </div>

    <div class="h-80">
      <Line
        :data="chartData"
        :options="chartOptions as any"
        :aria-label="'Gráfico combinado mostrando valores e desvios ao longo do tempo'"
      />
    </div>

    <!-- Chart Legend -->
    <div class="mt-4 flex justify-center">
      <div class="flex items-center space-x-4 text-sm">
        <div class="flex items-center space-x-2">
          <div class="w-3 h-3 bg-blue-500 rounded-full" aria-hidden="true"></div>
          <span class="text-gray-600">Valor Médio</span>
        </div>
        <div class="flex items-center space-x-2">
          <div class="w-3 h-3 bg-orange-500 rounded-full" aria-hidden="true"></div>
          <span class="text-gray-600">Desvio Médio</span>
        </div>
      </div>
    </div>

    <!-- Statistics Cards -->
    <div class="grid grid-cols-2 gap-4 mt-6">
      <div class="bg-blue-50 rounded-lg p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-blue-600">Valor Médio Total</p>
            <p class="text-2xl font-bold text-blue-900">
              {{ formatCurrency(averageValue) }}
            </p>
            <p class="text-xs text-blue-600">
              {{ trendDirection.value }}
            </p>
          </div>
          <i class="pi pi-dollar text-blue-500 text-2xl" aria-hidden="true"></i>
        </div>
      </div>

      <div class="bg-orange-50 rounded-lg p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-orange-600">Desvio Médio</p>
            <p class="text-2xl font-bold text-orange-900">
              {{ averageDeviation.toFixed(0) }}
            </p>
            <p class="text-xs text-orange-600">
              {{ trendDirection.deviation }}
            </p>
          </div>
          <i class="pi pi-chart-line text-orange-500 text-2xl" aria-hidden="true"></i>
        </div>
      </div>
    </div>

    <!-- Time Range Selector -->
    <div class="mt-6 flex items-center justify-between">
      <div class="flex items-center space-x-4">
        <label for="time-range" class="text-sm font-medium text-gray-700">
          Período:
        </label>
        <select
          id="time-range"
          v-model="selectedTimeRange"
          class="text-sm border border-gray-300 rounded-md px-3 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          :aria-label="'Selecionar período de visualização: ' + selectedTimeRange"
          @change="updateTimeRange"
        >
          <option value="3m">Últimos 3 meses</option>
          <option value="6m">Últimos 6 meses</option>
          <option value="1y">Último ano</option>
          <option value="all">Todo o período</option>
        </select>
      </div>
      
      <div class="text-sm text-gray-600">
        {{ filteredData.length }} períodos
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { useFiltersStore } from '@/store/filters'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

const filtersStore = useFiltersStore()

// Reactive state
const selectedTimeRange = ref('all')

// Computed properties
const comboChartData = computed(() => filtersStore.comboChartData)

const filteredData = computed(() => {
  const data = comboChartData.value
  if (selectedTimeRange.value === 'all') return data
  
  const ranges = {
    '3m': 3,
    '6m': 6,
    '1y': 12
  }
  
  const months = ranges[selectedTimeRange.value as keyof typeof ranges] || 12
  return data.slice(-months)
})

const chartData = computed(() => ({
  labels: filteredData.value.map(item => item.month),
  datasets: [
    {
      label: 'Valor Médio',
      data: filteredData.value.map(item => item.averageValue),
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      borderWidth: 3,
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#3b82f6',
      pointBorderColor: '#ffffff',
      pointBorderWidth: 2,
      pointRadius: 6,
      pointHoverRadius: 8,
      yAxisID: 'y',
    },
    {
      label: 'Desvio Médio',
      data: filteredData.value.map(item => item.averageDeviation),
      borderColor: '#f59e0b',
      backgroundColor: 'rgba(245, 158, 11, 0.1)',
      borderWidth: 3,
      fill: false,
      tension: 0.4,
      pointBackgroundColor: '#f59e0b',
      pointBorderColor: '#ffffff',
      pointBorderWidth: 2,
      pointRadius: 6,
      pointHoverRadius: 8,
      yAxisID: 'y1',
    },
  ],
}))

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: 'index' as const,
    intersect: false,
  },
  plugins: {
    legend: {
      display: false, // We use custom legend
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      titleColor: '#ffffff',
      bodyColor: '#ffffff',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      cornerRadius: 8,
      displayColors: true,
      callbacks: {
        label: (context: any) => {
          const label = context.dataset.label || ''
          const value = context.parsed.y
          
          if (label === 'Valor Médio') {
            return `${label}: ${formatCurrency(value)}`
          }
          
          return `${label}: ${value.toFixed(1)}`
        },
      },
    },
  },
  scales: {
    x: {
      display: true,
      title: {
        display: true,
        text: 'Período',
        color: '#6b7280',
        font: {
          size: 12,
          weight: '500' as const,
        },
      },
      grid: {
        display: true,
        color: 'rgba(229, 231, 235, 0.5)',
      },
      ticks: {
        color: '#6b7280',
        font: {
          size: 11,
        },
      },
    },
    y: {
      type: 'linear' as const,
      display: true,
      position: 'left' as const,
      title: {
        display: true,
        text: 'Valor Médio (R$)',
        color: '#6b7280',
        font: {
          size: 12,
          weight: '500' as const,
        },
      },
      grid: {
        display: true,
        color: 'rgba(229, 231, 235, 0.5)',
      },
      ticks: {
        color: '#6b7280',
        font: {
          size: 11,
        },
        callback: (value: any) => formatCurrency(value),
      },
    },
    y1: {
      type: 'linear' as const,
      display: true,
      position: 'right' as const,
      title: {
        display: true,
        text: 'Desvio Médio',
        color: '#6b7280',
        font: {
          size: 12,
          weight: '500' as const,
        },
      },
      grid: {
        drawOnChartArea: false,
      },
      ticks: {
        color: '#6b7280',
        font: {
          size: 11,
        },
        callback: (value: any) => value.toFixed(0),
      },
    },
  },
}))

// Statistics
const averageValue = computed(() => {
  const values = filteredData.value.map(item => item.averageValue)
  return values.reduce((sum, value) => sum + value, 0) / values.length
})

const averageDeviation = computed(() => {
  const deviations = filteredData.value.map(item => item.averageDeviation)
  return deviations.reduce((sum, deviation) => sum + deviation, 0) / deviations.length
})

const trendDirection = computed(() => {
  const data = filteredData.value
  if (data.length < 2) return { value: 'Insuficiente', deviation: 'Insuficiente' }
  
  const firstValue = data[0].averageValue
  const lastValue = data[data.length - 1].averageValue
  const valueChange = ((lastValue - firstValue) / firstValue) * 100
  
  const firstDeviation = data[0].averageDeviation
  const lastDeviation = data[data.length - 1].averageDeviation
  const deviationChange = ((lastDeviation - firstDeviation) / Math.abs(firstDeviation)) * 100
  
  return {
    value: valueChange > 0 ? `↗ +${valueChange.toFixed(1)}%` : 
           valueChange < 0 ? `↘ ${valueChange.toFixed(1)}%` : '→ 0%',
    deviation: deviationChange > 0 ? `↗ +${deviationChange.toFixed(1)}%` :
               deviationChange < 0 ? `↘ ${deviationChange.toFixed(1)}%` : '→ 0%'
  }
})

// Helper functions
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value)
}

const updateTimeRange = () => {
  // Trigger reactivity update - time range changed
}
</script>

<style scoped>
/* Ensure chart container has proper dimensions */
.h-80 {
  height: 20rem;
}

/* Custom select styling */
select:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}
</style>
