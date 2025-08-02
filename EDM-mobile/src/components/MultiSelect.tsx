import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Modal, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { saveCustomOption } from '../constants/meals';

interface MultiSelectProps {
  label: string;
  options: string[];
  value: string[];
  onChange: (values: string[]) => void;
  allowOther?: boolean;
  disabled?: boolean;
  category?: string; // For saving custom options
}

const multiSelectStyles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  containerDisabled: {
    opacity: 0.5,
  },
  selectButton: {
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 12,
    backgroundColor: 'white',
    minHeight: 56,
  },
  selectButtonActive: {
    borderColor: '#111827',
  },
  label: {
    color: '#6b7280',
    fontSize: 12,
    marginBottom: 4,
    fontWeight: '500',
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  valueText: {
    color: '#111827',
    fontSize: 16,
    flex: 1,
  },
  placeholderText: {
    color: '#9ca3af',
    fontSize: 16,
  },
  chevron: {
    marginLeft: 8,
  },
  
  // Selected items preview
  selectedItemsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  selectedItem: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    marginRight: 4,
  },
  selectedItemText: {
    color: '#374151',
    fontSize: 12,
    marginRight: 4,
  },
  removeButton: {
    padding: 2,
  },

  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: 'white',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  doneButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#111827',
    borderRadius: 8,
  },
  doneButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  
  // Search bar
  searchContainer: {
    marginBottom: 16,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    backgroundColor: '#f9fafb',
  },
  
  // Options grid
  optionsContainer: {
    // Options spaced with marginBottom
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 4,
  },
  optionButtonSelected: {
    backgroundColor: '#111827',
    borderColor: '#111827',
  },
  optionButtonUnselected: {
    backgroundColor: 'white',
    borderColor: '#e5e7eb',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionCheckboxSelected: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  optionCheckboxUnselected: {
    borderColor: '#d1d5db',
  },
  optionText: {
    fontSize: 16,
    flex: 1,
  },
  optionTextSelected: {
    color: 'white',
    fontWeight: '500',
  },
  optionTextUnselected: {
    color: '#374151',
  },

  // Add other section
  addOtherSection: {
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  addOtherButton: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  addOtherButtonText: {
    color: '#6b7280',
    fontWeight: '500',
  },
  addOtherInputContainer: {
    // Inputs spaced with marginBottom
  },
  addOtherInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    backgroundColor: 'white',
    marginBottom: 8,
  },
  addOtherActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  addButton: {
    backgroundColor: '#111827',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
    marginRight: 8,
  },
  addButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#e5e7eb',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#6b7280',
    fontWeight: '600',
  },
});

