import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  Plus,
  Minus,
  Save,
  X
} from 'lucide-react-native';
import { useReservationStore } from '../../stores/reservationStore';
import { useEquipmentStore } from '../../stores/equipmentStore';
import { colors } from '../../constants/colors';
import { formatCurrency } from '../../utils/formatters';
import type { Equipment, CreateReservationForm } from '../../types';

interface SelectedEquipment {
  equipment: Equipment;
  quantity: number;
}

const CreateReservationScreen = () => {
  const navigation = useNavigation();
  
  const { createReservation, isLoading } = useReservationStore();
  const { equipment: availableEquipment, fetchEquipment } = useEquipmentStore();

  // Form state
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date(Date.now() + 86400000)); // +1 day
  const [notes, setNotes] = useState('');
  const [depositAmount, setDepositAmount] = useState('');
  const [selectedEquipments, setSelectedEquipments] = useState<SelectedEquipment[]>([]);

  // Date picker state
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showEquipmentPicker, setShowEquipmentPicker] = useState(false);

  useEffect(() => {
    loadEquipment();
  }, []);

  const loadEquipment = async () => {
    await fetchEquipment();
  };

  // Calculate total
  const calculateTotal = () => {
    const durationDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    return selectedEquipments.reduce((sum, item) => {
      return sum + (item.equipment.dailyPrice * item.quantity * durationDays);
    }, 0);
  };

  const handleAddEquipment = (equipment: Equipment) => {
    const existing = selectedEquipments.find(e => e.equipment.id === equipment.id);
    if (existing) {
      Alert.alert('Uyarı', 'Bu ekipman zaten eklenmiş.');
      return;
    }
    setSelectedEquipments([...selectedEquipments, { equipment, quantity: 1 }]);
    setShowEquipmentPicker(false);
  };

  const handleRemoveEquipment = (equipmentId: number) => {
    setSelectedEquipments(selectedEquipments.filter(e => e.equipment.id !== equipmentId));
  };

  const handleQuantityChange = (equipmentId: number, delta: number) => {
    setSelectedEquipments(selectedEquipments.map(item => {
      if (item.equipment.id === equipmentId) {
        const newQuantity = Math.max(1, Math.min(item.equipment.availableQuantity, item.quantity + delta));
        return { ...item, quantity: newQuantity };
      }
      return item;
    }));
  };

  const validateForm = (): boolean => {
    if (!customerName.trim()) {
      Alert.alert('Hata', 'Müşteri adı zorunludur.');
      return false;
    }
    if (!customerPhone.trim()) {
      Alert.alert('Hata', 'Telefon numarası zorunludur.');
      return false;
    }
    if (!customerEmail.trim() || !customerEmail.includes('@')) {
      Alert.alert('Hata', 'Geçerli bir e-posta adresi giriniz.');
      return false;
    }
    if (selectedEquipments.length === 0) {
      Alert.alert('Hata', 'En az bir ekipman seçmelisiniz.');
      return false;
    }
    if (startDate >= endDate) {
      Alert.alert('Hata', 'Bitiş tarihi başlangıç tarihinden sonra olmalıdır.');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const formData: CreateReservationForm = {
      customerName: customerName.trim(),
      customerEmail: customerEmail.trim(),
      customerPhone: customerPhone.trim(),
      startDate,
      endDate,
      items: selectedEquipments.map(item => ({
        equipmentId: item.equipment.id,
        quantity: item.quantity,
      })),
      notes: notes.trim() || undefined,
      depositAmount: depositAmount ? parseFloat(depositAmount) : undefined,
      depositPaid: false,
    };

    const result = await createReservation(formData);
    
    if (result) {
      Alert.alert('Başarılı', 'Rezervasyon oluşturuldu.', [
        { 
          text: 'Tamam', 
          onPress: () => navigation.goBack()
        }
      ]);
    } else {
      Alert.alert('Hata', 'Rezervasyon oluşturulamadı. Lütfen tekrar deneyiniz.');
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('tr-TR', { 
      day: 'numeric', 
      month: 'long',
      year: 'numeric'
    });
  };

  const durationDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const totalAmount = calculateTotal();

  // Get available equipment that's not already selected
  const selectableEquipment = availableEquipment.filter(
    eq => eq.status === 'AVAILABLE' && !selectedEquipments.find(sel => sel.equipment.id === eq.id)
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Customer Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Müşteri Bilgileri</Text>
          
          <View style={styles.inputContainer}>
            <View style={styles.inputIcon}>
              <User size={20} color={colors.primary} />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Ad Soyad *"
              placeholderTextColor={colors.textDisabled}
              value={customerName}
              onChangeText={setCustomerName}
            />
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.inputIcon}>
              <Phone size={20} color={colors.success} />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Telefon *"
              placeholderTextColor={colors.textDisabled}
              value={customerPhone}
              onChangeText={setCustomerPhone}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.inputIcon}>
              <Mail size={20} color={colors.info} />
            </View>
            <TextInput
              style={styles.input}
              placeholder="E-posta *"
              placeholderTextColor={colors.textDisabled}
              value={customerEmail}
              onChangeText={setCustomerEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>

        {/* Date Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tarih Seçimi</Text>
          
          <View style={styles.dateRow}>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowStartDatePicker(true)}
            >
              <Calendar size={20} color={colors.primary} />
              <View style={styles.dateTextContainer}>
                <Text style={styles.dateLabel}>Başlangıç</Text>
                <Text style={styles.dateValue}>{formatDate(startDate)}</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowEndDatePicker(true)}
            >
              <Calendar size={20} color={colors.secondary} />
              <View style={styles.dateTextContainer}>
                <Text style={styles.dateLabel}>Bitiş</Text>
                <Text style={styles.dateValue}>{formatDate(endDate)}</Text>
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.durationCard}>
            <Text style={styles.durationText}>Süre: {durationDays} gün</Text>
          </View>

          {showStartDatePicker && (
            <DateTimePicker
              value={startDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event, date) => {
                setShowStartDatePicker(Platform.OS === 'ios');
                if (date) setStartDate(date);
              }}
              minimumDate={new Date()}
            />
          )}

          {showEndDatePicker && (
            <DateTimePicker
              value={endDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event, date) => {
                setShowEndDatePicker(Platform.OS === 'ios');
                if (date) setEndDate(date);
              }}
              minimumDate={startDate}
            />
          )}
        </View>

        {/* Equipment Selection */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Ekipmanlar ({selectedEquipments.length})
            </Text>
            <TouchableOpacity
              style={styles.addEquipmentButton}
              onPress={() => setShowEquipmentPicker(!showEquipmentPicker)}
            >
              {showEquipmentPicker ? (
                <X size={20} color={colors.textOnPrimary} />
              ) : (
                <Plus size={20} color={colors.textOnPrimary} />
              )}
            </TouchableOpacity>
          </View>

          {showEquipmentPicker && (
            <View style={styles.equipmentPickerContainer}>
              <Text style={styles.equipmentPickerTitle}>Müsait Ekipmanlar</Text>
              {selectableEquipment.map(equipment => (
                <TouchableOpacity
                  key={equipment.id}
                  style={styles.equipmentPickerItem}
                  onPress={() => handleAddEquipment(equipment)}
                >
                  <View>
                    <Text style={styles.equipmentPickerName}>{equipment.name}</Text>
                    <Text style={styles.equipmentPickerPrice}>
                      {formatCurrency(equipment.dailyPrice)}/gün - Stok: {equipment.availableQuantity}
                    </Text>
                  </View>
                  <Plus size={20} color={colors.primary} />
                </TouchableOpacity>
              ))}
              {selectableEquipment.length === 0 && (
                <Text style={styles.noEquipmentText}>Müsait ekipman bulunamadı</Text>
              )}
            </View>
          )}

          {selectedEquipments.map(item => (
            <View key={item.equipment.id} style={styles.selectedEquipmentCard}>
              <View style={styles.equipmentCardHeader}>
                <View style={styles.equipmentCardInfo}>
                  <Text style={styles.equipmentCardName}>{item.equipment.name}</Text>
                  <Text style={styles.equipmentCardPrice}>
                    {formatCurrency(item.equipment.dailyPrice)}/gün
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => handleRemoveEquipment(item.equipment.id)}
                >
                  <X size={16} color={colors.error} />
                </TouchableOpacity>
              </View>

              <View style={styles.quantityContainer}>
                <Text style={styles.quantityLabel}>Adet:</Text>
                <View style={styles.quantityControls}>
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => handleQuantityChange(item.equipment.id, -1)}
                    disabled={item.quantity <= 1}
                  >
                    <Minus size={16} color={item.quantity <= 1 ? colors.textDisabled : colors.primary} />
                  </TouchableOpacity>
                  <Text style={styles.quantityValue}>{item.quantity}</Text>
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => handleQuantityChange(item.equipment.id, 1)}
                    disabled={item.quantity >= item.equipment.availableQuantity}
                  >
                    <Plus size={16} color={item.quantity >= item.equipment.availableQuantity ? colors.textDisabled : colors.primary} />
                  </TouchableOpacity>
                </View>
                <Text style={styles.itemTotal}>
                  {formatCurrency(item.equipment.dailyPrice * item.quantity * durationDays)}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Additional Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ek Bilgiler</Text>
          
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, styles.notesInput]}
              placeholder="Notlar (opsiyonel)"
              placeholderTextColor={colors.textDisabled}
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Depozito Tutarı (opsiyonel)"
              placeholderTextColor={colors.textDisabled}
              value={depositAmount}
              onChangeText={setDepositAmount}
              keyboardType="decimal-pad"
            />
          </View>
        </View>

        {/* Total Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Özet</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Toplam Tutar</Text>
            <Text style={styles.summaryValue}>{formatCurrency(totalAmount)}</Text>
          </View>
          {depositAmount && parseFloat(depositAmount) > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Depozito</Text>
              <Text style={styles.summaryValue}>{formatCurrency(parseFloat(depositAmount))}</Text>
            </View>
          )}
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          <Save size={20} color={colors.textOnPrimary} />
          <Text style={styles.submitButtonText}>
            {isLoading ? 'Oluşturuluyor...' : 'Rezervasyon Oluştur'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  inputIcon: {
    paddingLeft: 12,
    paddingRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingRight: 12,
    fontSize: 15,
    color: colors.text,
  },
  notesInput: {
    paddingTop: 12,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  dateRow: {
    flexDirection: 'row',
    gap: 12,
  },
  dateButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
  },
  dateTextContainer: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  dateValue: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    marginTop: 2,
  },
  durationCard: {
    backgroundColor: colors.primary + '15',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  durationText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.primary,
  },
  addEquipmentButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  equipmentPickerContainer: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    maxHeight: 300,
  },
  equipmentPickerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 8,
  },
  equipmentPickerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  equipmentPickerName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  equipmentPickerPrice: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  noEquipmentText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingVertical: 20,
  },
  selectedEquipmentCard: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  equipmentCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  equipmentCardInfo: {
    flex: 1,
  },
  equipmentCardName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  equipmentCardPrice: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  removeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.error + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quantityLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    minWidth: 30,
    textAlign: 'center',
  },
  itemTotal: {
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.success,
  },
  summaryCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 15,
    color: colors.text,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.success,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  submitButtonDisabled: {
    backgroundColor: colors.textDisabled,
  },
  submitButtonText: {
    color: colors.textOnPrimary,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CreateReservationScreen;
