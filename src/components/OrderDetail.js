import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Fonts } from '../constants/fonts';
import { Colors } from '../constants/colors';

const OrderDetails = ({ deliveryDate, trackingId }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Order Details</Text>
      
      <View style={styles.detailRow}>
        <Text style={styles.label}>Expected Delivery Date</Text>
        <Text style={styles.value}>{deliveryDate}</Text>
      </View>
      
      <View style={styles.detailRow}>
        <Text style={styles.label}>Tracking ID</Text>
        <Text style={styles.value}>{trackingId}</Text>
      </View>
    </View>
  );
};

export default OrderDetails;

const styles = StyleSheet.create({
  container: {
    margin: 16,
  },
  headerText: {
    fontSize: 16,
    fontFamily: Fonts.interBold,
    color: Colors.Black,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  label: {
    fontSize: 14,
    fontFamily: Fonts.interRegular,
    color: '#6e6e6e',
  },
  value: {
    fontSize: 14,
    fontFamily: Fonts.interBold,
    fontWeight: '600',
    color: '#000', 
  },
});
