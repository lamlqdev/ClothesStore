import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import Header from '../components/Header';  // Sử dụng component Header

const notifications = [
  {
    id: '1',
    title: 'Order Shipped',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    time: '1h',
    icon: 'truck',
    date: 'Today',
  },
  {
    id: '2',
    title: 'Flash Sale Alert',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    time: '1h',
    icon: 'bolt',
    date: 'Today',
  },
  {
    id: '3',
    title: 'Product Review Request',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    time: '1h',
    icon: 'star',
    date: 'Today',
  },
  {
    id: '4',
    title: 'Order Shipped',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    time: '1d',
    icon: 'truck',
    date: 'Yesterday',
  },
  {
    id: '5',
    title: 'New Paypal Added',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    time: '1d',
    icon: 'paypal',
    date: 'Yesterday',
  },
];

const NotificationScreen = ({ navigation }) => {
  const todayNotifications = notifications.filter(n => n.date === 'Today');
  const yesterdayNotifications = notifications.filter(n => n.date === 'Yesterday');

  const renderNotification = ({ item }) => (
    <View style={styles.notificationItem}>
      <View style={styles.iconContainer}>
        <Icon name={item.icon} size={24} color="#7B3E19" />
      </View>
      <View style={styles.notificationTextContainer}>
        <Text style={styles.notificationTitle}>{item.title}</Text>
        <Text style={styles.notificationDescription}>{item.description}</Text>
        <Text style={styles.notificationTime}>{item.time}</Text>
      </View>
    </View>
  );

  const renderSectionHeader = (date) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionHeaderText}>{date}</Text>
      <TouchableOpacity>
        <Text style={styles.markAllAsRead}>Mark all as read</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header với title Notification */}
      <Header
        title="Notification"
        onBackPress={() => navigation.goBack()}
      />
      <View style={styles.newNotificationBadge}>
        <Text style={styles.newNotificationText}>2 NEW</Text>
      </View>

      <FlatList
        ListHeaderComponent={
          <>
            {/* Header cho Today */}
            {renderSectionHeader('Today')}
            <FlatList
              data={todayNotifications}
              keyExtractor={(item) => item.id}
              renderItem={renderNotification}
            />
            {/* Header cho Yesterday */}
            {renderSectionHeader('Yesterday')}
            <FlatList
              data={yesterdayNotifications}
              keyExtractor={(item) => item.id}
              renderItem={renderNotification}
            />
          </>
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.notificationList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  newNotificationBadge: {
    backgroundColor: '#7B3E19',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: 'flex-end',
    margin: 16,
  },
  newNotificationText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  sectionHeaderText: {
    fontWeight: 'bold',
    color: '#333',
    fontSize: 16,
  },
  markAllAsRead: {
    color: '#7B3E19',
    fontWeight: '500',
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  iconContainer: {
    marginRight: 16,
    justifyContent: 'center',
  },
  notificationTextContainer: {
    flex: 1,
  },
  notificationTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
  },
  notificationDescription: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
    color: '#888',
  },
  notificationList: {
    paddingBottom: 20,
  },
});

export default NotificationScreen;
