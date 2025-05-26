import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Pressable,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Container } from '@/components/layout/Container';
import Colors from '@/constants/Colors';
import axios from 'axios';
import {
  Search,
  Car,
  Clock,
  Bookmark,
  BookmarkCheck,
  Bell,
  Locate,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useBookmarkStore } from '@/store/bookmarkStore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { User } from '@/types/index';


interface ParkingLocation {
  id: string;
  name: string;
  address: string;
  distance: string;
  price: string;
  available: number;
  image: string;
}



export default function HomeScreen() {
  const router = useRouter();
  const { toggleBookmark, isBookmarked } = useBookmarkStore();
  const [locations, setLocations] = useState<ParkingLocation[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user from AsyncStorage
  useEffect(() => {
    const getUserFromStorage = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem('user');
        if (jsonValue) {
          const parsedUser: User = JSON.parse(jsonValue);
          setUser(parsedUser);
        } else {
          console.warn('No user found in AsyncStorage');
          // Optionally redirect to login
          // router.push('/login');
        }
      } catch (error) {
        console.error('Failed to load user from AsyncStorage:', error);
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Failed to load user data.',
        });
      } finally {
        setLoading(false);
      }
    };

    getUserFromStorage();
  }, []);

  // Fetch parking locations from API
  const fetchLocations = async () => {
    try {
      const response = await axios.get('http://10.11.73.214:3001/parking');
      const mappedLocations: ParkingLocation[] = response.data.map((item: any) => ({
        id: item.id,
        name: item.name,
        address: item.address,
        distance: item.distance,
        price: item.price,
        available: item.availableSpaces || item.available, // Handle API field variations
        image: item.image || item.parkingImage || 'https://via.placeholder.com/160', // Fallback image
      }));
      setLocations(mappedLocations);
    } catch (error: any) {
      console.error('Error fetching parking locations:', {
        message: error.message,
        code: error.code,
        response: error.response?.data,
      });
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to fetch parking locations. Using local data.',
      });
      setLocations([]); // Fallback to static data
    }
  };

  // Fetch locations on mount
  useEffect(() => {
    fetchLocations();
  }, []);

  // Pull-to-refresh handler
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchLocations();
    setRefreshing(false);
    Toast.show({
      type: 'success',
      text1: 'Refreshed',
      text2: 'Parking locations updated successfully.',
    });
  };

  const handleToggleFavorite = (location: ParkingLocation) => {
    toggleBookmark(location);
    Toast.show({
      type: 'success',
      text1: isBookmarked(location.id) ? 'Bookmark Added' : 'Bookmark Removed',
      text2: `${location.name} has been ${isBookmarked(location.id) ? 'added from' : 'removed to'} your bookmarks.`,
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary[500]} />
      </View>
    );
  }

  return (
    <Container style={styles.container}>
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
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good Morning 🌤️</Text>
            <Text style={styles.name}>{user?.firstName || 'Guest'}</Text>
          </View>
          <View style={styles.rightIcons}>
            <TouchableOpacity
              onPress={() => router.push('/notifications')}
              style={styles.iconButton}
            >
              <Bell size={24} color={Colors.text.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push('/profile')}
              style={styles.avatarContainer}
            >
              <Image
                source={{
                  uri: user?.avatarUrl || 'https://via.placeholder.com/48',
                }}
                style={styles.avatar}
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.bannerContainer}>
          <LinearGradient
            colors={[Colors.primary[600], Colors.primary[800]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.banner}
          >
            <View style={styles.bannerContent}>
              <Text style={styles.bannerTitle}>Save 20% Today!</Text>
              <Text style={styles.bannerText}>Use code PARK20 for all bookings</Text>
            </View>
          </LinearGradient>
        </View>

        <Pressable onPress={() => router.push('/explore')} style={styles.locationBanner}>
          <Locate size={20} color={Colors.primary[700]} />
          <Text style={styles.locationText}>
            Find parking near your current location
          </Text>
        </Pressable>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push('/explore')}
            >
              <View style={[styles.actionIcon, { backgroundColor: Colors.primary[500] }]}>
                <Car size={24} color="#FFFFFF" />
              </View>
              <Text style={styles.actionText}>Find Parking</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push('/tickets')}
            >
              <View style={[styles.actionIcon, { backgroundColor: Colors.secondary[500] }]}>
                <Clock size={24} color="#FFFFFF" />
              </View>
              <Text style={styles.actionText}>Bookings</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push('/bookmarks')}
            >
              <View style={[styles.actionIcon, { backgroundColor: Colors.accent[500] }]}>
                <BookmarkCheck size={24} color="#FFFFFF" />
              </View>
              <Text style={styles.actionText}>Saved</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Available Parking</Text>
          {locations.map((location) => (
            <Pressable
              key={location.id}
              style={styles.parkingCard}
              // onPress={() => router.push(`/parking/${location.id}`)}
            >
              <Image
                source={{ uri: location.image }}
                style={styles.parkingImage}
              />
              <TouchableOpacity
                style={styles.favoriteButton}
                onPress={() => handleToggleFavorite(location)}
              >
                {isBookmarked(location.id) ? (
                  <BookmarkCheck
                    size={20}
                    color={Colors.primary[500]}
                    fill={Colors.primary[100]}
                  />
                ) : (
                  <Bookmark size={20} color={Colors.neutral[500]} />
                )}
              </TouchableOpacity>
              <View style={styles.parkingInfo}>
                <Text style={styles.parkingName}>{location.name}</Text>
                <Text style={styles.parkingAddress}>{location.address}</Text>
                <View style={styles.parkingDetails}>
                  <Text style={styles.parkingDistance}>{location.distance}</Text>
                  <View style={styles.dot} />
                  <Text style={styles.parkingPrice}>{location.price}</Text>
                </View>
                <View style={styles.availableContainer}>
                  <Text style={styles.availableText}>
                    {location.available} spots available
                  </Text>
                </View>
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    marginBottom: 24,
  },
  greeting: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: Colors.text.secondary,
  },
  name: {
    fontSize: 22,
    fontFamily: 'Poppins-Bold',
    color: Colors.text.primary,
  },
  rightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    padding: 8,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  locationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary[50],
    marginHorizontal: 24,
    marginBottom: 24,
    padding: 16,
    borderRadius: 12,
  },
  locationText: {
    marginLeft: 12,
    fontSize: 14,
    color: Colors.primary[700],
    fontFamily: 'Poppins-Medium',
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: Colors.text.primary,
    marginBottom: 16,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    alignItems: 'center',
    width: '30%',
  },
  actionIcon: {
    width: 60,
    height: 60,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: Colors.neutral[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  bannerContainer: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  banner: {
    borderRadius: 16,
    overflow: 'hidden',
    paddingVertical: 20,
  },
  bannerContent: {
    paddingHorizontal: 20,
    alignItems: 'flex-start',
  },
  bannerTitle: {
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    color: Colors.neutral[50],
    marginBottom: 4,
  },
  bannerText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: Colors.neutral[100],
  },
  parkingCard: {
    backgroundColor: Colors.background.primary,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: Colors.neutral[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  parkingImage: {
    width: '100%',
    height: 160,
  },
  favoriteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 20,
    padding: 8,
  },
  parkingInfo: {
    padding: 16,
  },
  parkingName: {
    fontSize: 17,
    fontFamily: 'Poppins-SemiBold',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  parkingAddress: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: Colors.text.secondary,
    marginBottom: 10,
  },
  parkingDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  parkingDistance: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: Colors.text.tertiary,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: Colors.text.tertiary,
    marginHorizontal: 10,
  },
  parkingPrice: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: Colors.text.tertiary,
  },
  availableContainer: {
    backgroundColor: Colors.success[50],
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  availableText: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: Colors.success[700],
  },
});
