<!--
  Person Performance Heatmap Component
  Interactive SVG heatmap showing person performance by area
-->
<template>
  <div class="bg-white rounded-lg shadow-md p-6">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h3 class="text-lg font-semibold text-gray-900">Performance por Pessoa</h3>
        <p class="text-sm text-gray-600">Mapa de calor da performance por pessoa e área</p>
      </div>
      <div class="flex items-center space-x-2">
        <i class="pi pi-th-large text-purple-500 text-xl" aria-hidden="true"></i>
        <span class="text-sm text-gray-500">Heatmap</span>
      </div>
    </div>

    <!-- Heatmap SVG -->
    <div class="h-80 overflow-auto">
      <svg
        :width="svgWidth"
        :height="svgHeight"
        class="w-full"
        :aria-label="'Mapa de calor da performance por pessoa e área'"
      >
        <!-- Background -->
        <rect
          width="100%"
          height="100%"
          fill="#f9fafb"
          :aria-hidden="true"
        />
        
        <!-- Grid lines -->
        <g v-for="(person, personIndex) in uniquePeople" :key="person" :aria-hidden="true">
          <line
            :x1="0"
            :y1="personIndex * cellHeight"
            :x2="svgWidth"
            :y2="personIndex * cellHeight"
            stroke="#e5e7eb"
            stroke-width="1"
          />
        </g>
        
        <g v-for="(area, areaIndex) in uniqueAreas" :key="area" :aria-hidden="true">
          <line
            :x1="areaIndex * cellWidth"
            :y1="0"
            :x2="areaIndex * cellWidth"
            :y2="svgHeight"
            stroke="#e5e7eb"
            stroke-width="1"
          />
        </g>

        <!-- Heatmap cells -->
        <g v-for="cell in heatmapCells" :key="`${cell.person}-${cell.area}`">
          <rect
            :x="cell.x"
            :y="cell.y"
            :width="cellWidth - 2"
            :height="cellHeight - 2"
            :fill="cell.color"
            :stroke="cell.stroke"
            stroke-width="1"
            :opacity="cell.opacity"
            class="cursor-pointer transition-all duration-200 hover:opacity-80"
            @click="selectCell(cell)"
            @mouseenter="hoverCell = cell"
            @mouseleave="hoverCell = null"
            :aria-label="`${cell.person} na área ${cell.area}: performance ${cell.performance}, valor ${cell.value}`"
            role="button"
            tabindex="0"
            @keydown.enter="selectCell(cell)"
            @keydown.space.prevent="selectCell(cell)"
          />
        </g>

        <!-- Area labels -->
        <g v-for="(area, index) in uniqueAreas" :key="`area-label-${area}`">
          <text
            :x="index * cellWidth + cellWidth / 2"
            :y="20"
            text-anchor="middle"
            class="text-xs font-medium fill-gray-700"
            :aria-hidden="true"
          >
            {{ area }}
          </text>
        </g>

        <!-- Person labels -->
        <g v-for="(person, index) in uniquePeople" :key="`person-label-${person}`">
          <text
            :x="10"
            :y="index * cellHeight + cellHeight / 2 + 4"
            text-anchor="start"
            class="text-xs font-medium fill-gray-700"
            :aria-hidden="true"
          >
            {{ person.split(' ')[0] }}
          </text>
        </g>
      </svg>
    </div>

    <!-- Color scale legend -->
    <div class="mt-4 flex items-center justify-between">
      <div class="flex items-center space-x-2">
        <span class="text-sm text-gray-600">Performance:</span>
        <div class="flex items-center space-x-1">
          <div class="w-3 h-3 bg-red-500 rounded"></div>
          <span class="text-xs text-gray-600">Baixa</span>
        </div>
        <div class="flex items-center space-x-1">
          <div class="w-3 h-3 bg-yellow-500 rounded"></div>
          <span class="text-xs text-gray-600">Média</span>
        </div>
        <div class="flex items-center space-x-1">
          <div class="w-3 h-3 bg-green-500 rounded"></div>
          <span class="text-xs text-gray-600">Alta</span>
        </div>
      </div>
      
      <div class="text-sm text-gray-600">
        Total: {{ heatmapCells.length }} registros
      </div>
    </div>

    <!-- Tooltip -->
    <div
      v-if="hoverCell"
      class="fixed z-50 bg-gray-900 text-white text-sm rounded-lg p-3 shadow-lg pointer-events-none"
      :style="tooltipStyle"
    >
      <div class="font-semibold">{{ hoverCell.person }}</div>
      <div class="text-gray-300">{{ hoverCell.area }}</div>
      <div class="text-gray-300">Performance: {{ hoverCell.performance }}</div>
      <div class="text-gray-300">Valor: {{ hoverCell.value.toLocaleString('pt-BR') }}</div>
      <div class="text-gray-300">Desvio: {{ hoverCell.deviation }}</div>
    </div>

    <!-- Selected cell details -->
    <div v-if="selectedCell" class="mt-4 bg-blue-50 rounded-lg p-4">
      <h4 class="text-sm font-medium text-blue-900 mb-2">Detalhes Selecionados</h4>
      <div class="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span class="font-medium text-blue-700">Pessoa:</span>
          <span class="text-blue-900 ml-2">{{ selectedCell.person }}</span>
        </div>
        <div>
          <span class="font-medium text-blue-700">Área:</span>
          <span class="text-blue-900 ml-2">{{ selectedCell.area }}</span>
        </div>
        <div>
          <span class="font-medium text-blue-700">Performance:</span>
          <span class="text-blue-900 ml-2">{{ selectedCell.performance }}</span>
        </div>
        <div>
          <span class="font-medium text-blue-700">Valor Médio:</span>
          <span class="text-blue-900 ml-2">{{ selectedCell.value.toLocaleString('pt-BR') }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useFiltersStore } from '@/store/filters'

