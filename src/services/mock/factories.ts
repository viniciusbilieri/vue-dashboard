/**
 * Data factories for generating consistent mock data
 * Provides factory methods for different data types
 */
import { faker } from '@faker-js/faker'
import { rng } from './rng'
import type { MockRecord } from './dataset'

export interface FilterOptions {
  category?: string
  area?: string
  status?: string
  dateRange?: {
    start: Date
    end: Date
  }
  person?: string
}

export class DataFactory {
  /**
   * Create filtered dataset
   */
  static createFilteredDataset(
    baseRecords: MockRecord[],
    filters: FilterOptions = {}
  ): MockRecord[] {
    let filtered = [...baseRecords]

    if (filters.category && filters.category !== 'all') {
      filtered = filtered.filter(r => r.category === filters.category)
    }

    if (filters.area && filters.area !== 'all') {
      filtered = filtered.filter(r => r.area === filters.area)
    }

    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter(r => r.status === filters.status)
    }

    if (filters.person && filters.person !== 'all') {
      filtered = filtered.filter(r => r.person === filters.person)
    }

    if (filters.dateRange) {
      filtered = filtered.filter(r => {
        const recordDate = new Date(r.date)
        return recordDate >= filters.dateRange!.start && recordDate <= filters.dateRange!.end
      })
    }

    return filtered
  }

  /**
   * Create chart data for category deviation bar chart
   */
  static createCategoryDeviationData(records: MockRecord[]) {
    const categoryData = records.reduce((acc, record) => {
      if (!acc[record.category]) {
        acc[record.category] = {
          positive: 0,
          negative: 0,
          neutral: 0
        }
      }

      if (record.deviation > 50) {
        acc[record.category].positive++
      } else if (record.deviation < -50) {
        acc[record.category].negative++
      } else {
        acc[record.category].neutral++
      }

      return acc
    }, {} as Record<string, { positive: number; negative: number; neutral: number }>)

    return Object.entries(categoryData).map(([category, data]) => ({
      category,
      ...data,
      total: data.positive + data.negative + data.neutral
    }))
  }

  /**
   * Create heatmap data for person performance
   */
  static createPersonHeatmapData(records: MockRecord[]) {
    const personData = records.reduce((acc, record) => {
      if (!acc[record.person]) {
        acc[record.person] = {
          area: record.area,
          records: [],
          averageDeviation: 0
        }
      }
      acc[record.person].records.push(record.deviation)
      return acc
    }, {} as Record<string, { area: string; records: number[]; averageDeviation: number }>)

    return Object.entries(personData).map(([person, data]) => ({
      person,
      area: data.area,
      averageDeviation: Math.round(data.records.reduce((sum, dev) => sum + dev, 0) / data.records.length),
      recordCount: data.records.length
    })).sort((a, b) => b.averageDeviation - a.averageDeviation)
  }

  /**
   * Create combo chart data (area + deviation)
   */
  static createComboChartData(records: MockRecord[]) {
    const monthlyData = records.reduce((acc, record) => {
      const month = new Date(record.date).toLocaleDateString('pt-BR', { month: 'short' })
      
      if (!acc[month]) {
        acc[month] = {
          month,
          totalValue: 0,
          totalDeviation: 0,
          count: 0
        }
      }

      acc[month].totalValue += record.value
      acc[month].totalDeviation += record.deviation
      acc[month].count++

      return acc
    }, {} as Record<string, { month: string; totalValue: number; totalDeviation: number; count: number }>)

    return Object.values(monthlyData).map(data => ({
      month: data.month,
      averageValue: Math.round(data.totalValue / data.count),
      averageDeviation: Math.round(data.totalDeviation / data.count)
    })).sort((a, b) => {
      const monthOrder = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
      return monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month)
    })
  }

  /**
   * Create area deviation bar chart data
   */
  static createAreaDeviationData(records: MockRecord[]) {
    const areaData = records.reduce((acc, record) => {
      if (!acc[record.area]) {
        acc[record.area] = {
          positive: 0,
          negative: 0,
          neutral: 0,
          totalValue: 0,
          count: 0
        }
      }

      if (record.deviation > 50) {
        acc[record.area].positive++
      } else if (record.deviation < -50) {
        acc[record.area].negative++
      } else {
        acc[record.area].neutral++
      }

      acc[record.area].totalValue += record.value
      acc[record.area].count++

      return acc
    }, {} as Record<string, { positive: number; negative: number; neutral: number; totalValue: number; count: number }>)

    return Object.entries(areaData).map(([area, data]) => ({
      area,
      positive: data.positive,
      negative: data.negative,
      neutral: data.neutral,
      averageValue: Math.round(data.totalValue / data.count),
      totalRecords: data.count
    }))
  }

  /**
   * Get filter options for dropdowns
   */
  static getFilterOptions(records: MockRecord[]) {
    const categories = Array.from(new Set(records.map(r => r.category)))
    const areas = Array.from(new Set(records.map(r => r.area)))
    const people = Array.from(new Set(records.map(r => r.person)))
    const statuses = Array.from(new Set(records.map(r => r.status)))

    return {
      categories: [
        { label: 'Todas', value: 'all' },
        ...categories.map(cat => ({ label: cat, value: cat }))
      ],
      areas: [
        { label: 'Todas', value: 'all' },
        ...areas.map(area => ({ label: area, value: area }))
      ],
      people: [
        { label: 'Todos', value: 'all' },
        ...people.map(person => ({ label: person, value: person }))
      ],
      statuses: [
        { label: 'Todos', value: 'all' },
        ...statuses.map(status => ({ 
          label: status.charAt(0).toUpperCase() + status.slice(1), 
          value: status 
        }))
      ]
    }
  }

  /**
   * Generate random sample data for testing
   */
  static generateSampleData(count: number = 50): MockRecord[] {
    const records: MockRecord[] = []
    const categories = ['Development', 'Design', 'Marketing', 'Sales']
    const areas = ['North', 'South', 'East', 'West']
    const statuses: MockRecord['status'][] = ['active', 'inactive', 'pending']

    for (let i = 0; i < count; i++) {
      records.push({
        id: faker.string.uuid(),
        category: rng.randomChoice(categories),
        area: rng.randomChoice(areas),
        person: faker.person.fullName(),
        value: rng.randomInt(100, 5000),
        deviation: rng.randomInt(-300, 300),
        date: faker.date.recent({ days: 30 }).toISOString().split('T')[0],
        status: rng.randomChoice(statuses)
      })
    }

    return records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }
}

