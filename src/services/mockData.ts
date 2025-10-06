/**
 * Mock data services with deterministic seed data
 * Provides consistent data for dashboard components
 */
import type {
  SalesData,
  UserActivity,
  ProductPerformance,
  TableRow,
  ChartData,
  FilterOptions,
} from '@/types'

// Deterministic seed data for consistent results
const SEED_DATA = {
  sales: [
    { month: 'Jan', sales: 1200, revenue: 24000 },
    { month: 'Fev', sales: 1900, revenue: 38000 },
    { month: 'Mar', sales: 3000, revenue: 60000 },
    { month: 'Abr', sales: 2800, revenue: 56000 },
    { month: 'Mai', sales: 1890, revenue: 37800 },
    { month: 'Jun', sales: 2390, revenue: 47800 },
  ],
  userActivity: [
    { hour: 0, activeUsers: 45, sessions: 67 },
    { hour: 1, activeUsers: 23, sessions: 34 },
    { hour: 2, activeUsers: 12, sessions: 18 },
    { hour: 3, activeUsers: 8, sessions: 12 },
    { hour: 4, activeUsers: 15, sessions: 22 },
    { hour: 5, activeUsers: 28, sessions: 41 },
    { hour: 6, activeUsers: 67, sessions: 98 },
    { hour: 7, activeUsers: 134, sessions: 201 },
    { hour: 8, activeUsers: 298, sessions: 445 },
    { hour: 9, activeUsers: 456, sessions: 682 },
    { hour: 10, activeUsers: 523, sessions: 784 },
    { hour: 11, activeUsers: 489, sessions: 733 },
    { hour: 12, activeUsers: 567, sessions: 850 },
    { hour: 13, activeUsers: 612, sessions: 918 },
    { hour: 14, activeUsers: 634, sessions: 951 },
    { hour: 15, activeUsers: 598, sessions: 897 },
    { hour: 16, activeUsers: 534, sessions: 801 },
    { hour: 17, activeUsers: 467, sessions: 700 },
    { hour: 18, activeUsers: 389, sessions: 583 },
    { hour: 19, activeUsers: 298, sessions: 447 },
    { hour: 20, activeUsers: 234, sessions: 351 },
    { hour: 21, activeUsers: 167, sessions: 250 },
    { hour: 22, activeUsers: 123, sessions: 184 },
    { hour: 23, activeUsers: 89, sessions: 133 },
  ],
  productPerformance: [
    { product: 'Produto A', sales: 2450, revenue: 49000, growth: 12.5 },
    { product: 'Produto B', sales: 1890, revenue: 37800, growth: 8.3 },
    { product: 'Produto C', sales: 3200, revenue: 64000, growth: 15.7 },
    { product: 'Produto D', sales: 1567, revenue: 31340, growth: 5.2 },
    { product: 'Produto E', sales: 2890, revenue: 57800, growth: 18.9 },
  ],
  tableData: [
    {
      id: '1',
      customer: 'João Silva',
      product: 'Produto A',
      amount: 1250,
      status: 'completed' as const,
      date: '2024-01-15',
    },
    {
      id: '2',
      customer: 'Maria Santos',
      product: 'Produto B',
      amount: 890,
      status: 'pending' as const,
      date: '2024-01-16',
    },
    {
      id: '3',
      customer: 'Pedro Costa',
      product: 'Produto C',
      amount: 2100,
      status: 'completed' as const,
      date: '2024-01-17',
    },
    {
      id: '4',
      customer: 'Ana Oliveira',
      product: 'Produto A',
      amount: 750,
      status: 'cancelled' as const,
      date: '2024-01-18',
    },
    {
      id: '5',
      customer: 'Carlos Ferreira',
      product: 'Produto D',
      amount: 1500,
      status: 'completed' as const,
      date: '2024-01-19',
    },
    {
      id: '6',
      customer: 'Lucia Martins',
      product: 'Produto E',
      amount: 3200,
      status: 'pending' as const,
      date: '2024-01-20',
    },
    {
      id: '7',
      customer: 'Roberto Lima',
      product: 'Produto B',
      amount: 980,
      status: 'completed' as const,
      date: '2024-01-21',
    },
    {
      id: '8',
      customer: 'Fernanda Rocha',
      product: 'Produto C',
      amount: 1800,
      status: 'pending' as const,
      date: '2024-01-22',
    },
  ],
}

export class MockDataService {
  /**
   * Get sales data for line chart
   */
  static getSalesData(): SalesData[] {
    return [...SEED_DATA.sales]
  }

  /**
   * Get user activity data for area chart
   */
  static getUserActivityData(): UserActivity[] {
    return [...SEED_DATA.userActivity]
  }

  /**
   * Get product performance data for bar chart
   */
  static getProductPerformanceData(): ProductPerformance[] {
    return [...SEED_DATA.productPerformance]
  }

  /**
   * Get table data with filtering support
   */
  static getTableData(filters?: FilterOptions): TableRow[] {
    let data = [...SEED_DATA.tableData]

    if (filters) {
      if (filters.status && filters.status !== 'all') {
        data = data.filter((row) => row.status === filters.status)
      }
      if (filters.category && filters.category !== 'all') {
        data = data.filter((row) => row.product === filters.category)
      }
    }

    return data
  }

  /**
   * Get revenue distribution data for doughnut chart
   */
  static getRevenueDistributionData(): ChartData {
    const products = SEED_DATA.productPerformance
    return {
      labels: products.map((p) => p.product),
      datasets: [
        {
          label: 'Receita (R$)',
          data: products.map((p) => p.revenue),
          backgroundColor: ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'],
          borderColor: ['#2563eb', '#dc2626', '#059669', '#d97706', '#7c3aed'],
          borderWidth: 2,
        },
      ],
    }
  }

  /**
   * Get filter options
   */
  static getFilterOptions() {
    return {
      categories: [
        { label: 'Todos', value: 'all' },
        { label: 'Produto A', value: 'Produto A' },
        { label: 'Produto B', value: 'Produto B' },
        { label: 'Produto C', value: 'Produto C' },
        { label: 'Produto D', value: 'Produto D' },
        { label: 'Produto E', value: 'Produto E' },
      ],
      statuses: [
        { label: 'Todos', value: 'all' },
        { label: 'Concluído', value: 'completed' },
        { label: 'Pendente', value: 'pending' },
        { label: 'Cancelado', value: 'cancelled' },
      ],
      dateRange: {
        start: new Date('2024-01-01'),
        end: new Date('2024-12-31'),
      },
    }
  }
}

