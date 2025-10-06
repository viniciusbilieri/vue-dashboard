/**
 * TypeScript type definitions for dashboard data structures
 */

export interface FilterOptions {
  dateRange: {
    start: Date
    end: Date
  }
  category: string
  status: string
}

export interface SalesData {
  month: string
  sales: number
  revenue: number
}

export interface UserActivity {
  hour: number
  activeUsers: number
  sessions: number
}

export interface ProductPerformance {
  product: string
  sales: number
  revenue: number
  growth: number
}

export interface TableRow {
  id: string
  customer: string
  product: string
  amount: number
  status: 'completed' | 'pending' | 'cancelled'
  date: string
}

export interface ChartData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    backgroundColor?: string | string[]
    borderColor?: string | string[]
    borderWidth?: number
  }[]
}
