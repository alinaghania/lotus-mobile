import { StyleSheet, Dimensions } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');
const isSmallScreen = screenWidth < 380;

export const characterStyles = StyleSheet.create({
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
  
  // Error Screen
  errorContainer: {
    flex: 1,
    backgroundColor: '#f9fafb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#dc2626',
    fontSize: 18,
  },

  // Main Card
  mainCard: {
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
    marginBottom: 16,
  },
  
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  endolotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fbbf24',
  },
  endolotsText: {
    fontWeight: 'bold',
    color: '#d97706',
  },
  stepText: {
    fontSize: 14,
    color: '#6b7280',
  },
  skippedText: {
    fontSize: 12,
    color: '#2563eb',
    fontWeight: '600',
  },

  // Progress Bar
  progressBarContainer: {
    width: '100%',
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    height: 8,
    marginBottom: 24,
  },
  progressBar: {
    backgroundColor: '#111827',
    height: 8,
    borderRadius: 4,
  },

  // Preview Section
  previewSection: {
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 24,
    alignItems: 'center',
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },

  // Step Content
  stepContent: {
    // Content sections spaced with marginBottom
  },
  stepHeader: {
    alignItems: 'center',
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  stepSubtitle: {
    color: '#6b7280',
    textAlign: 'center',
  },
  warningText: {
    fontSize: 12,
    color: '#2563eb',
    marginTop: 4,
    fontWeight: '600',
    textAlign: 'center',
  },

  // Options Section
  optionsSection: {
    marginBottom: 16,
  },
  optionsSectionTitle: {
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  premiumSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },

  // Option Button
  optionButton: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    minWidth: isSmallScreen ? 70 : 80,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    marginBottom: 8,
    flex: 0,
  },
  optionButtonSelected: {
    borderColor: '#111827',
    backgroundColor: '#111827',
  },
  optionButtonDefault: {
    borderColor: '#e5e7eb',
  },
  optionButtonPurchased: {
    borderColor: '#10b981',
  },
  optionButtonAffordable: {
    borderColor: '#fbbf24',
  },
  optionButtonUnaffordable: {
    borderColor: '#e5e7eb',
    opacity: 0.5,
  },
  colorOption: {
    width: 32,
    height: 32,
    borderRadius: 4,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '500',
    textTransform: 'capitalize',
    textAlign: 'center',
  },
  optionTextSelected: {
    color: 'white',
  },
  optionTextDefault: {
    color: '#374151',
  },

  // Premium Option Container
  premiumOptionContainer: {
    position: 'relative',
  },
  statusBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusBadgePurchased: {
    backgroundColor: '#10b981',
  },
  statusBadgeDefault: {
    backgroundColor: '#000',
  },
  statusBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  priceLabel: {
    position: 'absolute',
    bottom: -8,
    left: '50%',
    transform: [{ translateX: -15 }],
  },
  priceLabelText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#d97706',
  },

  // Navigation
  navigationContainer: {
    flexDirection: 'row',
    paddingTop: 24,
    gap: 16,
  },
  navButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navButtonSecondary: {
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  navButtonPrimary: {
    backgroundColor: '#111827',
  },
  navButtonSuccess: {
    backgroundColor: '#059669',
  },
  navButtonText: {
    textAlign: 'center',
    fontWeight: '600',
  },
  navButtonTextSecondary: {
    color: '#374151',
  },
  navButtonTextPrimary: {
    color: 'white',
  },
  navButtonLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  modalPreview: {
    alignItems: 'center',
    marginBottom: 16,
  },
  modalItemName: {
    fontWeight: 'bold',
    fontSize: 18,
    marginTop: 8,
  },
  modalRarityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4,
  },
  modalRarityBadgeRare: {
    backgroundColor: '#dbeafe',
  },
  modalRarityBadgeEpic: {
    backgroundColor: '#f3e8ff',
  },
  modalRarityBadgeCommon: {
    backgroundColor: '#f3f4f6',
  },
  modalRarityText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  modalRarityTextRare: {
    color: '#2563eb',
  },
  modalRarityTextEpic: {
    color: '#7c3aed',
  },
  modalRarityTextCommon: {
    color: '#374151',
  },

  // Price Section
  priceSection: {
    gap: 16,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    color: '#6b7280',
  },
  priceValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  priceAmount: {
    fontWeight: 'bold',
    fontSize: 20,
    color: '#d97706',
  },
  priceCurrency: {
    color: '#d97706',
  },

  // Action Buttons
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  actionButtonSecondary: {
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  actionButtonPrimary: {
    backgroundColor: '#059669',
  },
  actionButtonText: {
    textAlign: 'center',
    fontWeight: '600',
  },
  actionButtonTextSecondary: {
    color: '#374151',
  },
  actionButtonTextPrimary: {
    color: 'white',
  },
  actionButtonLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  // Error States
  insufficientFunds: {
    textAlign: 'center',
    marginBottom: 12,
  },
  insufficientFundsText: {
    color: '#dc2626',
    fontWeight: '600',
  },
  singleActionButton: {
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
  },
  singleActionButtonText: {
    textAlign: 'center',
    fontWeight: '600',
    color: '#374151',
  },
}); 