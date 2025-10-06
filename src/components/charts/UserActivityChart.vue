<!--
  User Activity Chart Component
  Area chart displaying user activity data over 24 hours using Chart.js
-->
<template>
  <div class="bg-white rounded-lg shadow-md p-6">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h3 class="text-lg font-semibold text-gray-900">Atividade de Usuários</h3>
        <p class="text-sm text-gray-600">Usuários ativos por hora do dia</p>
      </div>
      <div class="flex items-center space-x-2">
        <i class="pi pi-users text-purple-500 text-xl" aria-hidden="true"></i>
        <span class="text-sm text-gray-500">Área</span>
      </div>
    </div>

    <div class="h-80">
      <Line
        :data="chartData"
        :options="chartOptions as any"
        :aria-label="'Gráfico de atividade de usuários mostrando dados de 24 horas'"
      />
    </div>

    <!-- Chart Legend -->
    <div class="mt-4 flex justify-center">
      <div class="flex items-center space-x-4 text-sm">
        <div class="flex items-center space-x-2">
          <div class="w-3 h-3 bg-purple-500 rounded-full" aria-hidden="true"></div>
          <span class="text-gray-600">Usuários Ativos</span>
        </div>
        <div class="flex items-center space-x-2">
          <div class="w-3 h-3 bg-orange-500 rounded-full" aria-hidden="true"></div>
          <span class="text-gray-600">Sessões</span>
        </div>
      </div>
    </div>

    <!-- Statistics Cards -->
    <div class="grid grid-cols-2 gap-4 mt-6">
      <div class="bg-purple-50 rounded-lg p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-purple-600">Pico de Usuários</p>
            <p class="text-2xl font-bold text-purple-900">
              {{ maxActiveUsers.toLocaleString('pt-BR') }}
            </p>
            <p class="text-xs text-purple-600">às {{ peakHour }}h</p>
          </div>
          <i class="pi pi-chart-bar text-purple-500 text-2xl" aria-hidden="true"></i>
        </div>
      </div>

      <div class="bg-orange-50 rounded-lg p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-orange-600">Total de Sessões</p>
            <p class="text-2xl font-bold text-orange-900">
              {{ totalSessions.toLocaleString('pt-BR') }}
            </p>
            <p class="text-xs text-orange-600">últimas 24h</p>
          </div>
          <i class="pi pi-clock text-orange-500 text-2xl" aria-hidden="true"></i>
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

// Get user activity data
const userActivityData = MockDataService.getUserActivityData()

// Calculate statistics
const maxActiveUsers = computed(() => Math.max(...userActivityData.map((d) => d.activeUsers)))

const peakHour = computed(() => {
  const maxIndex = userActivityData.findIndex((d) => d.activeUsers === maxActiveUsers.value)
  return userActivityData[maxIndex]?.hour || 0
})

const totalSessions = computed(() => userActivityData.reduce((sum, d) => sum + d.sessions, 0))

// Chart data configuration
const chartData = computed<ChartData>(() => ({
  labels: userActivityData.map((item) => `${item.hour}h`),
  datasets: [
    {
      label: 'Usuários Ativos',
      data: userActivityData.map((item) => item.activeUsers),
      borderColor: '#8b5cf6',
      backgroundColor: 'rgba(139, 92, 246, 0.2)',
      borderWidth: 2,
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#8b5cf6',
      pointBorderColor: '#ffffff',
      pointBorderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6,
    },
    {
      label: 'Sessões',
      data: userActivityData.map((item) => item.sessions),
      borderColor: '#f59e0b',
      backgroundColor: 'rgba(245, 158, 11, 0.2)',
      borderWidth: 2,
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#f59e0b',
      pointBorderColor: '#ffffff',
      pointBorderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6,
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
        text: 'Hora do Dia',
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
          size: 10,
        },
        maxTicksLimit: 12,
      },
    },
    y: {
      type: 'linear' as const,
      display: true,
      position: 'left' as const,
      title: {
        display: true,
        text: 'Usuários Ativos',
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
        text: 'Sessões',
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
        callback: (value: any) => value.toLocaleString('pt-BR'),
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
