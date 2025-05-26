import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { Container } from '@/components/layout/Container';
import Colors from '@/constants/Colors';
import Toast from 'react-native-toast-message';
import { Bell, Clock, Wallet, TriangleAlert as AlertTriangle, ChevronLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'info' | 'warning' | 'payment' | 'reminder';
  read: boolean;
}

const initialNotifications: Notification[] = [
  {
    id: '1',
    title: 'Parking session started',
    message: 'Your parking session at Central City Parking has begun.',
    time: '10 min ago',
    type: 'info',
    read: false,
  },
  {
    id: '2',
    title: 'Time almost up',
    message: 'Your parking session ends in 15 minutes. Consider extending.',
    time: '1 hour ago',
    type: 'warning',
    read: false,
  },
  {
    id: '3',
    title: 'Payment successful',
    message: 'Your payment of $12.50 for Harbor View Parking was successful.',
    time: '3 hours ago',
    type: 'payment',
    read: true,
  },
];

export default function NotificationsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState(initialNotifications);
  const [refreshing, setRefreshing] = useState(false);

  const getIconForType = (type: string) => {
    switch (type) {
      case 'info': return <Bell size={24} color={Colors.primary[500]} />;
      case 'warning': return <AlertTriangle size={24} color={Colors.warning[500]} />;
      case 'payment': return <Wallet size={24} color={Colors.secondary[500]} />;
      case 'reminder': return <Clock size={24} color={Colors.accent[500]} />;
      default: return <Bell size={24} color={Colors.primary[500]} />;
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      Toast.show({
        type: 'success',
        text1: 'Refreshed!',
        text2: 'Notifications updated.',
      });
      setRefreshing(false);
    }, 1500);
  };

  const renderNotification = ({ item }: { item: Notification }) => (
    <TouchableOpacity style={[styles.notificationItem, !item.read && { backgroundColor: Colors.primary[50] }]}>
      <View style={styles.iconContainer}>{getIconForType(item.type)}</View>
      <View style={styles.notificationContent}>
        <Text style={styles.notificationTitle}>{item.title}</Text>
        <Text style={styles.notificationMessage}>{item.message}</Text>
        <Text style={styles.notificationTime}>{item.time}</Text>
      </View>
      {!item.read && <View style={styles.unreadIndicator} />}
    </TouchableOpacity>
  );

  return (
    <Container style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <TouchableOpacity onPress={() => {
          const updated = notifications.map(n => ({ ...n, read: true }));
          setNotifications(updated);
          Toast.show({
            type: 'info',
            text1: 'All notifications marked as read',
          });
        }}>
          <Text style={styles.markAllRead}>Mark all as read</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary[500]]} />
        }
      />
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  headerTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 20,
    color: Colors.text.primary,
  },
  markAllRead: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: Colors.primary[500],
  },
  listContainer: {
    padding: 16,
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: Colors.background.primary,
    shadowColor: Colors.neutral[900],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
    position: 'relative',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  notificationMessage: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 8,
  },
  notificationTime: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: Colors.text.tertiary,
  },
  unreadIndicator: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary[500],
  },
});
