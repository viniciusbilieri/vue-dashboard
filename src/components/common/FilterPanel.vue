<!--
  Filter Panel Component
  Reusable filter panel with multiple filter types
-->
<template>
  <div class="bg-white rounded-lg shadow-md p-6">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h3 class="text-lg font-semibold text-gray-900">Filtros</h3>
        <p class="text-sm text-gray-600">Configure os filtros para visualizar dados específicos</p>
      </div>
      <Button
        icon="pi pi-refresh"
        label="Resetar"
        severity="secondary"
        size="small"
        @click="resetAllFilters"
        :aria-label="'Resetar todos os filtros'"
      />
    </div>

    <div class="space-y-6">
      <!-- Date Range Filter -->
      <div v-if="showDateRange" class="space-y-3">
        <label for="date-range" class="block text-sm font-medium text-gray-700">
          Período
        </label>
        <Calendar
          id="date-range"
          v-model="dateRangeModel"
          selection-mode="range"
          :manual-input="false"
          :show-icon="true"
          date-format="dd/mm/yy"
          placeholder="Selecione o período"
          class="w-full"
          :aria-label="'Selecionar período de ' + formatDate(dateRangeModel?.[0] || null) + ' a ' + formatDate(dateRangeModel?.[1] || null)"
        />
      </div>

      <!-- Category Filter -->
      <div v-if="showCategory && filterOptions.categories" class="space-y-3">
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
          :aria-label="'Filtrar por categoria: ' + getLabel(filterOptions.categories, localFilters.category || 'all')"
        />
      </div>

      <!-- Area Filter -->
      <div v-if="showArea && filterOptions.areas" class="space-y-3">
        <label for="area-filter" class="block text-sm font-medium text-gray-700">
          Área
        </label>
        <Dropdown
          id="area-filter"
          v-model="localFilters.area"
          :options="filterOptions.areas"
          option-label="label"
          option-value="value"
          placeholder="Selecione uma área"
          class="w-full"
          :aria-label="'Filtrar por área: ' + getLabel(filterOptions.areas, localFilters.area || 'all')"
        />
      </div>

      <!-- Status Filter -->
      <div v-if="showStatus && filterOptions.statuses" class="space-y-3">
        <label for="status-filter" class="block text-sm font-medium text-gray-700">
          Status
        </label>
        <Dropdown
          id="status-filter"
          v-model="localFilters.status"
          :options="filterOptions.statuses"
          option-label="label"
          option-value="value"
          placeholder="Selecione um status"
          class="w-full"
          :aria-label="'Filtrar por status: ' + getLabel(filterOptions.statuses, localFilters.status || 'all')"
        />
      </div>

      <!-- Person Filter -->
      <div v-if="showPerson && filterOptions.people" class="space-y-3">
        <label for="person-filter" class="block text-sm font-medium text-gray-700">
          Pessoa
        </label>
        <Dropdown
          id="person-filter"
          v-model="localFilters.person"
          :options="filterOptions.people"
          option-label="label"
          option-value="value"
          placeholder="Selecione uma pessoa"
          class="w-full"
          :aria-label="'Filtrar por pessoa: ' + getLabel(filterOptions.people, localFilters.person || 'all')"
        />
      </div>

      <!-- Value Range Filter -->
      <div v-if="showValueRange" class="space-y-3">
        <label class="block text-sm font-medium text-gray-700">
          Faixa de Valores
        </label>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label for="min-value" class="sr-only">Valor mínimo</label>
            <InputNumber
              id="min-value"
              v-model="localFilters.valueRange!.min"
              placeholder="Mínimo"
              :min="0"
              :max="100000"
              class="w-full"
              :aria-label="'Valor mínimo: ' + (localFilters.valueRange?.min ?? 0)"
            />
          </div>
          <div>
            <label for="max-value" class="sr-only">Valor máximo</label>
            <InputNumber
              id="max-value"
              v-model="localFilters.valueRange!.max"
              placeholder="Máximo"
              :min="0"
              :max="100000"
              class="w-full"
              :aria-label="'Valor máximo: ' + (localFilters.valueRange?.max ?? 0)"
            />
          </div>
        </div>
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
          icon="pi pi-times"
          severity="secondary"
          class="w-full"
          :aria-label="'Limpar todos os filtros'"
          @click="clearFilters"
        />
      </div>

      <!-- Active Filters Summary -->
      <div v-if="activeFiltersCount > 0" class="bg-blue-50 rounded-lg p-4">
        <h4 class="text-sm font-medium text-blue-900 mb-2">
          Filtros Ativos ({{ activeFiltersCount }})
        </h4>
        <div class="flex flex-wrap gap-2">
          <Tag
            v-for="filter in activeFilters"
            :key="filter.key"
            :value="filter.label"
            severity="info"
            :removable="true"
            @remove="removeFilter(filter.key)"
            :aria-label="'Filtro ativo: ' + filter.label + '. Clique para remover'"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed, watch } from 'vue'
