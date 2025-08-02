import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollContainer: {
    flex: 1,
  },
  padding: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  dateText: {
    color: '#6b7280',
  },
  settingsButton: {
    backgroundColor: '#fef3c7',
    padding: 12,
    borderRadius: 24,
  },
  dateSelector: {
    marginBottom: 24,
  },
  dateSelectorButton: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  dateSelectorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ef4444', // Red and bold as requested
  },
  card: {
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
  characterCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  characterDisplay: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  lotusCardGlamour: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 24,
    alignItems: 'center',
  },
  lotusSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  lotusDisplay: {
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 20,
  },
  endolotsDisplay: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fef3c7',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#d97706',
  },
  endolotsNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#d97706',
  },
  endolotsLabel: {
    fontSize: 12,
    color: '#d97706',
    marginTop: 4,
    fontWeight: '600',
  },
  customizeButtonGlamour: {
    backgroundColor: '#7c3aed',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 20,
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  customizeButtonTextGlamour: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  customizeButton: {
    backgroundColor: '#e5e7eb',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  customizeButtonText: {
    color: '#374151',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  characterInfo: {
    flex: 1,
  },
  characterTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  levelText: {
    color: '#6b7280',
    marginBottom: 12,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  progressPercentage: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#10b981',
  },
  progressBarContainer: {
    width: '100%',
    backgroundColor: '#e5e7eb',
    borderRadius: 8,
    height: 16,
    marginBottom: 16,
  },
  progressBar: {
    backgroundColor: '#059669', // Emerald green
    height: 16,
    borderRadius: 8,
  },
  progressSummary: {
    marginTop: 12,
    alignItems: 'center',
  },
  progressSummaryText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  progressItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressLabel: {
    fontSize: 14,
    color: '#374151',
  },
  progressRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  progressValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  quickActionsContainer: {
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  quickActionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickActionButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 70,
    borderWidth: 2,
  },
  quickActionYellow: {
    backgroundColor: '#ffffff', // White background
    borderColor: '#000000', // Black border
  },
  quickActionPurple: {
    backgroundColor: '#ffffff', // White background
    borderColor: '#000000', // Black border
  },
  quickActionBlue: {
    backgroundColor: '#ffffff', // White background
    borderColor: '#000000', // Black border
  },
  quickActionGreen: {
    backgroundColor: '#ffffff', // White background
    borderColor: '#000000', // Black border
  },
  quickActionText: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 8,
  },
  quickActionTextYellow: {
    color: '#d97706', // Amber yellow text
  },
  quickActionTextPurple: {
    color: '#7c3aed', // Purple text
  },
  quickActionTextBlue: {
    color: '#2563eb', // Dark blue text
  },
  quickActionTextGreen: {
    color: '#059669', // Emerald green text
  },
  tasksHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  tasksBadge: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  tasksBadgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  taskItem: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 12,
  },
  taskCompleted: {
    backgroundColor: '#f0fdf4',
    borderColor: '#bbf7d0',
  },
  taskRequired: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
  },
  taskOptional: {
    backgroundColor: '#f9fafb',
    borderColor: '#e5e7eb',
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  taskContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  taskText: {
    fontWeight: '500',
    marginLeft: 12,
    flex: 1,
  },
  taskTextCompleted: {
    color: '#15803d',
  },
  taskTextDefault: {
    color: '#374151',
  },
  requiredBadge: {
    backgroundColor: '#fecaca',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  requiredBadgeText: {
    fontSize: 10,
    color: '#dc2626',
    fontWeight: 'bold',
  },
  taskProgressBar: {
    width: '100%',
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    height: 8,
  },
  taskProgressFill: {
    height: 8,
    borderRadius: 4,
  },
  taskProgressCompleted: {
    backgroundColor: '#10b981',
  },
  taskProgressRequired: {
    backgroundColor: '#f87171',
  },
  taskProgressOptional: {
    backgroundColor: '#9ca3af',
  },
  taskProgressText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  continueButton: {
    marginTop: 24,
    backgroundColor: '#111827',
    paddingVertical: 16,
    borderRadius: 12,
  },
  continueButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 18,
  },
  dateSelector: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  dateSelectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateSelectorText: {
    color: '#374151',
    fontWeight: '500',
    marginHorizontal: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  calendarCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  calendarTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  weekdaysRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekdayCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  weekdayText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6b7280',
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: width * 0.12,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 1,
  },
  selectedDay: {
    backgroundColor: '#111827',
    borderRadius: 8,
  },
  dayText: {
    fontSize: 14,
  },
  selectedDayText: {
    color: 'white',
    fontWeight: 'bold',
  },
  todayText: {
    color: '#111827',
    fontWeight: 'bold',
  },
  currentMonthText: {
    color: '#374151',
  },
  otherMonthText: {
    color: '#d1d5db',
  },
}); 