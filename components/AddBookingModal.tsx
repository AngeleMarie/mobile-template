import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { X } from 'lucide-react-native';
import Colors from '@/constants/Colors'; // Assuming this path is correct
import { Button } from '@/components/Button'; // Assuming this path is correct

export interface Booking {
  id?: string;
  parkingName: string;
  address: string;
  date: string; // YYYY-MM-DD
  startTime: string; // ISO String
  endTime: string | null; // ISO String or null
  price: string;
  status: 'active' | 'completed' | 'upcoming';
  duration?: string;
}

interface AddBookingModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSave: (booking: Booking) => void;
  initialBooking?: Booking | null;
}

export const AddBookingModal: React.FC<AddBookingModalProps> = ({
  isVisible,
  onClose,
  onSave,
  initialBooking,
}) => {
  const [parkingName, setParkingName] = useState('');
  const [address, setAddress] = useState('');
  const [date, setDate] = useState<Date>(new Date()); // Stores the selected date
  const [startTime, setStartTime] = useState<Date>(new Date()); // Stores the selected start time (date part is initially today)
  const [endTime, setEndTime] = useState<Date | null>(null); // Stores the selected end time (date part is initially today)
  const [price, setPrice] = useState('');
  const [status, setStatus] = useState<'active' | 'completed' | 'upcoming'>('upcoming');
  const [duration, setDuration] = useState('');

  // --- DateTimePicker handlers ---
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  useEffect(() => {
    if (initialBooking) {
      setParkingName(initialBooking.parkingName);
      setAddress(initialBooking.address);
      // initialBooking.date is YYYY-MM-DD. new Date() handles this by setting it to local time zone at T00:00:00
      // For date picker, this is generally fine.
      setDate(initialBooking.date ? new Date(initialBooking.date + 'T00:00:00') : new Date());
      setStartTime(initialBooking.startTime ? new Date(initialBooking.startTime) : new Date());
      setEndTime(initialBooking.endTime ? new Date(initialBooking.endTime) : null);
      setPrice(initialBooking.price);
      setStatus(initialBooking.status);
      setDuration(initialBooking.duration || '');
    } else {
      resetForm();
    }
  }, [initialBooking]);

  const resetForm = () => {
    setParkingName('');
    setAddress('');
    const today = new Date();
    setDate(today);
    setStartTime(today); // Reset time to current time on today's date
    setEndTime(null);
    setPrice('');
    setStatus('upcoming');
    setDuration('');
  };

  const formatDateForDisplay = (dateToFormat: Date) =>
    dateToFormat.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });

  const formatTimeForDisplay = (timeToFormat: Date | null) =>
    timeToFormat
      ? timeToFormat.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
      : 'Select Time';

  const handlePriceChange = (text: string) => {
    const cleaned = text.replace(/[^0-9.]/g, '');
    const parts = cleaned.split('.');
    if (parts.length > 2) {
      setPrice(parts[0] + '.' + parts.slice(1).join(''));
    } else if (parts.length === 2 && parts[1].length > 2) {
      setPrice(parts[0] + '.' + parts[1].substring(0,2));
    }
    else {
      setPrice(cleaned);
    }
  };

  const handleSave = () => {
    if (!parkingName || !address || !date || !startTime || !price) {
      Alert.alert('Missing Information', 'Please fill in all required fields.');
      return;
    }

    // --- Corrected Date and Time Combination ---
    const selectedDateObject = new Date(date); // This is the date chosen by the user from the date picker

    // Combine the selected date with the selected start time
    const combinedStartDateTime = new Date(selectedDateObject);
    combinedStartDateTime.setHours(startTime.getHours(), startTime.getMinutes(), startTime.getSeconds(), startTime.getMilliseconds());

    // Combine the selected date with the selected end time, if an end time exists
    let combinedEndDateTime: Date | null = null;
    if (endTime) {
      combinedEndDateTime = new Date(selectedDateObject);
      combinedEndDateTime.setHours(endTime.getHours(), endTime.getMinutes(), endTime.getSeconds(), endTime.getMilliseconds());
    }
    // --- End of Corrected Date and Time Combination ---

    const now = new Date();
    const todayNormalized = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Validate selected date (ensure it's not in the past)
    // Ensure 'date' (which is just a date) is compared correctly
    const dateForValidation = new Date(selectedDateObject);
    dateForValidation.setHours(0,0,0,0); // Normalize to start of day for comparison

    if (dateForValidation < todayNormalized) {
      Alert.alert('Invalid Date', 'The selected date cannot be in the past.');
      return;
    }
    
    // Validate start time (cannot be in the past for active/upcoming)
    // Use combinedStartDateTime for this validation
    if (status !== 'completed' && combinedStartDateTime < now) {
      Alert.alert('Invalid Start Time', 'Start time cannot be in the past for active or upcoming bookings.');
      return;
    }

    // Validate end time (must be after start time)
    if (combinedEndDateTime) {
      if (combinedEndDateTime <= combinedStartDateTime) {
        Alert.alert('Invalid End Time', 'End time must be after start time.');
        return;
      }
    }

    const bookingToSave: Booking = {
      parkingName,
      address,
      date: selectedDateObject.toISOString().split('T')[0], // Save date as YYYY-MM-DD
      startTime: combinedStartDateTime.toISOString(), // Save start time as full ISO string with correct date
      endTime: combinedEndDateTime ? combinedEndDateTime.toISOString() : null, // Save end time similarly
      price,
      status,
      ...(status === 'active' && duration ? { duration } : {}),
    };

    if (initialBooking?.id) {
      bookingToSave.id = initialBooking.id;
    }

    onSave(bookingToSave);
    onClose(); // Close modal after saving
  };

  // Add this helper function near the top of your component file
  const getValidDate = (d: any, fallback: Date = new Date()) =>
    d instanceof Date && !isNaN(d.getTime()) ? d : fallback;

  // DateTimePicker change handlers
  const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) setDate(selectedDate);
  };

  const handleStartTimeChange = (event: DateTimePickerEvent, selectedTime?: Date) => {
    setShowStartTimePicker(false);
    if (selectedTime) setStartTime(selectedTime);
  };

  const handleEndTimeChange = (event: DateTimePickerEvent, selectedTime?: Date) => {
    setShowEndTimePicker(false);
    if (selectedTime) setEndTime(selectedTime);
  };

  return (
    <Modal visible={isVisible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X size={24} color={Colors.neutral[500]} />
          </TouchableOpacity>

          <Text style={styles.modalTitle}>
            {initialBooking ? 'Edit Booking' : 'Add New Booking'}
          </Text>

          <ScrollView contentContainerStyle={styles.formContent}>
            <Text style={styles.label}>Parking Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Downtown Garage"
              value={parkingName}
              onChangeText={setParkingName}
              placeholderTextColor={Colors.text.tertiary}
            />

            <Text style={styles.label}>Address</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 123 Main Street"
              value={address}
              onChangeText={setAddress}
              placeholderTextColor={Colors.text.tertiary}
            />

            <Text style={styles.label}>Date</Text>
            <TouchableOpacity style={styles.input} onPress={() => setShowDatePicker(true)}>
              <Text style={styles.inputText}>{formatDateForDisplay(date)}</Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleDateChange}
                minimumDate={new Date()}
              />
            )}

            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <Text style={styles.label}>Start Time</Text>
                <TouchableOpacity style={styles.input} onPress={() => setShowStartTimePicker(true)}>
                  <Text style={styles.inputText}>{formatTimeForDisplay(startTime)}</Text>
                </TouchableOpacity>
                {showStartTimePicker && (
                  <DateTimePicker
                    value={startTime}
                    mode="time"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleStartTimeChange}
                  />
                )}
              </View>

              <View style={styles.halfWidth}>
                <Text style={styles.label}>End Time (Optional)</Text>
                <TouchableOpacity style={styles.input} onPress={() => setShowEndTimePicker(true)}>
                  <Text style={styles.inputText}>{formatTimeForDisplay(endTime)}</Text>
                </TouchableOpacity>
                {showEndTimePicker && (
                  <DateTimePicker
                    value={endTime ?? startTime}
                    mode="time"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleEndTimeChange}
                    minimumDate={startTime}
                  />
                )}
              </View>
            </View>

            <Text style={styles.label}>Price</Text>
            <TextInput
              style={styles.input}
              placeholder="$0.00"
              keyboardType="decimal-pad"
              value={price}
              onChangeText={handlePriceChange} // Use improved handler
              placeholderTextColor={Colors.text.tertiary}
            />

            <Text style={styles.label}>Status</Text>
            <View style={styles.statusPicker}>
              {['upcoming', 'active', 'completed'].map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[
                    styles.statusOption,
                    status === s && { backgroundColor: Colors.primary[100] },
                  ]}
                  onPress={() => setStatus(s as Booking['status'])}
                >
                  <Text
                    style={[
                      styles.statusOptionText,
                      status === s && { color: Colors.primary[700], fontWeight: 'bold' },
                    ]}
                  >
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {status === 'active' && (
              <>
                <Text style={styles.label}>Duration</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., 2h 30m (auto if end time set later)"
                  value={duration}
                  onChangeText={setDuration}
                  placeholderTextColor={Colors.text.tertiary}
                />
              </>
            )}

            <Button
              title={initialBooking ? 'Save Changes' : 'Add Booking'}
              variant="primary"
              size="large"
              onPress={handleSave}
              style={styles.saveButton}
            />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modalView: {
    width: '90%',
    maxHeight: '85%', // Ensure modal doesn't take full screen height
    backgroundColor: Colors.background.primary,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  closeButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    padding: 5,
    zIndex: 1, // Ensure close button is above other elements
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: 20,
  },
  formContent: {
    paddingBottom: 20, // For scroll view content
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.secondary,
    marginTop: 10,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border.light,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12, // Adjusted padding
    fontSize: 16,
    color: Colors.text.primary,
    marginBottom: 10,
    backgroundColor: Colors.background.secondary, // Slight background for input
  },
  inputText: {
    color: Colors.text.primary,
    fontSize: 16, // Match TextInput font size
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10, // Use gap for spacing if supported, otherwise margin
  },
  halfWidth: {
    flex: 1,
  },
  statusPicker: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: Colors.neutral[100],
    borderRadius: 10,
    padding: 6,
    marginBottom: 15,
  },
  statusOption: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  statusOptionText: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  saveButton: {
    marginTop: 20,
  },
})