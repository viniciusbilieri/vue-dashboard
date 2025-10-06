/**
 * Filters store using Pinia
 * Manages filter state and data across the application
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { MockRecord } from '@/services/mock/dataset'
import type { FilterOptions } from '@/services/mock/factories'
import { DatasetService } from '@/services/mock/dataset'
import { DataFactory } from '@/services/mock/factories'

export const useFiltersStore = defineStore('filters', () => {
  // State
  const rawRecords = ref<MockRecord[]>([])
  const filters = ref<FilterOptions>({
    category: 'all',
    area: 'all',
    status: 'all',
    person: 'all',
    dateRange: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      end: new Date()
    }
  })

  // Computed
  const filteredRecords = computed(() => 
    DataFactory.createFilteredDataset(rawRecords.value, filters.value)
  )

  const kpiData = computed(() => 
    DatasetService.calculateKPIs(filteredRecords.value)
  )

  const categoryData = computed(() => 
    DatasetService.groupByCategory(filteredRecords.value)
  )

  const personData = computed(() => 
    DatasetService.groupByPerson(filteredRecords.value)
  )

  const areaDistribution = computed(() => 
    DatasetService.getAreaDistribution(filteredRecords.value)
  )

  const deviationRanges = computed(() => 
    DatasetService.getDeviationRanges(filteredRecords.value)
  )

  const filterOptions = computed(() => 
    DataFactory.getFilterOptions(rawRecords.value)
  )

  // Chart data
  const categoryDeviationData = computed(() => 
    DataFactory.createCategoryDeviationData(filteredRecords.value)
  )

  const personHeatmapData = computed(() => 
    DataFactory.createPersonHeatmapData(filteredRecords.value)
  )

  const comboChartData = computed(() => 
    DataFactory.createComboChartData(filteredRecords.value)
  )

  const areaDeviationData = computed(() => 
    DataFactory.createAreaDeviationData(filteredRecords.value)
  )

  // Actions
  function initializeData(count: number = 200) {
    rawRecords.value = DatasetService.generateRecords(count)
  }

  function updateFilters(newFilters: Partial<FilterOptions>) {
    filters.value = {
      ...filters.value,
      ...newFilters
    }
  }

  function resetFilters() {
    filters.value = {
      category: 'all',
      area: 'all',
      status: 'all',
      person: 'all',
      dateRange: {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        end: new Date()
      }
    }
  }

  function setCategoryFilter(category: string) {
    filters.value.category = category
  }

  function setAreaFilter(area: string) {
    filters.value.area = area
  }

  function setStatusFilter(status: string) {
    filters.value.status = status
  }

  function setPersonFilter(person: string) {
    filters.value.person = person
  }

  function setDateRange(start: Date, end: Date) {
    filters.value.dateRange = { start, end }
  }

  // Getters for specific data
  function getRecordsByCategory(category: string) {
    return rawRecords.value.filter(record => record.category === category)
  }

  function getRecordsByArea(area: string) {
    return rawRecords.value.filter(record => record.area === area)
  }

  function getRecordsByPerson(person: string) {
    return rawRecords.value.filter(record => record.person === person)
  }

  function getTopPerformers(limit: number = 10) {
    return personData.value
      .sort((a, b) => b.averageValue - a.averageValue)
      .slice(0, limit)
  }

  function getTopCategories(limit: number = 5) {
    return categoryData.value
      .sort((a, b) => b.count - a.count)
      .slice(0, limit)
  }

  return {
    // State
    rawRecords,
    filters,
    
    // Computed
    filteredRecords,
    kpiData,
    categoryData,
    personData,
    areaDistribution,
    deviationRanges,
    filterOptions,
    categoryDeviationData,
    personHeatmapData,
    comboChartData,
    areaDeviationData,
    
    // Actions
    initializeData,
    updateFilters,
    resetFilters,
    setCategoryFilter,
    setAreaFilter,
    setStatusFilter,
    setPersonFilter,
    setDateRange,
    
    // Getters
    getRecordsByCategory,
    getRecordsByArea,
    getRecordsByPerson,
    getTopPerformers,
    getTopCategories
  }
})

