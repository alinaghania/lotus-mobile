import { StyleSheet } from 'react-native';

export const analyticsStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollContainer: {
    flex: 1,
    padding: 24,
  },
  
  // Header Card
  headerCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#111827',
  },
  headerSubtitle: {
    color: '#6b7280',
    marginBottom: 16,
  },

  // Filter Buttons
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 8,
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  filterButtonText: {
    textAlign: 'center',
    fontSize: 12,
  },
  filterButtonTextActive: {
    fontWeight: '500',
    color: '#111827',
  },
  filterButtonTextInactive: {
    color: '#6b7280',
  },

  // Section Card
  sectionCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#000',
    paddingBottom: 4,
  },

  // KPI Cards
  kpiContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  kpiCard: {
    backgroundColor: '#f3f4f6',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#d1d5db',
    alignItems: 'center',
    width: '48%',
    marginBottom: 8,
  },
  kpiLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
    textAlign: 'center',
  },
  kpiValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },

  // Chart Styles
  chartContainer: {
    marginTop: 16,
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  chartItemsContainer: {
    // Items will be spaced using marginBottom
  },
  chartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  chartLabel: {
    fontSize: 12,
    color: '#6b7280',
    width: 48,
  },
  chartBarContainer: {
    flex: 1,
    backgroundColor: '#e5e7eb',
    height: 16,
    borderRadius: 4,
  },
  chartBar: {
    height: 16,
    borderRadius: 4,
  },
  chartValue: {
    fontSize: 12,
    color: '#6b7280',
    width: 24,
    textAlign: 'right',
  },
  chartFooter: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 8,
  },

  // Chart Colors
  chartBarBlue: {
    backgroundColor: '#3b82f6',
  },
  chartBarPurple: {
    backgroundColor: '#8b5cf6',
  },
  chartBarGreen: {
    backgroundColor: '#10b981',
  },
  chartBarGray: {
    backgroundColor: '#6b7280',
  },

  // Analysis Section
  analysisContainer: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 16,
  },
  analysisTitle: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
  },
  analysisItemsContainer: {
    // Items will be spaced using marginBottom
  },
  analysisItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  analysisLabel: {
    fontSize: 12,
    color: '#6b7280',
    width: 64,
  },
  analysisBarContainer: {
    flex: 1,
    backgroundColor: '#e5e7eb',
    height: 12,
    borderRadius: 4,
  },
  analysisBar: {
    backgroundColor: '#10b981',
    height: 12,
    borderRadius: 4,
  },
  analysisValue: {
    fontSize: 12,
    color: '#6b7280',
    width: 32,
    textAlign: 'right',
  },

  // Table Styles
  tableContainer: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 16,
  },
  table: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    overflow: 'hidden',
  },
  tableHeader: {
    backgroundColor: '#f3f4f6',
    flexDirection: 'row',
    paddingVertical: 8,
  },
  tableHeaderText: {
    flex: 1,
    textAlign: 'center',
    fontWeight: '600',
    color: '#374151',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  tableRowEven: {
    backgroundColor: 'white',
  },
  tableRowOdd: {
    backgroundColor: '#f9fafb',
  },
  tableCell: {
    flex: 1,
    textAlign: 'center',
    color: '#1f2937',
  },

  // Insights Styles
  insightsSection: {
    marginBottom: 16,
  },
  insightsTitle: {
    fontWeight: '600',
    marginBottom: 8,
  },
  insightsTitleAlert: {
    color: '#dc2626',
  },
  insightsTitlePositive: {
    color: '#059669',
  },
  insightsTitleRecommendation: {
    color: '#2563eb',
  },
  insightsItem: {
    fontSize: 14,
    marginBottom: 4,
  },
  insightsItemAlert: {
    color: '#dc2626',
  },
  insightsItemPositive: {
    color: '#059669',
  },
  insightsItemRecommendation: {
    color: '#2563eb',
  },
}); 