<!--
  Category by Deviation Bar Chart Component
  Shows deviation distribution by category using Chart.js
-->
<template>
  <div class="bg-white rounded-lg shadow-md p-6">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h3 class="text-lg font-semibold text-gray-900">Desvios por Categoria</h3>
        <p class="text-sm text-gray-600">Distribuição de desvios por categoria de produto</p>
      </div>
      <div class="flex items-center space-x-2">
        <i class="pi pi-chart-bar text-blue-500 text-xl" aria-hidden="true"></i>
        <span class="text-sm text-gray-500">Barras</span>
      </div>
    </div>

    <div class="h-80">
      <Bar
        :data="chartData"
        :options="chartOptions as any"
        :aria-label="'Gráfico de desvios por categoria mostrando ' + chartData.datasets.length + ' tipos de desvio'"
      />
    </div>

    <!-- Chart Legend -->
    <div class="mt-4 flex justify-center">
      <div class="flex items-center space-x-4 text-sm">
        <div class="flex items-center space-x-2">
          <div class="w-3 h-3 bg-red-500 rounded-full" aria-hidden="true"></div>
          <span class="text-gray-600">Negativo</span>
        </div>
        <div class="flex items-center space-x-2">
          <div class="w-3 h-3 bg-green-500 rounded-full" aria-hidden="true"></div>
          <span class="text-gray-600">Neutro</span>
        </div>
        <div class="flex items-center space-x-2">
          <div class="w-3 h-3 bg-blue-500 rounded-full" aria-hidden="true"></div>
          <span class="text-gray-600">Positivo</span>
        </div>
      </div>
    </div>

    <!-- Summary Statistics -->
    <div class="mt-6 grid grid-cols-3 gap-4">
      <div class="text-center">
        <p class="text-2xl font-bold text-red-600">
          {{ totalNegative }}
        </p>
        <p class="text-sm text-gray-600">Desvios Negativos</p>
      </div>
      <div class="text-center">
        <p class="text-2xl font-bold text-green-600">
          {{ totalNeutral }}
        </p>
        <p class="text-sm text-gray-600">Desvios Neutros</p>
      </div>
      <div class="text-center">
        <p class="text-2xl font-bold text-blue-600">
          {{ totalPositive }}
        </p>
        <p class="text-sm text-gray-600">Desvios Positivos</p>
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
const categoryDeviationData = computed(() => filtersStore.categoryDeviationData)

const chartData = computed(() => ({
  labels: categoryDeviationData.value.map(item => item.category),
  datasets: [
    {
      label: 'Negativo',
      data: categoryDeviationData.value.map(item => item.negative),
      backgroundColor: '#ef4444',
      borderColor: '#dc2626',
      borderWidth: 1,
      borderRadius: 4,
    },
    {
      label: 'Neutro',
      data: categoryDeviationData.value.map(item => item.neutral),
      backgroundColor: '#10b981',
      borderColor: '#059669',
      borderWidth: 1,
      borderRadius: 4,
    },
    {
      label: 'Positivo',
      data: categoryDeviationData.value.map(item => item.positive),
      backgroundColor: '#3b82f6',
      borderColor: '#2563eb',
      borderWidth: 1,
      borderRadius: 4,
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
          const category = context.label
          const total = categoryDeviationData.value.find(item => item.category === category)?.total || 0
          const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0'
          
          return [
            `${label}: ${value}`,
            `Total na categoria: ${total}`,
            `Percentual: ${percentage}%`
          ]
        },
      },
    },
  },
  scales: {
    x: {
      display: true,
      title: {
        display: true,
        text: 'Categorias',
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

// Summary statistics
const totalNegative = computed(() => 
  categoryDeviationData.value.reduce((sum, item) => sum + item.negative, 0)
)

const totalNeutral = computed(() => 
  categoryDeviationData.value.reduce((sum, item) => sum + item.neutral, 0)
)

const totalPositive = computed(() => 
  categoryDeviationData.value.reduce((sum, item) => sum + item.positive, 0)
)
</script>

<style scoped>
/* Ensure chart container has proper dimensions */
.h-80 {
  height: 20rem;
}
</style>

