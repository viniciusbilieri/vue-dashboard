<!--
  Main Dashboard Page
  Analytics dashboard with KPI cards, charts, and data table
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
              <h1 class="text-xl font-bold text-gray-900">Analytics Dashboard</h1>
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
      <aside class="w-80 bg-white shadow-lg border-r border-gray-200 p-6">
        <FilterPanel
          :filters="filtersStore.filters"
          :filter-options="filtersStore.filterOptions"
          @update:filters="updateFilters"
          @reset="resetFilters"
        />
      </aside>

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
            <!-- KPI Cards -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <KpiCard
                title="Total de Registros"
                :value="filtersStore.kpiData.totalRecords"
                format="number"
                icon="pi pi-database"
                color="blue"
                :subtitle="`${filtersStore.kpiData.activeRecords} ativos`"
              />
              
              <KpiCard
                title="Registros Ativos"
                :value="filtersStore.kpiData.activeRecords"
                format="number"
                icon="pi pi-check-circle"
                color="green"
                :change="getActiveRecordsChange()"
                :subtitle="`${getActiveRecordsPercentage}% do total`"
              />
              
              <KpiCard
                title="Valor Médio"
                :value="filtersStore.kpiData.averageValue"
                format="currency"
                icon="pi pi-dollar"
                color="purple"
                :change="getAverageValueChange()"
              />
              
              <KpiCard
                title="Desvio Total"
                :value="filtersStore.kpiData.totalDeviation"
                format="number"
                icon="pi pi-chart-line"
                color="yellow"
                :change="getDeviationChange()"
              />
            </div>

            <!-- Charts Grid -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <!-- Category Deviation Bar Chart -->
              <div class="lg:col-span-1">
                <CategoryByDeviationBar />
              </div>

              <!-- Person Heatmap -->
              <div class="lg:col-span-1">
                <HeatmapPerson />
              </div>

              <!-- Deviations Combo Chart -->
              <div class="lg:col-span-1">
                <DeviationsCombo />
              </div>

              <!-- Area Deviation Bar Chart -->
              <div class="lg:col-span-1">
                <AreaByDeviationBar />
              </div>
            </div>

            <!-- Data Table -->
            <div class="mt-8">
              <RecordsTable
                @view-details="handleViewDetails"
                @edit-record="handleEditRecord"
                @delete-record="handleDeleteRecord"
                @export-data="handleExportData"
              />
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- Record Details Dialog -->
    <Dialog
      v-model:visible="showDetailsDialog"
      modal
      header="Detalhes do Registro"
      :style="{ width: '600px' }"
      :aria-label="'Dialog com detalhes do registro selecionado'"
    >
      <div v-if="selectedRecord" class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">ID</label>
            <p class="text-gray-900 font-mono text-sm">{{ selectedRecord.id }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Data</label>
            <p class="text-gray-900">{{ formatDate(selectedRecord.date) }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Categoria</label>
            <Tag :value="selectedRecord.category" severity="info" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Área</label>
            <p class="text-gray-900">{{ selectedRecord.area }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Pessoa</label>
            <p class="text-gray-900">{{ selectedRecord.person }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Valor</label>
            <p class="text-gray-900 font-semibold">
              {{ formatCurrency(selectedRecord.value) }}
            </p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Desvio</label>
            <div class="flex items-center space-x-2">
              <i 
                :class="getDeviationIcon(selectedRecord.deviation)"
                :aria-label="getDeviationLabel(selectedRecord.deviation)"
              ></i>
              <span 
                class="font-medium"
                :class="getDeviationColor(selectedRecord.deviation)"
              >
                {{ selectedRecord.deviation > 0 ? '+' : '' }}{{ selectedRecord.deviation }}
              </span>
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Status</label>
            <Tag
              :value="getStatusLabel(selectedRecord.status)"
              :severity="getStatusSeverity(selectedRecord.status)"
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
import { ref, onMounted, onUnmounted, computed } from 'vue'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import Tag from 'primevue/tag'
import Toast from 'primevue/toast'
import ProgressSpinner from 'primevue/progressspinner'
import { useToast } from 'primevue/usetoast'

import FilterPanel from '@/components/common/FilterPanel.vue'
import KpiCard from '@/components/common/KpiCard.vue'
import CategoryByDeviationBar from '@/components/charts/CategoryByDeviationBar.vue'
import HeatmapPerson from '@/components/charts/HeatmapPerson.vue'
import DeviationsCombo from '@/components/charts/DeviationsCombo.vue'
import AreaByDeviationBar from '@/components/charts/AreaByDeviationBar.vue'
import RecordsTable from '@/components/table/RecordsTable.vue'

import { useFiltersStore } from '@/store/filters'
import type { AnalyticsRecord, AnalyticsFilters } from '@/types/analytics'

// Reactive state
const loading = ref(false)
const currentTime = ref('')
const showDetailsDialog = ref(false)
const selectedRecord = ref<AnalyticsRecord | null>(null)

const toast = useToast()
const filtersStore = useFiltersStore()

// Time update interval
let timeInterval: ReturnType<typeof setInterval>

// Lifecycle hooks
onMounted(() => {
  updateTime()
  timeInterval = setInterval(updateTime, 1000)
  
  // Initialize data
  filtersStore.initializeData(200)
})

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval)
  }
})

