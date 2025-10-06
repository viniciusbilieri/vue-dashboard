<!--
  Records Table Component
  Displays analytics records with filtering, sorting, and pagination
-->
<template>
  <div class="bg-white rounded-lg shadow-md p-6">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h3 class="text-lg font-semibold text-gray-900">Registros de Analytics</h3>
        <p class="text-sm text-gray-600">
          {{ filteredRecords.length }} registros encontrados
        </p>
      </div>
      <div class="flex items-center space-x-2">
        <Button
          icon="pi pi-download"
          label="Exportar"
          severity="secondary"
          size="small"
          @click="exportData"
          :aria-label="'Exportar dados da tabela'"
        />
        <i class="pi pi-table text-gray-500 text-xl" aria-hidden="true"></i>
      </div>
    </div>

    <DataTable
      :value="paginatedRecords"
      :paginator="true"
      :rows="rowsPerPage"
      :total-records="filteredRecords.length"
      :lazy="false"
      paginator-template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
      :rows-per-page-options="[10, 25, 50, 100]"
      class="p-datatable-sm"
      :aria-label="'Tabela com ' + filteredRecords.length + ' registros de analytics'"
      responsive-layout="scroll"
      :sort-field="sortField"
      :sort-order="sortOrder"
      @sort="onSort"
    >
      <!-- ID Column -->
      <Column
        field="id"
        header="ID"
        :sortable="true"
        class="min-w-[120px]"
      >
        <template #body="{ data }">
          <span class="font-mono text-xs text-gray-600">
            {{ data.id.substring(0, 8) }}...
          </span>
        </template>
      </Column>

      <!-- Category Column -->
      <Column
        field="category"
        header="Categoria"
        :sortable="true"
        class="min-w-[120px]"
      >
        <template #body="{ data }">
          <Tag
            :value="data.category"
            severity="info"
            class="text-xs"
          />
        </template>
      </Column>

      <!-- Area Column -->
      <Column
        field="area"
        header="Área"
        :sortable="true"
        class="min-w-[100px]"
      >
        <template #body="{ data }">
          <div class="flex items-center space-x-2">
            <div 
              class="w-2 h-2 rounded-full"
              :style="{ backgroundColor: getAreaColor(data.area) }"
              :aria-label="'Cor da área ' + data.area"
            ></div>
            <span class="text-sm">{{ data.area }}</span>
          </div>
        </template>
      </Column>

      <!-- Person Column -->
      <Column
        field="person"
        header="Pessoa"
        :sortable="true"
        class="min-w-[150px]"
      >
        <template #body="{ data }">
          <div class="flex items-center space-x-3">
            <div class="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
              <span class="text-white font-medium text-sm">
                {{ getInitials(data.person) }}
              </span>
            </div>
            <div>
              <p class="font-medium text-gray-900 text-sm">{{ data.person }}</p>
            </div>
          </div>
        </template>
      </Column>

      <!-- Value Column -->
      <Column
        field="value"
        header="Valor"
        :sortable="true"
        class="min-w-[100px]"
      >
        <template #body="{ data }">
          <span class="font-semibold text-gray-900">
            {{ formatCurrency(data.value) }}
          </span>
        </template>
      </Column>

      <!-- Deviation Column -->
      <Column
        field="deviation"
        header="Desvio"
        :sortable="true"
        class="min-w-[100px]"
      >
        <template #body="{ data }">
          <div class="flex items-center space-x-2">
            <i 
              :class="getDeviationIcon(data.deviation)"
              :aria-label="getDeviationLabel(data.deviation)"
            ></i>
            <span 
              class="font-medium"
              :class="getDeviationColor(data.deviation)"
            >
              {{ data.deviation > 0 ? '+' : '' }}{{ data.deviation }}
            </span>
          </div>
        </template>
      </Column>

      <!-- Date Column -->
      <Column
        field="date"
        header="Data"
        :sortable="true"
        class="min-w-[120px]"
      >
        <template #body="{ data }">
          <span class="text-gray-600">
            {{ formatDate(data.date) }}
          </span>
        </template>
      </Column>

      <!-- Status Column -->
      <Column
        field="status"
        header="Status"
        :sortable="true"
        class="min-w-[120px]"
      >
        <template #body="{ data }">
          <Tag
            :value="getStatusLabel(data.status)"
            :severity="getStatusSeverity(data.status)"
            :icon="getStatusIcon(data.status)"
          />
        </template>
      </Column>

      <!-- Actions Column -->
      <Column
        header="Ações"
        class="min-w-[120px]"
      >
        <template #body="{ data }">
          <div class="flex space-x-1">
            <Button
              icon="pi pi-eye"
              size="small"
              severity="secondary"
              text
              rounded
              :aria-label="'Ver detalhes do registro ' + data.id"
              @click="viewDetails(data)"
            />
            <Button
              icon="pi pi-pencil"
              size="small"
              severity="secondary"
              text
              rounded
              :aria-label="'Editar registro ' + data.id"
              @click="editRecord(data)"
            />
            <Button
              icon="pi pi-trash"
              size="small"
              severity="danger"
              text
              rounded
              :aria-label="'Excluir registro ' + data.id"
              @click="deleteRecord(data)"
            />
          </div>
        </template>
      </Column>

      <!-- Empty State -->
      <template #empty>
        <div class="text-center py-8">
          <i class="pi pi-inbox text-4xl text-gray-300 mb-4" aria-hidden="true"></i>
          <p class="text-gray-500">Nenhum registro encontrado</p>
          <p class="text-sm text-gray-400">
            Tente ajustar os filtros para ver mais resultados
          </p>
        </div>
      </template>
    </DataTable>

    <!-- Summary Statistics -->
    <div class="grid grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200">
      <div class="text-center">
        <p class="text-2xl font-bold text-blue-600">
          {{ formatCurrency(averageValue) }}
        </p>
        <p class="text-sm text-gray-600">Valor Médio</p>
      </div>
      <div class="text-center">
        <p class="text-2xl font-bold text-green-600">
          {{ activeCount }}
        </p>
        <p class="text-sm text-gray-600">Ativos</p>
      </div>
      <div class="text-center">
        <p class="text-2xl font-bold text-yellow-600">
          {{ pendingCount }}
        </p>
        <p class="text-sm text-gray-600">Pendentes</p>
      </div>
      <div class="text-center">
        <p class="text-2xl font-bold text-red-600">
          {{ inactiveCount }}
        </p>
        <p class="text-sm text-gray-600">Inativos</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import Button from 'primevue/button'