import Calendar from 'primevue/calendar'
import Dropdown from 'primevue/dropdown'
import Button from 'primevue/button'
import InputNumber from 'primevue/inputnumber'
import Tag from 'primevue/tag'
import type { AnalyticsFilters } from '@/types/analytics'

interface FilterOptions {
  categories?: Array<{ label: string; value: string }>
  areas?: Array<{ label: string; value: string }>
  statuses?: Array<{ label: string; value: string }>
  people?: Array<{ label: string; value: string }>
}

interface Props {
  filters: AnalyticsFilters
  filterOptions: FilterOptions
  showDateRange?: boolean
  showCategory?: boolean
  showArea?: boolean
  showStatus?: boolean
  showPerson?: boolean
  showValueRange?: boolean
}

interface Emits {
  (e: 'update:filters', filters: AnalyticsFilters): void
  (e: 'reset'): void
}

const props = withDefaults(defineProps<Props>(), {
  showDateRange: true,
  showCategory: true,
  showArea: true,
  showStatus: true,
  showPerson: false,
  showValueRange: false
})

const emit = defineEmits<Emits>()

// Local filters state
const localFilters = reactive<AnalyticsFilters>({
  category: 'all',
  area: 'all',
  status: 'all',
  person: 'all',
  dateRange: {
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    end: new Date()
  },
  valueRange: {
    min: 0,
    max: 100000
  }
})

// Computed date range model for Calendar
const dateRangeModel = computed({
  get: () => {
    if (!localFilters.dateRange) return null
    return [localFilters.dateRange.start, localFilters.dateRange.end]
  },
  set: (value: Date[] | null) => {
    if (value && value.length === 2) {
      localFilters.dateRange = {
        start: value[0],
        end: value[1]
      }
    }
  }
})

// Active filters for display
const activeFilters = computed(() => {
  const filters = []
  
  if (localFilters.category && localFilters.category !== 'all') {
    filters.push({
      key: 'category',
      label: `Categoria: ${getLabel(props.filterOptions.categories, localFilters.category)}`
    })
  }
  
  if (localFilters.area && localFilters.area !== 'all') {
    filters.push({
      key: 'area',
      label: `Área: ${getLabel(props.filterOptions.areas, localFilters.area)}`
    })
  }
  
  if (localFilters.status && localFilters.status !== 'all') {
    filters.push({
      key: 'status',
      label: `Status: ${getLabel(props.filterOptions.statuses, localFilters.status)}`
    })
  }
  
  if (localFilters.person && localFilters.person !== 'all') {
    filters.push({
      key: 'person',
      label: `Pessoa: ${getLabel(props.filterOptions.people, localFilters.person)}`
    })
  }
  
  return filters
})

const activeFiltersCount = computed(() => activeFilters.value.length)

// Watch for prop changes
watch(
  () => props.filters,
  (newFilters) => {
    Object.assign(localFilters, newFilters)
  },
  { immediate: true, deep: true }
)

// Methods
const applyFilters = () => {
  emit('update:filters', { ...localFilters })
}

const clearFilters = () => {
  localFilters.category = 'all'
  localFilters.area = 'all'
  localFilters.status = 'all'
  localFilters.person = 'all'
  localFilters.dateRange = {
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    end: new Date()
  }
  localFilters.valueRange = {
    min: 0,
    max: 100000
  }
  applyFilters()
}

const resetAllFilters = () => {
  clearFilters()
  emit('reset')
}

const removeFilter = (key: string) => {
  switch (key) {
    case 'category':
      localFilters.category = 'all'
      break
    case 'area':
      localFilters.area = 'all'
      break
    case 'status':
      localFilters.status = 'all'
      break
    case 'person':
      localFilters.person = 'all'
      break
  }
  applyFilters()
}

const formatDate = (date: Date | null): string => {
  if (!date) return 'Não selecionado'
  return date.toLocaleDateString('pt-BR')
}

const getLabel = (options: Array<{ label: string; value: string }> | undefined, value: string): string => {
  if (!options) return value
  const option = options.find(opt => opt.value === value)
  return option ? option.label : value
}
</script>

<style scoped>
/* Custom styles for better accessibility */
.p-calendar .p-inputtext:focus,
.p-dropdown:focus-within,
.p-inputnumber:focus-within {
  @apply ring-2 ring-blue-500 ring-opacity-50;
}

.p-button:focus {
  @apply ring-2 ring-blue-500 ring-opacity-50 outline-none;
}

.p-tag .p-tag-icon {
  @apply focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50;
}
</style>
