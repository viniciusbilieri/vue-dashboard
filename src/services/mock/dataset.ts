/**
 * Dataset generation service
 * Creates consistent mock datasets for dashboard components
 */
import { faker } from '@faker-js/faker'
import { rng } from './rng'

// Set faker seed for consistent data
faker.seed(12345)

export interface MockRecord {
  id: string
  category: string
  area: string
  person: string
  value: number
  deviation: number
  date: string
  status: 'active' | 'inactive' | 'pending'
}

export interface KPIData {
  totalRecords: number
  activeRecords: number
  averageValue: number
  totalDeviation: number
}

export interface CategoryData {
  category: string
  count: number
  averageValue: number
  totalDeviation: number
}

export interface PersonData {
  person: string
  area: string
  records: number
  averageValue: number
  totalDeviation: number
}

export class DatasetService {
  private static categories = [
    'Development',
    'Design',
    'Marketing',
    'Sales',
    'Support',
    'Operations',
    'HR',
    'Finance'
  ]

  private static areas = [
    'North',
    'South',
    'East',
    'West',
    'Central'
  ]

  private static statuses: MockRecord['status'][] = ['active', 'inactive', 'pending']

  /**
   * Generate mock records dataset
   */
  static generateRecords(count: number = 100): MockRecord[] {
    const records: MockRecord[] = []

    for (let i = 0; i < count; i++) {
      const category = rng.randomChoice(this.categories)
      const area = rng.randomChoice(this.areas)
      const person = faker.person.fullName()
      const value = rng.random(100, 10000)
      const deviation = rng.random(-500, 500)
      const date = faker.date.recent({ days: 30 }).toISOString().split('T')[0]
      const status = rng.randomChoice(this.statuses)

      records.push({
        id: faker.string.uuid(),
        category,
        area,
        person,
        value: Math.round(value),
        deviation: Math.round(deviation),
        date,
        status
      })
    }

    return records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }

  /**
   * Calculate KPI data from records
   */
  static calculateKPIs(records: MockRecord[]): KPIData {
    const totalRecords = records.length
    const activeRecords = records.filter(r => r.status === 'active').length
    const averageValue = records.reduce((sum, r) => sum + r.value, 0) / totalRecords
    const totalDeviation = records.reduce((sum, r) => sum + r.deviation, 0)

    return {
      totalRecords,
      activeRecords,
      averageValue: Math.round(averageValue),
      totalDeviation: Math.round(totalDeviation)
    }
  }

  /**
   * Group records by category
   */
  static groupByCategory(records: MockRecord[]): CategoryData[] {
    const grouped = records.reduce((acc, record) => {
      if (!acc[record.category]) {
        acc[record.category] = {
          category: record.category,
          count: 0,
          totalValue: 0,
          totalDeviation: 0
        }
      }
      
      acc[record.category].count++
      acc[record.category].totalValue += record.value
      acc[record.category].totalDeviation += record.deviation
      
      return acc
    }, {} as Record<string, { category: string; count: number; totalValue: number; totalDeviation: number }>)

    return Object.values(grouped).map(group => ({
      category: group.category,
      count: group.count,
      averageValue: Math.round(group.totalValue / group.count),
      totalDeviation: Math.round(group.totalDeviation)
    })).sort((a, b) => b.count - a.count)
  }

  /**
   * Group records by person
   */
  static groupByPerson(records: MockRecord[]): PersonData[] {
    const grouped = records.reduce((acc, record) => {
      if (!acc[record.person]) {
        acc[record.person] = {
          person: record.person,
          area: record.area,
          records: 0,
          totalValue: 0,
          totalDeviation: 0
        }
      }
      
      acc[record.person].records++
      acc[record.person].totalValue += record.value
      acc[record.person].totalDeviation += record.deviation
      
      return acc
    }, {} as Record<string, { person: string; area: string; records: number; totalValue: number; totalDeviation: number }>)

    return Object.values(grouped).map(group => ({
      person: group.person,
      area: group.area,
      records: group.records,
      averageValue: Math.round(group.totalValue / group.records),
      totalDeviation: Math.round(group.totalDeviation)
    })).sort((a, b) => b.records - a.records)
  }

  /**
   * Get area distribution data
   */
  static getAreaDistribution(records: MockRecord[]): { area: string; count: number; percentage: number }[] {
    const grouped = records.reduce((acc, record) => {
      acc[record.area] = (acc[record.area] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const total = records.length

    return Object.entries(grouped).map(([area, count]) => ({
      area,
      count,
      percentage: Math.round((count / total) * 100)
    })).sort((a, b) => b.count - a.count)
  }

  /**
   * Get deviation ranges for heatmap
   */
  static getDeviationRanges(records: MockRecord[]): { range: string; count: number; color: string }[] {
    const ranges = [
      { min: -Infinity, max: -200, label: 'Very Low', color: '#dc2626' },
      { min: -200, max: -50, label: 'Low', color: '#f97316' },
      { min: -50, max: 50, label: 'Normal', color: '#10b981' },
      { min: 50, max: 200, label: 'High', color: '#3b82f6' },
      { min: 200, max: Infinity, label: 'Very High', color: '#8b5cf6' }
    ]

    return ranges.map(range => {
      const count = records.filter(r => r.deviation >= range.min && r.deviation < range.max).length
      return {
        range: range.label,
        count,
        color: range.color
      }
    })
  }
}

