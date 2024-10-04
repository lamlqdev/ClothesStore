import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const OrderStatus = ({ statuses }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Order Status</Text>

      <View style={styles.statusContainer}>
        {statuses.map((status, index) => (
          <View key={index} style={styles.statusRow}>
            <View style={styles.iconContainer}>
              <View style={status.completed ? styles.completedCircle : styles.pendingCircle}>
                {status.completed && <Icon name="check" size={16} color="#fff" />}
              </View>
              {index < statuses.length - 1 && <View style={styles.verticalLine} />}
            </View>
            <View style={styles.details}>
              <Text style={styles.statusTitle}>{status.title}</Text>
              <Text style={styles.statusTime}>{status.time}</Text>
            </View>
            <Icon name={status.icon} size={24} color="#a52a2a" />
          </View>
        ))}
      </View>
    </View>
  );
};

export default OrderStatus;

const styles = StyleSheet.create({
  container: {
    margin: 16,
  },
  header: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  statusContainer: {
    marginTop: 8,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  iconContainer: {
    alignItems: 'center',
    marginRight: 16,
  },
  completedCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#6e3b3b', // Màu nâu cho trạng thái hoàn thành
    justifyContent: 'center',
    alignItems: 'center',
  },
  pendingCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#d3d3d3', 
  },
  verticalLine: {
    width: 2,
    height: 40,
    backgroundColor: '#d3d3d3', // Đường dọc
  },
  details: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  statusTime: {
    fontSize: 12,
    color: '#6e6e6e',
  },
});