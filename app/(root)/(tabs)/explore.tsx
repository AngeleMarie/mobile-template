import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Container } from '@/components/layout/Container';
import Colors from '@/constants/Colors';
import { Search, MapPin, Car, Filter } from 'lucide-react-native';
import { Input } from '@/components/Input';
import { useSearchStore } from '@/store/searchStore';
import { useRouter } from 'expo-router';
import { BookingModal } from '@/components/BookingModal';
import { Button } from '@/components/Button';
import { axiosInstance } from '@/app/api/axios';
import Toast from 'react-native-toast-message';
import axios from 'axios';

const { width } = Dimensions.get('window');

interface ParkingSpot {
  id: string;
  name: string;
  address: string;
  distance: string;
  price: string;
  available: number;
  image: string;
  rating: number;
  features: string[];
  open24Hours: boolean;
  keywords: string[];
}


const ParkingCard = ({
  spot,
  onViewDetails,
  onBookNow,
}: {
  spot: ParkingSpot;
  onViewDetails: (spot: ParkingSpot) => void;
  onBookNow: (spot: ParkingSpot) => void;
}) => (
  <TouchableOpacity style={styles.parkingSpotCard} onPress={() => onViewDetails(spot)} activeOpacity={0.8}>
    <View style={styles.cardContent}>
      <Image source={{ uri: spot.image }} style={styles.parkingSpotImage} />
      <View style={styles.parkingSpotInfo}>
        <Text style={styles.parkingSpotName} numberOfLines={1}>
          {spot.name}
        </Text>
        <View style={styles.locationContainer}>
          <MapPin size={12} color={Colors.text.tertiary} />
          <Text style={styles.parkingSpotAddress}>{spot.distance} away</Text>
        </View>
        <View style={styles.parkingSpotDetails}>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>{spot.price}</Text>
          </View>
          <View style={styles.availableContainer}>
            <Car size={12} color={Colors.success[700]} />
            <Text style={styles.availableText}>{spot.available} spots</Text>
          </View>
        </View>
        <Button
          title="Book Now"
          variant="primary"
          size="small"
          onPress={() => onBookNow(spot)}
          style={styles.bookNowButtonInCard}
        />
      </View>
    </View>
  </TouchableOpacity>
);

