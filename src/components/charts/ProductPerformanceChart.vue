<!--
  Product Performance Chart Component
  Bar chart displaying product sales performance using Chart.js
-->
<template>
  <div class="bg-white rounded-lg shadow-md p-6">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h3 class="text-lg font-semibold text-gray-900">Performance de Produtos</h3>
        <p class="text-sm text-gray-600">Vendas por produto no período</p>
      </div>
      <div class="flex items-center space-x-2">
        <i class="pi pi-chart-bar text-green-500 text-xl" aria-hidden="true"></i>
        <span class="text-sm text-gray-500">Barras</span>
      </div>
    </div>

    <div class="h-80">
      <Bar
        :data="chartData"
        :options="chartOptions as any"
        :aria-label="
          'Gráfico de performance de produtos mostrando ' + chartData.datasets.length + ' métricas'
        "
      />
    </div>

    <!-- Chart Legend -->
    <div class="mt-4 flex justify-center">
      <div class="flex items-center space-x-4 text-sm">
        <div class="flex items-center space-x-2">
          <div class="w-3 h-3 bg-green-500 rounded-full" aria-hidden="true"></div>
          <span class="text-gray-600">Vendas</span>
        </div>
        <div class="flex items-center space-x-2">
          <div class="w-3 h-3 bg-blue-500 rounded-full" aria-hidden="true"></div>
          <span class="text-gray-600">Receita (R$)</span>
        </div>
      </div>
    </div>

    <!-- Top Performer -->
    <div class="mt-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-gray-600">Produto em Destaque</p>
          <p class="text-lg font-bold text-gray-900">{{ topProduct.product }}</p>
          <p class="text-sm text-green-600">+{{ topProduct.growth }}% de crescimento</p>
        </div>
        <div class="text-right">
          <p class="text-2xl font-bold text-green-600">
            {{ topProduct.sales.toLocaleString('pt-BR') }}
          </p>
          <p class="text-xs text-gray-500">vendas</p>
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
import { MockDataService } from '@/services/mockData'
import type { ChartData } from '@/types'

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

// Get product performance data
const productData = MockDataService.getProductPerformanceData()

// Find top performing product
const topProduct = computed(() =>
  productData.reduce((top, current) => (current.sales > top.sales ? current : top))
)

// Chart data configuration
const chartData = computed<ChartData>(() => ({
  labels: productData.map((item) => item.product),
  datasets: [
    {
      label: 'Vendas',
      data: productData.map((item) => item.sales),
      backgroundColor: [
        'rgba(34, 197, 94, 0.8)',
        'rgba(34, 197, 94, 0.6)',
        'rgba(34, 197, 94, 0.8)',
        'rgba(34, 197, 94, 0.6)',
        'rgba(34, 197, 94, 0.8)',
      ],
      borderColor: ['#22c55e', '#16a34a', '#22c55e', '#16a34a', '#22c55e'],
      borderWidth: 2,
      borderRadius: 6,
      borderSkipped: false,
    },
    {
      label: 'Receita (R$)',
      data: productData.map((item) => item.revenue / 1000), // Convert to thousands
      backgroundColor: [
        'rgba(59, 130, 246, 0.8)',
        'rgba(59, 130, 246, 0.6)',
        'rgba(59, 130, 246, 0.8)',
        'rgba(59, 130, 246, 0.6)',
        'rgba(59, 130, 246, 0.8)',
      ],
      borderColor: ['#3b82f6', '#2563eb', '#3b82f6', '#2563eb', '#3b82f6'],
      borderWidth: 2,
      borderRadius: 6,
      borderSkipped: false,
      yAxisID: 'y1',
    },
  ],
}))

// Chart options
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

          if (label === 'Receita (R$)') {
            return `${label}: R$ ${(value * 1000).toLocaleString('pt-BR')}`
          }

          return `${label}: ${value.toLocaleString('pt-BR')}`
        },
      },
    },
  },
  scales: {
    x: {
      display: true,
      title: {
        display: true,
        text: 'Produtos',
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
      type: 'linear' as const,
      display: true,
      position: 'left' as const,
      title: {
        display: true,
        text: 'Vendas',
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
    },
    y1: {
      type: 'linear' as const,
      display: true,
      position: 'right' as const,
      title: {
        display: true,
        text: 'Receita (mil R$)',
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
        callback: (value: any) => `R$ ${value}k`,
      },
    },
  },
}))
</script>

<style scoped>
/* Ensure chart container has proper dimensions */
.h-80 {
  height: 20rem;
}
</style>
