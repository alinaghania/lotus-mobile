import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export const trackingStyles = StyleSheet.create({
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
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  headerSubtitle: {
    color: '#6b7280',
    fontSize: 16,
  },
  
  // Progress Bar Styles
  progressCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  progressPercentage: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10b981',
  },
  progressBarContainer: {
    width: '100%',
    backgroundColor: '#e5e7eb',
    borderRadius: 6,
    height: 12,
    marginBottom: 12,
  },
  progressBar: {
    backgroundColor: '#10b981',
    height: 12,
    borderRadius: 6,
  },
  progressBreakdown: {
    gap: 8,
  },
  progressItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabel: {
    fontSize: 14,
    color: '#374151',
  },
  progressValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  requiredSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  requiredTitle: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 8,
  },
  requiredItemsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  requiredItemCompleted: {
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  requiredItemIncomplete: {
    backgroundColor: '#fef2f2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  requiredItemTextCompleted: {
    fontSize: 12,
    color: '#15803d',
  },
  requiredItemTextIncomplete: {
    fontSize: 12,
    color: '#dc2626',
  },

  // Tabs Styles
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 2,
    borderColor: '#000',
  },
  tabText: {
    textAlign: 'center',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#000',
  },
  inactiveTabText: {
    color: '#6b7280',
  },

  // Content Card Styles
  contentCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  contentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  contentTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  contentSubtitle: {
    color: '#6b7280',
    marginBottom: 16,
  },

  // Badge Styles
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
  optionalBadge: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  optionalBadgeText: {
    fontSize: 10,
    color: '#2563eb',
    fontWeight: 'bold',
  },

  // Symptoms Styles
  symptomsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  symptomButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 2,
  },
  symptomButtonSelected: {
    backgroundColor: '#fef2f2',
    borderColor: '#fca5a5',
  },
  symptomButtonUnselected: {
    backgroundColor: '#f9fafb',
    borderColor: '#e5e7eb',
  },
  symptomTextSelected: {
    fontWeight: '500',
    color: '#dc2626',
  },
  symptomTextUnselected: {
    fontWeight: '500',
    color: '#374151',
  },

  // Fasting Checkbox Styles
  fastingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  fastingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 2,
    gap: 8,
  },
  fastingButtonSelected: {
    backgroundColor: '#fff7ed',
    borderColor: '#fdba74',
  },
  fastingButtonUnselected: {
    backgroundColor: '#f9fafb',
    borderColor: '#e5e7eb',
  },
  fastingCheckbox: {
    width: 16,
    height: 16,
    borderRadius: 4,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fastingCheckboxSelected: {
    backgroundColor: '#f97316',
    borderColor: '#f97316',
  },
  fastingCheckboxUnselected: {
    borderColor: '#d1d5db',
  },
  fastingTextSelected: {
    fontSize: 14,
    color: '#c2410c',
  },
  fastingTextUnselected: {
    fontSize: 14,
    color: '#374151',
  },

  // Selected Items Styles
  selectedItemsContainer: {
    marginTop: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  selectedItem: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  selectedItemFasting: {
    backgroundColor: '#fed7aa',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  selectedItemText: {
    color: '#1f2937',
    fontSize: 14,
  },
  selectedItemTextFasting: {
    color: '#c2410c',
    fontSize: 14,
  },

  // Drink Quantity Styles
  drinkQuantityContainer: {
    marginTop: 16,
    gap: 8,
  },
  drinkQuantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  drinkQuantityLabel: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  drinkQuantityLabelText: {
    color: '#1f2937',
    fontSize: 14,
  },
  drinkQuantityInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
  },

  // Navigation Styles
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  navButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  navButtonDisabled: {
    backgroundColor: '#e5e7eb',
  },
  navButtonEnabled: {
    backgroundColor: '#f3f4f6',
  },
  navButtonPrimary: {
    backgroundColor: '#111827',
  },
  navButtonTextDisabled: {
    fontWeight: '600',
    color: '#9ca3af',
  },
  navButtonTextEnabled: {
    fontWeight: '600',
    color: '#374151',
  },
  navButtonTextPrimary: {
    color: 'white',
    fontWeight: '600',
  },

  // Sport Activity Styles
  sportActivitiesContainer: {
    marginTop: 16,
    gap: 12,
  },
  sportActivityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sportActivityLabel: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  sportActivityLabelText: {
    color: '#1f2937',
    fontSize: 14,
  },
  sportActivityInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
  },
  sportActivityCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  sportActivityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  
  // Routine toggle styles
  routineToggleContainer: {
    marginBottom: 16,
  },
  routineToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  routineCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  routineCheckboxSelected: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  routineCheckboxUnselected: {
    borderColor: '#d1d5db',
  },
  routineToggleText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  routineHint: {
    fontSize: 12,
    color: '#6b7280',
    fontStyle: 'italic',
    marginLeft: 32,
  },

  // Cycle Options Styles
  cycleOptionsContainer: {
    gap: 12,
    marginBottom: 24,
  },
  cycleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    gap: 12,
  },
  cycleOptionSelected: {
    backgroundColor: '#fdf2f8',
    borderColor: '#f9a8d4',
  },
  cycleOptionUnselected: {
    backgroundColor: '#f9fafb',
    borderColor: '#e5e7eb',
  },
  cycleOptionRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cycleOptionRadioSelected: {
    backgroundColor: '#ec4899',
    borderColor: '#ec4899',
  },
  cycleOptionRadioUnselected: {
    borderColor: '#d1d5db',
  },
  cycleOptionTextSelected: {
    color: '#be185d',
  },
  cycleOptionTextUnselected: {
    color: '#374151',
  },

  // Save Button Styles
  saveButton: {
    backgroundColor: '#111827',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 24,
  },
  saveButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 16,
  },

  // Success Toast Styles
  successToast: {
    position: 'absolute',
    top: 64,
    right: 16,
    backgroundColor: '#10b981',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 50,
  },
  successToastText: {
    color: 'white',
    fontWeight: '600',
  },
}); 