export default function ExploreScreen() {
  const router = useRouter();
  const { searchQuery, setSearchQuery } = useSearchStore();
  const [filteredSpots, setFilteredSpots] = useState<ParkingSpot[]>([]);
  const [allSpots, setAllSpots] = useState<ParkingSpot[]>([]);
  const [isBookingModalVisible, setIsBookingModalVisible] = useState(false);
  const [selectedParkingSpot, setSelectedParkingSpot] = useState<ParkingSpot | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch parking spots from API
  const fetchParkingSpots = async () => {
    try {
      const response = await axios.get('http://10.11.73.214:3001/parking');
      const mappedSpots: ParkingSpot[] = response.data.map((item: any) => ({
        id: item.id,
        name: item.name,
        address: item.address,
        distance: item.distance,
        price: item.price || `$${item.Price}/hr`, // Handle previous db.json format
        available: item.availableSpaces || item.available,
        image: item.image || item.parkingImage || 'https://via.placeholder.com/120',
        rating: item.rating || 4.0, // Default if not provided
        features: item.features || ['Security'],
        open24Hours: item.open24Hours || false,
        keywords: item.keywords || [item.name.toLowerCase(), item.address.toLowerCase()],
      }));
      setAllSpots(mappedSpots);
      setFilteredSpots(mappedSpots); // Initialize filtered spots
    } catch (error: any) {
      console.error('Error fetching parking spots:', {
        message: error.message,
        code: error.code,
        response: error.response?.data,
      });
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to fetch parking spots. Using local data.',
      });
      setAllSpots([]);
      setFilteredSpots([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch on mount
  useEffect(() => {
    fetchParkingSpots();
  }, []);

  // Pull-to-refresh handler
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchParkingSpots();
    setRefreshing(false);
    Toast.show({
      type: 'success',
      text1: 'Refreshed',
      text2: 'Parking spots updated successfully.',
    });
  };

  // Handle search
  const handleSearch = (text: string) => {
    setSearchQuery(text);
    if (text.trim()) {
      const filtered = allSpots.filter(
        (spot) =>
          spot.name.toLowerCase().includes(text.toLowerCase()) ||
          spot.address.toLowerCase().includes(text.toLowerCase()) ||
          spot.keywords.some(keyword => keyword.toLowerCase().includes(text.toLowerCase()))
      );
      setFilteredSpots(filtered);
    } else {
      setFilteredSpots(allSpots);
    }
  };

  // Open booking modal
  const handleBookSpotPress = (spot: ParkingSpot) => {
    setSelectedParkingSpot(spot);
    setIsBookingModalVisible(true);
  };

  // Navigate to details
  const handleViewDetails = (spot: ParkingSpot) => {
    // router.push(`/parking/${spot.id}`);
  };

  // Confirm booking
  const handleConfirmBooking = async (spotId: string) => {
    try {
      await axios.post('http://10.11.73.214:3001/bookings', {
        parkingId: spotId,
        startTime: new Date().toISOString(),
        status: 'active',
      });
      setIsBookingModalVisible(false);
      Toast.show({
        type: 'success',
        text1: 'Booking Confirmed',
        text2: 'Your parking spot has been reserved.',
      });
      // router.push(`/tickets/${spotId}`);
    } catch (error: any) {
      console.error('Error confirming booking:', error.message);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to confirm booking. Please try again.',
      });
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary[500]} />
      </View>
    );
  }

  const firstFilteredSpot = filteredSpots.length > 0 ? filteredSpots[0] : null;

  return (
    <Container style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        />
        <Text style={styles.headerTitle}>Find Parking</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <Input
            value={searchQuery}
            onChangeText={handleSearch}
            placeholder="Search for location"
            icon={<Search size={20} color={Colors.text.tertiary} />}
          />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary[500]]}
          />
        }
      >
        <View style={styles.filteredSpotContainer}>
          {firstFilteredSpot ? (
            <ParkingCard
              spot={firstFilteredSpot}
              onViewDetails={handleViewDetails}
              onBookNow={handleBookSpotPress}
            />
          ) : (
            searchQuery.trim() !== '' && (
              <View style={styles.noResultsContainer}>
                <Car size={48} color={Colors.text.tertiary} />
                <Text style={styles.noResultsText}>
                  No parking spots found for "{searchQuery}"
                </Text>
                <Text style={styles.noResultsSubtext}>
                  Try a different search term or location
                </Text>
              </View>
            )
          )}
        </View>

        <View style={styles.parkingSpotsContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Available Parking Spots</Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.parkingSpotsList}
          >
            {filteredSpots.map((spot) => (
              <ParkingCard
                key={spot.id}
                spot={spot}
                onViewDetails={handleViewDetails}
                onBookNow={handleBookSpotPress}
              />
            ))}
          </ScrollView>
        </View>
      </ScrollView>

      <BookingModal
        isVisible={isBookingModalVisible}
        onClose={() => setIsBookingModalVisible(false)}
        parkingSpot={selectedParkingSpot}
        onBookNow={handleConfirmBooking}
      />
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  backButton: {
    width: 24,
    height: 24,
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  searchInputWrapper: {
    flex: 1,
  },
  filteredSpotContainer: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  parkingSpotsContainer: {
    flex: 1,
    paddingVertical: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  parkingSpotsList: {
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  parkingSpotCard: {
    width: 320,
    borderRadius: 16,
    backgroundColor: Colors.background.primary,
    marginRight: 16,
    shadowColor: Colors.neutral[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  parkingSpotImage: {
    width: '45%',
    height: 120,
    borderRadius: 8,
    margin: 4,
  },
  parkingSpotInfo: {
    flex: 1,
    padding: 12,
  },
  parkingSpotName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  parkingSpotAddress: {
    fontSize: 12,
    color: Colors.text.tertiary,
    marginLeft: 4,
  },
  parkingSpotDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  priceContainer: {
    backgroundColor: Colors.primary[50],
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  price: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.primary[700],
  },
  availableContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.success[50],
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  availableText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.success[700],
    marginLeft: 4,
  },
  bookNowButtonInCard: {
    marginTop: 8,
    alignSelf: 'flex-start',
    width: '90%',
  },
  noResultsContainer: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 24,
  },
  noResultsText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginTop: 12,
    marginBottom: 4,
    textAlign: 'center',
  },
  noResultsSubtext: {
    fontSize: 14,
    color: Colors.text.tertiary,
    textAlign: 'center',
  },
});
