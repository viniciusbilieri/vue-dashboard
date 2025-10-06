<!--
  Area by Deviation Bar Chart Component
  Shows deviation distribution by area using Chart.js
-->
<template>
  <div class="bg-white rounded-lg shadow-md p-6">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h3 class="text-lg font-semibold text-gray-900">Desvios por Área</h3>
        <p class="text-sm text-gray-600">Distribuição de desvios e valores por área geográfica</p>
      </div>
      <div class="flex items-center space-x-2">
        <i class="pi pi-chart-bar text-indigo-500 text-xl" aria-hidden="true"></i>
        <span class="text-sm text-gray-500">Barras</span>
      </div>
    </div>

    <div class="h-80">
      <Bar
        :data="chartData"
        :options="chartOptions as any"
        :aria-label="'Gráfico de desvios por área mostrando distribuição por área geográfica'"
      />
    </div>

    <!-- Chart Legend -->
    <div class="mt-4 flex justify-center">
      <div class="flex items-center space-x-4 text-sm">
        <div class="flex items-center space-x-2">
          <div class="w-3 h-3 bg-red-500 rounded-full" aria-hidden="true"></div>
          <span class="text-gray-600">Desvios Negativos</span>
        </div>
        <div class="flex items-center space-x-2">
          <div class="w-3 h-3 bg-green-500 rounded-full" aria-hidden="true"></div>
          <span class="text-gray-600">Desvios Neutros</span>
        </div>
        <div class="flex items-center space-x-2">
          <div class="w-3 h-3 bg-blue-500 rounded-full" aria-hidden="true"></div>
          <span class="text-gray-600">Desvios Positivos</span>
        </div>
      </div>
    </div>

    <!-- Area Statistics -->
    <div class="mt-6 grid grid-cols-2 gap-4">
      <div class="bg-indigo-50 rounded-lg p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-indigo-600">Área com Maior Volume</p>
            <p class="text-lg font-bold text-indigo-900">{{ topAreaByVolume.area }}</p>
            <p class="text-xs text-indigo-600">
              {{ topAreaByVolume.totalRecords }} registros
            </p>
          </div>
          <i class="pi pi-map-marker text-indigo-500 text-2xl" aria-hidden="true"></i>
        </div>
      </div>

      <div class="bg-green-50 rounded-lg p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-green-600">Área com Melhor Performance</p>
            <p class="text-lg font-bold text-green-900">{{ topAreaByPerformance.area }}</p>
            <p class="text-xs text-green-600">
              R$ {{ topAreaByPerformance.averageValue.toLocaleString('pt-BR') }} médio
            </p>
          </div>
          <i class="pi pi-trophy text-green-500 text-2xl" aria-hidden="true"></i>
        </div>
      </div>
    </div>

    <!-- Detailed Area Breakdown -->
    <div class="mt-6">
      <h4 class="text-sm font-medium text-gray-900 mb-3">Detalhamento por Área</h4>
      <div class="space-y-2">
        <div
          v-for="area in areaDeviationData"
          :key="area.area"
          class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
        >
          <div class="flex items-center space-x-3">
            <div class="w-3 h-3 rounded-full" :style="{ backgroundColor: getAreaColor(area.area) }"></div>
            <span class="font-medium text-gray-900">{{ area.area }}</span>
          </div>
          <div class="flex items-center space-x-6 text-sm">
            <div class="text-center">
              <p class="text-gray-500">Registros</p>
              <p class="font-semibold text-gray-900">{{ area.totalRecords }}</p>
            </div>
            <div class="text-center">
              <p class="text-gray-500">Valor Médio</p>
              <p class="font-semibold text-gray-900">
                R$ {{ area.averageValue.toLocaleString('pt-BR') }}
              </p>
            </div>
            <div class="text-center">
              <p class="text-gray-500">Desvios +</p>
              <p class="font-semibold text-blue-600">{{ area.positive }}</p>
            </div>
            <div class="text-center">
              <p class="text-gray-500">Desvios -</p>
              <p class="font-semibold text-red-600">{{ area.negative }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { useFiltersStore } from '@/store/filters'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

const filtersStore = useFiltersStore()

// Computed properties
const areaDeviationData = computed(() => filtersStore.areaDeviationData)

const chartData = computed(() => ({
  labels: areaDeviationData.value.map(item => item.area),
  datasets: [
    {
      label: 'Desvios Negativos',
      data: areaDeviationData.value.map(item => item.negative),
      backgroundColor: '#ef4444',
      borderColor: '#dc2626',
      borderWidth: 1,
      borderRadius: 4,
      borderSkipped: false,
    },
    {
      label: 'Desvios Neutros',
      data: areaDeviationData.value.map(item => item.neutral),
      backgroundColor: '#10b981',
      borderColor: '#059669',
      borderWidth: 1,
      borderRadius: 4,
      borderSkipped: false,
    },
    {
      label: 'Desvios Positivos',
      data: areaDeviationData.value.map(item => item.positive),
      backgroundColor: '#3b82f6',
      borderColor: '#2563eb',
      borderWidth: 1,
      borderRadius: 4,
      borderSkipped: false,
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
          const area = context.label
          const areaData = areaDeviationData.value.find(item => item.area === area)
          
          if (areaData) {
            const percentage = ((value / areaData.totalRecords) * 100).toFixed(1)
            return [
              `${label}: ${value}`,
              `Total na área: ${areaData.totalRecords}`,
              `Percentual: ${percentage}%`,
              `Valor médio: R$ ${areaData.averageValue.toLocaleString('pt-BR')}`
            ]
          }
          
          return `${label}: ${value}`
        },
      },
    },
  },
  scales: {
    x: {
      display: true,
      title: {
        display: true,
        text: 'Áreas',
        color: '#6b7280',
        font: {
          size: 12,
          weight: '500' as const,
        },
      },
      grid: {
        display: false,
      },
      ticks: {
        color: '#6b7280',
        font: {
          size: 11,
        },
      },
    },
    y: {
      display: true,
      title: {
        display: true,
        text: 'Quantidade',
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
        callback: (value: any) => value.toLocaleString('pt-BR'),
      },
      beginAtZero: true,
    },
  },
}))

// Area statistics
const topAreaByVolume = computed(() => {
  const sorted = [...areaDeviationData.value].sort((a, b) => b.totalRecords - a.totalRecords)
  return sorted[0] || { area: 'N/A', totalRecords: 0 }
})

const topAreaByPerformance = computed(() => {
  const sorted = [...areaDeviationData.value].sort((a, b) => b.averageValue - a.averageValue)
  return sorted[0] || { area: 'N/A', averageValue: 0 }
})

// Helper function for area colors
const getAreaColor = (area: string): string => {
  const colors = {
    'North': '#3b82f6',
    'South': '#10b981',
    'East': '#f59e0b',
    'West': '#ef4444',
    'Central': '#8b5cf6'
  }
  return colors[area as keyof typeof colors] || '#6b7280'
}
</script>

<style scoped>
/* Ensure chart container has proper dimensions */
.h-80 {
  height: 20rem;
}

/* Custom hover effects */
.hover\:bg-gray-100:hover {
  background-color: #f3f4f6;
}

/* Smooth transitions */
.transition-colors {
  transition-property: background-color, border-color, color, fill, stroke;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}
</style>
