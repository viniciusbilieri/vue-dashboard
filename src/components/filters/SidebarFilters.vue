<!--
  Sidebar Filters Component
  Provides filtering options for dashboard data
-->
<template>
  <aside class="w-80 bg-white shadow-lg border-r border-gray-200 p-6">
    <div class="space-y-6">
      <!-- Header -->
      <div class="border-b border-gray-200 pb-4">
        <h2 class="text-lg font-semibold text-gray-900">Filtros</h2>
        <p class="text-sm text-gray-600 mt-1">
          Configure os filtros para visualizar dados específicos
        </p>
      </div>

      <!-- Date Range Filter -->
      <div class="space-y-3">
        <label for="date-range" class="block text-sm font-medium text-gray-700"> Período </label>
        <Calendar
          id="date-range"
          v-model="dateRangeModel"
          selection-mode="range"
          :manual-input="false"
          :show-icon="true"
          date-format="dd/mm/yy"
          placeholder="Selecione o período"
          class="w-full"
          :aria-label="
            'Selecionar período de ' +
            formatDate(dateRangeModel?.[0]) +
            ' a ' +
            formatDate(dateRangeModel?.[1])
          "
        />
      </div>

      <!-- Category Filter -->
      <div class="space-y-3">
        <label for="category-filter" class="block text-sm font-medium text-gray-700">
          Categoria
        </label>
        <Dropdown
          id="category-filter"
          v-model="localFilters.category"
          :options="filterOptions.categories"
          option-label="label"
          option-value="value"
          placeholder="Selecione uma categoria"
          class="w-full"
          :aria-label="'Filtrar por categoria: ' + getCategoryLabel(localFilters.category)"
        />
      </div>

      <!-- Status Filter -->
      <div class="space-y-3">
        <label for="status-filter" class="block text-sm font-medium text-gray-700"> Status </label>
        <Dropdown
          id="status-filter"
          v-model="localFilters.status"
          :options="filterOptions.statuses"
          option-label="label"
          option-value="value"
          placeholder="Selecione um status"
          class="w-full"
          :aria-label="'Filtrar por status: ' + getStatusLabel(localFilters.status)"
        />
      </div>

      <!-- Action Buttons -->
      <div class="flex flex-col space-y-3 pt-4 border-t border-gray-200">
        <Button
          label="Aplicar Filtros"
          icon="pi pi-check"
          class="w-full"
          :aria-label="'Aplicar filtros selecionados'"
          @click="applyFilters"
        />
        <Button
          label="Limpar Filtros"
          icon="pi pi-refresh"
          severity="secondary"
          class="w-full"
          :aria-label="'Limpar todos os filtros e resetar para valores padrão'"
          @click="resetFilters"
        />
      </div>

      <!-- Filter Summary -->
      <div class="bg-gray-50 rounded-lg p-4">
        <h3 class="text-sm font-medium text-gray-900 mb-2">Resumo dos Filtros</h3>
        <div class="space-y-1 text-xs text-gray-600">
          <div>
            <span class="font-medium">Período:</span>
            {{ formatDateRange(localFilters.dateRange) }}
          </div>
          <div>
            <span class="font-medium">Categoria:</span>
            {{ getCategoryLabel(localFilters.category) }}
          </div>
          <div>
            <span class="font-medium">Status:</span>
            {{ getStatusLabel(localFilters.status) }}
          </div>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted, computed } from 'vue'
import Calendar from 'primevue/calendar'
import Dropdown from 'primevue/dropdown'
import Button from 'primevue/button'
import { MockDataService } from '@/services/mockData'
import type { FilterOptions } from '@/types'

interface Props {
  filters: FilterOptions
}

interface Emits {
  (e: 'update:filters', filters: FilterOptions): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Local reactive filters
const localFilters = reactive<FilterOptions>({
  dateRange: {
    start: new Date(),
    end: new Date(),
  },
  category: 'all',
  status: 'all',
})

// Filter options
const filterOptions = ref<{
  categories: { label: string; value: string }[]
  statuses: { label: string; value: string }[]
  dateRange: { start: Date; end: Date }
}>({
  categories: [],
  statuses: [],
  dateRange: { start: new Date(), end: new Date() },
})

// Computed date range model for Calendar component
const dateRangeModel = computed({
  get: () => [localFilters.dateRange.start, localFilters.dateRange.end],
  set: (value: Date[] | null) => {
    if (value && value.length === 2) {
      localFilters.dateRange = {
        start: value[0],
        end: value[1],
      }
    }
  },
})

// Load filter options on mount
onMounted(() => {
  filterOptions.value = MockDataService.getFilterOptions()
  localFilters.dateRange = filterOptions.value.dateRange
})

// Watch for prop changes
watch(
  () => props.filters,
  (newFilters: FilterOptions) => {
    localFilters.dateRange = { ...newFilters.dateRange }
    localFilters.category = newFilters.category
    localFilters.status = newFilters.status
  },
  { immediate: true, deep: true }
)

// Apply filters
const applyFilters = () => {
  emit('update:filters', {
    dateRange: { ...localFilters.dateRange },
    category: localFilters.category,
    status: localFilters.status,
  })
}

// Reset filters
const resetFilters = () => {
  localFilters.dateRange = { ...filterOptions.value.dateRange }
  localFilters.category = 'all'
  localFilters.status = 'all'
  applyFilters()
}

// Helper functions
const formatDate = (date: Date | null): string => {
  if (!date) return 'Não selecionado'
  return date.toLocaleDateString('pt-BR')
}

const formatDateRange = (range: { start: Date; end: Date }): string => {
  return `${formatDate(range.start)} - ${formatDate(range.end)}`
}

const getCategoryLabel = (value: string): string => {
  const category = filterOptions.value.categories.find((c) => c.value === value)
  return category ? category.label : 'Todos'
}

const getStatusLabel = (value: string): string => {
  const status = filterOptions.value.statuses.find((s) => s.value === value)
  return status ? status.label : 'Todos'
}
</script>

<style scoped>
/* Custom styles for better accessibility */
.p-calendar .p-inputtext:focus,
.p-dropdown:focus-within {
  @apply ring-2 ring-blue-500 ring-opacity-50;
}

.p-button:focus {
  @apply ring-2 ring-blue-500 ring-opacity-50 outline-none;
}
</style>
