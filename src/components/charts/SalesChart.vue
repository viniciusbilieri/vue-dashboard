<!--
  Sales Chart Component
  Line chart displaying sales data over time using Chart.js
-->
<template>
  <div class="bg-white rounded-lg shadow-md p-6">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h3 class="text-lg font-semibold text-gray-900">Vendas Mensais</h3>
        <p class="text-sm text-gray-600">Evolução das vendas ao longo do tempo</p>
      </div>
      <div class="flex items-center space-x-2">
        <i class="pi pi-chart-line text-blue-500 text-xl" aria-hidden="true"></i>
        <span class="text-sm text-gray-500">Linha</span>
      </div>
    </div>

    <div class="h-80">
      <Line
        :data="chartData"
        :options="chartOptions as any"
        :aria-label="
          'Gráfico de vendas mensais mostrando ' +
          chartData.datasets[0].data.length +
          ' pontos de dados'
        "
      />
    </div>

    <!-- Chart Legend -->
    <div class="mt-4 flex justify-center">
      <div class="flex items-center space-x-4 text-sm">
        <div class="flex items-center space-x-2">
          <div class="w-3 h-3 bg-blue-500 rounded-full" aria-hidden="true"></div>
          <span class="text-gray-600">Vendas</span>
        </div>
        <div class="flex items-center space-x-2">
          <div class="w-3 h-3 bg-green-500 rounded-full" aria-hidden="true"></div>
          <span class="text-gray-600">Receita</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
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
import { MockDataService } from '@/services/mockData'
import type { ChartData } from '@/types'

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

// Get sales data
const salesData = MockDataService.getSalesData()

// Chart data configuration
const chartData = computed<ChartData>(() => ({
  labels: salesData.map((item) => item.month),
  datasets: [
    {
      label: 'Vendas',
      data: salesData.map((item) => item.sales),
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
    },
    {
      label: 'Receita (R$)',
      data: salesData.map((item) => item.revenue / 1000), // Convert to thousands
      borderColor: '#10b981',
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      borderWidth: 3,
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#10b981',
      pointBorderColor: '#ffffff',
      pointBorderWidth: 2,
      pointRadius: 6,
      pointHoverRadius: 8,
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
        text: 'Mês',
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
