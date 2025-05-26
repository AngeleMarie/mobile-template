import React from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Pressable } from 'react-native';
import { Container } from '@/components/layout/Container'; // Assuming path
import Colors from '@/constants/Colors'; // Assuming path
import { Bookmark, BookmarkCheck, Trash2 } from 'lucide-react-native'; // Added Trash2 for remove
import { useBookmarkStore } from '@/store/bookmarkStore'; // Path to your bookmark store
import { useRouter } from 'expo-router';

// Assuming ParkingLocation interface is defined in bookmarkStore or globally
interface ParkingLocation {
  id: string;
  name: string;
  address: string;
  distance?: string;
  price?: string;
  available?: number;
  image: string;
}

export default function BookmarksScreen() {
  const router = useRouter();
  const { savedLocations, removeBookmark, toggleBookmark, isBookmarked } = useBookmarkStore();

  const renderParkingCard = ({ item }: { item: ParkingLocation }) => (
    <Pressable
      style={styles.parkingCard}
    //   onPress={() => router.push(`/parking-details/${item.id}`)} // Navigate to details
    
    >
      <Image 
        source={{ uri: item.image }} 
        style={styles.parkingImage} 
        onError={(e) => console.log(`Failed to load image for ${item.name}`, e.nativeEvent.error)}
      />
      {/* Favorite button to toggle bookmark status directly from bookmarks screen */}
      <TouchableOpacity
        style={styles.favoriteButton}
        onPress={() => toggleBookmark(item)} // Use toggleBookmark from store
      >
        {isBookmarked(item.id) ? (
          <BookmarkCheck size={20} color={Colors.primary[500]} fill={Colors.primary[100]} />
        ) : (
          // This case should ideally not happen if it's on the bookmarks screen,
          // but good for consistency if toggleBookmark is generic
          <Bookmark size={20} color={Colors.neutral[500]} />
        )}
      </TouchableOpacity>
       {/* Optional: Add a dedicated remove button */}
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => removeBookmark(item.id)}
      >
        <Trash2 size={20} color={Colors.error[500]} />
      </TouchableOpacity>
      <View style={styles.parkingInfo}>
        <Text style={styles.parkingName}>{item.name}</Text>
        <Text style={styles.parkingAddress}>{item.address}</Text>
        {item.price && ( // Conditionally render price if available
          <Text style={styles.parkingPriceText}>{item.price}</Text>
        )}
      </View>
    </Pressable>
  );

  return (
    <Container style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Saved Parking</Text>
      </View>
      
      {savedLocations.length === 0 ? (
        <View style={styles.emptyState}>
          <Bookmark size={64} color={Colors.neutral[300]} />
          <Text style={styles.emptyStateTitle}>No Saved Parking Yet</Text>
          <Text style={styles.emptyStateText}>
            Save your favorite parking spots for quick access from the home screen.
          </Text>
        </View>
      ) : (
        <FlatList
          data={savedLocations}
          renderItem={renderParkingCard}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16, // Adjust as per safe area
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
    backgroundColor: Colors.background.primary, // Ensure header bg
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Poppins-SemiBold', // Example
    color: Colors.text.primary,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold', // Example
    color: Colors.text.primary,
    marginTop: 24, // Increased margin
    marginBottom: 12,
  },
  emptyStateText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular', // Example
    color: Colors.text.tertiary,
    textAlign: 'center',
    maxWidth: 300, // Increased max width
  },
  listContainer: {
    padding: 16,
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
  favoriteButton: { // Can be used to un-bookmark
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 20,
    padding: 8,
    zIndex: 1, // Ensure it's above image
  },
  removeButton: { // Dedicated remove button
    position: 'absolute',
    top: 12,
    left: 12, // Position on the left
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 20,
    padding: 8,
    zIndex: 1,
  },
  parkingInfo: {
    padding: 16,
  },
  parkingName: {
    fontSize: 17,
    fontFamily: 'Poppins-SemiBold', // Example
    color: Colors.text.primary,
    marginBottom: 4,
  },
  parkingAddress: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular', // Example
    color: Colors.text.secondary,
    marginBottom: 8,
  },
  parkingPriceText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium', // Example
    color: Colors.primary[600], // Example color for price
  }
});