export default function MultiSelect({ 
  label, 
  options, 
  value, 
  onChange, 
  allowOther = false, 
  disabled = false,
  category
}: MultiSelectProps) {
  const [showModal, setShowModal] = useState(false);
  const [otherText, setOtherText] = useState('');
  const [showOtherInput, setShowOtherInput] = useState(false);
  const [searchText, setSearchText] = useState('');

  const filteredOptions = options.filter(option => 
    option.toLowerCase().includes(searchText.toLowerCase())
  );

  const toggleOption = (option: string) => {
    if (disabled) return;
    
    if (value.includes(option)) {
      onChange(value.filter(v => v !== option));
    } else {
      onChange([...value, option]);
    }
  };

  const removeItem = (item: string) => {
    onChange(value.filter(v => v !== item));
  };

  const addOther = async () => {
    if (otherText.trim() && !value.includes(otherText.trim())) {
      const customOption = otherText.trim();
      onChange([...value, customOption]);
      
      // Save custom option for future use
      if (category) {
        await saveCustomOption(category, customOption);
      }
      
      setOtherText('');
      setShowOtherInput(false);
    }
  };

  return (
    <View style={[multiSelectStyles.container, disabled && multiSelectStyles.containerDisabled]}>
      <TouchableOpacity
        onPress={() => !disabled && setShowModal(true)}
        style={[
          multiSelectStyles.selectButton,
          value.length > 0 && multiSelectStyles.selectButtonActive
        ]}
      >
        <Text style={multiSelectStyles.label}>{label}</Text>
        <View style={multiSelectStyles.valueContainer}>
          <Text style={value.length > 0 ? multiSelectStyles.valueText : multiSelectStyles.placeholderText}>
            {value.length > 0 ? `${value.length} selected` : 'Select options...'}
          </Text>
          <Ionicons 
            name="chevron-down" 
            size={20} 
            color="#6b7280" 
            style={multiSelectStyles.chevron}
          />
        </View>
        
        {/* Show selected items preview */}
        {value.length > 0 && value.length <= 3 && (
          <View style={multiSelectStyles.selectedItemsContainer}>
            {value.slice(0, 3).map((item) => (
              <View key={item} style={multiSelectStyles.selectedItem}>
                <Text style={multiSelectStyles.selectedItemText}>{item}</Text>
                <TouchableOpacity
                  style={multiSelectStyles.removeButton}
                  onPress={() => removeItem(item)}
                >
                  <Ionicons name="close" size={12} color="#6b7280" />
                </TouchableOpacity>
              </View>
            ))}
            {value.length > 3 && (
              <View style={multiSelectStyles.selectedItem}>
                <Text style={multiSelectStyles.selectedItemText}>+{value.length - 3} more</Text>
              </View>
            )}
          </View>
        )}
      </TouchableOpacity>

      <Modal
        visible={showModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={multiSelectStyles.modalContainer}>
          <View style={multiSelectStyles.modalHeader}>
            <Text style={multiSelectStyles.modalTitle}>Select {label}</Text>
            <TouchableOpacity 
              style={multiSelectStyles.doneButton}
              onPress={() => setShowModal(false)}
            >
              <Text style={multiSelectStyles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          </View>

          <View style={multiSelectStyles.modalContent}>
            {/* Search bar */}
            {options.length > 5 && (
              <View style={multiSelectStyles.searchContainer}>
                <TextInput
                  style={multiSelectStyles.searchInput}
                  placeholder="Search options..."
                  value={searchText}
                  onChangeText={setSearchText}
                />
              </View>
            )}

            <ScrollView style={multiSelectStyles.optionsContainer}>
              {filteredOptions.map(option => {
                const isSelected = value.includes(option);
                return (
                  <TouchableOpacity
                    key={option}
                    onPress={() => toggleOption(option)}
                    style={[
                      multiSelectStyles.optionButton,
                      isSelected ? multiSelectStyles.optionButtonSelected : multiSelectStyles.optionButtonUnselected
                    ]}
                  >
                    <View style={multiSelectStyles.optionContent}>
                      <View style={[
                        multiSelectStyles.optionCheckbox,
                        isSelected ? multiSelectStyles.optionCheckboxSelected : multiSelectStyles.optionCheckboxUnselected
                      ]}>
                        {isSelected && <Ionicons name="checkmark" size={12} color="white" />}
                      </View>
                      <Text style={[
                        multiSelectStyles.optionText,
                        isSelected ? multiSelectStyles.optionTextSelected : multiSelectStyles.optionTextUnselected
                      ]}>
                        {option}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}

              {allowOther && (
                <View style={multiSelectStyles.addOtherSection}>
                  {!showOtherInput ? (
                    <TouchableOpacity
                      onPress={() => setShowOtherInput(true)}
                      style={multiSelectStyles.addOtherButton}
                    >
                      <Text style={multiSelectStyles.addOtherButtonText}>+ Add custom option</Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={multiSelectStyles.addOtherInputContainer}>
                      <TextInput
                        style={multiSelectStyles.addOtherInput}
                        placeholder="Enter custom option"
                        value={otherText}
                        onChangeText={setOtherText}
                        autoFocus
                      />
                      <View style={multiSelectStyles.addOtherActions}>
                        <TouchableOpacity
                          onPress={addOther}
                          style={multiSelectStyles.addButton}
                        >
                          <Text style={multiSelectStyles.addButtonText}>Add</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => {
                            setShowOtherInput(false);
                            setOtherText('');
                          }}
                          style={multiSelectStyles.cancelButton}
                        >
                          <Text style={multiSelectStyles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
} 