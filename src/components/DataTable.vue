<!--
  Data Table Component
  Displays filtered table data with sorting and pagination using PrimeVue
-->
<template>
  <div class="bg-white rounded-lg shadow-md p-6">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h3 class="text-lg font-semibold text-gray-900">Transações Recentes</h3>
        <p class="text-sm text-gray-600">{{ filteredData.length }} transações encontradas</p>
      </div>
      <div class="flex items-center space-x-2">
        <i class="pi pi-table text-gray-500 text-xl" aria-hidden="true"></i>
        <span class="text-sm text-gray-500">Tabela</span>
      </div>
    </div>

    <DataTable
      :value="paginatedData"
      :paginator="true"
      :rows="rowsPerPage"
      :total-records="filteredData.length"
      :lazy="false"
      paginator-template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
      :rows-per-page-options="[5, 10, 20]"
      class="p-datatable-sm"
      :aria-label="'Tabela com ' + filteredData.length + ' transações'"
      responsive-layout="scroll"
    >
      <!-- Customer Column -->
      <Column field="customer" header="Cliente" sortable class="min-w-[150px]">
        <template #body="{ data }">
          <div class="flex items-center space-x-3">
            <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span class="text-blue-600 font-medium text-sm">
                {{ getInitials(data.customer) }}
              </span>
            </div>
            <span class="font-medium text-gray-900">{{ data.customer }}</span>
          </div>
        </template>
      </Column>

      <!-- Product Column -->
      <Column field="product" header="Produto" sortable class="min-w-[120px]">
        <template #body="{ data }">
          <span class="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-sm">
            {{ data.product }}
          </span>
        </template>
      </Column>

      <!-- Amount Column -->
      <Column field="amount" header="Valor" sortable class="min-w-[100px]">
        <template #body="{ data }">
          <span class="font-semibold text-gray-900">
            R$ {{ data.amount.toLocaleString('pt-BR') }}
          </span>
        </template>
      </Column>

      <!-- Status Column -->
      <Column field="status" header="Status" sortable class="min-w-[120px]">
        <template #body="{ data }">
          <Tag
            :value="getStatusLabel(data.status)"
            :severity="getStatusSeverity(data.status)"
            :icon="getStatusIcon(data.status)"
          />
        </template>
      </Column>

      <!-- Date Column -->
      <Column field="date" header="Data" sortable class="min-w-[120px]">
        <template #body="{ data }">
          <span class="text-gray-600">
            {{ formatDate(data.date) }}
          </span>
        </template>
      </Column>

      <!-- Actions Column -->
      <Column header="Ações" class="min-w-[100px]">
        <template #body="{ data }">
          <div class="flex space-x-2">
            <Button
              icon="pi pi-eye"
              size="small"
              severity="secondary"
              text
              rounded
              :aria-label="'Ver detalhes da transação ' + data.id"
              @click="viewDetails(data)"
            />
            <Button
              icon="pi pi-print"
              size="small"
              severity="secondary"
              text
              rounded
              :aria-label="'Imprimir transação ' + data.id"
              @click="printTransaction(data)"
            />
          </div>
        </template>
      </Column>

      <!-- Empty State -->
      <template #empty>
        <div class="text-center py-8">
          <i class="pi pi-inbox text-4xl text-gray-300 mb-4" aria-hidden="true"></i>
          <p class="text-gray-500">Nenhuma transação encontrada</p>
          <p class="text-sm text-gray-400">Tente ajustar os filtros para ver mais resultados</p>
        </div>
      </template>
    </DataTable>

    <!-- Summary Statistics -->
    <div class="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
      <div class="text-center">
        <p class="text-2xl font-bold text-green-600">
          {{ completedCount }}
        </p>
        <p class="text-sm text-gray-600">Concluídas</p>
      </div>
      <div class="text-center">
        <p class="text-2xl font-bold text-yellow-600">
          {{ pendingCount }}
        </p>
        <p class="text-sm text-gray-600">Pendentes</p>
      </div>
      <div class="text-center">
        <p class="text-2xl font-bold text-red-600">
          {{ cancelledCount }}
        </p>
        <p class="text-sm text-gray-600">Canceladas</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import Button from 'primevue/button'
import type { TableRow, FilterOptions } from '@/types'
import { MockDataService } from '@/services/mockData'

interface Props {
  filters?: FilterOptions
}

interface Emits {
  (e: 'view-details', transaction: TableRow): void
  (e: 'print-transaction', transaction: TableRow): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Configuration
const rowsPerPage = 10

// Get filtered data
const filteredData = computed(() => {
  return MockDataService.getTableData(props.filters)
})

// Paginated data (handled by PrimeVue DataTable)
const paginatedData = computed(() => filteredData.value)

// Status statistics
const completedCount = computed(
  () => filteredData.value.filter((row: TableRow) => row.status === 'completed').length
)

const pendingCount = computed(
  () => filteredData.value.filter((row: TableRow) => row.status === 'pending').length
)

const cancelledCount = computed(
  () => filteredData.value.filter((row: TableRow) => row.status === 'cancelled').length
)

// Helper functions
const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map((word) => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
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

const getStatusIcon = (status: string): string => {
  const icons = {
    completed: 'pi pi-check',
    pending: 'pi pi-clock',
    cancelled: 'pi pi-times',
  }
  return icons[status as keyof typeof icons] || 'pi pi-circle'
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('pt-BR')
}

// Event handlers
const viewDetails = (transaction: TableRow) => {
  emit('view-details', transaction)
}

const printTransaction = (transaction: TableRow) => {
  emit('print-transaction', transaction)
}
</script>

<style scoped>
/* Custom styles for better table appearance */
:deep(.p-datatable .p-datatable-thead > tr > th) {
  background-color: #f9fafb;
  border-bottom: 2px solid #e5e7eb;
  font-weight: 600;
  color: #374151;
}

:deep(.p-datatable .p-datatable-tbody > tr:hover) {
  background-color: #f3f4f6;
}

:deep(.p-paginator) {
  background-color: #ffffff;
  border-top: 1px solid #e5e7eb;
}

:deep(.p-paginator .p-paginator-page.p-highlight) {
  background-color: #3b82f6;
  color: #ffffff;
}
</style>
