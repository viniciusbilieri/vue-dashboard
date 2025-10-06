/**
 * Analytics types and interfaces
 * Defines data structures for dashboard analytics
 */

// Base record interface
export interface AnalyticsRecord {
  id: string
  category: string
  area: string
  person: string
  value: number
  deviation: number
  date: string
  status: 'active' | 'inactive' | 'pending'
}

// KPI interfaces
export interface KPIMetric {
  label: string
  value: number
  change?: number
  changeType?: 'increase' | 'decrease' | 'neutral'
  format?: 'number' | 'currency' | 'percentage'
  icon?: string
  color?: string
}

export interface KPIDashboard {
  totalRecords: KPIMetric
  activeRecords: KPIMetric
  averageValue: KPIMetric
  totalDeviation: KPIMetric
}

// Chart data interfaces
export interface ChartDataPoint {
  label: string
  value: number
  color?: string
}

export interface ChartDataset {
  label: string
  data: number[]
  backgroundColor?: string | string[]
  borderColor?: string | string[]
  borderWidth?: number
}

export interface ChartConfig {
  type: 'bar' | 'line' | 'doughnut' | 'area'
  data: {
    labels: string[]
    datasets: ChartDataset[]
  }
  options?: Record<string, any>
}

// Category analytics
export interface CategoryAnalytics {
  category: string
  count: number
  percentage: number
  averageValue: number
  totalDeviation: number
  trend: 'up' | 'down' | 'stable'
}

// Person analytics
export interface PersonAnalytics {
  person: string
  area: string
  recordCount: number
  averageValue: number
  totalDeviation: number
  performance: 'excellent' | 'good' | 'average' | 'poor'
  lastActivity: string
}

// Area analytics
export interface AreaAnalytics {
  area: string
  recordCount: number
  percentage: number
  averageValue: number
  totalDeviation: number
  topCategory: string
  topPerson: string
}

// Deviation analytics
export interface DeviationAnalytics {
  range: string
  count: number
  percentage: number
  color: string
  description: string
}

// Time series data
export interface TimeSeriesPoint {
  date: string
  value: number
  deviation: number
  count: number
}

export interface TimeSeriesData {
  period: 'daily' | 'weekly' | 'monthly'
  data: TimeSeriesPoint[]
  trend: 'up' | 'down' | 'stable'
  averageGrowth: number
}

// Filter interfaces
export interface FilterOption {
  label: string
  value: string
  count?: number
  disabled?: boolean
}

export interface FilterGroup {
  label: string
  options: FilterOption[]
  multiSelect?: boolean
}

export interface DateRange {
  start: Date
  end: Date
}

export interface AnalyticsFilters {
  category?: string
  area?: string
  status?: string
  person?: string
  dateRange?: DateRange
  valueRange?: {
    min: number
    max: number
  }
  deviationRange?: {
    min: number
    max: number
  }
}

// Dashboard layout
export interface DashboardWidget {
  id: string
  title: string
  type: 'chart' | 'kpi' | 'table' | 'heatmap'
  size: 'small' | 'medium' | 'large' | 'full'
  position: {
    x: number
    y: number
    w: number
    h: number
  }
  config: Record<string, any>
  visible: boolean
}

export interface DashboardLayout {
  widgets: DashboardWidget[]
  columns: number
  rows: number
}

// Export types
export interface ExportOptions {
  format: 'csv' | 'xlsx' | 'json'
  includeCharts?: boolean
  dateRange?: DateRange
  filters?: AnalyticsFilters
}

// API response types
export interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
  errors?: string[]
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Heatmap specific types
export interface HeatmapCell {
  x: string
  y: string
  value: number
  color: string
  tooltip: string
}

export interface HeatmapData {
  title: string
  xAxis: string[]
  yAxis: string[]
  cells: HeatmapCell[]
  colorScale: {
    min: number
    max: number
    colors: string[]
  }
}

// Performance metrics
export interface PerformanceMetrics {
  loadTime: number
  renderTime: number
  dataFetchTime: number
  errorCount: number
  lastUpdated: string
}

// Alert types
export interface Alert {
  id: string
  type: 'info' | 'warning' | 'error' | 'success'
  title: string
  message: string
  timestamp: string
  read: boolean
  actions?: Array<{
    label: string
    action: string
    severity: 'primary' | 'secondary' | 'danger'
  }>
}

