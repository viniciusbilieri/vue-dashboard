<!--
  Revenue Distribution Chart Component
  Doughnut chart displaying revenue distribution by product using Chart.js
-->
<template>
  <div class="bg-white rounded-lg shadow-md p-6">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h3 class="text-lg font-semibold text-gray-900">Distribuição de Receita</h3>
        <p class="text-sm text-gray-600">Participação de cada produto na receita total</p>
      </div>
      <div class="flex items-center space-x-2">
        <i class="pi pi-chart-pie text-indigo-500 text-xl" aria-hidden="true"></i>
        <span class="text-sm text-gray-500">Doughnut</span>
      </div>
    </div>

    <div class="flex items-center justify-center h-80">
      <div class="w-64 h-64">
        <Doughnut
          :data="chartData"
          :options="chartOptions as any"
          :aria-label="'Gráfico de distribuição de receita por produto'"
        />
      </div>
    </div>

    <!-- Revenue Summary -->
    <div class="mt-6 bg-indigo-50 rounded-lg p-4">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-indigo-600">Receita Total</p>
          <p class="text-2xl font-bold text-indigo-900">
            R$ {{ totalRevenue.toLocaleString('pt-BR') }}
          </p>
        </div>
        <div class="text-right">
          <p class="text-sm text-indigo-600">Maior Participação</p>
          <p class="text-lg font-bold text-indigo-900">{{ topRevenueProduct }}</p>
          <p class="text-xs text-indigo-500">{{ topRevenuePercentage }}%</p>
        </div>
      </div>
    </div>

    <!-- Product Legend -->
    <div class="mt-6 grid grid-cols-1 gap-2">
      <div
        v-for="product in productList"
        :key="product.product"
        class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
      >
        <div class="flex items-center space-x-3">
          <div
            class="w-4 h-4 rounded-full"
            :style="{ backgroundColor: product.color }"
            :aria-label="'Cor do produto ' + product.product"
          ></div>
          <span class="text-sm font-medium text-gray-900">{{ product.product }}</span>
        </div>
        <div class="text-right">
          <p class="text-sm font-bold text-gray-900">
            R$ {{ product.revenue.toLocaleString('pt-BR') }}
          </p>
          <p class="text-xs text-gray-500">{{ product.percentage }}%</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Doughnut } from 'vue-chartjs'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { MockDataService } from '@/services/mockData'
import type { ChartData } from '@/types'

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend)

// Get revenue distribution data
const revenueData = MockDataService.getRevenueDistributionData()

// Calculate totals and percentages
const totalRevenue = computed(() =>
  revenueData.datasets[0].data.reduce((sum: number, value: number) => sum + value, 0)
)

const productList = computed(() => {
  const products = revenueData.labels
  const revenues = revenueData.datasets[0].data
  const colors = revenueData.datasets[0].backgroundColor as string[]

  return products.map((product: string, index: number) => ({
    product,
    revenue: revenues[index],
    percentage: ((revenues[index] / totalRevenue.value) * 100).toFixed(1),
    color: colors[index],
  }))
})

const topRevenueProduct = computed(() => {
  const top = productList.value.reduce((top: any, current: any) =>
    current.revenue > top.revenue ? current : top
  )
  return top.product
})

const topRevenuePercentage = computed(() => {
  const top = productList.value.reduce((top: any, current: any) =>
    current.revenue > top.revenue ? current : top
  )
  return top.percentage
})

// Chart data configuration
const chartData = computed<ChartData>(() => revenueData)

// Chart options
const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  cutout: '60%',
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
          const label = context.label || ''
          const value = context.parsed
          const percentage = ((value / totalRevenue.value) * 100).toFixed(1)

          return [`${label}: R$ ${value.toLocaleString('pt-BR')}`, `Participação: ${percentage}%`]
        },
      },
    },
  },
  elements: {
    arc: {
      borderWidth: 3,
      borderColor: '#ffffff',
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