import { useFiltersStore } from '@/store/filters'
import type { AnalyticsRecord } from '@/types/analytics'

interface Emits {
  (e: 'view-details', record: AnalyticsRecord): void
  (e: 'edit-record', record: AnalyticsRecord): void
  (e: 'delete-record', record: AnalyticsRecord): void
  (e: 'export-data'): void
}

const emit = defineEmits<Emits>()

const filtersStore = useFiltersStore()

// Configuration
const rowsPerPage = ref(25)
const sortField = ref('date')
const sortOrder = ref(-1) // -1 for descending

// Computed properties
const filteredRecords = computed(() => filtersStore.filteredRecords)

const paginatedRecords = computed(() => filteredRecords.value)

// Statistics
const averageValue = computed(() => {
  if (filteredRecords.value.length === 0) return 0
  const sum = filteredRecords.value.reduce((total, record) => total + record.value, 0)
  return sum / filteredRecords.value.length
})

const activeCount = computed(() => 
  filteredRecords.value.filter(record => record.status === 'active').length
)

const pendingCount = computed(() => 
  filteredRecords.value.filter(record => record.status === 'pending').length
)

const inactiveCount = computed(() => 
  filteredRecords.value.filter(record => record.status === 'inactive').length
)

// Helper functions
const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

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

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('pt-BR')
}

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value)
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

const getStatusIcon = (status: string): string => {
  const icons = {
    active: 'pi pi-check',
    pending: 'pi pi-clock',
    inactive: 'pi pi-times'
  }
  return icons[status as keyof typeof icons] || 'pi pi-circle'
}

// Event handlers
const onSort = (event: any) => {
  sortField.value = event.sortField
  sortOrder.value = event.sortOrder
}

const viewDetails = (record: AnalyticsRecord) => {
  emit('view-details', record)
}

const editRecord = (record: AnalyticsRecord) => {
  emit('edit-record', record)
}

const deleteRecord = (record: AnalyticsRecord) => {
  emit('delete-record', record)
}

const exportData = () => {
  emit('export-data')
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

/* Custom tag styles */
:deep(.p-tag) {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
}

/* Button hover effects */
:deep(.p-button.p-button-text:hover) {
  background-color: rgba(0, 0, 0, 0.04);
}
</style>

