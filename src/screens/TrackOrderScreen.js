import { StyleSheet, Text, View, TouchableOpacity, FlatList } from 'react-native';
import React, { useState } from 'react';
import Header from '../components/Header';
import { spacing } from '../constants/dimensions';
import { Colors } from '../constants/colors';
import OrderList from '../components/OrderList';
import Separator from '../components/Separator';
import OrderDetails from '../components/OrderDetail';
import OrderStatus from '../components/OrderStatus';
import { useRoute } from '@react-navigation/native';

const statuses = [
  {
    title: 'Order Placed',
    time: '23 Aug 2023, 04:25 PM',
    completed: true,
    icon: 'receipt',
  },
  {
    title: 'In Progress',
    time: '23 Aug 2023, 03:54 PM',
    completed: true,
    icon: 'inventory',
  },
  {
    title: 'Shipped',
    time: 'Expected 02 Sep 2023',
    completed: false,
    icon: 'local-shipping',
  },
  {
    title: 'Delivered',
    time: '23 Aug 2023, 2023',
    completed: false,
    icon: 'inventory',
  },
];

const TrackOrderScreen = ({ navigation }) => {
  const route = useRoute();
  const { order } = route.params;

  console.log("Received Order:", order);

  const [showAllProducts, setShowAllProducts] = useState(false);

  // Chỉ hiển thị một sản phẩm nếu `showAllProducts` là false
  const displayedProducts = showAllProducts ? order.products : [order.products[0]];

  return (
    <View style={styles.container}>
      <Header
        title="Track Order"
        onBackPress={() => navigation.goBack()}
      />

      <FlatList
        data={displayedProducts}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <OrderList
            orderList={[{
              id: item.productId,
              productImage: item.productImage,
              productName: item.productName,
              size: item.size,
              quantity: item.quantity,
              price: item.price,
              buttonText: '',
            }]}
            
          />
        )}
        ListFooterComponent={() => (
          <>
            {order.products.length > 1 && (
              <TouchableOpacity onPress={() => setShowAllProducts(!showAllProducts)} style={styles.showMoreButton}>
                <Text style={styles.showMoreText}>
                  {showAllProducts ? 'Show Less' : 'Show More'}
                </Text>
              </TouchableOpacity>
            )}
            <Separator style={styles.separator} />
            <OrderDetails
              deliveryDate="03 Sep 2023"
              trackingId="TRK452126542"
            />
            <Separator style={styles.separator} />
            <OrderStatus statuses={statuses} />
          </>
        )}
      />
    </View>
  );
};

export default TrackOrderScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.sm,
    backgroundColor: Colors.White,
  },
  separator: {
    marginTop: spacing.md,
  },
  showMoreButton: {
    paddingVertical: spacing.xs,
    alignItems: 'center',
  },
  showMoreText: {
    color: Colors.Brown,
    fontWeight: 'bold',
  },
});
