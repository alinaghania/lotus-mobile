import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export const trackingStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContainer: {
    flex: 1,
  },
  dateDisplay: {
    backgroundColor: 'white',
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ef4444', // Red and bold like in Home
  },
  padding: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
  },
  content: {
    marginTop: 16,
  },

  // Progress Card Styles
  progressCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  progressPercentage: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#059669', // Emerald green
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#059669', // Emerald green
    borderRadius: 8,
  },
  progressBreakdown: {
    alignItems: 'center',
  },
  progressLabel: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  // Success Message Styles (100% completion)
  successMessage: {
    backgroundColor: '#f0fdf4', // Light green background
    borderRadius: 12,
    padding: 16,
    marginVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  successText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#059669', // Emerald green
    marginBottom: 4,
  },
  successSubtext: {
    fontSize: 14,
    color: '#047857',
    textAlign: 'center',
    fontWeight: '500',
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

  // Tab Styles with improved colors
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 16,
    paddingHorizontal: 4,
    paddingVertical: 2,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTab: {
    backgroundColor: '#7c3aed', // Purple
  },
  tabText: {
    fontSize: 11,
    fontWeight: '600',
  },
  activeTabText: {
    color: 'white',
  },
  inactiveTabText: {
    color: '#6b7280',
  },

  // Content Card Styles with better spacing
  contentCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  contentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  contentTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    flex: 1,
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
    alignItems: 'center',
    marginTop: 12,
    gap: 8,
  },
  navButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
  },
  navButtonDisabled: {
    backgroundColor: '#f3f4f6',
    borderColor: '#e5e7eb',
  },
  navButtonEnabled: {
    backgroundColor: '#f3f4f6',
  },
  navButtonPrimary: {
    backgroundColor: '#111827',
    borderColor: '#111827',
  },
  navButtonTextDisabled: {
    color: '#6b7280',
    fontWeight: '700',
  },
  navButtonTextEnabled: {
    fontWeight: '600',
    color: '#374151',
  },
  navButtonTextPrimary: {
    color: 'white',
    fontWeight: '700',
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

  // Camera analyze button
  cameraButton: {
    marginTop: 8,
    marginBottom: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    flex: 1,
  },
  cameraButtonText: {
    fontWeight: '600',
    color: '#374151',
  },

  // Modal + progress
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 4,
    width: '100%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  modalSubtitle: {
    marginTop: 4,
    color: '#6b7280',
  },
  modalImage: {
    width: '100%',
    height: 180,
    borderRadius: 8,
    marginTop: 12,
    marginBottom: 12,
    backgroundColor: '#f3f4f6',
  },
  modalImageContainer: {
    position: 'relative',
  },
  imageProgressOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  imageProgressTrack: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.35)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  imageProgressFill: {
    height: '100%',
    backgroundColor: '#f59e0b',
    borderRadius: 4,
  },
  modalTopProgressContainer: {
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  modalTopProgressFill: {
    height: '100%',
    backgroundColor: '#7c3aed',
  },

  // Calories styles
  caloriesRow: {
    marginTop: 10,
  },
  caloriesText: {
    color: '#6b7280',
    fontSize: 14,
  },
  caloriesHighlight: {
    color: '#f59e0b',
    fontWeight: '700',
  },
}); 