const filtersStore = useFiltersStore()

// Reactive state
const hoverCell = ref<HeatmapCell | null>(null)
const selectedCell = ref<HeatmapCell | null>(null)
const tooltipStyle = ref({})

interface HeatmapCell {
  person: string
  area: string
  x: number
  y: number
  color: string
  stroke: string
  opacity: number
  value: number
  deviation: number
  performance: string
}

// Computed properties
const personData = computed(() => filtersStore.personData)

const uniquePeople = computed(() => {
  return Array.from(new Set(personData.value.map(item => item.person)))
})

const uniqueAreas = computed(() => {
  return Array.from(new Set(personData.value.map(item => item.area)))
})

const cellWidth = computed(() => Math.max(80, 400 / uniqueAreas.value.length))
const cellHeight = computed(() => Math.max(40, 300 / uniquePeople.value.length))

const svgWidth = computed(() => Math.max(400, uniqueAreas.value.length * cellWidth.value))
const svgHeight = computed(() => Math.max(300, uniquePeople.value.length * cellHeight.value + 30))

const heatmapCells = computed((): HeatmapCell[] => {
  const cells: HeatmapCell[] = []
  
  // Create a map of person data for quick lookup
  const personMap = new Map()
  personData.value.forEach(person => {
    personMap.set(`${person.person}-${person.area}`, person)
  })

  uniquePeople.value.forEach((person, personIndex) => {
    uniqueAreas.value.forEach((area, areaIndex) => {
      const key = `${person}-${area}`
      const data = personMap.get(key)
      
      if (data) {
        const performance = getPerformanceLevel(data.averageValue, data.totalDeviation)
        const color = getPerformanceColor(performance)
        
        cells.push({
          person,
          area,
          x: areaIndex * cellWidth.value + 1,
          y: personIndex * cellHeight.value + 31, // Offset for area labels
          color: color.background,
          stroke: color.stroke,
          opacity: 0.8,
          value: data.averageValue,
          deviation: data.totalDeviation,
          performance
        })
      } else {
        // Empty cell
        cells.push({
          person,
          area,
          x: areaIndex * cellWidth.value + 1,
          y: personIndex * cellHeight.value + 31,
          color: '#f3f4f6',
          stroke: '#d1d5db',
          opacity: 0.3,
          value: 0,
          deviation: 0,
          performance: 'N/A'
        })
      }
    })
  })
  
  return cells
})

// Helper functions
const getPerformanceLevel = (value: number, deviation: number): string => {
  const score = value + (deviation * 0.1) // Weighted score
  
  if (score > 3000) return 'Alta'
  if (score > 1500) return 'Média'
  return 'Baixa'
}

const getPerformanceColor = (performance: string) => {
  switch (performance) {
    case 'Alta':
      return { background: '#10b981', stroke: '#059669' }
    case 'Média':
      return { background: '#f59e0b', stroke: '#d97706' }
    case 'Baixa':
      return { background: '#ef4444', stroke: '#dc2626' }
    default:
      return { background: '#6b7280', stroke: '#4b5563' }
  }
}

// Event handlers
const selectCell = (cell: HeatmapCell) => {
  selectedCell.value = cell
}

// Update tooltip position on mouse move
const updateTooltipPosition = (event: MouseEvent) => {
  if (hoverCell.value) {
    tooltipStyle.value = {
      left: event.clientX + 10 + 'px',
      top: event.clientY - 10 + 'px'
    }
  }
}

// Add global mouse move listener
if (typeof window !== 'undefined') {
  window.addEventListener('mousemove', updateTooltipPosition)
}
</script>

<style scoped>
/* Custom styles for SVG interaction */
svg rect:hover {
  filter: brightness(1.1);
}

svg rect:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* Smooth transitions */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 200ms;
}
</style>