// Computed properties
const getActiveRecordsPercentage = computed(() => {
  const total = filtersStore.kpiData.totalRecords
  const active = filtersStore.kpiData.activeRecords
  return total > 0 ? Math.round((active / total) * 100) : 0
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

const updateFilters = (newFilters: AnalyticsFilters) => {
  filtersStore.updateFilters(newFilters)
  
  toast.add({
    severity: 'info',
    summary: 'Filtros Atualizados',
    detail: 'Os dados foram filtrados com base nas novas configurações',
    life: 3000,
  })
}

const resetFilters = () => {
  filtersStore.resetFilters()
  
  toast.add({
    severity: 'success',
    summary: 'Filtros Resetados',
    detail: 'Todos os filtros foram resetados para os valores padrão',
    life: 3000,
  })
}

const refreshData = () => {
  loading.value = true
  
  // Simulate API call
  setTimeout(() => {
    filtersStore.initializeData(200)
    loading.value = false
    
    toast.add({
      severity: 'success',
      summary: 'Dados Atualizados',
      detail: 'Os dados do dashboard foram atualizados com sucesso',
      life: 3000,
    })
  }, 1000)
}

const handleViewDetails = (record: AnalyticsRecord) => {
  selectedRecord.value = record
  showDetailsDialog.value = true
}

const handleEditRecord = (record: AnalyticsRecord) => {
  toast.add({
    severity: 'info',
    summary: 'Editar Registro',
    detail: `Funcionalidade de edição para ${record.id} será implementada`,
    life: 3000,
  })
}

const handleDeleteRecord = (record: AnalyticsRecord) => {
  toast.add({
    severity: 'warn',
    summary: 'Excluir Registro',
    detail: `Confirmação necessária para excluir ${record.id}`,
    life: 3000,
  })
}

const handleExportData = () => {
  toast.add({
    severity: 'info',
    summary: 'Exportar Dados',
    detail: 'Funcionalidade de exportação será implementada',
    life: 3000,
  })
}

// Helper functions for KPI changes (mock data)
const getActiveRecordsChange = (): number => {
  return Math.random() * 20 - 10 // Random change between -10% and +10%
}

const getAverageValueChange = (): number => {
  return Math.random() * 15 - 5 // Random change between -5% and +10%
}

const getDeviationChange = (): number => {
  return Math.random() * 25 - 15 // Random change between -15% and +10%
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

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value)
}

const getDeviationIcon = (deviation: number): string => {
  if (deviation > 0) return 'pi pi-arrow-up text-green-500'
  if (deviation < 0) return 'pi pi-arrow-down text-red-500'
  return 'pi pi-minus text-gray-500'
}

const getDeviationColor = (deviation: number): string => {
  if (deviation > 0) return 'text-green-600'
  if (deviation < 0) return 'text-red-600'
  return 'text-gray-600'
}

const getDeviationLabel = (deviation: number): string => {
  if (deviation > 0) return 'Desvio positivo'
  if (deviation < 0) return 'Desvio negativo'
  return 'Sem desvio'
}

const getStatusLabel = (status: string): string => {
  const labels = {
    active: 'Ativo',
    pending: 'Pendente',
    inactive: 'Inativo'
  }
  return labels[status as keyof typeof labels] || status
}

const getStatusSeverity = (status: string): 'success' | 'warning' | 'danger' | 'info' | 'secondary' => {
  const severities = {
    active: 'success' as const,
    pending: 'warning' as const,
    inactive: 'danger' as const
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

/* Responsive grid adjustments */
@media (max-width: 768px) {
  .grid-cols-1.md\:grid-cols-2.lg\:grid-cols-4 {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }
}

@media (min-width: 768px) and (max-width: 1024px) {
  .grid-cols-1.md\:grid-cols-2.lg\:grid-cols-4 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 1024px) {
  .grid-cols-1.md\:grid-cols-2.lg\:grid-cols-4 {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}
</style>
