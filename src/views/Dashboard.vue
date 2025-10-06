<!--
  Dashboard Main View
  Integrates all dashboard components: filters, charts, and data table
-->
<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center space-x-4">
            <div class="flex items-center space-x-2">
              <i class="pi pi-chart-bar text-blue-600 text-2xl" aria-hidden="true"></i>
              <h1 class="text-xl font-bold text-gray-900">Dashboard Analytics</h1>
            </div>
          </div>

          <div class="flex items-center space-x-4">
            <div class="flex items-center space-x-2 text-sm text-gray-600">
              <i class="pi pi-clock" aria-hidden="true"></i>
              <span>{{ currentTime }}</span>
            </div>

            <Button
              icon="pi pi-refresh"
              label="Atualizar"
              size="small"
              severity="secondary"
              @click="refreshData"
              :aria-label="'Atualizar dados do dashboard'"
            />
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <div class="flex">
      <!-- Sidebar Filters -->
      <SidebarFilters :filters="filters" @update:filters="updateFilters" class="flex-shrink-0" />

      <!-- Dashboard Content -->
      <main class="flex-1 p-6">
        <div class="max-w-7xl mx-auto">
          <!-- Loading State -->
          <div v-if="loading" class="flex items-center justify-center h-64">
            <div class="flex items-center space-x-3">
              <ProgressSpinner
                style="width: 40px; height: 40px"
                stroke-width="4"
                aria-label="Carregando dados do dashboard"
              />
              <span class="text-gray-600">Carregando dados...</span>
            </div>
          </div>

          <!-- Dashboard Grid -->
          <div v-else class="space-y-6">
            <!-- Charts Grid -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <!-- Sales Chart -->
              <div class="lg:col-span-1">
                <SalesChart />
              </div>

              <!-- User Activity Chart -->
              <div class="lg:col-span-1">
                <UserActivityChart />
              </div>

              <!-- Product Performance Chart -->
              <div class="lg:col-span-1">
                <ProductPerformanceChart />
              </div>

              <!-- Revenue Distribution Chart -->
              <div class="lg:col-span-1">
                <RevenueDistributionChart />
              </div>
            </div>

            <!-- Data Table -->
            <div class="mt-8">
              <DataTable
                :filters="filters"
                @view-details="handleViewDetails"
                @print-transaction="handlePrintTransaction"
              />
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- Transaction Details Dialog -->
    <Dialog
      v-model:visible="showDetailsDialog"
      modal
      header="Detalhes da Transação"
      :style="{ width: '600px' }"
      :aria-label="'Dialog com detalhes da transação selecionada'"
    >
      <div v-if="selectedTransaction" class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">ID</label>
            <p class="text-gray-900">{{ selectedTransaction.id }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Data</label>
            <p class="text-gray-900">{{ formatDate(selectedTransaction.date) }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Cliente</label>
            <p class="text-gray-900">{{ selectedTransaction.customer }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Produto</label>
            <p class="text-gray-900">{{ selectedTransaction.product }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Valor</label>
            <p class="text-gray-900 font-semibold">
              R$ {{ selectedTransaction.amount.toLocaleString('pt-BR') }}
            </p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Status</label>
            <Tag
              :value="getStatusLabel(selectedTransaction.status)"
              :severity="getStatusSeverity(selectedTransaction.status)"
            />
          </div>
        </div>
      </div>

      <template #footer>
        <Button
          label="Fechar"
          icon="pi pi-times"
          severity="secondary"
          @click="showDetailsDialog = false"
        />
      </template>
    </Dialog>

    <!-- Toast for notifications -->
    <Toast />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import Tag from 'primevue/tag'
import Toast from 'primevue/toast'
import ProgressSpinner from 'primevue/progressspinner'
import { useToast } from 'primevue/usetoast'

import SidebarFilters from '@/components/filters/SidebarFilters.vue'
import SalesChart from '@/components/charts/SalesChart.vue'
import UserActivityChart from '@/components/charts/UserActivityChart.vue'
import ProductPerformanceChart from '@/components/charts/ProductPerformanceChart.vue'
import RevenueDistributionChart from '@/components/charts/RevenueDistributionChart.vue'
import DataTable from '@/components/DataTable.vue'

import type { FilterOptions, TableRow } from '@/types'

// Reactive state
const loading = ref(false)
const currentTime = ref('')
const showDetailsDialog = ref(false)
const selectedTransaction = ref<TableRow | null>(null)

const toast = useToast()

// Filters state
const filters = reactive<FilterOptions>({
  dateRange: {
    start: new Date('2024-01-01'),
    end: new Date('2024-12-31'),
  },
  category: 'all',
  status: 'all',
})

// Time update interval
let timeInterval: ReturnType<typeof setInterval>

// Lifecycle hooks
onMounted(() => {
  updateTime()
  timeInterval = setInterval(updateTime, 1000)
})

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval)
  }
})

// Methods
const updateTime = () => {
  currentTime.value = new Date().toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const updateFilters = (newFilters: FilterOptions) => {
  filters.dateRange = { ...newFilters.dateRange }
  filters.category = newFilters.category
  filters.status = newFilters.status

  toast.add({
    severity: 'info',
    summary: 'Filtros Atualizados',
    detail: 'Os dados foram filtrados com base nas novas configurações',
    life: 3000,
  })
}

const refreshData = () => {
  loading.value = true

  // Simulate API call
  setTimeout(() => {
    loading.value = false
    toast.add({
      severity: 'success',
      summary: 'Dados Atualizados',
      detail: 'Os dados do dashboard foram atualizados com sucesso',
      life: 3000,
    })
  }, 1000)
}

const handleViewDetails = (transaction: TableRow) => {
  selectedTransaction.value = transaction
  showDetailsDialog.value = true
}

const handlePrintTransaction = (transaction: TableRow) => {
  // Simulate print functionality
  toast.add({
    severity: 'info',
    summary: 'Impressão',
    detail: `Transação ${transaction.id} enviada para impressão`,
    life: 3000,
  })
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const getStatusLabel = (status: string): string => {
  const labels = {
    completed: 'Concluído',
    pending: 'Pendente',
    cancelled: 'Cancelado',
  }
  return labels[status as keyof typeof labels] || status
}

const getStatusSeverity = (
  status: string
): 'success' | 'warning' | 'danger' | 'info' | 'secondary' => {
  const severities = {
    completed: 'success' as const,
    pending: 'warning' as const,
    cancelled: 'danger' as const,
  }
  return severities[status as keyof typeof severities] || 'secondary'
}
</script>

<style scoped>
/* Custom styles for dashboard layout */
.min-h-screen {
  min-height: 100vh;
}

/* Ensure proper scrolling */
main {
  overflow-y: auto;
  max-height: calc(100vh - 64px); /* Subtract header height */
}

/* Custom scrollbar for main content */
main::-webkit-scrollbar {
  width: 6px;
}

main::-webkit-scrollbar-track {
  background: #f1f1f1;
}

main::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

main::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>
